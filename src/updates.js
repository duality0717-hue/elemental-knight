(function () {
  const api = window.knightDesktop;
  if (!api) return;
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = 'Configuración';
  document.querySelector('.ek-window-actions').append(button);
  const dialog = document.createElement('dialog');
  dialog.id = 'ek-settings';
  dialog.style.cssText = 'background:#111b28;color:#eee;border:1px solid #b89b60;border-radius:12px;padding:28px;max-width:480px';
  dialog.innerHTML = '<h2>Configuración</h2><p id="ek-app-version"></p><label for="ek-update-mode">Actualizaciones</label> <select id="ek-update-mode"><option value="manual">Manuales</option><option value="automatic">Automáticas</option></select><p>Manual: elegís cuándo buscar, descargar e instalar. Automático: busca al abrir y cada hora, descarga y se instala al cerrar el juego.</p><p>Cambiar a manual evita la instalación al cerrar; una descarga iniciada puede terminar.</p><p id="ek-update-state" role="status"></p><button id="ek-update-check">Buscar actualizaciones</button> <button id="ek-update-download" hidden>Descargar</button> <button id="ek-update-install" hidden>Guardar, instalar y reiniciar</button><p><button id="ek-settings-close">Volver al juego</button></p>';
  document.body.append(dialog);
  const $ = selector => dialog.querySelector(selector);
  function render(s) {
    $('#ek-app-version').textContent = 'Elemental Knight · ' + s.version;
    $('#ek-update-mode').value = s.mode;
    $('#ek-update-state').textContent = s.message;
    $('#ek-update-check').disabled = !s.supported || ['checking','downloading','downloaded'].includes(s.phase);
    $('#ek-update-download').hidden = s.phase !== 'available';
    $('#ek-update-install').hidden = s.phase !== 'downloaded';
  }
  async function run(task) { try { const result = await task(); if(result) render(result); } catch { $('#ek-update-state').textContent = 'No se pudo completar la operación. Intentá de nuevo.'; } }
  button.onclick = () => { window.dispatchEvent(new Event('knight:settings')); dialog.showModal(); run(api.get); };
  $('#ek-settings-close').onclick = () => dialog.close();
  $('#ek-update-mode').onchange = e => run(() => api.setMode(e.target.value));
  $('#ek-update-check').onclick = () => run(api.check);
  $('#ek-update-download').onclick = () => run(api.download);
  $('#ek-update-install').onclick = () => { document.querySelector('#ek-save').click(); run(api.install); };
  api.subscribe(render); run(api.get);
})();
