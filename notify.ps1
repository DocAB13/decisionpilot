$wav = 'C:\Windows\Media\Windows Notify System Generic.wav'
$player = New-Object Media.SoundPlayer $wav
$player.PlaySync()
Start-Sleep -Milliseconds 400
$player.PlaySync()
$player.Dispose()

try {
    [void][Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
    [void][Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>DecisionOS</text><text>IR task completed. Ready for the next command.</text></binding></visual></toast>')
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Windows PowerShell').Show(
        [Windows.UI.Notifications.ToastNotification]::new($xml)
    )
} catch {
    try {
        Add-Type -AssemblyName System.Windows.Forms
        $n = New-Object System.Windows.Forms.NotifyIcon
        $n.Icon = [System.Drawing.SystemIcons]::Information
        $n.Visible = $true
        $n.ShowBalloonTip(2000, 'DecisionOS', 'IR task completed. Ready for the next command.', 'Info')
        Start-Sleep -Milliseconds 200
        $n.Dispose()
    } catch {}
}
