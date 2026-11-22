const { test } = require('node:test');
const assert = require('node:assert/strict');
const { request } = require('node:http');
const { once } = require('node:events');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { planRoute } = require('./drawn-mission.cjs');
const { validateRouteZones } = require('./route-zones.cjs');

const mapId = '15b69c6d-9e08-11f0-92e7-0001299a3e90';
const points = [[130, 160], [150, 160]];
const plan = planRoute(points);
const target = plan.waypoints[0];
const zone = { name: 'Forbidden Lab', polygon: [
  [target.pos_x, target.pos_y - 1], [target.pos_x + 1, target.pos_y - 1],
  [target.pos_x + 1, target.pos_y + 1], [target.pos_x, target.pos_y + 1],
] };
const snapshot = forbiddenZones => ({
  mapId, coordinateFrame: 'mir-map-meters', revision: 'test-reviewed-v1',
  verifiedAt: '2026-11-20T10:00:00Z', forbiddenZones,
});

function post(server, path) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: server.address().port,
      path, method: 'POST', headers: { Origin: 'http://127.0.0.1:1881',
        'Content-Type': 'application/json' } }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end(JSON.stringify({ robot: '.105', points }));
  });
}

test('normal HTTP preview and submit reject invalid targets before writes', async t => {
  const folder = mkdtempSync(join(tmpdir(), 'route-zones-'));
  const file = join(folder, 'zones.json');
  const approved = join(folder, 'approved.json');
  const originalFetch = global.fetch;
  const keys = ['AMR105_AUTHORIZATION', 'AMR105_DRAW_MISSIONS', 'AMR105_ZONE_FILE', 'AMR105_APPROVED_ROUTE'];
  const originalEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    global.fetch = originalFetch;
    for (const key of keys) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
    rmSync(folder, { recursive: true, force: true });
  });
  const calls = [];
  let activeMapId = mapId;
  let robotState = 'Ready';
  let robotPosition = { x: plan.start[0], y: plan.start[1] };
  let missionActions = [];
  global.fetch = async (url, options) => {
    const path = new URL(url).pathname.replace('/api/v2.0.0', '');
    const body = options.body && JSON.parse(options.body);
    calls.push({ path, body });
    let result;
    if (path === '/status') result = { map_id: activeMapId, state_text: robotState,
      position: robotPosition };
    else if (path === '/mission_groups') result = [{ name: 'tem_mission', guid: 'group' }];
    else if (path === '/actions/move') result = { parameters: [{ id: 'position' }] };
    else if (path === '/positions') result = { guid: 'target' };
    else if (path === '/missions') { missionActions = []; result = { guid: 'mission' }; }
    else if (path === '/missions/mission/actions') {
      if (body) missionActions.push(body);
      result = body ? body : missionActions;
    } else if (path === '/mission_queue') result = { id: 9 };
    else throw new Error('Unexpected endpoint ' + path);
    return { ok: true, json: async () => result };
  };
  process.env.AMR105_AUTHORIZATION = 'test-only';
  process.env.AMR105_DRAW_MISSIONS = '1';
  process.env.AMR105_ZONE_FILE = file;
  delete process.env.AMR105_APPROVED_ROUTE;
  const modulePath = require.resolve('./server.cjs');
  delete require.cache[modulePath];
  const server = require('./server.cjs');
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));

  for (const invalid of [null, { ...snapshot([]), mapId: 'wrong' }, snapshot([null]),
    snapshot([{ name: 'flat', polygon: [[0, 0], [1, 0], [2, 0]] }])]) {
    writeFileSync(file, JSON.stringify(invalid));
    const result = await post(server, '/mission');
    assert.equal(result.status, 503);
    assert.equal(calls.filter(call => call.body).length, 0);
  }
  process.env.AMR105_ZONE_FILE = join(folder, 'missing.json');
  assert.equal((await post(server, '/mission-preview')).status, 503);
  process.env.AMR105_ZONE_FILE = file;

  writeFileSync(file, JSON.stringify(snapshot([zone])));
  for (const path of ['/mission-preview', '/mission']) {
    const result = await post(server, path);
    assert.equal(result.status, 422);
    assert.equal(result.body.invalidWaypoints[0].name, 'P1');
    assert.deepEqual(result.body.invalidWaypoints[0].zones, ['Forbidden Lab']);
    assert.equal(calls.filter(call => call.body).length, 0);
  }
  const enclosing = { name: 'inside', polygon: [
    [target.pos_x - 1, target.pos_y - 1], [target.pos_x + 1, target.pos_y - 1],
    [target.pos_x + 1, target.pos_y + 1], [target.pos_x - 1, target.pos_y + 1],
  ] };
  writeFileSync(file, JSON.stringify(snapshot([enclosing])));
  assert.throws(() => validateRouteZones(plan, mapId, file), /P1/);

  writeFileSync(file, JSON.stringify(snapshot([])));
  activeMapId = 'another-active-map';
  assert.equal((await post(server, '/mission-preview')).status, 409);
  assert.equal((await post(server, '/mission')).status, 409);
  assert.equal(calls.filter(call => call.body).length, 0);
  activeMapId = mapId;
  const originalPosition = robotPosition;
  robotPosition = { ...originalPosition, x: originalPosition.x + 20 };
  for (const path of ['/mission-preview', '/mission']) {
    const blocked = await post(server, path);
    assert.equal(blocked.status, 409);
    assert.equal(blocked.body.code, 'START_TOO_FAR');
    assert.equal(blocked.body.distanceMeters, 20);
    assert.equal(blocked.body.maxDistanceMeters, 0.6);
  }
  robotPosition = null;
  assert.equal((await post(server, '/mission-preview')).body.code, 'POSITION_UNAVAILABLE');
  robotPosition = originalPosition;
  robotState = 'Stopped';
  assert.equal((await post(server, '/mission-preview')).body.code, 'ROBOT_NOT_READY');
  robotState = 'Ready';
  assert.equal(calls.filter(call => call.body).length, 0);
  const preview = await post(server, '/mission-preview');
  assert.equal(preview.status, 200);
  assert.deepEqual(preview.body.waypoints, plan.waypoints);
  assert.equal(preview.body.validation.revision, 'test-reviewed-v1');
  assert.equal(calls.filter(call => call.body).length, 0);
  robotPosition = { ...originalPosition, x: originalPosition.x + 1 };
  assert.equal((await post(server, '/mission')).body.code, 'START_TOO_FAR');
  assert.equal(calls.filter(call => call.body).length, 0);
  robotPosition = originalPosition;
  writeFileSync(file, JSON.stringify(snapshot([zone])));
  assert.equal((await post(server, '/mission')).status, 422);
  assert.equal(calls.filter(call => call.body).length, 0);
  writeFileSync(file, '\uFEFF' + JSON.stringify(snapshot([])));
  const submitted = await post(server, '/mission');
  assert.equal(submitted.status, 201);
  assert.equal(calls.filter(call => call.path === '/positions' && call.body).length, 1);
  assert.equal(calls.filter(call => call.path === '/mission_queue' && call.body).length, 1);

  process.env.AMR105_DRAW_MISSIONS = '0';
  writeFileSync(approved, JSON.stringify({ mapId, missionId: '12345678-1234-1234-1234-123456789abc', points }));
  process.env.AMR105_APPROVED_ROUTE = approved;
  delete process.env.AMR105_ZONE_FILE;
  delete require.cache[modulePath];
  const bound = require('./server.cjs');
  bound.listen(0, '127.0.0.1');
  await once(bound, 'listening');
  t.after(() => new Promise(resolve => bound.close(resolve)));
  calls.length = 0;
  assert.equal((await post(bound, '/mission')).status, 201);
  assert.deepEqual(calls.filter(call => call.body).map(call => call.path), ['/mission_queue']);
});
