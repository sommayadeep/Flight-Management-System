from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import asyncio

from . import crud, schemas
from .database import get_db, get_or_create_default_flights, get_live_aircraft_snapshot
from .tasks import simulate_flight_updates

# Initialize FastAPI app
app = FastAPI(
    title="Flight Management System API",
    description="Real-time flight tracking and management API",
    version="1.0.0",
)

# CORS Middleware - Allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database and start background tasks"""
    get_or_create_default_flights()
    asyncio.create_task(simulate_flight_updates())
    print("✈️ Flight Management System API started")


# ==================== FLIGHT ENDPOINTS ====================

@app.get("/api/flights", response_model=List[schemas.FlightResponse])
def get_flights(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all flights with pagination"""
    flights = crud.get_flights(db, skip=skip, limit=limit)
    return flights


@app.get("/api/flights/live", response_model=List[schemas.LiveFlightResponse])
def get_live_flights(db: Session = Depends(get_db)):
    """Get a realtime snapshot for live map rendering"""
    return get_live_aircraft_snapshot(db)


@app.get("/api/flights/active", response_model=List[schemas.FlightResponse])
def get_active_flights(db: Session = Depends(get_db)):
    """Get only active flights"""
    flights = crud.get_active_flights(db)
    return flights


@app.get("/api/flights/{flight_id}", response_model=schemas.FlightResponse)
def get_flight(flight_id: int, db: Session = Depends(get_db)):
    """Get a specific flight by ID"""
    flight = crud.get_flight(db, flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight


@app.post("/api/flights", response_model=schemas.FlightResponse)
def create_flight(flight: schemas.FlightCreate, db: Session = Depends(get_db)):
    """Create a new flight"""
    # Check if flight number already exists
    existing = crud.get_flight_by_number(db, flight.flight_number)
    if existing:
        raise HTTPException(status_code=400, detail="Flight number already exists")

    return crud.create_flight(db, flight)


@app.put("/api/flights/{flight_id}", response_model=schemas.FlightResponse)
def update_flight(
    flight_id: int, flight_update: schemas.FlightUpdate, db: Session = Depends(get_db)
):
    """Update a flight"""
    flight = crud.update_flight(db, flight_id, flight_update)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight


@app.delete("/api/flights/{flight_id}")
def delete_flight(flight_id: int, db: Session = Depends(get_db)):
    """Delete a flight (soft delete)"""
    flight = crud.delete_flight(db, flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return {"message": "Flight deleted successfully", "flight_id": flight_id}


@app.get("/api/flights/status/{status}", response_model=List[schemas.FlightResponse])
def get_flights_by_status(status: str, db: Session = Depends(get_db)):
    """Get flights filtered by status"""
    flights = crud.get_flights_by_status(db, status)
    return flights


# ==================== DELAY PREDICTION ====================

@app.get("/api/delay-prediction/{flight_id}")
def get_delay_prediction(flight_id: int, db: Session = Depends(get_db)):
    """Get delay prediction for a flight"""
    flight = crud.get_flight(db, flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    return crud.predict_delay(flight)


@app.get("/api/delay-predictions")
def get_all_delay_predictions(db: Session = Depends(get_db)):
    """Get delay predictions for all active flights"""
    flights = crud.get_active_flights(db)
    predictions = [crud.predict_delay(flight) for flight in flights]
    return predictions


# ==================== ANALYTICS ====================

@app.get("/api/analytics/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Get flight analytics summary"""
    flights = crud.get_active_flights(db)

    summary = {
        "total_flights": len(flights),
        "in_flight": len([f for f in flights if f.status == "In Flight"]),
        "boarding": len([f for f in flights if f.status == "Boarding"]),
        "delayed": len([f for f in flights if f.status == "Delayed"]),
        "cancelled": len([f for f in flights if f.status == "Cancelled"]),
        "on_time": len([f for f in flights if f.status == "On Time"]),
        "average_delay": (
            sum([f.delay_minutes for f in flights]) / len(flights)
            if flights
            else 0
        ),
        "total_aircraft_count": len(flights),
    }
    return summary


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Flight Management System API"}
