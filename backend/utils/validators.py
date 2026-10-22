from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str = Field(min_length=6)
    language: str = "en"
    caregiver_contact: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegimenDrugSchema(BaseModel):
    drug_name: str
    dosage: str
    frequency: str

class TbProfileCreate(BaseModel):
    treatment_center: str
    doctor_name: str
    treatment_start_date: date
    regimen: List[RegimenDrugSchema]

class DoseLogCreate(BaseModel):
    schedule_item_id: str
    status: str = Field(pattern="^(taken|missed)$")

class CheckinCreate(BaseModel):
    pass

class CheckinMessageAppend(BaseModel):
    content: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None
    caregiver_contact: Optional[str] = None
