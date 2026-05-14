// screens-discover.jsx — Home / Discover screen

function DiscoverScreen({ go }) {
  const { APPS, COLLECTIONS, CREATORS, CATEGORIES } = window.AppDropData;
  const trending = [...APPS].sort((a,b) => b.boosts - a.boosts);
  const fresh = APPS.filter(a => a.isNew);

  return (
    <div className="screen-in" style={{ paddingBottom: 120, fontFamily: 'var(--sans)' }}>
      {/* Header */}
      <div style={{ padding: '4px 22px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow style={{ whiteSpace: 'nowrap' }}>Tuesday · May 14</Eyebrow>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1.1, marginTop: 4, letterSpacing: -.4 }}>
            Good morning, <span style={{ fontStyle: 'italic' }}>Soobin.</span>
          </div>
        </div>
        <button onClick={() => go('profile')} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(140deg, #FFD6BA, #E1C9F0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, color: 'var(--ink)', fontSize: 14,
          boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 4px 10px -2px rgba(0,0,0,.08)',
        }}>S</button>
      </div>

      {/* Problem prompt — hero card */}
      <div onClick={() => go('search')} style={{
        margin: '18px 16px 0', padding: 22, borderRadius: 28,
        background: 'var(--ink)', color: '#fff',
        boxShadow: 'var(--shadow-pop)',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
      }}>
        {/* decorative blob */}
        <div aria-hidden style={{
          position: 'absolute', right: -40, top: -30, width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(255,90,44,0.55), transparent)',
        }} />
        <Eyebrow color="rgba(255,255,255,0.55)">Tell AppDrop a problem</Eyebrow>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.15, marginTop: 8,
          letterSpacing: -.2,
        }}>
          What's <span style={{ fontStyle: 'italic', color: '#FFD7C1' }}>annoying you</span><br/>this week?
        </div>
        <div style={{
          marginTop: 18, padding: '12px 14px',
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 18, display: 'flex', alignItems: 'center', gap: 10,
          backdropFilter: 'blur(6px)',
        }}>
          <I.search size={16} stroke="rgba(255,255,255,0.6)" />
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5 }}>“I keep losing my voice memos…”</span>
          <span style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center',
            padding: '6px 10px', borderRadius: 999, background: '#FF5A2C',
            fontSize: 12, fontWeight: 600, gap: 4,
          }}>Match<I.arrow size={12} stroke="#fff" /></span>
        </div>
      </div>

      {/* Stories rail */}
      <div style={{ marginTop: 26, paddingLeft: 22, paddingRight: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, paddingRight: 6 }}>
          <Eyebrow>From creators you follow</Eyebrow>
          <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 500, whiteSpace: 'nowrap' }}>see all</span>
        </div>
        <div className="noscrollbar" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {trending.map((app, i) => {
            const creator = CREATORS.find(c => c.id === app.creatorId);
            return (
              <button key={app.id} onClick={() => go('reels', { appId: app.id })}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', padding: 2.5,
                  background: i < 3 ? `conic-gradient(from 220deg, ${app.accent}, ${creator.tint}, ${app.accent})` : 'var(--line-2)',
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: '#fff', padding: 2.5,
                  }}>
                    <div style={{
                      width: '100%', height: '100%', borderRadius: '50%',
                      background: creator.tint, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 22,
                    }}>{creator.avatar}</div>
                  </div>
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 500, maxWidth: 70, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{creator.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div style={{ marginTop: 22, padding: '0 16px' }}>
        <div style={{
          background: 'var(--surface)', borderRadius: 24, padding: 14,
          border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {CATEGORIES.map(c => (
              <button key={c.slug} onClick={() => go('search', { q: c.label })}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 16, background: c.tint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CategoryGlyph slug={c.slug} />
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: -.1 }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor's pick — big featured app */}
      <FeaturedApp app={trending[0]} go={go} />

      {/* Trending row */}
      <div style={{ marginTop: 26, paddingLeft: 22, paddingRight: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <Eyebrow>Trending this week</Eyebrow>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.1, marginTop: 4 }}>What everyone's <span style={{ fontStyle: 'italic' }}>boosting</span></div>
          </div>
        </div>
        <div className="noscrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, paddingRight: 22 }}>
          {trending.slice(0, 4).map((app, i) => (
            <TrendingCard key={app.id} app={app} rank={i + 1} go={go} />
          ))}
        </div>
      </div>

      {/* New drops list */}
      <div style={{ marginTop: 28, padding: '0 22px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <Eyebrow>New today</Eyebrow>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.1, marginTop: 4 }}>Fresh <span style={{ fontStyle: 'italic' }}>drops</span></div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--coral-ink)', fontWeight: 600 }}>● live</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fresh.map(app => <NewDropRow key={app.id} app={app} go={go} />)}
        </div>
      </div>

      {/* Collections */}
      <div style={{ marginTop: 28, paddingLeft: 22, paddingRight: 0 }}>
        <Eyebrow>Curated collections</Eyebrow>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.1, marginTop: 4, marginBottom: 14 }}>
          For where <span style={{ fontStyle: 'italic' }}>you are</span> right now
        </div>
        <div className="noscrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingRight: 22, paddingBottom: 6 }}>
          {COLLECTIONS.map(col => <CollectionCard key={col.id} col={col} />)}
        </div>
      </div>

      {/* Submit-your-app CTA — for devs */}
      <div style={{ margin: '28px 16px 0', padding: 18, borderRadius: 24,
        background: 'linear-gradient(135deg, #FFE9DF 0%, #F6D89A 100%)',
        border: '1px solid #F1D6A8',
        display: 'flex', gap: 14, alignItems: 'center',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, background: '#1A1815', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <I.spark size={20} stroke="#FFB68A" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1.1 }}>
            Built something? <span style={{ fontStyle: 'italic' }}>Drop it.</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 3 }}>
            AppDrop packages it for you — copy, reel, share kit.
          </div>
        </div>
        <button onClick={() => go('submit')} style={{
          width: 36, height: 36, borderRadius: '50%', background: '#1A1815', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><I.arrow size={16} stroke="#fff" /></button>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function CategoryGlyph({ slug }) {
  // simple iconographic shapes, distinct per category
  const m = {
    writing:  <svg width="22" height="22" viewBox="0 0 22 22"><path d="M4 17l2-7 10-10 5 5L11 15l-7 2z" stroke="#1A1815" strokeWidth="1.4" fill="#fff"/></svg>,
    images:   <svg width="22" height="22" viewBox="0 0 22 22"><rect x="3" y="4" width="16" height="13" rx="2" stroke="#1A1815" strokeWidth="1.4" fill="#fff"/><circle cx="8" cy="9" r="1.6" fill="#1A1815"/><path d="M3 14l5-4 6 5 5-3" stroke="#1A1815" strokeWidth="1.4" fill="none"/></svg>,
    audio:    <svg width="22" height="22" viewBox="0 0 22 22"><rect x="9" y="3" width="4" height="10" rx="2" fill="#1A1815"/><path d="M5 10a6 6 0 0 0 12 0M11 17v3" stroke="#1A1815" strokeWidth="1.4" fill="none"/></svg>,
    video:    <svg width="22" height="22" viewBox="0 0 22 22"><rect x="3" y="5" width="13" height="12" rx="2" stroke="#1A1815" strokeWidth="1.4" fill="#fff"/><path d="M16 9l4-2v8l-4-2" fill="#1A1815"/></svg>,
    data:     <svg width="22" height="22" viewBox="0 0 22 22"><rect x="4" y="11" width="3" height="7" fill="#1A1815"/><rect x="9.5" y="7" width="3" height="11" fill="#1A1815"/><rect x="15" y="3" width="3" height="15" fill="#1A1815"/></svg>,
    business: <svg width="22" height="22" viewBox="0 0 22 22"><rect x="3" y="7" width="16" height="11" rx="2" stroke="#1A1815" strokeWidth="1.4" fill="#fff"/><path d="M8 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="#1A1815" strokeWidth="1.4" fill="none"/></svg>,
    design:   <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="7" stroke="#1A1815" strokeWidth="1.4" fill="#fff"/><circle cx="11" cy="11" r="3" fill="#1A1815"/></svg>,
    ai:       <svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 3l1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6L11 3z" stroke="#1A1815" strokeWidth="1.3" fill="#fff"/></svg>,
  };
  return m[slug] || null;
}

function FeaturedApp({ app, go }) {
  const { CREATORS } = window.AppDropData;
  const creator = CREATORS.find(c => c.id === app.creatorId);
  return (
    <div onClick={() => go('detail', { appId: app.id })} style={{
      margin: '26px 16px 0', borderRadius: 28, overflow: 'hidden',
      background: app.accent, color: '#fff', cursor: 'pointer',
      boxShadow: 'var(--shadow-pop)', position: 'relative',
    }}>
      {/* paper "noise" pattern via repeating gradients */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(60% 90% at 90% -10%, rgba(255,255,255,0.18), transparent),
          radial-gradient(40% 60% at -10% 110%, rgba(0,0,0,0.18), transparent)`,
        mixBlendMode: 'soft-light',
      }} />
      <div style={{ padding: '20px 22px 18px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Eyebrow color="rgba(255,255,255,0.72)" style={{ letterSpacing: 1.5 }}>Editor's pick</Eyebrow>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 7px',
            borderRadius: 999, background: 'rgba(0,0,0,0.22)', color: 'rgba(255,255,255,0.92)',
          }}>#01</span>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 38, lineHeight: 1.1, marginTop: 10, letterSpacing: -.4 }}>
          {app.title}
        </div>
        <div style={{ fontSize: 14, marginTop: 6, opacity: .9, lineHeight: 1.35 }}>{app.tagline}.</div>

        {/* visual preview unique per app */}
        <div style={{ marginTop: 16, borderRadius: 18, height: 140, background: 'rgba(0,0,0,0.18)', overflow: 'hidden', position: 'relative' }}>
          <ReelStyleThumbnail app={app} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <Avatar creator={creator} size={28} />
          <div style={{ fontSize: 12, opacity: .88 }}>
            <span style={{ fontWeight: 600 }}>{creator.name}</span>
            <span style={{ opacity: .55 }}> · {app.proof}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={(e) => { e.stopPropagation(); go('reels', { appId: app.id }); }} style={{
            flex: 1, padding: '12px', borderRadius: 999,
            background: '#fff', color: app.accent, fontWeight: 600, fontSize: 13.5,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}><I.play size={13} stroke={app.accent}/> Watch reel</button>
          <button onClick={(e) => e.stopPropagation()} style={{
            padding: '12px 16px', borderRadius: 999, color: '#fff', fontSize: 13.5, fontWeight: 600,
            background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.25)',
          }}>Try {app.title}</button>
        </div>
      </div>
    </div>
  );
}

function TrendingCard({ app, rank, go }) {
  const creator = window.AppDropData.CREATORS.find(c => c.id === app.creatorId);
  return (
    <div role="button" tabIndex={0} onClick={() => go('detail', { appId: app.id })} style={{
      minWidth: 200, width: 200, textAlign: 'left', cursor: 'pointer',
      background: '#fff', borderRadius: 22, border: '1px solid var(--line)',
      padding: 14, boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ height: 90, borderRadius: 14, background: app.accent + '14', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <ReelStyleThumbnail app={app} compact />
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-faint)' }}>#0{rank}</div>
          <BoostPill count={app.boosts} on={false} onClick={(e)=>e.stopPropagation()} />
        </div>
        <div style={{ fontWeight: 600, fontSize: 15, marginTop: 6, letterSpacing: -.2 }}>{app.title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {app.tagline}
        </div>
      </div>
    </div>
  );
}

function NewDropRow({ app, go }) {
  const creator = window.AppDropData.CREATORS.find(c => c.id === app.creatorId);
  return (
    <button onClick={() => go('detail', { appId: app.id })} style={{
      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
      padding: 12, background: '#fff', borderRadius: 22, border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: app.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: '#fff', fontWeight: 600, fontSize: 22,
        fontFamily: 'var(--serif)',
      }}>{app.title.charAt(0)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14.5, letterSpacing: -.2 }}>{app.title}</span>
          <span style={{ fontSize: 9, color: '#fff', background: 'var(--coral)', padding: '1.5px 6px', borderRadius: 999, fontWeight: 700, letterSpacing: .5 }}>NEW</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
          {app.tagline}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <Avatar creator={creator} size={16} />
          <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{creator.name}</span>
          <span style={{ fontSize: 10, color: 'var(--ink-faint)' }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{app.pricing}</span>
        </div>
      </div>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--line-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}><I.chevR size={15} stroke="#6E665C" /></div>
    </button>
  );
}

function CollectionCard({ col }) {
  const apps = col.appIds.map(id => window.AppDropData.APPS.find(a => a.id === id));
  return (
    <div style={{
      minWidth: 230, width: 230, padding: 16, borderRadius: 22,
      background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)',
      flexShrink: 0,
    }}>
      <div style={{
        height: 80, borderRadius: 14, background: col.accent + '18', padding: 10,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* stacked icons */}
        <div style={{ position: 'absolute', inset: 12, display: 'flex' }}>
          {apps.slice(0, 4).map((a, i) => (
            <div key={a.id} style={{
              width: 44, height: 44, borderRadius: 12,
              background: a.accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500,
              boxShadow: '0 2px 6px rgba(0,0,0,.12)',
              transform: `translateX(${i * -10}px) rotate(${(i - 1.5) * 4}deg)`,
              border: '2px solid #fff',
            }}>{a.title[0]}</div>
          ))}
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, marginTop: 12, letterSpacing: -.1, lineHeight: 1.2 }}>{col.title}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{col.sub}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-faint)' }}>{col.appIds.length} apps · {col.updated} ago</span>
        <I.chevR size={14} stroke="#A8A097" />
      </div>
    </div>
  );
}

// Used as a small visual hint of each app's reel style — also reused in detail.
// Defined here, but used in multiple screens.
function ReelStyleThumbnail({ app, compact = false }) {
  const styles = {
    paper: () => (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: -10 }}>
        <div style={{ width: '38%', height: '78%', background: '#fff8ec', borderRadius: 6, transform: 'rotate(-6deg)', boxShadow: '0 2px 10px rgba(0,0,0,.15)',
          backgroundImage: 'repeating-linear-gradient(transparent 0 6px, rgba(0,0,0,0.08) 6px 7px)',
          backgroundSize: '100% 7px', backgroundPosition: '0 10px',
        }} />
        <div style={{ width: '38%', height: '78%', background: '#fff', borderRadius: 6, transform: 'rotate(6deg) translateX(-6%)', boxShadow: '0 2px 10px rgba(0,0,0,.15)',
          backgroundImage: 'repeating-linear-gradient(transparent 0 6px, rgba(255,90,44,0.5) 6px 7px)',
          backgroundSize: '100% 7px', backgroundPosition: '0 10px',
        }} />
      </div>
    ),
    explosion: () => (
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 4, padding: 12 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ background: `rgba(255,255,255,${0.18 + i * 0.04})`, borderRadius: 6 }} />
        ))}
      </div>
    ),
    waveform: () => (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} style={{
            width: 3, height: `${20 + (Math.sin(i) + 1) * 30}%`,
            background: '#fff', borderRadius: 3, opacity: 0.85,
            animation: `pulseBar ${0.8 + (i % 5) * 0.15}s ease-in-out ${i * 0.04}s infinite`,
            transformOrigin: 'center',
          }} />
        ))}
      </div>
    ),
    stickies: () => (
      <div style={{ position: 'absolute', inset: 0 }}>
        {['#FFEAA1','#FFC7BA','#C9E5C0'].map((c, i) => (
          <div key={c} style={{
            position: 'absolute',
            width: 56, height: 56,
            background: c,
            top: 10 + i * 18, left: 10 + i * 36,
            transform: `rotate(${(i - 1) * 6}deg)`,
            boxShadow: '0 3px 8px rgba(0,0,0,.15)',
            borderRadius: 2,
          }}>
            <div style={{ height: 6, marginTop: 12, marginInline: 8, background: 'rgba(0,0,0,.4)', borderRadius: 1 }} />
            <div style={{ height: 6, marginTop: 6, marginInline: 8, marginRight: 18, background: 'rgba(0,0,0,.3)', borderRadius: 1 }} />
            <div style={{ height: 6, marginTop: 6, marginInline: 8, marginRight: 24, background: 'rgba(0,0,0,.25)', borderRadius: 1 }} />
          </div>
        ))}
      </div>
    ),
    speedrun: () => (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: compact ? 22 : 32, color: '#FF5A2C', fontWeight: 600, letterSpacing: -1 }}>00:47</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5 }}>BUILDING…</div>
      </div>
    ),
  };
  const Render = styles[app.reelStyle] || styles.paper;
  return <Render />;
}

window.DiscoverScreen = DiscoverScreen;
window.ReelStyleThumbnail = ReelStyleThumbnail;
