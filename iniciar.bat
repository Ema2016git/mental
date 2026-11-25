@echo off
chcp 65001 >nul 2>&1
title Mi Diario Escolar + IA Local
color 0A

echo.
echo  ========================================
echo    Mi Diario Escolar + IA Local
echo  ========================================
echo    Configurando todo automaticamente...
echo  ========================================
echo.

:: Paso 1: Verificar que Ollama esta instalado
echo [1/5] Verificando que Ollama este instalado...
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Ollama no esta instalado.
    echo  Descargalo desde: https://ollama.com
    echo.
    pause
    exit /b 1
)
echo       OK - Ollama encontrado.
echo.

:: Paso 2: Detener instancias previas
echo [2/5] Deteniendo instancias previas...
taskkill /f /im ollama.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo       OK.
echo.

:: Paso 3: Configurar CORS
echo [3/5] Configurando CORS...
set OLLAMA_ORIGINS=*
set OLLAMA_HOST=0.0.0.0:11434
setx OLLAMA_ORIGINS "*" >nul 2>&1
setx OLLAMA_HOST "0.0.0.0:11434" >nul 2>&1
echo       OK - OLLAMA_ORIGINS=* configurado.
echo.

:: Paso 4: Iniciar Ollama y crear modelo
echo [4/5] Iniciando Ollama...
start /b ollama serve >nul 2>&1

echo       Esperando a que Ollama inicie...
:wait_loop
timeout /t 2 /nobreak >nul
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo       Esperando...
    goto wait_loop
)
echo       OK - Ollama esta corriendo.
echo.

echo       Creando modelo "mi-ia"...
ollama create mi-ia -f "%~dp0Modelfile"
if %errorlevel% neq 0 (
    echo       Descargando llama3.2...
    ollama pull llama3.2
    ollama create mi-ia -f "%~dp0Modelfile"
)
echo       OK - Modelo listo.
echo.

:: Paso 5: Iniciar servidor web y abrir navegador
echo [5/5] Iniciando servidor web...
start /b python -m http.server 8080 --directory "%~dp0" >nul 2>&1
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"
echo       OK - Abierto en http://localhost:8080
echo.

echo  ========================================
echo    Todo configurado correctamente!
echo.
echo    Abierto en: http://localhost:8080
echo    Pestana "Mi IA" para tu asistente.
echo.
echo    NO cierres esta ventana.
echo    Ollama y el servidor corren aqui.
echo  ========================================
echo.
echo  Presiona cualquier tecla para detener todo y salir...
pause >nul
taskkill /f /im ollama.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
