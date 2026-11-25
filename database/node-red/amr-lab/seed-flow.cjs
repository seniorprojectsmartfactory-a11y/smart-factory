const { existsSync, readFileSync, renameSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const flowPath = join('/data', process.env.FLOWS);
const githubFlowPath = '/opt/github/flows.json';

function loadGithubFlows() {
  const flows = JSON.parse(readFileSync(githubFlowPath, 'utf8'));
  return flows.map(node => {
    if (node.type === 'tab') return { ...node, disabled: true };
    if (!node.z) return { ...node, d: true };
    return node;
  });
}

function seedFlows() {
  if (existsSync(flowPath)) return;
  const prototypes = ['amr-route-editor.flow.json', 'amr-joystick.flow.json',
    'floor9-reference.flow.json', 'amr-tap-to-go.flow.json'];
  const flows = prototypes.flatMap(filename => JSON.parse(readFileSync(join(__dirname, filename), 'utf8')));

  const temporaryFlowPath = flowPath + '.seed';
  writeFileSync(temporaryFlowPath, JSON.stringify([...flows, ...loadGithubFlows()], null, 2) + '\n');
  renameSync(temporaryFlowPath, flowPath);
}

async function mergeGithubFlows() {
  const url = 'http://127.0.0.1:1880/flows';
  const headers = { 'Node-RED-API-Version': 'v2' };
  const currentResponse = await fetch(url, { headers });
  if (!currentResponse.ok) throw new Error('Cannot read current Node-RED flows: ' + currentResponse.status);
  const { rev, flows } = await currentResponse.json();
  const github = loadGithubFlows();
  const ids = new Set(flows.map(node => node.id));
  const existingCount = github.filter(node => ids.has(node.id)).length;
  if (existingCount === github.length) return console.log('GitHub flows are already present.');
  if (existingCount !== 0) throw new Error('Partial overlap with existing IDs. Review those nodes before importing.');
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', 'Node-RED-Deployment-Type': 'nodes' },
    body: JSON.stringify({ rev, flows: [...flows, ...github] }),
  });
  if (!response.ok) throw new Error('Cannot import GitHub flows: ' + response.status + ' ' + await response.text());
  console.log('Imported ' + github.filter(node => node.type === 'tab').length + ' GitHub tabs.');
}

if (process.argv.includes('--merge-github')) {
  mergeGithubFlows().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
} else {
  seedFlows();
}
