import { useState, useEffect } from 'react';
import './NekoSprite.css';

export type NekoMood = 'idle' | 'walk' | 'eat' | 'happy' | 'sad' | 'sleep';

export interface AnimeNekoColors {
  primary: string;
  secondary: string;
  belly: string;
  blush: string;
  outline: string;
  stripe?: string;
  patch?: string;
}

// ── Mochi/Egg Cat Color Palettes ─────────────────────────────────
const PALETTES: Record<string, AnimeNekoColors> = {
  calico: {
    primary: '#fffaf0',
    secondary: '#ffb7c5',
    belly: '#ffffff',
    blush: 'rgba(255,105,180,0.5)',
    outline: '#5d4037',
    stripe: '#f4a460', // orange stripes
    patch: '#333333',
  },
  black: {
    primary: '#474752',
    secondary: '#25252b',
    belly: '#e5e5eb',
    blush: 'rgba(255,105,180,0.3)',
    outline: '#1a1a1f',
    stripe: '#2d2d36',
  },
  samurai: {
    primary: '#c48f65', // orange/brown like in the image
    secondary: '#e5b796',
    belly: '#fdf1e4',
    blush: 'rgba(244,67,54,0.4)',
    outline: '#5c3a21',
    stripe: '#e07a3c',
  },
  matcha: {
    primary: '#c0d9a6',
    secondary: '#9ebf80',
    belly: '#e9f5dd',
    blush: 'rgba(255,105,180,0.4)',
    outline: '#385c2b',
    stripe: '#94b375',
  },
  neko_shikansen: {
    primary: '#c4e7f5',
    secondary: '#95cae4',
    belly: '#ffffff',
    blush: 'rgba(255,105,180,0.4)',
    outline: '#2b5773',
    stripe: '#8bbdd9',
  },
  sakura_princess: {
    primary: '#f4b8c9',
    secondary: '#e592a9',
    belly: '#fcecf1',
    blush: 'rgba(255,64,129,0.5)',
    outline: '#7a2941',
    stripe: '#e384a1',
  },
};

interface Props {
  catId: string;
  mood?: NekoMood;
  size?: number;
  showShadow?: boolean;
  label?: string;
}

export default function NekoSprite({ catId, mood = 'idle', size = 120, showShadow = true, label }: Props) {
  const pal = PALETTES[catId] || PALETTES['calico'];
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (mood !== 'idle' && mood !== 'walk') return;
    const blinkSequence = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      if (Math.random() < 0.2) {
        setTimeout(() => {
          setBlinking(true);
          setTimeout(() => setBlinking(false), 150);
        }, 250);
      }
    };
    
    const id = setInterval(() => {
      if (Math.random() < 0.4) blinkSequence();
    }, 3000);
    return () => clearInterval(id);
  }, [mood]);

  const scale = size / 100;

  return (
    <div className="mochi-neko-wrap" style={{ transform: `scale(${scale})` }}>
      <div className={`mochi-neko-scene mood-${mood}`}>
        
        {/* Tail */}
        <div className="egg-tail" style={{ backgroundColor: pal.primary, borderColor: pal.outline }} />

        {/* Ears */}
        <div className="egg-ear ear-left" style={{ backgroundColor: pal.primary, borderColor: pal.outline }}>
          <div className="egg-ear-inner" style={{ backgroundColor: pal.secondary }} />
        </div>
        <div className="egg-ear ear-right" style={{ backgroundColor: pal.primary, borderColor: pal.outline }}>
          <div className="egg-ear-inner" style={{ backgroundColor: pal.secondary }} />
        </div>

        {/* Body (Egg/Round shape) */}
        <div className="egg-body" style={{ backgroundColor: pal.primary, borderColor: pal.outline }}>
          
          {/* Stripes Top */}
          <div className="egg-stripes-top">
            <div className="stripe st1" style={{ backgroundColor: pal.stripe || pal.outline }} />
            <div className="stripe st2" style={{ backgroundColor: pal.stripe || pal.outline }} />
            <div className="stripe st3" style={{ backgroundColor: pal.stripe || pal.outline }} />
          </div>

          {/* Stripes Side Left */}
          <div className="egg-stripes-side side-l">
            <div className="stripe sl1" style={{ backgroundColor: pal.stripe || pal.outline }} />
            <div className="stripe sl2" style={{ backgroundColor: pal.stripe || pal.outline }} />
            <div className="stripe sl3" style={{ backgroundColor: pal.stripe || pal.outline }} />
          </div>

          {/* Stripes Side Right */}
          <div className="egg-stripes-side side-r">
            <div className="stripe sr1" style={{ backgroundColor: pal.stripe || pal.outline }} />
            <div className="stripe sr2" style={{ backgroundColor: pal.stripe || pal.outline }} />
            <div className="stripe sr3" style={{ backgroundColor: pal.stripe || pal.outline }} />
          </div>
          
          {/* Belly */}
          <div className="egg-belly" style={{ backgroundColor: pal.belly }} />

          {/* Face */}
          <div className="egg-face">
            {/* Blush */}
            <div className="egg-blush blush-l" style={{ backgroundColor: pal.blush }} />
            <div className="egg-blush blush-r" style={{ backgroundColor: pal.blush }} />

            {/* Eyes */}
            <div className="egg-eyes">
              {mood === 'happy' || mood === 'eat' ? (
                <>
                  <div className="egg-eye-happy" style={{ borderColor: pal.outline }} />
                  <div className="egg-eye-happy" style={{ borderColor: pal.outline }} />
                </>
              ) : mood === 'sad' || mood === 'sleep' ? (
                <>
                  <div className="egg-eye-sad" style={{ borderColor: pal.outline }} />
                  <div className="egg-eye-sad" style={{ borderColor: pal.outline }} />
                </>
              ) : (
                <>
                  <div className={`egg-eye ${blinking ? 'blink' : ''}`} style={{ backgroundColor: pal.outline }} />
                  <div className={`egg-eye ${blinking ? 'blink' : ''}`} style={{ backgroundColor: pal.outline }} />
                </>
              )}
            </div>

            {/* Mouth */}
            <div className="egg-mouth">
              {mood === 'sad' ? (
                <svg width="10" height="5" viewBox="0 0 10 5" fill="none" stroke={pal.outline} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 4 Q 5 1 9 4" />
                </svg>
              ) : mood === 'sleep' ? (
                <div className="egg-mouth-sleep" style={{ backgroundColor: pal.outline }} />
              ) : (
                <svg width="10" height="5" viewBox="0 0 10 5" fill="none" stroke={pal.outline} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1 Q 2.5 4 5 1 Q 7.5 4 9 1" />
                </svg>
              )}
            </div>
            
          </div>
          
          {/* Paws */}
          <div className="egg-paws">
            <div className="egg-paw paw-l" style={{ backgroundColor: pal.primary, borderColor: pal.outline }}>
              {/* Optional paw lines */}
              <div className="paw-line pl1" style={{ backgroundColor: pal.outline }} />
              <div className="paw-line pl2" style={{ backgroundColor: pal.outline }} />
            </div>
            <div className="egg-paw paw-r" style={{ backgroundColor: pal.primary, borderColor: pal.outline }}>
              <div className="paw-line pl1" style={{ backgroundColor: pal.outline }} />
              <div className="paw-line pl2" style={{ backgroundColor: pal.outline }} />
            </div>
          </div>
        </div>

        {/* ===== FX ===== */}
        {mood === 'happy' && (
          <div className="egg-fx-sparkles">
            <div className="sparkle s1">✨</div>
            <div className="sparkle s2">🌸</div>
            <div className="sparkle s3">✨</div>
          </div>
        )}
        
        {mood === 'eat' && (
          <div className="egg-fx-food">
            <div className="bite-fish">🐟</div>
            <div className="bite-stars">⭐</div>
          </div>
        )}

        {mood === 'sad' && (
          <div className="egg-fx-cry">
            <div className="tear ts-l" style={{ backgroundColor: '#81d4fa' }} />
            <div className="tear ts-r" style={{ backgroundColor: '#81d4fa' }} />
            <div className="gloom-lines">|||</div>
          </div>
        )}

        {mood === 'sleep' && (
          <div className="egg-fx-sleep">
            <div className="snot-bubble" style={{ borderColor: pal.outline }} />
            <div className="zzz-text">zZ</div>
          </div>
        )}
      </div>

      {showShadow && <div className="egg-shadow" />}
      {label && <div className="egg-label" style={{ color: pal.outline, borderColor: pal.outline }}>{label}</div>}
    </div>
  );
}
