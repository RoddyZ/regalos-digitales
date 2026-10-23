# Changeset 01 · Profesionalización Estética, Plantillas Boutique y Panel de Administración

**Fecha:** 2026-10-23  
**Autor:** Roddy Steeven Zamora Rodríguez (@RoddyZ)  
**Proyecto:** Detalle QR (`regalos-digitales`)

---

## 1. Resumen Ejecutivo
Se realizó una transformación integral del proyecto para eliminar clichés sintéticos y patrones genéricos de IA (gradientes morados saturados, fuentes escolares/infantiles como Quicksand/Dancing Script, emojis desmedidos y esquemas toscos). Se elevó la marca a un **Atelier de Regalos Digitales y Papelería Fina**, complementado con un generador de tarjetas físicas imprimibles en alta resolución y un panel web local de administración para gestionar pedidos visualmente.

---

## 2. Frontend de Regalos Interactivos (`plantillas/` y `docs/assets/`)

### Tipografía y Sistema de Diseño (`docs/assets/regalo.css`)
- **Sustitución de fuentes:** Se reemplazó la combinación básica `Dancing Script` + `Quicksand` por una triada tipográfica editorial de alta gama:
  - `Playfair Display` & `Cormorant Garamond`: Serifas de lujo para títulos y presencia editorial.
  - `Pinyon Script`: Caligrafía inglesa fluida para firmas, dedicatorias y monogramas íntimos.
  - `Plus Jakarta Sans`: Sans-serif geométrica contemporánea para textos de cuerpo y UI limpia.
- **Textura y microinteracciones:** Incorporación de grano analógico sutil de fondo y sombras multicapa orgánicas (`drop-shadow` difuso).
- **Desempaque Boutique:** Nueva pantalla de introducción con medallón con borde iridiscente rotatorio y apertura cinemática (disolución con desenfoque), en lugar del emoji gigante palpitante de radar.
- **Reloj VIP:** Rediseño de la cuenta regresiva en tarjetas tabulares con estilo de cápsula de tiempo.
- **Componentes Multimedia:** Tarjeta flotante de Spotify/YouTube con cristal esmerilado y botón de música estilizado con icono vectorial de vinilo giratorio.

### Rediseño de Plantillas
1. **`plantillas/carta-amor.html`:**
   - Paleta de vino tinto profundo, pergamino de algodón marfil y sello de lacre carmesí en relieve 3D.
   - Plegado y desplegado de carta con textura de líneas finas de caligrafía.
2. **`plantillas/cumpleanos.html`:**
   - Paleta pastel patisserie (crema batida, fresa suave, champán dorado).
   - Pastel estilizado con glaseado satinado, velas de cera estriadas con llama orgánica parpadeante y detección de soplido mediante micrófono o interacción táctil.
3. **`plantillas/flores-amarillas.html`:**
   - Noche estrellada en azul medianoche profundo con luciérnagas de brillo cálido ámbar.
   - Flores vectoriales en tonos ocre, mostaza y girasol natural con tallos de verde oliva orgánico.
4. **`plantillas/atrapa-corazones.html`:**
   - Look *arcade chic* en terciopelo amatista oscuro con partículas sutiles, microvibraciones táctiles y barra de progreso translúcida.

---

## 3. Landing Page Comercial (`docs/index.html`)
- **Smartphone Studio en Vivo:** Sustitución del mockup estático tosco por un marco contemporáneo con *Dynamic Island* y selector interactivo de diseños en tiempo real.
- **Colección de Planes:** Reemplazo de la lista de restaurante punteada por tres tarjetas de inversión claras (Básico $5, Chévere $10 [Destacado] y VIP $15) con botones de WhatsApp preconfigurados para cada plan.
- **Tarjeta física de muestra:** Presentación 3D de la tarjeta con sello de lacre y código QR real escaneable.

---

## 4. Backend y Automatización de Entregas (`scripts/`)

### Generador de Tarjetas Imprimibles (`scripts/lib.mjs`)
- Ahora cada regalo no solo produce `qr.png`, sino también:
  - `tarjeta-regalo.png` y `tarjeta-regalo.svg`: Tarjeta tamaño postal (1200 × 1800 px, 300 DPI) con marco decorativo doble, sello de la marca, dedicatoria personalizada ("Para ti, [Nombre]"), recuadro con el QR y la instrucción para escanear con la cámara.
- **Validación robusta:** Incorporación de `validarPedido()` para prevenir configuraciones rotas, fotos excedentes o campos faltantes antes de generar.

### Panel de Control Web Local (`scripts/servidor-admin.mjs`)
- Servidor HTTP nativo en Node.js ejecutable mediante:
  ```bash
  npm run admin
  ```
- Interfaz gráfica en `http://localhost:4200` con:
  - Selector visual de plantillas y planes.
  - Dropzone interactivo para arrastrar fotografías con previsualización inmediata.
  - Generación de regalos en un clic con descarga directa del QR y la tarjeta postal imprimible.
  - Historial de pedidos anteriores.

### Actualización de Herramientas y Docs
- `package.json`: Agregado el script `"admin"`.
- `README.md`: Documentadas ambas vías de generación (panel visual y CLI) y la tarjeta imprimible.
- `scripts/nuevo-regalo.mjs`: Salida de terminal actualizada para mostrar la ruta de `tarjeta-regalo.png`.
