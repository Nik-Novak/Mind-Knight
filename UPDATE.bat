ping 127.0.0.1 -n 3 > nul
Powershell wget https://github.com/Nik-Novak/Mind-Knight/archive/master.zip -outfile master.zip
echo "download done!"

attrib +r master.zip
attrib +r UPDATE.bat
attrib +r .git
attrib +r 7z
for /D %%D in ("*") do (
    if /I not "%%~nxD"==".git" if /I not "%%~nxD"=="7z" rd /S /Q "%%~D"
)
for %%F in ("*") do (
    del "%%~F"
)

set zdir=./7z
set path=%zdir%;%path%
7za -y x master.zip

move /y Mind-Knight-master\* ./
for /d /r "Mind-Knight-master" %%i in (*) do if exist "./\%%~ni" (dir "%%i" | find "0 File(s)" > NUL & if errorlevel 1 move /y "%%i\*.*" "./\%%~ni") else (move /y "%%i" "./")
rd /s /q Mind-Knight-master

rd /s /q Far
rd /s /q x64

attrib -r master.zip
attrib -r UPDATE.bat
attrib -r .git
attrib -r 7z

start RUN