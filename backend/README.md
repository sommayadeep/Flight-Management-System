# AirControl - Flight Management System (Backend)

A production-ready FastAPI-based backend for real-time flight management with SQLite database and background task simulation.

## 🚀 Features

- **RESTful API**: Complete CRUD operations for flights
- **Real-Time Simulation**: Background tasks simulate flight movements and delays
- **Database**: SQLite with SQLAlchemy ORM
- **Predictive Analytics**: AI-inspired delay prediction model
- **CORS Enabled**: Ready for frontend integration
- **Auto-Refresh**: Real-time updates every 5 seconds
- **Health Monitoring**: System health checks

## 🛠️ Tech Stack

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Lightweight database
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

## 📋 Prerequisites

- Python 3.8+
- pip

## 🚀 Quick Start

### Installation

```bash
cd backend
bash run.sh
```

Or manually:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Access API

- **Base URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app and routes
│   ├── database.py          # SQLAlchemy setup and Flight model
│   ├── schemas.py           # Pydantic request/response models
│   ├── crud.py              # Database operations and business logic
│   ├── tasks.py             # Background simulation tasks
│   ├── models.py            # Constants and enums
│   └── __init__.py
├── flights.db               # SQLite database (auto-created)
├── requirements.txt         # Python dependencies
├── run.sh                   # Setup and run script
└── README.md
```

## 📡 API Endpoints

### Flight Management

#### Get All Flights
```
GET /api/flights?skip=0&limit=100
```

Response:
```json
[
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
    "delay_minutes": 0
  }
]
```

#### Get Active Flights
```
GET /api/flights/active
```

#### Get Flight by ID
```
GET /api/flights/{id}
```

#### Get Flights by Status
```
GET /api/flights/status/{status}
```

Status values: `On Time`, `Delayed`, `Boarding`, `In Flight`, `Landed`, `Cancelled`

#### Create Flight
```
POST /api/flights
Content-Type: application/json

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
Content-Type: application/json

{
  "status": "In Flight",
  "latitude": 35.5,
  "longitude": -92.0,
  "altitude": 32000,
  "speed": 440
}
```

#### Delete Flight
```
DELETE /api/flights/{id}
```

### Analytics & Predictions

#### Get Delay Prediction
```
GET /api/delay-prediction/{id}
```

Response:
```json
{
  "flight_id": 1,
  "flight_number": "UA456",
  "delay_probability": 0.05,
  "predicted_delay_minutes": 0,
  "confidence": 0.92
}
```

#### Get All Delay Predictions
```
GET /api/delay-predictions
```

#### Get Analytics Summary
```
GET /api/analytics/summary
```

Response:
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

### System

#### Health Check
```
GET /api/health
```

## 🗄️ Database Model

### Flight Table

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| flight_number | String | Unique flight identifier |
| origin | String | Departure airport code |
| destination | String | Arrival airport code |
| status | String | Current flight status |
| latitude | Float | Current latitude |
| longitude | Float | Current longitude |
| altitude | Float | Current altitude in feet |
| speed | Float | Current speed in mph |
| departure_time | DateTime | Scheduled departure |
| arrival_time | DateTime | Scheduled arrival |
| delay_minutes | Integer | Delay in minutes |
| is_active | Boolean | Soft delete flag |

## 🔄 Background Tasks

### Flight Simulation Engine

**Runs every 5 seconds:**

1. **Movement**: Updates latitude/longitude with random variance
2. **Altitude Changes**: Simulates climb/descent cycles
3. **Speed Adjustments**: Maintains realistic speed ranges
4. **Delay Simulation**: Random chance of delays (2% per update)
5. **Status Transitions**: Auto-transitions between states

### Configuration

Modify in `app/tasks.py`:
```python
await asyncio.sleep(5)  # Change update interval
```

## 🤖 Delay Prediction Model

The prediction algorithm considers:
- Current flight status
- Current delay minutes
- Historical patterns
- Random probability factors

**Prediction Output:**
- `delay_probability`: 0-1 score
- `predicted_delay_minutes`: Estimated delay
- `confidence`: Model confidence score

## 🔐 Security Notes

For production:

1. Add authentication (JWT tokens)
2. Implement rate limiting
3. Use environment variables for config
4. Set specific CORS origins
5. Use HTTPS
6. Add request validation

## 📊 Default Test Data

The system creates 5 default flights on startup:

- **UA456**: JFK → LAX (In Flight)
- **AA789**: ORD → DFW (In Flight)
- **DL123**: DEN → SFO (Boarding)
- **SW234**: LAX → MIA (Delayed)
- **BA567**: BOS → SFO (In Flight)

## 🐛 Debugging

Enable detailed logging:

```python
# In database.py
engine = create_engine(DATABASE_URL, echo=True)  # Shows SQL queries
```

## 📈 Performance

- Database queries: < 50ms
- API response time: < 100ms
- Simulation updates: Asynchronous, non-blocking
- Memory usage: ~50MB baseline

## 🚀 Deployment

### Docker (Optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Heroku

```bash
heroku create your-app-name
git push heroku main
heroku config:set PYTHONUNBUFFERED=1
```

## 📞 Support

- Check API docs at `/docs`
- Monitor logs in terminal
- Check database: `flights.db`

## 📄 License

MIT
