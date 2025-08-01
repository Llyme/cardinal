from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from helpers.auth import create_jwt_token, get_current_user, verify_jwt_token
from helpers.settings import S
from models.current_user import CurrentUser
from models.login_request import LoginRequest
from models.refresh_token_request import RefreshTokenRequest

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/login")
def root(
    request: LoginRequest,
):
    if request.username == S.ADMIN_USERNAME and request.password != S.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_jwt_token(
        request.username,
        S.JWT_SECRET_KEY,
        S.JWT_EXPIRATION_MINUTES,
    )
    refresh_token = create_jwt_token(
        request.username,
        S.JWT_REFRESH_SECRET_KEY,
        S.REFRESH_TOKEN_EXPIRATION_MINUTES,
    )

    return JSONResponse(
        content={
            "token": token,
            "refresh_token": refresh_token,
            "username": request.username,
        },
        status_code=200,
    )


@router.get("/me")
def get_me(
    current_user: CurrentUser = Depends(get_current_user),
):
    return JSONResponse(
        content={
            "username": current_user.username,
        },
        status_code=200,
    )


@router.post("/refresh")
def refresh_token(request: RefreshTokenRequest):
    content = verify_jwt_token(
        request.refresh_token,
        S.JWT_REFRESH_SECRET_KEY,
    )

    new_token = create_jwt_token(
        content["sub"],
        S.JWT_SECRET_KEY,
        S.JWT_EXPIRATION_MINUTES,
    )
    new_refresh_token = create_jwt_token(
        content["sub"],
        S.JWT_REFRESH_SECRET_KEY,
        S.REFRESH_TOKEN_EXPIRATION_MINUTES,
    )

    return JSONResponse(
        content={
            "token": new_token,
            "refresh_token": new_refresh_token,
        },
        status_code=200,
    )


# @router.post("/logout")
# def logout(
#     current_user: CurrentUser = Depends(get_current_user),
# ):
#     return JSONResponse(
#         content={
#             "message": "Successfully logged out",
#             "username": current_user.username,
#         },
#         status_code=200,
#     )
