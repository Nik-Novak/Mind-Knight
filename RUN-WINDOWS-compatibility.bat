set "PATH=%CD%;%PATH%"
cd .\app
call npx -v
call node -v
if not exist ".\node_modules" (
    call npx yarn install --network-timeout 100000
    call npx yarn prisma generate
)
@REM if not exist ".\.next\BUILD_ID" (
@REM     @REM rmdir /s /q .\.next
@REM     @REM call npx yarn build:windows
@REM     @REM rmdir /s /q .\.next
@REM     call npx yarn build:windows
@REM )
call npx yarn dev:windows
