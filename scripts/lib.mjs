import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import QRCode from 'qrcode';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SITIO = path.join(RAIZ, 'docs');
export const PLANTILLAS = path.join(RAIZ, 'plantillas');
export const ENTREGAS = path.join(RAIZ, 'entregas');

export async function leerConfig() {
  return JSON.parse(await fs.readFile(path.join(RAIZ, 'config.json'), 'utf8'));
}

// Sin 0/o/1/l/i para que el código se pueda dictar sin confusiones.
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';
export function codigoAleatorio(largo = 8) {
  const bytes = crypto.randomBytes(largo);
  return Array.from(bytes, b => ALFABETO[b % ALFABETO.length]).join('');
}

// Debe coincidir con normalizar() en docs/assets/regalo.js
export function hashRespuesta(texto) {
  const limpio = String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return crypto.createHash('sha256').update(limpio).digest('hex');
}

const existe = p => fs.access(p).then(() => true, () => false);

// "María José" → "maria-jose"
export function slug(texto, largo = 24) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, largo).replace(/-+$/, '') || 'regalo';
}

/**
 * Todas las entregas (carpetas con pedido.json) en cualquier nivel de entregas/.
 * Devuelve [{ dir, pedido, numero }], ordenadas por número de pedido.
 */
export async function listarEntregas() {
  const encontradas = [];
  async function recorrer(dir, nivel) {
    const items = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    if (items.some(i => i.isFile() && i.name === 'pedido.json')) {
      try {
        const pedido = JSON.parse(await fs.readFile(path.join(dir, 'pedido.json'), 'utf8'));
        const m = path.basename(dir).match(/^(\d{4,})-/);
        const numero = m ? parseInt(m[1], 10) : null;
        encontradas.push({ dir, pedido, numero });
      } catch {}
      return;
    }
    if (nivel < 3) for (const i of items) if (i.isDirectory()) await recorrer(path.join(dir, i.name), nivel + 1);
  }
  await recorrer(ENTREGAS, 0);
  return encontradas.sort((a, b) => (a.numero ?? Infinity) - (b.numero ?? Infinity));
}

/**
 * Carpeta de entrega de un regalo:  entregas/<NN-plan>/<plantilla>/<0001-para-codigo>/
 * Si el regalo ya existía (un cambio con --forzar), conserva su número y lo mueve si cambió de plan o plantilla.
 * El código y la URL pública no dependen de esta carpeta.
 */
export async function carpetaEntrega(codigo, pedido, config) {
  const todas = await listarEntregas();
  const previa = todas.find(e => e.pedido.codigo === codigo || path.basename(e.dir).endsWith('-' + codigo) || path.basename(e.dir) === codigo);
  const numero = previa?.numero ?? Math.max(0, ...todas.map(e => e.numero || 0)) + 1;

  const planes = Object.keys(config.planes);
  const plan = pedido.plan || 'basico';
  const carpetaPlan = `${String(planes.indexOf(plan) + 1).padStart(2, '0')}-${plan}`;
  const destino = path.join(ENTREGAS, carpetaPlan, pedido.plantilla, `${String(numero).padStart(4, '0')}-${slug(pedido.para)}-${codigo}`);

  if (previa && previa.dir !== destino) {
    await fs.mkdir(path.dirname(destino), { recursive: true });
    await fs.rename(previa.dir, destino);
    await borrarVacias(path.dirname(previa.dir));
  }
  await fs.mkdir(destino, { recursive: true });
  return destino;
}

// Sube desde dir borrando carpetas vacías, sin pasar de entregas/.
async function borrarVacias(dir) {
  while (dir.startsWith(ENTREGAS + path.sep)) {
    if ((await fs.readdir(dir).catch(() => ['x'])).length) return;
    await fs.rmdir(dir);
    dir = path.dirname(dir);
  }
}

async function codigoLibre() {
  for (;;) {
    const c = codigoAleatorio();
    if (!(await existe(path.join(SITIO, c)))) return c;
  }
}

const ENLACE_MUSICA = /^https:\/\/(open\.spotify\.com|(www\.|m\.)?youtube\.com|youtu\.be)\//;

// Campos del pedido que son privados y no van a la web pública.
const PRIVADOS = new Set(['plantilla', 'plan', 'codigo', 'cliente', 'telefono', 'notas', 'fotos', 'musica', 'expira', 'respuesta']);

/**
 * Valida la consistencia de un pedido antes de procesarlo.
 */
export async function validarPedido(pedido, config) {
  const errores = [];
  if (!pedido || typeof pedido !== 'object') {
    return { valido: false, errores: ['El pedido debe ser un objeto válido.'] };
  }

  const plan = config.planes[pedido.plan || 'basico'];
  if (!plan) errores.push(`Plan "${pedido.plan}" inválido. Opciones disponibles: ${Object.keys(config.planes).join(', ')}`);

  const plantillaRuta = path.join(PLANTILLAS, `${pedido.plantilla}.html`);
  if (!(await existe(plantillaRuta))) {
    errores.push(`Plantilla "${pedido.plantilla}" no encontrada en la carpeta plantillas/.`);
  }

  const fotos = pedido.fotos || [];
  if (plan && fotos.length > plan.maxFotos) {
    errores.push(`El plan ${plan.nombre} admite hasta ${plan.maxFotos} foto(s), pero el pedido contiene ${fotos.length}.`);
  }

  if (pedido.musica && plan && !plan.musica) {
    errores.push(`El plan ${plan.nombre} no incluye música.`);
  }

  // Solo enlaces: la canción se reproduce desde Spotify/YouTube y la página no pesa más.
  if (pedido.musica && !ENLACE_MUSICA.test(pedido.musica)) {
    errores.push('La canción debe ser un enlace de Spotify (o YouTube). No se suben archivos de audio.');
  }

  if ((pedido.pregunta || pedido.abreEl) && plan && !plan.extras) {
    errores.push(`El plan ${plan.nombre} no incluye extras como pregunta secreta o cuenta regresiva.`);
  }

  if (pedido.pregunta && !pedido.respuesta) {
    errores.push('Si configuras una pregunta secreta, debes incluir al menos una respuesta.');
  }

  return { valido: errores.length === 0, errores };
}

/**
 * Genera docs/<codigo>/ a partir de un pedido y devuelve { codigo, url, carpeta }.
 */
export async function generarRegalo(pedido, { baseDir = RAIZ, codigo, forzar = false, conQR = true } = {}) {
  const config = await leerConfig();
  const { valido, errores } = await validarPedido(pedido, config);
  if (!valido) throw new Error(`Error en pedido: ${errores.join(' | ')}`);

  const plan = config.planes[pedido.plan || 'basico'];
  const plantilla = path.join(PLANTILLAS, `${pedido.plantilla}.html`);

  codigo = codigo || pedido.codigo || (await codigoLibre());
  if (!/^[a-z0-9-]{4,40}$/.test(codigo)) throw new Error(`Código inválido: "${codigo}" (solo minúsculas, números y guiones).`);

  const carpeta = path.join(SITIO, codigo);
  if ((await existe(carpeta)) && !forzar) throw new Error(`Ya existe un regalo con código "${codigo}". Usa forzar:true para sobrescribir.`);

  await fs.rm(carpeta, { recursive: true, force: true });
  await fs.mkdir(carpeta, { recursive: true });

  const datos = Object.fromEntries(Object.entries(pedido).filter(([k]) => !PRIVADOS.has(k)));

  // Fotos: procesadas en WebP de alta fidelidad, max 1200px
  datos.fotos = [];
  const fotos = pedido.fotos || [];
  for (const [i, f] of fotos.entries()) {
    const ruta = path.resolve(baseDir, typeof f === 'string' ? f : f.ruta);
    const nombre = `f${i + 1}.webp`;
    await sharp(ruta).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(carpeta, nombre));
    datos.fotos.push(typeof f === 'string' || !f.texto ? { src: nombre } : { src: nombre, texto: f.texto });
  }

  if (pedido.musica) datos.musica = pedido.musica;

  if (pedido.respuesta) {
    datos.respuestas = String(pedido.respuesta).split('|').map(r => hashRespuesta(r));
  }

  if (pedido.expira) {
    datos.expira = pedido.expira;
  } else if (plan.diasVigencia) {
    datos.expira = new Date(Date.now() + plan.diasVigencia * 86400000).toISOString().slice(0, 10);
  }

  const html = (await fs.readFile(plantilla, 'utf8')).replace(
    /\/\*__DATOS__\*\/[\s\S]*?\/\*__FIN__\*\//,
    () => JSON.stringify(datos).replace(/</g, '\\u003c')
  );
  await fs.writeFile(path.join(carpeta, 'index.html'), html);

  const url = config.urlBase.replace(/\/?$/, '/') + codigo + '/';
  const entrega = conQR ? await generarQR(codigo, url, pedido) : null;
  return { codigo, url, carpeta, entrega };
}

/**
 * Genera el paquete de entrega física y digital: QR individual y Tarjeta Imprimible de Alta Resolución.
 */
export async function generarQR(codigo, url, pedido = {}) {
  const config = await leerConfig();
  const dir = await carpetaEntrega(codigo, pedido, config);

  const opciones = {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: { dark: config.qrColor || '#1a1614', light: '#ffffff' }
  };

  const png = await QRCode.toBuffer(url, { ...opciones, width: 1200 });
  const logo = config.qrLogo && path.resolve(RAIZ, config.qrLogo);

  let qrBufferFinal = png;
  if (logo && (await existe(logo))) {
    const lado = 1200, marco = 300, tam = 250;
    const fondo = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${marco}" height="${marco}"><rect width="100%" height="100%" rx="36" fill="#fff"/></svg>`);
    const icono = await sharp(logo).resize(tam, tam, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toBuffer();
    const centro = (lado - marco) / 2;
    qrBufferFinal = await sharp(png).composite([
      { input: fondo, left: centro, top: centro },
      { input: icono, left: (lado - tam) / 2, top: (lado - tam) / 2 }
    ]).png().toBuffer();
  }

  await fs.writeFile(path.join(dir, 'qr.png'), qrBufferFinal);
  await fs.writeFile(path.join(dir, 'qr.svg'), await QRCode.toString(url, { ...opciones, type: 'svg' }));

  // Generación de la Tarjeta Imprimible de Regalo (Postal 1200 x 1800 px)
  await generarTarjetaImprimible({
    dir,
    codigo,
    url,
    pedido,
    qrBuffer: qrBufferFinal,
    marca: config.marca || 'Detallazo'
  });

  await fs.writeFile(path.join(dir, 'pedido.json'), JSON.stringify({ ...pedido, codigo }, null, 2));

  const registro = path.join(ENTREGAS, 'registro.csv');
  if (!(await existe(registro))) {
    await fs.writeFile(registro, 'fecha,codigo,plantilla,plan,cliente,telefono,url\n');
  }
  const csv = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  await fs.appendFile(
    registro,
    [new Date().toISOString(), codigo, pedido.plantilla, pedido.plan, pedido.cliente, pedido.telefono, url].map(csv).join(',') + '\n'
  );
  return dir;
}

/**
 * Crea una tarjeta física de regalo en alta resolución (1200 x 1800 px) lista para imprimir.
 */
async function generarTarjetaImprimible({ dir, codigo, url, pedido, qrBuffer, marca }) {
  const destinatario = (pedido.para || 'Alguien especial').replace(/[<>&"']/g, '');
  const remitente = pedido.de ? `De: ${pedido.de.replace(/[<>&"']/g, '')}` : '';

  // Redimensionar el QR para encajar en la tarjeta
  const qrTarjeta = await sharp(qrBuffer).resize(620, 620).png().toBuffer();

  const svgBase = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800" viewBox="0 0 1200 1800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fcf9f2"/>
        <stop offset="100%" stop-color="#f5ede0"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#2a221b" flood-opacity="0.18"/>
      </filter>
    </defs>

    <!-- Fondo de tarjeta -->
    <rect width="1200" height="1800" fill="url(#bg)"/>

    <!-- Marco decorativo doble -->
    <rect x="50" y="50" width="1100" height="1700" rx="20" fill="none" stroke="#dfd2bf" stroke-width="2"/>
    <rect x="64" y="64" width="1072" height="1672" rx="16" fill="none" stroke="#c5933a" stroke-width="3" stroke-opacity="0.5"/>

    <!-- Cabecera / Marca -->
    <text x="600" y="190" text-anchor="middle" font-family="'Georgia', serif" font-size="28" letter-spacing="8" fill="#8c7863">· ${marca.toUpperCase()} ·</text>
    <text x="600" y="270" text-anchor="middle" font-family="'Georgia', serif" font-style="italic" font-size="68" fill="#1f1b16">Te llegó un detallazo</text>

    <!-- Destinatario -->
    <text x="600" y="380" text-anchor="middle" font-family="'Georgia', serif" font-size="46" fill="#992437">Para ${destinatario}</text>

    <!-- Marco blanco para el QR con sombra -->
    <rect x="250" y="470" width="700" height="700" rx="32" fill="#ffffff" filter="url(#shadow)"/>
    <rect x="250" y="470" width="700" height="700" rx="32" fill="none" stroke="#ece4d8" stroke-width="2"/>

    <!-- Instrucciones -->
    <text x="600" y="1270" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="34" letter-spacing="2" fill="#1f1b16">ABRE LA CÁMARA DE TU CELULAR</text>
    <text x="600" y="1330" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="26" fill="#66594d">y enfoca este código para descubrir tu sorpresa</text>

    <!-- Línea divisoria elegante -->
    <line x1="450" y1="1440" x2="750" y2="1440" stroke="#c5933a" stroke-width="2" stroke-linecap="round"/>

    <!-- Remitente o Código -->
    <text x="600" y="1530" text-anchor="middle" font-family="'Georgia', serif" font-style="italic" font-size="42" fill="#1f1b16">${remitente}</text>
    <text x="600" y="1660" text-anchor="middle" font-family="'Courier New', monospace" font-size="20" letter-spacing="4" fill="#a89988">CÓDIGO: ${codigo.toUpperCase()}</text>
    <text x="600" y="1700" text-anchor="middle" font-family="'Georgia', serif" font-style="italic" font-size="22" fill="#8c7863">Tu regalo listo, hecho con mucho amor</text>
  </svg>
  `;

  // Componer el SVG base con el QR incrustado
  await sharp(Buffer.from(svgBase))
    .composite([{ input: qrTarjeta, left: 290, top: 510 }])
    .png({ quality: 95 })
    .toFile(path.join(dir, 'tarjeta-regalo.png'));

  await fs.writeFile(path.join(dir, 'tarjeta-regalo.svg'), svgBase);
}
