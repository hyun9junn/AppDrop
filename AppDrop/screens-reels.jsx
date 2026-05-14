// screens-reels.jsx — 5 creatively distinct reel formats

function ReelsScreen({ go, initialAppId }) {
  const { APPS, CREATORS } = window.AppDropData;
  const containerRef = useRef(null);
  const startIdx = Math.max(0, APPS.findIndex(a => a.id === initialAppId));
  const [idx, setIdx] = useState(startIdx);
  const [progress, setProgress] = useState(0); // 0..1 within current

  // auto-advance progress
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 0.012;
        if (next >= 1) {
          setIdx(i => (i + 1) % APPS.length);
          return 0;
        }
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [idx]);

  function jump(delta) {
    setIdx(i => (i + delta + APPS.length) % APPS.length);
  }

  const app = APPS[idx];

  // Distinct reel format per app
  const Format = {
    paper:     PaperTransformReel,
    explosion: ImageExplosionReel,
    waveform:  VoiceWaveformReel,
    stickies:  StitchReel,
    speedrun:  SpeedrunReel,
  }[app.reelStyle] || PaperTransformReel;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#000',
      overflow: 'hidden', color: '#fff',
    }}>
      {/* Reel content (animation key forces remount/restart) */}
      <div key={app.id} style={{ position: 'absolute', inset: 0 }}>
        <Format app={app} progress={progress} />
      </div>

      {/* Top: progress bars + close */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 16px 0', zIndex: 30,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {APPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 2, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: '#fff',
                width: i < idx ? '100%' : i === idx ? `${progress * 100}%` : '0%',
                transition: i === idx ? 'none' : 'width .2s',
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5, whiteSpace: 'nowrap' }}>
            REEL {String(idx + 1).padStart(2, '0')} / {String(APPS.length).padStart(2, '0')}
          </div>
          <button onClick={() => go('discover')} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}><I.close size={14} stroke="#fff" /></button>
        </div>
      </div>

      {/* Tap zones for prev/next */}
      <button aria-label="prev" onClick={() => jump(-1)} style={{
        position: 'absolute', left: 0, top: 80, bottom: 200, width: '30%', zIndex: 10, background: 'transparent',
      }} />
      <button aria-label="next" onClick={() => jump(1)} style={{
        position: 'absolute', right: 0, top: 80, bottom: 200, width: '30%', zIndex: 10, background: 'transparent',
      }} />

      {/* Bottom shared drawer */}
      <ReelDrawer app={app} go={go} />
    </div>
  );
}

// ── Shared bottom drawer used across all reels ────────────────────
function ReelDrawer({ app, go }) {
  const creator = window.AppDropData.CREATORS.find(c => c.id === app.creatorId);
  const [boosted, setBoosted] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '60px 16px 22px', zIndex: 20,
      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.88) 100%)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar creator={creator} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {creator.name} <span style={{ color: '#FFB68A', fontSize: 10.5, fontFamily: 'var(--mono)', letterSpacing: 1 }}>✓ VERIFIED</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{app.category} · {app.pricing} · {app.boosts.toLocaleString()} boosts</div>
        </div>
        <GhostButton small style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>Follow</GhostButton>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.2, color: '#fff', letterSpacing: -.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {app.title}
          <span style={{ color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', fontSize: 16, marginLeft: 6 }}>
            — {app.tagline.toLowerCase()}.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button style={{
          flex: 1, padding: '13px', borderRadius: 999,
          background: '#fff', color: '#1A1815', fontWeight: 600, fontSize: 14,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>Try {app.title} <I.arrow size={14} stroke="#1A1815" /></button>
        <button onClick={() => setBoosted(b => !b)} style={{
          width: 46, height: 46, borderRadius: '50%',
          background: boosted ? 'var(--coral)' : 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.bolt size={16} stroke="#fff" /></button>
        <button onClick={() => setSaved(s => !s)} style={{
          width: 46, height: 46, borderRadius: '50%',
          background: saved ? '#fff' : 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.bookmark size={15} stroke={saved ? '#1A1815' : '#fff'} fill={saved ? '#1A1815' : 'none'} /></button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 1: PAPER TRANSFORM — ResumeAI
// Before / After CV with keyword highlights stamping in
// ═════════════════════════════════════════════════════════════════
function PaperTransformReel({ app, progress }) {
  const swap = progress > 0.45;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(160deg, #2A1F14 0%, #1A1208 100%)',
      overflow: 'hidden',
    }}>
      {/* paper grain overlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.35,
        background: 'radial-gradient(80% 60% at 50% 30%, rgba(255,200,140,0.25), transparent 60%)',
      }} />

      {/* Eyebrow line */}
      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow color="rgba(255,255,255,0.5)" style={{ letterSpacing: 2.5 }}>The problem</Eyebrow>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 27, lineHeight: 1.15, marginTop: 4, padding: '0 36px',
          color: '#fff', fontStyle: 'italic',
        }}>
          One resume can't speak to <span style={{ color: '#FFB68A', fontStyle: 'normal' }}>every</span> job.
        </div>
      </div>

      {/* Two CV sheets */}
      <div style={{ position: 'absolute', top: '32%', left: 0, right: 0, height: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* BEFORE */}
        <div style={{
          width: 130, height: 178, borderRadius: 6,
          background: '#FBF5EA', boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
          transform: swap ? 'translateX(-90px) rotate(-14deg) scale(.92)' : 'translateX(-32px) rotate(-7deg)',
          transition: 'transform .9s cubic-bezier(.6,.2,.2,1)',
          padding: 10, position: 'relative',
        }}>
          <PaperLines />
          <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'var(--mono)', fontSize: 8, color: '#998870', letterSpacing: 1 }}>BEFORE</div>
        </div>
        {/* AFTER */}
        <div style={{
          width: 130, height: 178, borderRadius: 6,
          background: '#fff', boxShadow: '0 10px 28px rgba(255,90,44,0.35), 0 20px 40px rgba(0,0,0,0.5)',
          transform: swap ? 'translateX(32px) rotate(6deg) scale(1.05)' : 'translateX(90px) rotate(15deg) scale(.92)',
          transition: 'transform .9s cubic-bezier(.6,.2,.2,1)',
          padding: 10, position: 'relative',
        }}>
          <PaperLines highlighted />
          <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'var(--mono)', fontSize: 8, color: '#FF5A2C', letterSpacing: 1 }}>AFTER · 47s</div>
          {/* coral stamp */}
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            padding: '2px 6px', borderRadius: 3, background: '#FF5A2C', color: '#fff',
            fontFamily: 'var(--mono)', fontSize: 7, letterSpacing: 1,
            opacity: swap ? 1 : 0, transition: 'opacity .4s .4s',
            transform: 'rotate(-4deg)',
          }}>MATCHED ✓</div>
        </div>
      </div>

      {/* center arrow between papers when swapped */}
      <div style={{
        position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%, -50%)',
        opacity: swap ? 1 : 0, transition: 'opacity .4s .2s', zIndex: 4,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FF5A2C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 6px rgba(255,90,44,0.2), 0 8px 18px rgba(255,90,44,0.4)',
        }}>
          <I.arrow size={18} stroke="#fff" />
        </div>
      </div>

      {/* Solution line */}
      <div style={{
        position: 'absolute', top: 168, left: 24, right: 24, textAlign: 'center', zIndex: 5,
        opacity: swap ? 1 : 0, transform: swap ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity .4s .5s, transform .4s .5s',
      }}>
        <Eyebrow color="#FF5A2C">The fix — 47 seconds</Eyebrow>
      </div>
    </div>
  );
}

function PaperLines({ highlighted = false }) {
  return (
    <div style={{ marginTop: 16 }}>
      {/* "name + header" */}
      <div style={{ height: 7, width: '60%', background: '#1A1815', borderRadius: 1, marginBottom: 4 }} />
      <div style={{ height: 4, width: '40%', background: '#6E665C', borderRadius: 1, marginBottom: 10 }} />
      {/* body lines, some highlighted */}
      {Array.from({ length: 14 }).map((_, i) => {
        const hl = highlighted && [2, 5, 8, 11].includes(i);
        return (
          <div key={i} style={{
            height: 3.5, marginBottom: 4,
            width: `${50 + (i * 37) % 50}%`,
            background: hl ? '#FF5A2C' : '#CFC4AE',
            borderRadius: 1,
            boxShadow: hl ? '0 0 0 1px rgba(255,90,44,0.15)' : 'none',
          }} />
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 2: IMAGE EXPLOSION — PixelDrop
// One hero image fans out into many platform-sized variants
// ═════════════════════════════════════════════════════════════════
function ImageExplosionReel({ app, progress }) {
  const exploded = progress > 0.35;
  const variants = [
    { label: 'INSTAGRAM',  w: 56, h: 56, dx: -90, dy: -110, rot: -8 },
    { label: 'STORY',      w: 38, h: 68, dx:  92, dy: -114, rot: 6 },
    { label: 'TWITTER',    w: 88, h: 49, dx: -100, dy:  44, rot: -3 },
    { label: 'LINKEDIN',   w: 78, h: 42, dx: 100, dy:  44, rot: 8 },
    { label: 'PINTEREST',  w: 38, h: 56, dx: -64, dy: 130, rot: -4 },
    { label: 'SHOPIFY',    w: 60, h: 60, dx:  58, dy: 130, rot: 4 },
    { label: 'YOUTUBE',    w: 80, h: 44, dx:  0,  dy: -178, rot: 0 },
    { label: 'TIKTOK',     w: 36, h: 64, dx: -150, dy:  -10, rot: -12 },
    { label: 'EMAIL HDR',  w: 88, h: 36, dx:  140, dy:  -8, rot: 10 },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(120% 80% at 50% 40%, #1A2A3A 0%, #050B14 70%)',
      overflow: 'hidden',
    }}>
      {/* dotted grid background */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: .25,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }} />

      {/* Top label */}
      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow color="rgba(255,255,255,0.5)" style={{ letterSpacing: 2.5 }}>One upload</Eyebrow>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1.1, marginTop: 4, color: '#fff', letterSpacing: -.4 }}>
          1 photo → <span style={{ fontStyle: 'italic', color: '#7FE7C4' }}>9 sizes</span>
        </div>
      </div>

      {/* Center hero image */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${exploded ? 0.85 : 1})`,
        transition: 'transform 1s cubic-bezier(.6,.2,.2,1)',
        width: 124, height: 124, borderRadius: 14,
        background: 'linear-gradient(135deg, #FF8A5C 0%, #C7390F 50%, #5B1B0C 100%)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        {/* fake product silhouette */}
        <div style={{
          position: 'absolute', inset: 14, borderRadius: 8,
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 60%)',
        }} />
        <div style={{ position: 'absolute', bottom: 6, left: 8, fontFamily: 'var(--mono)', fontSize: 7, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 }}>HERO.JPG · 4096px</div>
      </div>

      {/* Variant tiles flying outward */}
      {variants.map((v, i) => (
        <div key={v.label} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: v.w, height: v.h, borderRadius: 6,
          background: 'linear-gradient(135deg, #FF8A5C 0%, #C7390F 60%, #5B1B0C 100%)',
          boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
          transform: exploded
            ? `translate(calc(-50% + ${v.dx}px), calc(-50% + ${v.dy}px)) rotate(${v.rot}deg)`
            : `translate(-50%, -50%) scale(0.6) rotate(0deg)`,
          opacity: exploded ? 1 : 0,
          transition: `transform .9s cubic-bezier(.4,.6,.2,1) ${i * 0.05}s, opacity .4s ${i * 0.05}s`,
        }}>
          <div style={{ position: 'absolute', inset: 4, borderRadius: 3, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 60%)' }} />
          <div style={{
            position: 'absolute', bottom: -14, left: 0, right: 0, textAlign: 'center',
            fontFamily: 'var(--mono)', fontSize: 7, color: 'rgba(255,255,255,0.7)', letterSpacing: 1,
          }}>{v.label}</div>
        </div>
      ))}

      {/* Bottom solution */}
      <div style={{
        position: 'absolute', top: 168, left: 24, right: 24, textAlign: 'center', zIndex: 5,
      }}>
        <Eyebrow color="#7FE7C4">9 platforms · one click · bg removed</Eyebrow>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 3: VOICE WAVEFORM — VoiceNote Pro
// Animated waveform → live transcription → highlighted action items
// ═════════════════════════════════════════════════════════════════
function VoiceWaveformReel({ app, progress }) {
  const lines = [
    { text: 'So idea for next week —', delay: 0 },
    { text: 'we should ship the integrations page first,', delay: 0.18 },
    { text: 'then loop back with Hailee about pricing.', delay: 0.34 },
    { text: 'Oh, and remind me to email the analytics team.', delay: 0.5 },
  ];
  const visible = lines.filter(l => progress > l.delay);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #1A3D2F 0%, #0E2A20 100%)',
      overflow: 'hidden',
    }}>
      {/* soft glow */}
      <div aria-hidden style={{
        position: 'absolute', top: -100, left: -100, right: -100, height: 320,
        background: 'radial-gradient(closest-side, rgba(127,231,196,0.18), transparent)',
      }} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow color="rgba(127,231,196,0.85)">Recording — 0:34</Eyebrow>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.1, marginTop: 4, color: '#fff', letterSpacing: -.3 }}>
          Just <span style={{ fontStyle: 'italic', color: '#7FE7C4' }}>talk.</span> We'll do the rest.
        </div>
      </div>

      {/* Waveform */}
      <div style={{
        position: 'absolute', top: 200, left: 22, right: 22, height: 76,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{
            width: 3, borderRadius: 3,
            height: `${20 + (Math.sin(i * 0.7) * 0.5 + 0.5) * 60}%`,
            background: '#7FE7C4',
            animation: `pulseBar ${0.7 + (i % 7) * 0.15}s ease-in-out ${i * 0.02}s infinite`,
            transformOrigin: 'center',
            opacity: i / 50 < progress * 1.5 ? 1 : 0.25,
            transition: 'opacity .3s',
          }} />
        ))}
      </div>

      {/* Transcript card */}
      <div style={{
        position: 'absolute', top: 310, left: 22, right: 22,
        padding: 16, borderRadius: 22,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(127,231,196,0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        minHeight: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <I.mic size={13} stroke="#7FE7C4" />
          <Eyebrow color="#7FE7C4">Live transcription</Eyebrow>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>
          {visible.map((l, i) => {
            const isAction = l.text.toLowerCase().includes('ship') || l.text.toLowerCase().includes('email') || l.text.toLowerCase().includes('remind');
            return (
              <div key={i} style={{
                marginBottom: 6, animation: 'fadeUp .35s ease-out forwards',
                display: 'flex', alignItems: 'flex-start', gap: 6,
              }}>
                {isAction ? (
                  <>
                    <span style={{
                      flexShrink: 0, marginTop: 4,
                      fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 5px',
                      borderRadius: 3, background: '#FF5A2C', color: '#fff', letterSpacing: 1,
                    }}>TODO</span>
                    <span style={{ color: '#fff' }}>{l.text}</span>
                  </>
                ) : (
                  <span>{l.text}</span>
                )}
              </div>
            );
          })}
          {progress < 0.6 && (
            <span style={{
              display: 'inline-block', width: 10, height: 16, background: '#7FE7C4',
              verticalAlign: 'text-bottom', animation: 'pulseBar 1s infinite',
            }} />
          )}
        </div>
      </div>

      {/* Bottom solution */}
      <div style={{
        position: 'absolute', top: 168, left: 24, right: 24, textAlign: 'center', zIndex: 5,
      }}>
        <Eyebrow color="#7FE7C4">+ 2 action items auto-extracted</Eyebrow>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 4: STITCH — Stitch (BlogAI)
// Scattered post-its → stitched together into a clean article
// ═════════════════════════════════════════════════════════════════
function StitchReel({ app, progress }) {
  const stitched = progress > 0.4;
  const stickies = [
    { c: '#FFEAA1', x: 22, y: 0,   r: -7,  text: 'hook with the stat' },
    { c: '#FFC7BA', x: 138, y: 14, r: 8,   text: 'why now??' },
    { c: '#C9E5C0', x: 50, y: 76,  r: -3,  text: '3 lessons learned' },
    { c: '#BFD9F0', x: 168, y: 92, r: 6,   text: 'CTA: newsletter' },
    { c: '#F6D89A', x: 16, y: 162, r: -10, text: 'reader story?' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #F6D89A 0%, #E8B870 100%)',
      overflow: 'hidden',
    }}>
      {/* paper texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0 2px, transparent 2px 6px)',
      }} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow color="#7A4A12">Rough notes</Eyebrow>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1.1, marginTop: 4, color: '#1A1815', letterSpacing: -.4 }}>
          Stitch.
        </div>
      </div>

      {/* sticky notes scattered */}
      <div style={{ position: 'absolute', top: 160, left: '50%', transform: 'translateX(-50%)', width: 280, height: 240 }}>
        {stickies.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: s.x, top: s.y,
            width: 86, height: 64,
            background: s.c,
            transform: stitched
              ? `translate(${(50 - s.x) * 0.6}px, ${(120 - s.y) * 0.6}px) rotate(${s.r * 0.2}deg) scale(0.55)`
              : `rotate(${s.r}deg)`,
            transition: 'transform 1s cubic-bezier(.6,.2,.2,1)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            padding: '8px 10px',
            fontFamily: '"Caveat", "Comic Sans MS", cursive',
            fontSize: 11, lineHeight: 1.2, color: '#3a2a14',
          }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 7, color: 'rgba(0,0,0,0.35)',
              letterSpacing: 1, marginBottom: 3,
            }}>NOTE {i + 1}</div>
            {s.text}
          </div>
        ))}

        {/* stitch thread when stitched */}
        {stitched && (
          <svg width="280" height="240" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <path d="M50 30 Q 140 50 240 50 T 240 200" stroke="#1A1815" strokeWidth="1.5"
              strokeDasharray="4 4" fill="none" opacity=".5" />
          </svg>
        )}
      </div>

      {/* polished article card sliding up */}
      <div style={{
        position: 'absolute', bottom: 260, left: 22, right: 22,
        background: '#fff', borderRadius: 16, padding: 14,
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        transform: stitched ? 'translateY(0)' : 'translateY(180px)',
        opacity: stitched ? 1 : 0,
        transition: 'transform .8s cubic-bezier(.4,.7,.2,1) .2s, opacity .4s .2s',
      }}>
        <Eyebrow color="var(--ink-faint)">Draft v1 · 14 min ago</Eyebrow>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.15, marginTop: 4, color: '#1A1815' }}>
          Three lessons we learned shipping a paid product on a free idea
        </div>
        <div style={{ marginTop: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 1, marginBottom: 4,
              width: `${[100, 92, 78, 60][i]}%`,
              background: '#D9D0BD',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <Chip mono tint="#FFE9DF" color="#C7390F">in your voice</Chip>
          <Chip mono tint="#E2EFE8" color="#1F5F4B">SEO subheads</Chip>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// REEL FORMAT 5: SPEEDRUN — LaunchKit
// 60-second countdown + a landing page being assembled live
// ═════════════════════════════════════════════════════════════════
function SpeedrunReel({ app, progress }) {
  // 60..0 countdown derived from progress
  const remaining = Math.max(0, Math.round(60 - progress * 60));
  const stage = progress > 0.9 ? 4 : progress > 0.65 ? 3 : progress > 0.4 ? 2 : progress > 0.15 ? 1 : 0;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0A0A0A',
      overflow: 'hidden',
    }}>
      {/* radial glow */}
      <div aria-hidden style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        width: 360, height: 360,
        background: 'radial-gradient(closest-side, rgba(255,90,44,0.25), transparent)',
      }} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow color="#FF5A2C" style={{ letterSpacing: 3 }}>Speedrun</Eyebrow>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 30, marginTop: 4, color: '#fff', lineHeight: 1.1, letterSpacing: -.3 }}>
          Idea → live page<br/><span style={{ fontStyle: 'italic', color: '#FF5A2C' }}>in 60 seconds.</span>
        </div>
      </div>

      {/* Countdown ring */}
      <div style={{ position: 'absolute', top: 200, left: '50%', transform: 'translateX(-50%)', width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
          <circle cx="60" cy="60" r="52" stroke="#FF5A2C" strokeWidth="6" fill="none"
            strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset={326.7 * progress}
            transform="rotate(-90 60 60)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 600, color: '#fff', letterSpacing: -1 }}>
            00:{String(remaining).padStart(2, '0')}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginTop: -2 }}>
            REMAINING
          </div>
        </div>
      </div>

      {/* Mock landing page being assembled */}
      <div style={{
        position: 'absolute', top: 350, left: 36, right: 36,
        background: 'linear-gradient(180deg, #161616 0%, #0E0E0E 100%)',
        border: '1px solid #2A2A2A', borderRadius: 14, padding: 14,
        boxShadow: '0 20px 50px rgba(255,90,44,0.18), 0 0 0 1px rgba(255,90,44,0.12)',
      }}>
        {/* "browser bar" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5F57' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FEBC2E' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#28C840' }} />
          <span style={{ marginLeft: 8, fontFamily: 'var(--mono)', fontSize: 9, color: '#5A5A5A' }}>orbit-app.com</span>
        </div>

        {/* Stage 1: hero text */}
        <div style={{
          height: 11, width: stage >= 1 ? '70%' : '0%', background: '#fff', borderRadius: 2,
          transition: 'width .5s', marginBottom: 5,
        }} />
        <div style={{
          height: 6, width: stage >= 1 ? '88%' : '0%', background: 'rgba(255,255,255,0.6)', borderRadius: 1,
          transition: 'width .5s .1s', marginBottom: 5,
        }} />
        <div style={{
          height: 6, width: stage >= 1 ? '60%' : '0%', background: 'rgba(255,255,255,0.4)', borderRadius: 1,
          transition: 'width .5s .2s', marginBottom: 12,
        }} />

        {/* Stage 2: hero CTA + form */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 12,
          opacity: stage >= 2 ? 1 : 0, transition: 'opacity .3s',
        }}>
          <div style={{ flex: 1, height: 22, background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A', borderRadius: 6 }} />
          <div style={{ width: 50, height: 22, background: '#FF5A2C', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 8, color: '#fff', fontWeight: 600 }}>JOIN</div>
        </div>

        {/* Stage 3: og preview */}
        <div style={{
          height: stage >= 3 ? 60 : 0, overflow: 'hidden', transition: 'height .4s',
          background: 'linear-gradient(135deg, #FF5A2C 0%, #C7390F 100%)',
          borderRadius: 6, position: 'relative', marginBottom: 12,
        }}>
          <div style={{ position: 'absolute', bottom: 6, left: 8, fontFamily: 'var(--serif)', fontSize: 13, color: '#fff' }}>orbit · the new way to ship</div>
        </div>

        {/* Stage 4: shipped badge */}
        <div style={{
          opacity: stage >= 4 ? 1 : 0, transform: stage >= 4 ? 'scale(1)' : 'scale(0.9)',
          transition: 'opacity .3s, transform .3s',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 8px', borderRadius: 999, background: '#7FE7C4', color: '#0E2A20',
          fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, letterSpacing: 1,
        }}>
          <I.check size={10} stroke="#0E2A20" sw={2.2} /> LIVE
        </div>
      </div>
    </div>
  );
}

window.ReelsScreen = ReelsScreen;
