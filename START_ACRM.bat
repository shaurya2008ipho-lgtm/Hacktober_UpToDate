@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo   ACRM - Anti Class Representative Motion
echo   Full-stack Section C student + teacher portals
echo ============================================================

echo Checking prerequisites...
where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python was not found. Install Python 3.11+ and enable "Add Python to PATH".
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found. Install Node.js 20+.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js with npm included.
  pause
  exit /b 1
)

if not exist "backend\.venv\Scripts\python.exe" (
  echo Creating backend virtual environment...
  python -m venv "backend\.venv"
  if errorlevel 1 goto :fail
)

echo Installing / verifying Python dependencies...
"backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
if errorlevel 1 goto :fail

echo Installing frontend packages if needed...
if not exist "frontend\node_modules\vite\bin\vite.js" (
  pushd "frontend"
  call npm install
  if errorlevel 1 (
    popd
    goto :fail
  )
  popd
)

if not exist "backend\acrm.sqlite3" echo A fresh local database will be created on first startup.
echo Starting FastAPI backend and Vite frontend...
start "ACRM FastAPI Backend" /D "%~dp0backend" "%~dp0backend\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
start "ACRM Vite Frontend" /D "%~dp0frontend" cmd /k npm run dev

timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:5173"
echo.
echo ACRM is starting in two terminal windows.
echo Website: http://127.0.0.1:5173
echo API docs: http://127.0.0.1:8000/docs
echo Keep both service windows open while using ACRM.
echo.
pause
endlocal
exit /b 0

:fail

echo.
echo Setup failed. Review the error above, check your internet connection, and try again.
pause
endlocal
exit /b 1