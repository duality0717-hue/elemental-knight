# Cuentas de Elemental Knight

Estado: proyecto exclusivo Elemental Knight creado en Supabase (uxmuyktrjaogzhdjomko, región sa-east-1), dentro de la organización ruta-cero. Base y Auth independientes de los otros proyectos. Costo informado al crear: 0/mes. Esquema aplicado y clave pública conectada al juego.

schema.sql ya aplicado mediante la migración elemental_knight_accounts_and_vault. src/cloud-config.js contiene solo URL y clave publishable. No usar claves de servicio ni contraseñas de PostgreSQL en el cliente. Falta configurar un proveedor SMTP para registros generales y verificar la entrega/confirmación de correo de extremo a extremo; el servicio de correo predeterminado de Supabase tiene restricciones de destinatarios.

Auth almacena los usuarios y contraseñas. knight_saves contiene un documento por cuenta: personaje, equipo, mochila, baúl y progreso, en una misma escritura atómica. RLS restringe lecturas a auth.uid(); la función de escritura deriva el propietario de la sesión, nunca del cliente. La revisión evita sobrescribir cambios de otro dispositivo sin advertirlo. No existe acceso anónimo a partidas.

Las sesiones se mantienen en memoria; cerrar la aplicación requiere volver a iniciar sesión. Tokens de refresco y contraseñas no se guardan en localStorage. Las partidas locales se separan por id de cuenta. El invitado usa la clave antigua para conservar su partida. Sin conexión al servicio, registro e inicio de sesión están deshabilitados. Guardar nube es explícito; cerrar sesión intenta sincronizar y, si falla, permite conservar una copia local y salir. No hay sincronización garantizada al cerrar el proceso de Windows.

Verificado contra la base real en una transacción revertida: dos usuarios aislados, guardado inicial y actualización, conflictos de revisión, rechazo de documentos inválidos, bloqueo de escrituras directas y acceso anónimo. No quedaron usuarios ni partidas de prueba. Security Advisor: sin avisos. tests/cloud-live.cjs verifica Auth y el rechazo REST anónimo desde Windows. Antes de publicar cuentas reales falta probar entrega/confirmación de correo, login, renovación y logout de extremo a extremo; los tests unitarios del cliente utilizan respuestas simuladas.

Este guardado está pensado para un juego individual. Valida tamaño, formato general y propietario; no es un servidor de combate ni un sistema antitrampas. Antes de comercio o multijugador con economía compartida habrá que validar recompensas e inventario en el servidor.
