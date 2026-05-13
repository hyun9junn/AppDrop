const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = 'http://localhost:3000'
const OUT = path.join(__dirname, '../recordings')

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
  })

  // Set Korean locale before any page script runs
  await context.addInitScript(() => {
    localStorage.setItem('locale', 'ko')
  })

  const page = await context.newPage()

  await page.goto(`${BASE}/submit`)
  await page.waitForTimeout(1500)

  await page.fill('input[placeholder*="https://"]', 'https://resumeai.example.com')
  await page.waitForTimeout(400)

  await page.fill('textarea[placeholder*="1~2문장"]', '채용공고마다 이력서를 새로 쓰는 데 너무 많은 시간이 걸려요')
  await page.waitForTimeout(400)

  await page.fill('input[placeholder*="프리랜서"]', '여러 회사에 지원하는 구직자')
  await page.waitForTimeout(400)

  await page.fill('textarea[placeholder*="핵심"]', '키워드 자동 매칭, 문체 유지, 다양한 파일 형식 지원')
  await page.waitForTimeout(400)

  await page.click('button:has-text("Web App")')
  await page.waitForTimeout(300)

  await page.click('button:has-text("free")')
  await page.waitForTimeout(300)

  await page.fill('input[placeholder*="글쓰기"]', '글쓰기, AI, 생산성')
  await page.waitForTimeout(500)

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
  await page.waitForTimeout(600)

  await page.click('button:has-text("앱 패키지 생성하기")')
  await page.waitForTimeout(3500)

  // Preview page
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }))
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }))
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
  await page.waitForTimeout(800)

  await page.click('a:has-text("앱 게시하기")')
  await page.waitForTimeout(2000)

  await page.close()
  const videoPath = await page.video().path()
  await context.close()
  await browser.close()

  const dest = path.join(OUT, '1-developer-flow-ko.webm')
  fs.renameSync(videoPath, dest)
  console.log(`Saved: ${dest}`)
}

main().catch(err => { console.error(err); process.exit(1) })
