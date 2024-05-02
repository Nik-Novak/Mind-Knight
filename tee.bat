@echo off
setlocal

if "%~1"=="" (
    echo Usage: %~nx0 filename
    exit /b 1
)

set "file=%~1"

:loop
set "line="
set /p "line="
if defined line (
    echo %line%
    echo %line% >> "%file%"
    goto :loop
)

endlocal
