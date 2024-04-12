cd .\app
if not exist ".\node_modules" (
    call ..\npx.cmd --yes yarn install
)
start call ..\npx.cmd --yes yarn windows
timeout /t 5
start "" cmd /c "start http://localhost:3000 && taskkill /f /im cmd.exe"
pause
