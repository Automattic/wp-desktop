$ErrorActionPreference = "Stop";

[string[]]$items = Get-Content -Path win-cache-items.txt

$items | ForEach-Object -Process {
    $path = $_
    tar -pxzf "$path.tar.gz"
    Remove-Item -Path "$path.tar.gz"
}