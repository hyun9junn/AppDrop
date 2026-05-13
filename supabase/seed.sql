-- supabase/seed.sql
-- Run in Supabase Dashboard → SQL Editor after schema.sql

-- Creators
insert into creators (id, name, bio, avatar, links) values
  ('kimdev-a1b2', 'KimDev Studio', 'AI tools for everyday problems. Based in Seoul.', 'K', '{"https://kimdev.example.com"}'),
  ('novatech-c3d4', 'NovaTech Labs', 'Building AI-native productivity tools.', 'N', '{"https://novatech.example.com"}'),
  ('writesmart-e5f6', 'WriteSmart', 'AI writing tools for creators and marketers.', 'W', '{"https://writesmart.example.com"}'),
  ('shipfast-g7h8', 'ShipFast', 'Tools to ship products faster.', 'S', '{"https://shipfast.example.com"}')
on conflict (id) do nothing;

-- Apps
insert into apps (id, title, tagline, link, creator_id, description, use_cases, tags, category, access_type, pricing, story_card, social_copy, boost_count, is_new) values
(
  'resume-ai-i9j0',
  'ResumeAI',
  'Tailor your CV to any job in 60 seconds',
  'https://resumeai.example.com',
  'kimdev-a1b2',
  'Paste a job description, upload your resume, get a tailored version instantly.',
  array['Tailor your CV to a specific job posting', 'Match keywords from the job description automatically', 'Keep your original voice and formatting'],
  array['resume', 'job search', 'writing', 'AI'],
  'writing',
  array['web'],
  'free',
  '{"problemStatement": "Tailoring your CV to every job description takes way too long", "solutionStatement": "Paste a job description. Upload your resume. Get a tailored version in 60 seconds.", "features": ["Matches keywords automatically", "Keeps your original voice", "Works with any file format"], "gradientTheme": "indigo-purple", "shareableUrl": "/story/resume-ai-i9j0"}'::jsonb,
  '{"twitter": "Spent 2 hours tailoring my resume last week.\n\nResumeAI does it in 60 seconds. Free → [link]", "linkedin": "I built a free tool that makes resume tailoring instant."}'::jsonb,
  243,
  true
),
(
  'pixeldrop-k1l2',
  'PixelDrop',
  'Upload once, get every image size instantly',
  'https://pixeldrop.example.com',
  'kimdev-a1b2',
  'Resize any image for every platform in seconds. No Photoshop needed.',
  array['Resize product photos for Shopify', 'Prep images for Instagram and LinkedIn at once', 'Remove backgrounds without design software'],
  array['images', 'resize', 'design', 'social media'],
  'images',
  array['web'],
  'free',
  '{"problemStatement": "Resizing images for every platform wastes hours every week", "solutionStatement": "Upload once, get every size instantly.", "features": ["Batch resize any image", "Exports for all major platforms", "Background removal included"], "gradientTheme": "sky-indigo", "shareableUrl": "/story/pixeldrop-k1l2"}'::jsonb,
  '{"twitter": "Stop wasting 20 mins resizing images before every post.\n\nPixelDrop does it in 3 seconds. Free → [link]", "linkedin": "I built a free tool that saves social media managers time every week."}'::jsonb,
  512,
  false
),
(
  'voicenote-m3n4',
  'VoiceNote Pro',
  'Transcribe and summarize your voice memos automatically',
  'https://voicenotepro.example.com',
  'novatech-c3d4',
  'Record a voice note, get a clean transcription, summary, and action items automatically.',
  array['Turn meeting voice notes into structured summaries', 'Extract action items from recorded ideas', 'Search across all your voice memos'],
  array['audio', 'transcription', 'productivity', 'notes'],
  'audio',
  array['web'],
  'freemium',
  '{"problemStatement": "Voice recordings are messy and impossible to search or act on", "solutionStatement": "Record, transcribe, summarize, and extract action items automatically.", "features": ["Accurate transcription in 30+ languages", "AI summary + action items", "Full-text search across all memos"], "gradientTheme": "emerald-sky", "shareableUrl": "/story/voicenote-m3n4"}'::jsonb,
  '{"twitter": "VoiceNote Pro transcribes, summarizes, and extracts action items automatically.", "linkedin": "Every voice memo I record becomes a searchable, structured note automatically."}'::jsonb,
  187,
  true
),
(
  'blogai-o5p6',
  'BlogAI',
  'Turn rough notes into polished blog posts',
  'https://blogai.example.com',
  'writesmart-e5f6',
  'Paste your bullet points or rough notes and get a full, well-structured blog post written in your style.',
  array['Turn LinkedIn drafts into full articles', 'Expand bullet notes into structured posts', 'Generate multiple variations to choose from'],
  array['writing', 'blogging', 'content', 'AI'],
  'writing',
  array['web'],
  'freemium',
  '{"problemStatement": "Turning rough notes into polished posts takes hours of editing", "solutionStatement": "Paste your notes, get a full blog post in your voice.", "features": ["Preserves your writing style", "Multiple variation options", "Works from bullet points"], "gradientTheme": "indigo-purple", "shareableUrl": "/story/blogai-o5p6"}'::jsonb,
  '{"twitter": "BlogAI turns my rough notes into full posts in seconds.", "linkedin": "Built an AI blog writing tool that actually sounds like you."}'::jsonb,
  156,
  false
),
(
  'launchkit-q7r8',
  'LaunchKit',
  'Everything you need to ship your product this week',
  'https://launchkit.example.com',
  'shipfast-g7h8',
  'Landing page, waitlist, and launch checklist in one place. Go from idea to live in a day.',
  array['Build a landing page without code', 'Collect waitlist signups before launch', 'Run through a 50-step launch checklist'],
  array['launch', 'startup', 'landing page', 'no-code', 'business'],
  'business',
  array['web'],
  'freemium',
  '{"problemStatement": "Launching a product is overwhelming — too many tools, too much setup", "solutionStatement": "Landing page, waitlist, and launch checklist in one place.", "features": ["No-code landing page builder", "Built-in waitlist and email collection", "50-step launch checklist"], "gradientTheme": "orange-amber", "shareableUrl": "/story/launchkit-q7r8"}'::jsonb,
  '{"twitter": "LaunchKit: from idea to live product in one day. No code needed.", "linkedin": "Built the tool I wished I had for my last product launch."}'::jsonb,
  89,
  true
)
on conflict (id) do nothing;

-- Collections
insert into collections (id, title, description, emoji, app_ids) values
(
  'solo-founder',
  'Solo Founder Starter Pack',
  'Everything you need to go from idea to launched product — without a team.',
  '🚀',
  array['launchkit-q7r8', 'blogai-o5p6', 'pixeldrop-k1l2', 'resume-ai-i9j0']
),
(
  'content-creator',
  'Content Creator Toolkit',
  'Script, record, edit, and publish faster.',
  '✍️',
  array['blogai-o5p6', 'voicenote-m3n4', 'pixeldrop-k1l2']
),
(
  'job-seeker',
  'Job Seeker Kit',
  'Stand out at every stage of the application process.',
  '💼',
  array['resume-ai-i9j0', 'blogai-o5p6']
)
on conflict (id) do nothing;

-- Feed items
insert into feed_items (creator_id, type, app_id, body) values
  ('kimdev-a1b2', 'drop', 'resume-ai-i9j0', 'ResumeAI is now live — tailor your CV to any job in 60 seconds. Free forever.'),
  ('novatech-c3d4', 'drop', 'voicenote-m3n4', 'VoiceNote Pro just launched. Your voice memos will never be messy again.'),
  ('writesmart-e5f6', 'update', 'blogai-o5p6', 'BlogAI now supports generating 3 variations at once. Pick the one that sounds most like you.'),
  ('shipfast-g7h8', 'beta', 'launchkit-q7r8', 'LaunchKit beta is open — looking for 50 early testers. Lifetime deal for beta users.');
