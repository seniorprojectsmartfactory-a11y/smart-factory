function check_matlab_node_red(baseUrl)
% Read the configured map and compare two simulated AMR routes in Node-RED.
arguments
    baseUrl (1,1) string = "http://127.0.0.1:1884"
end

readOptions = weboptions('Timeout', 10);
writeOptions = weboptions('MediaType', 'application/json', 'Timeout', 10);
catalog = webread(baseUrl + "/amr/maps", readOptions);
map = catalog.maps(strcmp({catalog.maps.id}, catalog.defaultMapId));
reference = map.references(strcmp({map.references.id}, map.defaultReferenceId));
floor = webread(baseUrl + string(reference.referenceUrl), readOptions);
assert(strcmp(floor.id, reference.id) && ~floor.validation.navigationEnabled, ...
    'Expected the simulation-only map revision listed in the catalog.');

request = struct('referenceId', floor.id, 'robotId', 1, ...
    'start', [1468 380], 'goal', [1860 650]);
request.closedDoors = {};
planUrl = baseUrl + "/amr/tap-to-go/plan";
direct = webwrite(planUrl, request, writeOptions);
request.closedDoors = {'D-11'};
detour = webwrite(planUrl, request, writeOptions);

assert(strcmp(direct.mode, 'simulation') && strcmp(detour.mode, 'simulation') ...
    && direct.robotId == 1 && detour.robotId == 1, 'Expected plans for simulated AMR 1.');
assert(detour.distancePx > direct.distancePx, 'Expected a longer route when D-11 is closed.');
fprintf('Node-RED connected to MATLAB. Map: %s\n', floor.id);
fprintf('Direct: %.0f px, detour with D-11 closed: %.0f px\n', direct.distancePx, detour.distancePx);
end
