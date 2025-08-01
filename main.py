from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from helpers.utils import clean_secret_directory
from routes import auth, delete, health, logs, restart, root

clean_secret_directory()

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

# FastAPI app initialization
app = FastAPI(
    title="Cardinal",
    description="Cardinal is a tool for managing Kubernetes clusters.",
    version="0.0.1",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Add rate limiting state and error handler
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,  # type: ignore
)

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(root.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(restart.router, prefix="/api")
app.include_router(delete.router, prefix="/api")
app.include_router(logs.router, prefix="/api")

app.mount(
    "/static",
    StaticFiles(directory="screen/_next/static"),
    name="static",
)
app.mount(
    "/",
    StaticFiles(directory="screen", html=True),
    name="frontend",
)
