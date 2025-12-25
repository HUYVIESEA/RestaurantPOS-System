# =====================================================
# SMART ORDER - AUTO EXPORT SOURCE CODE SCRIPT
# Version: 1.0
# Date: 2025-12-23
# Author: Hoàng Việt Huy
# =====================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SMART ORDER - SOURCE CODE EXPORT SCRIPT         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseDir = "c:\Users\hhuy0\source\repos\HUYVESEA0\RestaurantPOS-System"
$outputDir = "$baseDir\Smart Order Nhà Hàng_Hoàng Việt Huy"

# Check if output directory exists
if (-not (Test-Path $outputDir)) {
    Write-Host "❌ Output directory not found: $outputDir" -ForegroundColor Red
    Write-Host "Creating directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "✓ Directory created" -ForegroundColor Green
}

Write-Host "📁 Output Directory: $outputDir" -ForegroundColor Cyan
Write-Host ""

# Temporary folders to exclude
$excludeAndroid = @("build", ".gradle", ".idea", "app\build")
$excludeAPI = @("bin", "obj", ".vs")
$excludeWeb = @("node_modules", "dist", ".vite")
$excludeDesktop = @("bin", "obj", ".vs")

# Function to create archive with exclusions
function Export-SourceCode {
    param(
        [string]$SourcePath,
        [string]$OutputFile,
        [string]$Name,
        [string[]]$ExcludePaths
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "📦 Exporting: $Name" -ForegroundColor Yellow
    Write-Host "   Source: $SourcePath" -ForegroundColor Gray
    Write-Host "   Output: $OutputFile" -ForegroundColor Gray
    
    # Check if source exists
    if (-not (Test-Path $SourcePath)) {
        Write-Host "   ❌ Source not found!" -ForegroundColor Red
        return $false
    }
    
    Try {
        # Get all files except excluded
        $files = Get-ChildItem -Path $SourcePath -Recurse -File | Where-Object {
            $file = $_
            $exclude = $false
            
            foreach ($pattern in $ExcludePaths) {
                if ($file.FullName -like "*\$pattern\*") {
                    $exclude = $true
                    break
                }
            }
            
            -not $exclude
        }
        
        # Count files
        $fileCount = $files.Count
        Write-Host "   📄 Files to archive: $fileCount" -ForegroundColor Cyan
        
        # Create temporary directory structure
        $tempDir = "$env:TEMP\SmartOrder_Export_$(Get-Random)"
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
        
        $baseName = Split-Path $SourcePath -Leaf
        $tempSourceDir = Join-Path $tempDir $baseName
        New-Item -ItemType Directory -Path $tempSourceDir -Force | Out-Null
        
        # Copy files maintaining structure
        $progress = 0
        foreach ($file in $files) {
            $progress++
            $relativePath = $file.FullName.Substring($SourcePath.Length + 1)
            $targetPath = Join-Path $tempSourceDir $relativePath
            $targetDir = Split-Path $targetPath -Parent
            
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            Copy-Item $file.FullName $targetPath -Force
            
            # Show progress every 100 files
            if ($progress % 100 -eq 0) {
                Write-Host "   Progress: $progress / $fileCount files" -ForegroundColor DarkGray
            }
        }
        
        # Create ZIP
        Write-Host "   🗜️  Compressing..." -ForegroundColor Yellow
        Compress-Archive -Path "$tempSourceDir" -DestinationPath $OutputFile -Force -CompressionLevel Optimal
        
        # Cleanup
        Remove-Item -Path $tempDir -Recurse -Force
        
        # Get file size
        $fileSize = (Get-Item $OutputFile).Length / 1MB
        Write-Host "   ✓ Export complete!" -ForegroundColor Green
        Write-Host "   📊 Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        
        return $true
    }
    Catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
        return $false
    }
}

# Start export process
Write-Host "🚀 Starting export process..." -ForegroundColor Green
Write-Host ""

$results = @()

# 1. Export Android
$results += @{
    Name = "Android (Kotlin)"
    Success = Export-SourceCode `
        -SourcePath "$baseDir\RestaurantPOS.Android" `
        -OutputFile "$outputDir\Android_Source_v1.0.zip" `
        -Name "Android Source" `
        -ExcludePaths $excludeAndroid
}

Write-Host ""

# 2. Export API
$results += @{
    Name = "API (ASP.NET Core)"
    Success = Export-SourceCode `
        -SourcePath "$baseDir\RestaurantPOS.API" `
        -OutputFile "$outputDir\API_Source_v1.0.zip" `
        -Name "API Source" `
        -ExcludePaths $excludeAPI
}

Write-Host ""

# 3. Export Web Client
$results += @{
    Name = "Web Client (React)"
    Success = Export-SourceCode `
        -SourcePath "$baseDir\restaurant-pos-client" `
        -OutputFile "$outputDir\WebClient_Source_v1.0.zip" `
        -Name "Web Client Source" `
        -ExcludePaths $excludeWeb
}

Write-Host ""

# 4. Export Desktop
if (Test-Path "$baseDir\RestaurantPOS.Desktop") {
    $results += @{
        Name = "Desktop (.NET MAUI)"
        Success = Export-SourceCode `
            -SourcePath "$baseDir\RestaurantPOS.Desktop" `
            -OutputFile "$outputDir\Desktop_Source_v1.0.zip" `
            -Name "Desktop Source" `
            -ExcludePaths $excludeDesktop
    }
}
else {
    Write-Host "⚠️  Desktop source not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              EXPORT SUMMARY                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
foreach ($result in $results) {
    $status = if ($result.Success) { "✓" } else { "❌" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    
    Write-Host "$status $($result.Name)" -ForegroundColor $color
    
    if ($result.Success) {
        $successCount++
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

if ($successCount -eq $results.Count) {
    Write-Host "🎉 All exports completed successfully!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Some exports failed. Check logs above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Output directory:" -ForegroundColor Cyan
Write-Host "   $outputDir" -ForegroundColor White
Write-Host ""

# List exported files
Write-Host "📦 Exported files:" -ForegroundColor Cyan
Get-ChildItem -Path $outputDir -Filter "*.zip" | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "   • $($_.Name) ($size MB)" -ForegroundColor White
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         EXPORT PROCESS COMPLETED! ✓                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Open output directory
Write-Host "Do you want to open the output directory? (Y/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Start-Process explorer.exe -ArgumentList $outputDir
    Write-Host "✓ Directory opened" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
