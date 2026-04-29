#!/bin/bash

# Flight Management System - Quick Start Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ✈️  AirControl - Flight Management System  ✈️          ║"
echo "║         Production-Level Full Stack Application           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Prerequisites Check:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python: $PYTHON_VERSION"
else
    echo -e "${YELLOW}✗${NC} Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check Node
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${YELLOW}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${YELLOW}✗${NC} npm not found. Please install npm"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Starting Backend Server:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend

# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

echo -e "${GREEN}✓${NC} Backend dependencies installed"

echo ""
echo -e "${BLUE}🎨 Setting Up Frontend:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ../frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take a moment)..."
    npm install -q
fi

echo -e "${GREEN}✓${NC} Frontend dependencies installed"

echo ""
echo -e "${YELLOW}📚 Project Structure:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✈️ AirControl/"
echo "├── 📁 backend/"
echo "│   ├── app/main.py          FastAPI Application"
echo "│   ├── app/database.py      SQLAlchemy & Models"
echo "│   ├── app/crud.py          Database Operations"
echo "│   ├── app/tasks.py         Background Simulation"
echo "│   ├── requirements.txt     Dependencies"
echo "│   └── run.sh              Setup & Run Script"
echo "├── 📁 frontend/"
echo "│   ├── src/components/     React Components"
echo "│   ├── src/pages/          Next.js Pages"
echo "│   ├── src/lib/            Utilities & API"
echo "│   ├── src/styles/         Tailwind CSS"
echo "│   ├── package.json        Dependencies"
echo "│   └── README.md           Frontend Docs"
echo "├── 📁 public/frames/       Animation Frames"
echo "├── 📄 README.md            Main Documentation"
echo "├── 📄 SETUP.md             Setup Instructions"
echo "└── 📄 docker-compose.yml   Docker Configuration"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║    🎉 Setup Complete! Ready to Launch 🎉                  ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${BLUE}🚀 To Start the Application:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend Server:${NC}"
echo "  cd backend"
echo "  bash run.sh"
echo "  ✓ Will start on http://localhost:8000"
echo "  ✓ API Docs at http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend Development:${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo "  ✓ Will start on http://localhost:3000"
echo ""

echo -e "${BLUE}🌐 Application URLs:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Frontend:        http://localhost:3000"
echo "  Backend API:     http://localhost:8000"
echo "  API Swagger:     http://localhost:8000/docs"
echo "  API ReDoc:       http://localhost:8000/redoc"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Main:      README.md"
echo "  Setup:     SETUP.md"
echo "  Frontend:  frontend/README.md"
echo "  Backend:   backend/README.md"
echo ""

echo -e "${YELLOW}💡 Tips:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  • Open 2 terminal windows - one for backend, one for frontend"
echo "  • Backend starts with real-time flight simulation"
echo "  • Frontend auto-refreshes flight data every 5 seconds"
echo "  • Scroll animations use 100+ pre-extracted frames"
echo "  • All data is in SQLite database (flights.db)"
echo ""

echo -e "${GREEN}✈️ Ready to fly! Happy tracking! ✈️${NC}"
echo ""
