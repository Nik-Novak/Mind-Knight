cd .\app
if not exist ".\node_modules" (
    call ..\npx --yes yarn install
    call ..\npx --yes yarn prisma generate
)
call ..\npx --yes yarn windows
pause
