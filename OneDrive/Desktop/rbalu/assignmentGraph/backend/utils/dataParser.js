const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class DataParser {
  static parseXLSX(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheets = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    });
    
    return sheets;
  }

  static parseCSV(filePath) {
    const csv = require('csv-parser');
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  static convertDate(dateValue) {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    return null;
  }

  static convertNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }
}

module.exports = DataParser;

