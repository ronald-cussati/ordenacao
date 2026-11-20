# gerar-pdf.ps1
# Atualiza os dados do site, gera o PDF da documentação e o ZIP do código.
# Uso (na pasta do projeto):   powershell -ExecutionPolicy Bypass -File scripts\gerar-pdf.ps1
#
# Precisa de: Node.js, Python 3 e Microsoft Edge (ou Chrome) instalados.

param([int]$Porta = 8123)

$ErrorActionPreference = "Stop"
$raiz = Split-Path $PSScriptRoot -Parent
Set-Location $raiz

# 1) CSV (programa em C) -> JSON (site e PDF)
node scripts/csv-para-json.mjs

# 2) ZIP com o código-fonte
New-Item -ItemType Directory -Force "public\downloads" | Out-Null
$zip = "public\downloads\codigo-ordenacao.zip"
if (Test-Path $zip) { Remove-Item $zip }
Compress-Archive -Path "public\codigo\*" -DestinationPath $zip
Write-Host "ZIP criado: $zip"

# 3) navegador para imprimir em PDF
$candidatos = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)
$navegador = $candidatos | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $navegador) { throw "Edge ou Chrome não encontrado." }

# 4) servidor local temporário (o PDF precisa carregar os dados via http)
$servidor = Start-Process -FilePath "python" -ArgumentList @("-m", "http.server", $Porta, "--bind", "127.0.0.1", "--directory", "public") -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2
try {
  $saida = Join-Path $raiz "public\downloads\Documentacao-Grupo-Ordenacao.pdf"
  $perfil = Join-Path $env:TEMP "perfil-pdf-ordenacao"
  # perfil novo a cada vez, senão o navegador reaproveita CSS/JS antigos do cache
  if (Test-Path $perfil) { Remove-Item $perfil -Recurse -Force -ErrorAction SilentlyContinue }
  Start-Process -FilePath $navegador -Wait -NoNewWindow -ArgumentList @(
    "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
    "--user-data-dir=`"$perfil`"", "--virtual-time-budget=25000",
    "--print-to-pdf=`"$saida`"", "http://127.0.0.1:$Porta/documentacao.html?print=1"
  ) 2>$null
  Write-Host "PDF criado: $saida"
}
finally {
  Stop-Process -Id $servidor.Id -Force -ErrorAction SilentlyContinue
}
