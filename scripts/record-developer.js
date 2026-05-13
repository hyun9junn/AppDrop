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

  // 1. Submit form
  await page.goto(`${BASE}/submit`)
  await page.waitForTimeout(1200)

  await page.fill('input[placeholder*="https://"]', 'https://resumeai.example.com')
  await page.waitForTimeout(400)

  await page.fill('textarea[placeholder*="problem"]', 'Tailoring your CV to every job description takes way too long')
  await page.waitForTimeout(400)

  await page.fill('input[placeholder*="freelancers"]', 'Job seekers applying to multiple companies')
  await page.waitForTimeout(400)

  await page.fill('textarea[placeholder*="features"]', 'Keyword matching, voice preservation, multi-format support')
  await page.waitForTimeout(400)

  await page.click('button:has-text("Web App")')
  await page.waitForTimeout(300)

  await page.click('button:has-text("free")')
  await page.waitForTimeout(300)

  await page.fill('input[placeholder*="writing"]', 'writing, AI, productivity')
  await page.waitForTimeout(500)

  // Scroll to bottom so CTA is visible
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
  await page.waitForTimeout(600)

  // 2. Submit → generating
  await page.click('button:has-text("Generate My App Package")')
  await page.waitForTimeout(3500) // animation + auto-advance to preview

  // 3. Preview — scroll to show Story card then social copy
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }))
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }))
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
  await page.waitForTimeout(800)

  // 4. Publish
  await page.click('a:has-text("Publish App")')
  await page.waitForTimeout(2000)

  await page.close()
  const videoPath = await page.video().path()
  await context.close()
  await browser.close()

  const dest = path.join(OUT, '1-developer-flow.webm')
  fs.renameSync(videoPath, dest)
  console.log(`Saved: ${dest}`)
}

main().catch(err => { console.error(err); process.exit(1) })
