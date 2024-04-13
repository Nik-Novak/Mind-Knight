@echo off

powershell.exe -Command ".\handle.exe $PWD | Select-String 'pid:' | Where-Object { $_ -notmatch 'explorer.exe' } | ForEach-Object { $_ -replace '.*pid:\s*(\d+).*', '$1' }"