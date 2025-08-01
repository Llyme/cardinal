import json

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from helpers.auth import get_current_user
from helpers.utils import shell
from models.current_user import CurrentUser

# Initialize limiter for this router
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/nodes",
    tags=[
        "Nodes",
    ],
)


@router.get("/")
@limiter.limit("20/minute")
async def all(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
):
    process, stdout, stderr = await shell(
        "kubectl get nodes -o json",
    )

    if process.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=stderr.decode("utf-8"),
        )

    return JSONResponse(
        content=json.loads(stdout.decode("utf-8")),
        status_code=200,
    )
