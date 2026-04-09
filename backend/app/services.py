from sqlalchemy.orm import Session
from app.models import User, Flight, Booking, Payment, BookingStatus, PaymentStatus
from app.schemas import UserCreate, BookingCreate, PaymentCreate
from app.security import SecurityUtils
import random
import string
from datetime import datetime

class UserService:
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        db_user = User(
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            password_hash=SecurityUtils.hash_password(user_data.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """Authenticate user with email and password"""
        user = UserService.get_user_by_email(db, email)
        if not user or not SecurityUtils.verify_password(password, user.password_hash):
            return None
        return user


class FlightService:
    @staticmethod
    def search_flights(db: Session, source: str, destination: str, date: str) -> list:
        """Search flights by source, destination, and date"""
        try:
            search_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return []

        flights = db.query(Flight).filter(
            Flight.source.ilike(f"%{source}%"),
            Flight.destination.ilike(f"%{destination}%"),
            Flight.available_seats > 0,
            Flight.departure_time >= datetime.combine(search_date, datetime.min.time())
        ).all()
        
        return flights

    @staticmethod
    def get_flight_by_id(db: Session, flight_id: int) -> Flight:
        """Get flight by ID"""
        return db.query(Flight).filter(Flight.id == flight_id).first()

    @staticmethod
    def create_flight(db: Session, flight_data: dict) -> Flight:
        """Create a new flight (Admin only)"""
        # Set available_seats to total_seats if not provided
        if 'available_seats' not in flight_data:
            flight_data['available_seats'] = flight_data['total_seats']
        
        db_flight = Flight(**flight_data)
        db.add(db_flight)
        db.commit()
        db.refresh(db_flight)
        return db_flight

    @staticmethod
    def update_flight(db: Session, flight_id: int, update_data: dict) -> Flight:
        """Update flight details"""
        flight = FlightService.get_flight_by_id(db, flight_id)
        if not flight:
            return None
        
        for key, value in update_data.items():
            if value is not None:
                setattr(flight, key, value)
        
        db.commit()
        db.refresh(flight)
        return flight


class BookingService:
    @staticmethod
    def generate_booking_reference() -> str:
        """Generate unique booking reference"""
        return "BK" + "".join(random.choices(string.ascii_uppercase + string.digits, k=10))

    @staticmethod
    def create_booking(db: Session, user_id: int, booking_data: BookingCreate) -> Booking:
        """Create a new booking"""
        # Check flight exists and has available seats
        flight = FlightService.get_flight_by_id(db, booking_data.flight_id)
        if not flight or flight.available_seats <= 0:
            raise ValueError("Flight not available or no seats left")

        # Create booking
        db_booking = Booking(
            user_id=user_id,
            flight_id=booking_data.flight_id,
            seat_number=booking_data.seat_number,
            passenger_name=booking_data.passenger_name,
            passenger_email=booking_data.passenger_email,
            passenger_phone=booking_data.passenger_phone,
            cabin_class=booking_data.cabin_class,
            meal_preference=booking_data.meal_preference,
            booking_reference=BookingService.generate_booking_reference(),
            status=BookingStatus.CONFIRMED
        )

        # Update flight available seats
        flight.available_seats -= 1

        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        return db_booking

    @staticmethod
    def get_booking_by_id(db: Session, booking_id: int) -> Booking:
        """Get booking by ID"""
        return db.query(Booking).filter(Booking.id == booking_id).first()

    @staticmethod
    def get_user_bookings(db: Session, user_id: int) -> list:
        """Get all bookings for a user"""
        return db.query(Booking).filter(Booking.user_id == user_id).all()

    @staticmethod
    def cancel_booking(db: Session, booking_id: int) -> Booking:
        """Cancel a booking"""
        booking = BookingService.get_booking_by_id(db, booking_id)
        if not booking:
            return None

        if booking.status == BookingStatus.CANCELLED:
            raise ValueError("Booking is already cancelled")

        # Restore flight seats
        booking.flight.available_seats += 1
        booking.status = BookingStatus.CANCELLED

        db.commit()
        db.refresh(booking)
        return booking


class PaymentService:
    @staticmethod
    def process_payment(db: Session, payment_data: PaymentCreate) -> Payment:
        """Process payment for booking"""
        booking = BookingService.get_booking_by_id(db, payment_data.booking_id)
        if not booking:
            raise ValueError("Booking not found")

        # Generate transaction ID (mock)
        transaction_id = "TXN" + "".join(random.choices(string.digits, k=12))

        db_payment = Payment(
            booking_id=payment_data.booking_id,
            amount=payment_data.amount,
            transaction_id=transaction_id,
            payment_method=payment_data.payment_method,
            status=PaymentStatus.COMPLETED  # In real scenario, would be PENDING initially
        )

        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment

    @staticmethod
    def get_payment_status(db: Session, payment_id: int) -> Payment:
        """Get payment status"""
        return db.query(Payment).filter(Payment.id == payment_id).first()
