const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8').replace(/\r\n/g, '\n');
const fragment = read('src/ui.html') + '\n<style>\n' + read('src/style.css') + '\n</style>\n<script>\n' +
  ['src/engine.js', 'src/save.js', 'src/painter.js', 'src/view.js', 'src/updates.js'].map(read).join('\n') + '\n</script>\n';
fs.writeFileSync(path.join(__dirname, 'game.html'), fragment);
// Standalone document: browser storage and fullscreen share the game's origin.
const output = '<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Elemental Knight</title><style>html,body{margin:0;background:#090f16;color-scheme:dark}</style></head><body>\n' + fragment + '\n</body></html>';
fs.writeFileSync(path.join(__dirname, 'index.html'), output);
console.log('index.html actualizado.');
