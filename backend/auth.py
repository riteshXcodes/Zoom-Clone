from dotenv import load_dotenv

load_dotenv()


import os

from fastapi import HTTPException, Request, status
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions


CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not CLERK_SECRET_KEY:
    raise RuntimeError(
        "CLERK_SECRET_KEY is not configured"
    )


clerk = Clerk(
    bearer_auth=CLERK_SECRET_KEY
)


async def get_current_user(request: Request):
    try:
        request_state = clerk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                secret_key=CLERK_SECRET_KEY,
                accepts_token=["session_token"],
            ),
        )

        if not request_state.is_signed_in:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )

        return request_state

    except HTTPException:
        raise

    except Exception as error:
        print(
            "Clerk authentication error:",
            error
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication",
        )
        
async def authenticate_websocket_token(token: str):
    class WebSocketRequest:
        def __init__(self, token: str):
            self.headers = {
                "authorization": f"Bearer {token}"
            }

    request = WebSocketRequest(token)

    try:
        request_state = clerk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                secret_key=CLERK_SECRET_KEY,
                accepts_token=["session_token"],
            ),
        )

        if not request_state.is_signed_in:
            return None

        return request_state

    except Exception as error:
        print(
            "WebSocket Clerk authentication error:",
            error
        )
        return None