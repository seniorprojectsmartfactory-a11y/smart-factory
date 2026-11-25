param(
    [string]$RouteFile,
    [string]$ZoneFile,
    [string]$ApiUrl = 'http://192.0.2.105/api/v2.0.0',
    [switch]$ReplaceCredential
)

$ErrorActionPreference = 'Stop'
$zonePath = if ($ZoneFile) { (Resolve-Path -LiteralPath $ZoneFile).Path } else { $null }
$routePath = $null
if ($RouteFile) {
    $routePath = (Resolve-Path -LiteralPath $RouteFile).Path
    $route = Get-Content -Raw -LiteralPath $routePath | ConvertFrom-Json
    if ($route.missionId -notmatch '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$' -or
        $route.mapId -ne '15b69c6d-9e08-11f0-92e7-0001299a3e90') {
        throw 'Select an approved Route Lab export for MiR .105 on Floor 9.'
    }
}
$credentialFolder = Join-Path $env:LOCALAPPDATA 'AMR Route Lab'
$credentialFile = Join-Path $credentialFolder 'MiR105.credential'
$store = $ReplaceCredential -or !(Test-Path -LiteralPath $credentialFile -PathType Leaf)
$password = $null
try {
    if ($store) {
        $password = Read-Host 'Paste the current MiR Authorization value (including Basic)' -AsSecureString
    } else {
        $password = Get-Content -Raw -LiteralPath $credentialFile | ForEach-Object { ConvertTo-SecureString $_.Trim() }
    }
    $authorization = [pscredential]::new('capstone_route_lab', $password).GetNetworkCredential().Password.Trim()
    if ($authorization -notmatch '^Basic [A-Za-z0-9+/]+=*$') { throw 'Expected the full Basic Authorization value.' }
    if ($store) {
        try {
            $null = Invoke-WebRequest -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 6 `
                -Uri ($ApiUrl.TrimEnd('/') + '/missions') `
                -Headers @{ Authorization = $authorization; 'Accept-Language' = 'en_US' }
        } catch {
            $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'connection failed' }
            throw "MiR authentication check failed ($code). Credential was not saved."
        }
        $null = New-Item -ItemType Directory -Force -Path $credentialFolder
        ConvertFrom-SecureString $password | Set-Content -LiteralPath $credentialFile -Encoding ASCII
    }
    $env:AMR105_AUTHORIZATION = $authorization
    $env:AMR105_API_URL = $ApiUrl.TrimEnd('/')
    if ($zonePath) { $env:AMR105_ZONE_FILE = $zonePath }
    if (!$RouteFile -and !$env:AMR105_ZONE_FILE) {
        Write-Warning 'Drawn missions require a Lab-verified Forbidden Zone snapshot. Use -ZoneFile. Sending stays unavailable until configured.'
    }
    if ($routePath) {
        $env:AMR105_APPROVED_ROUTE = $routePath
        $env:AMR105_DRAW_MISSIONS = '0'
    } else {
        $env:AMR105_DRAW_MISSIONS = '1'
    }
    node (Join-Path $PSScriptRoot 'server.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'Route Lab could not start. Check whether port 1881 is in use.' }
} finally {
    if ($null -ne $password) { $password.Dispose() }
    Remove-Item Env:AMR105_AUTHORIZATION, Env:AMR105_APPROVED_ROUTE, Env:AMR105_DRAW_MISSIONS, Env:AMR105_ZONE_FILE, Env:AMR105_API_URL -ErrorAction SilentlyContinue
    Remove-Variable authorization, password -ErrorAction SilentlyContinue
}
