# Server lokal harus sudah berjalan. Respons disimpan sebagai UTF-8 asli.
# Endpoint OCR wajib login guru/staf: salin nilai header Cookie dari DevTools (tab Network, permintaan ke situs ini
# setelah login) lalu jalankan:  .\cbt-ocr.ps1 -Cookie 'sb-...-auth-token=...'
param([string]$BaseUrl = 'http://127.0.0.1:3000', [string]$Cookie = '')
$ErrorActionPreference = 'Stop'
$cbtEvidence = Join-Path $PSScriptRoot '../docs/bukti-cbt-banksoal'
foreach ($cbtName in @('matematika', 'fisika', 'biologi', 'arab')) {
  $cbtImage = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $cbtEvidence ($cbtName + '.png'))))
  $cbtResponse = Invoke-WebRequest -UseBasicParsing -Method Post -Uri ($BaseUrl + '/api/cbt/ocr') `
    -Headers @{ Cookie = $Cookie } -ContentType application/json -Body (@{ imageDataUrl = 'data:image/png;base64,' + $cbtImage } | ConvertTo-Json -Compress) -TimeoutSec 140
  [IO.File]::WriteAllBytes((Join-Path $cbtEvidence ($cbtName + '-ocr.json')), $cbtResponse.RawContentStream.ToArray())
  Write-Output ($cbtName + ': HTTP ' + $cbtResponse.StatusCode)
}
