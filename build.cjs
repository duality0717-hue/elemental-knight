const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8').replace(/\r\n/g, '\n');
const fragment = read('src/ui.html') + '\n<style>\n' + read('src/style.css') + '\n</style>\n<script>\n' +
  ['src/engine.js', 'src/painter.js', 'src/view.js'].map(read).join('\n') + '\n</script>\n';
fs.writeFileSync(path.join(__dirname, 'game.html'), fragment);
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const original = escape(read('versions/v0.1.0/game.html'));
const template = read('versions/v0.1.0/index.html');
if (!template.includes(original)) throw new Error('No se encontró el juego original dentro de la plantilla.');
const title = 'Elemental Knight - La Cripta de Brasas';
const output = template.replace(original, escape(read('game.html')))
  .replace(/<title>.*?<\/title>/g, '<title>' + title + '</title>')
  .replace(/&lt;title&gt;.*?&lt;\/title&gt;/g, '&lt;title&gt;' + title + '&lt;/title&gt;');
fs.writeFileSync(path.join(__dirname, 'index.html'), output);
console.log('index.html actualizado.');
