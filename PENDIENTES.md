# Pendientes

Lista de cosas que faltan, para no olvidarlas. Cuando termines una, márcala con `[x]` y anota la fecha.

## Marca

- [ ] **Asegurar el nombre "Detallazo".** Revisar que estén libres y reservarlos antes de publicitar:
  1. Usuario `@detallazo` (o `@detallazo.ec`) en Instagram, TikTok y Facebook.
  2. Dominio `detallazo.ec` o `detallazo.com` (nic.ec o cualquier registrador). Es el único gasto fijo: unos $10–30 al año.
  3. Opcional: registro de marca en el SENADI (senadi.gob.ec), cuando el negocio ya venda seguido.
- [ ] **Logo.** Diseñar un logo simple de Detallazo y guardarlo en `marca/logo.png` para que salga en el centro del QR
      (ver sección 8 del README).

## Portada

- [ ] **Redes sociales.** La columna "Redes Sociales" del pie de página está oculta (comentada en
      `docs/index.html`, busca `PENDIENTE: redes sociales`). Para activarla:
  1. Crear los perfiles de Instagram, TikTok y Facebook de Detallazo.
  2. Poner los enlaces reales en el bloque `CONTACTO` al final de `docs/index.html`.
  3. Quitar las líneas `<!-- PENDIENTE: ...` y `-->` que rodean la columna.
  4. En el CSS, cambiar `.pie-grid { grid-template-columns: 1.5fr 1fr; }` de vuelta a `1.5fr 1fr 1fr`.
  5. Publicar: `git add docs/index.html && git commit -m "Activar redes sociales" && git push`.

- [ ] **Video real del producto.** Grabar 10–15 s de un celular escaneando una tarjeta impresa y el regalo
      abriéndose. Sirve para la portada (debajo de la escena animada) y para Instagram/TikTok.

## Crecimiento

- [ ] **Almacenamiento de fotos.** Hoy las fotos viven en el repositorio de GitHub (gratis). Revisar cuando el
      repositorio pase de ~500 MB o se acerque a los 1.000 regalos; la opción recomendada en ese momento es
      Cloudflare R2 (10 GB gratis, sin cobro por visitas).
