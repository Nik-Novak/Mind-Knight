attrib +r master.zip
attrib +r .git
attrib +r 7z

set zdir=./7z
set path=%zdir%;%path%
7za -y x master.zip

move /y Mind-Knight-master\* ./
for /d /r "Mind-Knight-master" %%i in (*) do if exist "./\%%~ni" (dir "%%i" | find "0 File(s)" > NUL & if errorlevel 1 move /y "%%i\*.*" "./\%%~ni") else (move /y "%%i" "./")
rd /s /q Mind-Knight-master

attrib -r master.zip
attrib -r .git
attrib -r 7z
@pause