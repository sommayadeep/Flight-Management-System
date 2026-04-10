from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import get_settings
from app.database import Base, engine
from app.routes import auth, flights, bookings, payments

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()
is_secure_frontend = str(settings.frontend_url).startswith("https://")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Premium Flight Booking Management System API",
    version=settings.api_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)


def init_database() -> None:
    """Create tables when enabled, without crashing service startup."""
    if not settings.auto_create_tables:
        logger.info("AUTO_CREATE_TABLES disabled; skipping metadata.create_all")
        return

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ensured successfully")
    except Exception as exc:
        logger.exception(f"Database initialization failed: {exc}")


@app.on_event("startup")
async def on_startup() -> None:
    init_database()

# Add SessionMiddleware (required for Authlib OAuth state)
app.add_middleware(
    SessionMiddleware, 
    secret_key=settings.secret_key,
    session_cookie="fms_session",
    same_site="none" if is_secure_frontend else "lax",
    https_only=is_secure_frontend
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# Include routers
app.include_router(auth.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(payments.router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": settings.app_name}
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            "message": f"Welcome to {settings.app_name}",
            "version": settings.api_version,
            "docs": "/api/docs",
            "redoc": "/api/redoc"
        }
    )

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.app_debug
    )
