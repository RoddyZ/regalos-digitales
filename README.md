# Detalle QR · Regalos digitales con QR

Cada regalo es una página web con su propio enlace (por ejemplo `https://roddyz.github.io/regalos-digitales/pvnda5gr/`)
y un código QR que la abre. Todo se publica gratis en GitHub Pages: no hay servidor ni base de datos que pagar.

- **Portada / tienda:** https://roddyz.github.io/regalos-digitales/
- **Demos:** `…/demo-flores-amarillas/`, `…/demo-carta-amor/`, `…/demo-cumpleanos/`, `…/demo-atrapa-corazones/`, `…/demo-vip/` (clave: *amarillas*)

---

## Índice

1. [Preparar la computadora (una sola vez)](#1-preparar-la-computadora-una-sola-vez)
2. [Crear un regalo paso a paso](#2-crear-un-regalo-paso-a-paso)
3. [Entregar el QR al cliente](#3-entregar-el-qr-al-cliente)
4. [Hacer cambios a un regalo ya entregado](#4-hacer-cambios-a-un-regalo-ya-entregado)
5. [Música: Spotify, YouTube o mp3](#5-música-spotify-youtube-o-mp3)
6. [Planes y precios](#6-planes-y-precios)
7. [Extras VIP: pregunta secreta y apertura programada](#7-extras-vip-pregunta-secreta-y-apertura-programada)
8. [Poner tu logo en el QR](#8-poner-tu-logo-en-el-qr)
9. [Cambiar WhatsApp y redes sociales de la portada](#9-cambiar-whatsapp-y-redes-sociales-de-la-portada)
10. [Privacidad: qué se sube y qué no](#10-privacidad-qué-se-sube-y-qué-no)
11. [Publicación en GitHub Pages](#11-publicación-en-github-pages)
12. [Crear una plantilla nueva](#12-crear-una-plantilla-nueva)
13. [Vigencia y limpieza](#13-vigencia-y-limpieza)
14. [Problemas comunes](#14-problemas-comunes)
15. [Estructura del proyecto](#15-estructura-del-proyecto)

---

## 1. Preparar la computadora (una sola vez)

1. Instala **Node.js** (versión 20 o más nueva) desde https://nodejs.org
2. Instala **Git** y ten acceso al repositorio `RoddyZ/regalos-digitales`.
3. Abre una terminal en la carpeta del proyecto (`D:\regalos-digitales`) y ejecuta:

   ```
   npm install
   ```

Listo. Esto solo se hace la primera vez (o en una computadora nueva).

---

## 2. Crear un regalo paso a paso

**Antes de empezar**, pide al cliente por WhatsApp:

- El diseño (flores amarillas, carta de amor, cumpleaños, atrapa corazones) y el plan (Básico, Chévere o VIP).
- Para quién es y cómo firma.
- El mensaje.
- Las fotos (si el plan las incluye).
- La canción: pídele el **enlace de Spotify** (en la app: *Compartir → Copiar enlace*).

Guarda las fotos en la carpeta **`pedidos/fotos/`** (esa carpeta nunca se sube a internet).

**Luego**, en la terminal:

```
npm run nuevo
```

El asistente te pregunta todo, una cosa a la vez:

| Pregunta | Qué responder |
|---|---|
| Diseño | El número de la lista (ej. `2` para carta-amor) |
| Plan | `1` Básico, `2` Chévere, `3` VIP |
| Para | Nombre de quien recibe: `Lorena` |
| De | Firma: `Roddy` |
| Título grande | Ej. `Feliz aniversario`. Enter = el título por defecto del diseño |
| Mensaje | Escribe línea por línea. **Enter en una línea vacía** para terminar |
| Fotos | **Arrastra la foto** desde la carpeta hasta la terminal y pulsa Enter. Después te pide un pie de foto (opcional). Enter vacío para terminar |
| Canción | Pega el enlace de Spotify o YouTube (ver [sección 5](#5-música-spotify-youtube-o-mp3)) |
| Pregunta secreta / Se abre el | Solo VIP. Enter para saltar (ver [sección 7](#7-extras-vip-pregunta-secreta-y-apertura-programada)) |
| ¿Desde cuándo están juntos? | Solo carta-amor. Fecha `2022-02-14` para mostrar "Llevamos juntos X días". Enter para saltar |
| Edad | Solo cumpleaños. Enter para saltar |
| Cliente / Teléfono | Datos de quien compra. **Son privados**: no salen en la página |
| ¿Publicar ya en internet? | `s` para subirlo de una vez; `n` para revisarlo antes |

Al terminar verás algo así:

```
✔ Regalo creado
  Código: pvnda5gr
  URL:    https://roddyz.github.io/regalos-digitales/pvnda5gr/
  QR:     D:\regalos-digitales\entregas\pvnda5gr\qr.png
  Pedido: pedidos\lorena-2026-09-29.json
```

- Si respondiste `s`, en **1 a 2 minutos** el enlace ya funciona.
- Si respondiste `n`, revísalo en tu computadora (ver abajo) y cuando esté bien publícalo:

  ```
  git add docs/pvnda5gr
  git commit -m "Regalo pvnda5gr"
  git push
  ```

  > Usa siempre `git add docs/<codigo>` (la carpeta de ese regalo), **no** `git add -A`,
  > para no subir por accidente fotos u otros archivos personales.

**Revisarlo en tu computadora antes de publicar:**

```
npm run servir
```

Abre `http://localhost:5173/pvnda5gr/` en el navegador. Para ver cómo se ve en celular: F12 → ícono de celular.

---

## 3. Entregar el QR al cliente

En `entregas/<codigo>/` encuentras:

| Archivo | Para qué |
|---|---|
| `qr.png` | Para enviar por WhatsApp o imprimir en tamaño normal (1200×1200 px) |
| `qr.svg` | Para imprimir en grande (no pierde calidad) |
| `pedido.json` | Copia del pedido, por si acaso |

Además, `entregas/registro.csv` lleva la lista de todas las ventas (se abre en Excel).

**Antes de entregar, escanea el QR con tu celular** y prueba el regalo completo.

> ⚠️ La carpeta `entregas/` no se sube a internet: **haz una copia de respaldo** (Google Drive, USB) de vez en cuando.

---

## 4. Hacer cambios a un regalo ya entregado

El enlace y el QR **no cambian**, así que el cliente no tiene que volver a imprimir nada.

1. Abre el pedido en `pedidos/` (ej. `pedidos/lorena-2026-09-29.json`) y cambia lo que haga falta (mensaje, fotos, canción…).
2. En la terminal:

   ```
   npm run nuevo -- pedidos/lorena-2026-09-29.json --forzar
   ```

3. Publica:

   ```
   git add docs/pvnda5gr
   git commit -m "Cambio regalo pvnda5gr"
   git push
   ```

Para crear un regalo desde un archivo, sin el asistente, copia `pedidos/ejemplo.json`, llénalo y ejecuta
`npm run nuevo -- pedidos/tu-archivo.json` (añade `--publicar` para subirlo de una vez).

---

## 5. Música: Spotify, YouTube o mp3

Solo el plan **VIP** incluye canción. Hay tres formas; la recomendada es Spotify.

| Opción | Cómo se ve y se escucha | Qué pegar |
|---|---|---|
| **Spotify** ⭐ | Tarjeta oficial abajo, con la portada del disco y botón ▶. Sin cuenta suena un **fragmento de 30 s** (como en las historias de Instagram); con cuenta de Spotify, la canción completa | Enlace de la canción: `https://open.spotify.com/track/...` |
| **YouTube** | Reproductor pequeño en una esquina; hay que tocar ▶ | Enlace del video: `https://www.youtube.com/watch?v=...` o `https://youtu.be/...` |
| **mp3 propio** | Suena de fondo **automáticamente** al abrir el regalo, con un botón ♪ para pausar | Ruta al archivo: arrástralo a la terminal |

**Cómo obtener el enlace de Spotify:**
en la app, busca la canción → `⋯` → *Compartir* → *Copiar enlace de la canción*. Sirven tanto
`open.spotify.com/track/…` como `open.spotify.com/intl-es/track/…`.

**Importante:**

- **No se descargan canciones de YouTube**: va contra sus reglas, y el archivo quedaría en un repositorio público.
  Con Spotify y YouTube usamos sus reproductores oficiales, que es lo permitido.
- El mp3 propio solo úsalo si tienes permiso para usarlo (música libre de derechos, una grabación propia, una nota de voz…).
- Algunos videos de YouTube no permiten verse fuera de YouTube. Si pasa, el reproductor simplemente no aparece: usa Spotify.

---

## 6. Planes y precios

Todos los planes funcionan con cualquier diseño.

| Plan | Precio | Fotos | Canción | Extras VIP |
|---|---|---|---|---|
| Básico | $5 | — | — | — |
| Chévere | $10 | 1 | — | — |
| VIP | $15 | hasta 10 | ✅ | ✅ |

**Para cambiar precios o lo que incluye cada plan:**

1. Edita `config.json` → `planes`:
   - `precio`: precio en dólares.
   - `maxFotos`: cuántas fotos permite (0 = ninguna).
   - `musica`: `true` o `false`.
   - `extras`: `true` si incluye pregunta secreta y apertura programada.
   - `diasVigencia`: `null` = permanente, o un número de días (ver [sección 13](#13-vigencia-y-limpieza)).
2. Actualiza los mismos precios y textos en la portada: `docs/index.html`, sección `id="precios"`.
3. Sube los cambios:

   ```
   git add config.json docs/index.html
   git commit -m "Nuevos precios"
   git push
   ```

Si un pedido trae algo que su plan no incluye, el generador no lo deja pasar y avisa
(por ejemplo: *"El plan Básico no incluye fotos."*).

---

## 7. Extras VIP: pregunta secreta y apertura programada

**Pregunta secreta:** antes de abrir el regalo aparece una pregunta que solo esa persona sabe responder.

- Ejemplo: *¿Dónde fue nuestra primera cita?*
- Respuestas aceptadas, separadas con `|`: `parque|el parque|parque la carolina`
- No importan mayúsculas, tildes ni signos: `PARQUE`, `parqué` y `parque!` también valen.
- Pista (opcional): aparece después de 2 intentos fallidos.
- La respuesta se guarda cifrada: no se puede descubrir mirando el código de la página.

**Apertura programada:** el regalo se abre solo en una fecha y hora exactas; antes muestra una cuenta regresiva.

- Formato: `2027-02-14 00:00` (año-mes-día hora:minutos, hora del celular de quien lo abre).
- Ideal para entregar el QR la noche anterior y que se abra a la medianoche.

Pruébalo en la demo: https://roddyz.github.io/regalos-digitales/demo-vip/ (respuesta: *amarillas*).

---

## 8. Poner tu logo en el QR

1. Guarda tu logo como **`marca/logo.png`**: cuadrado, con fondo transparente, de 500×500 px o más.
2. Desde ese momento, todos los QR nuevos salen con el logo en el centro sobre un recuadro blanco.
3. El color de los cuadritos del QR se cambia en `config.json` → `qrColor` (usa colores oscuros para que se lea bien).

El QR se genera con el máximo nivel de corrección de errores, así que se sigue leyendo aunque el logo tape el centro.
**Siempre escanéalo con tu celular** antes de entregarlo.

Para regenerar el QR de un regalo ya hecho con el logo nuevo: `npm run nuevo -- pedidos/<pedido>.json --forzar`.

---

## 9. Cambiar WhatsApp y redes sociales de la portada

Todo está en **un solo lugar**: al final de `docs/index.html`, en el bloque `CONTACTO`:

```js
const CONTACTO = {
  whatsapp: '593992700393',                  // formato internacional, sin + ni espacios
  instagram: 'https://www.instagram.com/',   // ej. https://www.instagram.com/detalleqr
  tiktok: 'https://www.tiktok.com/',         // ej. https://www.tiktok.com/@detalleqr
  facebook: 'https://www.facebook.com/'      // ej. https://www.facebook.com/detalleqr
};
```

- **WhatsApp:** es el botón "Pedir el mío". Cuando un cliente lo toca, se abre un chat contigo con el mensaje
  *"¡Hola! Quiero un regalo con QR 🎁"* ya escrito. Número con código de país (593) y sin el 0 inicial.
- **Redes:** pega el enlace completo de cada perfil.

Luego:

```
git add docs/index.html
git commit -m "Actualizar contacto"
git push
```

---

## 10. Privacidad: qué se sube y qué no

| Se sube a internet (público) | Nunca se sube (queda solo en tu computadora) |
|---|---|
| `docs/` → la portada, las demos y **cada regalo publicado, con sus fotos** | `pedidos/` → pedidos y fotos originales de los clientes |
| Plantillas, scripts, `config.json` | `entregas/` → QRs y registro de ventas |

**Reglas para no subir nada personal por accidente:**

1. Las fotos de los clientes van **siempre** en `pedidos/fotos/`, nunca en `demos/` ni en otra carpeta.
2. Publica con `git add docs/<codigo>`, **nunca** con `git add -A` ni `git add .`.
3. Antes de cada `git commit`, revisa con `git status` qué vas a subir.

**Sobre GitHub Pages gratis:** el repositorio tiene que ser público. Eso significa que las fotos y mensajes de los
regalos publicados se pueden ver navegando el repositorio en GitHub. Los códigos son aleatorios y las páginas tienen
`noindex` (Google no las muestra), pero eso no protege el repositorio.

**Cuando tengas clientes reales, lo recomendado** es pasar a **Cloudflare Pages** con el repositorio privado
(gratis y sin límite de visitas):

1. En GitHub: *Settings → General → Change visibility → Private*.
2. En https://pages.cloudflare.com: *Create project → Connect to Git →* elige el repositorio.
3. *Build command:* vacío. *Build output directory:* `docs`.
4. Cambia `urlBase` en `config.json` por la nueva dirección (ej. `https://detalleqr.pages.dev/`).

   > Los QR ya entregados apuntan a la dirección vieja: haz esta migración **antes** de vender mucho.

---

## 11. Publicación en GitHub Pages

**Configuración (una sola vez, ya hecha):** en GitHub → *Settings → Pages → Branch:* `main`, *carpeta:* `/docs` → *Save*.

Cada `git push` vuelve a publicar el sitio en 1 a 2 minutos. Para ver el estado: pestaña **Actions** del repositorio.

> **Aviso "Node.js 20 is deprecated…" en Actions:** puedes ignorarlo. Viene del proceso interno de GitHub,
> no de este proyecto. La publicación funciona igual.

---

## 12. Crear una plantilla nueva

1. Copia una plantilla de `plantillas/` (ej. `carta-amor.html` → `navidad.html`) y cambia el diseño.
2. Conserva estas cuatro piezas, que conectan la plantilla con el sistema:
   - `<link rel="stylesheet" href="../assets/regalo.css">`
   - `<script>window.REGALO = /*__DATOS__*/{}/*__FIN__*/;</script>` (aquí se ponen los datos de cada regalo)
   - `<script src="../assets/regalo.js"></script>`
   - La llamada `Regalo.iniciar({ alAbrir() { … } })`
3. Crea `demos/navidad.json` (copia otro de esa carpeta) y ejecuta `npm run demos`.
4. Agrega el diseño al catálogo de la portada (`docs/index.html`, lista `id="lista"`).
5. Publica: `git add plantillas demos docs && git commit -m "Plantilla navidad" && git push`.

El motor común (`docs/assets/regalo.js`) ya se encarga de la pantalla "Toca para abrir", la música, la pregunta
secreta, la cuenta regresiva y la expiración. En la plantilla puedes usar `Regalo.escribir()`, `Regalo.galeria()`,
`Regalo.confeti()` y `Regalo.flotar()`.

---

## 13. Vigencia y limpieza

Por defecto los regalos son **permanentes**.

- Para que un regalo expire: en su pedido pon `"expira": "2027-01-31"`.
- Para que todos los de un plan expiren: en `config.json` pon `diasVigencia` (ej. `30`).
- Pasada la fecha, la página muestra *"Este regalo ya no está disponible"*.
- Para borrar del sitio los regalos que ya expiraron: `npm run limpiar`, y después `git add docs && git commit -m "Limpieza" && git push`.

---

## 14. Problemas comunes

| Problema | Solución |
|---|---|
| `✘ El plan X no incluye …` | El pedido trae algo que su plan no permite: cambia el plan o quita ese elemento |
| `✘ Ya existe un regalo con código …` | Estás regenerando uno que existe: añade `--forzar` |
| El asistente no muestra lo que escribes | Actualiza el proyecto (`git pull`). Usa la terminal de VS Code o PowerShell. **Ctrl+C** cancela sin crear nada |
| `✘ No encuentro ese archivo` al arrastrar una foto | Revisa que el archivo exista; también puedes escribir la ruta completa |
| El enlace da "Regalo no encontrado" | Espera 2 minutos después del `git push`; revisa en *Actions* que la publicación terminó |
| La tarjeta de Spotify no aparece | Revisa que el enlace sea de una **canción** (`/track/`) y que el plan sea VIP |
| El video de YouTube no aparece | Ese video no permite verse fuera de YouTube: usa Spotify |
| El QR no se lee | Revisa que el logo no sea demasiado grande y que `qrColor` sea oscuro |

---

## 15. Estructura del proyecto

| Carpeta / archivo | Qué es | ¿Se sube? |
|---|---|---|
| `plantillas/*.html` | Los diseños | Sí |
| `docs/` | El sitio publicado: portada (`index.html`), `assets/`, demos y regalos | Sí |
| `docs/assets/regalo.js` | Motor común de los regalos | Sí |
| `demos/` | Pedidos de muestra con fotos de relleno → `npm run demos` regenera `docs/demo-*` | Sí |
| `pedidos/` | Pedidos reales y fotos de clientes (`pedidos/fotos/`) | **No** |
| `entregas/` | QRs y registro de ventas | **No** — haz respaldo |
| `marca/logo.png` | Logo para el centro del QR (opcional) | Sí |
| `config.json` | Dirección base, planes, color y logo del QR | Sí |
| `scripts/` | Generador de regalos, demos y limpieza | Sí |

**Comandos:**

| Comando | Qué hace |
|---|---|
| `npm run nuevo` | Asistente para crear un regalo |
| `npm run nuevo -- pedidos/x.json [--forzar] [--publicar]` | Crear o actualizar un regalo desde un archivo |
| `npm run demos` | Regenerar las demos |
| `npm run servir` | Ver el sitio en tu computadora: http://localhost:5173 |
| `npm run limpiar` | Borrar del sitio los regalos expirados |
