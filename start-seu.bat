@echo off
cd /d "%~dp0"
title SEU-OpenMAIC Launcher
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-seu.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Launcher exited with error code %errorlevel%.
    pause
)
