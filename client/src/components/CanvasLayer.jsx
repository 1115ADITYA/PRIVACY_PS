import React, { useEffect, useRef } from 'react';
import { socket } from '../socket';

export default function CanvasLayer({ isActive }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.02;
        p.r += 2;
        p.alpha = Math.max(0, p.life);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    if (isActive) {
      draw();
    }

    const handleInteraction = (data) => {
      if (!isActive) return;
      const x = data.x * window.innerWidth;
      const y = data.y * window.innerHeight;
      
      particlesRef.current.push({
        x,
        y,
        r: 10,
        life: 1,
        alpha: 1
      });
    };

    socket.on('interaction:received', handleInteraction);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      socket.off('interaction:received', handleInteraction);
    };
  }, [isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-10"
      style={{ display: isActive ? 'block' : 'none' }}
    />
  );
}
