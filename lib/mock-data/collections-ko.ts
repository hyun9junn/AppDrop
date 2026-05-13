import type { Collection } from '../types'

export const collectionsKo: Record<string, Partial<Collection>> = {
  'solo-founder': {
    title: '1인 창업자 스타터팩',
    description: '팀 없이 아이디어에서 출시까지 — 필요한 모든 도구',
  },
  'content-creator': {
    title: '콘텐츠 크리에이터 툴킷',
    description: '스크립트 작성, 편집, 게시까지 더 빠르게',
  },
  'podcast-kit': {
    title: '팟캐스트 제작 키트',
    description: '녹음부터 전사, 배포까지 한 번에',
  },
  'student-pack': {
    title: '학생 생산성 팩',
    description: '필기, 요약, 학습을 위한 도구 모음',
  },
}
