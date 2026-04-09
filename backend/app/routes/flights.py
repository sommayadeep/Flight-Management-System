from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import FlightResponse, FlightCreate, FlightSearch
from app.services import FlightService
from typing import List

router = APIRouter(prefix="/api/flights", tags=["flights"])

@router.get("/search", response_model=List[FlightResponse])
async def search_flights(
    source: str = Query(..., min_length=1),
    destination: str = Query(..., min_length=1),
    date: str = Query(...),
    db: Session = Depends(get_db)
):
    """Search flights by source, destination, and date"""
    flights = FlightService.search_flights(db, source, destination, date)
    return flights

@router.get("/{flight_id}", response_model=FlightResponse)
async def get_flight(flight_id: int, db: Session = Depends(get_db)):
    """Get flight details"""
    flight = FlightService.get_flight_by_id(db, flight_id)
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    return flight

@router.get("/{flight_id}/seats")
async def check_seat_availability(flight_id: int, db: Session = Depends(get_db)):
    """Check available seats for a flight"""
    flight = FlightService.get_flight_by_id(db, flight_id)
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    return {
        "flight_id": flight_id,
        "total_seats": flight.total_seats,
        "available_seats": flight.available_seats,
        "booked_seats": flight.total_seats - flight.available_seats
    }

# Admin routes
@router.post("/", response_model=FlightResponse)
async def create_flight(flight_data: FlightCreate, db: Session = Depends(get_db)):
    """Create a new flight (Admin only)"""
    # In production, verify admin role
    try:
        flight = FlightService.create_flight(db, flight_data.model_dump())
        return flight
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
