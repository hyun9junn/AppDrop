// screens-submit.jsx — Developer "drop your app" flow + simple placeholders

function SubmitScreen({ go }) {
  const [step, setStep] = useState(0); // 0 = form, 1 = generating, 2 = preview
  const [link, setLink] = useState('https://orbit-app.com');
  const [problem, setProblem] = useState('Founders waste hours setting up a landing page just to test if an idea has legs.');
  const [features, setFeatures] = useState('Generate full copy. Built-in waitlist. One-click publish.');

  function start() {
    setStep(1);
    setTimeout(() => setStep(2), 1900);
  }

  return (
    <div className="screen-in" style={{ paddingBottom: 120 }}>
      <div style={{ padding: '4px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => go('discover')} style={{
          width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--line-2)',
          background: 'rgba(255,255,255,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.back size={16} stroke="#1A1815" /></button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>
          {step === 0 && 'Drop your app'}
          {step === 1 && 'Packaging…'}
          {step === 2 && 'Ready to ship'}
        </div>
        <div style={{ width: 38 }} />
      </div>

      {step === 0 && (
        <div style={{ padding: '18px 22px 0' }}>
          <Eyebrow>For developers</Eyebrow>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1.1, marginTop: 4 }}>
            Drop your app. We do the <span style={{ fontStyle: 'italic' }}>promo.</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.4 }}>
            Paste your link. Tell us the problem you solve. AppDrop auto-writes the copy, builds a reel, and matches it to the right audience.
          </div>

          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="App URL" value={link} onChange={setLink} mono />
            <Field label="The problem you solve" value={problem} onChange={setProblem} textarea />
            <Field label="Three things it does best" value={features} onChange={setFeatures} textarea />

            <div>
              <Eyebrow style={{ display: 'block', marginBottom: 8 }}>Access</Eyebrow>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Web', 'API', 'Mac', 'iOS', 'Chrome ext.'].map((t, i) => (
                  <button key={t} style={{
                    padding: '8px 12px', borderRadius: 999,
                    border: '1px solid var(--line-2)',
                    background: i < 2 ? 'var(--ink)' : '#fff',
                    color: i < 2 ? '#fff' : 'var(--ink)',
                    fontSize: 12, fontWeight: 600,
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <Eyebrow style={{ display: 'block', marginBottom: 8 }}>Pricing</Eyebrow>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Free', 'Freemium', 'Paid'].map((t, i) => (
                  <button key={t} style={{
                    flex: 1, padding: '10px', borderRadius: 14,
                    border: '1px solid var(--line-2)',
                    background: i === 1 ? 'var(--ink)' : '#fff',
                    color: i === 1 ? '#fff' : 'var(--ink)',
                    fontSize: 13, fontWeight: 600,
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          <PrimaryButton onClick={start} accent="var(--coral)" style={{ marginTop: 22 }}>
            Generate reel + share kit <I.spark size={16} stroke="#fff" />
          </PrimaryButton>
        </div>
      )}

      {step === 1 && (
        <Generating />
      )}

      {step === 2 && (
        <Preview go={go} />
      )}
    </div>
  );
}

function Field({ label, value, onChange, textarea, mono }) {
  return (
    <div>
      <Eyebrow style={{ display: 'block', marginBottom: 6 }}>{label}</Eyebrow>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} style={inputStyle(false)} rows={3} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle(true), fontFamily: mono ? 'var(--mono)' : 'inherit', fontSize: mono ? 13 : 14 }} />
      )}
    </div>
  );
}

function inputStyle(inline) {
  return {
    width: '100%', padding: '12px 14px', borderRadius: 14,
    background: '#fff', border: '1px solid var(--line)',
    fontSize: 14, fontFamily: 'inherit', color: 'var(--ink)',
    outline: 'none', resize: 'none',
    ...(inline ? {} : {}),
  };
}

function Generating() {
  const steps = [
    'Reading your URL…',
    'Writing positioning copy…',
    'Composing a 12-second reel…',
    'Drafting a share kit…',
  ];
  const [done, setDone] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDone(d => Math.min(d + 1, steps.length)), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ padding: '50px 22px 0', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, margin: '0 auto', borderRadius: 24,
        background: '#1A1815', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'conic-gradient(from 0deg, transparent 0deg, #FF5A2C 90deg, transparent 180deg)',
          animation: 'spin 1.2s linear infinite',
        }} />
        <div style={{ position: 'absolute', inset: 4, borderRadius: 20, background: '#1A1815' }} />
        <I.spark size={28} stroke="#FF5A2C" style={{ position: 'relative' }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ fontFamily: 'var(--serif)', fontSize: 26, marginTop: 20 }}>
        Packaging your app…
      </div>
      <div style={{ marginTop: 22, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
        {steps.map((s, i) => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 13, color: i < done ? 'var(--ink)' : 'var(--ink-faint)',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: i < done ? '#1F5F4B' : 'rgba(20,16,10,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i < done ? <I.check size={11} stroke="#fff" sw={2.4} /> : null}
            </div>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function Preview({ go }) {
  return (
    <div style={{ padding: '18px 22px 0' }}>
      <Eyebrow>Ready</Eyebrow>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.1, marginTop: 4 }}>
        Your <span style={{ fontStyle: 'italic' }}>drop</span> is live.
      </div>

      {/* generated cards */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <PackageCard tone="dark" title="The reel" body="12-second auto-edited demo" tag="REEL · 0:12" preview={
          <div style={{ height: 90, borderRadius: 12, background: '#1A1815', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <SpeedrunMini />
            </div>
          </div>
        } />
        <PackageCard title="The copy" body="Positioning, Twitter, LinkedIn — drafted in your voice." tag="3 VARIANTS" preview={
          <div style={{ padding: 12, background: '#FFF8EC', borderRadius: 12, fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.4, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            "Built a landing page in 8 minutes yesterday. LaunchKit turned one paragraph into a real, live product page."
          </div>
        } />
        <PackageCard title="The share kit" body="OG image, hashtags, intro email, ProductHunt blurb." tag="5 ASSETS" preview={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
            {['OG','TW','PH','EM','LI'].map((t, i) => (
              <div key={t} style={{ aspectRatio: '1 / 1', borderRadius: 8, background: ['#FF5A2C','#1F5F4B','#F6D89A','#1A1815','#3B5BDB'][i],
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily: 'var(--mono)', fontSize: 10, color: '#fff', fontWeight: 600,
              }}>{t}</div>
            ))}
          </div>
        } />
      </div>

      <PrimaryButton onClick={() => go('reels', { appId: 'launchkit' })} accent="var(--ink)" style={{ marginTop: 22 }}>
        Watch your reel <I.play size={14} stroke="#fff" />
      </PrimaryButton>
      <GhostButton onClick={() => go('discover')} small={false} style={{ marginTop: 8, width: '100%' }}>
        Back to discover
      </GhostButton>
    </div>
  );
}

function PackageCard({ tone, title, body, tag, preview }) {
  return (
    <div style={{
      padding: 14, borderRadius: 22,
      background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: -.1 }}>{title}</div>
        <Chip mono tint="var(--cream-2)">{tag}</Chip>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 3 }}>{body}</div>
      <div style={{ marginTop: 10 }}>{preview}</div>
    </div>
  );
}

function SpeedrunMini() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 22, color: '#FF5A2C', fontWeight: 600 }}>00:12</div>
      <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.15)' }} />
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5 }}>AUTO-EDIT<br/>READY</div>
    </div>
  );
}

// ── Inbox + Profile placeholders ─────────────────────────────────
function InboxScreen({ go }) {
  const items = [
    { who: 'WriteSmart', avatar: 'W', tint: '#3B5BDB', kind: 'drop', body: 'Stitch v2 just dropped — voice-cloning is in.', when: '2h', appId: 'blogai' },
    { who: 'KimDev Studio', avatar: 'K', tint: '#FF5A2C', kind: 'boost', body: 'Your boost on PixelDrop pushed it to #1 today.', when: '4h', appId: 'pixeldrop' },
    { who: 'AppDrop weekly', avatar: '◉', tint: '#1A1815', kind: 'digest', body: '5 apps matched your “Voice memos” saved search.', when: 'today' },
    { who: 'Nova Labs', avatar: 'N', tint: '#1F5F4B', kind: 'beta', body: 'You\'re in. Beta opens at 4:00 PM KST.', when: 'yest', appId: 'voicenote-pro' },
    { who: 'ShipFast', avatar: 'S', tint: '#D4A017', kind: 'update', body: 'LaunchKit now ships with built-in OG images.', when: '2d', appId: 'launchkit' },
  ];
  return (
    <div className="screen-in" style={{ paddingBottom: 120 }}>
      <div style={{ padding: '4px 22px 0' }}>
        <Eyebrow>Inbox</Eyebrow>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1.1, marginTop: 4, letterSpacing: -.3 }}>
          What you <span style={{ fontStyle: 'italic' }}>missed</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
          5 updates from creators you follow.
        </div>
      </div>

      <div style={{ marginTop: 18, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => (
          <button key={i} onClick={() => it.appId && go('detail', { appId: it.appId })} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 20,
            background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)',
            textAlign: 'left',
          }}>
            <Avatar creator={{ avatar: it.avatar, tint: it.tint }} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{it.who}</span>
                <Chip mono tint={tagTint(it.kind).bg} color={tagTint(it.kind).fg} style={{ fontSize: 9, padding: '1px 6px' }}>{it.kind.toUpperCase()}</Chip>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-faint)' }}>{it.when}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 3, lineHeight: 1.35 }}>{it.body}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function tagTint(k) {
  const m = {
    drop: { bg: '#FFE9DF', fg: '#C7390F' },
    boost: { bg: '#FFF1C9', fg: '#7A5A12' },
    digest: { bg: '#E2EFE8', fg: '#1F5F4B' },
    beta: { bg: '#E6DFF7', fg: '#3D2E78' },
    update: { bg: '#DCEAF6', fg: '#1F3D5F' },
  };
  return m[k] || m.drop;
}

function ProfileScreen({ go }) {
  return (
    <div className="screen-in" style={{ paddingBottom: 120, padding: '4px 22px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(140deg, #FFD6BA, #E1C9F0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 26, color: 'var(--ink)',
          fontFamily: 'var(--serif)',
        }}>S</div>
        <div style={{ flex: 1 }}>
          <Eyebrow>Member since Mar '26</Eyebrow>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.1, marginTop: 2 }}>Soobin Han</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Indie · Seoul · Following 14 creators</div>
        </div>
        <button style={{
          padding: '8px 12px', borderRadius: 999, border: '1px solid var(--line-2)',
          background: '#fff', fontSize: 12, fontWeight: 600,
        }}>Edit</button>
      </div>

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { n: '23', l: 'Boosted' },
          { n: '8',  l: 'Saved' },
          { n: '14', l: 'Following' },
        ].map(s => (
          <div key={s.l} style={{
            padding: 14, borderRadius: 18, background: '#fff', border: '1px solid var(--line)',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-faint)', letterSpacing: 1.5, marginTop: 4 }}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <Eyebrow style={{ display: 'block', marginTop: 24 }}>Your saved problems</Eyebrow>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          '“Voice memos I never go back to”',
          '“Resize images for every platform fast”',
          '“Stand out for senior PM jobs”',
        ].map((q, i) => (
          <button key={i} onClick={() => go('search', { q: q.replace(/[“”]/g, '') })} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
            borderRadius: 16, background: 'rgba(255,255,255,0.6)', border: '1px solid var(--line)',
            fontSize: 13.5, color: 'var(--ink)', textAlign: 'left',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--coral)' }} />
            <span style={{ flex: 1 }}>{q}</span>
            <I.arrow size={14} stroke="#A8A097" />
          </button>
        ))}
      </div>

      <Eyebrow style={{ display: 'block', marginTop: 24 }}>For creators</Eyebrow>
      <button onClick={() => go('submit')} style={{
        marginTop: 8, width: '100%', padding: '14px 16px', borderRadius: 20,
        background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <I.spark size={20} stroke="#FFB68A" />
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Drop your app</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>Package, ship, and promote in 90 seconds</div>
        </div>
        <I.arrow size={16} stroke="#fff" />
      </button>
    </div>
  );
}

window.SubmitScreen = SubmitScreen;
window.InboxScreen = InboxScreen;
window.ProfileScreen = ProfileScreen;
