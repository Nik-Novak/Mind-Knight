set "PATH=%CD%;%PATH%"
cd .\app
call npx -v
call node -v
@REM if not exist ".\node_modules" (
    call npx yarn install --network-timeout 100000
    call npx yarn prisma generate
@REM )
if not exist ".\.next\BUILD_ID" (
    @REM rmdir /s /q .\.next
    @REM call npx yarn build:windows
    @REM rmdir /s /q .\.next
    call npx yarn build:windows
)
call npx yarn start:windows
