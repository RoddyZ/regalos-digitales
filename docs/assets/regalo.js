/* Motor común de todas las plantillas.
 * Cada regalo trae sus datos en window.REGALO (inyectado por scripts/nuevo-regalo.mjs).
 * La plantilla llama a Regalo.iniciar({ alAbrir }) y usa las utilidades de abajo. */
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

  let audio = null;
  function prepararMusica() {
    if (!R.musica) return;
    audio = new Audio(R.musica);
    audio.loop = true;
    audio.volume = 0.7;
    const btn = document.createElement('button');
    btn.className = 'rg-musica';
    btn.setAttribute('aria-label', 'Pausar o reanudar la música');
    btn.textContent = '♪';
    btn.onclick = () => {
      if (audio.paused) { audio.play(); btn.classList.remove('rg-off'); }
      else { audio.pause(); btn.classList.add('rg-off'); }
    };
    document.body.appendChild(btn);
  }

  function pantallaExpirado() {
    document.body.innerHTML = `
      <div class="rg-intro rg-expirado">
        <div class="rg-intro-caja">
          <div class="rg-intro-icono">⌛</div>
          <p class="rg-intro-texto">Este regalo ya no está disponible.</p>
        </div>
      </div>`;
  }

  /* Pantalla "toca para abrir": además de crear expectativa,
     el toque del usuario es lo que permite reproducir música en el celular. */
  function intro(alAbrir) {
    const icono = R.iconoIntro || document.body.dataset.icono || '🎁';
    const texto = R.para ? `${esc(R.para)}, tienes un regalo` : 'Tienes un regalo';
    const capa = document.createElement('div');
    capa.className = 'rg-intro';
    capa.innerHTML = `
      <div class="rg-intro-caja">
        <div class="rg-intro-icono">${icono}</div>
        <p class="rg-intro-texto">${texto}</p>
        <button class="rg-intro-boton" type="button">Toca para abrir</button>
      </div>`;
    document.body.appendChild(capa);
    const abrir = () => {
      if (audio) audio.play().catch(() => {});
      capa.classList.add('rg-saliendo');
      setTimeout(() => capa.remove(), 700);
      alAbrir && alAbrir();
    };
    capa.addEventListener('click', abrir, { once: true });
  }

  /* ---------- Utilidades para las plantillas ---------- */

  const espera = ms => new Promise(r => setTimeout(r, ms));

  // Efecto máquina de escribir. Respeta saltos de línea del mensaje.
  async function escribir(el, texto, ms = 38) {
    el.textContent = '';
    el.classList.add('rg-cursor');
    for (const ch of String(texto || '')) {
      el.textContent += ch;
      await espera(ch === '\n' ? ms * 6 : /[.,!?¡¿]/.test(ch) ? ms * 5 : ms);
    }
    el.classList.remove('rg-cursor');
  }

  // Galería deslizable (scroll-snap) con fotos del regalo.
  function galeria(contenedor, clase = '') {
    const fotos = R.fotos || [];
    if (!fotos.length) { contenedor.remove(); return; }
    contenedor.classList.add('rg-galeria');
    if (clase) contenedor.classList.add(clase);
    contenedor.innerHTML = fotos.map((f, i) =>
      `<figure style="--i:${i}"><img src="${esc(f.src || f)}" alt="" loading="lazy">` +
      (f.texto ? `<figcaption>${esc(f.texto)}</figcaption>` : '') + `</figure>`).join('');
  }

  // Confeti ligero con canvas, sin librerías.
  function confeti({ duracion = 3500, colores = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#ffffff'], cantidad = 160 } = {}) {
    const c = document.createElement('canvas');
    c.className = 'rg-canvas';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const ajustar = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; };
    ajustar();
    const P = Array.from({ length: cantidad }, () => ({
      x: Math.random() * c.width, y: -Math.random() * c.height * 0.5,
      w: (6 + Math.random() * 6) * dpr, h: (8 + Math.random() * 8) * dpr,
      vy: (2 + Math.random() * 3) * dpr, vx: (Math.random() - 0.5) * 2 * dpr,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.2,
      col: colores[(Math.random() * colores.length) | 0]
    }));
    const fin = performance.now() + duracion;
    (function paso(t) {
      ctx.clearRect(0, 0, c.width, c.height);
      P.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (p.y > c.height && t < fin) { p.y = -20; p.x = Math.random() * c.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.cos(p.r * 2));
        ctx.restore();
      });
      if (P.some(p => p.y < c.height + 20)) requestAnimationFrame(paso);
      else c.remove();
    })(performance.now());
  }

  // Emojis/símbolos flotando hacia arriba (corazones, estrellas…).
  function flotar(simbolos = ['❤'], { cada = 450, duracion = 0 } = {}) {
    const capa = document.createElement('div');
    capa.className = 'rg-flotantes';
    document.body.appendChild(capa);
    const id = setInterval(() => {
      const s = document.createElement('span');
      s.textContent = simbolos[(Math.random() * simbolos.length) | 0];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.fontSize = 14 + Math.random() * 22 + 'px';
      s.style.animationDuration = 5 + Math.random() * 5 + 's';
      capa.appendChild(s);
      setTimeout(() => s.remove(), 10000);
    }, cada);
    if (duracion) setTimeout(() => clearInterval(id), duracion);
    return () => clearInterval(id);
  }

  // Días transcurridos desde una fecha ISO (para contadores "llevamos X días").
  function diasDesde(fechaISO) {
    if (!fechaISO) return null;
    return Math.floor((Date.now() - new Date(fechaISO + 'T00:00:00')) / 86400000);
  }

  window.Regalo = {
    datos: R, $, esc, espera, escribir, galeria, confeti, flotar, diasDesde,
    iniciar({ alAbrir } = {}) {
      if (expirado()) return pantallaExpirado();
      rellenarCampos();
      prepararMusica();
      intro(alAbrir);
    }
  };
})();
