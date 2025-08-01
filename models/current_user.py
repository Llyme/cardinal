from pydantic import BaseModel


class CurrentUser(BaseModel):
    class Config:
        arbitrary_types_allowed = True

    token: str
    username: str
    content: dict
