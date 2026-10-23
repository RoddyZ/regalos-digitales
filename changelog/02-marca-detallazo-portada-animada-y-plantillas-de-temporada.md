# Changeset 02 · Marca Detallazo, portada animada, regalos rediseñados, plantillas de temporada y panel por plan

**Fecha:** 2026-10-23  
**Autor:** Roddy Steeven Zamora Rodríguez (@RoddyZ)  
**Proyecto:** Detallazo (`regalos-digitales`)

---

## 1. Resumen
- **Marca:** "Detalle QR" pasa a llamarse **Detallazo**, con la frase *"Tu regalo listo, hecho con mucho amor"*. Los
  textos dejan el tono de "atelier" por un español ecuatoriano cercano.
- **Portada:** la animación del celular escaneando la tarjeta explica el producto sin texto.
- **Regalos rediseñados:** los 9 diseños dejan el estilo oscuro con dorado y emojis (que se veía genérico) por un
  estilo propio de papelería dibujada a mano.
- **Diseños:** se suman cinco para fechas clave: San Valentín, graduación, Navidad, Año Nuevo y Día del Padre.
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
- **WhatsApp:** mensajes nuevos, sin emojis (cada teléfono los dibuja distinto), y enlace `api.whatsapp.com/send`
  para que los acentos no lleguen como `�`.
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

## 4. Estilo nuevo de los regalos (`docs/assets/regalo.css` y `regalo.js`)
- **Papelería dibujada:** colores planos, contorno de tinta, sombras sólidas tipo sticker, papel con cinta washi y
  fotos tipo polaroid. Sin brillos, degradados dorados ni efecto vidrio.
- **Letras:** Fraunces (títulos), Caveat (escrita a mano, para dedicatorias y firmas) y Nunito (texto).
- **Sin emojis:** corazones, estrellas, flores y copos son dibujos SVG (`Regalo.figura()`, `Regalo.flotar()`).
  El confeti también es plano y con contorno.
- **Apertura:** una caja de regalo dibujada que se menea y destapa, con *"Para María · Te llegó un detallazo"* y el
  botón *Ábrelo*. Con pregunta secreta o apertura programada, la caja lleva candado.
- **Cada diseño con su escena:** girasoles con un solcito sonriente; corazones dibujados y barra tipo sticker; sobre
  con sello de corazón y carta escrita a mano; pastel con glaseado y banderines; corazón con carita que se pone triste
  con el "No"; birrete y diploma enrollado con roseta; árbol con esferas de colores y regalitos; luna dormida y año con
  sombra de color.
- **Pie de marca** al final de cada regalo: *"Hecho con mucho amor en Detallazo"*, con enlace a la portada.
- **Ícono de pestaña** (`docs/assets/icono.svg`) y **página 404** con el mismo estilo.
- **Celular de la portada:** la animación del escaneo muestra el regalo con el estilo nuevo.
- Se quitó el reproductor de mp3 del motor (la música ya era solo por enlace).
- Los 2 regalos ya entregados se regeneraron con `--forzar`: **mismo enlace y mismo QR**, diseño nuevo.

### Tarjeta para imprimir (`tarjeta-regalo.png`)
- **Rediseñada** con el mismo estilo: marco del color del diseño, cajita de regalo, *"Para María"* escrito a mano,
  título **"Tu regalo está aquí"**, QR pegado con cinta y los 3 pasos (*Abre la cámara · Apunta al código · Toca el
  enlace*), firma y frase de la marca.
- **Letras de la marca** en la imagen: se dibujan con Fraunces, Caveat y Nunito incluidas en `marca/fuentes/`
  (licencia OFL). Antes salían en Georgia/Arial.
- **10 × 15 cm a 300 DPI**, el tamaño de una foto. Ya no se genera `tarjeta-regalo.svg`, que salía con otras letras.
- El QR de la tarjeta se comprobó con un lector: se lee incluso reducido a 300 px.
- En la portada, los textos dicen qué trae la tarjeta y su tamaño.

## 5. Plantillas nuevas (`plantillas/`)

| Plantilla | Interacción | Dato propio |
|---|---|---|
| `san-valentin.html` | "¿Quieres ser mi San Valentín?": el botón "No" se escapa y el "Sí" crece | `propuesta` |
| `graduacion.html` | Se lanza el birrete y se despliega un diploma | `carrera` |
| `navidad.html` | Árbol que se enciende esfera por esfera | — |
| `ano-nuevo.html` | Cuenta regresiva 5-4-3-2-1 y fuegos artificiales con el dedo | `anio` (automático si se deja vacío) |
| `dia-del-padre.html` | Una copa con bigote que brilla más con cada toque hasta mostrar su placa | `placa` (vacío = "Al mejor papá del mundo") |

Cada una tiene su demo (`demos/*.json` → `docs/demo-*`).

## 6. Entregas ordenadas (`scripts/lib.mjs`)
- Nueva ruta: `entregas/<NN-plan>/<plantilla>/<0001-para-codigo>/`. El número es correlativo y se conserva al editar.
  Si cambia el plan o el diseño, la carpeta se mueve sola.
- **La URL y el QR no cambian.**
- `npm run ordenar-entregas` migra las carpetas del formato anterior. Se puede correr varias veces sin efectos
  secundarios.
- Nueva función `slug()` para los nombres de carpeta. Corrige "maría" → "mari-a".
- **Corrección:** regenerar un regalo con `--forzar` ya no duplica su fila en `entregas/registro.csv`.

## 7. Panel de creación (`scripts/servidor-admin.mjs`)
- **Privado:** escucha solo en `127.0.0.1`. No se publica y no se puede abrir desde otro equipo del wifi.
- **Según el plan** (leído de `config.json`):
  - Lo que el plan no incluye (fotos, canción, pregunta secreta, apertura programada) queda bloqueado 🔒 y no se envía.
  - Las fotos se limitan al máximo del plan, con contador. Una foto se quita tocándola.
- **Según el diseño:** solo se muestran sus campos propios (edad, carrera, año, pregunta, corazones…).
- **Campos nuevos:** pista y fecha de apertura programada.
- **Fotos de los pedidos:** ahora se guardan en `pedidos/fotos/<fecha>/` (privado). Antes se borraban y el pedido
  guardado no se podía regenerar con `--forzar`. Si la creación falla, se borran.

## 8. Música
- **Solo enlaces** de Spotify (o YouTube). Se quitó la opción de subir mp3 y el generador rechaza archivos de audio, así
  la página no pesa más.
- No suena sola al abrir: los celulares bloquean el sonido automático y Spotify no lo permite. Aparece la tarjeta de la
  canción y la persona toca ▶.

## 9. Publicación en Cloudflare Pages
- Nueva guía en el README (sección 11): crear el sitio gratis en Cloudflare Pages (`detallazo.pages.dev`),
  cambiar `urlBase` para los QR nuevos, mantener GitHub Pages para los QR ya entregados y, opcionalmente, conectar
  un dominio propio.
- Todo el sitio usa rutas relativas, así que funciona igual en la raíz de otro dominio; la página 404 también.

## 10. Verificación
- **Portada:** probada en 1440, 390 y 360 px y en modo claro y oscuro, sin desplazamiento horizontal ni errores en
  consola.
- **Los 9 diseños y la demo con pregunta secreta:** recorridos completos en móvil de forma automática, con la
  interacción real de cada uno (intro → interacción → mensaje → galería → pie). Sin errores en consola ni
  desplazamiento horizontal.
- **Regalos entregados:** regenerados y probados (pregunta secreta, foto y canción de Spotify).
- **Panel por plan:**
  - Sencillo bloquea fotos, canción y extras.
  - Chévere admite 1 foto: al subir 2, agrega solo 1.
  - Bacán habilita todo.
- **Rechazos del generador:** no acepta mp3 ni canción en un plan que no la incluye.
- **De punta a punta:** regalo creado desde el panel con foto y regenerado desde la terminal con `--forzar`; regalo
  del Día del Padre creado desde el panel con placa personalizada. Las pruebas se borraron.
- **Portada:** 9 diseños, filtros y los 4 mensajes de WhatsApp revisados.
- **Tarjetas:** generadas para carta, atrapa corazones, Navidad y Día del Padre (con un nombre largo); QR leído en todas.
