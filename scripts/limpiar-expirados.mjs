// Borra de docs/ los regalos cuya fecha "expira" ya pasó. Uso: npm run limpiar [-- --dias-gracia 7]
import fs from 'node:fs/promises';
import path from 'node:path';
import { SITIO } from './lib.mjs';

const i = process.argv.indexOf('--dias-gracia');
const gracia = i > -1 ? Number(process.argv[i + 1]) : 7;
const limite = Date.now() - gracia * 86400000;
let borrados = 0;

for (const d of await fs.readdir(SITIO, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name === 'assets' || d.name.startsWith('demo-')) continue;
  const html = await fs.readFile(path.join(SITIO, d.name, 'index.html'), 'utf8').catch(() => '');
  const m = html.match(/"expira":"(\d{4}-\d{2}-\d{2})"/);
  if (m && new Date(m[1] + 'T23:59:59') < limite) {
    await fs.rm(path.join(SITIO, d.name), { recursive: true });
    console.log('🗑', d.name, '(expiró', m[1] + ')');
    borrados++;
  }
}
console.log(borrados ? `${borrados} regalo(s) borrados. Haz commit y push.` : 'Nada que limpiar.');
