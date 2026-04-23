import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export interface PresetConfig {
  from: gsap.TweenVars;
  to?: gsap.TweenVars;
  duration: number;
  ease: string;
  stagger?: number | gsap.StaggerVars;
  /** If true, uses SplitText to split into chars/words before animating */
  split?: 'chars' | 'words' | 'lines';
  /** If true, animates textContent as a counter */
  counter?: boolean;
}

const presets: Record<string, PresetConfig> = {
  fadeUp: {
    from: { opacity: 0, y: 40 },
    duration: 0.7,
    ease: 'power3.out',
  },
  fadeDown: {
    from: { opacity: 0, y: -40 },
    duration: 0.7,
    ease: 'power3.out',
  },
  fadeIn: {
    from: { opacity: 0 },
    duration: 0.6,
    ease: 'power2.out',
  },
  blurReveal: {
    from: { opacity: 0, filter: 'blur(12px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    duration: 0.8,
    ease: 'power2.out',
  },
  scaleIn: {
    from: { opacity: 0, scale: 0.85 },
    duration: 0.6,
    ease: 'back.out(1.4)',
  },
  zoomIn: {
    from: { opacity: 0, scale: 0.5 },
    duration: 0.8,
    ease: 'power3.out',
  },
  slideLeft: {
    from: { opacity: 0, x: 80 },
    duration: 0.7,
    ease: 'power3.out',
  },
  slideRight: {
    from: { opacity: 0, x: -80 },
    duration: 0.7,
    ease: 'power3.out',
  },
  rotateIn: {
    from: { opacity: 0, rotation: -15, scale: 0.9 },
    duration: 0.7,
    ease: 'power3.out',
  },
  bounceIn: {
    from: { opacity: 0, scale: 0.3 },
    duration: 0.8,
    ease: 'elastic.out(1, 0.5)',
  },
  splitChars: {
    from: { opacity: 0, y: 60, rotateX: -40 },
    duration: 0.5,
    ease: 'back.out(1.7)',
    stagger: 0.025,
    split: 'chars',
  },
  splitWords: {
    from: { opacity: 0, y: 30 },
    duration: 0.5,
    ease: 'power3.out',
    stagger: 0.08,
    split: 'words',
  },
  typewriter: {
    from: { opacity: 0 },
    duration: 0.03,
    ease: 'none',
    stagger: 0.04,
    split: 'chars',
  },
  countUp: {
    from: { textContent: 0 },
    duration: 1.5,
    ease: 'power1.in',
    counter: true,
  },
  drawOn: {
    from: { strokeDashoffset: 1000, strokeDasharray: 1000 },
    to: { strokeDashoffset: 0 },
    duration: 1.5,
    ease: 'power2.inOut',
  },
  staggerCards: {
    from: { opacity: 0, y: 30, scale: 0.95 },
    duration: 0.5,
    ease: 'power3.out',
    stagger: 0.12,
  },
};

/**
 * Apply an animation preset to a GSAP timeline.
 * Returns any SplitText instances created (for cleanup).
 */
export function applyPreset(
  tl: gsap.core.Timeline,
  target: gsap.TweenTarget,
  presetName: string,
  position?: gsap.Position,
  overrides?: Partial<PresetConfig>,
): SplitText | null {
  const preset = presets[presetName];
  if (!preset) {
    // Fallback to fadeUp
    tl.from(target, { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' }, position);
    return null;
  }

  const config = { ...preset, ...overrides };
  let splitInstance: SplitText | null = null;
  let animTarget: gsap.TweenTarget = target;

  // Handle SplitText presets
  if (config.split && typeof target === 'string' || (target instanceof Element)) {
    try {
      splitInstance = new SplitText(target as Element | string, { type: config.split });
      animTarget = config.split === 'chars' ? splitInstance.chars
        : config.split === 'words' ? splitInstance.words
        : splitInstance.lines;
    } catch {
      animTarget = target;
    }
  }

  // Handle counter preset
  if (config.counter) {
    const vars: gsap.TweenVars = {
      ...config.from,
      duration: config.duration,
      ease: config.ease,
      snap: { textContent: 1 },
    };
    if (config.stagger) vars.stagger = config.stagger;
    tl.from(animTarget, vars, position);
    return splitInstance;
  }

  // Handle from/to vs from-only
  const vars: gsap.TweenVars = {
    ...config.from,
    duration: config.duration,
    ease: config.ease,
  };
  if (config.stagger) vars.stagger = config.stagger;

  if (config.to) {
    tl.fromTo(animTarget, config.from, { ...config.to, duration: config.duration, ease: config.ease, stagger: config.stagger }, position);
  } else {
    tl.from(animTarget, vars, position);
  }

  return splitInstance;
}

export { presets };
export default presets;
