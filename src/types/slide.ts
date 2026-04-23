export type SlideLayout =
  | 'title-overlay' | 'split-image' | 'icon-grid' | 'stats-callout'
  | 'quote' | 'chart' | 'svg-diagram' | 'image-collage'
  | 'whiteboard' | 'html-scene' | 'canvas-free'
  | 'kinetic-text' | 'code-walkthrough' | 'comparison' | 'timeline-flow';

export type AnimationPreset =
  | 'fadeUp' | 'fadeDown' | 'fadeIn' | 'blurReveal' | 'scaleIn' | 'zoomIn'
  | 'slideLeft' | 'slideRight' | 'rotateIn' | 'bounceIn'
  | 'typewriter' | 'splitChars' | 'splitWords'
  | 'countUp' | 'drawOn' | 'staggerCards';

export type ParticleEffect = 'snow' | 'rain' | 'confetti' | 'starfield' | 'fire' | 'fireworks' | 'bubbles';

export interface SlideAnimation {
  target: string;
  preset: AnimationPreset;
  at: number;
  duration?: number;
  params?: Record<string, unknown>;
}

export interface DrawStep {
  type: 'shape' | 'freehand' | 'path' | 'text' | 'pointer';
  at: number;
  duration: number;
  params: Record<string, unknown>;
}

export interface FreeElement {
  type: 'text' | 'image' | 'shape' | 'icon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  style?: Record<string, string>;
  content: string;
  animation?: AnimationPreset;
  animationAt?: number;
}

export interface Slide {
  layout: SlideLayout;
  theme?: {
    bg: string;
    text: string;
    accent: string;
    font: 'inter' | 'playfair' | 'space' | 'jetbrains' | 'outfit';
    align: 'left' | 'center' | 'right';
  };
  title: string;
  subtitle?: string;
  content?: string[];
  imageKeyword?: string;
  imageKeywords?: string[];
  iconifyNames?: string[];
  stats?: { value: string; label: string }[];
  script?: string;

  // Legacy chart fields (backward compat)
  chartData?: { name: string; value: number }[];
  chartType?: 'bar' | 'line' | 'pie';

  // ECharts — AI outputs full option JSON
  echartsOption?: Record<string, unknown>;

  svgCode?: string;

  // Per-element animation timeline
  animations?: SlideAnimation[];

  // Whiteboard drawing steps
  drawSteps?: DrawStep[];

  // HTML scene (raw HTML/CSS/JS)
  htmlScene?: string;

  // Particle effect overlay
  particleEffect?: ParticleEffect;

  // Freeform positioned elements
  elements?: FreeElement[];

  // Code walkthrough
  code?: string;
  language?: string;
  highlightLines?: number[];

  // Comparison layout
  leftColumn?: { title: string; items: string[] };
  rightColumn?: { title: string; items: string[] };

  // Timeline flow
  timelineSteps?: { year: string; title: string; description: string }[];
}
