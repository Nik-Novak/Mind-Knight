@echo off
set "PATH=%CD%;%PATH%"
cd .\app

call npx -v 2>&1 | tee.bat .\log\console.log
call node -v 2>&1 | tee.bat .\log\console.log

@REM if not exist ".\node_modules" (
    call npx yarn install -y --network-timeout 100000 2>&1 | tee.bat .\log\console.log
    call npx yarn prisma generate 2>&1 | tee.bat .\log\console.log
@REM )

if not exist ".\.next\BUILD_ID" (
    @REM rmdir /s /q .\.next
    @REM call npx yarn build:windows
    @REM rmdir /s /q .\.next
    call npx yarn build:windows 2>&1 | tee.bat .\log\console.log
)

call npx yarn start:windows 2>&1 | tee.bat .\log\console.log