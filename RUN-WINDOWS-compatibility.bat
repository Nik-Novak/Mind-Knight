set "PATH=%CD%;%PATH%"
cd .\app
call npx -v
call node -v
@REM if not exist ".\node_modules" (
    call npx yarn install --network-timeout 100000
    call npx yarn prisma generate
@REM )
@REM if not exist ".\.next\BUILD_ID" (
@REM     @REM rmdir /s /q .\.next
@REM     @REM call npx yarn build:windows
@REM     @REM rmdir /s /q .\.next
@REM     call npx yarn build:windows
@REM )
call set COMPATIBILITY_MODE=true && npx yarn dev:windows
