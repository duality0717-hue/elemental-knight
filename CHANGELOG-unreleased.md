# En desarrollo — cofres y acto III

Cambios en `codex/elemental-sets-0.8.0`, PR #2. Sin etiqueta ni publicación. La versión publicada continúa en 0.8.1; estos cambios solo se distribuyen como artefacto de prueba.

- Cofres comunes en posiciones aleatorias separadas dentro del área jugable. La distribución se genera al crear la sala y se conserva al guardar. Un 30% de los cofres comunes de combate invoca un fantasma a 70 unidades de distancia; el cofre permanece cerrado hasta derrotarlo. Tienda y recompensa de jefe quedan libres de emboscadas.
- Desde el capítulo II, un cofre violeta por laberinto en el anexo este, con dos élites visibles y dormidos. Solo se activan por proximidad al cofre. Dormidos son invulnerables y no bloquean puertas; activados impiden abandonar el sector hasta derrotarlos. Abrir el cofre exige derrotar a ambos.
- Todos los sectores de los capítulos II y III tienen entre tres y cinco enemigos comunes, incluyendo cuerpo a cuerpo, área con aviso previo y distancia. Los élites y guardianes se agregan a ese grupo. El contador ya no supone 18 enemigos por capítulo.
- Acto III: cuatro laberintos de siete sectores y una sala de preparación. Ambiente de cavernas, estalactitas, seda, huevos y cristales. Arañas pequeñas mordedoras, tejedoras de veneno y escupidoras; élites de mayor tamaño.
- Dos portadoras élite, en la Cámara de los colmillos de las salas 2 y 4, entregan fragmentos distintos automáticamente al morir. No se duplican y se guardan entre sesiones. Son progreso de misión garantizado, independiente de la tirada de botín. Los dos fragmentos permiten acceder a Aracnia.
- Aracnia, Madre de las profundidades: colmillos en arco, telarañas que ralentizan, abanico de veneno e invocación de crías, con avisos previos y ritmo más rápido al bajar del 40% de vida. Máximo seis crías simultáneas. Su derrota elimina las crías y habilita un único cofre final.
- Continuación al acto III desde partidas antiguas que terminaban al vencer a Mórtigo. Conserva personaje, equipo y baúl. El formato sigue siendo v2, con lectura de estados antiguos sin fragmentos; las versiones antiguas del juego no pueden leer el contenido nuevo del acto III.
- El botín se mantiene en una sola tirada: 5% equipo total, 10% poción y 85% oro. No se cambiaron las cuentas ni el proyecto Supabase.

## Validación

Pruebas de probabilidad, guardianes, tres roles, recorrido completo de los laberintos, llaves, transición desde guardados antiguos, cuatro ataques del jefe, límite de crías y persistencia. El workflow ejecuta pruebas de interfaz en Electron y guarda capturas de los encuentros, además de compilar, instalar y abrir el juego en Windows.

Pendiente antes de publicar: configurar SMTP externo y probar registro → confirmación → login → guardado/baúl → logout → recuperación. También falta evaluación humana de dificultad y duración de los nuevos combates.
