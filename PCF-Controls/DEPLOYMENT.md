# AIS PCF Control Library - Deployment Guide

This guide provides step-by-step instructions for deploying the AIS PCF controls to your Power Platform environment.

## Prerequisites

Before deploying, ensure you have:
- ✅ Built all PCF controls successfully
- ✅ Power Platform CLI installed and configured
- ✅ Appropriate permissions in the target environment
- ✅ Environment URL ready

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

Use the automated deployment script:

```powershell
# Deploy to your environment (replace with your actual environment URL)
.\deploy-all.ps1 -EnvironmentUrl "https://org5ecd402c.crm.dynamics.com"

# Verify deployment
.\verify-deployment.ps1 -EnvironmentUrl "https://org5ecd402c.crm.dynamics.com"

# Deploy as unmanaged solution for development
.\deploy-all.ps1 -EnvironmentUrl "https://org5ecd402c.crm.dynamics.com/" -Managed:$false
```

### Option 2: Manual Deployment

If you prefer to deploy manually or need more control:

#### Step 1: Ensure all controls are built
```powershell
npm run build:all
```

#### Step 2: Create/update the solution (already done)
The solution has been created at `Solutions\AISPCFControls\`

#### Step 3: Build the solution package
```powershell
cd Solutions\AISPCFControls
dotnet build --configuration Release
```

#### Step 4: Connect to your environment
```powershell
# List available environments
pac org list

# Connect to your target environment
pac auth create --url "https://your-environment-url.crm.dynamics.com/"
```

#### Step 5: Import the solution
```powershell
# Import the solution (managed)
pac solution import --path "bin\Release\AISPCFControls.zip"

# Or import as unmanaged for development
pac solution import --path "bin\Release\AISPCFControls.zip" --import-as-unmanaged
```

## Available Environments

Based on your current setup, you have these environments available:

| Environment Name | Environment URL | Use Case |
|------------------|-----------------|----------|
| Chris Hettinger's Environment | https://org5ecd402c.crm.dynamics.com/ | Personal development |
| Messor Solutions (default) | https://org9b7580e6.crm.dynamics.com/ | Main organization |
| Sales Trial | https://orgce20fdc3.crm.dynamics.com/ | Trial/testing |

## Solution Details

**Solution Name:** AISPCFControls  
**Publisher:** Applied Information Sciences  
**Prefix:** ais  
**Included Controls:**
- LookupToDropDown
- LookupToComboBox  
- RRule

## Post-Deployment Steps

After successful deployment, the controls will be available in:

### Canvas Apps
1. Open PowerApps maker portal
2. Create or edit a Canvas app
3. Go to **Insert** > **Get more components**
4. Click **Code components** tab
5. Find your AIS controls and add them

### Model-driven Apps
1. Open the model-driven app designer
2. Edit a form where you want to use the controls
3. Select a field that matches the control type
4. In the field properties, go to **Controls** tab
5. Add the AIS control and configure properties

### Power Pages
1. Open Power Pages design studio
2. The controls will be available as code components
3. Configure them in the component library

## Troubleshooting

### Common Issues

**Authentication Failed:**
```powershell
# Clear existing auth and re-authenticate
pac auth clear
pac auth create --url "https://your-environment-url.crm.dynamics.com/"
```

**Solution Import Failed:**
- Check if you have System Administrator or System Customizer role
- Ensure the environment allows custom controls
- Verify the solution file exists and isn't corrupted

**Controls Not Appearing:**
- Wait a few minutes for propagation
- Refresh your browser
- Check if the solution imported successfully in the Solutions area

**Build Errors:**
- Ensure all PCF controls built successfully first
- Check for any missing dependencies
- Try cleaning and rebuilding: `dotnet clean && dotnet build`

### Validation Commands

Check solution status:
```powershell
pac solution list
```

Check authentication:
```powershell
pac auth list
```

Verify environment connection:
```powershell
pac org who
```

## CI/CD Integration

For automated deployments in CI/CD pipelines:

```powershell
# Use service principal authentication
pac auth create --url $env:ENVIRONMENT_URL --applicationId $env:APP_ID --clientSecret $env:CLIENT_SECRET --tenant $env:TENANT_ID

# Deploy
.\deploy-all.ps1 -EnvironmentUrl $env:ENVIRONMENT_URL -Managed:$true
```

## Version Management

To update controls:
1. Make changes to PCF control code
2. Update version numbers in `ControlManifest.Input.xml`
3. Rebuild and redeploy
4. Import as upgrade in Power Platform

For major changes, consider creating a new solution version.
