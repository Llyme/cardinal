from pydantic import BaseModel, Field


class RestartResponse(BaseModel):
    script_content: str = Field(
        ...,
        description="Generated bash script content",
    )
    filename: str = Field(
        ...,
        description="Suggested filename for the script",
    )
    generated_at: str = Field(
        ...,
        description="Timestamp when script was generated",
    )
