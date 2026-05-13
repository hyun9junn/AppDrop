import type { App } from '../types'

type AppKoOverride = Partial<Omit<App, 'storyCard'>> & {
  storyCard?: Partial<App['storyCard']>
}

export const appsKo: Record<string, AppKoOverride> = {
  'resume-ai': {
    tagline: '60초 안에 채용공고 맞춤 이력서 완성',
    description: '채용공고를 붙여넣고 이력서를 업로드하면 즉시 맞춤화된 버전을 받아볼 수 있어요. 복잡한 설정 없이 바로 사용 가능해요.',
    useCases: [
      '특정 채용공고에 맞춰 이력서 맞춤화',
      '채용공고의 키워드를 자동으로 반영',
      '나만의 문체와 포맷 그대로 유지',
    ],
    storyCard: {
      problemStatement: '채용공고마다 이력서를 새로 쓰는 데 너무 많은 시간이 걸려요',
      solutionStatement: '채용공고 붙여넣기 → 이력서 업로드 → 60초 안에 맞춤 이력서 완성',
      features: ['키워드 자동 매칭', '나만의 문체 유지', '모든 파일 형식 지원'],
    },
    socialCopy: {
      twitter: '지난주 이력서 맞춤화하는 데 2시간 걸렸어요 😤\n\nResumeAI는 60초면 끝나요. 채용공고 붙여넣기, 이력서 업로드, 완성.\n\n무료 → [링크]',
      linkedin: '이력서 맞춤화를 즉시 해결하는 무료 도구를 만들었어요.\n\nResumeAI는 채용공고를 읽고 자동으로 이력서를 최적화해줘요 — 내 문체 그대로.',
    },
  },
  'pixeldrop': {
    tagline: '한 번 업로드, 모든 사이즈 즉시 완성',
    description: '몇 초 만에 모든 플랫폼에 맞는 이미지 크기를 조정하세요. 포토샵도 캔바도 필요 없어요.',
    useCases: [
      'Shopify 상품 이미지 크기 조정',
      'Instagram, Twitter, LinkedIn용 이미지 한 번에 준비',
      '디자인 툴 없이 배경 제거',
    ],
    storyCard: {
      problemStatement: '플랫폼마다 이미지 크기 조정하는 데 매주 몇 시간씩 낭비되고 있어요',
      solutionStatement: '한 번만 업로드하면 모든 사이즈로 즉시 변환 — 디자인 실력 불필요',
      features: ['이미지 일괄 크기 조정', '주요 플랫폼 사이즈 자동 지원', '배경 제거 포함'],
    },
    socialCopy: {
      twitter: '게시물 올리기 전에 이미지 리사이징에 20분씩 쓰고 있나요? 😤\n\nPixelDrop은 3초면 돼요. 업로드 한 번 → 모든 사이즈 완성.\n\n무료 → [링크]',
      linkedin: '소셜 미디어 담당자가 매주 2시간을 아낄 수 있는 무료 도구를 만들었어요.\n\nPixelDrop은 이미지를 한 번 업로드하면 모든 사이즈로 자동 변환해줘요.',
    },
  },
  'voicenote-pro': {
    tagline: '음성 메모를 즉시 구조화된 텍스트로',
    description: '음성 녹음을 업로드하면 AI가 전사하고, 요약하고, 실행 가능한 메모로 변환해줘요.',
    useCases: [
      '회의 녹음 자동 전사',
      '음성 메모를 글머리 기호 요약으로 변환',
      '30개 이상 언어 지원',
    ],
    storyCard: {
      problemStatement: '회의 녹음 파일을 수동으로 정리하는 데 너무 많은 시간이 걸려요',
      solutionStatement: '녹음 파일 업로드 → AI가 전사·요약·정리까지 한 번에',
      features: ['자동 전사 및 요약', '글머리 기호 변환', '30개 이상 언어 지원'],
    },
    socialCopy: {
      twitter: '회의 메모 정리하느라 좋은 아이디어를 절반은 잃어버렸어요.\n\nVoiceNote Pro는 자동으로 전사·요약·액션 아이템까지 추출해줘요.\n\n무료 체험 → [링크]',
      linkedin: '이제 모든 음성 메모가 검색 가능한 구조화된 노트로 자동 변환돼요.',
    },
  },
  'blogai': {
    tagline: '메모를 SEO 최적화 블로그 글로',
    description: '간단한 메모나 키워드를 입력하면 AI가 완성된 블로그 포스트를 내 문체로 작성해줘요.',
    useCases: [
      '메모로 블로그 초안 작성',
      'SEO 키워드 자동 최적화',
      '내 문체에 맞게 편집',
    ],
    storyCard: {
      problemStatement: '블로그 포스트 하나 완성하는 데 몇 시간씩 걸려요',
      solutionStatement: '메모와 키워드를 입력하면 AI가 완성된 글을 내 문체로 작성해줘요',
      features: ['메모 기반 글 작성', 'SEO 키워드 자동 최적화', '문체 커스터마이징'],
    },
    socialCopy: {
      twitter: '메모는 좋았어요. 블로그 글이 문제였어요.\n\nBlogAI가 해결해줘요. 메모 붙여넣기 → 완성된 글 받기.\n\n무료 → [링크]',
      linkedin: '좋은 아이디어와 좋은 블로그 글 사이의 간격이 3시간의 재작성이었어요.',
    },
  },
  'launchkit': {
    tagline: '아이디어에서 런칭 페이지까지 몇 분 안에',
    description: '한 문단 설명만으로 랜딩 페이지, 대기자 명단, 출시 체크리스트를 즉시 생성해줘요.',
    useCases: [
      '개발 전에 대기자 명단 페이지 구축',
      '실제 랜딩 페이지로 제품 아이디어 검증',
      '디자이너 없이 첫 버전 출시',
    ],
    storyCard: {
      problemStatement: '개발자·디자이너 없이 제품을 빠르게 출시하는 게 너무 어려워요',
      solutionStatement: '제품을 한 문단으로 설명하면 완성된 런칭 페이지를 몇 분 안에 받아볼 수 있어요',
      features: ['랜딩 페이지 카피 자동 생성', '내장 대기자 명단 폼', '원클릭 게시'],
    },
    socialCopy: {
      twitter: '어제 8분 만에 제품 페이지를 만들었어요.\n\nLaunchKit은 설명만 입력하면 카피, 레이아웃, 대기자 명단 폼을 모두 생성해줘요.\n\n무료 체험 → [링크]',
      linkedin: '아이디어를 실제 랜딩 페이지로 테스트하는 게 훨씬 쉬워졌어요.',
    },
  },
}
