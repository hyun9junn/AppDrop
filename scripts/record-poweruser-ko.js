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

  await context.addInitScript(() => {
    localStorage.setItem('locale', 'ko')
  })

  const page = await context.newPage()

  // Discover home
  await page.goto(`${BASE}/`)
  await page.waitForTimeout(1200)

  // Tap first story ring
  await page.click('a[href="/story/resume-ai"]')
  await page.waitForTimeout(1000)

  // Story viewer
  await page.waitForTimeout(2500)

  await page.click('button:has-text("부스트")', { force: true })
  await page.waitForTimeout(900)

  await page.click('button:has-text("크리에이터 저장")', { force: true })
  await page.waitForTimeout(900)

  await page.click('button[aria-label="Next story"]')
  await page.waitForTimeout(1800)

  await page.click('button:has-text("✕")', { force: true })
  await page.waitForTimeout(1000)

  // My Feed tab
  await page.click('a[href="/feed"]')
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }))
  await page.waitForTimeout(1200)

  // Collections tab
  await page.click('a[href="/collections"]')
  await page.waitForTimeout(1000)

  await page.click('a[href="/collections/solo-founder"]')
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'smooth' }))
  await page.waitForTimeout(1200)

  // Profile tab
  await page.click('a[href="/profile"]')
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }))
  await page.waitForTimeout(1500)

  await page.close()
  const videoPath = await page.video().path()
  await context.close()
  await browser.close()

  const dest = path.join(OUT, '3-power-user-flow-ko.webm')
  fs.renameSync(videoPath, dest)
  console.log(`Saved: ${dest}`)
}

main().catch(err => { console.error(err); process.exit(1) })
