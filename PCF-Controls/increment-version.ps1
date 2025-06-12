param(
    [string]$ControlName = $null
)

function Increment-ControlVersion {
    param(
        [string]$ManifestPath,
        [string]$ControlName
    )
    
    if (-not (Test-Path $ManifestPath)) {
        Write-Host "  X Manifest file not found: $ManifestPath" -ForegroundColor Red
        return $false
    }
    
    try {
        # Specify encoding for reading the manifest
        $content = Get-Content $ManifestPath -Raw -Encoding UTF8
        $versionPattern = 'version="(\d+)\.(\d+)\.(\d+)"' # Corrected regex
        $match = [regex]::Match($content, $versionPattern)
        
        if (-not $match.Success) {
            Write-Host "  X Could not find version pattern in manifest" -ForegroundColor Red
            return $false
        }
        
        $major = [int]$match.Groups[1].Value
        $minor = [int]$match.Groups[2].Value
        $patch = [int]$match.Groups[3].Value
        
        $currentVersion = "$major.$minor.$patch"
        $newPatch = $patch + 1
        $newVersion = "$major.$minor.$newPatch"
        
        $newContent = $content -replace $versionPattern, "version=`"$newVersion`""
        # Explicitly use -Value and specify encoding for writing
        Set-Content -Path $ManifestPath -Value $newContent -NoNewline -Encoding UTF8
        
        Write-Host "  * Updated version: $currentVersion -> $newVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  X Error updating version: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

if ($ControlName) {
    $controlPath = Join-Path $PWD $ControlName
    if (-not (Test-Path $controlPath)) {
        Write-Host "Control directory not found: $ControlName" -ForegroundColor Red
        exit 1
    }
    $controlDirs = @(Get-Item $controlPath)
} else {
    # Get all control directories that have ControlManifest.Input.xml files
    $controlDirs = Get-ChildItem -Directory | Where-Object { 
        Test-Path (Join-Path $_.FullName $_.Name "ControlManifest.Input.xml")
    }
    
    # Add RRule control (special case with nested structure)
    $rruleControlPath = "RRule\RruleControl"
    if (Test-Path $rruleControlPath) {
        $rruleDir = Get-Item $rruleControlPath
        if (Test-Path (Join-Path $rruleDir.FullName "rrulepcf" "ControlManifest.Input.xml")) {
            $controlDirs += $rruleDir
        }
    }
}

if ($controlDirs.Count -eq 0) {
    Write-Host "No PCF controls found to update." -ForegroundColor Yellow
    exit 0
}

Write-Host "Incrementing version for $($controlDirs.Count) PCF control(s):" -ForegroundColor Cyan
$controlDirs | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
Write-Host ""

$successCount = 0

foreach ($controlDir in $controlDirs) {
    $controlName = $controlDir.Name
    
    # Handle special case for RRule control with nested structure
    if ($controlName -eq "RruleControl") {
        $manifestPath = Join-Path $controlDir.FullName "rrulepcf" "ControlManifest.Input.xml"
    } else {
        $manifestPath = Join-Path $controlDir.FullName $controlName "ControlManifest.Input.xml"
    }
    
    Write-Host "[$($successCount + 1)/$($controlDirs.Count)] Updating $controlName..." -ForegroundColor Yellow
    
    $success = Increment-ControlVersion -ManifestPath $manifestPath -ControlName $controlName
    
    if ($success) {
        $successCount++
    }
    
    Write-Host ""
}

$failed = $controlDirs.Count - $successCount

Write-Host "Version Update Summary:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -gt 0) {
    exit 1
} else {
    Write-Host ""
    Write-Host "All versions updated successfully!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run .\build-all.ps1 to build with new versions" -ForegroundColor White
    Write-Host "  2. Run .\deploy-all.ps1 to deploy updated controls" -ForegroundColor White
    exit 0
}
