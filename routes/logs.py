from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from helpers.auth import get_current_user
from helpers.settings import S
from helpers.utils import shell
from models.current_user import CurrentUser

# Initialize limiter for this router
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/logs",
    tags=[
        "Logs",
    ],
)


@router.get("/{namespace}/{pod_name}")
@limiter.limit("20/minute")
async def logs(
    request: Request,
    namespace: str,
    pod_name: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    S.verify_namespace(
        namespace,
        throw=True,
    )

    process, stdout, stderr = await shell(
        f"kubectl logs {pod_name} -n {namespace} --timestamps"
    )

    if process.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=stderr.decode("utf-8"),
        )

    lines = stdout.decode("utf-8").splitlines()
    lines.reverse()

    return JSONResponse(
        content=lines,
        status_code=200,
    )
