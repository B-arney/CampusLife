const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  try {
    return execSync(cmd, { cwd: path.resolve(__dirname, '..') }).toString().trim();
  } catch {
    return 'unknown';
  }
}

const branch = process.env.GIT_BRANCH || run('git rev-parse --abbrev-ref HEAD');
const hash = process.env.GIT_HASH || run('git rev-parse --short HEAD');

const content = `export const buildInfo = {
  branch: '${branch}',
  hash: '${hash}',
};
`;

fs.writeFileSync(path.resolve(__dirname, '../src/build-info.ts'), content);
console.log(`Build info: ${branch}@${hash}`);
