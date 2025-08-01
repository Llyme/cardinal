from pydantic import BaseModel, Field


class DeletePodRequest(BaseModel):
    namespace: str = Field(
        ...,
        description="Kubernetes namespace where the pod is located",
    )
    pod_name: str = Field(
        ...,
        description="Name of the pod to delete",
    )
