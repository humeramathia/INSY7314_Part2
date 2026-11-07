'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const out = path.join(dist, 'hustlehub-plus-deployment.zip');

fs.mkdirSync(dist, { recursive: true });
if (fs.existsSync(out)) {
  fs.unlinkSync(out);
}

execFileSync(
  'git',
  ['archive', '--format=zip', '--prefix=hustlehub-plus/', `--output=${out}`, 'HEAD'],
  { cwd: root, stdio: 'inherit' }
);

const bytes = fs.statSync(out).size;
if (bytes < 1024) {
  throw new Error(`Deployment zip is too small (${bytes} bytes)`);
}

process.stdout.write(`Wrote ${out} (${bytes} bytes)\n`);
