'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TOTAL_SECONDS = 44.34

const cuts = [
  { key: 'opening', start: 0, end: 5.4 },
  { key: 'problem', start: 5.4, end: 9.92 },
  { key: 'submit', start: 9.92, end: 17 },
  { key: 'package', start: 17, end: 22.48 },
  { key: 'assets', start: 22.48, end: 25.64 },
  { key: 'home', start: 25.64, end: 28.64 },
  { key: 'need', start: 28.64, end: 30.92 },
  { key: 'match', start: 30.92, end: 34.88 },
  { key: 'closing', start: 34.88, end: 44.34 },
] as const

type SceneKey = (typeof cuts)[number]['key']

const subtitles = [
  {
    start: 0,
    end: 5.4,
    lines: ['요즘은 AI 덕분에 누구나', '앱과 웹서비스를 만들 수 있습니다.'],
  },
  {
    start: 5.4,
    end: 9.92,
    lines: ['하지만 만든 서비스를 알리는 일은', '여전히 어렵습니다.'],
  },
  {
    start: 9.92,
    end: 17,
    lines: ['앱나리는 창업자와 작은 팀이 만든 서비스를', 'AI가 자동으로 포장해주는 플랫폼입니다.'],
  },
  {
    start: 17,
    end: 22.48,
    lines: ['서비스 링크만 입력하면', '소개 문구, 태그, 앱 카드,'],
  },
  {
    start: 22.48,
    end: 25.64,
    lines: ['랜딩 이미지, 숏폼 홍보물이', '생성됩니다.'],
  },
  {
    start: 25.64,
    end: 28.64,
    lines: ['소비자는 앱 이름을 몰라도 됩니다.'],
  },
  {
    start: 28.64,
    end: 30.92,
    lines: ['자신의 문제만 입력하면,'],
  },
  {
    start: 30.92,
    end: 34.88,
    lines: ['앱나리가 필요한 서비스를', '배달하듯 추천합니다.'],
  },
  {
    start: 34.88,
    end: 44.34,
    lines: ['앱나리는 새로 출발하는 AI·웹 서비스가', '더 쉽게 발견되고 성장하도록 돕습니다.'],
  },
] as const

const apps = [
  { title: 'AI Resume Builder', tint: '#E6DFF7', accent: '#8A5CF6' },
  { title: 'Study Planner', tint: '#FBE5C8', accent: '#D99022' },
  { title: 'Paper Reader', tint: '#DCEAF6', accent: '#3B5BDB' },
  { title: 'Team Schedule', tint: '#E2EFE8', accent: '#1F5F4B' },
  { title: 'Mini CRM', tint: '#FFE9DF', accent: '#FF5A2C' },
  { title: 'Voice Notes', tint: '#EFE6DA', accent: '#6E665C' },
  { title: 'Launch Page', tint: '#F4E0E0', accent: '#C7390F' },
  { title: 'Image Helper', tint: '#E5E5E5', accent: '#1A1815' },
]

const assetCards = [
  { title: '앱 카드', body: '긴 논문도 핵심만 빠르게', color: '#FF5A2C' },
  { title: '랜딩 이미지', body: 'PaperMate AI launch visual', color: '#3B5BDB' },
  { title: '인스타 스토리', body: 'Swipe-ready story copy', color: '#1F5F4B' },
  { title: '릴스 대본', body: '12초 숏폼 흐름 생성', color: '#1A1815' },
  { title: 'SNS 공유 문구', body: '짧은 런칭 카피 3종', color: '#D99022' },
]

export default function ShortVideoPage() {
  const elapsed = useTimeline()
  const scale = usePhoneScale()
  const scene = useMemo(() => getScene(elapsed), [elapsed])
  const progress = Math.min(elapsed / TOTAL_SECONDS, 1)

  return (
    <main
      className="shortVideoStage"
      data-scene={scene}
      data-elapsed={elapsed.toFixed(2)}
      data-duration={TOTAL_SECONDS}
    >
      <style>{styles}</style>
      <div
        className="phoneMount"
        style={{ width: 402 * scale, height: 874 * scale }}
      >
        <div className="phoneFrame" style={{ transform: `scale(${scale})` }}>
          <div className="dynamicIsland" />
          <StatusBar />
          <div className="homeIndicator" />
          <div className="progressTrack">
            <motion.div className="progressFill" style={{ scaleX: progress }} />
          </div>
          <AnimatePresence mode="sync">
            <motion.div
              key={scene}
              className="sceneLayer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <Scene name={scene} elapsed={elapsed} />
            </motion.div>
          </AnimatePresence>
          <SubtitleOverlay elapsed={elapsed} />
        </div>
      </div>
    </main>
  )
}

function useTimeline() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let frame = 0
    const start = performance.now()

    function tick(now: number) {
      setElapsed(Math.max(0, Math.min((now - start) / 1000, TOTAL_SECONDS)))
      if (now - start < TOTAL_SECONDS * 1000) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return elapsed
}

function usePhoneScale() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function update() {
      const next = Math.min(
        (window.innerWidth - 56) / 402,
        (window.innerHeight - 72) / 874,
        2.08,
      )
      setScale(Math.max(0.72, next))
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return scale
}

function getScene(elapsed: number): SceneKey {
  return cuts.find(cut => elapsed >= cut.start && elapsed < cut.end)?.key ?? 'closing'
}

function Scene({ name, elapsed }: { name: SceneKey; elapsed: number }) {
  if (name === 'opening') return <OpeningScene />
  if (name === 'problem') return <ProblemScene />
  if (name === 'submit') return <SubmitScene />
  if (name === 'package') return <PackageScene />
  if (name === 'assets') return <AssetsScene />
  if (name === 'home') return <ConsumerHomeScene />
  if (name === 'need') return <NeedScene elapsed={elapsed} />
  if (name === 'match') return <MatchScene />
  return <ClosingScene />
}

function SubtitleOverlay({ elapsed }: { elapsed: number }) {
  const subtitle = subtitles.find(item => elapsed >= item.start && elapsed < item.end)
  if (!subtitle) return null

  return (
    <motion.div
      key={`${subtitle.start}-${subtitle.end}`}
      className="subtitleOverlay"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.16 }}
    >
      {subtitle.lines.map(line => (
        <span key={line}>{line}</span>
      ))}
    </motion.div>
  )
}

function StatusBar() {
  return (
    <div className="statusBar">
      <div>9:41</div>
      <div className="statusIcons">
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="6" width="3" height="4" rx=".5" fill="currentColor" />
          <rect x="4.5" y="4" width="3" height="6" rx=".5" fill="currentColor" />
          <rect x="9" y="2" width="3" height="8" rx=".5" fill="currentColor" />
          <rect x="13.5" y="0" width="3" height="10" rx=".5" fill="currentColor" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" fill="none" opacity=".4" />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
          <rect x="23" y="4" width="1.5" height="4" rx=".5" fill="currentColor" opacity=".5" />
        </svg>
      </div>
    </div>
  )
}

function OpeningScene() {
  return (
    <div className="scene openingScene">
      <div className="floatingDeck">
        {apps.map((app, i) => (
          <motion.div
            key={app.title}
            className="miniAppCard"
            style={{
              left: [16, 176, 56, 222, 132, 18, 214, 88][i],
              top: [76, 96, 176, 205, 284, 348, 378, 458][i],
              background: app.tint,
              rotate: [-7, 8, -3, 6, -5, 4, -8, 5][i],
            }}
            initial={{ opacity: 0, y: 22, scale: 0.84 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.13, duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="miniIcon" style={{ background: app.accent }} />
            <div className="miniTitle">{app.title}</div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="brandLockup"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.05, duration: 0.4 }}
      >
        <div className="appMark">
          <ButterflyIcon />
        </div>
        <div className="brandName">앱나리</div>
        <div className="brandSubtitle">
          개발자와 사용자 사이를 연결하는
          <br />
          AI 큐레이션 기반 앱 딜리버리 플랫폼
        </div>
      </motion.div>
    </div>
  )
}

function ProblemScene() {
  return (
    <div className="scene problemScene">
      <div className="buriedCards">
        {apps.map((app, i) => (
          <motion.div
            key={app.title}
            className="buriedCard"
            style={{
              left: [20, 206, 74, 230, 35, 154, 251, 96][i],
              top: [102, 122, 220, 286, 354, 408, 486, 544][i],
              background: app.tint,
              rotate: [-8, 7, 4, -5, 5, -3, 8, -6][i],
              zIndex: i === 2 ? 1 : 2,
            }}
            initial={{ opacity: 0, x: i % 2 ? 34 : -34 }}
            animate={{ opacity: i === 2 ? 0.52 : 1, x: 0 }}
            transition={{ delay: i * 0.045, duration: 0.34 }}
          >
            <span>{app.title}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="lostService"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.32 }}
      >
        <div className="serviceDot">P</div>
        <div>
          <strong>PaperMate AI</strong>
          <span>묻혀버린 작은 서비스</span>
        </div>
      </motion.div>
      <div className="developerCard">
        <Avatar label="F" color="#FF5A2C" />
        <div className="founderCopy">
          <Eyebrow>Founder</Eyebrow>
          <p>좋은 서비스인데 발견되지 않아요.</p>
          <div className="founderBubbles">
            {['어떻게 소개하지?', '어디에 올리지?', '누가 써줄까?'].map((text, i) => (
              <motion.span
                key={text}
                className="thoughtBubble"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58 + i * 0.2 }}
              >
                {text}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmitScene() {
  return (
    <div className="scene submitScene">
      <TopPill title="내 서비스 등록하기" />
      <section className="submitPanel">
        <Eyebrow>For developers</Eyebrow>
        <h1>
          서비스를 <em>드롭</em>하세요.
        </h1>
        <Field label="서비스 이름" value="PaperMate AI" delay={0.18} />
        <Field label="서비스 링크" value="https://papermate.ai" mono delay={0.42} />
        <Field label="간단한 설명" value="논문을 쉽게 읽고 요약해주는 AI 도구입니다." delay={0.66} large />
        <motion.button
          className="primaryButton"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, scale: [1, 1, 0.96, 1] }}
          transition={{ opacity: { delay: 1.05 }, y: { delay: 1.05 }, scale: { delay: 2.15, duration: 0.34 } }}
        >
          AI로 포장하기 <SparkIcon />
        </motion.button>
      </section>
    </div>
  )
}

function PackageScene() {
  const rows = [
    ['한 줄 소개', '논문을 빠르게 이해하는 AI 리딩 도우미'],
    ['추천 태그', '#논문요약 #대학생 #AI리딩 #연구도구'],
    ['추천 사용자', '대학생, 연구자, 리포트 작성자'],
    ['앱 카드 문구', '긴 논문도 핵심만 빠르게 파악하세요.'],
  ]

  return (
    <div className="scene packageScene">
      <TopPill title="서비스 포장 중" />
      <section className="generatorHero">
        <div className="spinnerTile">
          <motion.div
            className="spinnerRing"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <SparkIcon />
        </div>
        <div>
          <Eyebrow>AI Packaging</Eyebrow>
          <h1>
            포장이 <em>생성</em>되고 있어요.
          </h1>
        </div>
      </section>
      <section className="resultPanel">
        {rows.map(([label, value], i) => (
          <motion.div
            className="resultRow"
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 + i * 0.35 }}
          >
            <div className="checkDot">
              <CheckIcon />
            </div>
            <div>
              <Eyebrow>{label}</Eyebrow>
              <p>{value}</p>
            </div>
          </motion.div>
        ))}
      </section>
      <motion.div
        className="generatedPreview"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
      >
        <PaperMateVisual compact />
      </motion.div>
    </div>
  )
}

function AssetsScene() {
  return (
    <div className="scene assetsScene">
      <TopPill title="홍보물 생성 완료" />
      <div className="assetHeader">
        <Eyebrow>Ready to share</Eyebrow>
        <h1>
          랜딩 이미지와 <em>숏폼</em>까지.
        </h1>
      </div>
      <motion.div
        className="assetRail"
        initial={{ x: 80 }}
        animate={{ x: 20 }}
        transition={{ duration: 2.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {assetCards.map((card, i) => (
          <div className="assetCard" key={card.title}>
            <div className="assetPreview" style={{ background: card.color }}>
              {i === 0 ? <PaperMateVisual compact /> : <AssetGlyph index={i} />}
            </div>
            <Eyebrow>{card.title}</Eyebrow>
            <p>{card.body}</p>
          </div>
        ))}
      </motion.div>
      <motion.div
        className="assetToConsumer"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.9 }}
      >
        <span>소비자 추천 카드로 변환</span>
        <ArrowIcon />
      </motion.div>
    </div>
  )
}

function ConsumerHomeScene() {
  return (
    <div className="scene homeScene">
      <header className="consumerHeader">
        <div>
          <Eyebrow>Friday · May 15</Eyebrow>
          <h1>
            필요한 서비스만
            <br />
            <em>찾아보세요.</em>
          </h1>
        </div>
        <Avatar label="S" color="linear-gradient(140deg, #FFD6BA, #E1C9F0)" darkText />
      </header>
      <div className="problemPromptMini">
        <SearchIcon />
        <span>어떤 도움이 필요하신가요?</span>
        <b>추천</b>
      </div>
      <div className="storyRail">
        {[
          ['K', '#FF5A2C', 'KimD...'],
          ['S', '#D4A017', 'ShipF...'],
          ['W', '#3B5BDB', 'WriteS...'],
          ['N', '#1F5F4B', 'Nova...'],
        ].map(([label, color, name]) => (
          <div className="storyItem" key={name}>
            <div className="storyRing" style={{ background: `conic-gradient(from 220deg, ${color}, #F6D89A, ${color})` }}>
              <span style={{ background: color }}>{label}</span>
            </div>
            <small>{name}</small>
          </div>
        ))}
      </div>
      <SectionTitle eyebrow="오늘의 추천 서비스" title="문제별로 정리된 드롭" />
      <div className="recommendGrid">
        <SmallServiceCard title="PaperMate AI" tag="#논문요약" color="#3B5BDB" />
        <SmallServiceCard title="StudyFlow" tag="#학습계획" color="#1F5F4B" />
        <SmallServiceCard title="TeamSync" tag="#팀플도구" color="#FF5A2C" />
      </div>
    </div>
  )
}

function NeedScene({ elapsed }: { elapsed: number }) {
  const text = '논문 읽을 때 핵심만 빠르게 파악하고 싶어요.'
  const local = Math.max(0, elapsed - 28.64)
  const visible = text.slice(0, Math.min(text.length, Math.floor(local * 17)))

  return (
    <div className="scene needScene">
      <div className="needHeader">
        <Eyebrow>Problem first</Eyebrow>
        <h1>
          앱 이름이 아니라, <em>문제</em>를 입력합니다.
        </h1>
      </div>
      <div className="bigSearchPanel">
        <SearchIcon />
        <p>
          {visible}
          <motion.span
            className="caret"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </p>
      </div>
      <motion.button
        className="primaryButton needButton"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, scale: local > 2.2 ? [1, 0.96, 1] : 1 }}
        transition={{ delay: 1.65, scale: { duration: 0.28 } }}
      >
        내게 맞는 서비스 찾기 <ArrowIcon />
      </motion.button>
      <div className="hintCards">
        {['리포트 작성', '팀플 정리', '창업 홍보'].map((hint, i) => (
          <motion.span
            key={hint}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.18 }}
          >
            {hint}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function MatchScene() {
  return (
    <div className="scene matchScene">
      <TopPill title="이런 서비스를 추천드려요" />
      <div className="matchIntro">
        <Eyebrow>Delivery match</Eyebrow>
        <h1>
          필요한 서비스를 <em>배달</em>합니다.
        </h1>
      </div>
      <div className="matchStack">
        <MatchCard
          best
          title="PaperMate AI"
          body="논문을 빠르게 이해하는 AI 리딩 도우미"
          reason="논문 요약과 핵심 문장 추출에 적합합니다."
          delay={0.1}
          color="#3B5BDB"
        />
        <MatchCard
          title="StudyFlow"
          body="공부 계획을 자동으로 정리해주는 도구"
          reason="읽은 논문을 학습 계획으로 연결할 수 있습니다."
          delay={0.42}
          color="#1F5F4B"
        />
        <MatchCard
          title="ResearchClip"
          body="중요 문장을 저장하고 공유하는 리서치 노트"
          reason="자료 조사 내용을 팀원에게 전달하기 좋습니다."
          delay={0.72}
          color="#FF5A2C"
        />
      </div>
    </div>
  )
}

function ClosingScene() {
  return (
    <div className="scene closingScene">
      <motion.div
        className="closingMark"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.42 }}
      >
        <ButterflyIcon />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        앱나리
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
      >
        개발자와 사용자 사이를 연결하는
        <br />
        AI 큐레이션 기반 앱 딜리버리 플랫폼
      </motion.p>
    </div>
  )
}

function TopPill({ title }: { title: string }) {
  return (
    <div className="topPill">
      <div className="backCircle">
        <ChevronLeftIcon />
      </div>
      <span>{title}</span>
      <div className="backCircle ghostCircle" />
    </div>
  )
}

function Field({
  label,
  value,
  mono,
  large,
  delay,
}: {
  label: string
  value: string
  mono?: boolean
  large?: boolean
  delay: number
}) {
  return (
    <motion.div
      className="fieldBlock"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
    >
      <Eyebrow>{label}</Eyebrow>
      <div className={`fakeInput ${large ? 'large' : ''} ${mono ? 'mono' : ''}`}>
        {value}
      </div>
    </motion.div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  const isKorean = typeof children === 'string' && /[가-힣]/.test(children)
  return <span className={`eyebrow ${isKorean ? 'koreanEyebrow' : ''}`}>{children}</span>
}

function Avatar({
  label,
  color,
  darkText,
}: {
  label: string
  color: string
  darkText?: boolean
}) {
  return (
    <div className="avatar" style={{ background: color, color: darkText ? '#1A1815' : '#fff' }}>
      {label}
    </div>
  )
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="sectionTitle">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
    </div>
  )
}

function SmallServiceCard({ title, tag, color }: { title: string; tag: string; color: string }) {
  return (
    <div className="smallServiceCard">
      <div className="smallVisual" style={{ background: color }} />
      <strong>{title}</strong>
      <span>{tag}</span>
    </div>
  )
}

function MatchCard({
  title,
  body,
  reason,
  color,
  best,
  delay,
}: {
  title: string
  body: string
  reason: string
  color: string
  best?: boolean
  delay: number
}) {
  return (
    <motion.div
      className={`matchCard ${best ? 'best' : ''}`}
      initial={{ opacity: 0, y: 72 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.48, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="matchVisual" style={{ background: color }}>
        P
      </div>
      <div className="matchCopy">
        <div className="matchTop">
          <strong>{title}</strong>
          {best && <span>추천 1순위</span>}
        </div>
        <p>{body}</p>
        <div className="reasonBox">
          <Eyebrow>추천 이유</Eyebrow>
          <small>{reason}</small>
        </div>
        <div className="tagLine">#논문요약 #AI리딩 #대학생</div>
      </div>
    </motion.div>
  )
}

function PaperMateVisual({ compact }: { compact?: boolean }) {
  return (
    <div className={`paperMateVisual ${compact ? 'compact' : ''}`}>
      <div className="paperDoc">
        <span />
        <span />
        <span />
      </div>
      <div className="paperPulse">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

function AssetGlyph({ index }: { index: number }) {
  if (index === 1) return <GlobeIcon />
  if (index === 2) return <StoryIcon />
  if (index === 3) return <PlayIcon />
  return <ShareIcon />
}

function SparkIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function ButterflyIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M15.1 15.2C11.9 9.1 8.5 6.5 5.6 7.3C2.5 8.2 2.7 12.3 5.2 15.2C7.3 17.6 10.7 18.2 15.1 15.2Z"
        fill="currentColor"
      />
      <path
        d="M16.9 15.2C20.1 9.1 23.5 6.5 26.4 7.3C29.5 8.2 29.3 12.3 26.8 15.2C24.7 17.6 21.3 18.2 16.9 15.2Z"
        fill="currentColor"
      />
      <path
        d="M14.5 17.2C10.8 16.1 7.7 16.9 6.4 19.1C5 21.4 6.7 24.4 9.5 25C12.4 25.6 14.2 22.7 14.5 17.2Z"
        fill="currentColor"
        opacity=".78"
      />
      <path
        d="M17.5 17.2C21.2 16.1 24.3 16.9 25.6 19.1C27 21.4 25.3 24.4 22.5 25C19.6 25.6 17.8 22.7 17.5 17.2Z"
        fill="currentColor"
        opacity=".78"
      />
      <path
        d="M16 13.8V23.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.7 10.2C14.6 11.2 15.2 12.1 16 13.8C16.8 12.1 17.4 11.2 18.3 10.2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5L10 17l9-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.6" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="white" strokeWidth="1.4" />
    </svg>
  )
}

function StoryIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="3" width="12" height="18" rx="3" stroke="white" strokeWidth="1.7" />
      <path d="M9 8h6M9 12h5M9 16h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="1.6" />
      <path d="M10 8.5l6 3.5-6 3.5v-7z" fill="white" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="2.4" stroke="white" strokeWidth="1.6" />
      <circle cx="18" cy="6" r="2.4" stroke="white" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="2.4" stroke="white" strokeWidth="1.6" />
      <path d="M8 11l8-4M8 13l8 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const styles = `
  :root {
    --sv-cream: #F7F3EC;
    --sv-cream-2: #EFE9DF;
    --sv-surface: #FFFFFF;
    --sv-ink: #1A1815;
    --sv-ink-soft: #6E665C;
    --sv-ink-faint: #A8A097;
    --sv-line: #E8E2D7;
    --sv-line-2: #DBD3C4;
    --sv-coral: #FF5A2C;
    --sv-coral-ink: #C7390F;
    --sv-mint: #1F5F4B;
    --sv-butter: #F6D89A;
    --sv-sky: #BFD9F0;
    --sv-shadow-card: 0 1px 0 rgba(24,20,12,0.04), 0 8px 24px -10px rgba(24,20,12,0.10);
    --sv-shadow-pop: 0 4px 14px rgba(24,20,12,0.07), 0 30px 60px -20px rgba(24,20,12,0.25);
  }

  .shortVideoStage {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    overflow: hidden;
    background:
      radial-gradient(1200px 800px at 20% -10%, #F1E7D6 0%, transparent 60%),
      radial-gradient(1000px 700px at 110% 20%, #E8E0F0 0%, transparent 55%),
      #F2ECE0;
    color: var(--sv-ink);
  }

  .phoneMount {
    position: relative;
  }

  .phoneFrame {
    width: 402px;
    height: 874px;
    transform-origin: top left;
    border-radius: 48px;
    overflow: hidden;
    position: relative;
    background: var(--sv-cream);
    box-shadow:
      0 30px 70px rgba(20,16,10,0.18),
      0 0 0 1px rgba(20,16,10,0.08),
      0 0 0 8px #1A1815,
      0 0 0 9px rgba(255,255,255,0.05);
    font-family: var(--font-sans, -apple-system, system-ui, sans-serif);
    -webkit-font-smoothing: antialiased;
  }

  .dynamicIsland {
    position: absolute;
    top: 11px;
    left: 50%;
    z-index: 100;
    width: 116px;
    height: 32px;
    transform: translateX(-50%);
    border-radius: 22px;
    background: #000;
  }

  .statusBar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 90;
    height: 54px;
    padding: 14px 26px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #000;
    font-family: -apple-system, system-ui, sans-serif;
    font-size: 15px;
    font-weight: 600;
    pointer-events: none;
  }

  .statusIcons {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .homeIndicator {
    position: absolute;
    bottom: 6px;
    left: 50%;
    z-index: 100;
    width: 130px;
    height: 4px;
    transform: translateX(-50%);
    border-radius: 4px;
    background: rgba(0,0,0,0.25);
    pointer-events: none;
  }

  .progressTrack {
    position: absolute;
    left: 24px;
    right: 24px;
    top: 58px;
    z-index: 80;
    height: 3px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(24,20,12,0.08);
  }

  .progressFill {
    width: 100%;
    height: 100%;
    transform-origin: 0 50%;
    border-radius: inherit;
    background: var(--sv-coral);
  }

  .sceneLayer {
    position: absolute;
    inset: 0;
    top: 66px;
  }

  .scene {
    position: absolute;
    inset: 0;
    overflow: hidden;
    padding-bottom: 44px;
    background: var(--sv-cream);
  }

  .shortVideoStage:not([data-scene="opening"]):not([data-scene="closing"]) .scene {
    bottom: 122px;
    padding-bottom: 24px;
  }

  .subtitleOverlay {
    position: absolute;
    left: 30px;
    right: 30px;
    bottom: 44px;
    z-index: 86;
    min-height: 64px;
    padding: 13px 18px;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: rgba(16, 14, 12, 0.92);
    color: white;
    box-shadow: 0 14px 34px -18px rgba(0, 0, 0, 0.52);
    text-align: center;
    pointer-events: none;
  }

  .subtitleOverlay span {
    display: block;
    max-width: 100%;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.32;
    letter-spacing: -0.1px;
    word-break: keep-all;
  }

  .eyebrow {
    display: inline-block;
    color: var(--sv-ink-faint);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1.5px;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .eyebrow.koreanEyebrow {
    font-family: var(--font-sans, -apple-system, system-ui, sans-serif);
    font-weight: 600;
    letter-spacing: 0;
    text-transform: none;
  }

  .brandLockup {
    position: absolute;
    left: 54px;
    right: 54px;
    top: 300px;
    z-index: 8;
    padding: 28px 20px;
    border-radius: 28px;
    text-align: center;
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(232,226,215,0.86);
    box-shadow: var(--sv-shadow-pop);
    backdrop-filter: blur(16px);
  }

  .appMark,
  .closingMark {
    width: 56px;
    height: 56px;
    margin: 0 auto 12px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    background: var(--sv-ink);
    color: white;
    font-size: 24px;
  }

  .appMark svg,
  .closingMark svg {
    width: 31px;
    height: 31px;
  }

  .brandName {
    margin-bottom: 8px;
    font-family: var(--font-sans, -apple-system, system-ui, sans-serif);
    font-size: 46px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -1.2px;
  }

  .brandLockup .eyebrow {
    font-family: inherit;
    letter-spacing: 0;
    font-weight: 650;
  }

  .brandSubtitle {
    max-width: 236px;
    margin: 0 auto;
    color: var(--sv-ink-faint);
    font-family: var(--font-sans, -apple-system, system-ui, sans-serif);
    font-size: 12px;
    font-weight: 550;
    line-height: 1.5;
    letter-spacing: 0;
    word-break: keep-all;
  }

  .miniAppCard {
    position: absolute;
    z-index: 2;
    width: 146px;
    padding: 10px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.62);
    box-shadow: var(--sv-shadow-card);
  }

  .miniIcon {
    width: 32px;
    height: 32px;
    margin-bottom: 10px;
    border-radius: 11px;
  }

  .miniTitle {
    color: var(--sv-ink);
    font-size: 12px;
    font-weight: 650;
    letter-spacing: -0.1px;
  }

  .buriedCard {
    position: absolute;
    width: 132px;
    height: 72px;
    padding: 12px;
    border-radius: 18px;
    display: flex;
    align-items: flex-end;
    border: 1px solid rgba(255,255,255,0.55);
    box-shadow: var(--sv-shadow-card);
  }

  .buriedCard span {
    font-size: 11px;
    font-weight: 650;
  }

  .lostService {
    position: absolute;
    top: 286px;
    left: 72px;
    z-index: 2;
    width: 258px;
    padding: 14px;
    display: flex;
    gap: 12px;
    align-items: center;
    border-radius: 22px;
    background: rgba(255,255,255,0.74);
    border: 1px solid var(--sv-line);
    box-shadow: var(--sv-shadow-pop);
    filter: saturate(0.82);
  }

  .serviceDot {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: #3B5BDB;
    color: white;
    font-family: var(--font-serif, Georgia, serif);
    font-size: 24px;
  }

  .lostService strong,
  .lostService span {
    display: block;
  }

  .lostService strong {
    font-size: 14px;
  }

  .lostService span {
    margin-top: 2px;
    color: var(--sv-ink-soft);
    font-size: 12px;
  }

  .thoughtBubble {
    width: fit-content;
    padding: 7px 10px;
    border-radius: 999px;
    background: var(--sv-ink);
    color: white;
    font-size: 11px;
    font-weight: 650;
    box-shadow: var(--sv-shadow-card);
    white-space: nowrap;
  }

  .developerCard {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 62px;
    z-index: 4;
    padding: 16px;
    border-radius: 24px;
    display: flex;
    gap: 13px;
    align-items: flex-start;
    background: white;
    border: 1px solid var(--sv-line);
    box-shadow: var(--sv-shadow-card);
  }

  .founderCopy {
    min-width: 0;
    flex: 1;
  }

  .developerCard p {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--sv-ink);
  }

  .founderBubbles {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 1px 0 rgba(0,0,0,.04), 0 4px 10px -2px rgba(0,0,0,.08);
  }

  .topPill {
    height: 44px;
    margin: 4px 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--sv-ink-soft);
    font-size: 13px;
    font-weight: 600;
  }

  .backCircle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(255,255,255,0.8);
    border: 1px solid var(--sv-line-2);
    color: var(--sv-ink);
  }

  .ghostCircle {
    opacity: 0;
  }

  .submitPanel {
    margin: 18px 22px 0;
  }

  .submitPanel h1,
  .generatorHero h1,
  .assetHeader h1,
  .consumerHeader h1,
  .needHeader h1,
  .matchIntro h1,
  .sectionTitle h2 {
    margin: 4px 0 0;
    font-family: var(--font-serif, Georgia, serif);
    font-weight: 400;
    letter-spacing: -0.3px;
    line-height: 1.1;
  }

  .submitPanel h1 {
    font-size: 32px;
    margin-bottom: 20px;
  }

  em {
    color: var(--sv-coral);
    font-style: normal;
    font-weight: 700;
  }

  .fieldBlock {
    margin-top: 14px;
  }

  .fieldBlock .eyebrow {
    margin-bottom: 6px;
  }

  .fakeInput {
    width: 100%;
    min-height: 45px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    border-radius: 14px;
    background: #fff;
    border: 1px solid var(--sv-line);
    color: var(--sv-ink);
    font-size: 14px;
    line-height: 1.35;
  }

  .fakeInput.large {
    min-height: 82px;
    align-items: flex-start;
  }

  .fakeInput.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
  }

  .primaryButton {
    width: 100%;
    height: 50px;
    margin-top: 22px;
    border: 0;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--sv-coral);
    color: white;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 16px -6px rgba(0,0,0,.25);
  }

  .generatorHero {
    margin: 20px 22px 0;
    padding: 18px;
    border-radius: 28px;
    display: flex;
    gap: 16px;
    align-items: center;
    background: var(--sv-ink);
    color: white;
    box-shadow: var(--sv-shadow-pop);
  }

  .generatorHero .eyebrow {
    color: rgba(255,255,255,0.56);
  }

  .generatorHero h1 {
    font-size: 24px;
    word-break: keep-all;
  }

  .spinnerTile {
    position: relative;
    width: 70px;
    height: 70px;
    flex: 0 0 auto;
    border-radius: 23px;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: #0F0D0B;
    color: var(--sv-coral);
  }

  .spinnerRing {
    position: absolute;
    inset: -20px;
    background: conic-gradient(from 0deg, transparent 0deg, #FF5A2C 96deg, transparent 190deg);
  }

  .spinnerTile svg {
    position: relative;
    z-index: 2;
    width: 28px;
    height: 28px;
  }

  .resultPanel {
    margin: 14px 16px 0;
    padding: 14px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: white;
    border: 1px solid var(--sv-line);
    box-shadow: var(--sv-shadow-card);
  }

  .resultRow {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .checkDot {
    width: 20px;
    height: 20px;
    margin-top: 2px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--sv-mint);
    color: white;
    flex: 0 0 auto;
  }

  .resultRow p {
    margin: 3px 0 0;
    color: var(--sv-ink);
    font-size: 13px;
    line-height: 1.35;
  }

  .generatedPreview {
    margin: 14px 16px 0;
    height: 128px;
    border-radius: 22px;
    overflow: hidden;
    background: #3B5BDB;
    box-shadow: var(--sv-shadow-card);
  }

  .paperMateVisual {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 92px;
    overflow: hidden;
    background:
      radial-gradient(80px 70px at 82% 18%, rgba(255,255,255,0.24), transparent),
      linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.16));
  }

  .paperDoc {
    position: absolute;
    left: 18px;
    top: 18px;
    width: 82px;
    height: 100px;
    padding: 16px 12px;
    border-radius: 14px;
    background: rgba(255,255,255,0.92);
    box-shadow: 0 12px 24px rgba(0,0,0,0.18);
  }

  .paperMateVisual.compact .paperDoc {
    width: 64px;
    height: 74px;
    left: 14px;
    top: 13px;
    padding: 12px 9px;
    border-radius: 12px;
  }

  .paperDoc span {
    display: block;
    height: 6px;
    margin-bottom: 9px;
    border-radius: 999px;
    background: #BFD9F0;
  }

  .paperDoc span:nth-child(2) {
    width: 72%;
    background: #E8E2D7;
  }

  .paperDoc span:nth-child(3) {
    width: 86%;
    background: #FFB68A;
  }

  .paperPulse {
    position: absolute;
    right: 18px;
    bottom: 18px;
    display: flex;
    gap: 6px;
    align-items: end;
  }

  .paperPulse i {
    display: block;
    width: 12px;
    height: 46px;
    border-radius: 999px;
    background: rgba(255,255,255,0.74);
    animation: pulseBar 0.9s ease-in-out infinite;
  }

  .paperPulse i:nth-child(2) {
    height: 66px;
    animation-delay: 0.12s;
  }

  .paperPulse i:nth-child(3) {
    height: 34px;
    animation-delay: 0.24s;
  }

  .assetHeader {
    padding: 22px 22px 0;
  }

  .assetHeader h1 {
    font-size: 32px;
  }

  .assetRail {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    padding-left: 22px;
    width: max-content;
  }

  .assetCard {
    width: 152px;
    padding: 12px;
    border-radius: 22px;
    background: white;
    border: 1px solid var(--sv-line);
    box-shadow: var(--sv-shadow-card);
  }

  .assetPreview {
    height: 132px;
    margin-bottom: 12px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    overflow: hidden;
    color: white;
  }

  .assetCard p {
    margin: 4px 0 0;
    color: var(--sv-ink);
    font-size: 12px;
    line-height: 1.35;
    font-weight: 650;
  }

  .assetToConsumer {
    position: absolute;
    left: 43px;
    right: 43px;
    bottom: 86px;
    height: 52px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--sv-ink);
    color: white;
    font-size: 13px;
    font-weight: 700;
    box-shadow: var(--sv-shadow-pop);
  }

  .consumerHeader {
    padding: 14px 22px 0;
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  .consumerHeader h1 {
    font-size: 31px;
    word-break: keep-all;
  }

  .problemPromptMini {
    margin: 16px 16px 0;
    padding: 22px;
    border-radius: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--sv-ink);
    color: rgba(255,255,255,0.58);
    box-shadow: var(--sv-shadow-pop);
  }

  .problemPromptMini span {
    flex: 1;
    font-size: 13.5px;
  }

  .problemPromptMini b {
    padding: 7px 10px;
    border-radius: 999px;
    background: var(--sv-coral);
    color: white;
    font-size: 12px;
  }

  .storyRail {
    margin: 20px 16px 0;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .storyItem {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .storyRing {
    width: 60px;
    height: 60px;
    padding: 2.5px;
    border-radius: 50%;
  }

  .storyRing span {
    width: 100%;
    height: 100%;
    border: 2.5px solid #fff;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: white;
    font-weight: 650;
    font-size: 22px;
  }

  .storyItem small {
    max-width: 64px;
    overflow: hidden;
    color: var(--sv-ink-soft);
    font-size: 10.5px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sectionTitle {
    margin: 20px 22px 10px;
  }

  .sectionTitle h2 {
    font-size: 22px;
  }

  .recommendGrid {
    display: flex;
    gap: 10px;
    padding-left: 16px;
  }

  .smallServiceCard {
    width: 118px;
    padding: 10px;
    border-radius: 20px;
    background: white;
    border: 1px solid var(--sv-line);
    box-shadow: var(--sv-shadow-card);
  }

  .smallVisual {
    height: 62px;
    margin-bottom: 10px;
    border-radius: 14px;
  }

  .smallServiceCard strong {
    display: block;
    font-size: 12.5px;
    letter-spacing: -0.1px;
  }

  .smallServiceCard span {
    display: block;
    margin-top: 4px;
    color: var(--sv-ink-soft);
    font-size: 11px;
  }

  .wideServiceCard {
    margin: 0 16px;
    height: 108px;
    padding: 12px;
    border-radius: 24px;
    display: flex;
    gap: 12px;
    align-items: center;
    background: white;
    border: 1px solid var(--sv-line);
    box-shadow: var(--sv-shadow-card);
  }

  .wideServiceCard .paperMateVisual {
    width: 92px;
    min-height: 82px;
    border-radius: 17px;
    flex: 0 0 auto;
    background-color: #3B5BDB;
  }

  .wideServiceCard strong {
    font-size: 15px;
  }

  .wideServiceCard p {
    margin: 5px 0 0;
    color: var(--sv-ink-soft);
    font-size: 12.5px;
    line-height: 1.35;
  }

  .needHeader {
    padding: 58px 28px 0;
    text-align: center;
  }

  .needHeader h1 {
    font-size: 32px;
    word-break: keep-all;
  }

  .bigSearchPanel {
    margin: 32px 22px 0;
    min-height: 168px;
    padding: 20px;
    border-radius: 28px;
    background: white;
    border: 1px solid var(--sv-line);
    box-shadow: var(--sv-shadow-pop);
    color: var(--sv-ink);
  }

  .bigSearchPanel svg {
    color: var(--sv-ink-faint);
  }

  .bigSearchPanel p {
    margin: 20px 0 0;
    min-height: 64px;
    font-size: 24px;
    line-height: 1.35;
    letter-spacing: -0.2px;
    font-weight: 650;
  }

  .caret {
    display: inline-block;
    width: 2px;
    height: 24px;
    margin-left: 3px;
    vertical-align: -4px;
    background: var(--sv-coral);
  }

  .needButton {
    width: calc(100% - 44px);
    margin-left: 22px;
    margin-right: 22px;
    background: var(--sv-ink);
  }

  .hintCards {
    margin: 18px 22px 0;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .hintCards span {
    padding: 8px 12px;
    border-radius: 999px;
    background: var(--sv-cream-2);
    color: var(--sv-ink-soft);
    font-size: 12px;
    font-weight: 650;
  }

  .matchIntro {
    padding: 18px 22px 0;
  }

  .matchIntro h1 {
    font-size: 32px;
  }

  .matchStack {
    margin: 18px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .matchCard {
    padding: 12px;
    border-radius: 24px;
    display: flex;
    gap: 12px;
    background: white;
    border: 1px solid var(--sv-line);
    box-shadow: var(--sv-shadow-card);
  }

  .matchCard.best {
    border-color: rgba(255,90,44,0.44);
    box-shadow: var(--sv-shadow-pop);
  }

  .matchVisual {
    width: 56px;
    height: 56px;
    border-radius: 17px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    color: white;
    font-family: var(--font-serif, Georgia, serif);
    font-size: 28px;
  }

  .matchCopy {
    min-width: 0;
    flex: 1;
  }

  .matchTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .matchTop strong {
    font-size: 14px;
  }

  .matchTop span {
    padding: 3px 7px;
    border-radius: 999px;
    background: var(--sv-coral);
    color: white;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: -0.1px;
    white-space: nowrap;
  }

  .matchCopy p {
    margin: 4px 0 0;
    color: var(--sv-ink-soft);
    font-size: 12px;
    line-height: 1.35;
  }

  .reasonBox {
    margin-top: 9px;
    padding: 9px;
    border-radius: 14px;
    background: var(--sv-cream);
  }

  .reasonBox small {
    display: block;
    margin-top: 3px;
    color: var(--sv-ink);
    font-size: 11.5px;
    line-height: 1.35;
  }

  .tagLine {
    margin-top: 8px;
    color: var(--sv-coral-ink);
    font-size: 11px;
    font-weight: 650;
  }

  .closingScene {
    display: grid;
    place-items: center;
    align-content: center;
    text-align: center;
    gap: 0;
  }

  .closingScene h1 {
    margin: 0;
    font-family: var(--font-sans, -apple-system, system-ui, sans-serif);
    font-size: 58px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -1.5px;
  }

  .closingScene p {
    margin: 14px 0 0;
    color: var(--sv-ink-soft);
    font-size: 17px;
    line-height: 1.45;
    font-weight: 600;
    letter-spacing: -0.1px;
  }

  @keyframes pulseBar {
    0%, 100% { transform: scaleY(0.4); opacity: 0.65; }
    50% { transform: scaleY(1); opacity: 1; }
  }
`
