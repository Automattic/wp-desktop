@echo off

for /f %%a in ( 'git rev-parse @:./calypso' ) do set CURRENT_HASH=%%a

IF EXIST calypso-hash ( 
    for /f %%a in ( calypso-hash ) do set CASHED_HASH=%%a
    
    echo "Calypso cashed SHA: %CASHED_HASH%"
    echo "Calypso current SHA: %CURRENT_HASH%"

    IF "%CASHED_HASH%"=="%CURRENT_HASH%" (
        echo "Using built calypso from cache for SHA: %CASHED_HASH%"
    ) ELSE (
        rmdir calypso /s /q
        echo "Fetching calypso submodule for SHA: %CURRENT_HASH%"
        git submodule update --init --recursive
    ) 
) ELSE (
    rmdir calypso /s /q
    echo "Fetching calypso submodule for SHA: %CURRENT_HASH%"
    git submodule update --init --recursive
)