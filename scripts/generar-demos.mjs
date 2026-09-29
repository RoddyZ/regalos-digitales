// Regenera las páginas de muestra docs/demo-<plantilla>/ a partir de demos/<plantilla>.json.
// Son las que se enseñan en Instagram/TikTok y en la página principal.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { generarRegalo, RAIZ } from './lib.mjs';

const DEMOS = path.join(RAIZ, 'demos');
const FOTOS = path.join(DEMOS, 'fotos');

// Fotos de relleno si todavía no pusiste fotos reales en demos/fotos/.
const colores = [['#ffb347', '#ffcc33'], ['#ff5f6d', '#ffc371'], ['#a18cd1', '#fbc2eb'], ['#43cea2', '#185a9d']];
await fs.mkdir(FOTOS, { recursive: true });
for (const [i, [a, b]] of colores.entries()) {
  const ruta = path.join(FOTOS, `muestra${i + 1}.jpg`);
  if (await fs.access(ruta).then(() => true, () => false)) continue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="800" height="1000" fill="url(#g)"/>
    <text x="400" y="520" font-family="sans-serif" font-size="56" fill="#fff" text-anchor="middle" opacity=".9">Tu foto aquí</text></svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(ruta);
}

for (const f of (await fs.readdir(DEMOS)).filter(f => f.endsWith('.json'))) {
  const pedido = JSON.parse(await fs.readFile(path.join(DEMOS, f), 'utf8'));
  const { url } = await generarRegalo(pedido, { baseDir: DEMOS, codigo: 'demo-' + pedido.plantilla, forzar: true, conQR: false });
  console.log('✔', url);
}
