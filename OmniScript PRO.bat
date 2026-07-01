@echo off
title Generation Imprint Starter
echo Starting Generation Imprint Workflow...

cd /d "%~dp0"

echo Opening browser...
start "" "http://localhost:3000"

echo Running dev server...
npm run dev

pause
