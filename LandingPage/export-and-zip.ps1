# Da Corrado - Export & ZIP Script (inkl. pre-built .next)

Write-Host "Da Corrado Export gestartet..." -ForegroundColor Cyan

$projectRoot = "C:\Users\Mario\Desktop\DaCorrado\nextjs"
$zipPath     = "C:\Users\Mario\Desktop\DaCorrado\dacorrado_deploy.zip"
$sqlOutput   = "$projectRoot\prisma\database.sql"
$tempDir     = "C:\Users\Mario\Desktop\DaCorrado\deploy_temp"

# -- 1. Datenbank exportieren --
Write-Host ""
Write-Host "Exportiere lokale Datenbank..." -ForegroundColor Yellow

$dbUser = "dacorrado"
$dbPass = "dacorrado1234"
$dbName = "dacorrado"

$dockerResult = docker exec dacorrado_mysql mysqldump -u $dbUser "-p$dbPass" $dbName 2>$null
$dockerResult | Out-File -FilePath $sqlOutput -Encoding UTF8
Write-Host "Datenbank exportiert." -ForegroundColor Green

# -- 2. ZIP erstellen (MIT .next, OHNE node_modules) --
Write-Host ""
Write-Host "Erstelle Deployment ZIP (inkl. fertig gebauter App)..." -ForegroundColor Yellow

if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# node_modules weglassen - werden auf Server frisch installiert
$exclude = @("node_modules", ".next", ".git", "export-and-zip.ps1")

Get-ChildItem -Path $projectRoot | Where-Object { $_.Name -notin $exclude } | ForEach-Object {
    $dest = Join-Path $tempDir $_.Name
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination $dest -Recurse
    } else {
        Copy-Item -Path $_.FullName -Destination $dest
    }
}

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath
Remove-Item $tempDir -Recurse -Force

$zipSizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "ZIP erstellt: $zipPath ($zipSizeMB MB)" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  NAECHSTE SCHRITTE:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ZIP hochladen via Hostinger File Manager" -ForegroundColor White
Write-Host "   Ziel: /home/u988021075/domains/pizzeria1140.at/" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ZIP entpacken" -ForegroundColor White
Write-Host ""
Write-Host "3. .env Datei anlegen" -ForegroundColor White
Write-Host ""
Write-Host "4. In Hostinger Node.js Manager:" -ForegroundColor White
Write-Host "   Application Root : /home/u988021075/domains/pizzeria1140.at" -ForegroundColor Yellow
Write-Host "   Start Command    : node_modules/.bin/next start" -ForegroundColor Yellow
Write-Host "   Node Version     : 20.x" -ForegroundColor Yellow
Write-Host "   Dann: npm install --legacy-peer-deps (einmalig)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   KEIN Build noetig - App ist bereits gebaut!" -ForegroundColor Green
Write-Host ""
