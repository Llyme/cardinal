from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter

from helpers.auth import get_current_user
from helpers.settings import S
from helpers.utils import shell
from models.current_user import CurrentUser
from models.delete_pod_request import DeletePodRequest

# Initialize limiter for this router
limiter = Limiter(key_func=lambda request: "global")

router = APIRouter(
    prefix="/delete",
    tags=[
        "Delete",
    ],
)


@router.post("/pod")
@limiter.limit("1/minute")
async def delete_pod(
    request: Request,
    delete_request: DeletePodRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    S.verify_namespace(
        delete_request.namespace,
        throw=True,
    )

    process, stdout, stderr = await shell(
        f"kubectl delete pod {delete_request.pod_name} -n {delete_request.namespace}",
    )

    if process.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete pod: {stderr.decode('utf-8')}",
        )

    return JSONResponse(
        content=stdout.decode("utf-8"),
        status_code=200,
    )
