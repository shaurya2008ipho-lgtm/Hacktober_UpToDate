from pydantic import BaseModel, Field, field_validator
from typing import Literal

class StudentIdentity(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    roll_no: str = Field(min_length=6, max_length=9)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return " ".join(value.strip().split())

    @field_validator("roll_no")
    @classmethod
    def clean_roll(cls, value: str) -> str:
        return value.strip().upper()

class PasswordSetup(StudentIdentity):
    password: str = Field(min_length=8, max_length=128)

class StudentLogin(StudentIdentity):
    password: str = Field(min_length=1, max_length=128)

class FeedbackCreate(BaseModel):
    subject: str
    category: Literal["academic", "non_academic"]
    message: str = Field(min_length=3, max_length=5000)

    @field_validator("message")
    @classmethod
    def clean_message(cls, value: str) -> str:
        return value.strip()

class MentalHealthNote(BaseModel):
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("message")
    @classmethod
    def clean_message(cls, value: str) -> str:
        return value.strip()
