// Uso:
//   npm run nuevo                        → asistente con preguntas (lo más rápido)
//   npm run nuevo -- pedidos/maria.json  → desde un archivo (para cambios: añade --forzar)
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { generarRegalo, leerConfig, ENTREGAS, PLANTILLAS, RAIZ } from './lib.mjs';

const args = process.argv.slice(2);
const archivoArg = args.find(a => !a.startsWith('--'));

// Al arrastrar un archivo a la terminal, Windows lo pega como "D:\x.jpg" o & 'D:\x.jpg'
const limpiarRuta = t => t.trim().replace(/^&\s*/, '').replace(/^["']|["']$/g, '');

async function asistente() {
  // Cola de líneas: funciona igual escribiendo a mano o con respuestas pegadas de golpe.
  const rl = createInterface({ input: process.stdin, terminal: process.stdin.isTTY });
  const cola = [], esperando = [];
  rl.on('line', l => esperando.length ? esperando.shift()(l) : cola.push(l));
  rl.on('close', () => { while (esperando.length) esperando.shift()(''); });
  rl.question = texto => { process.stdout.write(texto); return cola.length ? Promise.resolve(cola.shift()) : new Promise(r => esperando.push(r)); };
  const preguntar = async (texto, defecto = '') => (await rl.question(`${texto}${defecto ? ` [${defecto}]` : ''}: `)).trim() || defecto;
  const elegir = async (texto, opciones) => {
    opciones.forEach((o, i) => console.log(`   ${i + 1}) ${o.etiqueta}`));
    for (;;) {
      const r = await preguntar(texto, '1');
      const o = opciones[parseInt(r, 10) - 1];
      if (o) return o.valor;
    }
  };

  const config = await leerConfig();
  const plantillas = (await fs.readdir(PLANTILLAS)).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''));
  console.log('\n🎁 Nuevo regalo\n');

  const p = {};
  console.log(' Diseño:');
  p.plantilla = await elegir(' Número', plantillas.map(n => ({ etiqueta: n, valor: n })));
  console.log(' Plan:');
  p.plan = await elegir(' Número', Object.entries(config.planes).map(([k, v]) => ({ etiqueta: `${v.nombre} $${v.precio}`, valor: k })));
  const plan = config.planes[p.plan];

  p.para = await preguntar(' Para (quién recibe)');
  p.de = await preguntar(' De (firma)');
  p.titulo = await preguntar(' Título grande (Enter = el del diseño)');
  console.log(' Mensaje (varias líneas; Enter en una línea vacía para terminar):');
  const lineas = [];
  for (;;) { const l = await rl.question('   > '); if (!l.trim()) break; lineas.push(l); }
  p.mensaje = lineas.join('\n');

  if (plan.maxFotos) {
    console.log(` Fotos (hasta ${plan.maxFotos}). Arrastra cada archivo aquí y pulsa Enter; Enter vacío para terminar:`);
    p.fotos = [];
    while (p.fotos.length < plan.maxFotos) {
      const f = limpiarRuta(await rl.question(`   foto ${p.fotos.length + 1}: `));
      if (!f) break;
      try { await fs.access(f); } catch { console.log('   ✘ No encuentro ese archivo'); continue; }
      const texto = await preguntar('   pie de foto (opcional)');
      p.fotos.push(texto ? { ruta: path.resolve(f), texto } : path.resolve(f));
    }
  }
  if (plan.musica) {
    const m = limpiarRuta(await preguntar(' Canción: enlace de Spotify o YouTube, o archivo mp3 (Enter = sin música)'));
    if (m) p.musica = m;
  }
  if (plan.extras) {
    const preg = await preguntar(' Pregunta secreta (Enter = sin pregunta)');
    if (preg) {
      p.pregunta = preg;
      p.respuesta = await preguntar('   Respuesta(s) aceptadas, separadas con |');
      p.pista = await preguntar('   Pista tras 2 errores (opcional)');
    }
    const abre = await preguntar(' Se abre el (AAAA-MM-DD HH:MM, Enter = de inmediato)');
    if (abre) p.abreEl = abre.replace(' ', 'T');
  }
  if (p.plantilla === 'carta-amor') {
    const desde = await preguntar(' ¿Desde cuándo están juntos? (AAAA-MM-DD, Enter = sin contador)');
    if (desde) p.desde = desde;
  }
  if (p.plantilla === 'cumpleanos') p.edad = await preguntar(' Edad que cumple (Enter = sin edad)');

  p.cliente = await preguntar(' Cliente que compra (privado)');
  p.telefono = await preguntar(' Teléfono del cliente (privado)');
  const publicar = (await preguntar(' ¿Publicar ya en internet? (s/n)', 's')).toLowerCase().startsWith('s');
  rl.close();

  for (const k of Object.keys(p)) if (p[k] === '' || (Array.isArray(p[k]) && !p[k].length)) delete p[k];
  const nombre = `${(p.para || 'regalo').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}`;
  const archivo = path.join(RAIZ, 'pedidos', `${nombre}.json`);
  await fs.writeFile(archivo, JSON.stringify(p, null, 2));
  return { archivo, publicar };
}

function publicarEnGit(codigo) {
  const git = (...a) => execFileSync('git', a, { cwd: RAIZ, stdio: 'inherit' });
  git('add', path.join('docs', codigo));
  git('commit', '-m', `Regalo ${codigo}`);
  git('push');
}

try {
  let archivo = archivoArg, publicar = args.includes('--publicar');
  if (!archivo) ({ archivo, publicar } = await asistente());

  const pedido = JSON.parse(await fs.readFile(archivo, 'utf8'));
  const { codigo, url } = await generarRegalo(pedido, {
    baseDir: path.dirname(path.resolve(archivo)),
    forzar: args.includes('--forzar')
  });
  // Guarda el código en el pedido para que un --forzar posterior actualice el mismo enlace.
  if (!pedido.codigo) await fs.writeFile(archivo, JSON.stringify({ codigo, ...pedido }, null, 2));
  if (publicar) publicarEnGit(codigo);

  console.log(`
  ✔ Regalo creado
    Código: ${codigo}
    URL:    ${url}
    QR:     ${path.join(ENTREGAS, codigo, 'qr.png')}
    Pedido: ${path.relative(RAIZ, archivo)}
  ${publicar ? '\n  🌐 Publicado: estará en línea en ~1 minuto.' : `\n  Para publicar: git add docs && git commit -m "Regalo ${codigo}" && git push`}
`);
} catch (e) {
  console.error('✘', e.message);
  process.exit(1);
}
