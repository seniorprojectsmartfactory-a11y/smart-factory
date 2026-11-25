const { readFileSync } = require('node:fs');

class RouteValidationError extends Error {
  constructor(message, status = 422, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[j];
    const [bx, by] = polygon[i];
    const cross = (x - ax) * (by - ay) - (y - ay) * (bx - ax);
    if (Math.abs(cross) <= 1e-9 && x >= Math.min(ax, bx) - 1e-9
        && x <= Math.max(ax, bx) + 1e-9 && y >= Math.min(ay, by) - 1e-9
        && y <= Math.max(ay, by) + 1e-9) return true;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) {
      inside = !inside;
    }
  }
  return inside;
}

function validateRouteZones(plan, mapId, file) {
  const unavailable = () => new RouteValidationError(
    'ยังไม่มีข้อมูล Forbidden Zone ที่ตรวจแล้วสำหรับแผนที่นี้ กรุณาตรวจไฟล์ AMR105_ZONE_FILE', 503);
  let snapshot;
  try {
    snapshot = JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    throw unavailable();
  }
  if (!snapshot || typeof snapshot !== 'object' || snapshot.mapId !== mapId || snapshot.coordinateFrame !== 'mir-map-meters'
      || typeof snapshot.revision !== 'string' || !snapshot.revision.trim()
      || typeof snapshot.verifiedAt !== 'string' || !Number.isFinite(Date.parse(snapshot.verifiedAt))
      || !Array.isArray(snapshot.forbiddenZones)) throw unavailable();
  for (const zone of snapshot.forbiddenZones) {
    if (!zone || typeof zone.name !== 'string' || !zone.name || !Array.isArray(zone.polygon)
        || zone.polygon.length < 3 || !zone.polygon.every(point => Array.isArray(point)
          && point.length === 2 && point.every(Number.isFinite))) throw unavailable();
    const area = zone.polygon.reduce((sum, [x, y], index, points) => {
      const [nextX, nextY] = points[(index + 1) % points.length];
      return sum + x * nextY - nextX * y;
    }, 0);
    if (Math.abs(area) < 1e-9) throw unavailable();
  }
  const invalidWaypoints = [];
  plan.waypoints.forEach((point, index) => {
    const zones = snapshot.forbiddenZones.filter(zone =>
      pointInPolygon(point.pos_x, point.pos_y, zone.polygon)).map(zone => zone.name);
    if (zones.length) invalidWaypoints.push({
      name: 'P' + (index + 1), ...point, zones,
    });
  });
  if (invalidWaypoints.length) {
    const description = invalidWaypoints.map(point =>
      point.name + ' (X ' + point.pos_x + ', Y ' + point.pos_y + ') อยู่ใน ' + point.zones.join(', ')).join(' / ');
    throw new RouteValidationError('ส่งไม่ได้: ' + description, 422, { invalidWaypoints });
  }
  return { source: 'lab-verified-snapshot', revision: snapshot.revision, verifiedAt: snapshot.verifiedAt, mapId };
}

module.exports = { validateRouteZones, RouteValidationError };
