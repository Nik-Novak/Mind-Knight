set "PATH=%CD%;%PATH%"
cd .\app
call npx -v
call node -v
if not exist ".\node_modules" (
    call npx yarn install
)
if not exist ".\.next\BUILD_ID" (
    call npx yarn build:windows
)
start call npx yarn start:windows
timeout /t 5
start "" cmd /c "start http://localhost:3000 && taskkill /f /im cmd.exe"
pause
