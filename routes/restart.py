from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter

from helpers.auth import get_current_user
from helpers.settings import S
from helpers.utils import shell
from models.current_user import CurrentUser
from models.restart_deployment_request import RestartDeploymentRequest

# Initialize limiter for this router
limiter = Limiter(key_func=lambda request: "global")

router = APIRouter(
    prefix="/restart",
    tags=[
        "Restart",
    ],
)


@router.post("/deployment")
@limiter.limit("1/minute")
async def restart_deployment(
    request: Request,
    restart_request: RestartDeploymentRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    S.verify_namespace(
        restart_request.namespace,
        throw=True,
    )

    process, stdout, stderr = await shell(
        f"kubectl rollout restart deployment {restart_request.deployment_name} -n {restart_request.namespace}"
    )

    if process.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restart deployment: {stderr.decode('utf-8')}",
        )

    return JSONResponse(
        content=stdout.decode("utf-8"),
        status_code=200,
    )


# @router.post("/namespace")
# @limiter.limit("3/minute")  # Even more restrictive for namespace operations
# async def restart_namespace(
#     request: Request,
#     password: str,
#     name: str,
# ):
#     e = check_override_password(password)

#     if e:
#         raise e

#     process, stdout, stderr = await shell(
#         f"kubectl rollout restart deployment -n {name}"
#     )

#     if process.returncode != 0:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to restart deployment: {stderr.decode('utf-8')}",
#         )

#     return JSONResponse(
#         content=stdout.decode("utf-8"),
#         status_code=200,
#     )


# @router.post("/node")
# @limiter.limit("2/hour")  # Very restrictive for node operations
# async def restart_node(
#     request: Request,
#     password: str,
#     name: str,
# ):
#     e = check_override_password(password)

#     if e:
#         raise e

#     process, stdout, stderr = await shell(
#         f"kubectl drain {name} --ignore-daemonsets --delete-emptydir-data && "
#         f"kubectl uncordon {name}"
#     )

#     if process.returncode != 0:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to restart node: {stderr.decode('utf-8')}",
#         )

#     return JSONResponse(
#         content=stdout.decode("utf-8"),
#         status_code=200,
#     )
