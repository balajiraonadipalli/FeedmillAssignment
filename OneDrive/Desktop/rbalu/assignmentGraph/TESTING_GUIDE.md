# Testing Guide for Feedmill Dashboard

## Prerequisites Check

### 1. Verify Servers are Running

**Backend Server:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","message":"Feedmill API is running"}
```

**Frontend Server:**
- Open browser and go to: `http://localhost:3000`
- You should see the dashboard loading

### 2. Start Servers (if not running)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## Step-by-Step Testing

### Test 1: Frontend Loading

1. Open browser: `http://localhost:3000`
2. **Expected Result:**
   - Dark theme dashboard loads
   - Filter bar appears at the top
   - 3D Plant View is visible
   - KPI tiles are displayed below

**If you see errors:**
- Check browser console (F12 → Console tab)
- Check terminal for compilation errors

---

### Test 2: Filter Bar Functionality

1. **Time Range Filter:**
   - Click "Time Range" dropdown
   - Select: Today, Yesterday, WTD, MTD
   - **Expected:** All KPI tiles update based on selected time range

2. **Product Filter:**
   - Click "Product" dropdown
   - Select a product (if data is imported)
   - **Expected:** KPI tiles filter by selected product

3. **Line Filter:**
   - Click "Line" dropdown
   - Select a production line
   - **Expected:** KPI tiles filter by selected line

---

### Test 3: 3D Plant View

1. **View the 3D Scene:**
   - You should see equipment blocks in 3D
   - Silos (tall cylinders) on the left
   - Equipment blocks in the center
   - Utilities on the right

2. **Interact with 3D View:**
   - **Rotate:** Click and drag
   - **Zoom:** Scroll mouse wheel
   - **Pan:** Right-click and drag (or middle mouse button)

3. **Click on Equipment:**
   - Click on any equipment block (e.g., "Utilities", "Pellet Mill", "Silo 1")
   - **Expected Result:**
     - Dialog appears with equipment details
     - Dialog shows above the 3D scene (not behind it)
     - 3D scene dims in the background
     - Dialog displays KPI metrics in cards
     - Icons appear for different metric types
     - Color-coded status chips (Good/Fair/Poor)

4. **Close Dialog:**
   - Click "Close" button or X icon
   - **Expected:** Dialog closes, 3D scene returns to normal

---

### Test 4: KPI Tiles

Check each tile for proper display:

1. **Production vs Plan:**
   - Shows actual vs planned production
   - Bar chart by product
   - Attainment percentage

2. **Energy:**
   - SEC (kWh/t) value
   - Power Factor chip
   - Demand trend line chart

3. **Steam & Conditioning:**
   - Steam per ton value
   - Conditioner stability percentage

4. **Availability:**
   - Circular progress gauge
   - Run minutes vs total minutes

5. **Quality (FPY):**
   - Circular progress gauge
   - PASS/HOLD counts
   - **Click on tile** → Should open dialog with HOLD samples table

6. **Recipe Adherence:**
   - Percentage within tolerance
   - Progress bar

7. **Material Coverage (Silos):**
   - List of silos with levels
   - DOC (Days of Cover) chips
   - Utilization progress bars

8. **Reliability:**
   - Downtime percentage
   - Pareto chart by equipment

9. **Packaging & Dispatch:**
   - Bag count
   - Rework percentage
   - Truck turnaround time

---

### Test 5: Backend API Endpoints

Test using browser or Postman:

1. **Health Check:**
   ```
   GET http://localhost:5000/api/health
   ```
   Expected: `{"status":"OK","message":"Feedmill API is running"}`

2. **Production KPIs:**
   ```
   GET http://localhost:5000/api/kpis/production?timeRange=wtd
   ```
   Expected: JSON with production data

3. **Energy KPIs:**
   ```
   GET http://localhost:5000/api/kpis/energy?timeRange=wtd
   ```
   Expected: JSON with energy metrics

4. **Silo KPIs:**
   ```
   GET http://localhost:5000/api/kpis/silos
   ```
   Expected: Array of silo data

5. **Products:**
   ```
   GET http://localhost:5000/api/data/products
   ```
   Expected: Array of products

6. **Lines:**
   ```
   GET http://localhost:5000/api/data/lines
   ```
   Expected: Array of production lines

---

### Test 6: Data Import (Optional)

If you have the XLSX/CSV data file:

1. **Using cURL (PowerShell):**
   ```powershell
   curl -X POST http://localhost:5000/api/upload/xlsx `
     -F "file=@path/to/your/feedmill_5tph_mock_2025-10-01_to_10-07.xlsx"
   ```

2. **Using Postman:**
   - Method: POST
   - URL: `http://localhost:5000/api/upload/xlsx`
   - Body: form-data
   - Key: `file` (type: File)
   - Select your XLSX file
   - Send

3. **Expected Result:**
   ```json
   {
     "message": "Data imported successfully",
     "results": {
       "products": 10,
       "batches": 150,
       "energy": 200,
       ...
     }
   }
   ```

4. **After Import:**
   - Refresh the frontend
   - KPI tiles should show actual data
   - 3D view should display real silo levels

---

### Test 7: Error Handling

1. **Test with No Data:**
   - If no data is imported, tiles should show:
     - Loading state initially
     - Then show 0 or "No data" messages
     - No errors in console

2. **Test API Errors:**
   - Stop backend server
   - Frontend should handle errors gracefully
   - Check browser console for error messages

3. **Test Invalid Filters:**
   - Select filters that return no data
   - Should show empty states, not errors

---

## Quick Visual Checklist

- [ ] Dashboard loads without errors
- [ ] Filter bar is visible and functional
- [ ] 3D Plant View renders correctly
- [ ] Can rotate/zoom/pan 3D view
- [ ] Clicking equipment opens dialog
- [ ] Dialog appears above 3D scene (not behind)
- [ ] Dialog shows formatted metrics with icons
- [ ] Can close dialog
- [ ] All 9 KPI tiles display
- [ ] KPI tiles update when filters change
- [ ] Quality tile opens HOLD samples on click
- [ ] No console errors in browser
- [ ] Backend API responds to requests

---

## Common Issues & Solutions

### Issue: "Cannot GET /"
- **Solution:** Make sure backend is running on port 5000

### Issue: "Network Error" in frontend
- **Solution:** Check backend is running and CORS is enabled

### Issue: 3D view not loading
- **Solution:** Check browser console for WebGL errors
- Try different browser (Chrome/Firefox recommended)

### Issue: Dialog appears behind 3D elements
- **Solution:** This should be fixed now. If still happening, clear browser cache

### Issue: No data showing
- **Solution:** Import data using upload endpoint
- Or check MongoDB has data: `db.batches.count()`

### Issue: KPI tiles show "NaN" or "undefined"
- **Solution:** Check backend API responses
- Verify data format matches expected structure

---

## Performance Testing

1. **Load Time:**
   - Dashboard should load in < 3 seconds
   - 3D view should render in < 5 seconds

2. **Filter Response:**
   - Changing filters should update tiles in < 1 second

3. **Dialog Opening:**
   - Clicking equipment should open dialog instantly

---

## Browser Compatibility

Tested browsers:
- Chrome (recommended)
- Firefox
- Edge
- Safari (may have WebGL issues)

---

## Next Steps After Testing

1. If all tests pass → System is working correctly!
2. If issues found → Check browser console and terminal logs
3. Import real data to see full functionality
4. Test with different time ranges and filters

---

## Need Help?

- Check browser console (F12) for errors
- Check terminal for server errors
- Verify MongoDB is running
- Ensure all dependencies are installed

