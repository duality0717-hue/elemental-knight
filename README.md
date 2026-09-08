# Elemental Knight · La Cripta de Brasas

Juego de mazmorras en pixel art. Abrí **index.html** en un navegador para jugar; no necesita instalación ni servidor.

## Versiones

- **v0.1.0 — Primera versión inicial:** tres salas, doce esqueletos de fuego, armadura de hierro y artefactos de escarcha equipados desde el comienzo. Copia original intacta en `versions/v0.1.0/index.html`; fuente en `versions/v0.1.0/game.html`.
- **v0.2.0 — Cofres y oro:** cinco salas, veinticinco esqueletos, inicio sin equipo, combate a puños, cofres aleatorios y oro por bajas. Es la versión de `index.html`.

## Controles

- WASD o flechas: caminar.
- Espacio o botón de ataque: golpear a puños o usar la espada si está equipada. Mantener presionado repite ataques.
- Clic en la mazmorra: apuntar y atacar.
- E o «Abrir cofre»: abrir un cofre cerrado cercano.
- Equipo: revisar las ocho piezas; abre el inventario y pausa la partida. «Seguir» reanuda.
- Botones de dirección y ataque para pantallas táctiles.

## Reglas de v0.2.0

El personaje empieza sin armadura, sin artefactos y con cero oro. Las piezas que no encontraste están bloqueadas. El sprite viste solamente ropa interior hasta equiparse.

Hay tres cofres por sala. Cada cofre hace **una sola tirada independiente** para obtener **una pieza de equipo**:

| Sala | Nombre | Esqueletos | Probabilidad por cofre | Oro por esqueleto |
| --- | --- | ---: | ---: | ---: |
| 1 | La entrada carbonizada | 3 | 5% | 6–10 |
| 2 | El osario | 4 | 10% | 8–12 |
| 3 | El santuario ardiente | 5 | 15% | 10–14 |
| 4 | Las forjas hundidas | 6 | 20% | 12–16 |
| 5 | El trono de ceniza | 7 | 25% | 14–18 |

Si la tirada falla, el cofre está vacío. Si tiene éxito, se elige con la misma probabilidad una pieza que aún no poseés y se equipa automáticamente. No hay equipo garantizado ni duplicados. El porcentaje no se tira por cada espacio de equipo. Un cofre abierto no puede volver a sortearse.

La vida y velocidad de los enemigos aumentan con cada sala. Eliminá a todos para abrir la puerta de la derecha. Al avanzar recuperás hasta 20 de vida y conservás equipo y oro. Cruzar la salida de la quinta sala completa la partida. Reiniciar comienza una nueva partida y borra equipo y oro de esa partida. Esta versión no guarda partidas entre cierres del navegador; el oro todavía no tiene tienda.

## Equipo

**Armadura · Guardián de hierro:** pechera (−3 de daño recibido), botas (+16 de velocidad), casco (−2 de daño recibido) y guantes (+4 de daño). Set completo: +2 de protección.

**Artefactos · Juramento de escarcha:** arma (espada, 24 de daño base y ralentización), anillo (+6 de daño), pulsera (ataques más rápidos) y collar (+6 de vida por baja). Set completo: +10 de daño contra esqueletos de fuego. Los puños causan 16 de daño base y tienen menor alcance que la espada.

## Desarrollo

`game.html` contiene el juego editable; `index.html` es la exportación completa y autónoma para jugar. `versions/v0.1.0` conserva la primera versión sin modificaciones.

Pruebas de reglas y combate: `node tests/game.test.cjs`.

Después de editar `game.html`, ejecutá `node build.cjs` para regenerar `index.html`. Usa la plantilla autónoma conservada con v0.1.0 y no requiere paquetes externos.

El renderizado de pixel art usa Canvas 2D sin recursos externos del juego. La exportación incluye estilos de interfaz para funcionar fuera de la conversación.
