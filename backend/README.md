# Cuentas de Elemental Knight

Estado: implementación preparada; NO hay proyecto, base ni cuentas online creados desde esta rama. No usa Ruta Cero ni Ánima Literaria. Crear un proyecto Supabase exclusivamente para Elemental Knight.

Aplicar schema.sql en ese proyecto; habilitar registro por correo con confirmación y configurar envío de correo. Copiar solamente URL y clave pública publishable/anon a src/cloud-config.js y reconstruir con node build.cjs. No usar claves de servicio ni contraseñas de PostgreSQL en el cliente.

Auth almacena los usuarios y contraseñas. knight_saves contiene un documento por cuenta: personaje, equipo, mochila, baúl y progreso, en una misma escritura atómica. RLS restringe lecturas a auth.uid(); la función de escritura deriva el propietario de la sesión, nunca del cliente. La revisión evita sobrescribir cambios de otro dispositivo sin advertirlo. No existe acceso anónimo a partidas.

Las sesiones se mantienen en memoria; cerrar la aplicación requiere volver a iniciar sesión. Tokens de refresco y contraseñas no se guardan en localStorage. Las partidas locales se separan por id de cuenta. El invitado usa la clave antigua para conservar su partida. Sin conexión al servicio, registro e inicio de sesión están deshabilitados. Guardar nube es explícito; cerrar sesión intenta sincronizar y, si falla, permite conservar una copia local y salir. No hay sincronización garantizada al cerrar el proceso de Windows.

Antes de publicar cuentas reales: probar con dos usuarios que uno no pueda leer/escribir al otro, registro y confirmación de correo, login, renovación, logout, conflicto entre dos dispositivos, recuperación offline y cambio invitado/cuenta. El SQL aún debe aplicarse y verificarse contra una base real.

Este guardado está pensado para un juego individual. Valida tamaño, formato general y propietario; no es un servidor de combate ni un sistema antitrampas. Antes de comercio o multijugador con economía compartida habrá que validar recompensas e inventario en el servidor.
