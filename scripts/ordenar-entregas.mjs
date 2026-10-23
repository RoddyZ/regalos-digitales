// Ordena entregas/ en carpetas por plan y plantilla, con número de pedido:
//   entregas/03-vip/carta-amor/0001-lorena-pvnda5gr/
// Se puede correr las veces que quieras: lo que ya está en su lugar no se mueve.
// No cambia códigos ni URLs: los QR ya impresos siguen funcionando.
import fs from 'node:fs/promises';
import path from 'node:path';
import { listarEntregas, carpetaEntrega, leerConfig, ENTREGAS } from './lib.mjs';

const config = await leerConfig();

// Orden cronológico según la primera aparición de cada código en registro.csv
const registro = await fs.readFile(path.join(ENTREGAS, 'registro.csv'), 'utf8').catch(() => '');
const orden = [...new Set(registro.split('\n').slice(1).map(l => (l.split(',')[1] || '').replace(/"/g, '')).filter(Boolean))];
const posicion = codigo => (orden.includes(codigo) ? orden.indexOf(codigo) : Infinity);

const pendientes = (await listarEntregas()).filter(e => !e.numero);
pendientes.sort((a, b) => posicion(a.pedido.codigo || path.basename(a.dir)) - posicion(b.pedido.codigo || path.basename(b.dir)));

if (!pendientes.length) console.log('✔ Todo está ordenado. No hay nada que mover.');
for (const e of pendientes) {
  const codigo = e.pedido.codigo || path.basename(e.dir);
  const destino = await carpetaEntrega(codigo, { ...e.pedido, codigo }, config);
  console.log(`✔ ${path.relative(ENTREGAS, e.dir)}  →  ${path.relative(ENTREGAS, destino)}`);
}
