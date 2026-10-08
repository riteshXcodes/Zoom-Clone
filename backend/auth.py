# from dotenv import load_dotenv

# load_dotenv()

# import os
# import httpx

# from fastapi import HTTPException, Request, status
# from clerk_backend_api import Clerk
# from clerk_backend_api.security.types import AuthenticateRequestOptions


# CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

# if not CLERK_SECRET_KEY:
#     raise RuntimeError(
#         "CLERK_SECRET_KEY is not configured"
#     )


# clerk = Clerk(
#     bearer_auth=CLERK_SECRET_KEY
# )


# async def get_current_user(request: Request):
#     try:
#         request_state = clerk.authenticate_request(
#             request,
#             AuthenticateRequestOptions(
#                 secret_key=CLERK_SECRET_KEY,
#                 accepts_token=["session_token"],
#             ),
#         )

#         if not request_state.is_signed_in:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Not authenticated",
#             )

#         return request_state

#     except HTTPException:
#         raise

#     except Exception as error:
#         print(
#             "Clerk authentication error:",
#             error
#         )

#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid authentication",
#         )


# async def authenticate_websocket_token(token: str):
#     """
#     Authenticate a Clerk session token received
#     through the WebSocket query string.
#     """

#     try:
#         # Clerk's authenticate_request expects a request-like
#         # object. Use a real httpx.Request instead of a custom
#         # fake request class.
#         request = httpx.Request(
#             method="GET",
#             url="https://zoom-clone-red-alpha.vercel.app/",
#             headers={
#                 "Authorization": f"Bearer {token}",
#             },
#         )

#         request_state = clerk.authenticate_request(
#             request,
#             AuthenticateRequestOptions(
#                 secret_key=CLERK_SECRET_KEY,
#                 accepts_token=["session_token"],
#             ),
#         )

#         print(
#             "WebSocket auth:",
#             request_state.is_signed_in
#         )

#         if not request_state.is_signed_in:
#             print(
#                 "WebSocket auth failed:",
#                 getattr(
#                     request_state,
#                     "reason",
#                     "Unknown reason"
#                 )
#             )
#             return None

#         return request_state

#     except Exception as error:
#         print(
#             "WebSocket Clerk authentication error:",
#             repr(error)
#         )
#         return None

from dotenv import load_dotenv

load_dotenv()

import os
import httpx

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
            repr(error)
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication",
        )


async def authenticate_websocket_token(token: str):
    """
    Authenticate Clerk session token received
    through WebSocket query parameter.
    """

    try:
        request = httpx.Request(
            method="GET",
            url="https://zoom-clone-red-alpha.vercel.app/",
            headers={
                "Authorization": f"Bearer {token}",
            },
        )

        request_state = clerk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                secret_key=CLERK_SECRET_KEY,
                accepts_token=["session_token"],
            ),
        )

        print(
            "WebSocket auth:",
            request_state.is_signed_in
        )

        if not request_state.is_signed_in:
            print(
                "WebSocket auth failed:",
                getattr(
                    request_state,
                    "reason",
                    "Unknown reason"
                )
            )
            return None

        return request_state

    except Exception as error:
        print(
            "WebSocket Clerk authentication error:",
            repr(error)
        )
        return None