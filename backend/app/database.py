import os
import json
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import random
import math
import time
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

# SQLite Database Setup
DATABASE_URL = "sqlite:///./flights.db"
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}, echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String, unique=True, index=True)
    origin = Column(String)
    destination = Column(String)
    status = Column(String, default="On Time")
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    altitude = Column(Float, default=0.0)
    speed = Column(Float, default=0.0)
    departure_time = Column(DateTime, default=datetime.utcnow)
    arrival_time = Column(DateTime, nullable=True)
    delay_minutes = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Predefined airport coordinates for simulation
AIRPORTS = {
    "DEL": {"lat": 28.5562, "lon": 77.1000, "name": "Delhi (DEL)"},
    "BOM": {"lat": 19.0896, "lon": 72.8656, "name": "Mumbai (BOM)"},
    "BLR": {"lat": 13.1986, "lon": 77.7066, "name": "Bengaluru (BLR)"},
    "MAA": {"lat": 12.9941, "lon": 80.1709, "name": "Chennai (MAA)"},
    "HYD": {"lat": 17.2403, "lon": 78.4294, "name": "Hyderabad (HYD)"},
    "GOI": {"lat": 15.3800, "lon": 73.8278, "name": "Goa (GOI)"},
    "PNQ": {"lat": 18.5820, "lon": 73.9197, "name": "Pune (PNQ)"},
    "AMD": {"lat": 23.0779, "lon": 72.6347, "name": "Ahmedabad (AMD)"},
    "COK": {"lat": 8.4824, "lon": 76.9204, "name": "Kochi (COK)"},
    "CCU": {"lat": 22.6536, "lon": 88.4467, "name": "Kolkata (CCU)"},
}


def get_airport(code: str):
    return AIRPORTS.get(code.upper())


def get_airport_coords(code: str, fallback_lat: float = 0.0, fallback_lon: float = 0.0):
    airport = get_airport(code)
    if not airport:
        return fallback_lat, fallback_lon
    return airport["lat"], airport["lon"]


def get_route_heading(origin_lat: float, origin_lon: float, destination_lat: float, destination_lon: float) -> float:
    delta_lon = math.radians(destination_lon - origin_lon)
    origin_lat_rad = math.radians(origin_lat)
    destination_lat_rad = math.radians(destination_lat)
    y = math.sin(delta_lon) * math.cos(destination_lat_rad)
    x = math.cos(origin_lat_rad) * math.sin(destination_lat_rad) - math.sin(origin_lat_rad) * math.cos(destination_lat_rad) * math.cos(delta_lon)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360


def build_live_flight_payload(flight):
    origin = get_airport(flight.origin)
    destination = get_airport(flight.destination)
    heading = 0.0

    if origin and destination:
        heading = get_route_heading(flight.latitude, flight.longitude, destination["lat"], destination["lon"])

    return {
        "id": flight.id,
        "flight_number": flight.flight_number,
        "origin": flight.origin,
        "destination": flight.destination,
        "route": f"{flight.origin} → {flight.destination}",
        "lat": flight.latitude,
        "lng": flight.longitude,
        "speed": flight.speed,
        "altitude": flight.altitude,
        "status": flight.status,
        "heading": heading,
        "delay_minutes": flight.delay_minutes,
    }


_OPEN_SKY_CACHE: list[dict] = []
_OPEN_SKY_CACHE_TS = 0.0
_OPEN_SKY_CACHE_TTL = 2.0


def _stable_live_id(icao24: str, fallback_index: int) -> int:
    try:
        return int(icao24, 16)
    except (TypeError, ValueError):
        return 100000 + fallback_index


def _normalize_callsign(callsign: str | None, icao24: str, fallback_index: int) -> str:
    if callsign:
        normalized = callsign.strip().replace(" ", "")
        if normalized:
            return normalized
    return f"OPEN{fallback_index:03d}-{icao24[-4:].upper()}"


def _fetch_opensky_states() -> list[dict]:
    url = (
        "https://opensky-network.org/api/states/all"
        "?lamin=5&lamax=37&lomin=68&lomax=98"
    )

    with urlopen(url, timeout=5) as response:
        payload = json.loads(response.read().decode("utf-8"))

    states = payload.get("states") or []
    snapshot_time = datetime.utcnow().isoformat() + "Z"
    live_flights: list[dict] = []

    for index, state in enumerate(states[:24]):
        icao24 = (state[0] or "").strip().lower()
        callsign = _normalize_callsign(state[1], icao24, index)
        origin_country = (state[2] or "OpenSky").strip() or "OpenSky"
        longitude = state[5]
        latitude = state[6]

        if latitude is None or longitude is None:
            continue

        altitude_m = state[7] or 0.0
        velocity_mps = state[9] or 0.0
        heading = float(state[10] or 0.0)
        on_ground = bool(state[8])

        live_flights.append(
            {
                "id": _stable_live_id(icao24, index),
                "flight_number": callsign,
                "origin": origin_country,
                "destination": "Live Radar",
                "route": f"{origin_country} live aircraft",
                "lat": float(latitude),
                "lng": float(longitude),
                "speed": round(float(velocity_mps) * 2.23693629, 2),
                "altitude": round(float(altitude_m) * 3.28084, 2),
                "status": "On Ground" if on_ground else "In Flight",
                "heading": heading,
                "delay_minutes": 0,
                "updated_at": snapshot_time,
            }
        )

    live_flights.sort(key=lambda flight: flight["flight_number"])
    return live_flights


def get_live_aircraft_snapshot(db):
    global _OPEN_SKY_CACHE_TS, _OPEN_SKY_CACHE

    now = time.time()
    if _OPEN_SKY_CACHE and (now - _OPEN_SKY_CACHE_TS) < _OPEN_SKY_CACHE_TTL:
        return _OPEN_SKY_CACHE

    try:
        _OPEN_SKY_CACHE = _fetch_opensky_states()
        _OPEN_SKY_CACHE_TS = now
        if _OPEN_SKY_CACHE:
            return _OPEN_SKY_CACHE
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError) as error:
        print(f"OpenSky fetch failed, falling back to simulated flights: {error}")

    fallback_flights = db.query(Flight).filter(Flight.is_active == True).all()
    snapshot_time = datetime.utcnow().isoformat() + "Z"
    _OPEN_SKY_CACHE = [
        {**build_live_flight_payload(flight), "updated_at": snapshot_time}
        for flight in fallback_flights
    ]
    _OPEN_SKY_CACHE_TS = now
    return _OPEN_SKY_CACHE


def get_or_create_default_flights():
    db = SessionLocal()
    flights_count = db.query(Flight).count()

    if flights_count == 0:
        default_flights = [
            {
                "flight_number": "AI101",
                "origin": "DEL",
                "destination": "BOM",
                "status": "In Flight",
                "latitude": 26.0,
                "longitude": 75.0,
                "altitude": 33000,
                "speed": 460,
            },
            {
                "flight_number": "6E202",
                "origin": "BLR",
                "destination": "DEL",
                "status": "In Flight",
                "latitude": 20.5,
                "longitude": 73.0,
                "altitude": 32000,
                "speed": 450,
            },
            {
                "flight_number": "SG303",
                "origin": "MAA",
                "destination": "HYD",
                "status": "Boarding",
                "latitude": 12.9941,
                "longitude": 80.1709,
                "altitude": 0,
                "speed": 0,
            },
            {
                "flight_number": "UK404",
                "origin": "BOM",
                "destination": "GOI",
                "status": "Delayed",
                "latitude": 16.0,
                "longitude": 73.0,
                "altitude": 25000,
                "speed": 420,
                "delay_minutes": 20,
            },
            {
                "flight_number": "I5501",
                "origin": "CCU",
                "destination": "COK",
                "status": "In Flight",
                "latitude": 20.0,
                "longitude": 80.0,
                "altitude": 35000,
                "speed": 470,
            },
        ]

        for flight_data in default_flights:
            db.add(Flight(**flight_data))

        db.commit()

    db.close()
