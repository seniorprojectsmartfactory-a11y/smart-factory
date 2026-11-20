const { randomUUID } = require('node:crypto');

function validPoints(points) {
  return Array.isArray(points) && points.length >= 2 && points.length <= 3000
    && points.every(point => Array.isArray(point) && point.length === 2
      && point.every(Number.isInteger) && point[0] >= 0 && point[0] <= 1196
      && point[1] >= 0 && point[1] <= 583);
}

function toMiRPoint([u, v]) {
  const along = ((u - 130) * 880 + (v - 160) * 20) / 774800;
  const right = ((v - 160) * 880 - (u - 130) * 20) / 774800;
  const dx = 114.392159 - 46.820227;
  const dy = 92.047727 - 95.039205;
  return [46.820227 + along * dx + right * dy, 95.039205 + along * dy - right * dx];
}

function simplify(points) {
  const first = points[0];
  const last = points.at(-1);
  const dx = last[0] - first[0];
  const dy = last[1] - first[1];
  const lengthSquared = dx * dx + dy * dy;
  let distance = 2;
  let split = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const x = points[i][0] - first[0];
    const y = points[i][1] - first[1];
    const t = lengthSquared ? Math.max(0, Math.min(1, (x * dx + y * dy) / lengthSquared)) : 0;
    const deviation = Math.hypot(x - dx * t, y - dy * t);
    if (deviation > distance) {
      distance = deviation;
      split = i;
    }
  }
  if (!split) return [first, last];
  return [...simplify(points.slice(0, split + 1)).slice(0, -1), ...simplify(points.slice(split))];
}

function planRoute(points) {
  if (!validPoints(points)) return null;
  const distinct = points.filter((point, index) => !index ||
    point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1]);
  if (distinct.length < 2) return null;
  const controlPoints = simplify(distinct);
  if (controlPoints.length > 13) return null;
  const coordinates = controlPoints.map(toMiRPoint);
  const waypoints = coordinates.slice(1).map(([x, y], index) => {
    const [previousX, previousY] = coordinates[index];
    const round = value => Math.round(value * 100) / 100;
    return {
      pos_x: round(x),
      pos_y: round(y),
      orientation: round(Math.atan2(y - previousY, x - previousX) * 180 / Math.PI),
    };
  });
  return { start: coordinates[0], waypoints, controlPoints };
}

async function prepareMission(callMiR, mapId, plan) {
  const groups = await callMiR('/mission_groups');
  const group = groups.find(entry => entry.name === 'tem_mission');
  const move = await callMiR('/actions/move');
  if (!group?.guid || !move.parameters?.some(parameter => parameter.id === 'position')) {
    throw new Error('MiR mission group or Move schema unavailable');
  }
  const label = 'Route Lab ' + randomUUID().slice(0, 12);
  const positions = [];
  for (const [index, waypoint] of plan.waypoints.entries()) {
    const position = await callMiR('/positions', {
      ...waypoint, map_id: mapId, type_id: 0, name: label + ' P' + (index + 1),
    });
    if (!position.guid) throw new Error('Position creation could not be verified');
    positions.push(position.guid);
  }
  const mission = await callMiR('/missions', { name: label, group_id: group.guid, hidden: false });
  if (!mission.guid) throw new Error('Mission creation could not be verified');
  const actionPath = '/missions/' + mission.guid + '/actions';
  for (const [priority, position] of positions.entries()) {
    const parameters = move.parameters.flatMap(parameter => {
      if (parameter.id === 'position') return [{ id: 'position', value: position }];
      return Object.hasOwn(parameter.constraints ?? {}, 'default')
        ? [{ id: parameter.id, value: parameter.constraints.default }] : [];
    });
    await callMiR(actionPath, { mission_id: mission.guid, action_type: 'move', priority, parameters });
  }
  const actions = await callMiR(actionPath);
  actions.sort((a, b) => a.priority - b.priority);
  if (actions.length !== positions.length || !actions.every((action, index) =>
    action.action_type === 'move' && action.parameters?.some(parameter =>
      parameter.id === 'position' && parameter.value === positions[index]))) {
    throw new Error('Move actions could not be verified');
  }
  return mission.guid;
}

module.exports = { planRoute, prepareMission };
