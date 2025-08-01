import asyncio

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from loguru import logger

from helpers.auth import get_current_user
from helpers.constants import INCLUDED_NAMESPACES
from helpers.deployment import Deployment
from helpers.pod import Pod
from helpers.settings import S
from helpers.utils import check_kubectl_available
from models.current_user import CurrentUser

router = APIRouter(
    tags=[
        "Root",
    ],
)


@router.get("/favicon.ico")
async def favicon():
    """Serve the favicon."""
    return FileResponse("templates/favicon.ico")


@router.get("/nodes")
async def get_nodes(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get list of available Kubernetes nodes (requires kubectl access).
    """
    try:
        process = await asyncio.create_subprocess_shell(
            "kubectl get nodes",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            shell=True,
        )

        stdout, _ = await asyncio.wait_for(
            process.communicate(),
            timeout=10,
        )

        if process.returncode == 0 and stdout:
            return JSONResponse(
                content=stdout.decode("utf-8").strip().split(),
                status_code=200,
            )
        else:
            # Fallback to demo data if kubectl fails
            return JSONResponse(
                content=[],
                status_code=204,
            )

    except Exception as e:
        # Fallback to demo data
        raise HTTPException(
            status_code=500,
            detail=f"Error getting nodes: {e}",
        )


@router.post("/exec")
async def exec(
    command: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            shell=True,
        )

        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=10,
        )

        stdout = stdout.decode("utf-8")
        stderr = stderr.decode("utf-8")

        return JSONResponse(
            content={
                "stdout": stdout,
                "stderr": stderr,
                "returncode": process.returncode,
            },
            status_code=200,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get("/namespaces")
async def get_namespaces(
    current_user: CurrentUser = Depends(get_current_user),
):
    """Get list of available Kubernetes namespaces from the cluster."""

    # Check if kubectl is available
    if not await check_kubectl_available():
        raise HTTPException(
            status_code=503,
            detail="kubectl is not available or not configured properly",
        )

    try:
        # Execute kubectl get namespaces command
        process = await asyncio.create_subprocess_shell(
            'kubectl get ns -o custom-columns=":metadata.name" --no-headers',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            shell=True,
        )

        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=10,
        )

        if process.returncode != 0:
            error_msg = stderr.decode("utf-8") if stderr else "Unknown error"

            raise HTTPException(
                status_code=500,
                detail=f"Failed to retrieve namespaces: {error_msg}",
            )

        # Parse the output - it's space-separated namespace names
        output = stdout.decode("utf-8").strip()

        namespaces = output.split()

        return JSONResponse(
            content=[
                namespace
                for namespace in namespaces
                if namespace in INCLUDED_NAMESPACES
            ],
            status_code=200,
        )

    except asyncio.TimeoutError:
        logger.error("kubectl command timed out")

        raise HTTPException(
            status_code=504,
            detail="Timeout while retrieving namespaces from cluster",
        )

    except Exception as e:
        logger.error(f"Unexpected error retrieving namespaces: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}",
        )


@router.get("/pods/{namespace}")
async def get_pods_from_namespace(
    namespace: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    S.verify_namespace(
        namespace,
        throw=True,
    )

    return JSONResponse(
        content=[pod.model_dump() for pod in await Pod.from_namespace(namespace)],
        status_code=200,
    )


@router.get("/pods/{namespace}/{deployment}")
async def get_pods_from_deployment(
    namespace: str,
    deployment: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    S.verify_namespace(
        namespace,
        throw=True,
    )

    return JSONResponse(
        content=[
            pod.model_dump() for pod in await Pod.from_deployment(namespace, deployment)
        ],
        status_code=200,
    )


@router.get("/deployments/{namespace}")
async def get_deployments(
    namespace: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    S.verify_namespace(
        namespace,
        throw=True,
    )

    return JSONResponse(
        content=[
            deployment.model_dump()
            for deployment in await Deployment.from_namespace(namespace)
        ],
        status_code=200,
    )
