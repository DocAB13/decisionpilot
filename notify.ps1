try {
    [Console]::Beep(800, 300)
} catch {
    (New-Object Media.SoundPlayer 'C:\Windows\Media\Windows Notify System Generic.wav').PlaySync()
}
