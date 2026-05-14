// screens-search.jsx — Problem-input + AI matching results

function SearchScreen({ go, initialQuery = '' }) {
  const { APPS, COLLECTIONS, CREATORS, EXAMPLE_PROMPTS } = window.AppDropData;
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(!!initialQuery);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!submitted) return;
    setMatching(true);
    const t = setTimeout(() => {
      // simple keyword-driven mock matcher
      const q = query.toLowerCase();
      const scored = APPS.map(app => {
        let s = 0;
        if (q.includes('resume') || q.includes('cv') || q.includes('job')) s += app.id === 'resume-ai' ? 3 : 0;
        if (q.includes('image') || q.includes('photo') || q.includes('resize')) s += app.id === 'pixeldrop' ? 3 : 0;
        if (q.includes('voice') || q.includes('memo') || q.includes('audio')) s += app.id === 'voicenote-pro' ? 3 : 0;
        if (q.includes('blog') || q.includes('write') || q.includes('post') || q.includes('note')) s += app.id === 'blogai' ? 3 : 0;
        if (q.includes('landing') || q.includes('launch') || q.includes('page')) s += app.id === 'launchkit' ? 3 : 0;
        return [app, s + Math.random() * 0.5];
      }).sort((a, b) => b[1] - a[1]).map(([a]) => a);
      setMatches(scored.slice(0, 4));
      setReason(buildReason(q));
      setMatching(false);
    }, 900);
    return () => clearTimeout(t);
  }, [submitted, query]);

  function buildReason(q) {
    if (q.includes('voice') || q.includes('memo')) return 'Audio tools that turn talk into action.';
    if (q.includes('resume') || q.includes('cv') || q.includes('job')) return 'Writing tools tuned for the job hunt.';
    if (q.includes('image') || q.includes('resize')) return 'Image tools for fast multi-platform output.';
    if (q.includes('landing') || q.includes('launch')) return 'Quick ship-it-tonight launch tools.';
    return 'Top picks that solve adjacent problems.';
  }

  function submit(q) {
    const v = (q ?? query).trim();
    if (!v) return;
    setQuery(v); setSubmitted(true);
  }

  return (
    <div className="screen-in" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '4px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => go('discover')} style={{
          width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--line-2)',
          background: 'rgba(255,255,255,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.back size={16} stroke="#1A1815" /></button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>Describe the problem</div>
        <div style={{ width: 38 }} />
      </div>

      {/* Input section */}
      <div style={{ padding: '18px 22px 0' }}>
        <Eyebrow>Find the right app</Eyebrow>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.1, marginTop: 4, letterSpacing: -.3 }}>
          What are you trying to <span style={{ fontStyle: 'italic' }}>fix?</span>
        </div>
        <div style={{
          marginTop: 16, padding: 14, borderRadius: 22, background: '#fff',
          border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)',
        }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="In your own words — like talking to a friend who happens to know every app."
            style={{
              width: '100%', minHeight: 78, border: 'none', outline: 'none', resize: 'none',
              fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.4, color: 'var(--ink)',
              background: 'transparent',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: 1 }}>
              {query.length}/280
            </span>
            <PrimaryButton small full={false} onClick={() => submit()} accent="var(--coral)" style={{ paddingInline: 16, whiteSpace: 'nowrap' }}>
              Match me <I.arrow size={14} stroke="#fff" />
            </PrimaryButton>
          </div>
        </div>

        {!submitted && (
          <>
            <Eyebrow style={{ display: 'block', marginTop: 24 }}>Try one of these</Eyebrow>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EXAMPLE_PROMPTS.map(p => (
                <button key={p} onClick={() => submit(p)} style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.6)', border: '1px solid var(--line)',
                  fontSize: 13.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--coral)' }} />
                  <span style={{ flex: 1 }}>{p}</span>
                  <I.arrow size={14} stroke="#A8A097" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {submitted && (
        <div style={{ padding: '22px 22px 0' }}>
          {matching ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-soft)', fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--coral)', animation: 'pulseBar 1s infinite' }} />
              <span>Reading the AppDrop index…</span>
            </div>
          ) : (
            <>
              <Eyebrow>AppDrop matched · {matches.length} apps</Eyebrow>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 4, lineHeight: 1.2 }}>
                {reason}
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {matches.map((app, i) => (
                  <MatchedAppCard key={app.id} app={app} go={go} rank={i + 1} />
                ))}
              </div>

              {/* Suggest a collection */}
              <div style={{
                marginTop: 18, padding: 14, borderRadius: 22, background: '#FFF8EC',
                border: '1px dashed #E5C898', display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: '#1F5F4B', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <I.bookmark size={16} stroke="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>Save as a personal collection</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>“{query.slice(0, 36)}{query.length > 36 ? '…' : ''}”</div>
                </div>
                <GhostButton small>Save</GhostButton>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MatchedAppCard({ app, rank, go }) {
  const creator = window.AppDropData.CREATORS.find(c => c.id === app.creatorId);
  return (
    <div style={{
      padding: 14, borderRadius: 22, background: '#fff',
      border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: app.accent, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'var(--serif)', fontSize: 24,
        }}>{app.title[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-faint)' }}>0{rank}</span>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -.2 }}>{app.title}</span>
            {rank === 1 && (
              <Chip tint="var(--ink)" color="#fff" style={{ fontSize: 9, padding: '2px 7px', letterSpacing: .4 }}>BEST MATCH</Chip>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.35, marginTop: 2 }}>
            {app.tagline}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {app.chips.slice(0, 3).map(c => (
              <Chip key={c} mono tint="var(--cream-2)" style={{ fontSize: 10 }}>{c}</Chip>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <button onClick={() => go('detail', { appId: app.id })} style={{
          flex: 1, padding: '10px', borderRadius: 999, fontWeight: 600, fontSize: 12.5,
          background: 'var(--ink)', color: '#fff',
        }}>Open</button>
        <button onClick={() => go('reels', { appId: app.id })} style={{
          padding: '10px 14px', borderRadius: 999, fontWeight: 600, fontSize: 12.5,
          border: '1px solid var(--line-2)', background: '#fff',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}><I.play size={11} stroke="#1A1815" /> Reel</button>
        <BoostPill count={app.boosts} on={false} onClick={() => {}} />
      </div>
    </div>
  );
}

window.SearchScreen = SearchScreen;
