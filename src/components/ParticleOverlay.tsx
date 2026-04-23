'use client';
import { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ParticleEffect } from '../types/slide';
import type { ISourceOptions } from '@tsparticles/engine';

const effectConfigs: Record<ParticleEffect, ISourceOptions> = {
  snow: {
    particles: {
      number: { value: 50 },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.3, max: 0.8 } },
      size: { value: { min: 1, max: 4 } },
      move: { enable: true, speed: { min: 0.5, max: 2 }, direction: 'bottom', straight: false, outModes: { default: 'out' } },
      wobble: { enable: true, distance: 10, speed: 5 },
    },
  },
  rain: {
    particles: {
      number: { value: 80 },
      color: { value: '#6ea8fe' },
      shape: { type: 'line' },
      opacity: { value: { min: 0.2, max: 0.5 } },
      size: { value: { min: 1, max: 2 } },
      move: { enable: true, speed: { min: 10, max: 20 }, direction: 'bottom', straight: true, outModes: { default: 'out' } },
    },
  },
  confetti: {
    particles: {
      number: { value: 40 },
      color: { value: ['#FF4E00', '#00FFCC', '#EAB308', '#FF00FF', '#3B82F6'] },
      shape: { type: ['square', 'circle'] },
      opacity: { value: { min: 0.6, max: 1 } },
      size: { value: { min: 3, max: 6 } },
      move: { enable: true, speed: { min: 2, max: 5 }, direction: 'bottom', outModes: { default: 'out' }, gravity: { enable: true, acceleration: 3 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 30 } },
      tilt: { enable: true, value: { min: 0, max: 360 }, animation: { enable: true, speed: 30 } },
    },
  },
  starfield: {
    particles: {
      number: { value: 100 },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.1, max: 0.8 }, animation: { enable: true, speed: 1, sync: false } },
      size: { value: { min: 0.5, max: 2 } },
      move: { enable: true, speed: { min: 0.1, max: 0.5 }, direction: 'none', outModes: { default: 'out' } },
    },
  },
  fire: {
    particles: {
      number: { value: 30 },
      color: { value: ['#FF4E00', '#FF8C00', '#FFD700', '#FF0000'] },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.3, max: 0.8 }, animation: { enable: true, speed: 2, sync: false, startValue: 'max', destroy: 'min' } },
      size: { value: { min: 2, max: 6 }, animation: { enable: true, speed: 3, sync: false, startValue: 'max', destroy: 'min' } },
      move: { enable: true, speed: { min: 1, max: 3 }, direction: 'top', outModes: { default: 'destroy' } },
      life: { duration: { value: { min: 1, max: 3 } } },
    },
    emitters: { position: { x: 50, y: 100 }, rate: { quantity: 3, delay: 0.15 }, size: { width: 80, height: 0 } },
  },
  fireworks: {
    particles: {
      number: { value: 0 },
      color: { value: ['#FF4E00', '#00FFCC', '#EAB308', '#FF00FF', '#3B82F6', '#ffffff'] },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.3, max: 1 }, animation: { enable: true, speed: 1, sync: false, startValue: 'max', destroy: 'min' } },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: { min: 5, max: 15 }, direction: 'none', outModes: { default: 'destroy' }, gravity: { enable: true, acceleration: 5 } },
      life: { duration: { value: { min: 0.5, max: 1.5 } }, count: 1 },
    },
    emitters: { position: { x: 50, y: 50 }, rate: { quantity: 15, delay: 1.5 }, life: { count: 0 }, size: { width: 0, height: 0 } },
  },
  bubbles: {
    particles: {
      number: { value: 20 },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.05, max: 0.2 } },
      size: { value: { min: 5, max: 30 } },
      move: { enable: true, speed: { min: 0.3, max: 1 }, direction: 'top', outModes: { default: 'out' } },
      stroke: { width: 1, color: '#ffffff', opacity: 0.3 },
    },
  },
};

let engineReady = false;

export default function ParticleOverlay({ effect }: { effect: ParticleEffect }) {
  const [ready, setReady] = useState(engineReady);

  useEffect(() => {
    if (engineReady) { setReady(true); return; }
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      engineReady = true;
      setReady(true);
    });
  }, []);

  const options = useMemo(() => ({
    ...effectConfigs[effect],
    fullScreen: { enable: false },
    detectRetina: true,
    fpsLimit: 60,
  }), [effect]);

  if (!ready) return null;

  return (
    <Particles
      id={`particles-${effect}`}
      options={options as ISourceOptions}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
}
