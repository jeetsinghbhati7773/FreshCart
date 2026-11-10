@echo off
title ShopPilot AI Microservice (Port 8005)
echo ====================================================
echo   Starting ShopPilot AI Microservice (Port 8005)
echo ====================================================
cd /d "%~dp0ai-service"
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --port 8005
pause

