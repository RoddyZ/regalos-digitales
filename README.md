# Detallazo · Tu regalo listo, hecho con mucho amor

Cada regalo es una página web con su propio enlace (por ejemplo `https://detallazo-ec.pages.dev/pvnda5gr/`)
y un código QR que la abre. Todo se publica gratis en Cloudflare Pages: no hay servidor ni base de datos que pagar.

- **Portada / tienda:** https://detallazo-ec.pages.dev/
- **Demos:** `…/demo-flores-amarillas/`, `…/demo-carta-amor/`, `…/demo-cumpleanos/`, `…/demo-atrapa-corazones/`,
  `…/demo-san-valentin/`, `…/demo-graduacion/`, `…/demo-navidad/`, `…/demo-ano-nuevo/`, `…/demo-dia-del-padre/`,
  `…/demo-vip/` (clave: *amarillas*)
- **Pendientes:** lo que falta por hacer está en [PENDIENTES.md](PENDIENTES.md).

---

## Índice

1. [Preparar la computadora (una sola vez)](#1-preparar-la-computadora-una-sola-vez)
2. [Crear un regalo paso a paso](#2-crear-un-regalo-paso-a-paso)
3. [Entregar el QR al cliente](#3-entregar-el-qr-al-cliente)
4. [Hacer cambios a un regalo ya entregado](#4-hacer-cambios-a-un-regalo-ya-entregado)
5. [Música: enlace de Spotify](#5-música-enlace-de-spotify)
6. [Planes y precios](#6-planes-y-precios)
7. [Extras del plan Bacán: pregunta secreta y apertura programada](#7-extras-del-plan-bacán-pregunta-secreta-y-apertura-programada)
8. [Poner tu logo en el QR](#8-poner-tu-logo-en-el-qr)
9. [Cambiar WhatsApp y redes sociales de la portada](#9-cambiar-whatsapp-y-redes-sociales-de-la-portada)
10. [Privacidad: qué se sube y qué no](#10-privacidad-qué-se-sube-y-qué-no)
11. [Publicación: GitHub Pages y Cloudflare Pages](#11-publicación-github-pages-y-cloudflare-pages)
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

- El diseño (flores amarillas, carta de amor, cumpleaños, atrapa corazones, San Valentín, graduación, Navidad, Año Nuevo o Día del Padre)
  y el plan (Sencillo, Chévere o Bacán).
- Para quién es y cómo firma.
- El mensaje.
- Las fotos (si el plan las incluye).
- La canción: pídele el **enlace de Spotify** (en la app: *Compartir → Copiar enlace*).

Guarda las fotos en la carpeta **`pedidos/fotos/`** (esa carpeta nunca se sube a internet).

**Luego**, puedes crearlo de dos formas:

### Opción A: Desde el panel web visual (Recomendado)
```bash
npm run admin
```
Abre `http://localhost:4200` en tu navegador para crear el regalo con interfaz visual, arrastrar fotos y descargar la tarjeta imprimible directamente.

- **Es privado:** el panel corre solo en tu computadora (`127.0.0.1`). No se publica en internet y tampoco se puede
  abrir desde otro equipo de tu wifi. Lo que sí es público es la portada y los regalos (carpeta `docs/`).
- **Se adapta al plan:** al elegir el plan, los campos que no incluye quedan bloqueados (🔒) y no se envían. Las fotos
  se limitan a las que permite el plan (Sencillo: 0, Chévere: 1, Bacán: 10); para quitar una, tócala.
- **Se adapta al diseño:** solo aparecen los campos propios del diseño elegido (edad en cumpleaños, carrera en
  graduación, etc.).
- Los límites salen de `config.json`. Si los cambias ahí, el panel se ajusta solo. Aunque alguien se salte el panel,
  el generador vuelve a revisar el pedido y lo rechaza si no cuadra con el plan.

### Opción B: Desde la terminal interactiva
```bash
npm run nuevo
```

El asistente te pregunta todo, una cosa a la vez:

| Pregunta | Qué responder |
|---|---|
| Diseño | El número de la lista (ej. `2` para carta-amor) |
| Plan | `1` Sencillo, `2` Chévere, `3` Bacán |
| Para | Nombre de quien recibe: `Lorena` |
| De | Firma: `Roddy` |
| Título grande | Ej. `Feliz aniversario`. Enter = el título por defecto del diseño |
| Mensaje | Escribe línea por línea. **Enter en una línea vacía** para terminar |
| Fotos | **Arrastra la foto** desde la carpeta hasta la terminal y pulsa Enter. Después te pide un pie de foto (opcional). Enter vacío para terminar |
| Canción | Pega el enlace de Spotify o YouTube (ver [sección 5](#5-música-enlace-de-spotify)) |
| Pregunta secreta / Se abre el | Solo plan Bacán. Enter para saltar (ver [sección 7](#7-extras-del-plan-bacán-pregunta-secreta-y-apertura-programada)) |
| ¿Desde cuándo están juntos? | Solo carta-amor. Fecha `2022-02-14` para mostrar "Juntos desde hace X días". Enter para saltar |
| Edad | Solo cumpleaños. Enter para saltar |
| Carrera o logro | Solo graduación. Ej. `Ingeniería en Software · Promoción 2026`. Enter para saltar |
| Año que llega | Solo año nuevo. Enter = automático (desde julio muestra el año siguiente) |
| Pregunta | Solo San Valentín. Enter = *"¿Quieres ser mi San Valentín?"*. Puedes poner otra, ej. *"¿Quieres ser mi novia?"* |
| Texto de la placa | Solo Día del Padre. Enter = *"Al mejor papá del mundo"*. Ej. *"Al mejor papá y abuelito"* (máx. 40 letras) |
| Cliente / Teléfono | Datos de quien compra. **Son privados**: no salen en la página |
| ¿Publicar ya en internet? | `s` para subirlo de una vez; `n` para revisarlo antes |

Al terminar verás algo así:

```
✔ Regalo creado con éxito
  Código:  pvnda5gr
  URL:     https://detallazo-ec.pages.dev/pvnda5gr/
  Carpeta: entregas\03-vip\carta-amor\0001-lorena-pvnda5gr
  QR:      D:\regalos-digitales\entregas\03-vip\carta-amor\0001-lorena-pvnda5gr\qr.png
  Tarjeta: D:\regalos-digitales\entregas\03-vip\carta-amor\0001-lorena-pvnda5gr\tarjeta-regalo.png (300 DPI lista para imprimir)
  Pedido:  pedidos\lorena-2026-09-29.json
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

Cada regalo tiene su carpeta, ordenada por **plan → diseño → número de pedido**:

```
entregas/
├── registro.csv                          ← lista de todas las ventas (se abre en Excel)
├── 01-basico/
│   └── cumpleanos/
│       └── 0004-sofi-k3m9tq2w/
├── 02-chevere/
│   └── graduacion/
│       └── 0005-daniela-p7xr2bn4/
└── 03-vip/
    ├── carta-amor/
    │   └── 0001-lorena-pvnda5gr/
    └── atrapa-corazones/
        └── 0002-lorena-mi-amor-7udxbxfa/
```

El nombre de cada carpeta es `<número>-<para quién>-<código>`:

- **Número** (`0001`, `0002`…): el orden en que hiciste los pedidos. Nunca se repite.
- **Para quién**: el nombre de quien recibe, sin tildes ni espacios.
- **Código**: el mismo de la URL (`…/regalos-digitales/pvnda5gr/`). **La URL y el QR no dependen de esta carpeta**,
  así que ordenar o mover carpetas nunca rompe un QR ya impreso.

Si cambias un regalo de plan o de diseño (con `--forzar` o desde el panel), su carpeta se mueve sola al lugar
correcto y **conserva su número**.

> **¿Tenías entregas con el formato viejo (`entregas/<codigo>/`)?** Ejecuta una vez `npm run ordenar-entregas`.
> Las mueve al formato nuevo y les asigna número según el orden de `registro.csv`. Se puede correr varias veces:
> lo que ya está ordenado no se toca.

Dentro de cada carpeta encuentras:

| Archivo | Para qué |
|---|---|
| `qr.png` | Para enviar por WhatsApp o imprimir en tamaño normal (1200×1200 px) |
| `qr.svg` | Para imprimir en grande (no pierde calidad) |
| `tarjeta-regalo.png` | Tarjeta lista para imprimir (ver abajo) |
| `pedido.json` | Copia del pedido, por si acaso |

**Antes de entregar, escanea el QR con tu celular** y prueba el regalo completo.

### La tarjeta para imprimir

`tarjeta-regalo.png` mide **10 × 15 cm** (1200 × 1800 px a 300 DPI), el tamaño de una foto normal. Trae:

- Un marco del color del diseño (amarillo en flores, rosado en carta, verde en Navidad…).
- La cajita de regalo, *"Para María"* escrito a mano y el título **"Tu regalo está aquí"**.
- El QR pegado con cinta y los 3 pasos para abrirlo: *Abre la cámara · Apunta al código · Toca el enlace*.
- La firma (*"De: Andrés"*), la frase de la marca y el código del regalo.

Para imprimirla:

1. Ábrela y elige **Imprimir → tamaño 10 × 15 cm** (o "4 × 6 pulgadas"), sin márgenes y al 100 %.
2. Mejor en papel fotográfico o cartulina mate. También sirve en un estudio de fotos: se pide como foto de 10 × 15.
3. Si usas una hoja A4, entran 4 tarjetas: recórtalas por el borde de color.
4. Escanea la tarjeta impresa antes de entregarla.

Las letras de la tarjeta (Fraunces, Caveat y Nunito, de licencia libre) están en `marca/fuentes/`. No las borres:
sin ellas la tarjeta no se puede generar.

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

## 5. Música: enlace de Spotify

Solo el plan **Bacán** incluye canción. **Siempre es un enlace**: no se suben archivos de audio, así la página
no pesa nada más (la música la sirve Spotify).

| Opción | Cómo se ve y se escucha | Qué pegar |
|---|---|---|
| **Spotify** ⭐ | Tarjeta oficial abajo, con la portada del disco y botón ▶. Sin cuenta suena un **fragmento de 30 s** (como en las historias de Instagram); con cuenta de Spotify, la canción completa | Enlace de la canción: `https://open.spotify.com/track/...` |
| **YouTube** | Reproductor pequeño en una esquina; hay que tocar ▶ | Enlace del video: `https://www.youtube.com/watch?v=...` o `https://youtu.be/...` |

**Cómo obtener el enlace de Spotify:**
en la app, busca la canción → `⋯` → *Compartir* → *Copiar enlace de la canción*. Sirven tanto
`open.spotify.com/track/…` como `open.spotify.com/intl-es/track/…`.

**Importante:**

- **No se descargan canciones de YouTube**: va contra sus reglas, y el archivo quedaría en un repositorio público.
  Con Spotify y YouTube usamos sus reproductores oficiales, que es lo permitido.
- Si pegas un archivo o un enlace que no es de Spotify/YouTube, el generador lo rechaza.
- **¿Por qué no suena sola al abrir?** Los celulares bloquean que una página reproduzca sonido por su cuenta, y la
  tarjeta de Spotify no permite reproducción automática. Por eso aparece la tarjeta de la canción apenas se abre
  el regalo y la persona toca ▶. Es lo más confiable: funciona igual en iPhone y Android.
- Algunos videos de YouTube no permiten verse fuera de YouTube. Si pasa, el reproductor simplemente no aparece: usa Spotify.

---

## 6. Planes y precios

Todos los planes funcionan con cualquier diseño.

| Plan | Precio | Fotos | Canción | Pregunta secreta y apertura programada |
|---|---|---|---|---|
| Sencillo | $5 | — | — | — |
| Chévere | $10 | 1 | — | — |
| Bacán | $15 | hasta 10 | ✅ | ✅ |

> **Nombre visible y nombre interno.** El cliente ve *Sencillo · Chévere · Bacán*. Por dentro (en los pedidos `.json`,
> en `config.json` y en las carpetas de `entregas/`) se siguen llamando `basico`, `chevere` y `vip`.
> Así no se rompe nada de lo que ya existe. Si cambias el nombre visible, cambia solo `nombre` en `config.json`.

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
(por ejemplo: *"El plan Sencillo admite hasta 0 foto(s)…"*).

---

## 7. Extras del plan Bacán: pregunta secreta y apertura programada

**Pregunta secreta:** antes de abrir el regalo aparece una pregunta que solo esa persona sabe responder.

- Ejemplo: *¿Dónde fue nuestra primera cita?*
- Respuestas aceptadas, separadas con `|`: `parque|el parque|parque la carolina`
- No importan mayúsculas, tildes ni signos: `PARQUE`, `parqué` y `parque!` también valen.
- Pista (opcional): aparece después de 2 intentos fallidos.
- La respuesta se guarda cifrada: no se puede descubrir mirando el código de la página.

**Apertura programada:** el regalo se abre solo en una fecha y hora exactas; antes muestra una cuenta regresiva.

- Formato: `2027-02-14 00:00` (año-mes-día hora:minutos, hora del celular de quien lo abre).
- Ideal para entregar el QR la noche anterior y que se abra a la medianoche.

Pruébalo en la demo: https://detallazo-ec.pages.dev/demo-vip/ (respuesta: *amarillas*).

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
  instagram: 'https://www.instagram.com/',   // ej. https://www.instagram.com/detallazo
  tiktok: 'https://www.tiktok.com/',         // ej. https://www.tiktok.com/@detallazo
  facebook: 'https://www.facebook.com/'      // ej. https://www.facebook.com/detallazo
};
```

- **WhatsApp:** son los botones "Pedir el mío" y "Elegir plan". Al tocarlos se abre un chat contigo con un mensaje
  ya escrito. Número con código de país (593) y sin el 0 inicial.
  - Botón general: *"¡Hola! ✨ Vi Detallazo y quiero sorprender a alguien. ¿Me ayudan a armar el regalo?"*
  - Botones de plan: el cliente recibe una mini ficha para llenar (para quién es, ocasión, plantilla).
  - Los textos están en `mensajeDefecto` y en el bloque `data-whatsapp-plan`, justo debajo de `CONTACTO`.
  - **Emojis:** usa solo los "simples" (✨ ❤ ☺ ✔). Los más nuevos (🎁 🥰 👋) pueden llegar como `�` en
    WhatsApp Web/escritorio. Por eso el enlace usa `api.whatsapp.com/send` y no `wa.me`.
- **Redes:** por ahora están **ocultas** (no hay perfiles todavía). Cómo activarlas: ver [PENDIENTES.md](PENDIENTES.md).

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
4. Cambia `urlBase` en `config.json` por la nueva dirección (ej. `https://detallazo.pages.dev/`).

   > Los QR ya entregados apuntan a la dirección vieja: haz esta migración **antes** de vender mucho.

---

## 11. Publicación: GitHub Pages y Cloudflare Pages

**Configuración (una sola vez, ya hecha):** en GitHub → *Settings → Pages → Branch:* `main`, *carpeta:* `/docs` → *Save*.

Cada `git push` vuelve a publicar el sitio en 1 a 2 minutos. Para ver el estado: pestaña **Actions** del repositorio.

> **Aviso "Node.js 20 is deprecated…" en Actions:** puedes ignorarlo. Viene del proceso interno de GitHub,
> no de este proyecto. La publicación funciona igual.

### Publicar en Cloudflare Pages (recomendado para vender)

GitHub Pages es para proyectos personales; sus reglas no permiten usarlo como tienda. **Cloudflare Pages** es
gratis, sí permite uso comercial, no limita las visitas y publica la misma carpeta `docs/` con cada `git push`.
Te da una dirección gratis del tipo **`detallazo.pages.dev`**.

> **Ya está hecho:** el sitio oficial es **https://detallazo-ec.pages.dev/** y `urlBase` ya apunta ahí. Cada `git push`
> a `main` lo publica solo. Los pasos de abajo sirven si algún día hay que volver a crearlo.

**A. Crear el sitio (una sola vez, unos 10 minutos)**

1. Entra a <https://dash.cloudflare.com/sign-up> y crea una cuenta gratis con tu correo.
2. En el menú de la izquierda abre **Workers & Pages** (o **Compute → Workers & Pages**) → **Create**
   → pestaña **Pages** → **Import an existing Git repository** (o *Connect to Git*).
3. Elige **GitHub**, autoriza a Cloudflare y dale acceso **solo** al repositorio `regalos-digitales`.
4. Configura el proyecto:
   - **Project name:** `detallazo` (de ahí sale `detallazo.pages.dev`; si está ocupado, prueba `detallazo-ec`).
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** déjalo vacío
   - **Build output directory:** `docs`
5. Pulsa **Save and Deploy**. En 1 o 2 minutos abre `https://detallazo.pages.dev` y revisa la portada y una demo.

**B. Que los QR nuevos usen la dirección nueva**

6. En `config.json` cambia `"urlBase"` por tu dirección, con la barra al final:
   `"urlBase": "https://detallazo.pages.dev/"`
7. Publica el cambio: `git add config.json && git commit -m "Dirección de Cloudflare" && git push`.
8. Crea un regalo de prueba y escanea su QR: debe abrir `detallazo.pages.dev/<código>/`. Bórralo después.

Desde ese momento, cada `git push` publica en los dos sitios a la vez, y Cloudflare lo hace en menos de un minuto.
El estado de cada publicación se ve en Cloudflare → tu proyecto → **Deployments**.

**C. No apagues GitHub Pages.** Los QR que ya entregaste apuntan a `roddyz.github.io/regalos-digitales/…` y
deben seguir funcionando. Como los dos sitios publican la misma carpeta, no hay que hacer nada más.

**D. Dominio propio (opcional, con costo)**

`detallazo.pages.dev` es gratis para siempre. Un dominio propio (`detallazo.com` o `detallazo.ec`) da más
confianza, pero se paga cada año: un `.com` cuesta unos $10–12 en Cloudflare (*Domain Registration*), y un `.ec`
se compra en nic.ec. Los dominios "gratis" que se ofrecen en internet no son confiables: pueden quitártelos y los
QR impresos dejarían de funcionar. Cuando lo tengas:

1. Cloudflare → tu proyecto → **Custom domains** → **Set up a custom domain** → escribe `detallazo.com`.
2. Si compraste el dominio en Cloudflare, se configura solo. Si fue en otro lado, sigue las instrucciones de
   Cloudflare para apuntar el dominio (cambiar los *nameservers* o crear un registro CNAME).
3. Cambia `urlBase` a `https://detallazo.com/` y publica (paso 6 y 7).

---

## 12. Crear una plantilla nueva

1. Copia una plantilla de `plantillas/` (ej. `carta-amor.html` → `dia-de-la-madre.html`) y cambia el diseño.
2. Conserva estas piezas, que conectan la plantilla con el sistema:
   - `<link rel="stylesheet" href="../assets/regalo.css">` y `<link rel="icon" href="../assets/icono.svg" type="image/svg+xml">`
   - `<script>window.REGALO = /*__DATOS__*/{}/*__FIN__*/;</script>` (aquí se ponen los datos de cada regalo)
   - `<script src="../assets/regalo.js"></script>`
   - La llamada `Regalo.iniciar({ alAbrir() { … } })`
3. Crea `demos/dia-de-la-madre.json` (copia otro de esa carpeta) y ejecuta `npm run demos`.
4. Agrega el diseño al catálogo de la portada (`docs/index.html`, lista `id="lista"`). Copia un `<li>` y cambia:
   - `data-demo="demo-dia-de-la-madre/"`: la demo que se abre en el celular.
   - `data-cat="..."`: en qué filtros aparece. Puede tener varias, separadas por espacio:
     `amor`, `celebraciones`, `fechas`.
   - El número (`10`), el título y la descripción. Para la etiqueta dorada de novedad, añade
     `<span class="nuevo">Nuevo</span>` al final del título (y quítala cuando ya no sea nuevo).
5. Publica: `git add plantillas demos docs && git commit -m "Plantilla día de la madre" && git push`.

El motor común (`docs/assets/regalo.js`) ya se encarga de la caja de regalo de la apertura ("Te llegó un detallazo"),
la música, la pregunta secreta, la cuenta regresiva, la expiración y el pie "Hecho con mucho amor en Detallazo".
En la plantilla puedes usar `Regalo.escribir()`, `Regalo.galeria()`, `Regalo.confeti()`, `Regalo.flotar()` y
`Regalo.figura()`. Al terminar la interacción, llama a `Regalo.final()`: muestra las fotos (si hay) y el pie.

### Estilo de los regalos

Todos los regalos comparten un estilo de papelería dibujada a mano, para que no se vean como plantillas genéricas:

- **Colores planos** con contorno de "tinta" (`--rg-tinta`) y sombras sólidas tipo sticker. Nada de brillos,
  degradados dorados ni efecto vidrio.
- **Letras:** *Fraunces* para títulos, *Caveat* (escrita a mano) para dedicatorias y firmas, *Nunito* para el texto.
- **Sin emojis.** Corazones, estrellas, flores y copos son dibujos SVG: `Regalo.flotar([['corazon', '#ff5a6e']])`
  o `Regalo.figura('estrella', '#ffd166')`. Figuras disponibles: `corazon`, `estrella`, `flor`, `copo`, `circulo`.
- **Piezas listas** en `regalo.css`: `rg-escena` (pantalla completa centrada), `rg-etiqueta` (texto a mano arriba
  del título), `rg-titulo`, `rg-ayuda` (instrucción), `rg-boton` (y `rg-secundario`), `rg-carta` (papel con cinta
  washi), `rg-firma`, `rg-subtitulo` (con subrayado a mano) y la galería de polaroids.
- **Cada plantilla solo cambia su paleta** en `:root`: `--rg-fondo`, `--rg-acento` (botón), `--rg-acento-tinta`
  (etiqueta y firma), `--rg-caja` y `--rg-cinta` (la caja de regalo de la apertura) y `--rg-washi` (la cinta).
  En fondos oscuros (Navidad, Año Nuevo) cambia también `--rg-texto` y `--rg-sombra`.

Si el diseño necesita un dato propio (como `edad` en cumpleaños o `carrera` en graduación), léelo con
`Regalo.datos.<nombre>` y agrégalo como pregunta en `scripts/nuevo-regalo.mjs` y como campo en el panel
(`scripts/servidor-admin.mjs`, bloque "Específicos por plantilla").

### Animaciones de la portada

La portada usa dos librerías gratuitas, guardadas **dentro del proyecto** en `docs/assets/vendor/` (no dependen
de otros servidores):

| Librería | Para qué se usa |
|---|---|
| **GSAP** (+ ScrollTrigger y SplitText) | La escena del celular que escanea la tarjeta, los títulos que aparecen palabra por palabra y la transición del celular del catálogo |
| **Lenis** | El desplazamiento suave al bajar por la página |

- Todo el código de animación está al final de `docs/index.html`, después de los `<script src="assets/vendor/…">`.
- Las tarjetas que "suben" al aparecer solo necesitan la clase `revelar`. Los títulos que se arman palabra por palabra,
  la clase `dividir`.
- Si alguien tiene activado *"reducir movimiento"* en su celular, las animaciones se apagan solas.
- Si las librerías no cargan, la página se ve completa igual (solo sin animación).

**Actualizar las librerías** (opcional, una vez al año está bien):

```
npm pack gsap lenis
```

Descomprime los `.tgz` y copia `gsap/dist/gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js` y
`lenis/dist/lenis.min.js` a `docs/assets/vendor/`. Revisa la portada con `npm run servir` antes de publicar.

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
| La tarjeta de Spotify no aparece | Revisa que el enlace sea de una **canción** (`/track/`) y que el plan sea Bacán |
| El video de YouTube no aparece | Ese video no permite verse fuera de YouTube: usa Spotify |
| El QR no se lee | Revisa que el logo no sea demasiado grande y que `qrColor` sea oscuro |
| La tarjeta sale sin letras o da error de fuente | Falta la carpeta `marca/fuentes/`: recupérala con `git checkout marca/fuentes` |
| No encuentro la carpeta de un regalo | Búscala por su código en el Explorador de Windows (ej. `pvnda5gr`), o mira el número en el historial del panel |

---

## 15. Estructura del proyecto

| Carpeta / archivo | Qué es | ¿Se sube? |
|---|---|---|
| `plantillas/*.html` | Los diseños | Sí |
| `docs/` | El sitio publicado: portada (`index.html`), `assets/`, demos y regalos | Sí |
| `docs/assets/regalo.js` | Motor común de los regalos | Sí |
| `docs/assets/vendor/` | Librerías de animación de la portada (GSAP, Lenis) | Sí |
| `demos/` | Pedidos de muestra con fotos de relleno → `npm run demos` regenera `docs/demo-*` | Sí |
| `pedidos/` | Pedidos reales y fotos de clientes (`pedidos/fotos/`) | **No** |
| `entregas/` | QRs, tarjetas y registro de ventas, ordenados por plan y diseño ([sección 3](#3-entregar-el-qr-al-cliente)) | **No**: haz respaldo |
| `marca/logo.png` | Logo para el centro del QR (opcional) | Sí |
| `marca/fuentes/` | Letras de la marca para dibujar la tarjeta imprimible | Sí |
| `config.json` | Dirección base, planes, color y logo del QR | Sí |
| `scripts/` | Generador de regalos, panel, demos, limpieza y orden de entregas | Sí |
| `PENDIENTES.md` | Lo que falta por hacer | Sí |

**Comandos:**

| Comando | Qué hace |
|---|---|
| `npm run admin` | Panel visual para crear regalos: http://localhost:4200 |
| `npm run nuevo` | Asistente para crear un regalo |
| `npm run nuevo -- pedidos/x.json [--forzar] [--publicar]` | Crear o actualizar un regalo desde un archivo |
| `npm run demos` | Regenerar las demos |
| `npm run servir` | Ver el sitio en tu computadora: http://localhost:5173 |
| `npm run limpiar` | Borrar del sitio los regalos expirados |
| `npm run ordenar-entregas` | Pasar las entregas viejas al orden por plan/diseño/número |
