# Playwright Smoke Flows

These commands use the Playwright CLI wrapper from the local `playwright` skill.

## Prerequisites

```bash
# terminal 1
npm run dev
```

```bash
# terminal 2
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
alias pwcli="$PWCLI"
mkdir -p output/playwright/smoke
cd output/playwright/smoke
```

## 1) Onboarding and Role Selection Smoke

```bash
pwcli open http://localhost:3000/register?role=dealer --headed
pwcli run-code "async (page) => { await page.getByTestId('onboarding-full-name').fill('Jane Dealer'); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-email').fill('jane.dealer@example.com'); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-password').fill('StrongPass123'); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-role-dealer').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-phone').fill('+254700000001'); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-national-id').fill('A12345678'); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-business-name').fill('Autolist Motors Ltd'); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-business-reg').fill('PVT-12345'); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-operating-city').fill('Nairobi'); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('onboarding-next').click(); }"
pwcli run-code "async (page) => { return await page.getByTestId('onboarding-success').isVisible(); }"
pwcli screenshot
```

## 2) Listing Creation Wizard Smoke

```bash
pwcli open http://localhost:3000/dashboard/listings/new --headed
pwcli run-code "async (page) => { await page.getByTestId('listing-category-car').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-wizard-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-title').fill('2021 Toyota Corolla, low mileage'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-price').fill('2450000'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-county').fill('Nairobi'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-city').fill('Westlands'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-description').fill('Well maintained, full service history, clean interior.'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-wizard-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-make').fill('Toyota'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-model').fill('Corolla'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-year').fill('2021'); }"
pwcli run-code "async (page) => { await page.getByLabel('Engine Capacity (cc) *').fill('1800'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-fuel').selectOption('petrol'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-transmission').selectOption('automatic'); }"
pwcli run-code "async (page) => { await page.getByLabel('Drive Type *').selectOption('2wd'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-mileage').fill('58000'); }"
pwcli run-code "async (page) => { await page.getByLabel('Body Type *').selectOption('sedan'); }"
pwcli run-code "async (page) => { await page.getByLabel('Color *').fill('Pearl White'); }"
pwcli run-code "async (page) => { await page.getByLabel('Number of Seats *').fill('5'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-wizard-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-feature-safe_abs').check(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-wizard-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-video-url').fill('https://youtube.com/watch?v=demo'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-cover-image').setInputFiles('../../../public/placeholder-car.jpg'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-wizard-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-contact-name').fill('Jane Dealer'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-phone').fill('+254700000001'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-whatsapp-number').fill('+254700000001'); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-wizard-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-wizard-next').click(); }"
pwcli run-code "async (page) => { await page.getByTestId('listing-wizard-next').click(); }"
pwcli run-code "async (page) => { return await page.getByTestId('listing-submit-success').isVisible(); }"
pwcli screenshot
```

## 3) Seller Dashboard Smoke

```bash
pwcli open http://localhost:3000/dashboard --headed
pwcli run-code "async (page) => { return await page.getByTestId('seller-dashboard').isVisible(); }"
pwcli run-code "async (page) => { await page.getByTestId('dashboard-status-filter').selectOption('pending'); }"
pwcli run-code "async (page) => { await page.getByRole('tab', { name: 'Card View' }).click(); }"
pwcli run-code "async (page) => { await page.getByRole('tab', { name: 'Table View' }).click(); }"
pwcli run-code "async (page) => { await page.getByTestId('dashboard-add-listing').click(); await page.waitForURL('**/dashboard/listings/new'); }"
pwcli screenshot
```

## Notes

- If selectors fail after UI edits, run `pwcli snapshot` and verify updated test ids.
- Keep artifacts under `output/playwright/smoke/` for review.
