import { useEffect, useMemo, useRef, useState } from 'react';
import './HeroSection.css';
import heroPerson from './hero-person.png';
import heroPersonReveal from './hero-person-reveal.png';

const phrases = [
  'REALTIME SIGNAL',
  'MOTION SYSTEM',
  'ORANGE PROTOCOL',
  'REACT BITS MODE',
  'CYBER HERO UI',
];

const glyphs = '01<>/{}[]#$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const dataTokens = ['CLK', 'AI', 'SYS', 'NODE', 'PX', 'OPS', 'GPU', 'UI'];

function ScrambleText() {
  const [text, setText] = useState(phrases[0]);

  useEffect(() => {
    let phraseIndex = 0;
    let frameTimer;

    const scrambleTo = (nextText) => {
      const from = text;
      const maxLen = Math.max(from.length, nextText.length);
      let frame = 0;
      const frames = 24;

      clearInterval(frameTimer);
      frameTimer = window.setInterval(() => {
        const progress = frame / frames;
        const revealPoint = Math.floor(progress * maxLen);
        let output = '';

        for (let i = 0; i < maxLen; i += 1) {
          output += i < revealPoint ? nextText[i] || ' ' : glyphs[Math.floor(Math.random() * glyphs.length)];
        }

        setText(output);
        frame += 1;

        if (frame > frames) {
          clearInterval(frameTimer);
          setText(nextText);
        }
      }, 28);
    };

    const phraseTimer = window.setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      scrambleTo(phrases[phraseIndex]);
    }, 1850);

    return () => {
      clearInterval(phraseTimer);
      clearInterval(frameTimer);
    };
  }, []);

  return <span className="hero-scramble-text">{text}</span>;
}

function useAnimatedValue(base, range, decimals = 0, suffix = '', pad = 0) {
  const [value, setValue] = useState(`${base}${suffix}`);

  useEffect(() => {
    let frame;
    const start = performance.now();

    const tick = (now) => {
      const t = (now - start) / 700;
      const wave = Math.sin(t + base * 0.013) * 0.5 + 0.5;
      const jitter = Math.random() * 0.08;
      const raw = base + range * (wave + jitter - 0.5);
      let next = decimals ? raw.toFixed(decimals) : Math.max(0, Math.round(raw)).toLocaleString('en-US');
      if (pad && !decimals) next = String(Math.round(raw)).padStart(pad, '0');
      setValue(`${next}${suffix}`);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [base, range, decimals, suffix, pad]);

  return value;
}

function StatCard({ base, range, decimals, suffix, pad, label }) {
  const value = useAnimatedValue(base, range, decimals, suffix, pad);
  return (
    <div className="hero-stat-card">
      <span className="hero-stat-number">{value}</span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

function RevealPortrait() {
  const stageRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const reveal = revealRef.current;
    const hero = stage?.closest('.orange-hero');

    if (!stage || !reveal || !hero) return undefined;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const mask = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      active: false,
      initialized: false,
      raf: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      width: 0,
      height: 0,
    };

    const resizeMaskCanvas = () => {
      const rect = reveal.getBoundingClientRect();
      mask.dpr = Math.min(window.devicePixelRatio || 1, 2);
      mask.width = Math.max(1, Math.round(rect.width * mask.dpr));
      mask.height = Math.max(1, Math.round(rect.height * mask.dpr));
      canvas.width = mask.width;
      canvas.height = mask.height;
    };

    const getEventPoint = (event) => {
      const source = event.touches?.[0] || event.changedTouches?.[0] || event;
      const rect = reveal.getBoundingClientRect();
      const localWidth = reveal.clientWidth || rect.width;
      const localHeight = reveal.clientHeight || rect.height;
      const isForcedPhoneLandscape = window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches;

      if (isForcedPhoneLandscape) {
        return {
          x: ((source.clientY - rect.top) / rect.height) * localWidth,
          y: ((rect.right - source.clientX) / rect.width) * localHeight,
        };
      }

      return {
        x: ((source.clientX - rect.left) / rect.width) * localWidth,
        y: ((source.clientY - rect.top) / rect.height) * localHeight,
      };
    };

    const setTargetFromEvent = (event) => {
      const point = getEventPoint(event);
      mask.targetX = Math.min(Math.max(point.x, 0), reveal.clientWidth || point.x);
      mask.targetY = Math.min(Math.max(point.y, 0), reveal.clientHeight || point.y);

      if (!mask.initialized) {
        mask.currentX = mask.targetX;
        mask.currentY = mask.targetY;
        mask.initialized = true;
      }

      mask.active = true;
      reveal.classList.add('is-reveal-active');
    };

    const drawMask = () => {
      mask.currentX += (mask.targetX - mask.currentX) * 0.16;
      mask.currentY += (mask.targetY - mask.currentY) * 0.16;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = mask.currentX * mask.dpr;
      const cy = mask.currentY * mask.dpr;
      const outerRadius = Math.min(230, Math.max(140, window.innerWidth * 0.18)) * mask.dpr;
      const innerRadius = outerRadius * 0.28;
      const gradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);

      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.42, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.72, 'rgba(0,0,0,.36)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/png');
      reveal.style.webkitMaskImage = `url(${dataUrl})`;
      reveal.style.maskImage = `url(${dataUrl})`;

      mask.raf = window.requestAnimationFrame(drawMask);
    };

    const handleLeave = () => {
      mask.active = false;
      reveal.classList.remove('is-reveal-active');
    };

    resizeMaskCanvas();
    window.addEventListener('resize', resizeMaskCanvas);
    window.addEventListener('orientationchange', resizeMaskCanvas);

    if (window.PointerEvent) {
      hero.addEventListener('pointermove', setTargetFromEvent, { passive: true });
      hero.addEventListener('pointerleave', handleLeave);
      hero.addEventListener('pointercancel', handleLeave);
    } else {
      hero.addEventListener('mousemove', setTargetFromEvent);
      hero.addEventListener('mouseleave', handleLeave);
      hero.addEventListener('touchmove', setTargetFromEvent, { passive: true });
      hero.addEventListener('touchend', handleLeave);
      hero.addEventListener('touchcancel', handleLeave);
    }

    mask.raf = window.requestAnimationFrame(drawMask);

    return () => {
      window.cancelAnimationFrame(mask.raf);
      window.removeEventListener('resize', resizeMaskCanvas);
      window.removeEventListener('orientationchange', resizeMaskCanvas);

      if (window.PointerEvent) {
        hero.removeEventListener('pointermove', setTargetFromEvent);
        hero.removeEventListener('pointerleave', handleLeave);
        hero.removeEventListener('pointercancel', handleLeave);
      } else {
        hero.removeEventListener('mousemove', setTargetFromEvent);
        hero.removeEventListener('mouseleave', handleLeave);
        hero.removeEventListener('touchmove', setTargetFromEvent);
        hero.removeEventListener('touchend', handleLeave);
        hero.removeEventListener('touchcancel', handleLeave);
      }
    };
  }, []);

  return (
    <div className="hero-portrait-stage" ref={stageRef}>
      <img className="hero-portrait-base" src={heroPerson} alt="" />
      <div
        className="hero-portrait-reveal"
        ref={revealRef}
        style={{ backgroundImage: `url(${heroPersonReveal})` }}
      />
    </div>
  );
}

function DataField() {
  const nodes = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => ({
      id: i,
      token: dataTokens[i % dataTokens.length],
      left: Math.random() * 92 + 2,
      top: Math.random() * 82 + 6,
      dx: Math.random() * 80 - 40,
      dy: Math.random() * 70 - 35,
      duration: 3.4 + Math.random() * 5,
    }));
  }, []);

  const [values, setValues] = useState(() => nodes.map(() => Math.floor(Math.random() * 9999)));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setValues((prev) => prev.map((value) => (Math.random() > 0.48 ? value : Math.floor(Math.random() * 9999))));
    }, 520);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-data-field" aria-hidden="true">
      {nodes.map((node, i) => (
        <span
          key={node.id}
          style={{
            left: `${node.left}%`,
            top: `${node.top}%`,
            '--dx': `${node.dx.toFixed(1)}px`,
            '--dy': `${node.dy.toFixed(1)}px`,
            '--duration': `${node.duration.toFixed(2)}s`,
          }}
        >
          {node.token}_{String(values[i]).padStart(4, '0')}
        </span>
      ))}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="orange-hero" aria-label="Orange hero section with dynamic data effects">
      <div className="hero-grain" />
      <DataField />
      <div className="hero-corner-tag"><i /> Live UI</div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-halo" />
        <div className="hero-scanner" />
        <RevealPortrait />
      </div>

      <div className="hero-inner">
        <main className="hero-content">
          <div className="hero-pill"><span className="hero-pulse-dot" /> ORANGE PROTOCOL / HERO 01</div>
          <h1>
            <span>SIGNAL</span>
            <span>DRIVEN</span>
          </h1>

          <div className="hero-scramble-chip">
            <small>react-bits style text</small>
            <ScrambleText />
          </div>

          <p className="hero-lede">
            一个偏右人物构图的橘色科技 Hero Section：动态数字、扰动文字、扫描光束与数据粒子持续刷新，适合放在作品集、AI 产品或视觉实验首页。
          </p>

          <div className="hero-stats" aria-label="dynamic metrics">
            <StatCard base={128} range={32} pad={3} label="active nodes" />
            <StatCard base={2048} range={512} label="data stream" />
            <StatCard base={96} range={4} suffix="%" label="system sync" />
            <StatCard base={7.3} range={0.5} decimals={1} suffix="ms" label="response" />
          </div>
        </main>
      </div>

      <div className="hero-ticker-strip" aria-hidden="true">
        <div className="hero-ticker-track">
          <span><b>01</b> neural sync</span><span>orange field</span><span><b>2048</b> vector pulse</span><span>signal lock</span><span><b>96%</b> uptime</span><span>react bits motion</span>
          <span><b>01</b> neural sync</span><span>orange field</span><span><b>2048</b> vector pulse</span><span>signal lock</span><span><b>96%</b> uptime</span><span>react bits motion</span>
        </div>
      </div>
    </section>
  );
}
