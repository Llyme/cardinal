from pydantic import BaseModel, Field


class RestartDeploymentRequest(BaseModel):
    namespace: str = Field(
        ...,
        description="Kubernetes namespace where the deployment is located",
    )
    deployment_name: str = Field(
        ...,
        description="Name of the deployment to restart",
    )
