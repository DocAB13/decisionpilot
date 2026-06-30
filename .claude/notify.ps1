Invoke-RestMethod `
    -Method Post `
    -Uri 'https://ntfy.sh/decisionos-ab13-8472' `
    -Headers @{ Title = 'DecisionOS'; Priority = 'default' } `
    -Body 'IR task completed. Ready for the next command.' | Out-Null
