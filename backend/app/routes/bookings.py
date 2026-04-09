from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import BookingCreate, BookingResponse, BookingListResponse
from app.services import BookingService, UserService
from app.security import SecurityUtils
from typing import Optional
import random
import string

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    print(f"[Auth] Incoming Authorization Header: {authorization[:20] if authorization else 'None'}...")
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )

    payload = SecurityUtils.decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user_id = payload.get("sub")
    user = UserService.get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user

@router.post("/", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new booking"""
    try:
        booking = BookingService.create_booking(db, current_user.id, booking_data)
        return booking
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create booking"
        )

@router.get("/my", response_model=BookingListResponse)
async def get_my_bookings(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for current user"""
    bookings = BookingService.get_user_bookings(db, current_user.id)
    return BookingListResponse(
        bookings=bookings,
        total=len(bookings)
    )

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get booking details"""
    booking = BookingService.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Verify user owns this booking
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )

    return booking

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    booking = BookingService.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Verify user owns this booking
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )

    try:
        cancelled_booking = BookingService.cancel_booking(db, booking_id)
        return cancelled_booking
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/payments/create-order")
async def create_payment_order(
    booking_id: int,
    amount: float,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order (Mock)"""
    # In reality, you'd call razorpay.Order.create()
    order_id = "order_" + "".join(random.choices(string.ascii_letters + string.digits, k=14))
    return {
        "order_id": order_id,
        "amount": amount * 100, # Razorpay expects amount in paise
        "currency": "INR",
        "key_id": "rzp_test_placeholder"
    }
