# TODO: Exit if < 16GB RAM available.  
gcim Win32_OperatingSystem | % { "Total Visible Memory Size - $([int]($_.TotalVisibleMemorySize/1mb)) Gb" }


$configPath = "$env:AppData\Docker\settings.json"

$dockerConfig = Get-Content $configPath | ConvertFrom-Json
$dockerConfig | Add-Member NoteProperty "memoryMiB" 10240 -force
$dockerConfig | Add-Member NoteProperty "cpus" 4 -force
$dockerConfig | ConvertTo-Json -Depth 20 | Set-Content -Path $configPath