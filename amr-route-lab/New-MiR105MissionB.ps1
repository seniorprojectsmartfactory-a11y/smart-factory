param(
    [string]$DraftFile
)

$ErrorActionPreference = 'Stop'
$api = 'http://192.0.2.105/api/v2.0.0'
$mapId = '15b69c6d-9e08-11f0-92e7-0001299a3e90'
$positionName = 'Route Lab B'
$missionName = 'Route Lab - Go to B'
$x = 104.14
$y = 83.43
$heading = [Math]::Round([Math]::Atan2($y - 78.59, $x - 103.13) * 180 / [Math]::PI, 2)
$draft = $null
$position = $null
if ($DraftFile) {
    $draftPath = (Resolve-Path -LiteralPath $DraftFile).Path
    $draft = Get-Content -Raw -LiteralPath $draftPath | ConvertFrom-Json
    if ($draft.mapId -ne $mapId -or $draft.points.Count -lt 2 -or $draft.name -notmatch '^[a-zA-Z0-9 _.-]{1,24}$') {
        throw 'Use a Floor 9 draft with at least two points and a short route name such as test2.'
    }
    foreach ($point in $draft.points) {
        if ($point.Count -ne 2 -or $point[0] -isnot [int] -or $point[1] -isnot [int] -or
            $point[0] -lt 0 -or $point[0] -gt 1196 -or $point[1] -lt 0 -or $point[1] -gt 583) {
            throw 'Draft has a point outside the Floor 9 image or an invalid coordinate.'
        }
    }
    function Convert-ToMiRPoint($point) {
        $u = $point[0] - 130
        $v = $point[1] - 160
        $along = ($u * 880 + $v * 20) / (880 * 880 + 20 * 20)
        $right = ($v * 880 - $u * 20) / (880 * 880 + 20 * 20)
        $dx = 114.392159 - 46.820227
        $dy = 92.047727 - 95.039205
        @( (46.820227 + $along * $dx + $right * $dy), (95.039205 + $along * $dy - $right * $dx) )
    }
    $finish = Convert-ToMiRPoint $draft.points[-1]
    $beforeFinish = Convert-ToMiRPoint $draft.points[-2]
    $x = [Math]::Round($finish[0], 2)
    $y = [Math]::Round($finish[1], 2)
    $heading = [Math]::Round([Math]::Atan2($finish[1] - $beforeFinish[1], $finish[0] - $beforeFinish[0]) * 180 / [Math]::PI, 2)
    $positionName = "Route Lab $($draft.name)"
    $missionName = "Route Lab - $($draft.name)"
}

function Invoke-MiR([string]$Path, [hashtable]$Body) {
    $request = @{
        Uri = "$api/$Path"
        Headers = $headers
        TimeoutSec = 8
        MaximumRedirection = 0
    }
    if ($null -ne $Body) {
        $request.Method = 'Post'
        $request.ContentType = 'application/json'
        $request.Body = ConvertTo-Json -InputObject $Body -Depth 8 -Compress
    }
    try {
        $result = Invoke-RestMethod @request
        foreach ($item in $result) { $item }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'unconfirmed' }
        throw "MiR request failed: $($request.Method) /$Path ($code). Check existing records before retrying."
    }
}

$secret = Read-Host 'Paste the current MiR Authorization value (including Basic)' -AsSecureString
try {
    $authorization = [pscredential]::new('capstone_route_lab', $secret).GetNetworkCredential().Password.Trim()
    if ($authorization -notmatch '^Basic [A-Za-z0-9+/]+=*$') { throw 'Expected the full Basic Authorization value.' }
    $headers = @{ Authorization = $authorization; 'Accept-Language' = 'en_US' }

    $status = Invoke-MiR 'status'
    if ($status.map_id -ne $mapId) { throw 'MiR .105 is not using the expected Floor 9 map.' }
    $positions = Invoke-MiR "maps/$mapId/positions"
    $samePosition = @($positions | Where-Object name -eq $positionName)
    if ($samePosition.Count -gt 1) { throw 'More than one position has the requested name.' }
    if ($samePosition.Count -eq 1) {
        $position = Invoke-MiR "positions/$($samePosition[0].guid)"
        if ($position.map_id -ne $mapId -or $position.type_id -ne 0 -or
            [Math]::Abs($position.pos_x - $x) -gt 0.01 -or [Math]::Abs($position.pos_y - $y) -gt 0.01 -or
            [Math]::Abs($position.orientation - $heading) -gt 0.1) {
            throw 'Existing Route Lab B differs. Review it on the MiR map.'
        }
    }
    $groups = @(Invoke-MiR 'mission_groups' | Where-Object { $_.guid -and $_.name })
    if (!$groups.Count) { throw 'No existing mission groups were returned.' }
    $move = Invoke-MiR 'actions/move'
    if ($move.parameters.id -notcontains 'position') { throw 'This MiR did not advertise the expected Move position parameter.' }
    $missions = Invoke-MiR 'missions'
    if (@($missions | Where-Object name -eq $missionName).Count) {
        throw 'The mission already exists. Inspect its actions in MiR before making further changes.'
    }
    for ($index = 0; $index -lt $groups.Count; $index++) {
        '{0}. {1}' -f ($index + 1), $groups[$index].name
    }
    $choice = 0
    if (![int]::TryParse((Read-Host 'Choose the Lab mission group number'), [ref]$choice) -or
        $choice -lt 1 -or $choice -gt $groups.Count) { throw 'No valid mission group selected.' }
    Write-Host "MiR .105 | $positionName | X $x m, Y $y m, heading $heading deg | $missionName"
    if ((Read-Host 'Type CREATE after verifying the destination and heading on the MiR map') -cne 'CREATE') { return }

    if ($null -eq $position) {
        $position = Invoke-MiR 'positions' @{
            name = $positionName; map_id = $mapId; type_id = 0
            pos_x = $x; pos_y = $y; orientation = $heading
        }
    }
    if (!$position.guid) { throw 'Position creation could not be verified.' }
    $mission = Invoke-MiR 'missions' @{
        name = $missionName; group_id = $groups[$choice - 1].guid; hidden = $false
    }
    if (!$mission.guid) { throw 'Mission creation could not be verified.' }
    $moveParameters = @($move.parameters | ForEach-Object {
        if ($_.id -eq 'position') {
            @{ id = $_.id; value = $position.guid }
        } elseif ($_.constraints -and $_.constraints.PSObject.Properties['default']) {
            @{ id = $_.id; value = $_.constraints.default }
        }
    })
    $null = Invoke-MiR "missions/$($mission.guid)/actions" @{
        mission_id = $mission.guid; action_type = 'move'; priority = 0; parameters = $moveParameters
    }
    $actions = @(Invoke-MiR "missions/$($mission.guid)/actions")
    if ($actions.Count -ne 1 -or $actions[0].action_type -ne 'move' -or
        !($actions[0].parameters | Where-Object { $_.id -eq 'position' -and $_.value -eq $position.guid })) {
        throw 'The Move action and its destination could not be verified. Check the mission in MiR.'
    }
    "Created and verified: $missionName"
    "Mission ID: $($mission.guid)"
    if ($null -ne $draft) {
        $binding = @{ mapId = $mapId; points = $draft.points; missionId = $mission.guid }
        $bindingPath = Join-Path (Split-Path -Parent $draftPath) "AMR105-$($draft.name)-Approved.json"
        ConvertTo-Json -InputObject $binding -Depth 6 | Set-Content -LiteralPath $bindingPath -Encoding ASCII
        "Approved route: $bindingPath"
    }
} finally {
    if ($null -ne $secret) { $secret.Dispose() }
    Remove-Variable secret, authorization, headers -ErrorAction SilentlyContinue
}
