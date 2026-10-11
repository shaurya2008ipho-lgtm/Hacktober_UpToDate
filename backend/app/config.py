from pathlib import Path
import os

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
CSV_DIR = BACKEND_DIR / "data" / "csv"
DATABASE_URL = os.getenv("ACRM_DATABASE_URL", f"sqlite:///{(BACKEND_DIR / 'acrm.sqlite3').as_posix()}")
SECRET_KEY = os.getenv("ACRM_SECRET_KEY", "development-only-change-this-key-before-deployment")
TOKEN_TTL_SECONDS = int(os.getenv("ACRM_TOKEN_TTL_SECONDS", "28800"))
