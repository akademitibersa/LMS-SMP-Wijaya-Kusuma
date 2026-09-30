// Lightweight zero-dependency canvas confetti for celebration effects
export const triggerConfetti = (opts: { particleCount?: number; spread?: number; origin?: { y: number } } = {}) => {
  if (typeof window === 'undefined') return;

  const count = opts.particleCount || 60;
  const spread = opts.spread || 60;
  const originY = opts.origin?.y !== undefined ? opts.origin.y : 0.6;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRotation: number;
    alpha: number;
  }[] = [];

  const colors = ['#2563eb', '#38bdf8', '#fbbf24', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

  const startX = canvas.width / 2;
  const startY = canvas.height * originY;

  for (let i = 0; i < count; i++) {
    const angle = ((Math.random() - 0.5) * spread * Math.PI) / 180 - Math.PI / 2;
    const speed = 7 + Math.random() * 9;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      alpha: 1,
    });
  }

  let animationFrameId: number;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // gravity
      p.vx *= 0.99; // drag
      p.rotation += p.vRotation;
      p.alpha -= 0.015;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };

  render();
};

export default triggerConfetti;
