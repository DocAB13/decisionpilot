Invoke-RestMethod `
    -Method Post `
    -Uri 'https://ntfy.sh/decisionos-ab13-8472' `
    -Headers @{ Title = 'DecisionOS'; Priority = '4'; Tags = 'tada' } `
    -Body "IR task completed.`nReady for the next command." | Out-Null
