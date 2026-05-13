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
  const page = await context.newPage()

  // 1. Discover home
  await page.goto(`${BASE}/`)
  await page.waitForTimeout(1200)

  // 2. Tap first story ring (resume-ai)
  await page.click('a[href="/story/resume-ai"]')
  await page.waitForTimeout(1000)

  // 3. Story viewer — read the card
  await page.waitForTimeout(2500)

  // 4. Boost (force bypasses the transparent tap-zone overlay)
  await page.click('button:has-text("Boost")', { force: true })
  await page.waitForTimeout(900)

  // 5. Save Creator
  await page.click('button:has-text("Save Creator")', { force: true })
  await page.waitForTimeout(900)

  // 6. Tap next story
  await page.click('button[aria-label="Next story"]')
  await page.waitForTimeout(1800)

  // 7. Close → back to home
  await page.click('button:has-text("✕")', { force: true })
  await page.waitForTimeout(1000)

  // 8. My Feed tab
  await page.click('a[href="/feed"]')
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }))
  await page.waitForTimeout(1200)

  // 9. Collections tab
  await page.click('a[href="/collections"]')
  await page.waitForTimeout(1000)

  // Open first collection (solo-founder)
  await page.click('a[href="/collections/solo-founder"]')
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'smooth' }))
  await page.waitForTimeout(1200)

  // 10. Profile tab
  await page.click('a[href="/profile"]')
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }))
  await page.waitForTimeout(1500)

  await page.close()
  const videoPath = await page.video().path()
  await context.close()
  await browser.close()

  const dest = path.join(OUT, '3-power-user-flow.webm')
  fs.renameSync(videoPath, dest)
  console.log(`Saved: ${dest}`)
}

main().catch(err => { console.error(err); process.exit(1) })
