set "PATH=%CD%;%PATH%"
cd .\app
call npx -v
call node -v
if not exist ".\node_modules" (
    call npx yarn install
)
start call npx yarn windows
timeout /t 5
start "" cmd /c "start http://localhost:3000 && taskkill /f /im cmd.exe"
pause
