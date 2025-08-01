from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(
        ...,
        description="Health status",
    )
    timestamp: str = Field(
        ...,
        description="Current timestamp",
    )
