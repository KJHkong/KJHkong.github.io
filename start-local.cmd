@echo off
setlocal
cd /d "%~dp0"
title Kong Jiahao - Local Website
echo Website: http://127.0.0.1:3000/
echo Keep this window open while viewing the website.
echo Press Ctrl+C to stop the server.
echo.
call npm run dev -- --hostname 127.0.0.1 --port 3000
echo.
echo The server has stopped. Check any message above before restarting.
pause
