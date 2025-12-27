$orderId = Read-Host "Enter Order ID to simulate payment for"
$amount = Read-Host "Enter Amount (default 50000)"
if ([string]::IsNullOrWhiteSpace($amount)) { $amount = "50000" }

$body = @{
    id = 12345
    gateway = "MBBank"
    transactionDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    accountNumber = "0368888888"
    code = "MBVCB.3278907687"
    content = "Thanh toan don $orderId"
    transferType = "in"
    transferAmount = [decimal]$amount
    accumulated = 5000000
    subAccount = $null
    referenceCode = "TEST_TRANS_" + (Get-Random)
    description = "Test Webhook"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/sepay/webhook" -Method Post -Body $body -ContentType "application/json"
Write-Host "`nFake Webhook sent for Order $orderId"
