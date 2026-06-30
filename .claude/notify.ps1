Invoke-RestMethod `
    -Method Post `
    -Uri 'https://ntfy.sh/decisionos-ab13-8472' `
    -Headers @{ Title = 'DecisionOS'; Priority = '5'; Tags = 'tada,loudspeaker' } `
    -Body "IR task completed.`nReady for the next command." | Out-Null
