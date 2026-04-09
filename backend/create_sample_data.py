#!/usr/bin/env python3
"""
Script to populate the database with sample data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import Flight
from app.services import FlightService

def create_sample_flights():
    """Create sample flights for testing"""
    db = SessionLocal()

    # Sample flights
    flights_data = [
        {
            "flight_number": "SK101",
            "source": "New York",
            "destination": "London",
            "departure_time": datetime.now() + timedelta(days=1),
            "arrival_time": datetime.now() + timedelta(days=1, hours=7),
            "total_seats": 200,
            "price": 450.00,
            "airline": "Sky Wings"
        },
        {
            "flight_number": "SK102",
            "source": "London",
            "destination": "New York",
            "departure_time": datetime.now() + timedelta(days=2),
            "arrival_time": datetime.now() + timedelta(days=2, hours=8),
            "total_seats": 200,
            "price": 480.00,
            "airline": "Sky Wings"
        },
        {
            "flight_number": "SK201",
            "source": "Los Angeles",
            "destination": "Tokyo",
            "departure_time": datetime.now() + timedelta(days=3),
            "arrival_time": datetime.now() + timedelta(days=3, hours=11),
            "total_seats": 180,
            "price": 650.00,
            "airline": "Sky Wings"
        },
        {
            "flight_number": "SK301",
            "source": "Paris",
            "destination": "Dubai",
            "departure_time": datetime.now() + timedelta(days=4),
            "arrival_time": datetime.now() + timedelta(days=4, hours=6),
            "total_seats": 150,
            "price": 320.00,
            "airline": "Sky Wings"
        }
    ]

    try:
        for flight_data in flights_data:
            # Check if flight already exists
            existing = db.query(Flight).filter(Flight.flight_number == flight_data["flight_number"]).first()
            if not existing:
                flight = FlightService.create_flight(db, flight_data)
                print(f"Created flight: {flight.flight_number} - {flight.source} to {flight.destination}")
            else:
                print(f"Flight {flight_data['flight_number']} already exists")

        db.commit()
        print("Sample data created successfully!")

    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_flights()
