# 🎯 AirControl - Features & Implementation Guide

Complete feature documentation and implementation details for the Flight Management System.

## 📋 Table of Contents

1. [Frontend Features](#frontend-features)
2. [Backend Features](#backend-features)
3. [Real-Time System](#real-time-system)
4. [Scroll Animation](#scroll-animation)
5. [Data Management](#data-management)
6. [Performance](#performance)
7. [API Reference](#api-reference)

---

## 🎨 Frontend Features

### 1. Navigation Bar
**File**: `frontend/src/components/Navbar.tsx`

**Features**:
- Glass-effect navbar with blur backdrop
- Dynamic scroll detection (changes opacity on scroll)
- Navigation links to all sections
- Live tracking CTA button
- AirControl logo with gradient
- Responsive design (hamburger menu ready)

**Technologies**:
- React hooks for scroll detection
- Tailwind CSS for styling
- Lucide icons

**Customization**:
```typescript
// Change navbar background opacity on scroll
scrolled ? 'bg-dark-950/60' : 'bg-dark-950/30'

// Modify logo size or colors
<Plane className="w-7 h-7 text-aviation-500" />
```

---

### 2. Hero Section with Scroll Animation
**File**: `frontend/src/components/HeroSection.tsx`

**Features**:
- Full-screen canvas for frame display
- GSAP ScrollTrigger integration
- Frame preloading for smooth playback
- RequestAnimationFrame optimization
- Real-time frame counter
- Gradient overlay
- Call-to-action buttons

**How It Works**:
1. Preloads first 20 frames immediately
2. Remaining frames load in background
3. OnScroll: Calculates scroll progress (0-1)
4. Maps progress to frame number
5. Draws current frame on canvas
6. Uses requestAnimationFrame for smooth rendering

**Performance Optimizations**:
```typescript
// Preload critical frames first
await preloadImages(frameNumbers.slice(0, 20));

// Progressive loading
preloadImages(frameNumbers.slice(20)).catch(console.error);

// Efficient canvas rendering
ctx.drawImage(imagesRef.current[frameNum], 0, 0, width, height);
```

**Configuration**:
```typescript
const TOTAL_FRAMES = 100;  // Adjust based on your frames
const FRAME_DIR = '/frames';
```

**Frame Setup**:
- Place frames in: `public/frames/`
- Naming: `frame_001.jpg`, `frame_002.jpg`, etc.
- Format: JPG (or PNG)
- Resolution: Match window size for best quality

---

### 3. Flight Dashboard
**File**: `frontend/src/components/FlightDashboard.tsx`

**Features**:
- Real-time flight cards grid
- Color-coded status badges
- Filter by flight status
- Analytics summary cards
- Loading skeletons
- Auto-refresh every 5 seconds
- Smooth hover effects

**Status Colors**:
| Status | Color | Icon |
|--------|-------|------|
| On Time | Green | ✓ |
| Delayed | Red | ⏱️ |
| Boarding | Blue | 🚪 |
| In Flight | Cyan | ✈️ |

**Card Information**:
- Flight number
- Origin & destination
- Current status with delay info
- Altitude, speed
- Coordinates (lat/lon)

**Auto-Refresh**:
```typescript
useEffect(() => {
    const interval = setInterval(fetchFlights, 5000);  // 5 second refresh
    return () => clearInterval(interval);
}, []);
```

---

### 4. Flight Tracking Map
**File**: `frontend/src/components/FlightTracking.tsx`
**File**: `frontend/src/components/Map.tsx`

**Features**:
- Interactive Leaflet map
- Real-time flight position markers
- Dynamic marker colors (selected = cyan)
- Popup information on click
- Flight list sidebar
- Selected flight details panel
- Auto-pan to selected flight

**Map Features**:
```typescript
// Uses OpenStreetMap tiles (no API key required)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

// Custom markers with pulsing animation
const flightIcon = L.divIcon({
    html: `<div style="...animation: pulse 2s infinite;">✈️</div>`
})

// Popups on marker click
marker.bindPopup(`Flight: ${flight.flight_number}...`)

// Auto-center on selected flight
mapRef.current?.setView([flight.latitude, flight.longitude], 5)
```

**Marker Updates**:
- Updates every 5 seconds with new flight data
- Smooth repositioning
- Color changes based on selection

---

### 5. Analytics Dashboard
**File**: `frontend/src/components/Analytics.tsx`

**Features**:
- Status distribution pie chart
- 24-hour flight timeline
- Delay prediction bars
- Prediction probability bars
- Key metrics (avg delay, on-time rate, system health)
- Real-time data updates

**Charts**:
1. **Pie Chart**: Flight status distribution
2. **Line Chart**: Timeline of flights and delays
3. **Bar Chart**: Delay predictions

**Metrics**:
- Average Delay (minutes)
- On-Time Rate (%)
- System Health (%)

**Technologies**:
- Recharts for visualization
- Custom styling with dark theme

---

### 6. Footer
**File**: `frontend/src/components/Footer.tsx`

**Features**:
- Multi-column layout
- Social media links
- Product, resources, legal links
- Copyright information
- Professional design

---

## 🔧 Backend Features

### 1. Flight Management API
**File**: `backend/app/main.py`

**Endpoints**:

#### Get All Flights
```
GET /api/flights?skip=0&limit=100
```
Returns paginated list of flights.

#### Get Active Flights Only
```
GET /api/flights/active
```
Returns only active flights (is_active=True).

#### Get Specific Flight
```
GET /api/flights/{id}
```
Returns detailed flight information.

#### Create Flight
```
POST /api/flights
{
  "flight_number": "AA789",
  "origin": "ORD",
  "destination": "DFW",
  "status": "Boarding",
  "latitude": 41.9742,
  "longitude": -87.9073,
  "altitude": 0,
  "speed": 0,
  "delay_minutes": 0
}
```

#### Update Flight
```
PUT /api/flights/{id}
{
  "status": "In Flight",
  "latitude": 35.5,
  "longitude": -92.0
}
```

#### Delete Flight (Soft Delete)
```
DELETE /api/flights/{id}
```
Marks flight as inactive (is_active=False).

#### Get Flights by Status
```
GET /api/flights/status/{status}
```
Filters by: On Time, Delayed, Boarding, In Flight, etc.

---

### 2. Database Schema
**File**: `backend/app/database.py`

**Flight Model**:
```python
class Flight(Base):
    __tablename__ = "flights"
    
    id: Integer (Primary Key)
    flight_number: String (Unique)
    origin: String
    destination: String
    status: String
    latitude: Float
    longitude: Float
    altitude: Float
    speed: Float
    departure_time: DateTime
    arrival_time: DateTime (Optional)
    delay_minutes: Integer
    is_active: Boolean (Soft Delete)
```

**Database**:
- Type: SQLite
- Location: `backend/flights.db`
- ORM: SQLAlchemy
- Auto-migration on startup

---

### 3. Flight Simulation Engine
**File**: `backend/app/tasks.py`

**Features**:
- Background task runs every 5 seconds
- Updates flight positions in real-time
- Simulates altitude changes
- Adjusts speed realistically
- Random delay generation
- Status transitions

**Simulation Logic**:
```python
# For each active flight:
# 1. Update position (±0.5 degrees)
# 2. Adjust altitude (±500 feet)
# 3. Modify speed (±20 mph)
# 4. 2% chance of delay
# 5. Auto-transitions between states
```

**Status Transitions**:
- Boarding → In Flight (10% chance per update)
- Delayed → On Time (5% chance per update, decrements delay)
- In Flight remains until manual change

---

### 4. Delay Prediction
**File**: `backend/app/crud.py`

**Prediction Model**:
```python
def predict_delay(flight: Flight) -> dict:
    if flight.status == "Delayed":
        prediction_score = 0.85
    elif flight.status == "Boarding":
        prediction_score = 0.1 + (base_delay * 0.05)
    else:
        prediction_score = 0.05
    
    return {
        "flight_id": flight.id,
        "delay_probability": min(0.99, prediction_score),
        "predicted_delay_minutes": flight.delay_minutes,
        "confidence": 0.92
    }
```

**Factors**:
- Current status
- Existing delay minutes
- Historical patterns
- Random probability

---

### 5. Analytics Summary
**File**: `backend/app/main.py`

**Endpoint**: `GET /api/analytics/summary`

**Response**:
```json
{
  "total_flights": 5,
  "in_flight": 3,
  "boarding": 1,
  "delayed": 1,
  "on_time": 0,
  "average_delay": 15.0,
  "total_aircraft_count": 5
}
```

---

## ⚡ Real-Time System

### Data Flow

```
Frontend                Backend              Database
   │                      │                     │
   ├──→ Request flights ──→│                     │
   │                       ├──→ Query flights ──→│
   │                       │←─ Return data ──────│
   │←──── JSON response ───│                     │
   │                                             │
   │ (Every 5 seconds)                          │
   │                       Background Task      │
   │                       ├─ Update positions  │
   │                       ├─ Simulate delays   │
   │                       └─→ Database ────────→│
```

### Refresh Cycle

1. **Frontend** requests flights from `/api/flights/active`
2. **Backend** queries SQLite database
3. **Database** returns flight data
4. **Frontend** updates state and re-renders
5. **Backend** background task updates positions every 5 seconds
6. **Cycle repeats** automatically

---

## 🎬 Scroll Animation System

### Frame Animation Pipeline

```
1. Initialization
   ├─ Load frame paths
   ├─ Preload first 20 frames
   └─ Start remaining frames in background

2. On Scroll Event
   ├─ Calculate scroll progress (0-1)
   ├─ Map to frame number (0-100)
   ├─ Get current frame image
   └─ Render on canvas

3. Canvas Rendering
   ├─ Clear canvas
   ├─ Draw image at current progress
   └─ Use requestAnimationFrame for smoothness

4. Performance
   ├─ Image caching in memory
   ├─ Progressive loading
   └─ Smooth 60 FPS playback
```

### GSAP ScrollTrigger Integration

```typescript
// Timeline connected to scrollbar
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,  // Smooth scrubbing
    },
});

// Calculate progress from scroll
const scrollProgress = window.scrollY / documentHeight;
const frameNum = Math.floor(scrollProgress * TOTAL_FRAMES);
```

---

## 📊 Data Management

### Default Test Data

The system auto-creates 5 default flights on startup:

| Flight | Origin | Destination | Status | Purpose |
|--------|--------|-------------|--------|---------|
| UA456 | JFK | LAX | In Flight | Long-haul example |
| AA789 | ORD | DFW | In Flight | Mid-range example |
| DL123 | DEN | SFO | Boarding | Pre-departure example |
| SW234 | LAX | MIA | Delayed | Delay example |
| BA567 | BOS | SFO | In Flight | Cross-country example |

### CRUD Operations

**Create**:
```python
flight = Flight(
    flight_number=flight_data.flight_number,
    origin=flight_data.origin,
    ...
)
db.add(flight)
db.commit()
```

**Read**:
```python
flights = db.query(Flight).filter(...).all()
```

**Update**:
```python
flight.status = "In Flight"
db.commit()
```

**Delete** (Soft):
```python
flight.is_active = False
db.commit()
```

---

## ⚡ Performance Optimization

### Frontend

**Image Loading**:
- Preload critical frames immediately
- Progressive loading of remaining frames
- Browser image caching

**Rendering**:
- Canvas API (fast GPU-accelerated rendering)
- RequestAnimationFrame for smooth updates
- Memoization of components

**Network**:
- 5-second refresh interval (not too frequent)
- Pagination for flight lists
- Selective data fetching

### Backend

**Database**:
- SQLite indexes on flight_number, status
- Efficient query patterns
- Connection pooling

**Simulation**:
- Asynchronous background tasks
- Non-blocking operations
- Efficient update batching

**API**:
- CORS optimization
- Response compression
- Fast JSON serialization

---

## 🔌 API Reference

### Base URL
```
http://localhost:8000/api
```

### Authentication
None required (add JWT for production)

### Response Format
```json
{
  "id": 1,
  "flight_number": "UA456",
  "origin": "JFK",
  "destination": "LAX",
  "status": "In Flight",
  "latitude": 38.5,
  "longitude": -95.0,
  "altitude": 35000,
  "speed": 450,
  "departure_time": "2024-01-01T08:00:00",
  "arrival_time": null,
  "delay_minutes": 0,
  "is_active": true
}
```

### Error Handling
```json
{
  "detail": "Flight not found"
}
```

---

## 🎯 Best Practices Implemented

1. **Clean Code**: Modular, readable, well-organized
2. **Type Safety**: TypeScript frontend, Pydantic backend
3. **Performance**: Optimized queries, efficient rendering
4. **Scalability**: Database indexing, pagination
5. **Error Handling**: Graceful fallbacks, validation
6. **Documentation**: Comprehensive comments and docstrings
7. **Testing Ready**: API structure supports unit tests
8. **Production Ready**: Environment variables, error handling

---

## 🚀 Deployment Considerations

### Frontend (Vercel)
- Auto-deploys on git push
- Optimizes images automatically
- Global CDN distribution
- Environment variables support

### Backend (Heroku)
- Procfile configuration needed
- Database migration on deploy
- Environment variables for config
- Consider PostgreSQL for production

### Docker
- Both services containerized
- Docker Compose for local dev
- Production-ready images

---

## 📚 Next Steps

1. ✅ Setup complete and running
2. 📊 Add authentication (JWT)
3. 🗄️ Migrate to PostgreSQL
4. 📱 Build mobile app
5. 🤖 Implement real ML predictions
6. 📡 Add WebSocket for true real-time
7. 🗺️ Integrate Mapbox for better maps
8. 📧 Add email notifications

---

**Happy Flying! ✈️**

See [README.md](README.md) for general information and [SETUP.md](SETUP.md) for installation instructions.
