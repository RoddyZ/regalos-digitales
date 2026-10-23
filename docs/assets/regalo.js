/* ==========================================================================
   Detallazo · Motor compartido de los regalos (lógica de cliente)
   ========================================================================== */
(function () {
  const R = window.REGALO || {};
  const $ = (s, el = document) => el.querySelector(s);

  // Dentro del celular de la portada: sin barra de desplazamiento visible.
  if (window.self !== window.top) document.documentElement.classList.add('rg-embebido');

  function esc(t) {
    return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function expirado() {
    if (!R.expira) return false;
    return new Date() > new Date(R.expira + 'T23:59:59');
  }

  function rellenarCampos() {
    document.querySelectorAll('[data-campo]').forEach(el => {
      const v = R[el.dataset.campo];
      if (v) el.textContent = v;
      else if (el.hasAttribute('data-opcional')) el.remove();
    });
    if (R.titulo) document.title = R.titulo;
  }

  /* Figuras dibujadas con contorno de tinta, para lo que flota y los adornos */
  const TINTA = 'var(--rg-tinta)';
  const FIGURAS = {
    corazon: c => `<svg viewBox="0 0 40 38"><path d="M20 34C9 27 3 20 3 13a8.5 8.5 0 0 1 17-3 8.5 8.5 0 0 1 17 3c0 7-6 14-17 21z" fill="${c}" stroke="${TINTA}" stroke-width="2.6" stroke-linejoin="round"/><path d="M9 12.5a4 4 0 0 1 4-4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/></svg>`,
    estrella: c => `<svg viewBox="0 0 40 40"><path d="M20 3l5.2 10.6 11.6 1.7-8.4 8.2 2 11.6L20 29.6 9.6 35.1l2-11.6-8.4-8.2 11.6-1.7z" fill="${c}" stroke="${TINTA}" stroke-width="2.6" stroke-linejoin="round"/></svg>`,
    flor: c => `<svg viewBox="0 0 40 40"><g fill="${c}" stroke="${TINTA}" stroke-width="2.4"><circle cx="20" cy="9.5" r="7"/><circle cx="30.5" cy="17" r="7"/><circle cx="26.5" cy="29.5" r="7"/><circle cx="13.5" cy="29.5" r="7"/><circle cx="9.5" cy="17" r="7"/></g><circle cx="20" cy="20" r="6" fill="#7a4a1f" stroke="${TINTA}" stroke-width="2.4"/></svg>`,
    copo: c => `<svg viewBox="0 0 40 40"><g stroke="${c}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M20 4v32M6 12l28 16M6 28l28-16"/><path d="M15 6l5 4 5-4M15 34l5-4 5 4"/></g></svg>`,
    circulo: c => `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="${c}" stroke="${TINTA}" stroke-width="2.6"/></svg>`
  };
  function figura(nombre, color) {
    return (FIGURAS[nombre] || FIGURAS.circulo)(color || 'var(--rg-acento)');
  }

  /* La caja de regalo de la pantalla de apertura */
  function cajaSVG({ candado = false } = {}) {
    const borde = `stroke="${TINTA}" stroke-width="3" stroke-linejoin="round"`;
    return `<svg class="rg-regalo" viewBox="0 0 160 150" aria-hidden="true">
      <ellipse cx="80" cy="142" rx="56" ry="6" fill="${TINTA}" opacity=".14"/>
      <rect x="24" y="66" width="112" height="72" rx="8" style="fill:var(--rg-caja)" ${borde}/>
      <rect x="70" y="66" width="20" height="72" style="fill:var(--rg-cinta)" ${borde}/>
      <rect x="33" y="76" width="9" height="20" rx="4.5" fill="#fff" opacity=".45"/>
      ${candado ? `<path d="M72 98v-7a8 8 0 0 1 16 0v7" fill="none" ${borde}/>
      <rect x="64" y="97" width="32" height="25" rx="6" style="fill:var(--rg-papel)" ${borde}/>
      <circle cx="80" cy="107" r="3" fill="${TINTA}"/><path d="M80 109v6" stroke="${TINTA}" stroke-width="3" stroke-linecap="round"/>` : ''}
      <g class="rg-tapa">
        <path d="M80 47C70 26 47 25 52 40c3 8 18 8 28 7zM80 47c10-21 33-22 28-7-3 8-18 8-28 7z" style="fill:var(--rg-cinta)" ${borde}/>
        <rect x="14" y="46" width="132" height="24" rx="6" style="fill:var(--rg-caja)" ${borde}/>
        <rect x="68" y="46" width="24" height="24" style="fill:var(--rg-cinta)" ${borde}/>
        <circle cx="80" cy="46" r="6.5" style="fill:var(--rg-cinta)" ${borde}/>
      </g>
    </svg>`;
  }

  const musica = { reproducir() {} };

  function incrustado(url) {
    const sp = String(url).match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
    if (sp) return { tipo: 'spotify', src: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}?theme=0` };
    const yt = String(url).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return { tipo: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?playsinline=1&rel=0` };
    return null;
  }

  /* La canción siempre es un enlace (Spotify o YouTube): no pesa nada en la página. */
  function prepararMusica() {
    const emb = R.musica && incrustado(R.musica);
    if (!emb) return;
    const caja = document.createElement('div');
    caja.className = emb.tipo === 'spotify' ? 'rg-cancion' : 'rg-yt';
    caja.innerHTML = `<iframe src="${emb.src}" title="Nuestra canción" loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      <button type="button" class="rg-cerrar" aria-label="Ocultar canción">
        <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
      </button>`;
    caja.querySelector('.rg-cerrar').onclick = () => caja.remove();
    document.body.appendChild(caja);
    musica.reproducir = () => setTimeout(() => caja.classList.add('rg-visible'), 1200);
  }

  function crearCapa(html, clase = '') {
    const c = document.createElement('div');
    c.className = 'rg-intro ' + clase;
    c.innerHTML = `<div class="rg-intro-caja">${html}</div>`;
    document.body.appendChild(c);
    return c;
  }
  function quitar(c) {
    c.classList.add('rg-saliendo');
    setTimeout(() => c.remove(), 1000);
  }

  function pantallaExpirado() {
    document.body.innerHTML = '';
    crearCapa(`${cajaSVG()}<p class="rg-intro-texto">Este detalle ya cumplió su tiempo.</p>`, 'rg-expirado');
  }

  const paraHtml = () => R.para ? `<p class="rg-intro-para">Para ${esc(R.para)}</p>` : '';

  /* Pantalla de apertura */
  function intro(alAbrir) {
    const capa = crearCapa(`
      ${cajaSVG()}
      ${paraHtml()}
      <h2 class="rg-intro-texto">Te llegó un detallazo</h2>
      <button class="rg-boton" type="button">Ábrelo</button>`);
    capa.addEventListener('click', () => {
      musica.reproducir();
      if (navigator.vibrate) navigator.vibrate(20);
      quitar(capa);
      alAbrir && setTimeout(alAbrir, 700);
    }, { once: true });
  }

  /* Apertura programada */
  function cuentaRegresiva() {
    const meta = R.abreEl ? new Date(R.abreEl.length <= 10 ? R.abreEl + 'T00:00:00' : R.abreEl) : null;
    if (!meta || new Date() >= meta) return Promise.resolve();
    const c = crearCapa(`
      ${cajaSVG({ candado: true })}
      ${paraHtml()}
      <h2 class="rg-intro-texto">Tu regalo se abre en</h2>
      <div class="rg-reloj">
        <div class="rg-reloj-bloque"><b>0</b><small>días</small></div>
        <div class="rg-reloj-bloque"><b>0</b><small>horas</small></div>
        <div class="rg-reloj-bloque"><b>0</b><small>min</small></div>
        <div class="rg-reloj-bloque"><b>0</b><small>seg</small></div>
      </div>`, 'rg-espera');
    const n = c.querySelectorAll('.rg-reloj-bloque b');
    return new Promise(listo => {
      (function tic() {
        const s = Math.max(0, Math.floor((meta - new Date()) / 1000));
        [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].forEach((v, i) => n[i].textContent = v);
        if (s > 0) return setTimeout(tic, 1000);
        c.remove(); listo();
      })();
    });
  }

  function normalizar(t) {
    return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }
  async function sha256(t) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
  }

  /* Pregunta secreta */
  function preguntaSecreta(alAbrir) {
    const c = crearCapa(`
      ${cajaSVG({ candado: true })}
      ${paraHtml()}
      <h2 class="rg-intro-texto">Antes de abrirlo…</h2>
      <form class="rg-pregunta">
        <label for="rg-resp">${esc(R.pregunta)}</label>
        <input id="rg-resp" autocomplete="off" autocapitalize="off" placeholder="Escribe tu respuesta">
        <button class="rg-boton" type="submit">Desbloquear</button>
        <p class="rg-pista" aria-live="polite"></p>
      </form>`, 'rg-espera');
    let intentos = 0;
    c.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const campo = c.querySelector('input');
      const ok = (R.respuestas || []).includes(await sha256(normalizar(campo.value)));
      if (ok) {
        musica.reproducir();
        campo.blur();
        quitar(c);
        alAbrir && setTimeout(alAbrir, 700);
        return;
      }
      intentos++;
      campo.classList.remove('rg-mal');
      void campo.offsetWidth;
      campo.classList.add('rg-mal');
      c.querySelector('.rg-pista').textContent = R.pista && intentos >= 2 ? `Pista: ${R.pista}` : 'Mmm, no es esa. Intenta otra vez.';
    });
  }

  const espera = ms => new Promise(r => setTimeout(r, ms));

  async function escribir(el, texto, ms = 32) {
    el.textContent = '';
    el.classList.add('rg-cursor');
    for (const ch of String(texto || '')) {
      el.textContent += ch;
      await espera(ch === '\n' ? ms * 6 : /[.,!?¡¿]/.test(ch) ? ms * 4 : ms);
    }
    el.classList.remove('rg-cursor');
  }

  function galeria(contenedor) {
    const fotos = R.fotos || [];
    if (!fotos.length) {
      contenedor && contenedor.remove();
      const t = $('#tituloFotos');
      t && t.remove();
      return;
    }
    contenedor.classList.add('rg-galeria');
    contenedor.innerHTML = fotos.map((f, i) =>
      `<figure style="--i:${i}">
        <img src="${esc(f.src || f)}" alt="Foto del regalo" loading="lazy">` +
        (f.texto ? `<figcaption>${esc(f.texto)}</figcaption>` : '') +
      `</figure>`).join('');
  }

  /* Pie con la marca, al final de todo */
  function pie() {
    if ($('.rg-pie')) return;
    const p = document.createElement('footer');
    p.className = 'rg-pie rg-oculto';
    p.innerHTML = '<a href="../" target="_top">Hecho con mucho amor en <b>Detallazo</b></a>';
    document.body.appendChild(p);
    requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('rg-visible')));
  }

  /* Cierre común: muestra las fotos (si hay) y el pie */
  function final() {
    if (R.fotos && R.fotos.length) ['#tituloFotos', '#galeria'].forEach(s => { const e = $(s); e && e.classList.add('rg-visible'); });
    pie();
  }

  /* Confeti plano con contorno: papelitos y bolitas */
  function confeti({ duracion = 3800, colores = ['#ff8a5b', '#ffd166', '#7ec4cf', '#f4a7b9', '#fffdf8'], cantidad = 120 } = {}) {
    const c = document.createElement('canvas');
    c.className = 'rg-canvas';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    const tinta = getComputedStyle(document.documentElement).getPropertyValue('--rg-tinta').trim() || '#2a211c';
    const P = Array.from({ length: cantidad }, () => ({
      x: Math.random() * c.width,
      y: -Math.random() * c.height * 0.5,
      t: (6 + Math.random() * 6) * dpr,
      redondo: Math.random() < 0.3,
      vy: (2 + Math.random() * 2.6) * dpr,
      vx: (Math.random() - 0.5) * 1.6 * dpr,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.14,
      col: colores[(Math.random() * colores.length) | 0]
    }));
    const fin = performance.now() + duracion;
    ctx.lineWidth = 1.4 * dpr;
    ctx.strokeStyle = tinta;
    (function paso(t) {
      ctx.clearRect(0, 0, c.width, c.height);
      P.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (p.y > c.height && t < fin) { p.y = -20; p.x = Math.random() * c.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.col;
        ctx.beginPath();
        if (p.redondo) ctx.arc(0, 0, p.t * 0.45, 0, Math.PI * 2);
        else ctx.rect(-p.t / 2, -p.t * 0.3, p.t, p.t * 0.6 * Math.cos(p.r * 2));
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
      if (P.some(p => p.y < c.height + 20)) requestAnimationFrame(paso);
      else c.remove();
    })(performance.now());
  }

  /* Figuras que suben flotando. Cada elemento: nombre de figura o [nombre, color]. */
  function flotar(figuras = ['corazon'], { cada = 600, duracion = 0, tamano = [18, 34] } = {}) {
    const capa = document.createElement('div');
    capa.className = 'rg-flotantes';
    document.body.appendChild(capa);
    const id = setInterval(() => {
      const f = figuras[(Math.random() * figuras.length) | 0];
      const [nombre, color] = Array.isArray(f) ? f : [f];
      const s = document.createElement('span');
      s.innerHTML = figura(nombre, color);
      s.style.left = Math.random() * 94 + 'vw';
      s.style.width = tamano[0] + Math.random() * (tamano[1] - tamano[0]) + 'px';
      s.style.animationDuration = 7 + Math.random() * 5 + 's';
      capa.appendChild(s);
      setTimeout(() => s.remove(), 12500);
    }, cada);
    if (duracion) setTimeout(() => clearInterval(id), duracion);
    return () => clearInterval(id);
  }

  function diasDesde(fechaISO) {
    if (!fechaISO) return null;
    return Math.floor((Date.now() - new Date(fechaISO + 'T00:00:00')) / 86400000);
  }

  window.Regalo = {
    datos: R, $, esc, espera, escribir, galeria, confeti, flotar, figura, diasDesde, final,
    async iniciar({ alAbrir } = {}) {
      if (expirado()) return pantallaExpirado();
      rellenarCampos();
      prepararMusica();
      await cuentaRegresiva();
      if (R.pregunta && R.respuestas) preguntaSecreta(alAbrir);
      else intro(alAbrir);
    }
  };
})();
