@echo off
cd /d "%~dp0"
if exist "%USERPROFILE%\Desktop\mouse-assistant\.venv\Scripts\python.exe" (
  "%USERPROFILE%\Desktop\mouse-assistant\.venv\Scripts\python.exe" server.py --open
) else (
  py -3 server.py --open
)
pause
