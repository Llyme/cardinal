from fastapi import HTTPException
from pydantic_settings import BaseSettings, SettingsConfigDict

from helpers.constants import INCLUDED_NAMESPACES


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        alias_generator=lambda x: x.upper(),
        extra="allow",
    )

    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRATION_MINUTES: int = 60 * 24 * 7

    def verify_namespace(
        self,
        namespace: str,
        throw: bool,
    ):
        if namespace not in INCLUDED_NAMESPACES:
            e = HTTPException(
                status_code=400,
                detail="Namespace not allowed",
            )

            if throw:
                raise e

            return e


S = Settings()  # type: ignore
