import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { generarRegalo, leerConfig, RAIZ, PLANTILLAS, ENTREGAS, SITIO } from './lib.mjs';

const PUERTO = process.env.PORT || 4200;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) { // Límite 50MB para fotos en base64
        reject(new Error('Cuerpo de la petición demasiado grande'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('JSON malformado'));
      }
    });
    req.on('error', reject);
  });
}

function responderJson(res, statusCode, datos) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(datos));
}

async function servirArchivo(res, rutaAbsoluta) {
  try {
    const data = await fs.readFile(rutaAbsoluta);
    const ext = path.extname(rutaAbsoluta).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Archivo no encontrado');
  }
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API: Configuración y plantillas
  if (pathname === '/api/config' && req.method === 'GET') {
    try {
      const config = await leerConfig();
      const plantillas = (await fs.readdir(PLANTILLAS))
        .filter(f => f.endsWith('.html'))
        .map(f => f.replace('.html', ''));
      responderJson(res, 200, { config, plantillas });
    } catch (e) {
      responderJson(res, 500, { error: e.message });
    }
    return;
  }

  // API: Lista de pedidos generados
  if (pathname === '/api/pedidos' && req.method === 'GET') {
    try {
      const entregas = await fs.readdir(ENTREGAS).catch(() => []);
      const pedidos = [];
      for (const dir of entregas) {
        const pedPath = path.join(ENTREGAS, dir, 'pedido.json');
        try {
          const raw = await fs.readFile(pedPath, 'utf8');
          pedidos.push(JSON.parse(raw));
        } catch {}
      }
      responderJson(res, 200, { pedidos });
    } catch (e) {
      responderJson(res, 500, { error: e.message });
    }
    return;
  }

  // API: Crear nuevo regalo
  if (pathname === '/api/crear' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const tempDir = path.join(RAIZ, 'scratch', 'admin-uploads', Date.now().toString());
      await fs.mkdir(tempDir, { recursive: true });

      // Si las fotos vienen en data URLs (base64) desde el navegador, guardarlas temporalmente
      const fotosProcesadas = [];
      if (Array.isArray(body.fotos)) {
        for (const [i, f] of body.fotos.entries()) {
          if (typeof f === 'string' && f.startsWith('data:image/')) {
            const matches = f.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
            if (matches) {
              const ext = matches[1].replace('jpeg', 'jpg');
              const buffer = Buffer.from(matches[2], 'base64');
              const nombreFoto = `foto_${i + 1}.${ext}`;
              const fotoPath = path.join(tempDir, nombreFoto);
              await fs.writeFile(fotoPath, buffer);
              fotosProcesadas.push(fotoPath);
            }
          } else {
            fotosProcesadas.push(f);
          }
        }
      }
      body.fotos = fotosProcesadas;

      const resultado = await generarRegalo(body, {
        baseDir: RAIZ,
        forzar: true,
        conQR: true
      });

      // Guardar registro de pedido en pedidos/
      const nombreArchivo = `${(body.para || 'regalo').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}-${resultado.codigo}`;
      await fs.mkdir(path.join(RAIZ, 'pedidos'), { recursive: true });
      await fs.writeFile(path.join(RAIZ, 'pedidos', `${nombreArchivo}.json`), JSON.stringify({ codigo: resultado.codigo, ...body }, null, 2));

      // Limpiar fotos temporales
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

      responderJson(res, 200, {
        ok: true,
        codigo: resultado.codigo,
        url: resultado.url,
        qr: `/entregas/${resultado.codigo}/qr.png`,
        tarjeta: `/entregas/${resultado.codigo}/tarjeta-regalo.png`
      });
    } catch (e) {
      responderJson(res, 400, { ok: false, error: e.message });
    }
    return;
  }

  // Servir archivos de entregas (QR, tarjeta-regalo)
  if (pathname.startsWith('/entregas/')) {
    const rel = pathname.replace('/entregas/', '');
    const ruta = path.join(ENTREGAS, rel);
    await servirArchivo(res, ruta);
    return;
  }

  // Servir archivos de docs para preview en iframe
  if (pathname.startsWith('/docs/')) {
    const rel = pathname.replace('/docs/', '');
    let ruta = path.join(SITIO, rel);
    try {
      const stat = await fs.stat(ruta);
      if (stat.isDirectory()) ruta = path.join(ruta, 'index.html');
    } catch {}
    await servirArchivo(res, ruta);
    return;
  }

  // Servir la SPA del Panel de Administración
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_ADMIN);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Ruta no encontrada');
});

server.listen(PUERTO, () => {
  console.log(`
  ════════════════════════════════════════════════════════════
  ✦ DETALLE QR · Panel de Administración & Estudio de Pedidos
  ════════════════════════════════════════════════════════════
  Accede desde tu navegador en:
  👉 http://localhost:${PUERTO}

  Presiona Ctrl + C en esta terminal para detener el servidor.
  ════════════════════════════════════════════════════════════
  `);
});

const HTML_ADMIN = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Detalle QR · Panel de Control</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #110e14;
    --card: #18141d;
    --card-hover: #1f1a25;
    --line: #2b2432;
    --text: #f9f5f0;
    --text-muted: #9f94a5;
    --gold: #e5b869;
    --gold-hover: #f3ce8a;
    --accent: #992437;
    --green: #4ade80;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    line-height: 1.6;
    padding-bottom: 60px;
  }
  .header {
    background: #141019;
    border-bottom: 1px solid var(--line);
    padding: 18px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand {
    font-family: 'Fraunces', serif;
    font-size: 1.5rem;
    font-style: italic;
  }
  .brand span { color: var(--gold); font-style: normal; }
  .badge-live {
    font-size: 0.76rem;
    background: rgba(74, 222, 128, 0.12);
    color: var(--green);
    border: 1px solid rgba(74, 222, 128, 0.3);
    padding: 4px 10px;
    border-radius: 99px;
    font-weight: 600;
  }
  .container {
    max-width: 1200px;
    margin: 36px auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1.25fr 0.75fr;
    gap: 36px;
    align-items: start;
  }
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 28px 32px;
    box-shadow: 0 16px 36px rgba(0,0,0,0.4);
  }
  h2 {
    font-family: 'Fraunces', serif;
    font-size: 1.7rem;
    margin: 0 0 20px;
    font-weight: 500;
  }
  .form-group {
    margin-bottom: 22px;
  }
  label {
    display: block;
    font-size: 0.88rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text);
  }
  label span.optional {
    color: var(--text-muted);
    font-weight: 400;
    font-size: 0.8rem;
  }
  input, select, textarea {
    width: 100%;
    background: #110e14;
    border: 1px solid var(--line);
    color: var(--text);
    padding: 12px 16px;
    border-radius: 10px;
    font-family: inherit;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--gold);
  }
  textarea { resize: vertical; min-height: 90px; }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .template-selector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .template-opt {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 12px 14px;
    cursor: pointer;
    background: #120e16;
    transition: all 0.2s;
  }
  .template-opt:hover, .template-opt.selected {
    border-color: var(--gold);
    background: rgba(229, 184, 105, 0.08);
  }
  .template-opt b { display: block; font-size: 0.92rem; }
  .template-opt small { color: var(--text-muted); font-size: 0.78rem; }
  .dropzone {
    border: 2px dashed var(--line);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .dropzone:hover, .dropzone.dragover {
    border-color: var(--gold);
    background: rgba(229, 184, 105, 0.05);
  }
  .dropzone p { margin: 0; font-size: 0.88rem; color: var(--text-muted); }
  .preview-fotos {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }
  .preview-thumb {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--line);
  }
  .btn-submit {
    width: 100%;
    background: var(--gold);
    color: #110e14;
    border: 0;
    padding: 16px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;
    margin-top: 10px;
  }
  .btn-submit:hover {
    background: var(--gold-hover);
    transform: translateY(-2px);
  }
  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  /* Panel derecho: Resultado */
  .result-box {
    text-align: center;
    display: none;
  }
  .result-box.visible { display: block; }
  .qr-img {
    width: 220px;
    height: 220px;
    border-radius: 12px;
    background: #fff;
    padding: 10px;
    margin: 16px auto;
    box-shadow: 0 10px 24px rgba(0,0,0,0.5);
  }
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }
  .btn-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #231c28;
    color: var(--text);
    border: 1px solid var(--line);
    padding: 12px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  .btn-action:hover {
    border-color: var(--gold);
    color: var(--gold);
  }
  .url-pill {
    background: #0d0a10;
    border: 1px solid var(--line);
    padding: 10px 14px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--gold);
    word-break: break-all;
    margin: 14px 0;
  }
  .history-list {
    margin-top: 24px;
    list-style: none;
    padding: 0;
    display: grid;
    gap: 10px;
    max-height: 380px;
    overflow-y: auto;
  }
  .history-item {
    background: #110e14;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
  }
  @media (max-width: 900px) {
    .container { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">Detalle<span> QR</span> · Estudio de Creación</div>
    <span class="badge-live">● Servidor Activo</span>
  </div>

  <div class="container">
    <!-- Formulario de Pedido -->
    <div class="card">
      <h2>Nuevo Regalo Personalizado</h2>
      <form id="formPedido">
        <!-- Plantilla -->
        <div class="form-group">
          <label>1. Selecciona la Plantilla</label>
          <div class="template-selector" id="plantillasContainer">
            <!-- Inyectado por JS -->
          </div>
          <input type="hidden" name="plantilla" id="plantillaInput" required>
        </div>

        <!-- Plan -->
        <div class="form-group">
          <label>2. Plan de Entrega</label>
          <div class="grid-2">
            <select name="plan" id="planInput">
              <option value="basico">Básico ($5) · Sin fotos</option>
              <option value="chevere" selected>Chévere ($10) · 1 Foto Polaroid</option>
              <option value="vip">VIP ($15) · Hasta 10 Fotos + Música + Clave</option>
            </select>
            <input type="text" name="codigo" placeholder="Código personalizado (opcional)">
          </div>
        </div>

        <!-- Nombres -->
        <div class="form-group grid-2">
          <div>
            <label>Para (Destinatario) *</label>
            <input type="text" name="para" placeholder="Ej. Camila" required>
          </div>
          <div>
            <label>De (Remitente) *</label>
            <input type="text" name="de" placeholder="Ej. Mateo" required>
          </div>
        </div>

        <!-- Título y Mensaje -->
        <div class="form-group">
          <label>Título Grande <span class="optional">(dejar en blanco para usar el de la plantilla)</span></label>
          <input type="text" name="titulo" placeholder="Ej. Feliz Aniversario, mi amor">
        </div>

        <div class="form-group">
          <label>Dedicatoria / Mensaje *</label>
          <textarea name="mensaje" placeholder="Escribe aquí tu mensaje especial..." required></textarea>
        </div>

        <!-- Fotos -->
        <div class="form-group" id="fotosGroup">
          <label>Fotografías <span class="optional">(arrastra imágenes aquí)</span></label>
          <div class="dropzone" id="dropzone">
            <p>📷 Haz clic o arrastra fotos aquí (JPG, PNG, WebP)</p>
            <input type="file" id="fileInput" multiple accept="image/*" style="display:none">
          </div>
          <div class="preview-fotos" id="previewFotos"></div>
        </div>

        <!-- Música (VIP) -->
        <div class="form-group">
          <label>Canción / Música <span class="optional">(Enlace de Spotify o YouTube)</span></label>
          <input type="url" name="musica" placeholder="https://open.spotify.com/track/...">
        </div>

        <!-- Extras VIP -->
        <div class="form-group grid-2">
          <div>
            <label>Pregunta Secreta <span class="optional">(VIP)</span></label>
            <input type="text" name="pregunta" placeholder="Ej. ¿Dónde nos conocimos?">
          </div>
          <div>
            <label>Respuesta Aceptada <span class="optional">(separar con |)</span></label>
            <input type="text" name="respuesta" placeholder="cafeteria|en el cafe">
          </div>
        </div>

        <!-- Específicos por plantilla -->
        <div class="form-group grid-2">
          <div>
            <label>Fecha inicio <span class="optional">(Solo Carta de Amor: AAAA-MM-DD)</span></label>
            <input type="date" name="desde">
          </div>
          <div>
            <label>Edad <span class="optional">(Solo Cumpleaños)</span></label>
            <input type="number" name="edad" placeholder="Ej. 24">
          </div>
        </div>

        <button type="submit" class="btn-submit" id="btnCrear">✨ Generar Regalo & Tarjeta</button>
      </form>
    </div>

    <!-- Panel de Resultado & Preview -->
    <div>
      <div class="card result-box" id="resultCard">
        <h2>¡Regalo Listo! 🎉</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">El detalle ha sido generado con éxito en alta resolución.</p>
        <img class="qr-img" id="resQr" alt="Código QR">
        <div class="url-pill" id="resUrl"></div>
        <div class="action-buttons">
          <a class="btn-action" id="btnVerWeb" target="_blank">🌐 Ver Web en Vivo</a>
          <a class="btn-action" id="btnDescargarTarjeta" download="tarjeta-regalo.png">🖨 Descargar Tarjeta Imprimible (300 DPI)</a>
          <a class="btn-action" id="btnDescargarQr" download="qr.png">📥 Descargar Código QR</a>
        </div>
      </div>

      <!-- Historial de Pedidos -->
      <div class="card" style="margin-top: 24px;">
        <h2>Regalos Recientes</h2>
        <ul class="history-list" id="historialList">
          <li style="color:var(--text-muted); font-size:0.85rem;">Cargando pedidos...</li>
        </ul>
      </div>
    </div>
  </div>

<script>
  let fotosBase64 = [];

  // Cargar configuración
  async function cargarConfig() {
    const res = await fetch('/api/config');
    const { config, plantillas } = await res.json();
    const cont = document.getElementById('plantillasContainer');
    cont.innerHTML = plantillas.map((p, i) => \`
      <div class="template-opt \${i === 0 ? 'selected' : ''}" data-val="\${p}">
        <b>\${p}</b>
        <small>Plantilla interactiva</small>
      </div>
    \`).join('');

    document.getElementById('plantillaInput').value = plantillas[0];

    document.querySelectorAll('.template-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.template-opt').forEach(x => x.classList.remove('selected'));
        opt.classList.add('selected');
        document.getElementById('plantillaInput').value = opt.dataset.val;
      });
    });
  }

  // Cargar Historial
  async function cargarHistorial() {
    const res = await fetch('/api/pedidos');
    const { pedidos } = await res.json();
    const cont = document.getElementById('historialList');
    if (!pedidos.length) {
      cont.innerHTML = '<li style="color:var(--text-muted); font-size:0.85rem;">No hay pedidos generados aún.</li>';
      return;
    }
    cont.innerHTML = pedidos.slice(-8).reverse().map(p => \`
      <li class="history-item">
        <div>
          <b>\${p.para || 'Regalo'}</b>
          <div style="color:var(--text-muted); font-size:0.75rem;">\${p.plantilla} · \${p.codigo}</div>
        </div>
        <a class="btn-action" style="padding:6px 12px; font-size:0.75rem;" href="/docs/\${p.codigo}/" target="_blank">Abrir</a>
      </li>
    \`).join('');
  }

  // Manejo de Dropzone de fotos
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('previewFotos');

  dropzone.onclick = () => fileInput.click();
  dropzone.ondragover = e => { e.preventDefault(); dropzone.classList.add('dragover'); };
  dropzone.ondragleave = () => dropzone.classList.remove('dragover');
  dropzone.ondrop = e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    procesarArchivos(e.dataTransfer.files);
  };
  fileInput.onchange = e => procesarArchivos(e.target.files);

  function procesarArchivos(files) {
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = ev => {
        fotosBase64.push(ev.target.result);
        const img = document.createElement('img');
        img.className = 'preview-thumb';
        img.src = ev.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(f);
    }
  }

  // Envío del Formulario
  document.getElementById('formPedido').onsubmit = async e => {
    e.preventDefault();
    const btn = document.getElementById('btnCrear');
    btn.disabled = true;
    btn.textContent = 'Procesando imágenes y QR...';

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.fotos = fotosBase64;

    try {
      const res = await fetch('/api/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      document.getElementById('resQr').src = json.qr + '?t=' + Date.now();
      document.getElementById('resUrl').textContent = json.url;
      document.getElementById('btnVerWeb').href = '/docs/' + json.codigo + '/';
      document.getElementById('btnDescargarTarjeta').href = json.tarjeta;
      document.getElementById('btnDescargarQr').href = json.qr;
      document.getElementById('resultCard').classList.add('visible');
      cargarHistorial();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Error al generar: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ Generar Regalo & Tarjeta';
    }
  };

  cargarConfig();
  cargarHistorial();
</script>
</body>
</html>
`;
