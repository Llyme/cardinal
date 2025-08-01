from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from helpers.settings import S
from models.current_user import CurrentUser

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    content = verify_jwt_token(
        credentials.credentials,
        S.JWT_SECRET_KEY,
    )

    return CurrentUser(
        token=credentials.credentials,
        username=content.get("sub") or "",
        content=content,
    )


def create_jwt_token(
    username: str,
    secret_key: str,
    expiration_minutes: int,
):
    return jwt.encode(
        {
            "sub": username,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=expiration_minutes),
            "iat": datetime.now(timezone.utc),
        },
        secret_key,
        algorithm=S.JWT_ALGORITHM,
    )


def verify_jwt_token(token: str, secret_key: str) -> dict:
    try:
        return jwt.decode(
            token,
            secret_key,
            algorithms=[S.JWT_ALGORITHM],
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )
