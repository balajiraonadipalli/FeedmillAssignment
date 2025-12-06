# Feedmill Industrial Dashboard

A full-stack industrial dashboard for a 5 t/h pelleted feed mill, providing real-time operational insights with a 3D plant visualization.

## Features

- **Real-time KPI Dashboard**: Production, Energy, Steam, Availability, Quality, Recipe Adherence, Silos, Reliability, and Packaging metrics
- **3D Plant Monitor**: Interactive 3D visualization of key equipment with KPI overlays
- **Time-based Filtering**: Today, Yesterday, WTD (Week to Date), MTD (Month to Date)
- **Product & Line Filtering**: Filter data by product and production line
- **Drill-down Capabilities**: Click on KPIs to view detailed information
- **Data Import**: Upload XLSX or CSV files to populate the database

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI) for UI components
- React Three Fiber for 3D visualization
- Recharts for data visualization
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- XLSX and CSV parsing for data import

## Project Structure

```
assignmentGraph/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (KPI calculations, data parsing)
│   ├── uploads/         # Temporary file storage
│   ├── server.js        # Express server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── tiles/   # KPI tile components
│   │   │   └── Plant3DView.js
│   │   ├── context/     # React context (filters)
│   │   ├── services/    # API service layer
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feedmill
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
# On Windows (if MongoDB is installed as a service, it should start automatically)
# On Linux/Mac:
mongod
```

6. Start the backend server:
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` if your backend is running on a different URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Data Import

### Upload XLSX File

1. Ensure the backend server is running
2. Use the upload endpoint to import data:
   - POST to `http://localhost:5000/api/upload/xlsx`
   - Include the XLSX file in the request (form-data with key `file`)

### Upload CSV Files

1. Ensure the backend server is running
2. Use the upload endpoint to import CSV files:
   - POST to `http://localhost:5000/api/upload/csv`
   - Include multiple CSV files in the request (form-data with key `files`)

### Expected Data Sheets/Tables

The system expects the following data structures:

- **products**: Product information
- **batches**: Production batch data
- **energy_meters_15min**: Energy consumption data (15-minute intervals)
- **process_signals_5min**: Process signals (5-minute intervals)
- **silo_levels_15min**: Silo level data (15-minute intervals)
- **quality_results**: Quality test results
- **downtime_events**: Equipment downtime events
- **bagging**: Packaging data (optional)
- **shipments**: Dispatch data (optional)

## API Endpoints

### KPI Endpoints

- `GET /api/kpis/production` - Production KPIs
- `GET /api/kpis/production-vs-plan` - Production vs Plan comparison
- `GET /api/kpis/energy` - Energy consumption KPIs
- `GET /api/kpis/energy/sec` - Specific Energy Consumption (SEC)
- `GET /api/kpis/steam` - Steam and conditioning KPIs
- `GET /api/kpis/availability` - Equipment availability
- `GET /api/kpis/quality` - Quality KPIs (FPY)
- `GET /api/kpis/quality/hold-samples` - HOLD quality samples
- `GET /api/kpis/recipe` - Recipe adherence
- `GET /api/kpis/silos` - Silo levels and DOC
- `GET /api/kpis/silos/events` - Silo events
- `GET /api/kpis/reliability` - Reliability KPIs
- `GET /api/kpis/reliability/downtime` - Downtime Pareto analysis
- `GET /api/kpis/packaging` - Packaging KPIs
- `GET /api/kpis/dispatch` - Dispatch KPIs

### Data Endpoints

- `GET /api/data/products` - List all products
- `GET /api/data/lines` - List all production lines

### Upload Endpoints

- `POST /api/upload/xlsx` - Upload XLSX file
- `POST /api/upload/csv` - Upload CSV files

### Query Parameters

Most KPI endpoints support the following query parameters:
- `timeRange`: `today`, `yesterday`, `wtd`, `mtd`
- `product`: Product ID filter
- `line`: Production line filter

## 3D Plant View

The 3D plant view displays key equipment:

- **Raw Material Silos**: Shows material levels and Days of Cover (DOC)
- **Grinder/Mixer**: Displays batch count
- **Conditioner**: Shows steam stability and steam per ton
- **Pellet Mill**: Displays production rate
- **Cooler**: Equipment status
- **Bagging Line**: Packaging information
- **Bulk Loading/Dispatch**: Dispatch status
- **Utilities**: Energy consumption (SEC, total kWh, power factor)

Click on any equipment in the 3D view to see detailed KPIs in a popup dialog.

## KPI Calculations

### Production vs Plan
- **Actual**: Sum of `actual_mass_t` from batches
- **Planned**: Sum of `planned_mass_t` from batches
- **Attainment**: (Actual / Planned) × 100%

### SEC (Specific Energy Consumption)
- **SEC**: Total kWh (from EM-MAIN meter) / Production tons

### Steam per Ton
- Integrates `steam_flow_kgph` over 5-minute intervals
- Calculates total steam used / production tons

### Availability
- Calculated from batch runtime vs total time
- Percentage of time equipment is running

### FPY (First Pass Yield)
- **FPY**: (PASS samples / (PASS + HOLD samples)) × 100%

### Recipe Adherence
- Percentage of weighments within tolerance
- Macro ingredients: ±2%
- Micro ingredients: ±5%

### Days of Cover (DOC)
- Current silo level / average daily consumption

### Downtime Percentage
- Total downtime minutes / total time × 100%

## Development

### Backend Development

- Uses nodemon for auto-reload during development
- Run `npm run dev` to start with auto-reload

### Frontend Development

- React development server with hot reload
- Run `npm start` to start the development server

## Production Build

### Frontend Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

### Backend Production

For production, use a process manager like PM2:

```bash
npm install -g pm2
pm2 start backend/server.js --name feedmill-api
```

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify network connectivity

### CORS Issues

- The backend has CORS enabled for all origins in development
- For production, configure CORS appropriately

### 3D View Not Loading

- Ensure all dependencies are installed (`@react-three/fiber`, `@react-three/drei`, `three`)
- Check browser console for errors
- Verify WebGL support in your browser

## Notes

- The system is designed to work with the provided mock dataset structure
- Some features (like bagging and shipments) may require additional data import
- The 3D view uses simplified geometric shapes for performance
- All KPI calculations are performed server-side for accuracy

## License

ISC

## Author

Feedmill Dashboard Development Team

