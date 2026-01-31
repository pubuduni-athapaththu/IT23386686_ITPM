// tests/negative-strict.spec.js
const { test, expect } = require('@playwright/test')
const { convertAndGetOutput } = require('./helpers')

test.describe('Negative Functional Tests - Expect Strict/Fail-Safe Behavior', () => {
  async function expectStrictNegativeHandling(output, input, options = {}) {
    const { expectedToBeEmpty = false, expectedToMatchInput = false } = options

    expect(output).toBeDefined()
    expect(typeof output).toBe('string')

    const trimmedOutput = output.trim()

    if (expectedToBeEmpty) {
      // Should produce NO output or clear error/placeholder (not random Sinhala)
      expect(trimmedOutput.length).toBeLessThanOrEqual(50) // allow small UI message
      expect(/[\u0D80-\u0DFF]{5,}/.test(trimmedOutput)).toBe(false) // no long Sinhala
    } else if (expectedToMatchInput) {
      // Should keep input almost unchanged (numbers, symbols, unsupported lang)
      expect(trimmedOutput).toBe(input.trim())
    } else {
      // General negative case: should not produce meaningful Sinhala translation
      expect(/[\u0D80-\u0DFF]{3,}/.test(trimmedOutput)).toBe(false) // minimal or no Sinhala
    }

    // Never crash
    expect(output).not.toContain('error') // optional: if your app shows error strings
  }

  test('Neg_Fun_0001 – Empty input → should NOT produce Sinhala', async ({ page }) => {
    const output = await convertAndGetOutput(page, '')
    await expectStrictNegativeHandling(output, '', { expectedToBeEmpty: true })
  })

  test('Neg_Fun_0002 – Numbers only → should keep numbers unchanged', async ({ page }) => {
    const input = '123456'
    const output = await convertAndGetOutput(page, input)
    await expectStrictNegativeHandling(output, input, { expectedToMatchInput: true })
  })

  test('Neg_Fun_0003 – Only spaces → should produce nothing or very little', async ({ page }) => {
    const output = await convertAndGetOutput(page, '          ')
    await expectStrictNegativeHandling(output, '', { expectedToBeEmpty: true })
  })

  test('Neg_Fun_0004 – Only special chars → should preserve them unchanged', async ({ page }) => {
    const input = '@#$%^&*()_+-=[]{}|'
    const output = await convertAndGetOutput(page, input)
    await expectStrictNegativeHandling(output, input, { expectedToMatchInput: true })
  })

  test('Neg_Fun_0005 – Unsupported language → should NOT translate to Sinhala', async ({
    page,
  }) => {
    const input = 'bonjour comment ça va monsieur'
    const output = await convertAndGetOutput(page, input)
    await expectStrictNegativeHandling(output, input, { expectedToMatchInput: true })
  })

  test('Neg_Fun_0006 – Mixed symbols + text → should preserve or minimally change', async ({
    page,
  }) => {
    const input = 'hi!!!@@@ world#$%^ test&*()'
    const output = await convertAndGetOutput(page, input)
    // We expect either unchanged or very little Sinhala
    await expectStrictNegativeHandling(output, input)
  })

  test('Neg_Fun_0007 – Joined words → should NOT guess wrong translation', async ({ page }) => {
    const input = 'mamagedharayanavaa'
    const output = await convertAndGetOutput(page, input)
    // Ideally unchanged or error — but at least not wrong Sinhala sentence
    await expectStrictNegativeHandling(output, input)
  })

  test('Neg_Fun_0008 – Excessive repetition → should not distort', async ({ page }) => {
    const input = 'hari hari hari hari hari hari hari'
    const output = await convertAndGetOutput(page, input)
    // Should keep repetition or normalize safely — but no crazy Sinhala
    await expectStrictNegativeHandling(output, input)
  })

  test('Neg_Fun_0009 – Heavy slang → should not produce broken Sinhala', async ({ page }) => {
    const input = 'ela machan supiri kiri siraavata'
    const output = await convertAndGetOutput(page, input)
    await expectStrictNegativeHandling(output, input)
  })

  test('Neg_Fun_0010 – Mixed English terms → English parts should stay English', async ({
    page,
  }) => {
    const input = 'Zoom meeting eka cancel karala WhatsApp ekakin kiyanna'
    const output = await convertAndGetOutput(page, input)
    // We expect "Zoom", "WhatsApp", "cancel" etc. to remain in Latin script
    expect(output).toContain('Zoom')
    expect(output).toContain('WhatsApp')
    // But still check no crazy long Sinhala garbage
    await expectStrictNegativeHandling(output, input)
  })

  test('Neg_Fun_0011 – Very long input → should not crash (but we allow partial)', async ({
    page,
  }) => {
    const longInput =
      'dhitvaa suLi kuNaatuva samaGa aethi vuu gQQvathura saha naayayaeem heethuven ' +
      'maarga sQQvarDhana aDhikaariya sathu maarga kotas 430k vinaashayata pathva aethi ' +
      'athara, ehi samastha dhiga pramaaNaya kiloomiitar 300k pamaNa vana bava pravaahana...'

    const output = await convertAndGetOutput(page, longInput)
    // Main goal: no crash + reasonable length
    expect(output.length).toBeGreaterThan(10)
    expect(output.length).toBeLessThan(longInput.length * 5)
    // But we still don't want full wrong Sinhala novel
    expect(/[\u0D80-\u0DFF]{100,}/.test(output)).toBe(false) // not huge Sinhala block
  })

  test('Neg_Fun_0012 – Line breaks → should preserve formatting or normalize safely', async ({
    page,
  }) => {
    const input = 'mama gedhara yanavaa.\n\noyaa enavadha?\n\nhari da?'
    const output = await convertAndGetOutput(page, input)
    // At minimum, line breaks should not cause garbage
    await expectStrictNegativeHandling(output, input)
  })
})
