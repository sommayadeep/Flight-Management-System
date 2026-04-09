# Flight Management System

A premium, cinematic flight booking web application with a scalable FastAPI backend.

## Features

### Frontend (React + Vite)
- 🎬 Cinematic intro screen with animations
- 🔐 User authentication (Login/Signup)
- ✈️ Flight search and booking interface
- 🎵 Sound effects and ambient audio
- 🎨 Glassmorphism UI design
- 📱 Responsive design
- 🎭 Framer Motion animations

### Backend (FastAPI)
- 🚀 FastAPI with automatic API documentation
- 🔐 JWT-based authentication
- 🗄️ SQLAlchemy ORM with SQLite/PostgreSQL
- ✈️ Flight management system
- 🎫 Booking and payment simulation
- 📊 Role-based access control

## Project Structure

```
flight-management-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utilities (API, SoundManager)
│   │   └── ...
│   ├── public/              # Static assets (videos, sounds)
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── services.py      # Business logic
│   │   ├── routes/          # API routes
│   │   ├── database.py      # Database configuration
│   │   ├── config.py        # Settings
│   │   └── main.py          # Application entry point
│   ├── requirements.txt
│   └── .env
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- SQLite (comes with Python) or PostgreSQL

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env if needed (default uses SQLite)
   ```

5. Run database migrations (creates tables):
   ```bash
   python3 -m app.main  # This will create tables automatically
   ```

6. Populate with sample data:
   ```bash
   python3 create_sample_data.py
   ```

7. Start the backend server:
   ```bash
   python3 -m app.main
   ```
   Server will run on http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit if backend is on different port
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:3000 or next available port

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## Key Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate token

### Flights
- `GET /api/flights/search` - Search flights
- `GET /api/flights/{id}` - Get flight details
- `GET /api/flights/{id}/seats` - Check seat availability

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user bookings
- `POST /api/bookings/{id}/cancel` - Cancel booking

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments/{id}` - Get payment status

## Database Schema

### Users
- id, name, email, password_hash, phone, role, is_active

### Flights
- id, flight_number, source, destination, departure_time, arrival_time
- total_seats, available_seats, price, airline

### Bookings
- id, booking_reference, user_id, flight_id, seat_number
- passenger_name, passenger_email, status, booking_date

### Payments
- id, booking_id, amount, status, transaction_id, payment_method

## Development Notes

### Adding Sound Effects
Place audio files in `frontend/public/sounds/`:
- `engine-startup.mp3` - Login success sound
- `ambient-flight.mp3` - Background ambience
- `takeoff.mp3` - Booking confirmation sound

### Video Backgrounds
Place video files in `frontend/public/`:
- `start-booking.mp4` - Booking start video
- `continue.mp4` - Booking continue video
- `flight-bg.mp4` - General background video

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=sqlite:///./flight_management.db
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:3000"]
```

#### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Production Deployment

### Backend
1. Set up PostgreSQL database
2. Update DATABASE_URL in .env
3. Use a production WSGI server (e.g., Gunicorn)
4. Set SECRET_KEY to a secure random string
5. Enable HTTPS

### Frontend
1. Build for production: `npm run build`
2. Serve static files from `dist/` directory
3. Configure reverse proxy (nginx) for API calls

## Technologies Used

### Frontend
- React 18
- Vite
- Framer Motion
- Tailwind CSS
- Axios
- Lucide React (icons)

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT (python-jose)
- Bcrypt (passlib)
- SQLite/PostgreSQL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
