# Sky Harbor Ride-Hailing Analytics Dashboard

A full-stack web application providing real-time operational intelligence for airport ride-hailing parking management. Features interactive vehicle animation, comprehensive analytics, and executive-grade visualizations.

![Dashboard Preview](assets/map.png)

## 🎯 Overview

This dashboard transforms raw parking occupancy data into actionable insights through an interactive, animated visualization system. It enables airport executives and operations staff to optimize parking efficiency, reduce passenger wait times, and make data-driven infrastructure decisions.

**Key Features:**
- 🚗 Real-time vehicle occupancy animation (60+ frames)
- 📊 Dynamic KPI dashboard with smart caching
- 📈 Comprehensive analytics charts (service mix, utilization, dwell time)
- 📋 Active vehicles table with entry times
- 🎨 Executive-grade design with Sky Harbor branding

## 🏗️ Architecture

### Technology Stack

**Backend:**
- FastAPI - Modern Python web framework
- Pandas - Data processing and analytics
- NumPy - Numerical computations
- Uvicorn - ASGI server

**Frontend:**
- React 18 - Component-based UI library
- Vite - Fast build tool and dev server
- Axios - HTTP client
- Recharts - Charting library

### Project Structure

```
mini-project-3-ken-valenzuela/
├── assets/                    # Source assets (map, car sprites, plates, data)
│   ├── map.png
│   ├── car_sprites/
│   ├── plates/
│   └── ride_hailing.xlsx
├── backend/                   # FastAPI backend
│   ├── app.py                # Main API server
│   └── requirements.txt      # Python dependencies
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── state/            # State management
│   │   ├── utils/            # Utility functions
│   │   └── api.js            # API client
│   ├── public/               # Static assets (copied from assets/)
│   └── package.json          # Node dependencies
├── CASE_STUDY.md             # Comprehensive case study
├── SLOT_MAPPING.md           # Slot numbering documentation
└── README.md                 # This file
```

## 🌐 Live Demo

**Live Application:**
- **Frontend**: https://frontend-ken-valenzuelas-projects.vercel.app
- **Backend API**: https://miniproject3-ljou.onrender.com
- **API Documentation**: https://miniproject3-ljou.onrender.com/docs

The application is fully deployed and ready to use!

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-project-3-ken-valenzuela
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Copy assets to public directory** (if not already done)
   ```bash
   # Assets should already be in frontend/public/
   # If not, copy from assets/ directory
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   uvicorn app:app --reload --port 8000
   ```

2. **Start the frontend dev server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

**Or use the live version:**
   - Frontend: https://frontend-ken-valenzuelas-projects.vercel.app
   - Backend API: https://miniproject3-ljou.onrender.com
   - API Docs: https://miniproject3-ljou.onrender.com/docs

## 📡 API Endpoints

**Live API Base URL**: https://miniproject3-ljou.onrender.com

The backend provides the following RESTful endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/timestamps` | GET | Returns all available timestamps |
| `/frame/{ts}` | GET | Returns slot states for a timestamp |
| `/stats/{ts}` | GET | Basic occupancy statistics |
| `/stats_timestamp/{ts}` | GET | Comprehensive timestamp statistics |
| `/utilization` | GET | Slot utilization across dataset |
| `/service_mix` | GET | Service provider distribution |
| `/dwell_time` | GET | Dwell time statistics |
| `/summary` | GET | Overall dataset summary |
| `/vehicles_at_timestamp/{ts}` | GET | Vehicle details at timestamp |
| `/occupancy_timeline` | GET | Occupancy count per timestamp |

See `CASE_STUDY.md` for detailed API documentation.

## 🎨 Features

### 1. Real-Time Vehicle Animation

- **60+ frames** of vehicle movement data
- **Smooth transitions** with CSS animations
- **6 vehicle types** (Audi, Car, Mini_truck, Mini_van, Taxi, Truck)
- **Playback controls** (play/pause, speed adjustment, scrubbing)
- **Hover tooltips** with vehicle details

### 2. Dynamic KPI Dashboard

- **4 key metrics** updating in real-time:
  - Avg Dwell Time
  - Max Dwell Time
  - Active Reservations
  - Avg Reservation Duration
- **Smart caching** - Shows peak values when parking lot is empty
- **Sky Harbor branding** - Orange, royal blue, and white color scheme

### 3. Analytics Charts

- **Service Share Over Time** - Stacked area chart showing Uber/Lyft distribution
- **Top 20 Slot Utilization** - Bar chart of most-used parking slots
- **Vehicle Dwell Time Distribution** - Histogram of parking durations

### 4. Active Vehicles Table

- Real-time list of all vehicles at current timestamp
- Shows: Vehicle sprite, license plate, service provider, entry time, current dwell time
- Updates automatically with animation

### 5. Live Slot Status Overlay

- Real-time counter in top-left of animation
- Shows: Occupied (green), Vacant (yellow), Total slots
- Multi-tier caching prevents "N/A" display

## 🔧 Development

### Backend Development

```bash
cd backend
uvicorn app:app --reload --port 8000
```

The backend:
- Loads data from `assets/ride_hailing.xlsx` at startup
- Precomputes timestamps, slot positions, utilization, service mix
- Serves JSON API endpoints
- Handles CORS for frontend communication

### Frontend Development

```bash
cd frontend
npm run dev
```

The frontend:
- Uses Vite for fast HMR (Hot Module Replacement)
- Proxy configured for API requests to `http://localhost:8000` (development)
- Production: Connects to https://miniproject3-ljou.onrender.com
- React Context for state management
- Component-based architecture

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
# No build step needed - just deploy app.py with dependencies
```

## 🧪 Key Technical Features

### State Management
- **React Context Provider** - Shared state across all components
- **Request Deduplication** - Prevents duplicate API calls
- **Smart Caching** - Peak values and last-known stats

### Performance Optimizations
- **Precomputed Data** - Backend precomputes at startup
- **Memoization** - React `useMemo` for expensive computations
- **CSS Transitions** - Hardware-accelerated animations
- **Frame Caching** - Reduces redundant data loading

### Slot ID Remapping
- Custom mapping system for intuitive 1-24 numbering
- Maintains data integrity (backend IDs unchanged)
- Natural reading pattern (left-to-right, top-to-bottom)

## 📊 Data Format

The application expects an Excel file (`ride_hailing.xlsx`) with the following columns:

- `current_time` - Timestamp (datetime)
- `slot_id` - Parking slot identifier
- `x`, `y` - Slot coordinates (pixels)
- `plate_number` - Vehicle license plate
- `service` - Service provider (Uber, Lyft)
- `reservation_id` - Reservation identifier (optional)
- `rider_id` - Rider identifier (optional)
- `driver_id` - Driver identifier (optional)

## 🎯 Use Cases

1. **Operational Monitoring**
   - Real-time parking slot occupancy
   - Vehicle movement tracking
   - Service provider distribution

2. **Analytics & Reporting**
   - Peak occupancy analysis
   - Dwell time patterns
   - Slot utilization trends

3. **Strategic Planning**
   - Capacity planning
   - Infrastructure optimization
   - Service provider negotiations

4. **Executive Dashboards**
   - High-level KPIs
   - Visual data presentation
   - Historical trend analysis

## 📚 Documentation

- **[CASE_STUDY.md](CASE_STUDY.md)** - Comprehensive case study with all features
- **[SLOT_MAPPING.md](SLOT_MAPPING.md)** - Slot numbering system documentation

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in uvicorn command
uvicorn app:app --reload --port 8001
```

**Missing dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Data file not found:**
- Ensure `assets/ride_hailing.xlsx` exists
- Check file path in `app.py` (line 18)

### Frontend Issues

**Module not found:**
```bash
cd frontend
rm -rf node_modules
npm install
```

**API connection errors:**
- Ensure backend is running on port 8000 (local) or use live API: https://miniproject3-ljou.onrender.com
- Check CORS settings in `backend/app.py`
- Verify proxy configuration in `frontend/vite.config.js` (development only)
- For production, ensure `VITE_API_BASE_URL` environment variable is set

**Assets not loading:**
- Ensure assets are in `frontend/public/` directory
- Check file paths in components (should start with `/`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of a mini-project assignment.

## 👥 Authors

- **Ken Valenzuela** - Initial development

## 🙏 Acknowledgments

- Sky Harbor Airport for the use case
- FastAPI and React communities for excellent documentation
- Recharts for beautiful chart components

---

## 📞 Support

For questions or issues, please open an issue in the repository.

---

## 🚀 Deployment

This application is deployed using:
- **Frontend**: Vercel (https://vercel.com) - React/Vite application
- **Backend**: Render (https://render.com) - FastAPI/Python application
- **Repository**: https://github.com/KenValenzuela/MiniProject3

Both services auto-deploy on every push to the `main` branch.

**Last Updated:** December 2024
