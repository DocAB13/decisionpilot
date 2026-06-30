$raw = [Console]::In.ReadToEnd()
try {
    $j = $raw | ConvertFrom-Json
    if ($j.tool_input.command -match 'git\s+commit') {
        & (Join-Path $PSScriptRoot 'notify.ps1')
    }
} catch {}
