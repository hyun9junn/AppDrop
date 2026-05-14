// ui.jsx — Shared UI atoms used across all screens

const { useEffect, useState, useRef, useMemo, useCallback } = React;
const I = window.AppDropIcons;

// ─── App-level chrome ──────────────────────────────────────────────
// Status bar (compact, inside the iOS frame). We don't use the frame's
// own large title — every screen draws its own header.
function AppStatusBar({ dark = false }) {
  return (
    <div style={{
      height: 54, paddingTop: 14, position: 'relative', zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 26px 0',
      color: dark ? '#fff' : '#000',
      fontFamily: '-apple-system, system-ui',
      fontWeight: 600, fontSize: 15,
      pointerEvents: 'none',
    }}>
      <div>9:41</div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6" width="3" height="4" rx=".5" fill="currentColor"/><rect x="4.5" y="4" width="3" height="6" rx=".5" fill="currentColor"/><rect x="9" y="2" width="3" height="8" rx=".5" fill="currentColor"/><rect x="13.5" y="0" width="3" height="10" rx=".5" fill="currentColor"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" fill="none" opacity=".4"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="23" y="4" width="1.5" height="4" rx=".5" fill="currentColor" opacity=".5"/></svg>
      </div>
    </div>
  );
}

// Floating bottom tab bar — used on root screens
function TabBar({ active, onChange }) {
  const items = [
    { key: 'discover', label: 'Discover', icon: I.home },
    { key: 'reels',    label: 'Reels',    icon: I.reels },
    { key: 'inbox',    label: 'Inbox',    icon: I.inbox },
    { key: 'profile',  label: 'You',      icon: I.user },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 18, left: 16, right: 16, zIndex: 40,
      borderRadius: 28, padding: 6,
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: '0 8px 32px rgba(20,16,10,0.10), 0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 1px rgba(20,16,10,0.04)',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
    }}>
      {items.map(it => {
        const on = active === it.key;
        return (
          <button key={it.key} onClick={() => onChange(it.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, height: 50, borderRadius: 22,
              background: on ? 'var(--ink)' : 'transparent',
              color: on ? '#fff' : 'var(--ink-soft)',
              transition: 'background .2s, color .2s',
            }}>
            <it.icon size={20} stroke={on ? '#fff' : '#6E665C'} sw={1.8} />
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: -.1 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Generic primary CTA used in cards / detail
function PrimaryButton({ children, onClick, accent = 'var(--ink)', dark = false, small = false, full = true, style }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: full ? '100%' : 'auto',
      padding: small ? '10px 16px' : '14px 18px',
      borderRadius: 999,
      background: accent, color: dark ? '#fff' : '#fff',
      fontWeight: 600, fontSize: small ? 13 : 14, letterSpacing: -.1,
      boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 16px -6px rgba(0,0,0,.25)',
      ...style,
    }}>{children}</button>
  );
}

function GhostButton({ children, onClick, small = false, style }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: small ? '9px 14px' : '12px 16px',
      borderRadius: 999, border: '1px solid var(--line-2)',
      background: 'rgba(255,255,255,0.8)', color: 'var(--ink)',
      fontWeight: 600, fontSize: small ? 12.5 : 13.5,
      ...style,
    }}>{children}</button>
  );
}

// Soft chip / tag
function Chip({ children, tint = 'var(--cream-2)', color = 'var(--ink)', mono = false, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 9px', borderRadius: 999,
      background: tint, color, fontSize: 11, fontWeight: mono ? 500 : 600,
      letterSpacing: mono ? 0 : -.1,
      fontFamily: mono ? 'var(--mono)' : 'inherit',
      ...style,
    }}>{children}</span>
  );
}

// Tiny eyebrow label (uppercase mono)
function Eyebrow({ children, color = 'var(--ink-faint)', style }) {
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500,
      letterSpacing: 1.5, textTransform: 'uppercase', color,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

// Creator avatar circle (initial + colored bg)
function Avatar({ creator, size = 36, ring = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: creator.tint, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.42, letterSpacing: -.5,
      boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${creator.tint}` : 'none',
      flexShrink: 0,
    }}>{creator.avatar}</div>
  );
}

// Subtle stripe placeholder for images we don't have
function StripePlaceholder({ label = 'image', tint = '#E2DAC9', ink = '#A8A097', radius = 16, height = 140, style }) {
  return (
    <div style={{
      height, borderRadius: radius, position: 'relative', overflow: 'hidden',
      background: `repeating-linear-gradient(45deg, ${tint} 0 10px, transparent 10px 20px), ${tint}55`,
      border: `1px dashed ${ink}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: ink, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

// Boost/save quick pill
function BoostPill({ count, on, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 10px 6px 8px', borderRadius: 999,
      background: on ? 'var(--ink)' : 'rgba(20,16,10,0.06)',
      color: on ? '#fff' : 'var(--ink)',
      fontSize: 12, fontWeight: 600, transition: 'background .2s',
    }}>
      <I.bolt size={13} stroke={on ? '#fff' : '#1A1815'} />
      {count.toLocaleString()}
    </button>
  );
}

Object.assign(window, {
  AppStatusBar, TabBar, PrimaryButton, GhostButton,
  Chip, Eyebrow, Avatar, StripePlaceholder, BoostPill,
});
