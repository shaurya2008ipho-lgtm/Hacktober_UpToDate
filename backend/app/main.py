from contextlib import asynccontextmanager
from datetime import date, datetime
from typing import Annotated
import re
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session
from .config import TOKEN_TTL_SECONDS
from .database import Base, SessionLocal, engine, get_db
from .importer import SUBJECT_FILES, import_roster_and_attendance, normalise_name
from .models import Assignment, AssignmentSubmission, AttendanceRecord, Grade, InboxMessage, Student
from .schemas import FeedbackCreate, MentalHealthNote, PasswordSetup, StudentIdentity, StudentLogin
from .security import hash_password, issue_token, verify_password, verify_token

SUBJECTS = list(SUBJECT_FILES.keys())
ROLL_RE = re.compile(r"^26(BPH|BME)(\d{3})$")


def valid_roll_number(roll_no: str) -> bool:
    match = ROLL_RE.fullmatch((roll_no or "").strip().upper())
    if not match:
        return False
    group, digits = match.groups()
    number = int(digits)
    return (group == "BPH" and 1 <= number <= 50) or (group == "BME" and 91 <= number <= 125)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        import_roster_and_attendance(db)
    yield


app = FastAPI(
    title="ACRM | Anti Class Representative Motion API",
    description="Student attendance, academic progress, feedback and wellbeing check-in API for Section C.",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

bearer = HTTPBearer(auto_error=False)


def resolve_student(db: Session, identity: StudentIdentity) -> Student:
    roll_no = identity.roll_no.strip().upper()
    if not valid_roll_number(roll_no):
        raise HTTPException(status_code=422, detail="Invalid roll number. Use 26BPH001–26BPH050 or 26BME091–26BME125.")
    student = db.get(Student, roll_no)
    if not student:
        raise HTTPException(status_code=404, detail="This roll number is not present in the Section C roster.")
    if normalise_name(student.name) != normalise_name(identity.name):
        raise HTTPException(status_code=401, detail="The name and roll number do not match the Section C roster.")
    return student


def current_student(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: Session = Depends(get_db),
) -> Student:
    if not credentials:
        raise HTTPException(status_code=401, detail="Please log in to continue.")
    roll_no = verify_token(credentials.credentials)
    student = db.get(Student, roll_no)
    if not student:
        raise HTTPException(status_code=401, detail="This student account is no longer available.")
    return student


def subject_or_400(subject: str) -> str:
    if subject not in SUBJECTS:
        raise HTTPException(status_code=400, detail=f"Unknown subject. Choose one of: {', '.join(SUBJECTS)}")
    return subject


def student_payload(student: Student) -> dict:
    return {"roll_no": student.roll_no, "name": student.name, "section": "C"}


def attendance_stats(db: Session, roll_no: str, subject: str | None = None) -> dict:
    query = select(
        func.count(AttendanceRecord.id),
        func.sum(func.case((AttendanceRecord.status == "present", 1), else_=0)),
    ) if False else None
    base = select(AttendanceRecord.status).where(AttendanceRecord.roll_no == roll_no)
    if subject:
        base = base.where(AttendanceRecord.subject == subject)
    statuses = list(db.scalars(base).all())
    total = len(statuses)
    present = sum(1 for value in statuses if value == "present")
    percentage = round((present / total * 100), 1) if total else 0.0
    return {
        "classes_held": total,
        "classes_present": present,
        "classes_absent": total - present,
        "percentage": percentage,
        "shortage": percentage < 75,
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "application": "ACRM", "api_version": app.version}


@app.get("/api/subjects")
def get_subjects():
    return {"subjects": SUBJECTS}


@app.post("/api/auth/student/identify")
def identify_student(identity: StudentIdentity, db: Session = Depends(get_db)):
    student = resolve_student(db, identity)
    return {
        "setup_required": student.password_hash is None,
        "student": student_payload(student),
        "message": "Create a password for your first login." if student.password_hash is None else "Enter your password to continue.",
    }


@app.post("/api/auth/student/setup-password")
def setup_password(payload: PasswordSetup, db: Session = Depends(get_db)):
    student = resolve_student(db, payload)
    if student.password_hash is not None:
        raise HTTPException(status_code=409, detail="A password has already been created for this account. Please log in.")
    student.password_hash = hash_password(payload.password)
    db.commit()
    return {
        "access_token": issue_token(student.roll_no),
        "token_type": "bearer",
        "expires_in": TOKEN_TTL_SECONDS,
        "student": student_payload(student),
    }


@app.post("/api/auth/student/login")
def login_student(payload: StudentLogin, db: Session = Depends(get_db)):
    student = resolve_student(db, payload)
    if student.password_hash is None:
        raise HTTPException(status_code=409, detail="PASSWORD_SETUP_REQUIRED: create your password first.")
    if not verify_password(payload.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
    return {
        "access_token": issue_token(student.roll_no),
        "token_type": "bearer",
        "expires_in": TOKEN_TTL_SECONDS,
        "student": student_payload(student),
    }


@app.get("/api/student/me")
def get_me(student: Student = Depends(current_student)):
    return student_payload(student)


@app.get("/api/student/overview")
def get_overview(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    subject_stats = []
    all_present = 0
    all_held = 0
    for subject in SUBJECTS:
        stats = attendance_stats(db, student.roll_no, subject)
        all_present += stats["classes_present"]
        all_held += stats["classes_held"]
        subject_stats.append({"subject": subject, **stats})
    overall = round(all_present / all_held * 100, 1) if all_held else 0.0
    return {
        "student": student_payload(student),
        "overall": {"classes_held": all_held, "classes_present": all_present, "percentage": overall, "shortage": overall < 75},
        "subjects": subject_stats,
        "attendance_window": {"from": "2026-08-20", "through": "2026-10-10"},
    }


@app.get("/api/student/attendance")
def get_attendance(
    subject: str = Query(...),
    year: int = Query(2026, ge=2020, le=2100),
    month: int = Query(10, ge=1, le=12),
    student: Student = Depends(current_student),
    db: Session = Depends(get_db),
):
    subject = subject_or_400(subject)
    from calendar import monthrange
    start = date(year, month, 1)
    end = date(year, month, monthrange(year, month)[1])
    rows = db.scalars(select(AttendanceRecord).where(
        AttendanceRecord.roll_no == student.roll_no,
        AttendanceRecord.subject == subject,
        AttendanceRecord.session_date >= start,
        AttendanceRecord.session_date <= end,
    ).order_by(AttendanceRecord.session_date)).all()
    stats = attendance_stats(db, student.roll_no, subject)
    return {
        "subject": subject,
        "year": year,
        "month": month,
        "classes_held": stats["classes_held"],
        "classes_present": stats["classes_present"],
        "classes_absent": stats["classes_absent"],
        "percentage": stats["percentage"],
        "shortage": stats["shortage"],
        "days": [{"date": row.session_date.isoformat(), "status": row.status} for row in rows],
    }


@app.get("/api/student/grades")
def get_grades(
    subject: str | None = Query(default=None),
    student: Student = Depends(current_student),
    db: Session = Depends(get_db),
):
    query = select(Grade).where(Grade.roll_no == student.roll_no)
    if subject:
        query = query.where(Grade.subject == subject_or_400(subject))
    rows = db.scalars(query.order_by(Grade.subject)).all()
    return {"grades": [{
        "id": row.id, "subject": row.subject, "assessment": row.assessment,
        "score": row.score, "max_score": row.max_score, "is_demo": row.is_demo,
    } for row in rows], "is_demo": any(row.is_demo for row in rows)}


@app.get("/api/student/assignments")
def get_assignments(
    subject: str | None = Query(default=None),
    student: Student = Depends(current_student),
    db: Session = Depends(get_db),
):
    query = select(Assignment, AssignmentSubmission.status).join(
        AssignmentSubmission, AssignmentSubmission.assignment_id == Assignment.id
    ).where(AssignmentSubmission.roll_no == student.roll_no)
    if subject:
        query = query.where(Assignment.subject == subject_or_400(subject))
    rows = db.execute(query.order_by(Assignment.due_date, Assignment.subject)).all()
    return {"assignments": [{
        "id": assignment.id,
        "subject": assignment.subject,
        "title": assignment.title,
        "description": assignment.description,
        "due_date": assignment.due_date.isoformat(),
        "status": submission_status,
        "is_demo": assignment.is_demo,
    } for assignment, submission_status in rows]}


@app.post("/api/student/feedback", status_code=201)
def submit_feedback(
    payload: FeedbackCreate,
    student: Student = Depends(current_student),
    db: Session = Depends(get_db),
):
    subject = subject_or_400(payload.subject)
    message = InboxMessage(
        roll_no=student.roll_no,
        student_name=student.name,
        subject=subject,
        category="feedback",
        message=f"Type: {payload.category.replace('_', ' ').title()}\n\n{payload.message}",
        priority="normal",
        status="new",
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"ok": True, "message_id": message.id, "message": "Your message has been saved to the ACRM teacher-inbox queue."}


@app.post("/api/student/mental-health/alert", status_code=201)
def create_mental_health_alert(student: Student = Depends(current_student), db: Session = Depends(get_db)):
    message = InboxMessage(
        roll_no=student.roll_no,
        student_name=student.name,
        subject=None,
        category="mental_health_alert",
        message="CHECK-IN REQUESTED — the student has asked for a wellbeing follow-up. Student note is pending.",
        priority="high",
        status="new",
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"ok": True, "alert_id": message.id, "message": "Your check-in alert has been recorded for the teacher inbox."}


@app.post("/api/student/mental-health/{alert_id}/note")
def add_mental_health_note(
    alert_id: int,
    payload: MentalHealthNote,
    student: Student = Depends(current_student),
    db: Session = Depends(get_db),
):
    message = db.get(InboxMessage, alert_id)
    if not message or message.roll_no != student.roll_no or message.category != "mental_health_alert":
        raise HTTPException(status_code=404, detail="The wellbeing check-in could not be found.")
    message.message += f"\n\nStudent note: {payload.message}"
    message.status = "new"
    db.commit()
    return {"ok": True, "message": "Your note has been added to the existing teacher alert."}
