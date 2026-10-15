@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 22 is required. Install Node.js 22.16.0 first.
 pause
 exit /b 1
)
if not exist "data\apna-demo.sqlite" (
 echo Creating synthetic example companies in data\apna-demo.sqlite ...
 call npm.cmd run demo
 if errorlevel 1 (
   echo Demo generation failed; review the error above.
   pause
   exit /b 1
 )
)
echo.
echo Open http://127.0.0.1:3001 in your browser.
echo Use owner@demo.apna.test and Demo@2026Safe! FOR LOCAL TEST ONLY.
echo This demo should NOT be deployed publicly.
echo.
call npm.cmd run demo:start
pause
