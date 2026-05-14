// data.jsx — mock data for AppDrop prototype

const CREATORS = [
  { id: 'kimdev',     name: 'KimDev Studio', avatar: 'K', tint: '#FF5A2C', bio: 'AI tools for everyday problems. Seoul.', followers: 12400 },
  { id: 'novatech',   name: 'Nova Labs',     avatar: 'N', tint: '#1F5F4B', bio: 'AI-native productivity tools.',         followers: 8900  },
  { id: 'writesmart', name: 'WriteSmart',    avatar: 'W', tint: '#3B5BDB', bio: 'AI writing tools for creators.',        followers: 21300 },
  { id: 'shipfast',   name: 'ShipFast',      avatar: 'S', tint: '#D4A017', bio: 'Tools to ship products faster.',        followers: 31700 },
];

const APPS = [
  {
    id: 'resume-ai',
    title: 'ResumeAI',
    tagline: 'Tailor your CV to any job in 60 seconds',
    creatorId: 'kimdev',
    category: 'Writing',
    pricing: 'Free',
    boosts: 2430,
    isNew: true,
    accent: '#FF5A2C',
    reelStyle: 'paper',
    pitch: 'Paste a job description, upload your resume, get a tailored version instantly — in your voice.',
    chips: ['CV match', 'Keyword scan', 'Voice-preserving'],
    proof: 'Used 4.1k times this week',
  },
  {
    id: 'pixeldrop',
    title: 'PixelDrop',
    tagline: 'Upload once, get every image size instantly',
    creatorId: 'kimdev',
    category: 'Images',
    pricing: 'Free',
    boosts: 5120,
    isNew: false,
    accent: '#1F5F4B',
    reelStyle: 'explosion',
    pitch: 'Resize one image into nine perfect platform sizes — and remove the background while you wait.',
    chips: ['9 sizes', 'Bg removal', 'Batch ready'],
    proof: '“Saves me 2h every week.” — Mira, social lead',
  },
  {
    id: 'voicenote-pro',
    title: 'VoiceNote Pro',
    tagline: 'Voice memos that turn into action items',
    creatorId: 'novatech',
    category: 'Audio',
    pricing: 'Freemium',
    boosts: 1870,
    isNew: true,
    accent: '#3B7A57',
    reelStyle: 'waveform',
    pitch: 'Record, transcribe, summarize, extract action items — automatically and in 30+ languages.',
    chips: ['Transcribe', 'Auto-summary', '30+ languages'],
    proof: 'Picked by the AppDrop weekly digest',
  },
  {
    id: 'blogai',
    title: 'Stitch',
    tagline: 'Rough notes → polished blog post',
    creatorId: 'writesmart',
    category: 'Writing',
    pricing: 'Freemium',
    boosts: 3180,
    isNew: false,
    accent: '#C77E1A',
    reelStyle: 'stickies',
    pitch: 'Drop bullet points or a voice ramble — Stitch sews them into a publish-ready post in your voice.',
    chips: ['Voice-match', 'Multi-variant', 'SEO subheads'],
    proof: '“Cut my drafting time from 3h to 12min.” — Yuto',
  },
  {
    id: 'launchkit',
    title: 'LaunchKit',
    tagline: 'Idea → live landing page in 60 seconds',
    creatorId: 'shipfast',
    category: 'Business',
    pricing: 'Freemium',
    boosts: 4010,
    isNew: false,
    accent: '#0A0A0A',
    reelStyle: 'speedrun',
    pitch: 'One paragraph in. A live landing page with waitlist, copy, and OG image — out.',
    chips: ['60s build', 'Waitlist form', 'One-click publish'],
    proof: '4,800 pages shipped last month',
  },
];

const COLLECTIONS = [
  {
    id: 'solo-founder',
    title: 'Solo founder starter pack',
    sub: 'From idea to shipped, no team needed',
    accent: '#FF5A2C',
    appIds: ['launchkit', 'blogai', 'pixeldrop', 'resume-ai'],
    updated: '2d',
  },
  {
    id: 'content-creator',
    title: 'Content creator toolkit',
    sub: 'Script, record, polish, publish faster',
    accent: '#1F5F4B',
    appIds: ['blogai', 'voicenote-pro', 'pixeldrop'],
    updated: '5d',
  },
  {
    id: 'job-seeker',
    title: 'Land the offer',
    sub: 'Stand out at every step of applying',
    accent: '#3B5BDB',
    appIds: ['resume-ai', 'blogai'],
    updated: '1w',
  },
];

const CATEGORIES = [
  { slug: 'writing',  label: 'Writing',  tint: '#FFE9DF' },
  { slug: 'images',   label: 'Images',   tint: '#E2EFE8' },
  { slug: 'audio',    label: 'Audio',    tint: '#FBE5C8' },
  { slug: 'video',    label: 'Video',    tint: '#E6DFF7' },
  { slug: 'data',     label: 'Data',     tint: '#DCEAF6' },
  { slug: 'business', label: 'Business', tint: '#F4E0E0' },
  { slug: 'design',   label: 'Design',   tint: '#EFE6DA' },
  { slug: 'ai',       label: 'AI tools', tint: '#E5E5E5' },
];

// Example "problem" prompts shown on the search screen — short, real-sounding
const EXAMPLE_PROMPTS = [
  'I record voice memos but never go back to them',
  'Resizing images for every platform takes me hours',
  'I want a landing page up by tonight',
  'My resume needs to fit a totally different job',
  'Turn my messy notes into a blog post I’d actually publish',
];

window.AppDropData = { CREATORS, APPS, COLLECTIONS, CATEGORIES, EXAMPLE_PROMPTS };
