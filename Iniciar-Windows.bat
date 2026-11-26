@echo off
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 goto usepython
py -3 iniciar.py
goto finish
:usepython
python iniciar.py
:finish
pause
