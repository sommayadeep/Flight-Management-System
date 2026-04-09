from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# ============= Auth Schemas =============
class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class GoogleMockRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None

# ============= Flight Schemas =============
class FlightCreate(BaseModel):
    flight_number: str
    source: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    total_seats: int
    price: float
    airline: str

class FlightUpdate(BaseModel):
    available_seats: Optional[int] = None
    price: Optional[float] = None

class FlightResponse(BaseModel):
    id: int
    flight_number: str
    source: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    total_seats: int
    available_seats: int
    price: float
    airline: str

    class Config:
        from_attributes = True

class FlightSearch(BaseModel):
    source: str
    destination: str
    date: str

# ============= Booking Schemas =============
class BookingCreate(BaseModel):
    flight_id: int
    seat_number: str
    passenger_name: str
    passenger_email: EmailStr
    passenger_phone: Optional[str] = None
    cabin_class: str = "economy"
    meal_preference: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    booking_reference: str
    flight_id: int
    seat_number: str
    passenger_name: str
    passenger_email: Optional[str] = None
    passenger_phone: Optional[str] = None
    cabin_class: str
    status: str
    booking_date: datetime
    flight: Optional[FlightResponse] = None

    class Config:
        from_attributes = True

class BookingListResponse(BaseModel):
    bookings: List[BookingResponse]
    total: int

# ============= Payment Schemas =============
class PaymentCreate(BaseModel):
    booking_id: int
    amount: float
    payment_method: str = "credit_card"

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: float
    status: str
    transaction_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ============= Error Schemas =============
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
