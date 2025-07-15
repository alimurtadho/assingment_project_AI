from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
from dependencies import get_current_active_user, get_db
from database import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
async def update_profile(
    profile_update: schemas.UpdateProfile,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update current user profile."""
    from auth import update_user_profile

    updated_user = update_user_profile(db, current_user, profile_update)
    return updated_user


@router.post("/change-password", response_model=schemas.MessageResponse)
async def change_password(
    change_password: schemas.ChangePassword,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Change user password."""
    from auth import change_user_password

    change_user_password(db, current_user, change_password)
    return {"message": "Password changed successfully"}
