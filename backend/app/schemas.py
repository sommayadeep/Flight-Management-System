from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FlightBase(BaseModel):
    flight_number: str
    origin: str
    destination: str
    status: str = "On Time"
    latitude: float = 0.0
    longitude: float = 0.0
    altitude: float = 0.0
    speed: float = 0.0
    delay_minutes: int = 0


class LiveFlightResponse(BaseModel):
    id: int
    flight_number: str
    origin: str
    destination: str
    route: str
    lat: float
    lng: float
    speed: float
    altitude: float
    status: str
    heading: float
    delay_minutes: int
    updated_at: str

    class Config:
        from_attributes = True


class FlightCreate(FlightBase):
    pass


class FlightUpdate(BaseModel):
    flight_number: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None
    speed: Optional[float] = None
    delay_minutes: Optional[int] = None


class FlightResponse(FlightBase):
    id: int
    departure_time: datetime
    arrival_time: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True
