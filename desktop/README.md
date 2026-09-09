# Elemental Knight para Windows — 0.7.0

Instalar `Elemental-Knight-Setup-0.7.0.exe` en Windows de 64 bits. Windows 10 o posterior.

Configuración permite elegir actualizaciones manuales (predeterminado) o automáticas. Manual no consulta ni descarga al iniciar: usá Buscar, Descargar e Instalar. Automático consulta al iniciar y cada hora, descarga y aplica al cerrar. Nunca reinicia durante una partida por su cuenta. Abrir Configuración pausa y guarda; al volver pulsá Seguir.

Las preferencias y las partidas de escritorio quedan en `%APPDATA%/Elemental Knight`, fuera de la instalación. No se eliminan al actualizar. Se conserva el formato de guardado v1. Las partidas previas de Chrome/Edge o de la computadora de Ignacio no se importan automáticamente.

## Compilar

En Windows con Node.js 22: `npm ci`, `npm test`, `npm run dist:win`. El instalador y los metadatos están en `dist/`.

## Publicar una actualización

Incrementar `version` en package.json con `npm version patch --no-git-tag-version`, guardar package-lock.json y el código en GitHub. Crear y subir una etiqueta que coincida con la versión, por ejemplo v0.7.1. El workflow Windows installer compila, prueba y crea una GitHub Release con el instalador, el blockmap y latest.yml. No publicar solo el EXE: latest.yml es necesario para el actualizador.

Una ejecución manual del workflow genera artefactos descargables pero no publica una Release. La versión instalada consulta Releases públicas de duality0717-hue/elemental-knight. Sin una Release con latest.yml no hay un canal funcional para consultar. Nunca se incluyen tokens en el instalador.

Esta compilación no tiene firma de editor. Para distribuir comercialmente, configurar firma de código en el proceso de compilación. Antes de distribuir, probar instalación, guardado, desinstalación conservando datos y una actualización real entre dos versiones en Windows. Los tests con simulación no sustituyen esa prueba.
