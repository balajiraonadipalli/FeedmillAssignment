class KPICalculator {
  // Production vs Plan
  static calculateProductionVsPlan(batches, startDate, endDate) {
    const filtered = batches.filter(b => {
      const batchDate = new Date(b.start_time);
      return batchDate >= startDate && batchDate <= endDate;
    });

    const actual = filtered.reduce((sum, b) => sum + (b.actual_mass_t || 0), 0);
    const planned = filtered.reduce((sum, b) => sum + (b.planned_mass_t || 0), 0);
    const attainment = planned > 0 ? (actual / planned) * 100 : 0;

    return {
      actual,
      planned,
      attainment: Math.round(attainment * 100) / 100
    };
  }

  // SEC (kWh/t)
  static calculateSEC(energyData, productionTons) {
    const totalKWh = energyData
      .filter(e => e.meter_id === 'EM-MAIN')
      .reduce((sum, e) => sum + (e.kWh || 0), 0);
    
    return productionTons > 0 ? totalKWh / productionTons : 0;
  }

  // Steam per ton
  static calculateSteamPerTon(processSignals, productionTons, startDate, endDate) {
    const steamFlow = processSignals.filter(s => 
      s.signal_name === 'steam_flow_kgph' &&
      new Date(s.timestamp) >= startDate &&
      new Date(s.timestamp) <= endDate
    );

    // Integrate over 5-min intervals
    let totalSteam = 0;
    for (let i = 0; i < steamFlow.length - 1; i++) {
      const current = steamFlow[i];
      const next = steamFlow[i + 1];
      const intervalHours = (new Date(next.timestamp) - new Date(current.timestamp)) / (1000 * 60 * 60);
      const avgFlow = (current.value + next.value) / 2;
      totalSteam += avgFlow * intervalHours;
    }

    return productionTons > 0 ? totalSteam / productionTons : 0;
  }

  // Availability
  static calculateAvailability(lineStates, startDate, endDate) {
    const filtered = lineStates.filter(s => {
      const stateDate = new Date(s.timestamp);
      return stateDate >= startDate && stateDate <= endDate;
    });

    const runCount = filtered.filter(s => s.state === 'RUN').length;
    const totalCount = filtered.length;

    return totalCount > 0 ? (runCount / totalCount) * 100 : 0;
  }

  // FPY (First Pass Yield)
  static calculateFPY(qualityResults) {
    const pass = qualityResults.filter(q => q.result === 'PASS').length;
    const hold = qualityResults.filter(q => q.result === 'HOLD').length;
    const total = pass + hold;

    return total > 0 ? (pass / total) * 100 : 0;
  }

  // Recipe Adherence
  static calculateRecipeAdherence(weighments, tolerance = { macro: 2, micro: 5 }) {
    if (!weighments || weighments.length === 0) return { adherence: 0, total: 0, within: 0 };

    let withinTolerance = 0;
    weighments.forEach(w => {
      const target = w.target_kg || 0;
      const actual = w.actual_kg || 0;
      const diff = Math.abs(actual - target);
      const percentDiff = target > 0 ? (diff / target) * 100 : 0;
      
      const isMacro = w.ingredient_type === 'macro';
      const threshold = isMacro ? tolerance.macro : tolerance.micro;
      
      if (percentDiff <= threshold) {
        withinTolerance++;
      }
    });

    return {
      adherence: weighments.length > 0 ? (withinTolerance / weighments.length) * 100 : 0,
      total: weighments.length,
      within: withinTolerance
    };
  }

  // Days of Cover (DOC)
  static calculateDOC(siloLevel, avgConsumption) {
    return avgConsumption > 0 ? siloLevel / avgConsumption : 0;
  }

  // Downtime percentage
  static calculateDowntimePercentage(downtimeEvents, totalMinutes) {
    const totalDowntime = downtimeEvents.reduce((sum, d) => sum + (d.duration_minutes || 0), 0);
    return totalMinutes > 0 ? (totalDowntime / totalMinutes) * 100 : 0;
  }

  // Get time range boundaries
  static getTimeRange(range, referenceDate = new Date()) {
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case 'today':
        return {
          start: new Date(today),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'wtd': // Week to date
        const wtdStart = new Date(today);
        wtdStart.setDate(wtdStart.getDate() - wtdStart.getDay()); // Start of week (Sunday)
        return {
          start: wtdStart,
          end: new Date(referenceDate)
        };
      case 'mtd': // Month to date
        const mtdStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: mtdStart,
          end: new Date(referenceDate)
        };
      default:
        return {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(referenceDate)
        };
    }
  }
}

module.exports = KPICalculator;

