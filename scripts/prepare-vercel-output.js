const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'frontend', 'build');
const outputDir = path.join(rootDir, '.vercel', 'output');
const staticDir = path.join(outputDir, 'static');

if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
  throw new Error(`Missing React build output at ${buildDir}`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(staticDir, { recursive: true });
fs.cpSync(buildDir, staticDir, { recursive: true });

fs.writeFileSync(
  path.join(outputDir, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' }
    ]
  }, null, 2)
);

console.log(`Prepared Vercel static output from ${buildDir}`);
