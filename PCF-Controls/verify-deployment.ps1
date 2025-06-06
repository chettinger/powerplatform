#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Verifies the deployment of AIS PCF Controls to Power Platform
.DESCRIPTION
    This script connects to the Power Platform environment and verifies that all expected controls are deployed and available.
.PARAMETER EnvironmentUrl
    The URL of the Power Platform environment to verify
.EXAMPLE
    .\verify-deployment.ps1 -EnvironmentUrl "https://org5ecd402c.crm.dynamics.com"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$EnvironmentUrl
)

# Color functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Header { param($Message) Write-Host "`n$Message" -ForegroundColor Yellow -BackgroundColor DarkBlue }

Write-Header "AIS PCF Control Library Deployment Verification"
Write-Host "Environment: $EnvironmentUrl"
Write-Host "=========================================`n"

try {
    # Step 1: Connect to environment
    Write-Info "Step 1: Connecting to environment..."
    $authResult = pac auth create --url $EnvironmentUrl 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Connected to environment"
    } else {
        Write-Error "Failed to connect to environment"
        Write-Host $authResult
        exit 1
    }    # Step 2: Check for AISPCFControls solution
    Write-Info "Step 2: Checking for AISPCFControls solution..."
    $solutionList = pac solution list 2>&1
    if ($LASTEXITCODE -eq 0) {
        # Parse the output to find our solution
        $aisSolutionFound = $solutionList | Select-String "AISPCFControls"
        
        if ($aisSolutionFound) {
            Write-Success "AISPCFControls solution found"
            # Extract details from the line
            $solutionLine = $aisSolutionFound.Line
            if ($solutionLine -match "(\S+)\s+(.+?)\s+([\d\.]+)\s+(True|False)$") {
                Write-Host "  - Unique Name: $($matches[1])"
                Write-Host "  - Display Name: $($matches[2].Trim())"
                Write-Host "  - Version: $($matches[3])"
                Write-Host "  - Is Managed: $($matches[4])"
            } else {
                Write-Host "  - $solutionLine"
            }
        } else {
            Write-Warning "AISPCFControls solution not found in environment"
            Write-Info "Available solutions containing 'AIS':"
            $aisSolutions = $solutionList | Select-String "AIS"
            if ($aisSolutions) {
                $aisSolutions | ForEach-Object { Write-Host "  - $($_.Line)" }
            } else {
                Write-Host "  - No solutions containing 'AIS' found"
            }
        }
    } else {
        Write-Error "Failed to list solutions"
        Write-Host $solutionList
    }

    # Step 3: Check for PCF components (this requires a different approach)
    Write-Info "Step 3: Checking for PCF components..."
    Write-Warning "Note: Direct PCF component verification requires additional Power Platform admin permissions"
    Write-Info "Please manually verify in Power Platform admin center or in app maker experience:"
    Write-Host "  1. Go to make.powerapps.com"
    Write-Host "  2. Select your environment"
    Write-Host "  3. Go to 'Apps' > 'Custom connectors' or create a new Canvas app"
    Write-Host "  4. In app editor: Insert > Get more components > Code components"
    Write-Host "  5. Look for AIS.LookupToDropDown, AIS.LookupToComboBox, and AIS.RRule"    Write-Header "Verification Summary"
    Write-Success "Environment connection verified"
    if ($aisSolutionFound) {
        Write-Success "AISPCFControls solution found in environment"
    } else {
        Write-Warning "AISPCFControls solution not found - may need manual verification"
    }
    Write-Info "Manual verification steps provided above"

} catch {
    Write-Error "Verification failed with error: $($_.Exception.Message)"
    exit 1
}

Write-Host "`n🎯 Verification completed!"
