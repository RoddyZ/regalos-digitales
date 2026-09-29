// Uso: npm run nuevo -- pedidos/maria.json [--forzar]
import fs from 'node:fs/promises';
import path from 'node:path';
import { generarRegalo, ENTREGAS } from './lib.mjs';

const args = process.argv.slice(2);
const archivo = args.find(a => !a.startsWith('--'));
if (!archivo) {
  console.error('Uso: npm run nuevo -- pedidos/<pedido>.json [--forzar]\nMira pedidos/ejemplo.json como modelo.');
  process.exit(1);
}

try {
  const pedido = JSON.parse(await fs.readFile(archivo, 'utf8'));
  const { codigo, url } = await generarRegalo(pedido, {
    baseDir: path.dirname(path.resolve(archivo)),
    forzar: args.includes('--forzar')
  });
  // Guarda el código en el pedido para que un --forzar posterior actualice el mismo enlace.
  if (!pedido.codigo) await fs.writeFile(archivo, JSON.stringify({ codigo, ...pedido }, null, 2));
  console.log(`
  ✔ Regalo creado
    Código: ${codigo}
    URL:    ${url}
    QR:     ${path.join(ENTREGAS, codigo, 'qr.png')}

  Siguiente paso: git add docs && git commit -m "Regalo ${codigo}" && git push
  (GitHub Pages lo publica en ~1 minuto)
`);
} catch (e) {
  console.error('✘', e.message);
  process.exit(1);
}
