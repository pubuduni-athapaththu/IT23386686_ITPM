
# ITPM Assignment 1 - Swift Translator Playwright Tests

This project has Playwright automated tests for https://www.swifttranslator.com/ (Singlish to Sinhala translator).

## Tests Summary
- Positive tests: 24 (all passed)
- Negative tests: 10 (all Fail)
- UI test: 1 (passed)
- Total: 35 tests passed

## How to Run

1. Install dependencies:
```bash
npm install

Run all tests:

Bashnpx playwright test

Run and watch in browser:

Bashnpx playwright test --headed

See nice report after tests finish:

Bashnpx playwright show-report
All tests are in:

tests/positive.spec.js
tests/negative.spec.js
tests/ui.spec.js
