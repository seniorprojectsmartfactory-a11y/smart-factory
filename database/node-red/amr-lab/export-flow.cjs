const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const routeLab = join(__dirname, '../../../robotics/amr/route-lab');
const webApp = join(__dirname, '../../../dashboard/web-app');
const joystick = process.argv.includes('--joystick');
const flowFile = join(__dirname, joystick ? 'amr-joystick.flow.json' : 'amr-route-editor.flow.json');
const source = JSON.parse(readFileSync(join(__dirname, 'route-editor.seed.json'), 'utf8'));
const editorIds = new Set([
  'capstone-amr-route', 'amr-editor-request', 'amr-editor-template', 'amr-editor-response',
]);
const flow = source.filter(node => editorIds.has(node.id));
const template = flow.find(node => node.id === 'amr-editor-template');
const mapImagePath = 'maps/floor9/floor9-clean-plan.png';
const image = readFileSync(join(routeLab, mapImagePath)).toString('base64');
const page = readFileSync(join(webApp, joystick ? 'joystick-preview.html' : 'curve-preview.html'), 'utf8');
const mapReference = 'href="../../robotics/amr/route-lab/' + mapImagePath + '"';
if (!page.includes(mapReference)) {
  throw new Error('Cannot embed the floor map because its reference changed');
}
template.template = page.replace(mapReference, 'href="data:image/png;base64,' + image + '"');

if (joystick) {
  const [tab, request, , response] = flow;
  tab.id = 'capstone-amr-joystick';
  tab.label = 'Capstone AMR Joystick';
  tab.info = 'ตัวอย่างหน้าจอ joystick สำหรับรถจำลองสามคัน';
  request.id = 'amr-joystick-request';
  request.name = 'เปิดหน้า Joystick';
  request.url = '/amr/joystick';
  template.id = 'amr-joystick-template';
  template.name = 'หน้า Joystick AMR จำลอง';
  response.id = 'amr-joystick-response';
  request.z = template.z = response.z = tab.id;
  request.wires = [[template.id]];
  template.wires = [[response.id]];
}

writeFileSync(flowFile, JSON.stringify(flow, null, 2) + '\n');
console.log(flowFile);
