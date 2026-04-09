import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.database import SessionLocal, engine, Base
from app.models import Flight

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

INDIAN_CITIES = [
    "Mumbai (BOM)", "Delhi (DEL)", "Bengaluru (BLR)", "Hyderabad (HYD)", 
    "Chennai (MAA)", "Kolkata (CCU)", "Ahmedabad (AMD)", "Pune (PNQ)", 
    "Goa (GOI)", "Jaipur (JAI)", "Lucknow (LKO)", "Guwahati (GAU)"
]

AIRLINES = [
    "IndiGo", "Air India", "Vistara", "SpiceJet", "Akasa Air", "Air Asia India"
]

def seed_data():
    db = SessionLocal()
    try:
        # Clear existing flights
        db.query(Flight).delete()
        
        flights = []
        now = datetime.utcnow()
        
        used_flight_nums = set()
        
        def get_unique_flight_num(airline):
            while True:
                num = f"{airline[:2].upper()}{random.randint(100, 9999)}"
                if num not in used_flight_nums:
                    used_flight_nums.add(num)
                    return num

        # 1. ADD GUARANTEED FLIGHTS FOR COMMON ROUTES TO ENSURE VERIFICATION SUCCEEDS
        popular_routes = [
            ("Mumbai (BOM)", "Delhi (DEL)"),
            ("Delhi (DEL)", "Mumbai (BOM)"),
            ("Bengaluru (BLR)", "Delhi (DEL)")
        ]
        
        for source, dest in popular_routes:
            for day in range(7):
                for hour in [8, 12, 18, 21]: # Morning, Afternoon, Evening, Night
                    airline = random.choice(AIRLINES)
                    departure = now.replace(hour=hour, minute=0, second=0, microsecond=0) + timedelta(days=day)
                    arrival = departure + timedelta(hours=2, minutes=15)
                    
                    f = Flight(
                        flight_number=get_unique_flight_num(airline),
                        source=source,
                        destination=dest,
                        departure_time=departure,
                        arrival_time=arrival,
                        total_seats=180,
                        available_seats=random.randint(50, 180),
                        price=float(random.randint(4500, 9500)),
                        airline=airline
                    )
                    flights.append(f)

        # 2. GENERATE RANDOM FLIGHTS (Total 400 additional)
        for i in range(400):
            source = random.choice(INDIAN_CITIES)
            dest = random.choice([c for c in INDIAN_CITIES if c != source])
            airline = random.choice(AIRLINES)
            
            days_out = random.randint(0, 7)
            hours_out = random.randint(0, 23)
            departure = now + timedelta(days=days_out, hours=hours_out)
            arrival = departure + timedelta(hours=random.randint(1, 5))
            
            f = Flight(
                flight_number=get_unique_flight_num(airline),
                source=source,
                destination=dest,
                departure_time=departure,
                arrival_time=arrival,
                total_seats=180,
                available_seats=random.randint(0, 180),
                price=float(random.randint(3500, 15000)),
                airline=airline
            )
            flights.append(f)
        
        db.bulk_save_objects(flights)
        db.commit()
        print(f"Successfully seeded {len(flights)} unique flights across India.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
