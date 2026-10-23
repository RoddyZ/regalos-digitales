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
  // Un regalo se registra una sola vez: regenerarlo con --forzar no agrega otra fila.
  if ((await fs.readFile(registro, 'utf8')).includes(`,${csv(codigo)},`)) return dir;
  await fs.appendFile(
    registro,
    [new Date().toISOString(), codigo, pedido.plantilla, pedido.plan, pedido.cliente, pedido.telefono, url].map(csv).join(',') + '\n'
  );
  return dir;
}


/* ---------- Tarjeta imprimible ---------- */

// Paleta de la tarjeta según el diseño del regalo (la misma de cada plantilla).
const PALETAS = {
  'flores-amarillas': { fondo: '#fdf1d3', caja: '#ffc23d', cinta: '#6fae5b', texto: '#b35c00' },
  'atrapa-corazones': { fondo: '#ffe3e8', caja: '#ff5a6e', cinta: '#ffd166', texto: '#d6334a' },
  'carta-amor': { fondo: '#f8e4da', caja: '#f7c9c0', cinta: '#e0475b', texto: '#c22e44' },
  'cumpleanos': { fondo: '#d9f0e4', caja: '#ff9aad', cinta: '#ffd166', texto: '#d6336c' },
  'san-valentin': { fondo: '#ffd6de', caja: '#ff5a6e', cinta: '#fffdf8', texto: '#d6334a' },
  'graduacion': { fondo: '#dfe8fb', caja: '#23366b', cinta: '#ffc23d', texto: '#2c4a9a' },
  'navidad': { fondo: '#1f5c45', caja: '#e5484d', cinta: '#ffd166', texto: '#c8343a' },
  'ano-nuevo': { fondo: '#1d2b5e', caja: '#ff6b8b', cinta: '#ffd166', texto: '#d6336c' },
  'dia-del-padre': { fondo: '#d3e6f5', caja: '#23366b', cinta: '#ffc23d', texto: '#c2410c' }
};
const PALETA_BASE = { fondo: '#fff4e6', caja: '#ff8a5b', cinta: '#ffd166', texto: '#c2410c' };
const TINTA = '#2a211c';

// Fuentes de la marca (licencia OFL) para dibujar el texto de la tarjeta.
const FUENTES = path.join(RAIZ, 'marca', 'fuentes');
const LETRAS = {
  titulo: ['Fraunces SemiBold', 'Fraunces-SemiBold.ttf'],
  mano: ['Caveat Bold', 'Caveat-Bold.ttf'],
  texto: ['Nunito ExtraBold', 'Nunito-ExtraBold.ttf'],
  suave: ['Nunito Bold', 'Nunito-Bold.ttf']
};

const escXml = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

/** Dibuja un texto con una fuente de la marca y devuelve la imagen y su tamaño. */
async function texto(contenido, letra, tam, color, ancho = 940) {
  const [nombre, archivo] = LETRAS[letra];
  const imagen = await sharp({
    text: {
      text: `<span foreground="${color}">${escXml(contenido)}</span>`,
      font: `${nombre} ${tam}`,
      fontfile: path.join(FUENTES, archivo),
      width: ancho,
      align: 'center',
      dpi: 72,
      rgba: true,
      wrap: 'word'
    }
  }).png().toBuffer();
  const { width, height } = await sharp(imagen).metadata();
  return { imagen, width, height };
}

/**
 * Tarjeta física del regalo (1200 × 1800 px = 10 × 15 cm a 300 DPI), con el mismo estilo de papelería
 * de los regalos: marco del color del diseño, caja de regalo, "Tu regalo está aquí", el QR pegado con
 * cinta, los pasos para abrirlo y la firma.
 */
async function generarTarjetaImprimible({ dir, codigo, pedido, qrBuffer, marca }) {
  const p = PALETAS[pedido.plantilla] || PALETA_BASE;
  const W = 1200, H = 1800, centro = W / 2;
  const borde = `stroke="${TINTA}" stroke-width="7" stroke-linejoin="round"`;
  const fino = `stroke="${TINTA}" stroke-width="4" stroke-linejoin="round"`;
  const washi = (x, y, giro) =>
    `<g transform="translate(${x} ${y}) rotate(${giro})"><rect x="-80" y="-24" width="160" height="48" fill="${p.cinta}" opacity=".82"/>` +
    `<path d="M-80 -24h160M-80 24h160" stroke="#fff" stroke-width="2" opacity=".5"/></g>`;
  const estrella = (x, y, s, c) =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0-20l5.2 10.6 11.6 1.7-8.4 8.2 2 11.6L0 6.6l-10.4 5.5 2-11.6-8.4-8.2 11.6-1.7z" fill="${c}" ${fino}/>`;
  const corazon = (x, y, s, c) =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0 16C-11 9-17 2-17-5a8.5 8.5 0 0 1 17-3 8.5 8.5 0 0 1 17 3c0 7-6 14-17 21z" fill="${c}" ${fino}/>`;

  // Textos con las fuentes de la marca
  const para = await texto(`Para ${pedido.para || 'alguien especial'}`, 'mano', 84, p.texto);
  const titulo = await texto('Tu regalo está aquí', 'titulo', 96, TINTA);
  const pasos = await Promise.all(['Abre la cámara', 'Apunta al código', 'Toca el enlace']
    .map(t => texto(t, 'texto', 32, TINTA, 300)));
  const numeros = await Promise.all(['1', '2', '3'].map(n => texto(n, 'texto', 40, TINTA, 80)));
  const firma = pedido.de ? await texto(`De: ${pedido.de}`, 'mano', 70, p.texto) : null;
  const pie = await texto(`${marca} · Tu regalo listo, hecho con mucho amor`, 'suave', 28, '#7a6d62');
  const cod = await texto(codigo.toUpperCase(), 'suave', 22, '#a89988', 300);

  // Posiciones verticales
  const yPara = 372, yTitulo = yPara + para.height + 2;
  const yQR = Math.max(610, yTitulo + titulo.height + 44), ladoQR = 600;
  const yPasos = yQR + ladoQR + 90;
  const xPasos = [270, 600, 930];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${p.fondo}"/>
    <rect x="88" y="88" width="1060" height="1660" rx="44" fill="${TINTA}"/>
    <rect x="70" y="70" width="1060" height="1660" rx="44" fill="#fffdf8" ${borde}/>

    ${estrella(170, 190, 1.6, p.cinta)} ${corazon(1030, 200, 1.6, p.caja)}
    ${corazon(160, 1640, 1.4, p.caja)} ${estrella(1040, 1630, 1.5, p.cinta)}

    <g transform="translate(${centro - 117} 120) scale(1.46)">
      <ellipse cx="80" cy="142" rx="56" ry="6" fill="${TINTA}" opacity=".14"/>
      <rect x="24" y="66" width="112" height="72" rx="8" fill="${p.caja}" ${fino}/>
      <rect x="70" y="66" width="20" height="72" fill="${p.cinta}" ${fino}/>
      <rect x="33" y="76" width="9" height="20" rx="4.5" fill="#fff" opacity=".45"/>
      <path d="M80 47C70 26 47 25 52 40c3 8 18 8 28 7zM80 47c10-21 33-22 28-7-3 8-18 8-28 7z" fill="${p.cinta}" ${fino}/>
      <rect x="14" y="46" width="132" height="24" rx="6" fill="${p.caja}" ${fino}/>
      <rect x="68" y="46" width="24" height="24" fill="${p.cinta}" ${fino}/>
      <circle cx="80" cy="46" r="6.5" fill="${p.cinta}" ${fino}/>
    </g>

    <rect x="${centro - ladoQR / 2 + 14}" y="${yQR + 14}" width="${ladoQR}" height="${ladoQR}" rx="30" fill="${TINTA}"/>
    <rect x="${centro - ladoQR / 2}" y="${yQR}" width="${ladoQR}" height="${ladoQR}" rx="30" fill="#fff" ${borde}/>
    ${washi(centro - ladoQR / 2 + 40, yQR + 14, -32)} ${washi(centro + ladoQR / 2 - 40, yQR + 14, 32)}

    <path d="M${xPasos[0] + 70} ${yPasos} H${xPasos[2] - 70}" stroke="${TINTA}" stroke-width="4" stroke-dasharray="2 16" stroke-linecap="round"/>
    ${xPasos.map(x => `<circle cx="${x}" cy="${yPasos}" r="40" fill="${p.cinta}" ${fino}/>`).join('')}

    <path d="M${centro - 150} ${H - 250} c50-18 90 10 150-4 s110-14 150 2" fill="none" stroke="${p.caja}" stroke-width="8" stroke-linecap="round"/>
  </svg>`;

  const enCentro = (t, y, x = centro) => ({ input: t.imagen, left: Math.round(x - t.width / 2), top: Math.round(y) });
  const qr = await sharp(qrBuffer).resize(ladoQR - 60, ladoQR - 60).png().toBuffer();
  const capas = [
    enCentro(para, yPara),
    enCentro(titulo, yTitulo),
    { input: qr, left: centro - ladoQR / 2 + 30, top: yQR + 30 },
    ...numeros.map((n, i) => enCentro(n, yPasos - n.height / 2 - 2, xPasos[i])),
    ...pasos.map((t, i) => enCentro(t, yPasos + 58, xPasos[i])),
    ...(firma ? [enCentro(firma, yPasos + 150)] : []),
    enCentro(pie, H - 214),
    enCentro(cod, H - 164)
  ];

  await sharp(Buffer.from(svg))
    .composite(capas)
    .withMetadata({ density: 300 })
    .png()
    .toFile(path.join(dir, 'tarjeta-regalo.png'));

  // La versión SVG anterior ya no se genera (sus letras no coincidían con las de la marca).
  await fs.rm(path.join(dir, 'tarjeta-regalo.svg'), { force: true });
}
