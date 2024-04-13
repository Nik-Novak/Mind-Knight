@echo off

powershell.exe -Command ".\handle.exe $PWD | Select-String 'pid:' | ForEach-Object { $_ -replace '.*pid:\s*(\d+).*', '$1' }"