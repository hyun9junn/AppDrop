// icons.jsx — Lightweight stroke icons used across AppDrop

const Icon = ({ d, size = 20, stroke = 'currentColor', sw = 1.6, fill = 'none', vb = 24, style }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const ICONS = {
  // tab bar
  home:   (p) => <Icon {...p} d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z" />,
  reels:  (p) => <Icon {...p} d={<>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M10 8.5l6 3.5-6 3.5v-7z" fill={p?.stroke || 'currentColor'} stroke="none"/>
  </>} />,
  inbox:  (p) => <Icon {...p} d={<>
    <path d="M3 13h4l2 3h6l2-3h4" />
    <path d="M3 13l3-7h12l3 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" />
  </>} />,
  user:   (p) => <Icon {...p} d={<>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </>} />,
  // chrome
  search: (p) => <Icon {...p} d={<>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </>} />,
  bell:   (p) => <Icon {...p} d={<>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 16z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>} />,
  plus:   (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  back:   (p) => <Icon {...p} d="M15 5l-7 7 7 7" />,
  close:  (p) => <Icon {...p} d="M6 6l12 12M18 6l-12 12" />,
  arrow:  (p) => <Icon {...p} d="M5 12h14M13 5l7 7-7 7" />,
  spark:  (p) => <Icon {...p} d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" />,
  bolt:   (p) => <Icon {...p} d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" fill={p?.stroke || 'currentColor'} />,
  bookmark: (p) => <Icon {...p} d="M6 4h12v17l-6-4-6 4V4z" />,
  share:  (p) => <Icon {...p} d={<>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6"  r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8 11l8-4M8 13l8 4" />
  </>} />,
  heart:  (p) => <Icon {...p} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  mic:    (p) => <Icon {...p} d={<>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </>} />,
  camera: (p) => <Icon {...p} d={<>
    <rect x="3" y="6" width="18" height="14" rx="3" />
    <circle cx="12" cy="13" r="4" />
    <path d="M9 6l1.5-2h3L15 6" />
  </>} />,
  check:  (p) => <Icon {...p} d="M5 12.5L10 17l9-10" />,
  dot:    (p) => <Icon {...p} d={<circle cx="12" cy="12" r="3" fill={p?.stroke || 'currentColor'} stroke="none" />} />,
  filter: (p) => <Icon {...p} d="M4 6h16M7 12h10M10 18h4" />,
  trend:  (p) => <Icon {...p} d="M4 17l5-5 4 4 7-8M14 8h6v6" />,
  globe:  (p) => <Icon {...p} d={<>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </>} />,
  upload: (p) => <Icon {...p} d={<>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </>} />,
  // file/format glyphs
  doc:    (p) => <Icon {...p} d={<>
    <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v4h4M8 12h8M8 16h6" />
  </>} />,
  play:   (p) => <Icon {...p} d="M8 5l12 7-12 7V5z" fill={p?.stroke || 'currentColor'} />,
  pause:  (p) => <Icon {...p} d={<>
    <rect x="7" y="5" width="3.5" height="14" rx="1" fill={p?.stroke || 'currentColor'} stroke="none"/>
    <rect x="13.5" y="5" width="3.5" height="14" rx="1" fill={p?.stroke || 'currentColor'} stroke="none"/>
  </>} />,
  chevR:  (p) => <Icon {...p} d="M9 5l7 7-7 7" />,
};

window.AppDropIcons = ICONS;
