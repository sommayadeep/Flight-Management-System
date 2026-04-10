from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from typing import Optional, List
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from authlib.integrations.starlette_client import OAuth
from app.database import get_db
from app.schemas import UserCreate, UserLogin, TokenResponse, AuthResponse, UserResponse, GoogleMockRequest
from app.services import UserService
from app.security import SecurityUtils
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Initialize OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@router.get("/google")
async def google_login(request: Request):
    """
    Entry point for Google OAuth. Redirects to Google.
    """
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured on server (Missing Client ID/Secret)."
        )
    
    redirect_uri = settings.google_callback_url or str(request.url_for('google_callback'))
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Callback handler for Google OAuth.
    """
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")
    
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail="Could not retrieve user info from Google")

    email = user_info.get('email')
    name = user_info.get('name')
    
    # Get or create user
    user = UserService.get_user_by_email(db, email)
    if not user:
        user = UserService.create_user(db, UserCreate(
            name=name or "Google User",
            email=email,
            phone=None,
            password=SecurityUtils.generate_random_password() # New helper needed
        ))

    # Issue JWT
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = SecurityUtils.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    # Redirect to homepage with token as query param
    frontend_redirect_url = f"{settings.frontend_url}?token={access_token}"
    return RedirectResponse(url=frontend_redirect_url)

@router.post("/google/mock", response_model=AuthResponse)
async def google_mock_login(payload: GoogleMockRequest, db: Session = Depends(get_db)):
    """
    Mock Google login: creates or returns a user by email, issues JWT.
    Useful for local testing until real OAuth is wired.
    """
    user = UserService.get_user_by_email(db, payload.email)
    if not user:
        user = UserService.create_user(db, UserCreate(
            name=payload.name or "Google User",
            email=payload.email,
            phone=None,
            password="temp-google-pass"
        ))

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = SecurityUtils.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    return AuthResponse(
        token=access_token,
        user=UserResponse.model_validate(user)
    )

@router.post("/signup", response_model=AuthResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = UserService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    user = UserService.create_user(db, user_data)

    # Create token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = SecurityUtils.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    return AuthResponse(
        token=access_token,
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    # Authenticate user
    user = UserService.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Create token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = SecurityUtils.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    return AuthResponse(
        token=access_token,
        user=UserResponse.model_validate(user)
    )

@router.get("/validate", response_model=UserResponse)
async def validate_token(
    authorization: Optional[str] = Header(None), 
    token: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    """Validate token and return user. Supports Header or Query parameter."""
    actual_token = token
    
    if authorization:
        try:
            scheme, val = authorization.split()
            if scheme.lower() == "bearer":
                actual_token = val
        except (ValueError, AttributeError):
            pass

    if not actual_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token required"
        )

    payload = SecurityUtils.decode_token(actual_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = UserService.get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse.model_validate(user)
