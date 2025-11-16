
import React, { useRef, useEffect, useCallback } from 'react';
import { random, calculateDistance } from '../lib/utils';

interface FireworksCanvasProps {
  particleCount: number;
  autoLaunch: boolean;
}

// Represents a single glowing particle from an explosion
class Particle {
  x: number;
  y: number;
  // Store previous position for drawing trails
  coordinates: { x: number; y: number }[] = [];
  angle: number;
  speed: number;
  friction = 0.97;
  gravity = 1;
  hue: number;
  brightness: number;
  alpha = 1;
  decay: number;
  lineWidth: number;

  constructor(x: number, y: number, hue: number) {
    this.x = x;
    this.y = y;
    // Start with 5 coordinate history points
    this.coordinates = Array(5).fill({ x: this.x, y: this.y });
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 12);
    this.hue = hue;
    this.brightness = random(50, 80);
    this.decay = random(0.015, 0.03);
    this.lineWidth = random(1, 3);
  }

  update() {
    this.coordinates.pop();
    this.coordinates.unshift({ x: this.x, y: this.y });
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;
    if (this.brightness > 0) this.brightness -= 0.3;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1].x, this.coordinates[this.coordinates.length - 1].y);
    ctx.lineTo(this.x, this.y);
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
    ctx.stroke();
  }
}

// Represents the initial rocket that flies up and explodes
class Firework {
  x: number;
  y: number;
  sx: number; // Starting X
  sy: number; // Starting Y
  tx: number; // Target X
  ty: number; // Target Y
  distanceToTarget: number;
  distanceTraveled = 0;
  coordinates: { x: number; y: number }[] = [];
  angle: number;
  speed = 2;
  acceleration = 1.05;
  brightness: number;
  hue: number;
  lineWidth: number;

  constructor(sx: number, sy: number, tx: number, ty: number) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.coordinates = Array(3).fill({ x: this.x, y: this.y });
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.hue = random(0, 360);
    this.brightness = random(50, 70);
    this.lineWidth = random(1, 3);
  }

  update(onExplode: () => void) {
    this.coordinates.pop();
    this.coordinates.unshift({ x: this.x, y: this.y });
    this.speed *= this.acceleration;
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

    if (this.distanceTraveled >= this.distanceToTarget) {
      onExplode();
    } else {
      this.x += vx;
      this.y += vy;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1].x, this.coordinates[this.coordinates.length - 1].y);
    ctx.lineTo(this.x, this.y);
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
    ctx.stroke();
  }
}

const FireworksCanvas: React.FC<FireworksCanvasProps> = ({ particleCount, autoLaunch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number>();
  const lastAutoLaunchTimeRef = useRef(0);

  const launchFirework = useCallback((tx?: number, ty?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = canvas.width / 2;
    const startY = canvas.height;
    const targetX = tx ?? random(0, canvas.width);
    const targetY = ty ?? random(0, canvas.height / 2);

    fireworksRef.current.push(new Firework(startX, startY, targetX, targetY));
  }, []);
  
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create a fading trail effect by drawing a semi-transparent background
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    
    // FIX: The original error was likely caused by modifying the array while iterating with forEach.
    // Using a reverse for-loop is a safer way to iterate when items might be removed.
    // Update and draw fireworks
    for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
      const firework = fireworksRef.current[i];
      firework.draw(ctx);
      firework.update(() => {
        // Explode
        for (let j = 0; j < particleCount; j++) {
          particlesRef.current.push(new Particle(firework.tx, firework.ty, firework.hue));
        }
        fireworksRef.current.splice(i, 1);
      });
    }

    // Update and draw particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      if (particle.alpha > particle.decay) {
        particle.draw(ctx);
        particle.update();
      } else {
        particlesRef.current.splice(i, 1);
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(animate);
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      launchFirework(e.pageX, e.pageY);
    };

    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            launchFirework(e.touches[0].pageX, e.touches[0].pageY);
        }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart);

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if(animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', setCanvasDimensions);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, launchFirework]);

  useEffect(() => {
    if (autoLaunch) {
      const timer = setInterval(() => {
        launchFirework();
      }, 800);
      return () => clearInterval(timer);
    }
  }, [autoLaunch, launchFirework]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default FireworksCanvas;
