# Data Testing Guide

## Quick Start: Generate Test Data

The easiest way to test the application is to use the built-in test data generator.

### Option 1: Generate Test Data (Recommended)

1. **Make sure MongoDB is running:**
   ```bash
   # Check if MongoDB service is running (Windows)
   Get-Service MongoDB
   ```

2. **Run the test data generator:**
   ```bash
   cd backend
   npm run seed
   ```

3. **Wait for completion:**
   - The script will generate 7 days of sample data
   - Includes all required data types
   - Automatically clears old data first

4. **Refresh your frontend:**
   - Go to `http://localhost:3000`
   - All KPI tiles should now show data
   - 3D view should display silo levels

### What Data Gets Generated?

The script creates:
- **3 Products** (Chicken Feed, Cattle Feed, Fish Feed)
- **50 Batches** (last 7 days)
- **Energy data** (15-min intervals)
- **Process signals** (5-min intervals: steam flow, conditioner temp)
- **4 Silos** (Corn, Soybean, Wheat, Premix) with daily levels
- **Quality results** (PASS/HOLD for each batch)
- **Downtime events** (10 events)
- **Bagging records** (30 records)
- **Shipments** (20 truck shipments)
- **Weighments** (recipe adherence data)
- **Line states** (5-min intervals)
- **Silo events** (LOW_LEVEL, CHANGEOVER)

---

## Option 2: Use Your Own XLSX/CSV Data

If you have the original mock dataset file:

### File Name Expected:
- `feedmill_5tph_mock_2025-10-01_to_10-07.xlsx` (XLSX format)
- OR CSV bundle with separate files

### Upload via API:

**Using PowerShell:**
```powershell
# Navigate to folder with your XLSX file
cd "path\to\your\data\folder"

# Upload XLSX file
curl -X POST http://localhost:5000/api/upload/xlsx `
  -F "file=@feedmill_5tph_mock_2025-10-01_to_10-07.xlsx"
```

**Using Postman:**
1. Open Postman
2. Method: `POST`
3. URL: `http://localhost:5000/api/upload/xlsx`
4. Body → form-data
5. Key: `file` (type: File)
6. Select your XLSX file
7. Click Send

**Using Browser (if you add an upload UI):**
- You can add a file upload component to the frontend later

### Expected XLSX Sheet Names:
- `products`
- `batches`
- `energy_meters_15min`
- `process_signals_5min`
- `silo_levels_15min`
- `quality_results`
- `downtime_events`
- `bagging` (optional)
- `shipments` (optional)
- `batch_weighments` (optional)
- `silo_events` (optional)
- `line_states_5min` (optional)

---

## Option 3: Manual Data Entry (For Testing Specific Scenarios)

You can manually insert data using MongoDB Compass or mongo shell:

### Using MongoDB Compass:
1. Download MongoDB Compass
2. Connect to: `mongodb://localhost:27017/feedmill`
3. Navigate to collections
4. Insert documents manually

### Using mongo shell:
```bash
# Connect to MongoDB
mongo feedmill

# Insert a product
db.products.insertOne({
  product_id: "P001",
  product_name: "Test Product",
  product_code: "TP",
  line: "Line1",
  planned_daily_t: 25,
  category: "Test"
});

# Insert a batch
db.batches.insertOne({
  batch_id: "B0001",
  order_id: "O0001",
  product_id: "P001",
  line: "Line1",
  start_time: new Date(),
  end_time: new Date(Date.now() + 3600000),
  actual_mass_t: 3.5,
  planned_mass_t: 3.0,
  status: "COMPLETED"
});
```

---

## Verify Data Was Imported

### Check via API:
```powershell
# Check products
Invoke-WebRequest -Uri "http://localhost:5000/api/data/products" | Select-Object -ExpandProperty Content

# Check batches count
Invoke-WebRequest -Uri "http://localhost:5000/api/kpis/production?timeRange=wtd" | Select-Object -ExpandProperty Content
```

### Check via MongoDB:
```bash
mongo feedmill

# Count documents
db.products.count()
db.batches.count()
db.energy.count()
db.silos.count()
```

### Check in Frontend:
1. Open `http://localhost:3000`
2. KPI tiles should show numbers (not 0 or "No data")
3. 3D view should show silo levels
4. Filters should show products and lines in dropdowns

---

## Data Format Reference

### Products Schema:
```javascript
{
  product_id: String,
  product_name: String,
  product_code: String,
  line: String,
  planned_daily_t: Number,
  category: String
}
```

### Batches Schema:
```javascript
{
  batch_id: String,
  order_id: String,
  product_id: String,
  line: String,
  start_time: Date,
  end_time: Date,
  actual_mass_t: Number,
  planned_mass_t: Number,
  status: String
}
```

### Energy Schema:
```javascript
{
  timestamp: Date,
  meter_id: String, // e.g., "EM-MAIN"
  kWh: Number,
  kW: Number,
  power_factor: Number
}
```

### Process Signals Schema:
```javascript
{
  timestamp: Date,
  signal_name: String, // e.g., "steam_flow_kgph", "conditioner_sp", "conditioner_pv"
  value: Number,
  unit: String
}
```

### Silo Schema:
```javascript
{
  timestamp: Date,
  silo_id: String,
  material: String, // e.g., "Corn", "Soybean", "Wheat", "Premix"
  level_t: Number,
  capacity_t: Number
}
```

### Quality Schema:
```javascript
{
  batch_id: String,
  product_id: String,
  test_time: Date,
  result: String, // "PASS" or "HOLD"
  notes: String
}
```

### Downtime Schema:
```javascript
{
  start_time: Date,
  end_time: Date,
  equipment: String,
  reason: String,
  line: String,
  duration_minutes: Number
}
```

---

## Troubleshooting

### Issue: "No data" showing in tiles
**Solution:**
1. Run `npm run seed` in backend folder
2. Wait for completion
3. Refresh frontend

### Issue: Data not importing from XLSX
**Solution:**
1. Check file format (must be .xlsx, not .xls)
2. Verify sheet names match expected names
3. Check backend terminal for error messages
4. Verify MongoDB is running

### Issue: Wrong date format
**Solution:**
- Dates should be in ISO format or Excel serial numbers
- The parser handles common formats automatically

### Issue: Missing fields
**Solution:**
- Some fields are optional
- Check which fields are required vs optional in the models
- Missing optional fields will use defaults or null

---

## Next Steps After Data Import

1. Refresh frontend browser
2. Test filters (time range, product, line)
3. Click on equipment in 3D view
4. Check all KPI tiles show data
5. Test drill-downs (Quality tile → HOLD samples)

---

## Need More Data?

To generate more data or different scenarios, modify `backend/scripts/generateTestData.js`:
- Change date ranges
- Adjust quantities
- Modify values/ranges
- Add more products/equipment

Then run `npm run seed` again (it clears old data first).

