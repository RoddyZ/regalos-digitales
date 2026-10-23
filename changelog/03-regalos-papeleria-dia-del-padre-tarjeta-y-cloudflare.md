# Changeset 03 · Regalos con estilo de papelería, Día del Padre, tarjeta imprimible y Cloudflare Pages

**Fecha:** 2026-10-23  
**Autor:** Roddy Steeven Zamora Rodríguez (@RoddyZ)  
**Proyecto:** Detallazo (`regalos-digitales`)

---

## 1. Resumen
- **Regalos rediseñados:** los diseños dejan el estilo oscuro con dorado y emojis, que se veía genérico, por una
  papelería dibujada a mano.
- **Nuevo diseño:** Día del Padre.
- **Tarjeta para imprimir** rediseñada con el mismo estilo y las letras de la marca.
- **Sitio oficial en Cloudflare Pages:** https://detallazo-ec.pages.dev/. Los QR nuevos apuntan ahí.
- **Barrido de errores:** WhatsApp sin emojis, registro sin filas duplicadas, ícono de pestaña y página 404.

---

## 2. Estilo nuevo de los regalos (`docs/assets/regalo.css` y `regalo.js`)
- **Papelería dibujada:** colores planos, contorno de tinta, sombras sólidas tipo sticker, papel con cinta washi y
  fotos tipo polaroid. Sin brillos, degradados dorados ni efecto vidrio.
- **Letras:** Fraunces (títulos), Caveat (escrita a mano, para dedicatorias y firmas) y Nunito (texto).
- **Sin emojis:** corazones, estrellas, flores y copos son dibujos SVG (`Regalo.figura()`, `Regalo.flotar()`).
  El confeti también es plano y con contorno.
- **Apertura:** una caja de regalo dibujada que se menea y se destapa, con *"Para María · Te llegó un detallazo"* y el
  botón *Ábrelo*. Con pregunta secreta o apertura programada, la caja lleva candado.
- **Cada diseño con su escena:**
  - Flores: girasoles con un solcito sonriente.
  - Atrapa corazones: corazones dibujados y barra tipo sticker.
  - Carta: sobre con sello de corazón y carta escrita a mano.
  - Cumpleaños: pastel con glaseado y banderines.
  - San Valentín: un corazón con carita que se pone triste con el "No".
  - Graduación: birrete y diploma enrollado con roseta.
  - Navidad: árbol con esferas de colores y regalitos.
  - Año Nuevo: luna dormida y el año con sombra de color.
- **Pie de marca** al final de cada regalo: *"Hecho con mucho amor en Detallazo"*, con enlace a la portada.
- **Ícono de pestaña** (`docs/assets/icono.svg`) y **página 404** con el mismo estilo (*"Esta cajita está vacía"*).
- **Celular de la portada:** la animación del escaneo muestra el regalo con el estilo nuevo.
- Se quitó el reproductor de mp3 del motor (la música ya era solo por enlace).
- **Regalos ya entregados** (`pvnda5gr`, `7udxbxfa`, `d3b8fg5s`): regenerados con `--forzar`. Mantienen el mismo
  enlace y el mismo QR, con el diseño nuevo.

## 3. Plantilla nueva: Día del Padre (`plantillas/dia-del-padre.html`)
- Una copa con bigote para *"el campeón de la casa"*: con cada toque brilla más y suelta destellos, hasta mostrar su
  placa.
- Dato propio `placa`; vacío equivale a *"Al mejor papá del mundo"*. Se pide en el panel y en el asistente de terminal.
- Demo en `demos/dia-del-padre.json` y en la portada como diseño 09 (filtro *Fechas especiales*).

## 4. Tarjeta para imprimir (`tarjeta-regalo.png`)
- **Contenido:**
  - Marco del color del diseño y cajita de regalo.
  - *"Para María"* escrito a mano y el título **"Tu regalo está aquí"**.
  - QR pegado con cinta y los 3 pasos: *Abre la cámara · Apunta al código · Toca el enlace*.
  - Firma y frase de la marca.
- **10 × 15 cm a 300 DPI**, el tamaño de una foto.
- **Letras de la marca:** se dibujan con Fraunces, Caveat y Nunito, incluidas en `marca/fuentes/` con su licencia OFL.
  Antes salían en Georgia/Arial.
- Ya no se genera `tarjeta-regalo.svg`, que salía con otras letras.
- En la portada, los textos dicen qué trae la tarjeta y su tamaño.

## 5. Publicación en Cloudflare Pages
- **Sitio oficial:** https://detallazo-ec.pages.dev/. Cada `git push` a `main` se publica solo.
- **Configuración:** `config.json` → `urlBase` apunta a Cloudflare, así que los QR nuevos usan esa dirección. El QR de
  muestra de la portada también se cambió.
- **GitHub Pages sigue encendido:** los QR ya entregados apuntan a `roddyz.github.io/regalos-digitales/…` y siguen
  funcionando.
- **Guía en el README (sección 11):** cómo crear el sitio y, opcionalmente, conectar un dominio propio.
- Todo el sitio usa rutas relativas, así que funciona igual en la raíz de otro dominio.

## 6. Correcciones
- **WhatsApp:** los mensajes salen sin emojis, porque cada teléfono los dibuja distinto.
- **Registro:** regenerar un regalo con `--forzar` ya no duplica su fila en `entregas/registro.csv`.
- **Diseños:**
  - La hoja de la carta ya no tapa el título.
  - La roseta ya no tapa la firma del diploma.
  - El texto del celular de la portada queda equilibrado.

## 7. Verificación
- **Los 9 diseños y la demo con pregunta secreta:** recorridos de punta a punta en móvil de forma automática, con la
  interacción real de cada uno (intro → interacción → mensaje → galería → pie). No hubo errores en consola ni
  desplazamiento horizontal.
- **Regalos entregados:** regenerados y probados (pregunta secreta, foto y canción de Spotify).
- **Panel:** regalo del Día del Padre creado con placa personalizada; la prueba se borró.
- **Tarjetas:** generadas para carta, atrapa corazones, Navidad y Día del Padre (este con un nombre largo). El QR se
  lee incluso reducido a 300 px.
- **Portada:** probados los 9 diseños, los filtros y los 4 mensajes de WhatsApp. El QR de muestra lleva a la demo en
  Cloudflare.
