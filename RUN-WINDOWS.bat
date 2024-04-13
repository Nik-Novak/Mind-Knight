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
call npx yarn start:windows
