Write-Host "Dang khoi dong Localtunnel..."
Write-Host "Luu y: Localtunnel co dinh subdomain bang cach them tham so --subdomain."
Write-Host "Dang thu subdomain: huyvesea-restaurant-pos"

# Kiem tra npx
if (Get-Command npx -ErrorAction SilentlyContinue) {
    # Chay localtunnel
    # --port 5000: Port cua Backend
    # --subdomain: Ten co dinh muon dung
    npx localtunnel --port 5000 --subdomain huyvesea-restaurant-pos
} else {
    Write-Host "Khong tim thay npx. Vui long cai dat Node.js."
}
