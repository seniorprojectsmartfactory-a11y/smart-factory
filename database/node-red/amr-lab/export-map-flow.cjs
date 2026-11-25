const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const mapsDirectory = join(__dirname, '../../../robotics/amr/route-lab/maps');
const mapDirectory = join(mapsDirectory, 'floor9');
const catalog = JSON.parse(readFileSync(join(mapsDirectory, 'map-catalog.seed.json'), 'utf8'));
const reference = JSON.parse(readFileSync(join(mapDirectory, 'reference.json'), 'utf8'));
const defaultMap = catalog.maps.find(map => map.id === catalog.defaultMapId);
const defaultReference = defaultMap?.references.find(item => item.id === defaultMap.defaultReferenceId);
if (defaultReference?.id !== reference.id
    || defaultReference.status !== reference.validation.status
    || defaultReference.fieldVerified !== reference.validation.fieldVerified
    || defaultReference.navigationEnabled !== reference.validation.navigationEnabled) {
  throw new Error('The default catalog entry does not match the Floor 9 reference.');
}
const image = readFileSync(join(mapDirectory, reference.image.filename));
reference.image.dataUrl = 'data:image/png;base64,' + image.toString('base64');
const page = readFileSync(join(mapDirectory, 'reference-view.html'), 'utf8')
  .replace("'./reference.json'", "'/amr/floor9/reference.json'");
const tabId = 'capstone-amr-floor9-reference';
const tab = { id: tabId, type: 'tab', label: 'Capstone Floor 9 Reference', disabled: false,
  info: 'ผังอ้างอิงฉบับถอดจากภาพสำหรับ UI และตรวจข้อมูลพิกัด' };

function responseFlow(key, name, url, payload, format, contentType, y) {
  const requestId = tabId + '-' + key + '-request';
  const templateId = tabId + '-' + key + '-template';
  const responseId = tabId + '-' + key + '-response';
  return [
    { id: requestId, type: 'http in', z: tabId, name, url, method: 'get', upload: false,
      x: 180, y, wires: [[templateId]] },
    { id: templateId, type: 'template', z: tabId, name, field: 'payload', fieldType: 'msg',
      format, syntax: 'plain', template: payload, output: 'str', x: 410, y, wires: [[responseId]] },
    { id: responseId, type: 'http response', z: tabId, name: 'ตอบ ' + format.toUpperCase(),
      statusCode: '200', headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store' },
      x: 630, y, wires: [] },
  ];
}

const flow = [
  tab,
  ...responseFlow('viewer', 'เปิดผังตรวจตำแหน่ง', '/amr/floor9/map', page, 'html', 'text/html; charset=utf-8', 100),
  ...responseFlow('data', 'ข้อมูลพิกัดชั้น 9', '/amr/floor9/reference.json', JSON.stringify(reference),
    'json', 'application/json; charset=utf-8', 180),
  ...responseFlow('catalog', 'รายการแผนที่', '/amr/maps', JSON.stringify(catalog),
    'json', 'application/json; charset=utf-8', 260),
];
const destination = join(__dirname, 'floor9-reference.flow.json');
writeFileSync(destination, JSON.stringify(flow, null, 2) + '\n');
console.log(destination);
