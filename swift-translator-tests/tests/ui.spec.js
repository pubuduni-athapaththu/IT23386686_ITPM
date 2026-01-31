const { test, expect } = require('@playwright/test')

test.describe('UI Tests - Swift Translator Responsiveness', () => {
  test('Pos_UI_0001 – Real-time output update while typing', async ({ page }) => {
    await page.goto('https://www.swifttranslator.com/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    })

    // Find input field
    const inputLocator = page.getByPlaceholder(/singlish/i)
    await inputLocator.waitFor({ state: 'visible', timeout: 20000 })
    await expect(inputLocator).toBeVisible()
    await expect(inputLocator).toBeEditable()

    // Measure responsiveness
    const startTime = Date.now()

    // Type input
    const shortInput = 'mama gedhara'
    await inputLocator.fill(shortInput)
    await page.waitForTimeout(4000) // wait for real-time update

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Find output
    let outputText = ''
    const sinhalaElement = page
      .locator('div, span, p, [contenteditable="true"], *:not(textarea)')
      .filter({ hasText: /[\u0D80-\u0DFF]/ })
      .first()

    try {
      await sinhalaElement.waitFor({ state: 'visible', timeout: 10000 })
      outputText = await sinhalaElement.innerText()
    } catch {
      const bodyText = await page.innerText('body')
      const matches = bodyText.match(/[\u0D80-\u0DFF\s\.,!?()'"“”‘’…-]+/g) || []
      outputText = matches.join(' ')
    }

    // Assertions
    expect(responseTime).toBeLessThan(5000) // real-time <5s
    expect(outputText).toMatch(/[\u0D80-\u0DFF]/) // some Sinhala
    expect(outputText.trim()).not.toBe('')

    console.log(`Pos_UI_0001 - Response time: ${responseTime}ms`)
    console.log('Detected Sinhala output:', outputText.trim())
  })

  test('Neg_UI_0001 – Paste extremely long text into input', async ({ page }) => {
    await page.goto('https://www.swifttranslator.com/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    })

    // Find input field
    const inputLocator = page.getByPlaceholder(/singlish/i)
    await inputLocator.waitFor({ state: 'visible', timeout: 20000 })
    await expect(inputLocator).toBeVisible()
    await expect(inputLocator).toBeEditable()

    // Measure responsiveness
    const startTime = Date.now()

    // Paste long input
    const longInput =
      'mamamamammamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamammamamamammamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamammamamamammamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamamam'
    await inputLocator.fill(longInput)
    await page.waitForTimeout(4000) // wait for processing

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Check if UI is still responsive (e.g., input still editable, no crash)
    await expect(inputLocator).toBeEditable() // UI not frozen

    // Assertions
    expect(responseTime).toBeLessThan(10000) // acceptable delay <10s for long input

    console.log(`Neg_UI_0001 - Response time for long input: ${responseTime}ms`)
  })
})
