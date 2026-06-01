/* ════════════════════════════════════════════════════
   LULU — JavaScript principal
   ════════════════════════════════════════════════════ */

/* ── AUDIO ───────────────────────────────────────────────── */
const audio = document.getElementById('bgAudio');
let audioOk = false;
function tryAudio() {
  if (!audioOk) { audio.play().catch(() => {}); audioOk = true; }
}
document.addEventListener('click',      tryAudio, { once: true });
document.addEventListener('touchstart', tryAudio, { once: true });
audio.play().catch(() => {});

/* ── NAVEGACIÓN — solo avanza, nunca retrocede ───────────── */
let currentSlide = 0;
const slidesEl   = document.getElementById('slides');

function goToSlide(n) {
  if (n <= currentSlide) return;
  currentSlide = n;
  slidesEl.style.transform = `translateY(-${n * 100}dvh)`;
}

// Bloquear todo scroll nativo
const appEl = document.getElementById('app');
appEl.addEventListener('wheel',     e => e.preventDefault(), { passive: false });
appEl.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

/* ── PORTADA: partículas en toda la pantalla ─────────────── */
(function () {
  const cv = document.getElementById('portada-canvas');
  const cx = cv.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = cv.width  = cv.offsetWidth;
    H = cv.height = cv.offsetHeight;
  }
  function mk() {
    return {
      x: Math.random() * W,  y: Math.random() * H,
      vx: (Math.random() - .5) * .45,
      vy: -Math.random() * .65 - .12,
      size:  Math.random() * 13 + 5,
      alpha: Math.random() * .5  + .2,
      type: Math.random() < .65 ? '♥' : '✦',
      col: ['#c0527a','#e87fa0','#f4a9a8','#8b2252','#f9c4d2','#ffb3c1']
              [Math.floor(Math.random() * 6)]
    };
  }
  function init() { resize(); pts = []; for (let i = 0; i < 80; i++) pts.push(mk()); }

  function draw() {
    cx.clearRect(0, 0, W, H);
    for (const p of pts) {
      cx.save();
      cx.globalAlpha = p.alpha;
      cx.fillStyle   = p.col;
      cx.font        = p.size + 'px serif';
      cx.fillText(p.type, p.x, p.y);
      cx.restore();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => init());
  init(); draw();
})();

/* ── Botón corazón ───────────────────────────────────────── */
const bigHeart = document.getElementById('bigHeart');
let arbolStarted = false;

function goArbol() {
  tryAudio();
  goToSlide(1);
  if (!arbolStarted) {
    arbolStarted = true;
    setTimeout(initArbol, 650);
  }
}
bigHeart.addEventListener('click',   goArbol);
bigHeart.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') goArbol(); });

/* ── ÁRBOL DEL AMOR ──────────────────────────────────────── */
function initArbol() {
  const sec = document.getElementById('arbol-section');
  const cv  = document.getElementById('arbol-canvas');
  const cx  = cv.getContext('2d');
  let W, H, animStart = null, treeReady = false;
  let segments = [], leafs = [], particles = [];

  /* Paleta: colores vivos para los corazones-hoja */
  const COLS = [
    '#ff4d6d','#ff758f','#ffb3c1','#c9184a',
    '#e040fb','#ffd166','#06d6a0','#4ecdc4',
    '#f4a261','#fcbf49','#a7c957','#ff6b6b'
  ];

  function resize() {
    W = cv.width  = sec.offsetWidth;
    H = cv.height = sec.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Árbol fractal ── */
  function addSegs(x, y, ang, len, wid, depth, delay) {
    if (depth <= 0 || len < 3) return;
    const ex = x + Math.cos(ang) * len;
    const ey = y + Math.sin(ang) * len;
    segments.push({ x1:x, y1:y, x2:ex, y2:ey, wid, depth, delay, t: 0 });
    const nd  = delay + len * 4.8;
    const spr = .40 + depth * .016;
    const nl  = len * .68;
    const nw  = Math.max(.8, wid * .73);
    addSegs(ex, ey, ang - spr, nl, nw, depth - 1, nd);
    addSegs(ex, ey, ang + spr, nl, nw, depth - 1, nd);
    if (depth > 5) addSegs(ex, ey, ang - spr * .28, nl * .5, nw * .62, depth - 2, nd + 110);
  }

  /* 
   * ── Corazones-hoja ──
   * Solo puntas (depth 1 y 2): 2 corazones por punta.
   * Tamaño más grande (r 5-10).
   * ~100-130 corazones total → sin lag.
   */
    function computeLeafs() {
    leafs = [];
    const tips = segments.filter(s => s.depth <= 1);
    for (const s of tips) {
      const n = s.depth === 1 ? 0.1 : 0.1;
      for (let k = 0; k < n; k++) {
        const t = .65 + Math.random() * .15;
        leafs.push({
          x:     s.x1 + (s.x2 - s.x1) * t + (Math.random() - .5) * 7,
          y:     s.y1 + (s.y2 - s.y1) * t + (Math.random() - .5) * 7,
          r:     Math.random() * 3 + 5,           // 5-10px → más grandes
          col:   COLS[Math.floor(Math.random() * COLS.length)],
          delay: 3400 + s.delay * .15 + Math.random() * 1500,
          alpha: 0, born: 0
        });
      }
    }
    /* Pocos extras en depth 3 para algo de densidad interior */
    const mid = segments.filter(s => s.depth === 3);
    for (const s of mid) {
      if (Math.random() < .35) {
        const t = .75 + Math.random() * .25;
        leafs.push({
          x:     s.x1 + (s.x2 - s.x1) * t + (Math.random() - .5) * 6,
          y:     s.y1 + (s.y2 - s.y1) * t + (Math.random() - .5) * 6,
          r:     Math.random() * 4 + 4,
          col:   COLS[Math.floor(Math.random() * COLS.length)],
          delay: 3700 + s.delay * .12 + Math.random() * 400,
          alpha: 0, born: 0
        });
      }
    }
  }

  /* ── Palabras con partículas DOM ── */
  let tipPoints = [];

  function gatherTips() {
    tipPoints = segments
      .filter(s => s.depth <= 3)
      .map(s => ({ x: s.x2, y: s.y2 }));
  }

  const palabras = [
    'Te amo','Te quiero','Mi todo','Mi persona favorita',
    'Mi lugar feliz','Gracias por existir','Mi corazón',
    'Siempre vos','Sos especial','Mi felicidad','Mi princesa','Mi amor'
  ];
  let wordTimer = 0;
  let wordIdx   = 0;

  /* Lanza la palabra + mini partículas DOM desde un punto (px, py en %) */
  function spawnWordAt(px, py, forced) {
    const el = document.createElement('div');
    el.className   = 'palabra';
    el.textContent = palabras[wordIdx % palabras.length];
    wordIdx++;
    el.style.left      = px + '%';
    el.style.top       = py + '%';
    el.style.transform = 'translateX(-50%)';
    sec.appendChild(el);
    setTimeout(() => el.remove(), 5700);

    // Mini partículas DOM alrededor del punto de origen
    const pCount = forced ? 10 : 6;
    for (let k = 0; k < pCount; k++) {
      const p = document.createElement('span');
      p.textContent = Math.random() < .6 ? '♥' : '✦';
      const angle = Math.random() * 360;
      const dist  = Math.random() * 55 + 20;
      const dx    = Math.cos(angle * Math.PI / 180) * dist;
      const dy    = Math.sin(angle * Math.PI / 180) * dist;
      Object.assign(p.style, {
        position:  'absolute',
        left:      px + '%',
        top:       py + '%',
        fontSize:  (Math.random() * 10 + 8) + 'px',
        color:     COLS[Math.floor(Math.random() * COLS.length)],
        opacity:   '1',
        pointerEvents: 'none',
        zIndex:    '6',
        transition: `transform ${.6 + Math.random() * .5}s ease-out, opacity ${.5 + Math.random() * .4}s ease-out`,
        transform: 'translate(-50%,-50%)',
      });
      sec.appendChild(p);
      // Animar en siguiente frame
      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        p.style.opacity   = '0';
      });
      setTimeout(() => p.remove(), 1200);
    }
  }

  function spawnWord(now) {
    if (now < 1000 || now - wordTimer < 900) return;
    if (tipPoints.length === 0) return;
    wordTimer = now;
    const tip = tipPoints[Math.floor(Math.random() * tipPoints.length)];
    spawnWordAt((tip.x / W) * 100, (tip.y / H) * 100, false);
  }

  /* Click en la sección árbol → palabra + partículas en ese punto */
  sec.addEventListener('click', e => {
    if (!treeReady) return;
    // Ignorar clicks en el contador y botón
    if (e.target.closest('#contador-wrap') || e.target.closest('#btn-carta')) return;
    const rect = sec.getBoundingClientRect();
    const px   = ((e.clientX - rect.left) / rect.width)  * 100;
    const py   = ((e.clientY - rect.top)  / rect.height) * 100;
    spawnWordAt(px, py, true);
  });

  /* ── Partículas ligeras ── */
  function addParticle() {
    particles.push({
      x:     W / 2 + (Math.random() - .5) * W * .55,
      y:     H * .12 + Math.random() * H * .5,
      vx:    (Math.random() - .5) * .7,
      vy:    -Math.random() * .7 - .15,
      r:     Math.random() * 3.5 + 1.5,
      life:  1,
      decay: Math.random() * .007 + .004,
      col:   COLS[Math.floor(Math.random() * COLS.length)]
    });
  }

  /* ── Dibujar corazón ── */
  function drawHeart(x, y, r, col, alpha) {
    cx.save();
    cx.globalAlpha = alpha;
    cx.fillStyle   = col;
    cx.beginPath();
    cx.moveTo(x, y - r * .4);
    cx.bezierCurveTo(x - r, y - r,    x - r, y + r * .5, x, y + r);
    cx.bezierCurveTo(x + r, y + r * .5, x + r, y - r,    x, y - r * .4);
    cx.fill();
    cx.restore();
  }

  /* ── Loop principal ── */
  function loop(ts) {
    if (!animStart) animStart = ts;
    const now = ts - animStart;
    cx.clearRect(0, 0, W, H);

    /* Ramas */
    for (const s of segments) {
      if (now < s.delay) continue;
      s.t = Math.min(1, (now - s.delay) / (s.depth * 42 + 70));
      const ex = s.x1 + (s.x2 - s.x1) * s.t;
      const ey = s.y1 + (s.y2 - s.y1) * s.t;
      cx.beginPath(); cx.moveTo(s.x1, s.y1); cx.lineTo(ex, ey);
      cx.strokeStyle = s.depth > 7 ? '#3b1a0b' : s.depth > 4 ? '#6b3320' : '#8b4513';
      cx.lineWidth   = s.wid;
      cx.lineCap     = 'round';
      cx.stroke();
    }

    /* Corazones-hoja */
    for (const l of leafs) {
      if (now < l.delay) continue;
      if (!l.born) l.born = now;
      l.alpha = Math.min(1, (now - l.born) / 500);
      drawHeart(l.x, l.y, l.r, l.col, l.alpha);
    }

    /* Partículas */
    if (now < 7000 && Math.random() < .22) addParticle();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= p.decay; p.x += p.vx; p.y += p.vy;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      drawHeart(p.x, p.y, p.r * p.life, p.col, p.life * .7);
    }

    /* Palabras desde las puntas */
    if (tipPoints.length > 0) spawnWord(now);

    /* Activar UI cuando terminan las hojas */
    if (!treeReady && leafs.length > 0) {
      const pct = leafs.filter(l => l.alpha >= .95).length / leafs.length;
      if (pct > .82) {
        treeReady = true;
        document.getElementById('contador-wrap').classList.add('visible');
        document.getElementById('btn-carta').classList.add('visible');
      }
    }

    requestAnimationFrame(loop);
  }

  /* ── Iniciar ── */
  const trunkLen = Math.min(H * .33, 195);
  addSegs(W / 2, H - 4, -Math.PI / 2, trunkLen, 15, 11, 0);
  computeLeafs();
  gatherTips();
  requestAnimationFrame(loop);
}

/* ── CONTADOR ─────────────────────────────────────────────── */
(function () {
  const start = new Date('2026-02-01T00:00:00');
  function tick() {
    const diff = Date.now() - start;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    document.getElementById('cDias').textContent  = String(d).padStart(2, '0');
    document.getElementById('cHoras').textContent = String(h).padStart(2, '0');
    document.getElementById('cMin').textContent   = String(m).padStart(2, '0');
    document.getElementById('cSeg').textContent   = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── SLIDER DE FOTOS ──────────────────────────────────────── */
(function () {
  const track   = document.getElementById('sliderTrack');
  const outer   = document.getElementById('sliderOuter');
  const dotsEl  = document.getElementById('sliderDots');
  const btnPrev = document.getElementById('sArrowPrev');
  const btnNext = document.getElementById('sArrowNext');

  const items = [
    { file: 'foto1.jpeg', emoji: '🌸' },
    { file: 'foto2.jpeg', emoji: '🌹' },
    { file: 'foto3.jpeg', emoji: '💕' },
    { file: 'foto7.jpeg', emoji: '🌷' },
    { file: 'foto8.jpeg', emoji: '✨' },
    { file: 'foto6.jpeg', emoji: '💖' },
  ];

  const N = items.length;
  let current = 0;
  const dots  = [];

  // Construir slides
  items.forEach((it, i) => {
    const slide = document.createElement('div');
    slide.className = 's-slide';

    const img = document.createElement('img');
    img.src     = it.file;
    img.alt     = 'Foto ' + (i + 1);
    img.loading = 'lazy';
    img.draggable = false;
    img.onerror = () => {
      slide.innerHTML = `<div class="s-ph">
        <span class="s-ph-emoji">${it.emoji}</span>
        <span class="s-ph-label">${it.file}</span>
      </div>`;
    };
    slide.appendChild(img);
    track.appendChild(slide);

    // Dot
    const dot = document.createElement('button');
    dot.className = 's-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Foto ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
    dots.push(dot);
  });

  function goTo(n) {
    current = (n + N) % N;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  btnPrev && btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext && btnNext.addEventListener('click', () => goTo(current + 1));

  // Swipe táctil
  let startX = 0, dragging = false;
  outer.addEventListener('pointerdown', e => {
    startX   = e.clientX;
    dragging = true;
    outer.setPointerCapture(e.pointerId);
  });
  outer.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  });

  // Autoplay cada 3s, pausa si el modal está abierto y el usuario interactuó
  let autoTimer = setInterval(() => goTo(current + 1), 3000);

  outer.addEventListener('pointerdown', () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 3000);
  });
})();

/* ── MODAL CARTA ──────────────────────────────────────────── */
const modal    = document.getElementById('modal');
const btnCarta = document.getElementById('btn-carta');
const closeBtn = modal.querySelector('.modal-close');
const cartaEl  = document.getElementById('carta-contenido');
const cursorEl = document.getElementById('cursor-carta');

const CARTA = `Hola Princesa💗.
Hoy cumplimos otro mes juntos y quise regalarte este pequeño rincón para recordarte lo importante que sos para mí. Tu sonrisa alegra mis días, tu compañía me da paz y tu forma de ser me inspira a seguir adelante incluso cuando las cosas se ponen difíciles.
Gracias por cada momento compartido, por cada charla y por hacer especiales incluso los días más simples. Este árbol está lleno de corazones, pero ninguno representa tanto amor como el que siento por vos.`;

let typeIv = null;

function openModal() {
  modal.classList.add('open');
  cartaEl.innerHTML = '';
  cartaEl.appendChild(cursorEl);
  let i = 0;
  typeIv = setInterval(() => {
    if (i < CARTA.length) {
      cartaEl.insertBefore(document.createTextNode(CARTA[i]), cursorEl);
      i++;
      cartaEl.scrollTop = cartaEl.scrollHeight;
    } else {
      clearInterval(typeIv);
    }
  }, 26);
}

function closeModal() {
  modal.classList.remove('open');
  clearInterval(typeIv);
}

btnCarta.addEventListener('click',  openModal);
closeBtn.addEventListener('click',  closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });