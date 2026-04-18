# Authentication endpoints for the local backend
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
import hashlib
import sqlite3
from main import get_db

# JWT Secret (in production, use environment variables)
JWT_SECRET = "your-secret-key-here"
JWT_ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str
    phoneNumber: Optional[str] = None

class TokenResponse(BaseModel):
    AccessToken: str
    RefreshToken: str
    ExpiresAt: Optional[str] = None
    user: Optional[Dict[str, Any]] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Simple hash verification (in production, use bcrypt)
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    # Simple hash (in production, use bcrypt)
    return hashlib.sha256(password.encode()).hexdigest()

def add_auth_endpoints(app: FastAPI):
    
    @app.post("/api/Account/login")
    async def login(login_data: LoginRequest):
        """Login endpoint"""
        try:
            conn = get_db()
            cursor = conn.cursor()
            
            # Check if user exists in student_data or teacher_data
            cursor.execute("SELECT * FROM student_data WHERE email = ? AND active = 1", (login_data.email,))
            user = cursor.fetchone()
            user_type = "student"
            
            if not user:
                cursor.execute("SELECT * FROM teacher_data WHERE email = ? AND active = 1", (login_data.email,))
                user = cursor.fetchone()
                user_type = "teacher"
            
            if not user:
                # Create a demo user for testing with the provided credentials
                if login_data.email == "yjmt469999@gmail.com" and login_data.password == "Vx9!pQ2@Lm#7wRz":
                    user_data = {
                        "id": 1,
                        "email": login_data.email,
                        "name": "Demo User",
                        "role": "Admin",
                        "firstName": "Demo",
                        "lastName": "User"
                    }
                    
                    access_token = create_access_token(data=user_data)
                    refresh_token = create_refresh_token(data=user_data)
                    
                    return TokenResponse(
                        AccessToken=access_token,
                        RefreshToken=refresh_token,
                        ExpiresAt=(datetime.utcnow() + timedelta(hours=24)).isoformat(),
                        user=user_data
                    )
                else:
                    raise HTTPException(status_code=401, detail="Invalid credentials")
            
            # For demo purposes, accept any password for existing users
            user_dict = dict(user)
            user_data = {
                "id": user_dict["id"],
                "email": user_dict["email"],
                "name": user_dict.get("name", f"{user_dict.get('firstName', '')} {user_dict.get('lastName', '')}"),
                "role": user_type.capitalize(),
                "firstName": user_dict.get("firstName", ""),
                "lastName": user_dict.get("lastName", ""),
                "userType": user_type
            }
            
            access_token = create_access_token(data=user_data)
            refresh_token = create_refresh_token(data=user_data)
            
            conn.close()
            
            return TokenResponse(
                AccessToken=access_token,
                RefreshToken=refresh_token,
                ExpiresAt=(datetime.utcnow() + timedelta(hours=24)).isoformat(),
                user=user_data
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/Account/me")
    async def get_current_user():
        """Get current user info"""
        # This is a simplified version - in production, you'd verify the JWT token
        return {
            "id": 1,
            "email": "yjmt469999@gmail.com",
            "name": "Demo User",
            "role": "Admin",
            "firstName": "Demo",
            "lastName": "User"
        }
    
    @app.post("/api/Account/register")
    async def register(register_data: RegisterRequest):
        """Register new user"""
        try:
            conn = get_db()
            cursor = conn.cursor()
            
            # Check if user already exists
            cursor.execute("SELECT id FROM student_data WHERE email = ?", (register_data.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
            
            cursor.execute("SELECT id FROM teacher_data WHERE email = ?", (register_data.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Insert new student (default role)
            hashed_password = get_password_hash(register_data.password)
            cursor.execute("""
                INSERT INTO student_data (email, name, firstName, lastName, phone, enrollment_date, active)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (
                register_data.email,
                f"{register_data.firstName} {register_data.lastName}",
                register_data.firstName,
                register_data.lastName,
                register_data.phoneNumber,
                datetime.now().isoformat()
            ))
            
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            user_data = {
                "id": user_id,
                "email": register_data.email,
                "name": f"{register_data.firstName} {register_data.lastName}",
                "role": "Student",
                "firstName": register_data.firstName,
                "lastName": register_data.lastName
            }
            
            access_token = create_access_token(data=user_data)
            refresh_token = create_refresh_token(data=user_data)
            
            return TokenResponse(
                AccessToken=access_token,
                RefreshToken=refresh_token,
                ExpiresAt=(datetime.utcnow() + timedelta(hours=24)).isoformat(),
                user=user_data
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/Account/refresh-token")
    async def refresh_token(refresh_token: str):
        """Refresh access token"""
        try:
            # Decode refresh token
            payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            if payload.get("type") != "refresh":
                raise HTTPException(status_code=401, detail="Invalid refresh token")
            
            # Create new access token
            user_data = {
                "id": payload.get("id"),
                "email": payload.get("email"),
                "name": payload.get("name"),
                "role": payload.get("role")
            }
            
            access_token = create_access_token(data=user_data)
            new_refresh_token = create_refresh_token(data=user_data)
            
            return TokenResponse(
                AccessToken=access_token,
                RefreshToken=new_refresh_token,
                ExpiresAt=(datetime.utcnow() + timedelta(hours=24)).isoformat(),
                user=user_data
            )
            
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
