from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from helpers.auth import get_current_user
from models.current_user import CurrentUser
from models.health_response import HealthResponse

# Initialize limiter for this router
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/health",
    tags=[
        "Health",
    ],
)


@router.get(
    "/",
    response_model=HealthResponse,
)
@limiter.limit("100/minute")  # Generous limit for health checks
async def health(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
