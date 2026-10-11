import csv
import random
from datetime import date, timedelta
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import Student, AttendanceRecord, Grade, Assignment, AssignmentSubmission
from .config import CSV_DIR

SUBJECT_FILES = {
    "Mathematics": "Maths.csv",
    "Physics": "Physics.csv",
    "Basics of Mechanical Engineering": "Mechanical.csv",
    "CSE": "Computer_Science.csv",
    "Communication Skills": "Communication_Skills.csv",
    "Ethics and Human Mindfulness": "Ethics_and_Human_Mindfulness.csv",
}
ATTENDANCE_START = date(2026, 8, 20)
ATTENDANCE_END = date(2026, 10, 10)


def normalise_name(value: str) -> str:
    return " ".join((value or "").strip().split()).casefold()


def class_dates() -> list[date]:
    days = []
    current = ATTENDANCE_START
    while current <= ATTENDANCE_END:
        if current.weekday() < 5:
            days.append(current)
        current += timedelta(days=1)
    # The provided workbook says 36 classes held per subject. Select exactly 36
    # weekday sessions from the requested time window (and leave Oct 10 as no class).
    return days[:36]


def read_subject_csv(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"Roll No", "Name", "Total Classes Held", "Classes Present"}
        if not required.issubset(set(reader.fieldnames or [])):
            raise ValueError(f"CSV {path.name} is missing one of the required columns: {sorted(required)}")
        records = []
        for row in reader:
            roll = (row.get("Roll No") or "").strip().upper()
            name = " ".join((row.get("Name") or "").strip().split())
            if not roll or not name:
                continue
            try:
                total = int(float(row.get("Total Classes Held", "0")))
                present = int(float(row.get("Classes Present", "0")))
            except ValueError:
                continue
            records.append({"roll_no": roll, "name": name, "total": max(total, 0), "present": min(max(present, 0), max(total, 0))})
        return records


def import_roster_and_attendance(db: Session) -> None:
    if not CSV_DIR.exists():
        raise FileNotFoundError(f"CSV data directory not found: {CSV_DIR}")

    all_subject_rows: dict[str, list[dict]] = {}
    roster: dict[str, str] = {}
    for subject, filename in SUBJECT_FILES.items():
        path = CSV_DIR / filename
        if not path.exists():
            raise FileNotFoundError(f"Required subject data file is missing: {path}")
        records = read_subject_csv(path)
        all_subject_rows[subject] = records
        for row in records:
            existing_name = roster.get(row["roll_no"])
            if existing_name and normalise_name(existing_name) != normalise_name(row["name"]):
                raise ValueError(f"Student name differs between CSV files for {row['roll_no']}")
            roster[row["roll_no"]] = row["name"]

    # Upsert roster names but never overwrite user password hashes.
    for roll_no, name in roster.items():
        student = db.get(Student, roll_no)
        if student is None:
            db.add(Student(roll_no=roll_no, name=name))
        else:
            student.name = name
    db.flush()

    # Rebuild demo attendance only if no attendance data exists; this makes startup idempotent
    # and prevents re-import from overwriting future teacher-entered attendance.
    if db.scalar(select(AttendanceRecord.id).limit(1)) is None:
        dates = class_dates()
        for subject, rows in all_subject_rows.items():
            for row in rows:
                total = row["total"]
                present = row["present"]
                session_dates = dates[:total]
                indices = list(range(len(session_dates)))
                random.Random(f"acrm-attendance|{row['roll_no']}|{subject}").shuffle(indices)
                present_indices = set(indices[:min(present, len(session_dates))])
                for idx, session_date in enumerate(session_dates):
                    db.add(AttendanceRecord(
                        roll_no=row["roll_no"], subject=subject, session_date=session_date,
                        status="present" if idx in present_indices else "absent"
                    ))

    if db.scalar(select(Grade.id).limit(1)) is None:
        for roll_no in roster:
            for subject in SUBJECT_FILES:
                # Grade data is intentionally demo-generated because the submitted CSVs contain attendance only.
                totals = [r for r in all_subject_rows[subject] if r["roll_no"] == roll_no]
                attended_pct = (totals[0]["present"] / totals[0]["total"] * 100) if totals and totals[0]["total"] else 0
                rng = random.Random(f"acrm-grade|{roll_no}|{subject}")
                score = round(max(28, min(98, 42 + attended_pct * 0.48 + rng.randint(-12, 12))), 1)
                db.add(Grade(roll_no=roll_no, subject=subject, assessment="Demo internal assessment", score=score, max_score=100, is_demo=True))

    if db.scalar(select(Assignment.id).limit(1)) is None:
        assignment_seed = {
            "Mathematics": [
                ("Linear Algebra Practice Set", "Matrices, rank, systems of equations and eigenvalue fundamentals.", date(2026, 10, 16)),
                ("Differential Calculus Worksheet", "Limits, continuity and applications of derivatives.", date(2026, 10, 23)),
            ],
            "Physics": [
                ("Oscillations Problem Brief", "Solve the assigned SHM and damped-oscillation problems.", date(2026, 10, 16)),
                ("Thermodynamics Short Report", "Summarise the first law and solve the numerical set.", date(2026, 10, 23)),
            ],
            "Basics of Mechanical Engineering": [
                ("Otto and Diesel Cycle Sheet", "Draw P-V diagrams and compare ideal cycle efficiency.", date(2026, 10, 16)),
                ("Engineering Drawing Exercise", "Submit dimensioned orthographic views for the given part.", date(2026, 10, 23)),
            ],
            "CSE": [
                ("C Programming Arrays Lab", "Write and test programs using 1D and 2D arrays.", date(2026, 10, 16)),
                ("Algorithm Trace Worksheet", "Trace loops, arrays and simple searching algorithms.", date(2026, 10, 23)),
            ],
            "Communication Skills": [
                ("Technical Summary", "Prepare a structured summary of the assigned technical passage.", date(2026, 10, 16)),
                ("Presentation Reflection", "Submit a short reflection on clarity and audience engagement.", date(2026, 10, 23)),
            ],
            "Ethics and Human Mindfulness": [
                ("Ethical Decision Case Study", "Analyse a case using stakeholders, duties and consequences.", date(2026, 10, 16)),
                ("Mindfulness Reflection Log", "Write a short, personal reflection on a mindful habit.", date(2026, 10, 23)),
            ],
        }
        for subject, items in assignment_seed.items():
            for title, description, due_date in items:
                db.add(Assignment(subject=subject, title=title, description=description, due_date=due_date, is_demo=True))
        db.flush()

    # Demo submission statuses are read-only from the student portal.
    if db.scalar(select(AssignmentSubmission.id).limit(1)) is None:
        assignments = db.scalars(select(Assignment)).all()
        for roll_no in roster:
            for assignment in assignments:
                seed = sum(ord(ch) for ch in f"{roll_no}|{assignment.subject}|{assignment.title}") % 10
                status = "submitted" if seed < 5 else ("late" if seed < 7 else "missing")
                db.add(AssignmentSubmission(roll_no=roll_no, assignment_id=assignment.id, status=status))

    db.commit()
