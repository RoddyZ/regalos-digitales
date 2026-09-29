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

const existe = p => fs.access(p).then(() => true, () => false);

async function codigoLibre() {
  for (;;) {
    const c = codigoAleatorio();
    if (!(await existe(path.join(SITIO, c)))) return c;
  }
}

// Campos del pedido que no van a la página pública.
const PRIVADOS = new Set(['plantilla', 'plan', 'codigo', 'cliente', 'telefono', 'notas', 'fotos', 'musica', 'expira']);

/**
 * Genera docs/<codigo>/ a partir de un pedido y devuelve { codigo, url, carpeta }.
 * pedido.fotos: rutas (o { ruta, texto }) relativas a `baseDir`.
 */
export async function generarRegalo(pedido, { baseDir = RAIZ, codigo, forzar = false, conQR = true } = {}) {
  const config = await leerConfig();
  const plan = config.planes[pedido.plan || 'basico'];
  if (!plan) throw new Error(`Plan "${pedido.plan}" no existe. Opciones: ${Object.keys(config.planes).join(', ')}`);

  const plantilla = path.join(PLANTILLAS, `${pedido.plantilla}.html`);
  if (!(await existe(plantilla))) {
    const hay = (await fs.readdir(PLANTILLAS)).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''));
    throw new Error(`Plantilla "${pedido.plantilla}" no existe. Opciones: ${hay.join(', ')}`);
  }

  const fotos = pedido.fotos || [];
  if (fotos.length > plan.maxFotos) throw new Error(`El plan ${plan.nombre} permite ${plan.maxFotos} fotos y el pedido trae ${fotos.length}.`);
  if (pedido.musica && !plan.musica) throw new Error(`El plan ${plan.nombre} no incluye música.`);

  codigo = codigo || pedido.codigo || (await codigoLibre());
  if (!/^[a-z0-9-]{4,40}$/.test(codigo)) throw new Error(`Código inválido: "${codigo}" (solo minúsculas, números y guiones).`);
  const carpeta = path.join(SITIO, codigo);
  if ((await existe(carpeta)) && !forzar) throw new Error(`Ya existe un regalo con código "${codigo}". Usa --forzar para sobrescribirlo.`);
  await fs.rm(carpeta, { recursive: true, force: true });
  await fs.mkdir(carpeta, { recursive: true });

  // Datos públicos: todo lo del pedido menos lo privado.
  const datos = Object.fromEntries(Object.entries(pedido).filter(([k]) => !PRIVADOS.has(k)));

  // Fotos: corrige orientación, máx 1200px, WebP ~80% → ~100-200 KB cada una.
  datos.fotos = [];
  for (const [i, f] of fotos.entries()) {
    const ruta = path.resolve(baseDir, typeof f === 'string' ? f : f.ruta);
    const nombre = `f${i + 1}.webp`;
    await sharp(ruta).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(carpeta, nombre));
    datos.fotos.push(typeof f === 'string' || !f.texto ? { src: nombre } : { src: nombre, texto: f.texto });
  }

  if (pedido.musica) {
    if (/^https?:\/\//.test(pedido.musica)) datos.musica = pedido.musica;
    else {
      const ext = path.extname(pedido.musica) || '.mp3';
      await fs.copyFile(path.resolve(baseDir, pedido.musica), path.join(carpeta, 'musica' + ext));
      datos.musica = 'musica' + ext;
    }
  }

  if (pedido.expira) datos.expira = pedido.expira;
  else if (plan.diasVigencia) datos.expira = new Date(Date.now() + plan.diasVigencia * 86400000).toISOString().slice(0, 10);

  const html = (await fs.readFile(plantilla, 'utf8')).replace(
    /\/\*__DATOS__\*\/[\s\S]*?\/\*__FIN__\*\//,
    // < evita que un "</script>" dentro del mensaje rompa la página
    () => JSON.stringify(datos).replace(/</g, '\\u003c')
  );
  await fs.writeFile(path.join(carpeta, 'index.html'), html);

  const url = config.urlBase.replace(/\/?$/, '/') + codigo + '/';
  if (conQR) await generarQR(codigo, url, pedido);
  return { codigo, url, carpeta };
}

export async function generarQR(codigo, url, pedido = {}) {
  const dir = path.join(ENTREGAS, codigo);
  await fs.mkdir(dir, { recursive: true });
  const opciones = { errorCorrectionLevel: 'H', margin: 2, color: { dark: '#1a1026', light: '#ffffff' } };
  await QRCode.toFile(path.join(dir, 'qr.png'), url, { ...opciones, width: 1200 });
  await fs.writeFile(path.join(dir, 'qr.svg'), await QRCode.toString(url, { ...opciones, type: 'svg' }));
  await fs.writeFile(path.join(dir, 'pedido.json'), JSON.stringify({ ...pedido, codigo }, null, 2));
  const registro = path.join(ENTREGAS, 'registro.csv');
  if (!(await existe(registro))) await fs.writeFile(registro, 'fecha,codigo,plantilla,plan,cliente,telefono,url\n');
  const csv = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  await fs.appendFile(registro, [new Date().toISOString(), codigo, pedido.plantilla, pedido.plan, pedido.cliente, pedido.telefono, url].map(csv).join(',') + '\n');
}
