#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploys all AIS PCF controls to a Power Platform environment
.DESCRIPTION
    This script builds all controls, creates a combined solution, and deploys it to the specified environment.
.PARAMETER EnvironmentUrl
    The URL of the Power Platform environment (e.g., https://yourorg.crm.dynamics.com)
.PARAMETER SolutionName
    The name of the solution to create/update (default: AISPCFControls)
.PARAMETER Managed
    Whether to create a managed solution (default: true for production deployment)
.EXAMPLE
    ./deploy-all.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com"
.EXAMPLE
    ./deploy-all.ps1 -EnvironmentUrl "https://dev.crm.dynamics.com" -SolutionName "AISPCFControls_Dev" -Managed:$false
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,
    [string]$SolutionName = "AISPCFControls",
    [bool]$Managed = $true
)

# Validate environment URL format
if ($EnvironmentUrl -notmatch '^https://.*\.crm.*\.dynamics\.com/?$') {
    Write-Host "Warning: Environment URL should be in format: https://yourorg.crm.dynamics.com" -ForegroundColor Yellow
}

Write-Host "AIS PCF Control Library Deployment Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentUrl" -ForegroundColor Gray
Write-Host "Solution: $SolutionName" -ForegroundColor Gray
Write-Host "Managed: $Managed" -ForegroundColor Gray
Write-Host ""

try {
    # Step 1: Increment versions for all controls
    Write-Host "Step 1: Incrementing control versions..." -ForegroundColor Yellow
    $versionResult = & .\increment-version.ps1
    if ($LASTEXITCODE -ne 0) {
        throw "Version increment failed. Please check the output above for errors."
    }
    Write-Host "✓ All control versions incremented successfully" -ForegroundColor Green
    Write-Host ""

    # Step 2: Build all controls
    Write-Host "Step 2: Building all controls..." -ForegroundColor Yellow
    $buildResult = & npm run build:all
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed. Please check the output above for errors."
    }
    Write-Host "✓ All controls built successfully" -ForegroundColor Green
    Write-Host ""

    # Step 3: Create or update solution
    $solutionPath = "Solutions\$SolutionName"
    
    if (!(Test-Path $solutionPath)) {
        Write-Host "Step 3: Creating new solution..." -ForegroundColor Yellow
        
        # Create Solutions directory if it doesn't exist
        if (!(Test-Path "Solutions")) {
            New-Item -ItemType Directory -Path "Solutions" | Out-Null
        }
        
        # Create solution directory
        New-Item -ItemType Directory -Path $solutionPath -Force | Out-Null
        Push-Location $solutionPath
          # Initialize solution
        $initResult = & pac solution init --publisher-name "AppliedInformationSciences" --publisher-prefix ais --outputDirectory .
        if ($LASTEXITCODE -ne 0) {
            throw "Solution initialization failed"
        }
        
        # Add all controls
        Write-Host "Adding controls to solution..." -ForegroundColor Gray
        & pac solution add-reference --path "..\..\LookupToDropDown"
        & pac solution add-reference --path "..\..\LookupToComboBox"
        & pac solution add-reference --path "..\..\RRule"
        
        Pop-Location
        Write-Host "✓ Solution created and controls added" -ForegroundColor Green
    } else {
        Write-Host "Step 3: Using existing solution..." -ForegroundColor Yellow
        Write-Host "✓ Solution found at $solutionPath" -ForegroundColor Green
    }
    Write-Host ""

    # Step 4: Build solution
    Write-Host "Step 4: Building solution..." -ForegroundColor Yellow
    Push-Location $solutionPath
      $buildConfig = if ($Managed) { "Release" } else { "Debug" }
    $msbuildResult = & dotnet build --configuration $buildConfig
    if ($LASTEXITCODE -ne 0) {
        throw "Solution build failed"
    }
    
    Pop-Location
    Write-Host "✓ Solution built successfully" -ForegroundColor Green
    Write-Host ""

    # Step 5: Connect to environment
    Write-Host "Step 5: Connecting to environment..." -ForegroundColor Yellow
    $authResult = & pac auth create --url $EnvironmentUrl
    if ($LASTEXITCODE -ne 0) {
        throw "Authentication failed. Please check your credentials and environment URL."
    }
    Write-Host "✓ Connected to environment" -ForegroundColor Green
    Write-Host ""    # Step 6: Import solution
    Write-Host "Step 6: Importing solution..." -ForegroundColor Yellow
    
    # Look for solution file (try different naming patterns)
    $solutionFile = $null
    $solutionType = if ($Managed) { "managed" } else { "unmanaged" }
    
    # Try different file naming patterns
    $possibleFiles = @(
        "$solutionPath\bin\$buildConfig\*_$solutionType.zip",
        "$solutionPath\bin\$buildConfig\*.zip"
    )
    
    foreach ($pattern in $possibleFiles) {
        $files = Get-ChildItem $pattern -ErrorAction SilentlyContinue
        if ($files) {
            $solutionFile = $files | Select-Object -First 1
            break
        }
    }
    
    if (!$solutionFile) {
        throw "Solution file not found in $solutionPath\bin\$buildConfig\"
    }
    
    Write-Host "Importing: $($solutionFile.Name)" -ForegroundColor Gray
    $importResult = & pac solution import --path $solutionFile.FullName
    if ($LASTEXITCODE -ne 0) {
        throw "Solution import failed"
    }
    
    Write-Host "✓ Solution imported successfully" -ForegroundColor Green
    Write-Host ""

    # Success summary
    Write-Host "Deployment Summary:" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    Write-Host "✓ Controls built" -ForegroundColor Green
    Write-Host "✓ Solution created/updated" -ForegroundColor Green
    Write-Host "✓ Connected to environment" -ForegroundColor Green
    Write-Host "✓ Solution imported" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "- The controls are now available in your environment" -ForegroundColor Gray
    Write-Host "- For Canvas Apps: Insert > Get more components > Code components" -ForegroundColor Gray
    Write-Host "- For Model-driven Apps: Configure on form fields through form designer" -ForegroundColor Gray
    
} catch {
    Write-Host ""
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "- Ensure you have the Power Platform CLI installed and updated" -ForegroundColor Gray
    Write-Host "- Verify your environment URL is correct" -ForegroundColor Gray
    Write-Host "- Check that you have appropriate permissions in the target environment" -ForegroundColor Gray
    Write-Host "- Review any error messages above for specific issues" -ForegroundColor Gray
    exit 1
}
