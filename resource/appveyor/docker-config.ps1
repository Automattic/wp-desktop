$configPath = "$env:AppData\Docker\settings.json"

$dockerConfig = Get-Content $configPath | ConvertFrom-Json
Write-Output "$dockerConfig"
$dockerConfig | Add-Member NoteProperty "memoryMiB" 10240 -force
$dockerConfig | ConvertTo-Json -Depth 20 | Set-Content -Path $configPath