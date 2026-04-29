from sqlalchemy.orm import Session
from . import models, schemas
from .database import Flight


def get_flights(db: Session, skip: int = 0, limit: int = 100):
    """Get all flights with pagination"""
    return db.query(Flight).offset(skip).limit(limit).all()


def get_flight(db: Session, flight_id: int):
    """Get a specific flight by ID"""
    return db.query(Flight).filter(Flight.id == flight_id).first()


def get_flight_by_number(db: Session, flight_number: str):
    """Get a flight by flight number"""
    return db.query(Flight).filter(Flight.flight_number == flight_number).first()


def create_flight(db: Session, flight: schemas.FlightCreate):
    """Create a new flight"""
    db_flight = Flight(
        flight_number=flight.flight_number,
        origin=flight.origin,
        destination=flight.destination,
        status=flight.status,
        latitude=flight.latitude,
        longitude=flight.longitude,
        altitude=flight.altitude,
        speed=flight.speed,
        delay_minutes=flight.delay_minutes,
    )
    db.add(db_flight)
    db.commit()
    db.refresh(db_flight)
    return db_flight


def update_flight(db: Session, flight_id: int, flight_update: schemas.FlightUpdate):
    """Update an existing flight"""
    db_flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not db_flight:
        return None

    update_data = flight_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_flight, key, value)

    db.commit()
    db.refresh(db_flight)
    return db_flight


def delete_flight(db: Session, flight_id: int):
    """Delete a flight (soft delete by marking inactive)"""
    db_flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if db_flight:
        db_flight.is_active = False
        db.commit()
        return db_flight
    return None


def get_active_flights(db: Session):
    """Get only active flights"""
    return db.query(Flight).filter(Flight.is_active == True).all()


def get_flights_by_status(db: Session, status: str):
    """Get flights by status"""
    return db.query(Flight).filter(Flight.status == status).all()


def predict_delay(flight: Flight) -> dict:
    """AI-inspired delay prediction (simplified)"""
    base_delay = flight.delay_minutes
    
    # Simulate prediction based on status and current delay
    prediction_score = 0.0
    
    if flight.status == "Delayed":
        prediction_score = 0.85
    elif flight.status == "Boarding":
        prediction_score = 0.1 + (base_delay * 0.05)
    else:
        prediction_score = 0.05

    return {
        "flight_id": flight.id,
        "flight_number": flight.flight_number,
        "delay_probability": min(0.99, prediction_score),
        "predicted_delay_minutes": flight.delay_minutes,
        "confidence": 0.92,
    }
