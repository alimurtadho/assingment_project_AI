from fastapi import APIRouter, Depends
import schemas
from dependencies import get_current_active_user
from database import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user
