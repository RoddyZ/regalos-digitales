# Regalos digitales con QR

Páginas-regalo estáticas (sin servidor, sin base de datos) publicadas gratis en GitHub Pages.
Cada regalo vive en `docs/<codigo>/` y se abre con `https://roddyz.github.io/regalos-digitales/<codigo>/`.

## Vender un regalo (5 minutos)

1. Copia `pedidos/ejemplo.json` → `pedidos/maria.json`, pon las fotos del cliente en `pedidos/` y llena los datos.
2. `npm run nuevo -- pedidos/maria.json`
   - Crea `docs/<codigo>/` (fotos comprimidas a WebP) y el QR en `entregas/<codigo>/qr.png` (+ `qr.svg` para imprimir grande).
   - Anota la venta en `entregas/registro.csv`.
3. `git add docs && git commit -m "Regalo <codigo>" && git push` → en ~1 minuto está en línea.
4. Envía el `qr.png` al cliente.

¿El cliente pide un cambio? Edita su JSON (ya tiene el `codigo` guardado) y corre
`npm run nuevo -- pedidos/maria.json --forzar`. El enlace y el QR no cambian.

## Estructura

| Carpeta | Qué es | ¿Va al repo? |
|---|---|---|
| `plantillas/*.html` | Diseños. Los datos se inyectan en `/*__DATOS__*/` | Sí |
| `docs/` | El sitio publicado: portada, `assets/`, demos y regalos | Sí |
| `docs/assets/regalo.js` | Motor común: pantalla "toca para abrir", música, expiración, galería, confeti | Sí |
| `demos/` | Pedidos de muestra → `docs/demo-<plantilla>/` (`npm run demos`) | Sí |
| `pedidos/` | Pedidos reales con datos del cliente | **No** (.gitignore) |
| `entregas/` | QRs y registro de ventas | **No** (.gitignore) — respáldalo |
| `config.json` | URL base, planes, color del QR (`qrColor`) y logo del QR (`qrLogo`) | Sí |
| `marca/logo.png` | Tu logo: va en el centro de cada QR (opcional) | Sí |

## Campos del pedido

`plantilla`, `plan` (basico: sin fotos · chevere: 1 foto · vip: 10 fotos + música + extras), `para`, `de`, `titulo`, `mensaje` (acepta `\n`), `fotos`
(ruta o `{ "ruta", "texto" }`), `musica` (mp3 local o URL; solo planes con música), `expira` (`AAAA-MM-DD`, opcional).
Solo VIP: `pregunta` + `respuesta` (varias aceptadas con `|`, no importan mayúsculas ni tildes) + `pista` (sale al 2.º error), `abreEl` (`AAAA-MM-DDTHH:MM`, muestra cuenta regresiva).
Por plantilla: `saludo`, `desde` + `textoContador` (carta-amor), `edad` (cumpleanos), `meta` (atrapa-corazones).
`cliente`, `telefono` y `notas` son privados: nunca salen en la página.

## Nueva plantilla

Copia una de `plantillas/`, cambia el diseño y conserva: `../assets/regalo.css`, la línea
`window.REGALO = /*__DATOS__*/{}/*__FIN__*/;`, `../assets/regalo.js` y la llamada a `Regalo.iniciar(...)`.
Luego crea `demos/<nombre>.json` y corre `npm run demos`.

## Vigencia

Por defecto los regalos son permanentes. Para que expiren: pon `expira` en el pedido o `diasVigencia` en el plan.
Pasada la fecha, la página muestra "ya no está disponible"; `npm run limpiar` borra los expirados del sitio.

## Límites y privacidad (léelo)

- **GitHub Pages gratis exige repo público**: cualquiera que navegue el repo puede ver las fotos y mensajes de `docs/`.
  Los códigos aleatorios y el `noindex` evitan que Google los muestre, pero no protegen el repo.
  Cuando haya clientes reales, lo recomendable es pasar a **Cloudflare Pages** con el repo privado (gratis, ancho de banda ilimitado):
  se conecta el repo, carpeta de salida `docs`, y se cambia `urlBase` en `config.json`.
- Tamaño: cada regalo pesa ~0.2–2 MB. GitHub recomienda repos < 1 GB → caben miles de regalos.
- Música: usa canciones con permiso o sin derechos; subir mp3 comerciales a un sitio público puede traer reclamos.

## Probar localmente

`npm run servir` → http://localhost:5173
