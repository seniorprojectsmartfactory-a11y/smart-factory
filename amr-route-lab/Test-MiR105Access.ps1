param(
    [string]$Username = 'capstone_route_lab',
    [switch]$UseApiHeader
)

$prompt = if ($UseApiHeader) { 'Paste the full MiR Authorization value (including Basic)' } else { "Password for MiR .105 user $Username" }
$password = Read-Host $prompt -AsSecureString
if ($null -eq $password -or $password.Length -eq 0) {
    Write-Error 'No password was entered.'
    return
}
$credential = [System.Management.Automation.PSCredential]::new($Username, $password)

$sha = [Security.Cryptography.SHA256]::Create()
$passwordBytes = $null
try {
    if ($UseApiHeader) {
        $authorization = $credential.GetNetworkCredential().Password.Trim()
        if ($authorization -notmatch '^Basic [A-Za-z0-9+/]+=*$') {
            Write-Error 'Paste only the Authorization value, starting with Basic.'
            return
        }
    } else {
        $passwordBytes = [Text.Encoding]::UTF8.GetBytes($credential.GetNetworkCredential().Password)
        $hash = [BitConverter]::ToString($sha.ComputeHash($passwordBytes)).Replace('-', '').ToLowerInvariant()
        $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${Username}:$hash"))
        $authorization = "Basic $encoded"
    }
    $headers = @{ Authorization = $authorization; 'Accept-Language' = 'en_US' }
    $api = 'http://192.0.2.105/api/v2.0.0'
    $mapId = '15b69c6d-9e08-11f0-92e7-0001299a3e90'
    $resources = @('status', "maps/$mapId/positions", 'missions', 'mission_queue')

    foreach ($resource in $resources) {
        try {
            $result = Invoke-WebRequest -UseBasicParsing -Uri "$api/$resource" -Headers $headers -TimeoutSec 5 -ErrorAction Stop
            '{0}: HTTP {1}' -f $resource, $result.StatusCode
        } catch {
            if ($_.Exception.Response) {
                '{0}: HTTP {1}' -f $resource, [int]$_.Exception.Response.StatusCode
            } else {
                '{0}: connection failed' -f $resource
            }
        }
    }
} finally {
    $sha.Dispose()
    if ($null -ne $passwordBytes) { [Array]::Clear($passwordBytes, 0, $passwordBytes.Length) }
    $password.Dispose()
    Remove-Variable credential, password, passwordBytes, hash, encoded, authorization, headers -ErrorAction SilentlyContinue
}
