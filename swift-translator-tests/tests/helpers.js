// tests/helpers.js
// ────────────────────────────────────────────────
// Helper utilities for Swift Translator Playwright tests
// IMPORTANT: Do NOT import @playwright/test here!
//            (that was causing the "did not expect test.describe() to be called here" error)

const BASE_URL = 'https://www.swifttranslator.com/'

async function convertAndGetOutput(page, inputText) {
  // 1. Navigate and wait for network to settle
  await page.goto(BASE_URL, {
    waitUntil: 'networkidle',
    timeout: 45000,
  })

  // 2. Try to find and clear previous input if possible
  let inputLocator
  try {
    inputLocator = page.getByPlaceholder(/singlish/i)
    await inputLocator.waitFor({ state: 'visible', timeout: 10000 })
  } catch {
    try {
      inputLocator = page.locator('textarea').first()
      await inputLocator.waitFor({ state: 'visible', timeout: 12000 })
    } catch {
      throw new Error('Could not locate Singlish input field')
    }
  }

  // Clear previous content
  await inputLocator.clear({ timeout: 5000 }).catch(() => {})

  // 3. Type the input
  await inputLocator.fill(inputText)

  // Small wait → many translators auto-convert after typing
  await page.waitForTimeout(800)

  // Only press Enter if no Sinhala characters appeared yet
  let hasSinhala = await page
    .locator('body')
    .innerText()
    .then((text) => /[\u0D80-\u0DFF]/.test(text))

  if (!hasSinhala) {
    await inputLocator.press('Enter').catch(() => {})
    await page.waitForTimeout(2200)
  }

  // 4. Try to capture output - ordered from most likely → fallback
  const outputCandidates = [
    page.locator('textarea').nth(1), // most common output textarea
    page.locator('div[contenteditable="true"]').first(),
    page.locator('[class*="output" i], [class*="result" i], [class*="target" i]').first(),
    page.getByPlaceholder(/sinhala|සිංහල/i),
    page
      .locator('div, p, span')
      .filter({ hasText: /[\u0D80-\u0DFF]/ })
      .first(),
  ]

  let outputText = ''

  for (const locator of outputCandidates) {
    try {
      if (await locator.isVisible({ timeout: 5000 })) {
        const text = (await locator.innerText()).trim()
        if (text && /[\u0D80-\u0DFF]/.test(text)) {
          outputText = text
          break
        }
      }
    } catch {
      // silent fail → try next candidate
    }
  }

  // 5. Very last fallback: scan whole body for Sinhala clusters
  if (!outputText || !/[\u0D80-\u0DFF]/.test(outputText)) {
    const bodyText = await page.innerText('body')
    const matches = bodyText.match(/[\u0D80-\u0DFF\s\.,!?()'"“”‘’…-]+/g) || []
    outputText = matches.join(' ').trim()
  }

  // 6. Minimal logging (helps debugging without flooding console)
  console.log(
    `convertAndGetOutput → input: ${inputText.slice(0, 45).padEnd(45)}` +
      ` | output: ${outputText.slice(0, 70) || '<empty>'}`
  )

  return outputText
}

module.exports = { convertAndGetOutput }
