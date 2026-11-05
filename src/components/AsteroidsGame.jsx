 import React, { useEffect, useRef, useState } from 'react';

// Componente del juego Asteroids Retro en Canvas HTML5 + React
export default function AsteroidsGame() {
  const canvasRef = useRef(null);

  // Estados del juego
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
 
 // Referencias para el bucle de animación y teclado
  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    ship: null,
    asteroids: [],
    lasers: [],
    particles: [],
    keys: {
      left: false,
      right: false,
      up: false,
      shoot: false,
    },
    lastShotTime: 0,
  });

  // Sonidos sintetizados simples usando Web Audio API para no requerir archivos externos
  const playSound = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'explosion') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'thrust') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(60, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      // Ignorar errores de audio si el navegador bloquea autoplay
    }
  };

  // Inicializar entidades del juego
  const createShip = (width, height) => ({
    x: width / 2,
    y: height / 2,
    r: 14, // Radio
    a: (90 / 180) * Math.PI, // Ángulo apuntando hacia arriba
    rot: 0, // Velocidad de rotación
    thrusting: false,
    thrust: { x: 0, y: 0 },
    invulnerable: 120, // Frames de invulnerabilidad temporal al reaparecer
  });

  const createAsteroid = (x, y, radius, levelMultiplier) => {
    const vertices = Math.floor(Math.random() * 5) + 7;
    const offsets = [];
    for (let i = 0; i < vertices; i++) {
      offsets.push(Math.random() * 0.4 + 0.8);
    }
    const speed = (1 + levelMultiplier * 0.2) * (40 / radius);
    const angle = Math.random() * Math.PI * 2;

    return {
      x,
      y,
      xv: Math.cos(angle) * speed,
      yv: Math.sin(angle) * speed,
      r: radius,
      a: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      vertices,
      offsets,
    };
  };

  const createExplosion = (x, y, color, count = 15) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particles.push({
        x,
        y,
        xv: Math.cos(angle) * speed,
        yv: Math.sin(angle) * speed,
        life: Math.random() * 20 + 20,
        color,
      });
    }
    return particles;
  };

  const startNewGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;

    gameStateRef.current.score = 0;
    gameStateRef.current.lives = 3;
    gameStateRef.current.level = 1;
    gameStateRef.current.gameOver = false;
    gameStateRef.current.particles = [];
    gameStateRef.current.lasers = [];
    gameStateRef.current.ship = createShip(w, h);

    // Generar asteroides iniciales
    const numAsteroids = 4;
    const newAsteroids = [];
    for (let i = 0; i < numAsteroids; i++) {
      let ax, ay;
      do {
        ax = Math.random() * w;
        ay = Math.random() * h;
      } while (Math.hypot(w / 2 - ax, h / 2 - ay) < 150);

      newAsteroids.push(createAsteroid(ax, ay, 40, 1));
    }
    gameStateRef.current.asteroids = newAsteroids;

    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
  };

  // Inicialización y Loop principal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Ajustar resolución del canvas
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = Math.min(container.clientWidth * 0.65, window.innerHeight * 0.7);
        if (!gameStateRef.current.ship) {
          startNewGame();
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Control del Teclado
    const handleKeyDown = (e) => {
      if (gameStateRef.current.gameOver) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameStateRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameStateRef.current.keys.right = true;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        gameStateRef.current.keys.up = true;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        gameStateRef.current.keys.shoot = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameStateRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameStateRef.current.keys.right = false;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        gameStateRef.current.keys.up = false;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        gameStateRef.current.keys.shoot = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Bucle del juego (60 FPS)
    let animationFrameId;

    const gameLoop = () => {
      const state = gameStateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // 1. LIMPIAR PANTALLA (Efecto Estelar Retro)
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      if (!state.gameOver && state.ship) {
        const ship = state.ship;

        // Rotación de la nave
        if (state.keys.left) ship.a += 0.08;
        if (state.keys.right) ship.a -= 0.08;

        // Propulsión / Aceleración
        if (state.keys.up) {
          ship.thrust.x += Math.cos(ship.a) * 0.15;
          ship.thrust.y -= Math.sin(ship.a) * 0.15;
          playSound('thrust');

          // Partículas de propulsión
          state.particles.push({
            x: ship.x - Math.cos(ship.a) * ship.r,
            y: ship.y + Math.sin(ship.a) * ship.r,
            xv: -Math.cos(ship.a) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
            yv: Math.sin(ship.a) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
            life: 15,
            color: '#00f3ff',
          });
        } else {
          // Fricción en el espacio
          ship.thrust.x *= 0.985;
          ship.thrust.y *= 0.985;
        }

        // Mover Nave
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

        // Bordes infinitos (Pacman Effect)
        if (ship.x < -ship.r) ship.x = w + ship.r;
        if (ship.x > w + ship.r) ship.x = -ship.r;
        if (ship.y < -ship.r) ship.y = h + ship.r;
        if (ship.y > h + ship.r) ship.y = -ship.r;

        if (ship.invulnerable > 0) ship.invulnerable--;

        // Disparo Láser
        const now = Date.now();
        if (state.keys.shoot && now - state.lastShotTime > 200) {
          state.lasers.push({
            x: ship.x + Math.cos(ship.a) * ship.r,
            y: ship.y - Math.sin(ship.a) * ship.r,
            xv: Math.cos(ship.a) * 8 + ship.thrust.x,
            yv: -Math.sin(ship.a) * 8 + ship.thrust.y,
            life: 45,
          });
          state.lastShotTime = now;
          playSound('laser');
        }

        // DIBUJAR NAVE CON ESTILO NEÓN
        if (ship.invulnerable % 8 < 4) {
          ctx.save();
          ctx.translate(ship.x, ship.y);
          ctx.rotate(-ship.a);
          ctx.strokeStyle = '#00ffcc';
          ctx.shadowColor = '#00ffcc';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 2;

          ctx.beginPath();
          // Punta de la nave
          ctx.moveTo(ship.r, 0);
          // Esquina inferior izquierda
          ctx.lineTo(-ship.r * 0.8, -ship.r * 0.6);
          // Centro hacia adentro
          ctx.lineTo(-ship.r * 0.4, 0);
          // Esquina inferior derecha
          ctx.lineTo(-ship.r * 0.8, ship.r * 0.6);
          ctx.closePath();
          ctx.stroke();

          ctx.restore();
        }
      }

      // 2. MOVER Y DIBUJAR LÁSERES
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const l = state.lasers[i];
        l.x += l.xv;
        l.y += l.yv;
        l.life--;

        // Bordes infinitos láser
        if (l.x < 0) l.x = w;
        if (l.x > w) l.x = 0;
        if (l.y < 0) l.y = h;
        if (l.y > h) l.y = 0;

        if (l.life <= 0) {
          state.lasers.splice(i, 1);
          continue;
        }

        // Dibujar Láser Neón
        ctx.strokeStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(l.x, l.y, 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. MOVER Y DIBUJAR ASTEROIDES
      for (let i = state.asteroids.length - 1; i >= 0; i--) {
        const a = state.asteroids[i];
        a.x += a.xv;
        a.y += a.yv;
        a.a += a.rotSpeed;

        // Bordes infinitos
        if (a.x < -a.r) a.x = w + a.r;
        if (a.x > w + a.r) a.x = -a.r;
        if (a.y < -a.r) a.y = h + a.r;
        if (a.y > h + a.r) a.y = -a.r;

        // Dibujar Asteroide Neón
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.a);
        ctx.strokeStyle = '#ffaa00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let j = 0; j < a.vertices; j++) {
          const angle = (j / a.vertices) * Math.PI * 2;
          const dist = a.r * a.offsets[j];
          const vx = Math.cos(angle) * dist;
          const vy = Math.sin(angle) * dist;
          if (j === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // COLISIÓN: LÁSER VS ASTEROIDE
        for (let j = state.lasers.length - 1; j >= 0; j--) {
          const l = state.lasers[j];
          if (Math.hypot(a.x - l.x, a.y - l.y) < a.r) {
            // Destruir láser
            state.lasers.splice(j, 1);

            // Generar Partículas
            state.particles.push(...createExplosion(a.x, a.y, '#ffaa00', 12));
            playSound('explosion');

            // Sumar puntos
            const points = a.r > 25 ? 20 : a.r > 15 ? 50 : 100;
            state.score += points;
            setScore(state.score);

            // Dividir Asteroide
            if (a.r > 15) {
              state.asteroids.push(createAsteroid(a.x, a.y, a.r / 2, state.level));
              state.asteroids.push(createAsteroid(a.x, a.y, a.r / 2, state.level));
            }

            state.asteroids.splice(i, 1);
            break;
          }
        }

        // COLISIÓN: NAVE VS ASTEROIDE
        if (!state.gameOver && state.ship && state.ship.invulnerable <= 0) {
          if (Math.hypot(a.x - state.ship.x, a.y - state.ship.y) < a.r + state.ship.r * 0.7) {
            // Explosión de Nave
            state.particles.push(...createExplosion(state.ship.x, state.ship.y, '#00ffcc', 30));
            playSound('explosion');

            state.lives--;
            setLives(state.lives);

            if (state.lives <= 0) {
              state.gameOver = true;
              setGameOver(true);
            } else {
              // Reaparecer nave
              state.ship = createShip(w, h);
            }
          }
        }
      }

      // Si se limpian los asteroides, pasa al siguiente nivel
      if (state.asteroids.length === 0 && !state.gameOver) {
        state.level++;
        setLevel(state.level);
        const nextAsteroidsCount = 3 + state.level;
        for (let k = 0; k < nextAsteroidsCount; k++) {
          let ax, ay;
          do {
            ax = Math.random() * w;
            ay = Math.random() * h;
          } while (state.ship && Math.hypot(w / 2 - ax, h / 2 - ay) < 150);

          state.asteroids.push(createAsteroid(ax, ay, 40, state.level));
        }
      }

      // 4. MOVER Y DIBUJAR PARTÍCULAS DE EXPLOSIÓN
      for (let pIdx = state.particles.length - 1; pIdx >= 0; pIdx--) {
        const p = state.particles[pIdx];
        p.x += p.xv;
        p.y += p.yv;
        p.life--;

        if (p.life <= 0) {
          state.particles.splice(pIdx, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life / 6), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Controles Táctiles (para dispositivos móviles)
  const setTouchKey = (key, value) => {
    gameStateRef.current.keys[key] = value;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 select-none">
      
      {/* Marcador Estilo Arcade Superior */}
      <div className="w-full flex justify-between items-center bg-slate-900 border border-cyan-500/30 rounded-t-xl px-6 py-3 shadow-lg text-cyan-400 font-mono text-sm md:text-base">
        <div className="flex items-center gap-2">
          <span>SCORE:</span>
          <span className="text-xl font-bold text-white">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>LEVEL:</span>
          <span className="text-xl font-bold text-yellow-400">{level}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>LIVES:</span>
          <div className="flex gap-1">
            {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
              <span key={i} className="text-lg text-cyan-400">▲</span>
            ))}
          </div>
        </div>
      </div>

      {/* Contenedor del Canvas del Juego */}
      <div className="relative w-full bg-slate-950 border-x border-b border-cyan-500/30 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} className="w-full block" />

        {/* Pantalla de GAME OVER */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-extrabold text-red-500 tracking-wider mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] font-mono">
              GAME OVER
            </h2>
            <p className="text-gray-300 text-lg mb-2">Puntaje final: <span className="text-cyan-400 font-bold">{score}</span></p>
            <p className="text-gray-400 text-sm mb-6">Llegaste hasta el Nivel {level}</p>
            
            <button
              onClick={startNewGame}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-lg rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-95"
            >
              JUGAR DE NUEVO 🚀
            </button>
          </div>
        )}
      </div>

      {/* Controles en Pantalla para Móviles o Touch */}
      <div className="w-full grid grid-cols-3 gap-3 mt-4 md:hidden">
        <div className="flex gap-2 col-span-2">
          <button
            onTouchStart={() => setTouchKey('left', true)}
            onTouchEnd={() => setTouchKey('left', false)}
            onMouseDown={() => setTouchKey('left', true)}
            onMouseUp={() => setTouchKey('left', false)}
            className="flex-1 py-4 bg-slate-800 text-cyan-400 font-bold text-xl rounded-lg border border-cyan-500/30 active:bg-cyan-950"
          >
            ◀
          </button>
          <button
            onTouchStart={() => setTouchKey('up', true)}
            onTouchEnd={() => setTouchKey('up', false)}
            onMouseDown={() => setTouchKey('up', true)}
            onMouseUp={() => setTouchKey('up', false)}
            className="flex-1 py-4 bg-slate-800 text-cyan-400 font-bold text-xl rounded-lg border border-cyan-500/30 active:bg-cyan-950"
          >
            ▲
          </button>
          <button
            onTouchStart={() => setTouchKey('right', true)}
            onTouchEnd={() => setTouchKey('right', false)}
            onMouseDown={() => setTouchKey('right', true)}
            onMouseUp={() => setTouchKey('right', false)}
            className="flex-1 py-4 bg-slate-800 text-cyan-400 font-bold text-xl rounded-lg border border-cyan-500/30 active:bg-cyan-950"
          >
            ▶
          </button>
        </div>
        <button
          onTouchStart={() => setTouchKey('shoot', true)}
          onTouchEnd={() => setTouchKey('shoot', false)}
          onMouseDown={() => setTouchKey('shoot', true)}
          onMouseUp={() => setTouchKey('shoot', false)}
          className="py-4 bg-red-600/80 text-white font-bold text-lg rounded-lg border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] active:bg-red-700"
        >
          FUEGO 💥
        </button>
      </div>

      {/* Guía de Controles para Escritorio */}
      <div className="hidden md:flex justify-center gap-8 mt-4 text-xs text-slate-400 font-mono">
        <span><strong className="text-cyan-400">Rotar:</strong> Flechas Izq / Der o A / D</span>
        <span><strong className="text-cyan-400">Propulsión:</strong> Flecha Arriba o W</span>
        <span><strong className="text-cyan-400">Disparar:</strong> Barra Espaciadora</span>
      </div>

    </div>
  );
}