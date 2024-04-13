set "PATH=%CD%;%PATH%"
cd .\app
call npx -v
call node -v
if not exist ".\node_modules" (
    call npx yarn install
    call npx yarn prisma generate
)
if not exist ".\.next\BUILD_ID" (
    @REM rmdir /s /q .\.next
    @REM call npx yarn build:windows
    @REM rmdir /s /q .\.next
    call npx yarn build:windows
)
call npx yarn start:windows
