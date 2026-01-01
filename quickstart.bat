@echo off
echo ==========================================
echo DocManager Django + React Setup
echo ==========================================
echo.

REM Backend setup
echo Setting up Django backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py migrate

echo Backend setup complete!
echo.

REM Frontend setup
cd ..\frontend
echo Setting up React frontend...

echo Installing Node dependencies...
call npm install

echo Frontend setup complete!
echo.

REM Final instructions
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo.
echo 1. Backend (Terminal 1):
echo    cd backend
echo    venv\Scripts\activate
echo    python manage.py runserver
echo.
echo 2. Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo Then open http://localhost:5173 in your browser
echo.
pause
