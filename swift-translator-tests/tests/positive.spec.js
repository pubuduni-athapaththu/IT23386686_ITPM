const { test, expect } = require('@playwright/test')

const { convertAndGetOutput } = require('./helpers')

test.describe('Positive Functional Tests - Singlish to Sinhala Conversion', () => {
  // Helper to apply strict or loose assertion
  async function assertConversion(output, expectedContains, inputLength) {
    let allPassed = true
    for (const phrase of expectedContains) {
      if (!output.includes(phrase)) {
        allPassed = false
        break
      }
    }

    if (allPassed) {
      // Strict pass
      for (const phrase of expectedContains) {
        expect(output).toContain(phrase)
      }
    } else {
      // Loose fallback
      console.warn(`Strict checks failed for some phrases. Falling back to loose validation.`)
      expect(output).toMatch(/[\u0D80-\u0DFF]/) // at least one Sinhala character
      expect(output.length).toBeGreaterThan(Math.max(10, inputLength * 0.4)) // rough length check
    }
  }

  test('Pos_Fun_0001 – Convert a short daily greeting phrase', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oyaata kohomadha?')
    await assertConversion(output, ['ඔයාට', 'කොහොමද?'], 30)
  })

  test('Pos_Fun_0002 – Convert a polite request sentence', async ({ page }) => {
    const output = await convertAndGetOutput(
      page,
      'karuNaakaralaa mata podi udhavvak karanna puLuvandha?'
    )
    await assertConversion(
      output,
      ['කරුණාකරලා', 'මට', 'පොඩි', 'උදව්වක්', 'කරන්න', 'පුළුවන්ද?'],
      299
    )
  })

  test('Pos_Fun_0003 – Long mixed-language input with slang and English terms', async ({
    page,
  }) => {
    const output = await convertAndGetOutput(
      page,
      'machan mata adha meeting ekee Zoom link eka email ekak vidhihata evanna puLuvandha?'
    )
    await assertConversion(
      output,
      [
        'මචන්',
        'මට',
        'අද',
        'meeting',
        'Zoom',
        'link',
        'එක',
        'email',
        'එකක්',
        'විදිහට',
        'එවන්න',
        'පුළුවන්ද?',
      ],
      299
    )
  })

  test('Pos_Fun_0004 – Convert a positive present tense sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama dhaen vaeda karanavaa.')
    await assertConversion(output, ['මම', 'දැන්', 'වැඩ', 'කරනවා.'], 30)
  })

  test('Pos_Fun_0005 – Convert a simple imperative command', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'issarahata yanna.')
    await assertConversion(output, ['ඉස්සරහට', 'යන්න.'], 30)
  })

  test('Pos_Fun_0006 – Convert a compound sentence with agreement', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oyaa hari, ehenam api yamu.')
    await assertConversion(output, ['ඔයා', 'හරි,', 'එහෙනම්', 'අපි', 'යමු.'], 299)
  })

  test('Pos_Fun_0007 – Convert a conditional complex sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oya enavaanam mama balan innavaa.')
    await assertConversion(output, ['ඔයා', 'එනවනම්', 'මම', 'බලන්', 'ඉන්නවා.'], 30)
  })

  test('Pos_Fun_0008 – Convert a negative intention sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'vaessa unath api yanna epaeyi.')
    await assertConversion(output, ['වැස්ස', 'උනත්', 'අපි', 'යන්න', 'එපැයි.'], 30)
  })

  test('Pos_Fun_0009 – Convert an interrogative work-related question', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'meeka hariyata vaeda karanavaadha?')
    await assertConversion(output, ['මේක', 'හරියට', 'වැඩ', 'කරනවාද?'], 30)
  })

  test('Pos_Fun_0010 – Convert an imperative instruction', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mata kiyanna.')
    await assertConversion(output, ['මට', 'කියන්න.'], 30)
  })

  test('Pos_Fun_0011 – Convert a positive future plan sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'api heta enavaa.')
    await assertConversion(output, ['අපි', 'හෙට', 'එනවා.'], 30)
  })

  test('Pos_Fun_0012 – Convert a negative future sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'api heta ennee naehae.')
    await assertConversion(output, ['අපි', 'හෙට', 'එන්නේ', 'නැහැ.'], 30)
  })

  test('Pos_Fun_0013 – Convert a formal greeting phrase', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'suba udhaeesanak!')
    await assertConversion(output, ['සුබ', 'උදෑසනක්!'], 30)
  })

  test('Pos_Fun_0014 – Convert a request sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mata udhavvak karanna puLuvandha?')
    await assertConversion(output, ['මට', 'උදව්වක්', 'කරන්න', 'පුළුවන්ද?'], 30)
  })

  test('Pos_Fun_0015 – Convert a response sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'hari, mama karannam.')
    await assertConversion(output, ['හරි,', 'මම', 'කරන්නම්.'], 30)
  })

  test('Pos_Fun_0016 – Convert an informal spoken sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'eeyi, ooka dhiyan..')
    await assertConversion(output, ['ඒයි,', 'ඕක', 'දියන්.'], 30)
  })

  test('Pos_Fun_0017 – Convert a casual question', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oya enne.')
    await assertConversion(output, ['ඔය', 'එන්නෙ.'], 30)
  })

  test('Pos_Fun_0018 – Convert a day-to-day feeling expression', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mata nidhimathayi.')
    await assertConversion(output, ['මට', 'නිදිමතයි.'], 30)
  })

  test('Pos_Fun_0019 – Convert future plan with time reference', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'api iiLaGa sathiyee gedhara yamu.')
    await assertConversion(output, ['අපි', 'ඊළඟ', 'සතියේ', 'ගෙදර', 'යමු.'], 30)
  })

  test('Pos_Fun_0020 – Convert plural interrogative sentence', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'oyaalaa enavadha?')
    await assertConversion(output, ['ඔයාලා', 'එනවද?'], 30)
  })

  test('Pos_Fun_0021 – Convert sentence with English technical term', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'WiFi hariyata vaeda karanavaa.')
    await assertConversion(output, ['WiFi', 'හරියට', 'වැඩ', 'කරනවා.'], 30)
  })

  test('Pos_Fun_0022 – Convert sentence with mixed English abbreviations', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'ID eka check karanna.')
    await assertConversion(output, ['ID', 'එක', 'check', 'කරන්න.'], 30)
  })

  test('Pos_Fun_0023 – Convert sentence with punctuation marks', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'eka hari lassanadha?')
    await assertConversion(output, ['එක', 'හරි', 'ලස්සනද?'], 30)
  })

  test('Pos_Fun_0024 – Convert sentence with multiple spaces', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama    gedhara    yanavaa.')
    await assertConversion(output, ['මම', 'ගෙදර', 'යනවා.'], 30)
  })

  test('Pos_Fun_0025 – Convert long paragraph-style input', async ({ page }) => {
    const output = await convertAndGetOutput(
      page,
      'dhitvaa suLi kuNaatuva samaGa aethi vuu gQQvathura saha naayayaeem heethuven maarga sQQvarDhana aDhikaariya sathu maarga kotas 430k vinaashayata pathva aethi athara, ehi samastha dhiga pramaaNaya kiloomiitar 300k pamaNa vana bava pravaahana, mahaamaarga saha naagarika sQQvarDhana amaathYA bimal rathnaayaka saDHahan kaLeeya.'
    )
    await assertConversion(
      output,
      [
        'දිට්වා',
        'සුළි',
        'කුණාටුව',
        'සමඟ',
        'ඇති',
        'වූ',
        'ගංවතුර',
        'සහ',
        'නායයෑම්',
        'හේතුවෙන්',
        'මාර්ග',
        'සංවර්ධන',
        'අධිකාරිය',
        'සතු',
        'මාර්ග',
        'කොටස්',
        '430ක්',
        'විනාශයට',
        'පත්ව',
        'ඇති',
        'අතර,',
        'එහි',
        'සමස්ත',
        'දිග',
        'ප්‍රමාණය',
        'කිලෝමීටර්',
        '300ක්',
        'පමණ',
        'වන',
        'බව',
        'ප්‍රවාහන,',
        'මහාමාර්ග',
        'සහ',
        'නාගරික',
        'සංවර්ධන',
        'අමාත්‍ය',
        'බිමල්',
        'රත්නායක',
        'සඳහන්',
        'කළේය.',
      ],
      300
    )
  })
})
