# AMR Route Lab — mission preflight

Route Lab converts the drawn pixel path to MiR Move targets P1, P2, etc. Error 10110 from the Lab shows that MiR rejected P1 in a Forbidden Zone. The original drawing and live zone data are needed to determine why that target landed there. The numeric calibration remains unchanged pending that evidence.

Drawn missions now check the converted Move targets against a Lab-verified zone snapshot in both `/mission-preview` and `/mission`. Rejected targets return their P-number, coordinates and zone names before any Positions or Missions are created. The send endpoint repeats the check even if preview previously passed. Approved missions supplied using `-RouteFile` retain their existing behavior.

## Lab setup

1. On the active MiR map, obtain all Forbidden Zone polygons in robot-map meters using the installed robot's documented interface. Check geometry against the MiR map with the Lab operator. Record a map/zone revision and review time. Save using `route-zones.example.json` as the format template. The template contains invented coordinates and deliberately invalid metadata.
2. Set `mapId` to the active map GUID. Polygon vertices must form a simple ordered boundary, including a strip polygon for any forbidden line with width. Values are meters in MiR's map coordinate frame. Record the source map/zone revision in `revision`. An empty `forbiddenZones` list is valid only after the Lab has verified that the map has no Forbidden Zones.
3. Start with `./Start-MiR105RouteLab.ps1 -ZoneFile <local-snapshot.json>` or set `AMR105_ZONE_FILE` before running `node server.cjs`. Missing, malformed, wrong-map or degenerate snapshots produce a clear 503 response and block drawn submission.
4. Supply `-ApiUrl http://<lab-robot>/api/v2.0.0` to the PowerShell launcher to use the actual Lab address for both authentication check and backend requests. When running Node directly, `AMR105_API_URL` overrides the redacted default address. Keep authorization in the existing credential mechanism.
5. Draw and preview the route. The confirmation shows converted coordinates and the snapshot review time. Verify the source map and P1 location on MiR before a supervised trial.

The snapshot is loaded on each request. Re-export and review it after any map or zone edit, including edits that retain the map GUID. Revision and review time describe the local snapshot. The current implementation cannot automatically verify its freshness against the live robot. Exact Forbidden Zone API encoding on the installed 2.13 firmware remains to be captured in the Lab. Do not use a guessed newer API schema.

Preflight checks the Move target points, including polygon boundaries. MiR plans its own path between these points. This check does not validate the actual swept footprint, the whole navigation path, localization accuracy, or obstacle avoidance. A valid preview is not proof that a real mission can complete.

## Offline verification

Run `node --test robotics/amr/route-lab/route-zones.test.cjs` from the repository root. HTTP tests use a stub MiR API and an ephemeral local Route Lab server. No robot credentials or robot access are needed.

For the original Lab failure, collect the original drawn points, the generated P1 coordinates, the active map GUID/revision and zone boundaries, and compare the P1 marker on MiR with the drawn target. Then check a valid route and confirm a forbidden target is rejected before creating any MiR objects.
