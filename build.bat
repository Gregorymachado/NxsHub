@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: Configuração de Caminhos
set "ROOT=%~dp0"
set "BIN_DIR=%ROOT%build"
set "SRC_DIR=%ROOT%src"
set "TOOLS_DIR=%ROOT%tools"
set "RES_DIR=%ROOT%resources"

:menu
cls
color 05
echo.
echo    ███╗    ██╗██╗  ██╗███████╗
echo    ████╗  ██║╚██╗██╔╝██╔════╝
echo    ██╔██╗ ██║ ╚███╔╝ ███████╗
echo    ██║╚██╗██║ ██╔██╗ ╚════██║
echo    ██║ ╚████║██╔╝ ██╗███████║
echo    ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
echo      HUB ULTRA-LITE PRO BY NXS
echo.
echo [1] COMPILAR C++            [6] ABRIR PASTA PROJETO    [11] LIMPAR CACHE WEBVIEW
echo [2] RECOMPILAR PYTHON       [7] EXECUTAR NXSHUB         [12] VER LOGS (DEBUG)
echo [3] LIMPAR TUDO             [8] VS CODE                [13] INFO DO SISTEMA
echo [4] GIT PULL                [9] TESTAR SYNC (CMD)      [14] REINICIAR EXPLORER
echo [5] GERAR PORTÁTIL          [10] DEV MODE (F12 ON)      [15] BACKUP BANCO (DB)
echo.
echo [16] ABRIR MINECRAFT        [17] ABRIR BRAWL STARS     [18] MATAR PROCESSOS SYNC
echo [19] PING SUPABASE          [20] SAIR
echo.
set /p opt="Escolha uma opção: "

if "%opt%"=="1" goto build
if "%opt%"=="2" goto build_python
if "%opt%"=="3" goto clean
if "%opt%"=="4" goto git_sync
if "%opt%"=="5" goto portable
if "%opt%"=="6" goto open_folder
if "%opt%"=="7" goto run_app
if "%opt%"=="8" goto open_code
if "%opt%"=="9" goto test_sync
if "%opt%"=="10" goto dev_mode
if "%opt%"=="11" goto clean_cache
if "%opt%"=="12" goto view_logs
if "%opt%"=="13" goto sys_info
if "%opt%"=="14" goto restart_explorer
if "%opt%"=="15" goto backup_db
if "%opt%"=="16" goto open_mine
if "%opt%"=="17" goto open_brawl
if "%opt%"=="18" goto kill_sync
if "%opt%"=="19" goto ping_supa
if "%opt%"=="20" exit
goto menu

:build
cls
echo [!] Compilando NxsHub.exe...
echo [!] Verificando logs em build_cpp.log...
taskkill /F /IM NxsHub.exe /T >nul 2>&1
if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"

:: Tenta localizar o vcvarsall.bat nas Build Tools ou Community
set "VS_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"
if not exist "!VS_PATH!" set "VS_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat"
if not exist "!VS_PATH!" set "VS_PATH=C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"

if not exist "!VS_PATH!" (
    color 0C
    echo [ERRO] Compilador MSVC não encontrado! 
    echo Verifique se instalou o C++ Build Tools 2022.
    pause & goto menu
)

call "!VS_PATH!" x64 >nul 2>&1

:: AJUSTE REALIZADO: /I e /LIBPATH agora apontam para a pasta include local onde você colocou o wil e a lib
cl.exe /Zi /EHsc /nologo /std:c++17 /D NOMINMAX "%SRC_DIR%\main.cpp" /I "%SRC_DIR%\include" /Fo"%BIN_DIR%\\" /Fd"%BIN_DIR%\\" /link /LIBPATH:"%SRC_DIR%\include" User32.lib Shell32.lib Ole32.lib OleAut32.lib Advapi32.lib WebView2Loader.dll.lib Shlwapi.lib /OUT:NxsHub.exe > build_cpp.log 2>&1

if %ERRORLEVEL% EQU 0 (
    if exist "%TOOLS_DIR%\ResourceHacker.exe" ("%TOOLS_DIR%\ResourceHacker.exe" -open NxsHub.exe -save NxsHub.exe -action addskip -res "%RES_DIR%\icon.ico" -mask ICONGROUP,MAINICON, >nul 2>&1)
    del /f /q *.ilk *.pdb *.obj *.res >nul 2>&1
    echo [OK] C++ PRONTO!
    del build_cpp.log >nul 2>&1
) else ( 
    color 0C 
    echo [ERRO] Falha na compilação! Abrindo log de erros...
    start notepad build_cpp.log
)
pause & goto menu

:build_python
cls
echo [!] Recompilando Motor Python...
cd /d "%SRC_DIR%"
pyinstaller --onefile --noconsole --log-level ERROR sync.py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    move /y "dist\sync.exe" "..\" >nul 2>&1
    rd /s /q "build" >nul 2>&1 & rd /s /q "dist" >nul 2>&1 & del /f /q "sync.spec" >nul 2>&1
    echo [OK] MOTOR ATUALIZADO!
) else ( color 0C & echo [ERRO] Falha no Python. )
cd /d "%ROOT%" & pause & goto menu

:backup_db
cls
echo [!] Criando backup local dos dados...
if exist "src\sync_out.txt" copy /y "src\sync_out.txt" "backup_data_%date:~-4%-%date:~3,2%-%date:~0,2%.json" >nul
echo [OK] Backup realizado!
pause & goto menu

:open_mine
start minecraft:
goto menu

:open_brawl
echo [!] Abrindo MuMu Player e Brawl...
start "" "C:\Program Files\MuMuPlayer-12.0\shell\MuMuPlayer.exe" -p brawlstars
goto menu

:kill_sync
taskkill /F /IM sync.exe /T >nul 2>&1
echo [OK] Processos finalizados.
pause & goto menu

:ping_supa
cls
ping thupfvfoaeergqvmzvpo.supabase.co
pause & goto menu

:git_sync
cls & git pull origin main & pause & goto menu
:portable
cls & powershell Compress-Archive -Path "NxsHub.exe", "sync.exe", "src", "WebView2Loader.dll" -DestinationPath "NxsHub_Portable.zip" -Force & pause & goto menu
:open_folder
start . & goto menu
:run_app
start NxsHub.exe & goto menu
:open_code
code . & goto menu
:test_sync
cls & if exist "sync.exe" ( sync.exe ) & pause & goto menu
:dev_mode
reg add "HKCU\Software\Microsoft\Edge\WebView2\AdditionalBrowserArguments" /v "NxsHub" /t REG_SZ /d "--auto-open-devtools-for-tabs" /f >nul & pause & goto menu
:clean_cache
rd /s /q "NXS_CACHE" >nul 2>&1 & pause & goto menu
:view_logs
notepad sync_debug.log & goto menu
:sys_info
systeminfo | findstr /B /C:"OS Name" /C:"Total Physical Memory" & pause & goto menu
:restart_explorer
taskkill /f /im explorer.exe & start explorer.exe & goto menu

:clean
cls
taskkill /F /IM NxsHub.exe /T >nul 2>&1
del /f /q *.obj *.pdb *.ilk *.res *.exp *.lib *.exe *.log >nul 2>&1
rd /s /q "%BIN_DIR%" >nul 2>&1
rd /s /q "NXS_CACHE" >nul 2>&1
echo [OK] Limpo!
pause & goto menu