// screens-detail.jsx — App detail screen

function AppDetailScreen({ go, appId }) {
  const { APPS, CREATORS } = window.AppDropData;
  const app = APPS.find(a => a.id === appId) || APPS[0];
  const creator = CREATORS.find(c => c.id === app.creatorId);
  const [boosted, setBoosted] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="screen-in" style={{ paddingBottom: 120 }}>
      {/* Hero */}
      <div style={{
        margin: '0 16px', borderRadius: 28, background: app.accent, color: '#fff',
        position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-pop)',
      }}>
        {/* nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 0' }}>
          <button onClick={() => go(-1)} style={{
            width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}><I.back size={16} stroke="#fff" /></button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSaved(s => !s)} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: saved ? '#fff' : 'rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><I.bookmark size={15} stroke={saved ? app.accent : '#fff'} fill={saved ? app.accent : 'none'} /></button>
            <button style={{
              width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><I.share size={15} stroke="#fff" /></button>
          </div>
        </div>

        <div style={{ padding: '8px 22px 22px' }}>
          <Eyebrow color="rgba(255,255,255,0.72)">{app.category} · {app.pricing}</Eyebrow>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1.1, marginTop: 8, letterSpacing: -.6 }}>
            {app.title}
          </div>
          <div style={{ fontSize: 14.5, marginTop: 6, opacity: .92, lineHeight: 1.35 }}>{app.pitch}</div>

          <div style={{ marginTop: 16, borderRadius: 20, height: 200, background: 'rgba(0,0,0,0.22)', overflow: 'hidden', position: 'relative' }}>
            <ReelStyleThumbnail app={app} />
            <button onClick={() => go('reels', { appId: app.id })} style={{
              position: 'absolute', bottom: 10, right: 10,
              padding: '8px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.55)',
              color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
              backdropFilter: 'blur(8px)',
            }}><I.play size={11} stroke="#fff" /> Watch reel</button>
          </div>
        </div>
      </div>

      {/* Quick actions row */}
      <div style={{ padding: '18px 22px 0', display: 'flex', gap: 8 }}>
        <button style={{
          flex: 2, padding: '14px', borderRadius: 999, fontWeight: 600, fontSize: 14,
          background: 'var(--ink)', color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>Try {app.title} <I.arrow size={14} stroke="#fff" /></button>
        <button onClick={() => setBoosted(b => !b)} style={{
          flex: 1, padding: '14px', borderRadius: 999, fontWeight: 600, fontSize: 13,
          background: boosted ? app.accent : '#fff',
          color: boosted ? '#fff' : 'var(--ink)',
          border: '1px solid var(--line-2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}><I.bolt size={13} stroke={boosted ? '#fff' : '#1A1815'} /> Boost</button>
      </div>

      {/* What it does */}
      <div style={{ padding: '24px 22px 0' }}>
        <Eyebrow>What it does</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {app.chips.map((c, i) => (
            <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: app.accent + '22',
                color: app.accent, fontWeight: 700, fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                marginTop: 1,
              }}>{i + 1}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.45, letterSpacing: -.1 }}>{c}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Creator card */}
      <div style={{ padding: '24px 22px 0' }}>
        <Eyebrow>Made by</Eyebrow>
        <div style={{
          marginTop: 10, padding: 14, borderRadius: 22, background: '#fff',
          border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Avatar creator={creator} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{creator.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{creator.bio} · {creator.followers.toLocaleString()} followers</div>
          </div>
          <GhostButton small>Follow</GhostButton>
        </div>
      </div>

      {/* Proof */}
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{
          padding: 16, borderRadius: 22, background: '#1A1815', color: '#fff',
          fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1.25,
        }}>
          <span style={{ color: 'var(--coral)', fontSize: 28, lineHeight: 0, verticalAlign: 'middle', marginRight: 6 }}>“</span>
          {app.proof}
        </div>
      </div>
    </div>
  );
}

window.AppDetailScreen = AppDetailScreen;
