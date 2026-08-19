'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  petalType: number;
}

export default function SakuraFalling() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Beautiful rose & sakura petal colors with rich visible tone for light background
    const petalColors = [
      'rgba(244, 114, 182, ', // Rose pink
      'rgba(251, 113, 133, ', // Rose 400
      'rgba(236, 72, 153, ',  // Pink 500
      'rgba(248, 113, 113, ', // Coral pink
      'rgba(253, 164, 175, ', // Rose 300
    ];

    const petalCount = Math.min(Math.floor(width / 35), 32);
    const petals: Petal[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 9 + 8,
        speedX: Math.random() * 1.3 + 0.4,
        speedY: Math.random() * 1.1 + 0.7,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.6,
        opacity: Math.random() * 0.4 + 0.5,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        petalType: Math.floor(Math.random() * 2),
      });
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.beginPath();
      
      ctx.fillStyle = `${p.color}${p.opacity})`;
      ctx.shadowColor = 'rgba(236, 72, 153, 0.25)';
      ctx.shadowBlur = 3;

      if (p.petalType === 0) {
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
        ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
      } else {
        ctx.ellipse(0, 0, p.size * 0.6, p.size, Math.PI / 4, 0, 2 * Math.PI);
      }

      ctx.fill();
      ctx.restore();
    };

    let wind = 0;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;
      wind = Math.sin(time) * 0.7;

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.x += p.speedX + wind;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -20;
        } else if (p.x < -20) {
          p.x = width + 20;
        }

        drawPetal(p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled]);

  return (
    <>
      {isEnabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-30"
          style={{ width: '100vw', height: '100vh' }}
        />
      )}

      {/* Floating Toggle Sakura Effect (Commented Out) */}
      {/* 
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        title={isEnabled ? 'Nonaktifkan Efek Sakura' : 'Aktifkan Efek Sakura'}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 px-3.5 py-2 rounded-full bg-white/95 border border-pink-200 text-pink-600 hover:text-pink-700 hover:bg-white shadow-md shadow-pink-200/50 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
      >
        <span>🌸</span>
        <span>{isEnabled ? 'Sakura On' : 'Sakura Off'}</span>
      </button>
      */}
    </>
  );
}
