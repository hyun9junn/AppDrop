// app.jsx — Top-level shell + screen routing

function App() {
  // Simple stack-style nav. State carries optional params per screen.
  const [stack, setStack] = useState([{ screen: 'discover', params: {} }]);
  const current = stack[stack.length - 1];

  const go = useCallback((screen, params = {}) => {
    if (screen === -1) {
      setStack(s => s.length > 1 ? s.slice(0, -1) : s);
      return;
    }
    // Root-tab screens reset the stack; others push.
    const isRoot = ['discover', 'reels', 'inbox', 'profile'].includes(screen);
    setStack(s => isRoot
      ? [{ screen, params }]
      : [...s, { screen, params }]
    );
  }, []);

  // Pick frame chrome based on current screen
  const reelMode = current.screen === 'reels';
  const dark = reelMode;
  const bg = reelMode ? '#000' : 'transparent';

  // Map screen → component
  const screenEl = useMemo(() => {
    const props = { go, ...current.params };
    switch (current.screen) {
      case 'discover': return <DiscoverScreen {...props} />;
      case 'search':   return <SearchScreen initialQuery={current.params.q || ''} {...props} />;
      case 'detail':   return <AppDetailScreen {...props} />;
      case 'reels':    return <ReelsScreen {...props} />;
      case 'submit':   return <SubmitScreen {...props} />;
      case 'inbox':    return <InboxScreen {...props} />;
      case 'profile':  return <ProfileScreen {...props} />;
      default:         return <DiscoverScreen {...props} />;
    }
  }, [current, go]);

  return (
    <PhoneFrame dark={dark} bg={bg}>
      {/* status bar */}
      <AppStatusBar dark={dark} />

      {/* scrollable content area */}
      <div className="noscrollbar" style={{
        position: 'absolute', inset: 0, top: 54, overflowY: 'auto', overflowX: 'hidden',
        background: reelMode ? '#000' : 'transparent',
      }}>
        {screenEl}
      </div>

      {/* tab bar — hide on reels, submit, search, detail (immersive) */}
      {!['reels', 'submit', 'search', 'detail'].includes(current.screen) && (
        <TabBar
          active={current.screen}
          onChange={(k) => {
            if (k === 'discover') go('discover');
            else if (k === 'reels') go('reels');
            else if (k === 'inbox') go('inbox');
            else if (k === 'profile') go('profile');
          }}
        />
      )}
    </PhoneFrame>
  );
}

// Phone frame — built directly here (instead of using IOSDevice) so we can host
// reels' edge-to-edge dark UI with our own status bar.
function PhoneFrame({ children, dark, bg }) {
  return (
    <div style={{
      width: 402, height: 874, borderRadius: 48, overflow: 'hidden',
      position: 'relative',
      background: bg === 'transparent' ? 'var(--cream)' : bg,
      boxShadow: '0 30px 70px rgba(20,16,10,0.18), 0 0 0 1px rgba(20,16,10,0.08), 0 0 0 8px #1A1815, 0 0 0 9px rgba(255,255,255,0.05)',
      fontFamily: 'var(--sans)',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 116, height: 32, borderRadius: 22, background: '#000', zIndex: 100,
      }} />
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        width: 130, height: 4, borderRadius: 4,
        background: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.25)',
        zIndex: 100, pointerEvents: 'none',
      }} />
      {children}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
