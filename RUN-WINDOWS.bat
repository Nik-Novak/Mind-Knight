set "PATH=%CD%;%PATH%"
cd .\app
call npx -v
call node -v
REM if not exist ".\node_modules" (
    call npx yarn install
    call npx yarn prisma generate
REM )
REM if not exist ".\.next\BUILD_ID" (
    call npx yarn build:windows
    call npx yarn build:windows
REM )
call npx yarn start:windows
