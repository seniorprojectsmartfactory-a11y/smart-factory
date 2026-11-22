const step = 8;
const clearance = 5;
const scenario = {
  referenceId: 'floor9-clean-plan-v1',
  // Approximate boundary traced from the reference image for simulation.
  boundary: [[176,56],[835,56],[835,223],[1244,223],[1244,64],[1840,64],
    [1840,180],[1908,180],[1908,244],[1924,244],[1924,766],[1930,766],
    [1930,901],[164,912],[164,596],[202,596],[202,257],[176,257]],
  doors: ['D-11', 'D-23'],
};

function insidePolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[j];
    const [bx, by] = polygon[i];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

function distanceSquaredToLine(x, y, [ax, ay, bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const fraction = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
  return (x - ax - fraction * dx) ** 2 + (y - ay - fraction * dy) ** 2;
}

function makeWalkability(map, closed) {
  const bucketSize = 64;
  const columns = Math.ceil(map.image.width / bucketSize);
  const buckets = Array.from({ length: columns * Math.ceil(map.image.height / bucketSize) },
    () => ({ lines: [], boxes: [] }));
  const index = (x, y) => Math.floor(x / bucketSize) + Math.floor(y / bucketSize) * columns;

  function add([left, top, right, bottom], type, object) {
    for (let y = Math.floor(top / bucketSize); y <= Math.floor(bottom / bucketSize); y++) {
      for (let x = Math.floor(left / bucketSize); x <= Math.floor(right / bucketSize); x++) {
        buckets[x + y * columns][type].push(object);
      }
    }
  }

  function addLine(line, margin) {
    const [ax, ay, bx, by] = line;
    add([Math.min(ax,bx) - margin, Math.min(ay,by) - margin,
      Math.max(ax,bx) + margin, Math.max(ay,by) + margin], 'lines', [line, margin * margin]);
  }

  for (const wall of map.walls) addLine(wall.centerline, clearance + wall.nominalWidthPx / 2);
  for (const door of map.doors) if (closed.has(door.id)) addLine(door.opening, clearance + 4);
  for (const { rect: [left, top, right, bottom] } of map.areas) {
    const box = [left - clearance, top - clearance, right + clearance, bottom + clearance];
    add(box, 'boxes', box);
  }

  return (x, y) => insidePolygon(x, y, scenario.boundary)
    && !buckets[index(x, y)].boxes.some(([left, top, right, bottom]) =>
      x >= left && x <= right && y >= top && y <= bottom)
    && !buckets[index(x, y)].lines.some(([line, margin]) => distanceSquaredToLine(x, y, line) <= margin);
}

class MinHeap {
  constructor() {
    this.items = [];
  }

  push(entry) {
    let index = this.items.length;
    this.items.push(entry);
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.items[parent].rank <= entry.rank) break;
      this.items[index] = this.items[parent];
      index = parent;
    }
    this.items[index] = entry;
  }

  pop() {
    const first = this.items[0];
    const last = this.items.pop();
    if (this.items.length === 0) return first;
    let index = 0;
    while (index * 2 + 1 < this.items.length) {
      let child = index * 2 + 1;
      if (child + 1 < this.items.length && this.items[child + 1].rank < this.items[child].rank) child++;
      if (last.rank <= this.items[child].rank) break;
      this.items[index] = this.items[child];
      index = child;
    }
    this.items[index] = last;
    return first;
  }
}

function shortestPath(walkable, width, height, start, goal) {
  const columns = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  const size = columns * rows;
  const idFor = ([x, y]) => Math.floor(x / step) + Math.floor(y / step) * columns;
  const center = id => [(id % columns + 0.5) * step, (Math.floor(id / columns) + 0.5) * step];
  const startId = idFor(start);
  const goalId = idFor(goal);
  const [gx, gy] = center(goalId);
  const grid = new Uint8Array(size);
  function canUse(id) {
    if (!grid[id]) grid[id] = walkable(...center(id)) ? 1 : 2;
    return grid[id] === 1;
  }

  // Sample the complete segment, including the short join from the selected pixel to the grid.
  function canJoin(from, to) {
    const samples = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / 2));
    for (let i = 0; i <= samples; i++) {
      if (!walkable(from[0] + (to[0] - from[0]) * i / samples, from[1] + (to[1] - from[1]) * i / samples)) return false;
    }
    return true;
  }

  if (!canJoin(start, center(startId))) return { error: 'START_BLOCKED' };
  if (!canJoin(center(goalId), goal)) return { error: 'GOAL_BLOCKED' };
  const queue = new MinHeap();
  const costs = new Float64Array(size).fill(Infinity);
  const parents = new Int32Array(size).fill(-1);
  const offsets = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  costs[startId] = 0;
  queue.push({ id: startId, cost: 0, rank: 0 });
  while (queue.items.length) {
    const current = queue.pop();
    if (current.cost !== costs[current.id]) continue;
    if (current.id === goalId) {
      const path = [];
      for (let id = goalId; id !== -1; id = parents[id]) path.push(center(id));
      return { path: [start, ...path.reverse(), goal] };
    }
    const col = current.id % columns;
    const row = Math.floor(current.id / columns);
    for (const [dx, dy] of offsets) {
      const x = col + dx;
      const y = row + dy;
      if (x < 0 || x >= columns || y < 0 || y >= rows) continue;
      const id = y * columns + x;
      const diagonal = dx !== 0 && dy !== 0;
      if (!canUse(id) || (diagonal && (!canUse(current.id + dx) || !canUse(current.id + dy * columns)))) continue;
      const cost = current.cost + step * (diagonal ? Math.SQRT2 : 1);
      if (cost >= costs[id] || !canJoin(center(current.id), center(id))) continue;
      costs[id] = cost;
      parents[id] = current.id;
      const [cx, cy] = center(id);
      queue.push({ id, cost, rank: cost + Math.hypot(gx - cx, gy - cy) });
    }
  }
  return { error: 'NO_PATH' };
}

function planTapToGo(map, request) {
  const fail = (status, code, message) => ({ status, body: { code, message } });
  if (!map || map.id !== scenario.referenceId || !map.image || !Array.isArray(map.walls)
      || !Array.isArray(map.doors) || !Array.isArray(map.areas)) {
    return fail(503, 'REFERENCE_UNAVAILABLE', 'ข้อมูลผัง Floor 9 สำหรับการจำลองยังไม่พร้อม');
  }
  if (request?.referenceId !== map.id) return fail(409, 'MAP_MISMATCH', 'รุ่นของผังไม่ตรงกัน กรุณาโหลดหน้าใหม่');
  const { width, height } = map.image;
  const isPoint = point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)
    && point[0] >= 0 && point[0] < width && point[1] >= 0 && point[1] < height;
  const { robotId, start, goal, closedDoors } = request;
  if (![1,2,3].includes(robotId) || !isPoint(start) || !isPoint(goal)
      || !Array.isArray(closedDoors) || closedDoors.some(id => !scenario.doors.includes(id))) {
    return fail(400, 'INVALID_REQUEST', 'ข้อมูลรถ ตำแหน่ง หรือสถานะประตูจำลองไม่ถูกต้อง');
  }
  const result = shortestPath(makeWalkability(map, new Set(closedDoors)), width, height, start, goal);
  if (result.error) {
    const messages = {
      START_BLOCKED: 'ตำแหน่งรถจำลองอยู่ในบริเวณที่ยังผ่านไม่ได้',
      GOAL_BLOCKED: 'แตะปลายทางใหม่ จุดนี้อยู่ในพื้นที่ที่รถจำลองเข้าไม่ถึง',
      NO_PATH: 'ไม่พบทางไปยังจุดหมายเมื่อใช้สถานะประตูปัจจุบัน',
    };
    return fail(422, result.error, messages[result.error]);
  }
  const distancePx = result.path.reduce((length, [x,y], i, path) => i === 0 ? 0
    : length + Math.hypot(x - path[i - 1][0], y - path[i - 1][1]), 0);
  return { status: 200, body: { mode: 'simulation', robotId, referenceId: map.id,
    path: result.path, distancePx: Math.round(distancePx) } };
}

module.exports = { planTapToGo, scenario };
