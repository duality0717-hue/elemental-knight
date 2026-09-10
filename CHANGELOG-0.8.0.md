# 0.8.0 — Conjuntos elementales y refugio

- Armadura: pechera, casco, guantes, botas y ala/capa. Hielo, eléctrico, magma o veneno; bronce/plata/oro. Ala/capa se desbloquea al vencer a Mórtigo: ese hito se considera segunda evolución; la especialización es la primera.
- Artefactos: principal, secundaria/escudo, anillo, pulsera y collar. Niveles 0–25; las dos manos también tienen calidad. Arco y mandoble ocupan ambas posiciones. Espada y báculo pueden cambiar de mano; el escudo es solo secundario. Equipar dos manos devuelve la secundaria a la mochila.
- Equipo de cofres comunes y tienda: nivel 0. Élites: nivel 1–4 según capítulo. Cofres de jefe: nivel 5/10 según capítulo. No se agregó todavía una forja para subir objetos a 25.
- Completar los cinco artefactos de un elemento habilita Q: Invierno eterno (área y ralentización), Cadena del trueno (hasta tres objetivos), Erupción (área cercana) o Miasma (área y daño periódico). 25 energía, 18 segundos de recarga. Dos manos cuentan como dos posiciones. Calidades y niveles pueden mezclarse para activar la skill; el elemento debe coincidir.
- Lobby con baúl de 200 objetos; transferencias con partida pausada. Baúl preservado al reiniciar. Guardado v2 y migración v1: equipo previo convertido a hielo, calidad basada en rango y nivel rango−1; ids y progreso conservados.
- Cuentas Supabase y SQL preparados para proyecto propio. Pendiente crear/conectar el servicio; login permanece deshabilitado mientras no haya configuración. No se tocó Ruta Cero.

No publicar automáticamente esta rama hasta terminar la conexión y prueba de cuentas. El workflow compila el instalador como artefacto; la publicación queda reservada a etiquetas de versión.
