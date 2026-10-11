@echo off
setlocal
cd /d "%~dp0frontend"

if not exist "node_modules\vite\bin\vite.js" (
  echo Frontend packages are missing. Run npm install in this folder first, or run START_ACRM.bat.
  pause
  exit /b 1
)
call npm run dev
endlocal