/* ==========================================================================
   Detalle QR · Motor Estético de Regalos Digitales (Lógica de Cliente)
   ========================================================================== */
(function () {
  const R = window.REGALO || {};
  const $ = (s, el = document) => el.querySelector(s);

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

  const musica = { reproducir() {} };

  function incrustado(url) {
    const sp = String(url).match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
    if (sp) return { tipo: 'spotify', src: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}?theme=0` };
    const yt = String(url).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return { tipo: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?playsinline=1&rel=0` };
    return null;
  }

  function prepararMusica() {
    if (!R.musica) return;
    const emb = incrustado(R.musica);
    if (emb) {
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
      return;
    }
    const audio = new Audio(R.musica);
    audio.loop = true;
    audio.volume = 0.75;
    const boton = document.createElement('button');
    boton.className = 'rg-musica rg-off';
    boton.setAttribute('aria-label', 'Pausar o reanudar música');
    boton.innerHTML = `
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 3"/>
      </svg>`;
    boton.onclick = () => audio.paused ? audio.play() : audio.pause();
    audio.onplay = () => boton.classList.remove('rg-off');
    audio.onpause = () => boton.classList.add('rg-off');
    document.body.appendChild(boton);
    musica.reproducir = () => audio.play().catch(() => {});
  }

  function pantallaExpirado() {
    document.body.innerHTML = `
      <div class="rg-intro rg-expirado">
        <div class="rg-intro-caja">
          <div class="rg-intro-emblema"><span class="rg-intro-icono">⏳</span></div>
          <p class="rg-intro-texto">Este detalle ha cumplido su tiempo de vigencia.</p>
        </div>
      </div>`;
  }

  /* Pantalla de unboxing/apertura */
  function intro(alAbrir) {
    const icono = R.iconoIntro || document.body.dataset.icono || '✨';
    const paraHtml = R.para ? `<p class="rg-intro-para">Para ${esc(R.para)}</p>` : '';
    const capa = document.createElement('div');
    capa.className = 'rg-intro';
    capa.innerHTML = `
      <div class="rg-intro-caja">
        <div class="rg-intro-emblema"><span class="rg-intro-icono">${icono}</span></div>
        ${paraHtml}
        <h2 class="rg-intro-texto">Hay un detalle preparado para ti</h2>
        <button class="rg-intro-boton" type="button">
          Abrir detalle
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>`;
    document.body.appendChild(capa);
    const abrir = () => {
      musica.reproducir();
      capa.classList.add('rg-saliendo');
      setTimeout(() => capa.remove(), 800);
      alAbrir && alAbrir();
    };
    capa.addEventListener('click', abrir, { once: true });
  }

  function crearCapa(html) {
    const c = document.createElement('div');
    c.className = 'rg-intro';
    c.innerHTML = `<div class="rg-intro-caja">${html}</div>`;
    document.body.appendChild(c);
    return c;
  }
  function quitar(c) {
    c.classList.add('rg-saliendo');
    setTimeout(() => c.remove(), 800);
  }

  /* VIP: Apertura programada */
  function cuentaRegresiva() {
    const meta = R.abreEl ? new Date(R.abreEl.length <= 10 ? R.abreEl + 'T00:00:00' : R.abreEl) : null;
    if (!meta || new Date() >= meta) return Promise.resolve();
    const paraHtml = R.para ? `<p class="rg-intro-para">${esc(R.para)}</p>` : '';
    const c = crearCapa(`
      <div class="rg-intro-emblema"><span class="rg-intro-icono">⏳</span></div>
      ${paraHtml}
      <h2 class="rg-intro-texto">Este regalo se abrirá en</h2>
      <div class="rg-reloj">
        <div class="rg-reloj-bloque"><b>0</b><small>días</small></div>
        <div class="rg-reloj-bloque"><b>0</b><small>horas</small></div>
        <div class="rg-reloj-bloque"><b>0</b><small>min</small></div>
        <div class="rg-reloj-bloque"><b>0</b><small>seg</small></div>
      </div>`);
    c.classList.add('rg-espera');
    const n = c.querySelectorAll('.rg-reloj-bloque b');
    return new Promise(listo => {
      (function tic() {
        const s = Math.max(0, Math.floor((meta - new Date()) / 1000));
        [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].forEach((v, i) => n[i].textContent = v);
        if (s > 0) return setTimeout(tic, 1000);
        quitar(c); listo();
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

  /* VIP: Pregunta Secreta */
  function preguntaSecreta(alAbrir) {
    const icono = R.iconoIntro || document.body.dataset.icono || '🔒';
    const paraHtml = R.para ? `<p class="rg-intro-para">${esc(R.para)}</p>` : '';
    const c = crearCapa(`
      <div class="rg-intro-emblema"><span class="rg-intro-icono">${icono}</span></div>
      ${paraHtml}
      <h2 class="rg-intro-texto">Antes de abrirlo…</h2>
      <form class="rg-pregunta">
        <label for="rg-resp">${esc(R.pregunta)}</label>
        <input id="rg-resp" autocomplete="off" autocapitalize="off" placeholder="Escribe tu respuesta">
        <button class="rg-intro-boton" type="submit">
          Desbloquear
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <p class="rg-pista" aria-live="polite"></p>
      </form>`);
    c.classList.add('rg-espera');
    let intentos = 0;
    c.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const campo = c.querySelector('input');
      const ok = (R.respuestas || []).includes(await sha256(normalizar(campo.value)));
      if (ok) {
        musica.reproducir();
        quitar(c);
        alAbrir && alAbrir();
        return;
      }
      intentos++;
      campo.classList.remove('rg-mal');
      void campo.offsetWidth;
      campo.classList.add('rg-mal');
      c.querySelector('.rg-pista').textContent = R.pista && intentos >= 2 ? `Pista: ${R.pista}` : 'Respuesta incorrecta. Intenta otra vez 💭';
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

  function galeria(contenedor, clase = '') {
    const fotos = R.fotos || [];
    if (!fotos.length) { contenedor && contenedor.remove(); return; }
    contenedor.classList.add('rg-galeria');
    if (clase) contenedor.classList.add(clase);
    contenedor.innerHTML = fotos.map((f, i) =>
      `<figure style="--i:${i}">
        <img src="${esc(f.src || f)}" alt="Fotografía especial" loading="lazy">` +
        (f.texto ? `<figcaption>${esc(f.texto)}</figcaption>` : '') +
      `</figure>`).join('');
  }

  /* Confeti armonioso con paleta elegante */
  function confeti({ duracion = 3800, colores = ['#f6d89b', '#e5b869', '#ffffff', '#e898ac', '#b8a6d9'], cantidad = 140 } = {}) {
    const c = document.createElement('canvas');
    c.className = 'rg-canvas';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const ajustar = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; };
    ajustar();
    const P = Array.from({ length: cantidad }, () => ({
      x: Math.random() * c.width,
      y: -Math.random() * c.height * 0.4,
      w: (5 + Math.random() * 6) * dpr,
      h: (8 + Math.random() * 8) * dpr,
      vy: (2.2 + Math.random() * 2.8) * dpr,
      vx: (Math.random() - 0.5) * 1.8 * dpr,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.16,
      col: colores[(Math.random() * colores.length) | 0]
    }));
    const fin = performance.now() + duracion;
    (function paso(t) {
      ctx.clearRect(0, 0, c.width, c.height);
      P.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (p.y > c.height && t < fin) { p.y = -20; p.x = Math.random() * c.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.col;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.cos(p.r * 2));
        ctx.restore();
      });
      if (P.some(p => p.y < c.height + 20)) requestAnimationFrame(paso);
      else c.remove();
    })(performance.now());
  }

  function flotar(simbolos = ['✧'], { cada = 500, duracion = 0 } = {}) {
    const capa = document.createElement('div');
    capa.className = 'rg-flotantes';
    document.body.appendChild(capa);
    const id = setInterval(() => {
      const s = document.createElement('span');
      s.textContent = simbolos[(Math.random() * simbolos.length) | 0];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.fontSize = 14 + Math.random() * 20 + 'px';
      s.style.animationDuration = 6 + Math.random() * 5 + 's';
      capa.appendChild(s);
      setTimeout(() => s.remove(), 11000);
    }, cada);
    if (duracion) setTimeout(() => clearInterval(id), duracion);
    return () => clearInterval(id);
  }

  function diasDesde(fechaISO) {
    if (!fechaISO) return null;
    return Math.floor((Date.now() - new Date(fechaISO + 'T00:00:00')) / 86400000);
  }

  window.Regalo = {
    datos: R, $, esc, espera, escribir, galeria, confeti, flotar, diasDesde,
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
