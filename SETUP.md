# 🚀 AirControl - Complete Setup Guide

This guide will walk you through setting up and running the entire Flight Management System.

## ⏱️ Estimated Time: 15-20 minutes

## 📋 Prerequisites Check

Before starting, make sure you have:

```bash
# Check Python version
python3 --version  # Should be 3.8+

# Check Node.js version
node --version     # Should be 18+

# Check npm version
npm --version      # Should be 8+
```

If any are missing, install them first.

## 🔧 Step 1: Backend Setup

### 1.1 Navigate to Backend Directory

```bash
cd backend
```

### 1.2 Create Virtual Environment

```bash
# Create venv
python3 -m venv venv

# Activate venv
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate  # On Windows
```

### 1.3 Install Dependencies

```bash
pip install -r requirements.txt
```

Expected output:
```
Successfully installed fastapi-0.104.1 uvicorn-0.24.0 sqlalchemy-2.0.23 ...
```

### 1.4 Start Backend Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the provided script:
```bash
bash run.sh
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
✈️ Flight Management System API started
```

✅ **Backend is now running!**

- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎨 Step 2: Frontend Setup

### 2.1 Open New Terminal and Navigate to Frontend

```bash
cd frontend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will:
- Install React, Next.js, Tailwind, GSAP, etc.
- Create node_modules directory
- Take 3-5 minutes

Expected output:
```
added 500+ packages, and audited XXX packages
```

### 2.3 Start Development Server

```bash
npm run dev
```

Expected output:
```
> next dev
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled successfully
```

✅ **Frontend is now running!**

- URL: http://localhost:3000

## 🎯 Step 3: Verify Everything Works

### 3.1 Check Backend API

Open in browser or terminal:

```bash
# Terminal
curl http://localhost:8000/api/health

# Expected response
{"status":"healthy","service":"Flight Management System API"}
```

Or visit http://localhost:8000/docs

### 3.2 Check Frontend

Open browser and go to: http://localhost:3000

You should see:
- ✅ Navigation bar with AirControl logo
- ✅ Full-screen hero section with animation
- ✅ Flight dashboard with real-time data
- ✅ Interactive map
- ✅ Analytics charts

### 3.3 Test Real-Time Updates

1. Open the Flight Dashboard
2. Observe flight data updates every 5 seconds
3. Status, altitude, and position should change

### 3.4 Test Scroll Animation

1. Scroll down slowly from the hero section
2. Watch the frame-by-frame animation as you scroll
3. Smooth playback without lag

## 📊 Step 4: API Testing

### 4.1 Get All Flights

```bash
curl http://localhost:8000/api/flights
```

### 4.2 Get Analytics

```bash
curl http://localhost:8000/api/analytics/summary
```

### 4.3 Get Predictions

```bash
curl http://localhost:8000/api/delay-predictions
```

### 4.4 Create New Flight

```bash
curl -X POST http://localhost:8000/api/flights \
  -H "Content-Type: application/json" \
  -d '{
    "flight_number": "TEST123",
    "origin": "JFK",
    "destination": "LAX",
    "status": "Boarding",
    "latitude": 40.6413,
    "longitude": -73.7781,
    "altitude": 0,
    "speed": 0,
    "delay_minutes": 0
  }'
```

## 🎬 Step 5: Animation & Performance

### 5.1 Scroll Animation

The hero section contains frame-by-frame animation:
- Uses GSAP + ScrollTrigger
- 100+ frames from public/frames/
- Smooth performance with requestAnimationFrame

### 5.2 Real-Time Updates

Flight data updates every 5 seconds:
- Backend simulates flight movements
- Frontend auto-refreshes dashboard
- Map markers update in real-time

### 5.3 Performance Tips

- Check browser DevTools → Performance tab
- Should maintain 60 FPS
- Memory usage < 200MB

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Port already in use?
lsof -i :8000
kill -9 <PID>

# Python version issue?
python3 --version  # Ensure 3.8+

# Database error?
rm flights.db  # Delete and restart
```

### Frontend Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Port already in use?
lsof -i :3000
kill -9 <PID>
```

### Can't Connect Frontend to Backend

Check:
1. Backend is running on port 8000
2. CORS is enabled (should be by default)
3. API_BASE_URL in .env.local is correct

```bash
# Test connectivity
curl http://localhost:8000/api/health
```

### Frames Not Loading

1. Check if frames exist in public/frames/
2. Verify file naming: frame_001.jpg, frame_002.jpg, etc.
3. Check browser console for 404 errors

## 🔐 Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here_if_using_mapbox
```

### Backend (.env)

```
DATABASE_URL=sqlite:///./flights.db
API_PORT=8000
API_HOST=0.0.0.0
```

## 📦 Production Build

### Frontend Build

```bash
cd frontend
npm run build
npm run start
```

### Backend Production

```bash
cd backend
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

## 📊 File Structure Verification

Verify you have all key files:

### Backend
```bash
backend/
├── app/main.py ✅
├── app/database.py ✅
├── app/schemas.py ✅
├── app/crud.py ✅
├── app/tasks.py ✅
├── app/__init__.py ✅
├── requirements.txt ✅
├── run.sh ✅
└── README.md ✅
```

### Frontend
```bash
frontend/
├── src/components/
│   ├── Navbar.tsx ✅
│   ├── HeroSection.tsx ✅
│   ├── FlightDashboard.tsx ✅
│   ├── FlightTracking.tsx ✅
│   ├── Analytics.tsx ✅
│   ├── Map.tsx ✅
│   └── Footer.tsx ✅
├── src/lib/
│   ├── api.ts ✅
│   └── frameAnimationUtils.ts ✅
├── src/styles/globals.css ✅
├── src/pages/
│   ├── _app.tsx ✅
│   ├── _document.tsx ✅
│   └── index.tsx ✅
├── package.json ✅
├── next.config.js ✅
├── tailwind.config.js ✅
└── README.md ✅
```

### Frames
```bash
public/frames/
├── frame_001.jpg ✅
├── frame_002.jpg ✅
└── ... (100+ frames)
```

## ✅ Success Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Backend running on :8000
- [ ] Frontend running on :3000
- [ ] Can access http://localhost:3000
- [ ] Swagger API docs work at /docs
- [ ] Flight data displays in dashboard
- [ ] Map shows flight positions
- [ ] Scroll animation plays smoothly
- [ ] Data updates every 5 seconds

## 🎉 You're Done!

Congratulations! Your Flight Management System is now running.

### Next Steps

1. **Explore the Dashboard**: Check out all the features
2. **Test API**: Use /docs to test endpoints
3. **Customize**: Modify colors, data, components
4. **Deploy**: Deploy to production (Vercel + Heroku)

### Quick Commands Reference

```bash
# Terminal 1 - Backend
cd backend && bash run.sh

# Terminal 2 - Frontend
cd frontend && npm run dev

# Test API
curl http://localhost:8000/api/flights

# Build for production
npm run build
```

### Support Files

- Frontend Docs: frontend/README.md
- Backend Docs: backend/README.md
- Main Docs: README.md

---

**Happy flying! ✈️**

Need help? Check the README files or API documentation at http://localhost:8000/docs
