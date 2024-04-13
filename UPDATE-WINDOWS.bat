@echo off


REM Get the PID of OUR process
title mycmd
echo Getting current PID
for /f %%a in ('tasklist /v /fo csv ^| findstr /i "mycmd"') do (
    for /f "tokens=2 delims=," %%b in ("%%a") do (
        set PID=%%b
    )
)
rem THE MOST IMPORTANT LINE, REMOVES INVISIBLE QUOTES
set PID=%PID:"=%
echo The PID is: %PID%


REM URL of the zip file to download
set "URL=https://github.com/Nik-Novak/Mind-Knight/archive/master.zip"

REM Directory where you want to download and extract the zip file
set "DOWNLOAD_DIR=.\"

REM Temporary file to store the downloaded zip
set "TEMP_ZIP=%TEMP%\temp.zip"

REM Download the zip file
echo Downloading zip file...
powershell -Command "(New-Object Net.WebClient).DownloadFile('%URL%', '%TEMP_ZIP%')"

REM Unzip the contents to a temporary directory
echo Extracting zip file...
powershell -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%TEMP%\temp_unzip' -Force"


rem KILL ALL PROCESSES THAT ARENT US
setlocal enabledelayedexpansion
echo GET WriteLock PIDS
for /f "delims=" %%i in ('call GetWritelockPIDs.bat') do (
    if "%%i" neq "%PID%" (
        set "PIDS=!PIDS!,%%i"
    )
)
rem Remove leading comma and whitespace
set "PIDS=%PIDS:~1%"
rem Display the content of the PIDS variable
echo %PIDS%
for %%i in (%PIDS%) do (
    echo Terminating process with PID: %%i
    taskkill /PID %%i /F
)
endlocal


REM Debugging: Echo contents of download directory
echo Contents of download directory before cleanup:
dir "%DOWNLOAD_DIR%"

REM Clean up existing files in the download directory
echo Cleaning up existing files...
for /F "delims=" %%A in ('dir /B "%DOWNLOAD_DIR%"') do (
    if /I not "%%~nxA"=="UPDATE-WINDOWS.bat" (
        if /I not "%%~nxA"=="handle.exe" (
            if /I not "%%~nxA"=="getWritelockPIDs.bat" (
                del /q "%DOWNLOAD_DIR%\%%A"
            )
        )
    )
)

REM Remove any remaining subdirectories
for /D %%A in ("%DOWNLOAD_DIR%\*") do (
    rd /s /q "%%A"
)

REM Debugging: Echo contents of download directory after cleanup
echo Contents of download directory after cleanup:
dir "%DOWNLOAD_DIR%"


REM Debugging: Displaying contents of temporary unzip directory
echo Contents of temporary unzip directory:
dir "%TEMP%\temp_unzip\Mind-Knight-Master"

REM Debugging: Displaying contents of download directory before moving files
echo Contents of download directory before moving files:
dir "%DOWNLOAD_DIR%"

REM Move the contents from the temporary directory to the download directory
echo Moving files and directories to download directory...
xcopy /E /Y "%TEMP%\temp_unzip\Mind-Knight-master\*" "%DOWNLOAD_DIR%"

REM Debugging: Displaying contents of download directory after moving files
echo Contents of download directory after moving files:
dir "%DOWNLOAD_DIR%"


REM Clean up the temporary directories and files
echo Cleaning up temporary files...
rmdir /Q /S "%TEMP%\temp_unzip"
del /Q "%TEMP_ZIP%"



rem KILL ALL PROCESSES THAT ARENT US
setlocal enabledelayedexpansion
echo GET WriteLock PIDS
for /f "delims=" %%i in ('call GetWritelockPIDs.bat') do (
    if "%%i" neq "%PID%" (
        set "PIDS=!PIDS!,%%i"
    )
)
rem Remove leading comma and whitespace
set "PIDS=%PIDS:~1%"
rem Display the content of the PIDS variable
echo %PIDS%
for %%i in (%PIDS%) do (
    echo Terminating process with PID: %%i
    taskkill /PID %%i /F
)
endlocal


echo Done Updating.
echo Launching...
call .\RUN-WINDOWS.bat
cd ..
start call .\RUN-WINDOWS.bat
