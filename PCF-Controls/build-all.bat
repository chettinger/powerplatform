@echo off
setlocal enabledelayedexpansion

echo Building all PCF controls in the AIS PCF Control Library...
echo.

set "success_count=0"
set "fail_count=0"
set "controls="

:: Find all control directories
for /d %%d in (*) do (
    if exist "%%d\package.json" (
        if exist "%%d\%%d" (
            if not "%%d"=="node_modules" (
                if not "%%d"==".git" (
                    if not "%%d"=="Solutions" (
                        set "controls=!controls! %%d"
                    )
                )
            )
        )
    )
)

echo Found controls: %controls%
echo.

:: Build each control
for %%c in (%controls%) do (
    echo Building %%c...
    cd "%%c"
    
    call npm run build
    if !errorlevel! equ 0 (
        echo   ✓ %%c built successfully
        set /a success_count+=1
    ) else (
        echo   ✗ %%c build failed
        set /a fail_count+=1
    )
    
    cd ..
    echo.
)

:: Summary
echo =====================
echo Build Summary:
echo =====================
echo Successful: %success_count%
echo Failed: %fail_count%

if %fail_count% gtr 0 (
    echo.
    echo Some controls failed to build. Check the output above for details.
    exit /b 1
) else (
    echo.
    echo All controls built successfully! 🎉
    exit /b 0
)
