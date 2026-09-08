# Elemental Knight — v0.6.0

## v0.6.0 — Capítulo II: La catedral de la peste

Después de derrotar a tu sombra, elegir nombre y especialización y abrir su cofre, **Descender al capítulo II** continúa la partida con todos tus atributos, oro, puntos, mochila y equipo. El descenso restaura vida y energía. Reiniciar comienza una partida nueva desde el capítulo I; la progresión todavía no se guarda al cerrar o recargar.

Las primeras cuatro salas del capítulo II son laberintos de **siete anexos cada una**: atrio con cuatro puertas, corredores con dos, un circuito y caminos sin salida. El mapa descubre los sectores al explorarlos. Cruzar una puerta común conserva el número de sala; solo el umbral dorado permite avanzar. La orientación varía entre salas y partidas. Hay que despejar los enemigos para abrir puertas. Los cofres abiertos y enemigos derrotados no reaparecen al regresar.

Se mantienen **18 esqueletos por capítulo**, distribuidos 3/4/5/6 entre las cuatro salas. En la tercera, uno es un élite de espada con 190 de vida. Los tres cofres de cada sala están repartidos entre los anexos. El RNG sigue siendo equipo 5/10/15/20/25%, poción 15/25/35/45/55% y oro en el resto. La recuperación de 35 de vida se entrega una vez al despejar toda la sala, no por cada anexo.

En el capítulo II, Mago lanza hielo que ralentiza a los esbirros, Rogue dispara flechas y Guerrero mantiene el combate cuerpo a cuerpo con los efectos de su equipo. Espacio ataca; la dirección de movimiento o un clic en el escenario determina hacia dónde. Los proyectiles del jugador curan solo al acertar, con los mismos límites que la espada.

La sala 5 conserva la tienda antes del jefe. **Mórtigo**, un guerrero gigante de 1000 de vida, alterna espadazos envenenados, charcos de miasma y salvas de veneno. Los ataques se anuncian durante 1,1 segundos. El veneno dura cuatro segundos, no se acumula y se congela al pausar. **El Eco aparece como aliado**: te sigue y dispara al jefe, sin dañarte ni activar tu curación. Puede dar el golpe final. La victoria entrega un cofre lujoso y conserva tu identidad.

El escenario se redibujó como una catedral gótica oscura: vidrieras rotas, contrafuertes, estatuas encapuchadas, cadenas, huesos, telarañas, luz lunar y velas. Los esbirros tienen túnicas y siluetas más sombrías; Mórtigo tiene ilustración propia de armadura, hombreras con púas y espada que gotea veneno. El rediseño también alcanza al capítulo I.

**Verificación:** `node tests/game.test.cjs` y `node tests/chapter2.test.cjs` (29 pruebas); `node build.cjs` reconstruye el juego. `node tests/preview.cjs` genera escenarios de revisión en `.qa/`, excluidos del juego publicado. Abrí `index.html` para jugar sin instalación.

---

## v0.5.0 — El espejo de ceniza

Estética original de animación clásica oscura: tinta, piedra envejecida, luz de velas, grano y niebla. El inventario se convierte en un grimorio con retrato equipado, marcos por rango, detalles de piezas y mochila manual.

- Se conservan 18 esqueletos: 3, 4, 5 y 6 por sala. En la tercera, uno se reemplaza por un élite con 130 de vida y espada de 22 de daño; anuncia el golpe durante 0,75 segundos. Los demás conservan distancia y lanzan fuego.
- El jefe es El Eco, una sombra del personaje con una copia visual de su equipo y 650 de vida. Alterna cinco bolas de hielo (12 de daño y ralentización), lluvia de flechas en una zona (18) y un arco de espada (28). Los ataques se anuncian antes de ejecutarse.
- Al vencerlo se eligen nombre y especialización: Mago (+5 Energía), Rogue (+5 Agilidad) o Guerrero (+5 Fuerza). Esta versión desbloquea identidad y atributos; las habilidades propias de cada clase quedan para la próxima etapa. Luego se abre el cofre lujoso.
- Se mantienen el RNG, los puntos, el oro y la curación por acierto. No hay regeneración pasiva. Nombre y clase duran esta partida, igual que el resto de la progresión.

Validación: 21 pruebas de reglas y progresión con `node tests/game.test.cjs`. Reconstrucción: `node build.cjs`. Abrir `index.html` para jugar sin instalación.

## Cambios de v0.4.1 — Curación en combate

Se elimina la regeneración automática por esperar. Los valores iniciales y su progresión son:

- **Vida:** `100 + 8 × (vitalidad − 1)`.
- **Daño a puños:** `12 + 1,5 × (fuerza − 1)`, más los bonos del equipo. Una espada básica aporta 12 de daño adicional frente a los puños.
- **Movimiento:** `88 + 0,5 × (agilidad − 1)`, más botas.
- **Intervalo de ataque:** `0,48 / (1 + 0,01 × (agilidad − 1))` segundos antes de aplicar pulsera. Mínimo absoluto de 0,18 segundos.
- **Nivel:** empieza en 1 y aumenta en 1 cada cinco esqueletos derrotados. El punto libre por cada baja se mantiene.
- **Curación por ataque acertado:** `0,6 + 0,03 × (vitalidad − 1) + 0,015 × (fuerza − 1) + 0,01 × (agilidad − 1) + 0,1 × (nivel − 1)`. Nunca supera el **8% del daño real** causado ni la vida máxima. El daño real excluye el daño sobrante al matar a un enemigo con poca vida.

Un ataque cura una sola vez aunque alcance a varios enemigos; fallar o esperar no cura. Funciona con puños, espada y contra el dragón. Las curaciones de pociones, collar, sala completada y tienda siguen siendo recompensas independientes. El panel muestra los valores actuales y la fórmula. Estos son valores iniciales de balance para probar con jugadores, no una garantía de supervivencia.

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

**Supervivencia actual:** vida inicial 100, 1,1 segundos de protección después de un golpe, curación por ataque acertado calculada con atributos y nivel, y +35 de vida al limpiar una sala. Shift permite esquivar por 20 de energía. El collar aporta su curación adicional por baja.

**Efectos de atributos:** cada punto de fuerza sobre 1 suma 1,5 de daño; vitalidad suma 8 de vida máxima; energía aumenta la reserva para esquivar; agilidad mejora movimiento y velocidad de ataque. Los golpes normales no consumen energía.

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
