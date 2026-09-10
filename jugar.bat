@echo off
REM ============================================================
REM  Figuras - Matematica Capitulo 10
REM  Doble clic aqui para jugar. No necesita internet.
REM
REM  A diferencia del juego de ingles, este NO fuerza Microsoft Edge:
REM  alla la prueba era auditiva y hacia falta la voz neuronal en
REM  ingles. Aqui el contenido es visual, asi que sirve cualquier
REM  navegador moderno.
REM ============================================================
cd /d "%~dp0"

REM --- Preparar el juego si hace falta (solo la primera vez) ---
if not exist "dist\index.html" (
  echo.
  echo   Preparando el juego por primera vez...
  echo.

  where npm >nul 2>nul
  if errorlevel 1 (
    echo   [ERROR] Falta Node.js en este equipo.
    echo   Instalalo desde https://nodejs.org y vuelve a intentar.
    echo.
    pause
    exit /b 1
  )

  if not exist "node_modules" call npm install
  call npm run build

  if not exist "dist\index.html" (
    echo.
    echo   [ERROR] No se pudo preparar el juego.
    pause
    exit /b 1
  )
)

start "" "%~dp0dist\index.html"
