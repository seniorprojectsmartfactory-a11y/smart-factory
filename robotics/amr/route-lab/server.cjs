const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { planRoute, prepareMission } = require('./drawn-mission.cjs');
const { validateRouteZones, RouteValidationError } = require('./route-zones.cjs');

const liveMapUrl = 'http://127.0.0.1:1880/smart-factory/live-map';
const pages = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/floor9.png': ['floor9.png', 'image/png'],
};
const floorImage = readFileSync(join(__dirname, 'floor9.png')).toString('base64');
const origin = 'http://127.0.0.1:1881';
const maxStartDistanceMeters = 0.6;
const mirApi = process.env.AMR105_API_URL || 'http://192.0.2.105/api/v2.0.0';
const mapId = '15b69c6d-9e08-11f0-92e7-0001299a3e90';
const authorization = process.env.AMR105_AUTHORIZATION;
const approvedRoute = process.env.AMR105_APPROVED_ROUTE
  ? JSON.parse(readFileSync(process.env.AMR105_APPROVED_ROUTE, 'utf8'))
  : null;
const drawEnabled = !!authorization && process.env.AMR105_DRAW_MISSIONS === '1';
const bindingEnabled = !!authorization && approvedRoute?.mapId === mapId
  && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(approvedRoute.missionId)
  && Array.isArray(approvedRoute.points) && approvedRoute.points.length >= 2
  && approvedRoute.points.every(point => Array.isArray(point) && point.length === 2
    && point.every(Number.isInteger) && point[0] >= 0 && point[0] <= 1196
    && point[1] >= 0 && point[1] <= 583);
let submitting = false;
let submissionNeedsReview = false;
let lastQueueId = null;

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  }).end(JSON.stringify(body));
}

async function sendMission(request, response, preview) {
  if (request.headers.origin !== origin || request.headers['content-type'] !== 'application/json') {
    return json(response, 403, { message: 'เปิด Route Lab จากลิงก์บนเครื่อง Lab' });
  }
  if (!drawEnabled && !bindingEnabled) {
    return json(response, 503, { message: 'รอตั้งค่า Mission ที่ตรวจแล้วและสิทธิ์ส่งภารกิจสำหรับ MiR .105' });
  }
  if (submitting || submissionNeedsReview) {
    return json(response, 409, { message: 'ให้ตรวจ Mission Queue บนหน้า MiR ก่อนส่งอีกครั้ง' });
  }
  let route;
  try {
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 200000) return json(response, 413, { message: 'เส้นทางมีข้อมูลมากเกินไป' });
    }
    route = JSON.parse(body);
  } catch {
    return json(response, 400, { message: 'อ่านข้อมูลเส้นทางไม่ได้' });
  }
  const plan = route?.robot === '.105' && drawEnabled ? planRoute(route.points) : null;
  if (route?.robot !== '.105' || (drawEnabled ? !plan
    : JSON.stringify(route.points) !== JSON.stringify(approvedRoute.points))) {
    return json(response, 422, { message: 'เส้นทางนี้ยังไม่ตรงกับเส้นที่ตรวจและผูกกับ Mission ของ MiR .105' });
  }
  if (submitting || submissionNeedsReview) {
    return json(response, 409, { message: 'ให้ตรวจ Mission Queue บนหน้า MiR ก่อนส่งอีกครั้ง' });
  }
  submitting = true;
  let phase = 'status';
  try {
    const headers = {
      Authorization: authorization,
      'Accept-Language': 'en_US',
      'Content-Type': 'application/json',
    };
    async function callMiR(path, body) {
      const result = await fetch(mirApi + path, {
        headers, redirect: 'error', signal: AbortSignal.timeout(4000),
        ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}),
      });
      if (!result.ok) throw new Error('MiR did not accept ' + path);
      return result.json();
    }
    async function readStartBlock() {
      const status = await callMiR('/status');
      if (status.map_id !== mapId) {
        return { code: 'MAP_MISMATCH', message: 'แผนที่ที่ MiR ใช้งานไม่ตรงกับแผนที่ Route Lab' };
      }
      if (preview && !plan) return null;
      if (status.state_text !== 'Ready') {
        const robotState = status.state_text || null;
        return { code: 'ROBOT_NOT_READY', robotState,
          message: 'MiR ยังไม่พร้อมส่งภารกิจ · สถานะ: ' + (robotState || 'ไม่ทราบ') };
      }
      if (!plan) return null;
      const { x, y } = status.position ?? {};
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return { code: 'POSITION_UNAVAILABLE', message: 'ยังไม่มีพิกัดปัจจุบันของ MiR ที่ใช้ตรวจจุดเริ่มได้' };
      }
      const distanceMeters = Math.hypot(x - plan.start[0], y - plan.start[1]);
      if (distanceMeters > maxStartDistanceMeters) {
        return { code: 'START_TOO_FAR', distanceMeters, maxDistanceMeters: maxStartDistanceMeters,
          message: 'MiR อยู่ห่างจุดเริ่ม ' + distanceMeters.toFixed(2) + ' ม. (กำหนดไม่เกิน '
            + maxStartDistanceMeters + ' ม.) กรุณาตั้งจุดเริ่มใหม่ที่ตำแหน่งรถบนแผนที่' };
      }
      return null;
    }
    const validation = plan
      ? validateRouteZones(plan, mapId, process.env.AMR105_ZONE_FILE)
      : null;
    const startBlock = await readStartBlock();
    if (startBlock) return json(response, 409, startBlock);
    if (preview) {
      return json(response, 200, { waypoints: plan?.waypoints ?? [], validation });
    }
    if (lastQueueId !== null) {
      const previous = await callMiR('/mission_queue/' + encodeURIComponent(lastQueueId));
      if (!['Done', 'Aborted', 'Failed'].includes(previous.state)) {
        return json(response, 409, { message: 'ภารกิจก่อนหน้ายังไม่จบ กรุณาตรวจ Mission Queue' });
      }
      lastQueueId = null;
    }
    phase = 'prepare';
    const missionId = plan ? await prepareMission(callMiR, mapId, plan) : approvedRoute.missionId;
    if (plan) {
      const changedStart = await readStartBlock();
      if (changedStart) return json(response, 409, { ...changedStart,
        message: 'เตรียม Mission แล้ว แต่ยังไม่ได้เข้าคิว · ' + changedStart.message });
    }
    submissionNeedsReview = true;
    const entry = await callMiR('/mission_queue', { mission_id: missionId });
    if (entry.id == null) throw new Error('Mission queue ID unavailable');
    lastQueueId = entry.id;
    submissionNeedsReview = false;
    json(response, 201, { message: 'MiR .105 รับภารกิจเข้าคิวแล้ว · คิว ' + entry.id });
  } catch (error) {
    if (error instanceof RouteValidationError) {
      return json(response, error.status, { message: error.message, ...error.details });
    }
    json(response, 502, { message: submissionNeedsReview
      ? 'ยังยืนยันผลการส่งไม่ได้ กรุณาตรวจ Mission Queue บนหน้า MiR'
      : phase === 'prepare' ? 'สร้างหรือยืนยัน Mission ไม่สำเร็จ กรุณาตรวจรายการ Route Lab บน MiR'
      : 'อ่านสถานะล่าสุดจาก MiR .105 ไม่ได้' });
  } finally {
    submitting = false;
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'POST' && ['/mission', '/mission-preview'].includes(request.url)) {
    await sendMission(request, response, request.url === '/mission-preview');
    return;
  }
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' }).end();
    return;
  }
  if (Object.hasOwn(pages, request.url)) {
    const [file, type] = pages[request.url];
    const body = readFileSync(join(__dirname, file));
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' }).end(body);
    return;
  }
  if (request.url === '/mission') {
    json(response, 200, {
      enabled: (drawEnabled || bindingEnabled) && !submissionNeedsReview,
      drawn: drawEnabled,
      points: bindingEnabled ? approvedRoute.points : null,
    });
    return;
  }
  if (request.url !== '/positions') {
    response.writeHead(404).end();
    return;
  }

  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  try {
    const upstream = await fetch(liveMapUrl, { signal: AbortSignal.timeout(2500) });
    if (!upstream.ok) throw new Error('Live Map is unavailable');
    const html = await upstream.text();
    if (!html.includes('data:image/png;base64,' + floorImage)) {
      throw new Error('Live Map background differs from the Route Lab map');
    }
    // The renderer only emits markers for fresh, calibrated positions within the map.
    const positions = {};
    const markerPattern = /<g transform="translate\((\d+(?:\.\d+)?) (\d+(?:\.\d+)?)\)"><title>(\.(?:105|201))\s/g;
    for (const [, x, y, id] of html.matchAll(markerPattern)) {
      positions[id] = [Number(x), Number(y)];
    }
    response.writeHead(200, headers).end(JSON.stringify(positions));
  } catch {
    response.writeHead(502, headers).end('{}');
  }
});

if (require.main === module) {
  server.listen(1881, '127.0.0.1', () => {
    console.log('AMR Route Lab: http://127.0.0.1:1881/');
  });
}
module.exports = server;
