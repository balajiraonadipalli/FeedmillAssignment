# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- Node.js (v14+) installed
- MongoDB installed and running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGODB_URI=mongodb://localhost:27017/feedmill" >> .env
echo "NODE_ENV=development" >> .env

# Start MongoDB (if not running as service)
# Windows: MongoDB should start automatically if installed as service
# Linux/Mac: mongod

# Start the server
npm start
# Or for development: npm run dev
```

Backend will be available at: `http://localhost:5000`

### 2. Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start the development server
npm start
```

Frontend will open automatically at: `http://localhost:3000`

### 3. Import Data

Once both servers are running:

#### Option A: Using cURL (XLSX)

```bash
curl -X POST http://localhost:5000/api/upload/xlsx \
  -F "file=@path/to/your/feedmill_5tph_mock_2025-10-01_to_10-07.xlsx"
```

#### Option B: Using Postman or similar tool

1. POST to `http://localhost:5000/api/upload/xlsx`
2. Body type: form-data
3. Key: `file` (type: File)
4. Select your XLSX file
5. Send request

#### Option C: Using the browser console

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
fetch('http://localhost:5000/api/upload/xlsx', {
  method: 'POST',
  body: formData
});
```

### 4. Verify Installation

1. Open `http://localhost:3000` in your browser
2. You should see:
   - Filter bar at the top
   - 3D Plant View
   - KPI tiles below

3. Check backend health:
   - Visit `http://localhost:5000/api/health`
   - Should return: `{"status":"OK","message":"Feedmill API is running"}`

## Troubleshooting

### MongoDB Connection Error

**Error**: `MongoDB connection error`

**Solution**:
- Ensure MongoDB is running: `mongod` or check Windows services
- Verify connection string in `backend/.env`
- Check MongoDB is listening on default port 27017

### CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in `frontend/.env` matches backend URL

### 3D View Not Loading

**Error**: Blank 3D canvas or WebGL errors

**Solution**:
- Check browser console for errors
- Ensure WebGL is enabled in browser
- Try a different browser (Chrome/Firefox recommended)
- Verify all dependencies installed: `npm install` in frontend

### No Data Showing

**Error**: All KPIs show 0 or "No data"

**Solution**:
- Verify data was imported successfully
- Check MongoDB collections: `use feedmill; show collections;`
- Verify data exists: `db.batches.count()`
- Re-import data if needed

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
- Change PORT in `backend/.env` to another port (e.g., 5001)
- Update `REACT_APP_API_URL` in `frontend/.env` accordingly
- Or kill the process using the port

## Next Steps

1. **Explore the Dashboard**: Use filters to see different time ranges and products
2. **Interact with 3D View**: Click on equipment to see detailed KPIs
3. **View Drill-downs**: Click on Quality tile to see HOLD samples
4. **Upload More Data**: Import additional datasets to see trends

## Development Tips

- Backend auto-reloads with `npm run dev` (requires nodemon)
- Frontend hot-reloads automatically with `npm start`
- Check browser console and terminal for errors
- Use MongoDB Compass to inspect database directly

## Production Build

To create a production build:

```bash
# Frontend
cd frontend
npm run build

# The build folder contains optimized production files
# Serve with: npx serve -s build
```

For backend production, use PM2:

```bash
npm install -g pm2
pm2 start backend/server.js --name feedmill-api
```

## Support

For issues or questions:
1. Check the main README.md for detailed documentation
2. Review error messages in browser console and terminal
3. Verify all environment variables are set correctly

