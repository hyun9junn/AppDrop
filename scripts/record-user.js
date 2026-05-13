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

  // 1. Discover home — let the layout breathe
  await page.goto(`${BASE}/`)
  await page.waitForTimeout(1500)

  // Scroll story rings slightly
  await page.evaluate(() => {
    const row = document.querySelector('.overflow-x-auto')
    if (row) row.scrollBy({ left: 100, behavior: 'smooth' })
  })
  await page.waitForTimeout(900)

  // Scroll down to show problem input card + category grid
  await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'smooth' }))
  await page.waitForTimeout(1000)

  // 2. Open problem input
  await page.click('a[href="/input"]')
  await page.waitForTimeout(800)

  // 3. Type problem slowly
  const textarea = page.locator('textarea')
  await textarea.click()
  await page.waitForTimeout(400)
  const problem = 'I need to turn my voice notes into a structured blog post automatically'
  for (const char of problem) {
    await textarea.type(char)
    await page.waitForTimeout(28)
  }
  await page.waitForTimeout(700)

  // 4. Deliver
  await page.click('button:has-text("Deliver Apps")')
  await page.waitForTimeout(1200)

  // 5. Results — scroll through matched apps
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'smooth' }))
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }))
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
  await page.waitForTimeout(1500)

  await page.close()
  const videoPath = await page.video().path()
  await context.close()
  await browser.close()

  const dest = path.join(OUT, '2-user-discovery-flow.webm')
  fs.renameSync(videoPath, dest)
  console.log(`Saved: ${dest}`)
}

main().catch(err => { console.error(err); process.exit(1) })
