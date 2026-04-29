import asyncio
import random
from sqlalchemy.orm import Session
from .database import SessionLocal, Flight, AIRPORTS, get_airport, get_airport_coords, get_route_heading
from datetime import datetime, timedelta
import math


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _move_toward(current: float, target: float, delta: float) -> float:
    if current < target:
        return min(target, current + delta)
    return max(target, current - delta)


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # returns distance in kilometers
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return 2 * R * math.asin(min(1, math.sqrt(a)))


def _destination_point(lat: float, lon: float, bearing_deg: float, distance_km: float) -> tuple:
    # Returns new (lat, lon) after moving distance_km along bearing from (lat, lon)
    R = 6371.0
    bearing = math.radians(bearing_deg)
    phi1 = math.radians(lat)
    lambda1 = math.radians(lon)

    phi2 = math.asin(math.sin(phi1) * math.cos(distance_km / R) + math.cos(phi1) * math.sin(distance_km / R) * math.cos(bearing))
    lambda2 = lambda1 + math.atan2(math.sin(bearing) * math.sin(distance_km / R) * math.cos(phi1), math.cos(distance_km / R) - math.sin(phi1) * math.sin(phi2))

    return math.degrees(phi2), (math.degrees(lambda2) + 540) % 360 - 180


async def simulate_flight_updates():
    """
    Background task to simulate flight movements and delays
    Runs every 5 seconds
    """
    while True:
        db = SessionLocal()
        try:
            flights = db.query(Flight).filter(Flight.is_active == True).all()

            for flight in flights:
                origin_lat, origin_lon = get_airport_coords(flight.origin, flight.latitude, flight.longitude)
                destination = get_airport(flight.destination)
                destination_lat = destination["lat"] if destination else flight.latitude
                destination_lon = destination["lon"] if destination else flight.longitude

                if flight.status == "Boarding":
                    if random.random() < 0.18:
                        flight.status = "In Flight"
                        flight.latitude = origin_lat
                        flight.longitude = origin_lon
                        flight.altitude = random.uniform(22000, 30000)
                        flight.speed = random.uniform(360, 450)

                elif flight.status in {"In Flight", "Delayed", "On Time"}:
                    # Move along great-circle toward destination using current bearing and speed
                    # Convert speed (assumed knots) to km per tick (5 seconds)
                    speed_knots = max(0.0, flight.speed or 0.0)
                    speed_kmh = speed_knots * 1.852
                    tick_seconds = 5.0
                    distance_km = (speed_kmh * (tick_seconds / 3600.0))

                    # reduce movement when delayed
                    if flight.status == "Delayed":
                        distance_km *= 0.35

                    bearing = get_route_heading(flight.latitude, flight.longitude, destination_lat, destination_lon)
                    new_lat, new_lon = _destination_point(flight.latitude, flight.longitude, bearing, distance_km)

                    # small random drift to avoid perfectly linear motion
                    jitter_lat = random.uniform(-0.0002, 0.0002)
                    jitter_lon = random.uniform(-0.0002, 0.0002)

                    flight.latitude = new_lat + jitter_lat
                    flight.longitude = new_lon + jitter_lon

                    # gently vary altitude and speed
                    flight.altitude = _clamp(
                        flight.altitude + random.uniform(-120, 120),
                        0,
                        41000,
                    )
                    flight.speed = _clamp(
                        flight.speed + random.uniform(-6, 6),
                        0,
                        520,
                    )

                    # remaining distance to destination in km (great-circle)
                    rem_km = _haversine_km(flight.latitude, flight.longitude, destination_lat, destination_lon)
                    # consider landed when within 3 km
                    if rem_km < 3.0 and flight.status == "In Flight":
                        flight.status = "Landed"
                        flight.altitude = 0
                        flight.speed = 0

                    # random delays/clearance events
                    if flight.status != "Landed" and random.random() < 0.04:
                        flight.delay_minutes += random.randint(2, 8)
                        flight.status = "Delayed"

                    if flight.status == "Delayed" and random.random() < 0.25:
                        flight.delay_minutes = max(0, flight.delay_minutes - random.randint(1, 4))
                        if flight.delay_minutes == 0:
                            flight.status = "In Flight"

                elif flight.status == "Landed":
                    flight.speed = 0
                    flight.altitude = 0
                    if random.random() < 0.02:
                        flight.status = "On Time"

                flight.altitude = _clamp(flight.altitude, 0, 41000)
                flight.speed = _clamp(flight.speed, 0, 520)

            db.commit()
        except Exception as e:
            print(f"Error in flight simulation: {e}")
            db.rollback()
        finally:
            db.close()

        await asyncio.sleep(5)  # Update every 5 seconds


async def start_background_tasks():
    """Start all background tasks"""
    asyncio.create_task(simulate_flight_updates())
