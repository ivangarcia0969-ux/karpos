$Alias = "vps-riopaila"
$RemoteDir = "/var/www/frutales"

Write-Host "Iniciando despliegue hacia el servidor '$Alias'..." -ForegroundColor Cyan

# Crear el directorio remoto si no existe
Write-Host "1. Preparando directorio en el servidor..."
ssh $Alias "mkdir -p $RemoteDir"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al conectar por SSH. Verifica tu configuración o clave SSH." -ForegroundColor Red
    exit 1
}

# Subir el código fuente
Write-Host "2. Subiendo el código al VPS (esto tomará unos minutos)..."
# Excluimos node_modules, .git y .next para que la transferencia sea rápida
# Tar es más rápido que scp directo para muchos archivos
tar -cf - --exclude=node_modules --exclude=.git --exclude=.next --exclude=dist . | ssh $Alias "tar -xf - -C $RemoteDir"

# Ejecutar docker compose en el servidor remoto
Write-Host "3. Levantando los contenedores de Producción..."
ssh $Alias "cd $RemoteDir && docker compose -f docker-compose.prod.yml up -d --build"

Write-Host "¡Despliegue completado con éxito!" -ForegroundColor Green
Write-Host "La app debería estar disponible en los puertos 3050 (Web) y 4050 (API)."
