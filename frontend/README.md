# AirControl - Flight Management System (Frontend)

A production-level flight management system with real-time tracking, cinematic scroll animations, and advanced analytics.

## 🎬 Features

- **Scroll-Driven Animation**: Cinematic frame-based animations using 100+ pre-extracted image frames
- **Real-Time Flight Dashboard**: Live flight updates with color-coded status indicators
- **Interactive Flight Tracking Map**: Leaflet-based map with real-time flight positions
- **Advanced Analytics**: Charts, predictions, and performance metrics
- **Glassmorphism UI**: Modern, premium design with blur effects and smooth transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Aviation Theme**: Professional navy and black color scheme with cyan accents

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation bar with glass effect
│   │   ├── HeroSection.tsx         # Hero with scroll animation
│   │   ├── FlightDashboard.tsx     # Flight cards and status
│   │   ├── FlightTracking.tsx      # Map and flight tracking
│   │   ├── Analytics.tsx           # Charts and predictions
│   │   ├── Map.tsx                 # Leaflet map component
│   │   └── Footer.tsx              # Footer component
│   ├── lib/
│   │   ├── api.ts                  # API client functions
│   │   └── frameAnimationUtils.ts  # Frame handling utilities
│   ├── pages/
│   │   ├── _app.tsx                # App wrapper
│   │   ├── _document.tsx           # Document setup
│   │   └── index.tsx               # Home page
│   └── styles/
│       └── globals.css             # Global styles and animations
├── public/
│   └── frames/                     # Animation frames
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Key Technologies

- **Next.js 14**: React framework
- **Tailwind CSS**: Utility-first CSS
- **GSAP + ScrollTrigger**: Scroll animations
- **Leaflet**: Map library
- **Recharts**: Data visualization
- **Axios**: HTTP client
- **Lucide React**: Icon library

## 🔗 API Integration

The frontend connects to the backend API at `http://localhost:8000/api`.

### Key API Endpoints Used:
- `GET /flights` - Fetch all flights
- `GET /flights/active` - Get active flights
- `GET /analytics/summary` - Get analytics data
- `GET /delay-predictions` - Get delay predictions

## 🎯 Performance Optimization

- **Lazy Loading**: Frame images are progressively loaded
- **Image Caching**: Utilized browser caching for frames
- **Component Optimization**: Memoization and selective re-renders
- **Bundle Optimization**: Code splitting and tree shaking

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🌈 Color Theme

- **Primary**: Aviation Blue (#0ea5e9)
- **Dark Background**: #030712
- **Accent**: Cyan (#06b6d4)
- **Success**: Green (#10b981)
- **Alert**: Red (#ef4444)

## 🛠️ Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## 📝 Notes

- Ensure the backend server is running before starting the frontend
- Frame animation requires images in `/public/frames/`
- Map functionality uses OpenStreetMap tiles (no API key required)

## 📄 License

MIT
