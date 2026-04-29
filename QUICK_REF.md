# ⚡ AirControl - Quick Reference Guide

Fast lookups for common tasks and commands.

## 🚀 Getting Started

### Start Everything
```bash
# Terminal 1 - Backend
cd backend && bash run.sh

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🔧 Common Commands

### Backend Commands
```bash
# Run backend
cd backend && bash run.sh

# Activate venv only
source backend/venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload

# Test API
curl http://localhost:8000/api/health
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Docker Commands
```bash
# Build all services
docker-compose build

# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

---

## 📡 API Quick Reference

### Get All Flights
```bash
curl http://localhost:8000/api/flights
```

### Get Active Flights
```bash
curl http://localhost:8000/api/flights/active
```

### Create Flight
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

### Update Flight
```bash
curl -X PUT http://localhost:8000/api/flights/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "In Flight", "altitude": 10000}'
```

### Delete Flight
```bash
curl -X DELETE http://localhost:8000/api/flights/1
```

### Get Analytics
```bash
curl http://localhost:8000/api/analytics/summary
```

### Get Predictions
```bash
curl http://localhost:8000/api/delay-predictions
```

---

## 🎨 Customization

### Change Colors

**File**: `frontend/tailwind.config.js`
```javascript
colors: {
    aviation: {
        500: '#0ea5e9',      // Primary blue
        600: '#0284c7',      // Darker blue
    }
}
```

### Change Animation Speed

**File**: `frontend/src/components/HeroSection.tsx`
```typescript
// Adjust scroll trigger speed
scrub: 1,  // 1 = smooth, 0.5 = faster
```

### Change Refresh Rate

**File**: `backend/app/tasks.py`
```python
await asyncio.sleep(5)  # Change 5 to your preferred seconds
```

**File**: `frontend/src/components/FlightDashboard.tsx`
```typescript
const interval = setInterval(fetchFlights, 5000);  // 5000ms
```

### Change Frame Count

**File**: `frontend/src/lib/frameAnimationUtils.ts`
```typescript
export const FRAME_CONFIG = {
    totalFrames: 120,  // Change this number
};
```

---

## 🐛 Debugging

### Backend Debugging

**Enable SQL Logging** in `app/database.py`:
```python
engine = create_engine(DATABASE_URL, echo=True)
```

**View Logs**:
```bash
# Terminal running backend will show all logs
```

### Frontend Debugging

**Chrome DevTools**:
- Press F12 or Cmd+Option+I
- Console tab for errors
- Performance tab for FPS
- Network tab for API calls

**React DevTools**:
- Install React DevTools Chrome extension
- Inspect component props and state

---

## 📊 Database Management

### Reset Database
```bash
# Stop backend first
rm backend/flights.db
bash backend/run.sh  # Will recreate with defaults
```

### View Database

**Install SQLite CLI**:
```bash
brew install sqlite  # macOS
sudo apt install sqlite3  # Linux
```

**Query Database**:
```bash
sqlite3 backend/flights.db
> SELECT * FROM flights;
> .exit
```

---

## 📱 Responsive Testing

### Test Different Sizes

**Chrome DevTools**:
1. F12 to open DevTools
2. Ctrl+Shift+M for device toolbar
3. Select device or custom size

**Common Breakpoints**:
- Mobile: 375px, 768px
- Tablet: 1024px, 1280px
- Desktop: 1920px

---

## 🔄 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_token
```

### Backend (.env)
```
DATABASE_URL=sqlite:///./flights.db
API_PORT=8000
API_HOST=0.0.0.0
```

---

## 📦 File Locations

### Important Files
```
Backend:
- Main app: backend/app/main.py
- Database: backend/app/database.py
- Database file: backend/flights.db

Frontend:
- Main component: frontend/src/pages/index.tsx
- API client: frontend/src/lib/api.ts
- Styles: frontend/src/styles/globals.css

Frames:
- Location: public/frames/
- Pattern: frame_001.jpg, frame_002.jpg, etc.
```

---

## 🚨 Error Solutions

### "Port 8000 already in use"
```bash
lsof -i :8000
kill -9 <PID>
bash backend/run.sh
```

### "Port 3000 already in use"
```bash
lsof -i :3000
kill -9 <PID>
npm run dev
```

### "Cannot connect to backend"
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Check firewall
# Verify .env.local API_BASE_URL
```

### "Frames not loading"
```bash
# Check frames exist
ls public/frames/ | head

# Verify file naming
# Check browser console for 404 errors
```

### "Database corrupted"
```bash
# Backup current
cp backend/flights.db backend/flights.db.backup

# Reset
rm backend/flights.db
bash backend/run.sh
```

---

## 🎯 Performance Tips

### Frontend
- Use Chrome DevTools Lighthouse
- Check Performance tab for FPS
- Aim for 60 FPS on scroll
- Monitor network tab for requests

### Backend
- Check API response times (should be < 100ms)
- Monitor database query time
- Check CPU/memory usage
- Monitor background task

### Image Optimization
- Compress frames (80-90% quality)
- Use JPG format for photos
- Place in public/frames/
- Aim for 1920x1080 resolution

---

## 📚 Documentation Index

| File | Contains |
|------|----------|
| README.md | Project overview |
| SETUP.md | Installation guide |
| FEATURES.md | Detailed features |
| PROJECT_SUMMARY.md | What was built |
| QUICK_REF.md | This file |
| frontend/README.md | Frontend docs |
| backend/README.md | Backend docs |

---

## 🔗 Useful Links

### Documentation
- FastAPI: https://fastapi.tiangolo.com
- Next.js: https://nextjs.org
- Tailwind: https://tailwindcss.com
- GSAP: https://gsap.com
- Leaflet: https://leafletjs.com

### Tools
- VS Code: https://code.visualstudio.com
- Postman: https://www.postman.com
- SQLite: https://www.sqlite.org
- Docker: https://www.docker.com

---

## ✅ Pre-Deployment Checklist

- [ ] All files created successfully
- [ ] Backend running on :8000
- [ ] Frontend running on :3000
- [ ] API endpoints responding
- [ ] Flight data displaying
- [ ] Animations working smoothly
- [ ] Map showing correctly
- [ ] Charts rendering
- [ ] Scroll working smoothly
- [ ] No console errors

---

## 🎯 Next Actions

1. **First Time**:
   - Run setup.sh or follow SETUP.md
   - Test both servers
   - Explore the dashboard

2. **Customization**:
   - Change colors in tailwind.config.js
   - Modify API endpoints in backend/app/main.py
   - Add new components in frontend/src/components/

3. **Deployment**:
   - Build frontend: npm run build
   - Test production build
   - Deploy to Vercel/Netlify
   - Deploy backend to Heroku/AWS

4. **Enhancement**:
   - Add authentication
   - Migrate to PostgreSQL
   - Add WebSocket
   - Implement ML predictions

---

## 💡 Pro Tips

1. **Keep Two Terminals Open**: One for backend, one for frontend
2. **Use Chrome DevTools**: Essential for debugging
3. **Monitor Network Tab**: See API response times
4. **Check Console Regularly**: Catch errors early
5. **Read Error Messages**: They usually explain the issue
6. **Restart Both Servers**: If data doesn't sync
7. **Clear Browser Cache**: Ctrl+Shift+Delete (if images not loading)
8. **Use Swagger UI**: Visually test API at /docs

---

## 🆘 Help Resources

### If Stuck:
1. Check the error message in console/terminal
2. Search error in relevant README
3. Check FEATURES.md for implementation details
4. Review the source code (well-commented)
5. Check API docs at /docs

### Ask Questions About:
- How to customize colors
- How to add new flight data
- How to modify animation speed
- How to change refresh rate
- How to deploy

---

**Happy Coding! ✈️**

For detailed information, refer to the full documentation files.
