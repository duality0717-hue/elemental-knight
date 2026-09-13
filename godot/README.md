# Elemental Knight — núcleo nativo Godot 4.7.2

Prototipo independiente en GDScript. Referencia Electron intacta: commit
`78244213088ce5a362d3f3542502810a9cae9061` de `codex/elemental-sets-0.8.0`.
Trabajo exclusivo en `godot/4.7.2-migration`; no requiere Node ni Electron para jugar.

## Abrir y jugar

1. Usar **Godot 4.7.2 stable**: https://godotengine.org/download/archive/4.7.2-stable/
2. Importar `godot/project.godot` y pulsar **F5**.
3. WASD o flechas: mover. **Shift**: dash. **Espacio**: ataque básico (mantener para repetir).
4. Derrotar al guardián y acercarse al objeto para recogerlo. El inventario muestra equipo,
   pociones y oro. **R** reinicia la prueba, incluidos inventario y enemigo.

Una habitación, un enemigo cuerpo a cuerpo. El inventario mínimo recoge y muestra objetos;
no equipa ni consume todavía. Los gráficos son placeholders propios. No hay publicación,
instalador nuevo, cuentas ni persistencia en este hito.

## Arquitectura

- `Player.tscn` / `Enemy.tscn`: `CharacterBody2D`, colisión corporal,
  `AnimatedSprite2D`, `Area2D` de alcance y temporizadores nativos.
- `Wall.tscn`: `StaticBody2D` reutilizable; paredes y pilar bloquean movimiento y dash.
  Capas: 1 mundo, 2 jugador, 3 enemigos. Los ataques verifican línea de visión contra mundo.
- `LootPickup.tscn`: `Area2D`; transfiere un `ItemData` exactamente una vez al inventario.
- `CharacterStats` y `ItemData`: Resources tipados. `player_stats.tres` configura al jugador.
- `LootTable`: una sola tirada para la categoría: `[0,.05)` equipo total,
  `[.05,.15)` poción y `[.15,1)` oro. Las tiradas siguientes solo eligen propiedades.
  Equipo normal nivel 0, nueve slots elegibles antes de segunda evolución; oro 16 en sala 1.
- `Room`: une señales, contabiliza la baja y genera un único pickup. El botín se entrega
  al recogerlo, en vez de acreditarse inmediatamente como en Electron (cambio solicitado).

## Contratos inspeccionados y alcance de la paridad

`src/engine.js` especifica daño, armadura, vida, energía, velocidad, demora, alcance,
vida por golpe, calidades/niveles, bonus de armadura y nivel por bajas. Se comparan los
resultados contra JS para 128 configuraciones, incluidos ambos slots de armas, mandoble,
armadura completa y atributos altos. Se preservan coste/duración/cooldown/invulnerabilidad
del dash, regeneración de energía y daño mínimo de 2 tras armadura.

La prueba jugable usa ataque básico sin equipo y el enemigo melee de sala 1 (54 HP).
Las fórmulas de equipo están disponibles y probadas como datos; equipamiento, proyectiles,
habilidades, clases, curación al despejar salas y progresión de campaña quedan fuera de
este hito. No se afirma paridad de toda la campaña ni de todas sus armas.

`src/save.js` define el guardado v2: héroe, equipo, mochila, baúl y progreso, IDs únicos y
límite de tamaño. Se conserva como contrato para un futuro adaptador; Godot no importa,
reescribe ni migra partidas existentes en esta etapa.

`src/cloud.js` y sus tests definen sesión, aislamiento por cuenta y revisión del guardado
online. Godot no los invoca ni incluye credenciales. Electron mantiene su guardado y
servicio actual sin cambios. Las pruebas existentes siguen ejecutándose aparte.

## Verificación reproducible

Desde la raíz del repositorio, con `godot` apuntando al ejecutable **4.7.2**:

```sh
npm test
npm run build
node tools/godot-reference.cjs
godot --headless --path godot --editor --import --quit
godot --headless --path godot --script tests/core_test.gd
```

El generador ejecuta el JavaScript real para producir `tests/reference.json`. Este JSON
solo lo usan los tests, nunca el juego. Las pruebas nativas verifican límites del drop,
5/10/85 sobre 10.000 valores uniformemente espaciados, fórmulas, colisiones con paredes,
dash, movimiento diagonal, daño, invulnerabilidad, windup, pickups e inventario sin duplicar.
La rejilla comprueba intervalos exactos; no promete porcentajes exactos en una muestra aleatoria.

El workflow `Godot core` ejecuta ambos motores y captura una vista de la escena con
renderizado real. No crea tags ni releases. Electron conserva su workflow original.
