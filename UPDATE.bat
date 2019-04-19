Powershell wget https://github.com/Nik-Novak/Mind-Knight/archive/master.zip -outfile master.zip
echo "download done!"

attrib +r master.zip
del /s /q *
rmdir /s /q *
attrib -r master.zip