#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Installs dependencies for all PCF controls in the AIS PCF Control Library
.DESCRIPTION
    This script iterates through all control directories and runs npm install for each one.
#>

# Get all control directories (directories containing package.json)
$controlDirs = Get-ChildItem -Directory | Where-Object { 
    (Test-Path (Join-Path $_.FullName "package.json")) -and
    ($_.Name -notin @("node_modules", ".git", "Solutions"))
}

Write-Host "Found $($controlDirs.Count) PCF controls to install dependencies for:" -ForegroundColor Cyan
$controlDirs | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
Write-Host ""

$results = @()
$totalControls = $controlDirs.Count
$currentControl = 0

foreach ($controlDir in $controlDirs) {
    $currentControl++
    $controlName = $controlDir.Name
    
    Write-Host "[$currentControl/$totalControls] Installing dependencies for $controlName..." -ForegroundColor Yellow
    
    Push-Location $controlDir.FullName
      try {
        $installResult = & npm install --legacy-peer-deps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $controlName dependencies installed successfully" -ForegroundColor Green
            $results += @{ Control = $controlName; Status = "Success"; Time = Get-Date }
        } else {
            Write-Host "  ✗ $controlName dependency installation failed" -ForegroundColor Red
            Write-Host "    Error: $installResult" -ForegroundColor Red
            $results += @{ Control = $controlName; Status = "Failed"; Time = Get-Date; Error = $installResult }
        }
    }
    catch {
        Write-Host "  ✗ $controlName dependency installation failed with exception: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{ Control = $controlName; Status = "Exception"; Time = Get-Date; Error = $_.Exception.Message }
    }
    finally {
        Pop-Location
    }
    
    Write-Host ""
}

# Summary
Write-Host "Installation Summary:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

$successful = ($results | Where-Object { $_.Status -eq "Success" }).Count
$failed = ($results | Where-Object { $_.Status -in @("Failed", "Exception") }).Count

Write-Host "Successful: $successful" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -gt 0) {
    Write-Host "`nFailed controls:" -ForegroundColor Red
    $results | Where-Object { $_.Status -in @("Failed", "Exception") } | ForEach-Object {
        Write-Host "  - $($_.Control): $($_.Error)" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "`nAll dependencies installed successfully! 🎉" -ForegroundColor Green
    exit 0
}
