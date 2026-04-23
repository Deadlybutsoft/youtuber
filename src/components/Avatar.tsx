'use client';
import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

interface AvatarProps {
  isSpeaking: boolean;
  isVisible: boolean;
}

export default function Avatar({ isSpeaking, isVisible }: AvatarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const idleCtx = useRef<gsap.Context | null>(null);
  const speakTl = useRef<gsap.core.Timeline | null>(null);
  const gestureTl = useRef<gsap.core.Timeline | null>(null);

  // Idle animations: breathing, blinking, subtle sway
  useEffect(() => {
    if (!svgRef.current || !isVisible) return;
    idleCtx.current = gsap.context(() => {
      // Breathing — torso subtle scale
      gsap.to('.av-torso', { scaleY: 1.015, transformOrigin: 'center bottom', duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      // Shoulder sway
      gsap.to('.av-body', { rotation: 0.5, transformOrigin: 'center bottom', duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      // Blinking — periodic eye close
      const blink = () => {
        gsap.to('.av-eyelid', { scaleY: 1, duration: 0.1, yoyo: true, repeat: 1, onComplete: () => {
          gsap.delayedCall(2 + Math.random() * 4, blink);
        }});
      };
      gsap.delayedCall(2, blink);
      // Pupil drift
      gsap.to('.av-pupil', { x: 1.5, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      // Idle hand sway
      gsap.to('.av-arm-l', { rotation: 2, transformOrigin: 'top center', duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.av-arm-r', { rotation: -2, transformOrigin: 'top center', duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }, svgRef);
    return () => { idleCtx.current?.revert(); };
  }, [isVisible]);

  // Speaking — mouth animation
  useEffect(() => {
    if (!svgRef.current) return;
    if (isSpeaking) {
      speakTl.current = gsap.timeline({ repeat: -1 });
      speakTl.current
        .to('.av-mouth-open', { scaleY: 1, duration: 0.12, ease: 'power2.out' })
        .to('.av-mouth-open', { scaleY: 0.3, duration: 0.1, ease: 'power2.in' })
        .to('.av-mouth-open', { scaleY: 0.8, duration: 0.15, ease: 'power2.out' })
        .to('.av-mouth-open', { scaleY: 0.1, duration: 0.08, ease: 'power2.in' });
      // Gesture — hand moves while speaking
      gestureTl.current = gsap.timeline({ repeat: -1, yoyo: true });
      gestureTl.current
        .to('.av-arm-r', { rotation: -12, duration: 0.8, ease: 'power2.inOut' })
        .to('.av-arm-r', { rotation: 5, duration: 0.6, ease: 'power2.inOut' })
        .to('.av-arm-r', { rotation: -8, duration: 0.7, ease: 'power2.inOut' });
      // Eyebrow raise while talking
      gsap.to('.av-brow', { y: -1.5, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    } else {
      speakTl.current?.kill();
      gestureTl.current?.kill();
      gsap.to('.av-mouth-open', { scaleY: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to('.av-arm-r', { rotation: 0, duration: 0.5, ease: 'power2.out' });
      gsap.to('.av-brow', { y: 0, duration: 0.3 });
    }
    return () => { speakTl.current?.kill(); gestureTl.current?.kill(); };
  }, [isSpeaking]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-24 sm:bottom-20 right-2 sm:right-4 md:right-6 z-40 pointer-events-none">
      <svg
        ref={svgRef}
        viewBox="0 0 120 200"
        className="w-[60px] h-[100px] sm:w-[80px] sm:h-[130px] md:w-[100px] md:h-[165px] drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
      >
        <g className="av-body">
          {/* Legs */}
          <rect className="av-leg-l" x="42" y="165" width="14" height="30" rx="7" fill="#2d2d2d" />
          <rect className="av-leg-r" x="64" y="165" width="14" height="30" rx="7" fill="#2d2d2d" />
          {/* Shoes */}
          <ellipse cx="49" cy="195" rx="10" ry="5" fill="#1a1a1a" />
          <ellipse cx="71" cy="195" rx="10" ry="5" fill="#1a1a1a" />

          {/* Torso */}
          <g className="av-torso">
            <path d="M38 110 Q38 100 48 95 L72 95 Q82 100 82 110 L82 168 Q82 172 78 172 L42 172 Q38 172 38 168 Z" fill="#FF4E00" />
            {/* Collar / neckline */}
            <path d="M52 95 L60 105 L68 95" fill="none" stroke="#e0430a" strokeWidth="2" />
          </g>

          {/* Left arm */}
          <g className="av-arm-l">
            <rect x="22" y="100" width="16" height="45" rx="8" fill="#FF4E00" />
            {/* Hand */}
            <circle cx="30" cy="148" r="8" fill="#f4c49c" />
            {/* Fingers */}
            <circle cx="25" cy="153" r="3" fill="#f4c49c" />
            <circle cx="30" cy="155" r="3" fill="#f4c49c" />
            <circle cx="35" cy="153" r="3" fill="#f4c49c" />
          </g>

          {/* Right arm */}
          <g className="av-arm-r">
            <rect x="82" y="100" width="16" height="45" rx="8" fill="#FF4E00" />
            {/* Hand */}
            <circle cx="90" cy="148" r="8" fill="#f4c49c" />
            {/* Fingers */}
            <circle cx="85" cy="153" r="3" fill="#f4c49c" />
            <circle cx="90" cy="155" r="3" fill="#f4c49c" />
            <circle cx="95" cy="153" r="3" fill="#f4c49c" />
          </g>

          {/* Neck */}
          <rect x="53" y="82" width="14" height="16" rx="5" fill="#f4c49c" />

          {/* Head */}
          <g className="av-head">
            {/* Face shape */}
            <ellipse cx="60" cy="55" rx="30" ry="35" fill="#f4c49c" />
            {/* Hair */}
            <path d="M30 45 Q30 15 60 12 Q90 15 90 45 Q88 30 60 28 Q32 30 30 45Z" fill="#2d2d2d" />
            {/* Hair side tufts */}
            <path d="M30 45 Q25 35 28 50" fill="#2d2d2d" />
            <path d="M90 45 Q95 35 92 50" fill="#2d2d2d" />

            {/* Ears */}
            <ellipse cx="30" cy="55" rx="5" ry="7" fill="#e8b48c" />
            <ellipse cx="90" cy="55" rx="5" ry="7" fill="#e8b48c" />

            {/* Eyebrows */}
            <g className="av-brow">
              <rect x="40" y="40" width="14" height="3" rx="1.5" fill="#2d2d2d" />
              <rect x="66" y="40" width="14" height="3" rx="1.5" fill="#2d2d2d" />
            </g>

            {/* Eyes */}
            <g className="av-eyes">
              {/* Left eye white */}
              <ellipse cx="47" cy="52" rx="8" ry="6" fill="white" />
              {/* Right eye white */}
              <ellipse cx="73" cy="52" rx="8" ry="6" fill="white" />
              {/* Pupils */}
              <circle className="av-pupil" cx="48" cy="53" r="3.5" fill="#2d2d2d" />
              <circle className="av-pupil" cx="74" cy="53" r="3.5" fill="#2d2d2d" />
              {/* Pupil highlights */}
              <circle cx="49.5" cy="51.5" r="1.2" fill="white" />
              <circle cx="75.5" cy="51.5" r="1.2" fill="white" />
              {/* Eyelids (for blinking) */}
              <ellipse className="av-eyelid" cx="47" cy="49" rx="8.5" ry="0" fill="#f4c49c" />
              <ellipse className="av-eyelid" cx="73" cy="49" rx="8.5" ry="0" fill="#f4c49c" />
            </g>

            {/* Nose */}
            <ellipse cx="60" cy="62" rx="3" ry="2.5" fill="#e8b48c" />

            {/* Mouth — closed line */}
            <path d="M50 72 Q60 76 70 72" fill="none" stroke="#c47a5a" strokeWidth="1.5" strokeLinecap="round" />
            {/* Mouth — open (animated, starts hidden) */}
            <ellipse className="av-mouth-open" cx="60" cy="73" rx="8" ry="5" fill="#8B2500" style={{ transformOrigin: '60px 73px', transform: 'scaleY(0)' }} />
            {/* Teeth hint when mouth open */}
            <rect x="54" y="70" width="12" height="3" rx="1" fill="white" opacity="0.7" style={{ transformOrigin: '60px 73px' }} className="av-mouth-open" />
          </g>
        </g>
      </svg>
    </div>
  );
}
