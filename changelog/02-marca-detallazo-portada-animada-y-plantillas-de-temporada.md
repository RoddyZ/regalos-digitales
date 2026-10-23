# Changeset 02 · Marca Detallazo, portada animada, plantillas de temporada y panel por plan

**Fecha:** 2026-10-23  
**Autor:** Roddy Steeven Zamora Rodríguez (@RoddyZ)  
**Proyecto:** Detallazo (`regalos-digitales`)

---

## 1. Resumen
- **Marca:** "Detalle QR" pasa a llamarse **Detallazo**, con la frase *"Tu regalo listo, hecho con mucho amor"*. Los
  textos dejan el tono de "atelier" por un español ecuatoriano cercano.
- **Portada:** la animación del celular escaneando la tarjeta explica el producto sin texto.
- **Diseños:** se suman cuatro para fechas clave: San Valentín, graduación, Navidad y Año Nuevo.
- **Entregas:** quedan ordenadas por plan, diseño y número de pedido.
- **Panel:** bloquea lo que el plan no incluye y es solo local.

---

## 2. Marca y textos

| Antes | Ahora |
|---|---|
| Detalle QR | **Detallazo** (logo: *Detall* + *azo* en dorado) |
| Atelier de Regalos Digitales · Ecuador | Tu regalo listo, hecho con mucho amor |
| La Colección / Planes de Inversión / El Proceso | Escoge tu detalle / ¿Cuánto cuesta? / ¿Cómo es la vuelta? |
| Planes Básico · Chévere · VIP | **Sencillo · Chévere · Bacán** (nombres internos sin cambio: `basico`, `chevere`, `vip`) |
| Tarjeta: "Un detalle especial · Para ti, X" | "Te llegó un detallazo · Para X" + frase al pie |

- Se descartó "De Una QR" porque se confunde con **Deuna**, la app de pagos con QR de Banco Pichincha.
- **WhatsApp:** mensajes nuevos y enlace `api.whatsapp.com/send`, para que los emojis no lleguen como `�`.
- **Redes sociales:** ocultas hasta tener perfiles (ver `PENDIENTES.md`, nuevo archivo de tareas pendientes).

## 3. Portada (`docs/index.html`)
- **Librerías** en `docs/assets/vendor/` (unos 140 KB, sin depender de otros servidores):
  - **GSAP 3.15** con ScrollTrigger y SplitText.
  - **Lenis 1.3** para el desplazamiento suave.
- **Escena de escaneo:** cámara → láser → aviso *"Detallazo · Abrir regalo"* → apertura → flores, con los pasos
  *1 Escanean · 2 Se abre · 3 Se emocionan*. Se pausa cuando no está en pantalla.
- **Títulos y tarjetas:** los títulos aparecen palabra por palabra y las tarjetas suben al entrar en pantalla.
- **Accesibilidad:** con *reducir movimiento* activado no hay animaciones, y si las librerías no cargan la página se ve
  completa igual.
- **Colección:** pasa de 4 a 8 diseños, con filtros *Todas · Amor · Celebraciones · Fechas especiales*.
- **Celular del catálogo:** sin barra de desplazamiento dentro de la pantalla.

## 4. Plantillas nuevas (`plantillas/`)

| Plantilla | Interacción | Dato propio |
|---|---|---|
| `san-valentin.html` | "¿Quieres ser mi San Valentín?": el botón "No" se escapa y el "Sí" crece | `propuesta` |
| `graduacion.html` | Se lanza el birrete y se despliega un diploma | `carrera` |
| `navidad.html` | Árbol que se enciende esfera por esfera | — |
| `ano-nuevo.html` | Cuenta regresiva 5-4-3-2-1 y fuegos artificiales con el dedo | `anio` (automático si se deja vacío) |

Cada una tiene su demo (`demos/*.json` → `docs/demo-*`).

## 5. Entregas ordenadas (`scripts/lib.mjs`)
- Nueva ruta: `entregas/<NN-plan>/<plantilla>/<0001-para-codigo>/`. El número es correlativo y se conserva al editar.
  Si cambia el plan o el diseño, la carpeta se mueve sola.
- **La URL y el QR no cambian.**
- `npm run ordenar-entregas` migra las carpetas del formato anterior. Se puede correr varias veces sin efectos
  secundarios.
- Nueva función `slug()` para los nombres de carpeta. Corrige "maría" → "mari-a".

## 6. Panel de creación (`scripts/servidor-admin.mjs`)
- **Privado:** escucha solo en `127.0.0.1`. No se publica y no se puede abrir desde otro equipo del wifi.
- **Según el plan** (leído de `config.json`):
  - Lo que el plan no incluye (fotos, canción, pregunta secreta, apertura programada) queda bloqueado 🔒 y no se envía.
  - Las fotos se limitan al máximo del plan, con contador. Una foto se quita tocándola.
- **Según el diseño:** solo se muestran sus campos propios (edad, carrera, año, pregunta, corazones…).
- **Campos nuevos:** pista y fecha de apertura programada.
- **Fotos de los pedidos:** ahora se guardan en `pedidos/fotos/<fecha>/` (privado). Antes se borraban y el pedido
  guardado no se podía regenerar con `--forzar`. Si la creación falla, se borran.

## 7. Música
- **Solo enlaces** de Spotify (o YouTube). Se quitó la opción de subir mp3 y el generador rechaza archivos de audio, así
  la página no pesa más.
- No suena sola al abrir: los celulares bloquean el sonido automático y Spotify no lo permite. Aparece la tarjeta de la
  canción y la persona toca ▶.

## 8. Verificación
- **Portada:** probada en 1440, 390 y 360 px y en modo claro y oscuro, sin desplazamiento horizontal ni errores en
  consola.
- **Plantillas nuevas:** recorridas completas en móvil (intro → interacción → mensaje → galería).
- **Panel por plan:**
  - Sencillo bloquea fotos, canción y extras.
  - Chévere admite 1 foto: al subir 2, agrega solo 1.
  - Bacán habilita todo.
- **Rechazos del generador:** no acepta mp3 ni canción en un plan que no la incluye.
- **De punta a punta:** regalo creado desde el panel con foto y regenerado desde la terminal con `--forzar`. Las pruebas
  se borraron.
