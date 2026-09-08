# Elemental Knight · La Cripta de Brasas — v0.4.0

## Cambios de v0.4.0 — A los golpes

Rediseño visual original de dibujos animados, inspirado en la energía y las proporciones caricaturescas de El Bruto: cabezas grandes, trazos suaves, expresiones y movimiento de extremidades. No se incorporan gráficos del juego de referencia.

Se reemplazó el renderizador de pixel art por dibujo vectorial en Canvas a 1440 × 816, conservando el espacio lógico de combate de 480 × 272. Incluye caminar, respiración, puñetazos, espada, reacción al daño, efectos de impactos, llamas y un dragón animado. Cofres, iconos de equipo, pociones y escenario también fueron redibujados. El fondo se reutiliza entre cuadros para reducir trabajo de dibujo.

Las reglas, atributos, RNG, inventario, tienda y progresión de v0.3.0 se mantienen. La versión previa está conservada en `versions/v0.3.0/`.

---

## Mecánicas vigentes desde v0.3.0

La versión actual agrega el panel de personaje con **Enter**, atributos, pociones, equipo manual y el dragón de tierra. Abrí `index.html` para jugar, sin instalación.

## Cambios de v0.3.0

- **Atributos:** fuerza, energía, vitalidad y agilidad empiezan en 1 y tienen un máximo de 100. Cada esqueleto derrotado otorga 1 punto libre, además de oro. Los botones «+» asignan esos puntos.
- **Panel:** la mitad izquierda muestra atributos; la mitad derecha reserva 5/8 para el set y 3/8 para la mochila. En pantallas angostas se apilan las secciones. Enter abre/cierra y pausa el combate.
- **Equipo manual:** toda pieza encontrada o comprada entra a la mochila. Hacé clic para equiparla; «Quitar» devuelve la pieza a la mochila. Reemplazar una pieza conserva la anterior.
- **Pociones:** roja = fuerza, azul = energía, verde = vitalidad, violeta = agilidad. Se usan haciendo clic en la mochila. Dan +1/+2/+3/+4/+5 a su atributo según la sala. La verde también restaura 35% de la vida máxima y la azul recarga energía. No se superan los 100 puntos; se conservan los puntos sobrantes de una poción.
- **Cofres sin vacíos:** una única tirada determina equipo, poción u oro. La probabilidad de equipo sigue igual. Las probabilidades de poción son porcentajes absolutos por cofre, no porcentajes condicionados a fallar equipo.

| Sala | Equipo | Poción | Oro | Puntos de la poción |
| --- | ---: | ---: | ---: | ---: |
| 1 | 5% | 15% | 80% | 1 |
| 2 | 10% | 25% | 65% | 2 |
| 3 | 15% | 35% | 50% | 3 |
| 4 | 20% | 45% | 35% | 4 |
| 5 | 25% | 55% | 20% | 5 |

Las cuatro primeras salas tienen 3, 4, 5 y 6 esqueletos, respectivamente. Al llegar a la quinta se abre una tienda segura con seis piezas aleatorias de calidad +1/+2, sin reposición infinita, y tres cofres. Las compras entran a la mochila; prepará el set antes de entrar al jefe. La tienda restaura vida y energía.

**Terragrán** tiene 650 de vida, lanza rocas y marca el suelo antes de sus impactos. Al derrotarlo aparece un cofre lujoso que se abre con E: garantiza una pieza +3, 200 de oro y una poción de +8 por atributo. El premio se entrega una sola vez.

**Supervivencia:** vida inicial 140, daño de esqueletos reducido, 1,1 segundos de protección después de un golpe, regeneración de 4 de vida/segundo luego de 3 segundos sin daño y +35 de vida al limpiar una sala. Shift permite esquivar por 20 de energía. El collar no es necesario para regenerar vida.

**Efectos de atributos:** cada punto de fuerza sobre 1 suma 2 de daño; vitalidad suma 6 de vida máxima; energía aumenta la reserva para esquivar; agilidad mejora movimiento y velocidad de ataque. Los golpes normales no consumen energía.

## Desarrollo de la versión actual

- `src/engine.js`: reglas, atributos, inventario, RNG, tienda y jefe.
- `src/view.js`, `src/ui.html`, `src/style.css`: interfaz y controles.
- `src/painter.js`: gráficos en pixel art.
- `node build.cjs`: genera `game.html` e `index.html` desde `src/`.
- `node tests/game.test.cjs`: pruebas de reglas y progresión.
- `node tests/preview.cjs`: genera escenas de prueba locales en `.qa/`, excluidas del repositorio y de la versión jugable.

Las partidas siguen siendo temporales: reiniciar o cerrar el juego comienza otra partida. `versions/v0.1.0` y `versions/v0.2.0` conservan las versiones anteriores.

---

## Documentación histórica de v0.2.0

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
