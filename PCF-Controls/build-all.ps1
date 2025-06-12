#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Builds all PCF controls in the AIS PCF Control Library
.DESCRIPTION
    This script iterates through all control directories and runs npm run build for each one.
    It provides colored output to indicate success/failure for each control.
#>

param(
    [switch]$Watch,
    [switch]$Clean
)

# Get all control directories (directories containing package.json and pcfproj files)
$controlDirs = Get-ChildItem -Directory | Where-Object { 
    (Test-Path (Join-Path $_.FullName "package.json")) -and 
    (Test-Path (Join-Path $_.FullName "*.pcfproj")) -and
    ($_.Name -notin @("node_modules", ".git", "Solutions"))
}

# Add RRule control (special case with nested structure)
$rruleControlPath = "RRule\RruleControl"
if (Test-Path $rruleControlPath) {
    $rruleDir = Get-Item $rruleControlPath
    if ((Test-Path (Join-Path $rruleDir.FullName "package.json")) -and 
        (Test-Path (Join-Path $rruleDir.FullName "*.pcfproj"))) {
        $controlDirs += $rruleDir
    }
}

Write-Host "Found $($controlDirs.Count) PCF controls to build:" -ForegroundColor Cyan
$controlDirs | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
Write-Host ""

$results = @()
$totalControls = $controlDirs.Count
$currentControl = 0

foreach ($controlDir in $controlDirs) {
    $currentControl++
    $controlName = $controlDir.Name
    
    Write-Host "[$currentControl/$totalControls] Building $controlName..." -ForegroundColor Yellow
    
    Push-Location $controlDir.FullName
    
    try {
        if ($Clean) {
            Write-Host "  Cleaning $controlName..." -ForegroundColor Gray
            if (Test-Path "out") {
                Remove-Item -Recurse -Force "out"
            }
        }
        
        if ($Watch) {
            Write-Host "  Starting watch mode for $controlName..." -ForegroundColor Gray
            Start-Process -FilePath "npm" -ArgumentList "start", "watch" -WorkingDirectory $PWD
            $results += @{ Control = $controlName; Status = "Watch Started"; Time = Get-Date }
        } else {
            $buildResult = & npm run build 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ $controlName built successfully" -ForegroundColor Green
                $results += @{ Control = $controlName; Status = "Success"; Time = Get-Date }
            } else {
                Write-Host "  ✗ $controlName build failed" -ForegroundColor Red
                Write-Host "    Error: $buildResult" -ForegroundColor Red
                $results += @{ Control = $controlName; Status = "Failed"; Time = Get-Date; Error = $buildResult }
            }
        }
    }
    catch {
        Write-Host "  ✗ $controlName build failed with exception: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{ Control = $controlName; Status = "Exception"; Time = Get-Date; Error = $_.Exception.Message }
    }
    finally {
        Pop-Location
    }
    
    Write-Host ""
}

# Summary
Write-Host "Build Summary:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan

if ($Watch) {
    Write-Host "Watch mode started for all controls. Check individual terminal windows for output." -ForegroundColor Yellow
} else {
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
        Write-Host "`nAll controls built successfully! 🎉" -ForegroundColor Green
        exit 0
    }
}
