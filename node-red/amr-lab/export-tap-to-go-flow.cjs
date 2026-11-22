const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const sourceDir = join(__dirname, '../../amr-route-lab');
const page = readFileSync(join(sourceDir, 'tap-to-go.html'), 'utf8');
const planner = readFileSync(join(sourceDir, 'tap-to-go-planner.cjs'), 'utf8')
  .replace(/\s+module\.exports = \{ planTapToGo, scenario \};\s*$/, '');
const tabId = 'capstone-amr-tap-to-go';
const flow = [
  { id: tabId, type: 'tab', label: 'Capstone AMR Tap to Go', disabled: false,
    info: 'คำนวณเส้นทางจำลองบน Floor 9 โดยใช้ข้อมูลผังจาก Node-RED เดียวกัน' },
  { id: 'amr-tap-ui-in', type: 'http in', name: 'เปิดหน้าแตะจุดหมาย', url: '/amr/tap-to-go',
    method: 'get', upload: false, x: 165, y: 100, wires: [['amr-tap-ui']] },
  { id: 'amr-tap-ui', type: 'template', name: 'หน้าแตะจุดหมายจำลอง', field: 'payload', fieldType: 'msg',
    format: 'html', syntax: 'plain', template: page, output: 'str', x: 400, y: 100, wires: [['amr-tap-ui-out']] },
  { id: 'amr-tap-ui-out', type: 'http response', name: 'ตอบ HTML', statusCode: '200',
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, x: 650, y: 100, wires: [] },
  { id: 'amr-tap-plan-in', type: 'http in', name: 'รับจุดหมายจำลอง', url: '/amr/tap-to-go/plan',
    method: 'post', upload: false, x: 165, y: 200, wires: [['amr-tap-reference']] },
  { id: 'amr-tap-reference', type: 'http request', name: 'อ่าน Floor 9 Reference', method: 'GET',
    ret: 'obj', paytoqs: 'ignore', url: 'http://127.0.0.1:1880/amr/floor9/reference.json', senderr: false,
    x: 400, y: 200, wires: [['amr-tap-planner']] },
  { id: 'amr-tap-planner', type: 'function', name: 'หาเส้นทางสั้นสุดบนผังจำลอง', outputs: 1,
    func: planner + `

try {
  const reference = msg.statusCode === 200 ? msg.payload : null;
  const result = planTapToGo(reference, msg.req.body);
  msg.statusCode = result.status;
  msg.payload = result.body;
} catch (error) {
  node.warn(error.message);
  msg.statusCode = 503;
  msg.payload = { code: 'REFERENCE_UNAVAILABLE', message: 'ข้อมูลผังจำลองไม่พร้อม กรุณาตรวจ Floor 9 ใน Node-RED' };
}
msg.headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
return msg;`, timeout: 5, x: 675, y: 200, wires: [['amr-tap-plan-out']] },
  { id: 'amr-tap-plan-out', type: 'http response', name: 'ตอบผลคำนวณ', statusCode: '',
    headers: {}, x: 915, y: 200, wires: [] },
].map(node => node.type === 'tab' ? node : { ...node, z: tabId });

const file = join(__dirname, 'amr-tap-to-go.flow.json');
writeFileSync(file, JSON.stringify(flow, null, 2) + '\n');
console.log(file);
