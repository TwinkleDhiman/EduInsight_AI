@echo off
cd /d "%~dp0"
echo ==============================================
echo  Starting EduInsight AI Backend (FastAPI)...
echo ==============================================
if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in backend\venv!
    echo Please run: python -m venv venv and pip install -r requirements.txt
    pause
    exit /b 1
)
call venv\Scripts\activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
