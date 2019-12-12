# $ErrorActionPreference = "Stop";

[string[]]$items = Get-Content -Path win-cache-items.txt

$items | ForEach-Object -Process {
    tar -c -zf "$_.tar.gz" "$_"
}