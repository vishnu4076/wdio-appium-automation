/**
 * Lokbest Mobile Localization – Cucumber Step Definitions
 * =======================================================
 * Reusable, data-driven step definitions executing the complete
 * localization journey across any supported language in the Examples table.
 *
 * Reuses:
 *   - Page objects: LanguagePage, OnboardingPage, CountryPickerPage, LoginPage,
 *                   StorePage, ProfilePage, InformationPage
 *   - Utilities: handlePermissions, LocalizationValidator
 *   - Test Data: userData.json, storeData.json
 *
 * Rules:
 *   - Dynamically loads fixture based on languageCode from Examples table.
 *   - Missing fixtures or missing required translation keys throw clear, immediate errors.
 *   - Every assertion reports: Expected / Actual / PASS|FAIL via LocalizationValidator.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { Given, When, Then, Before, After } = require('@wdio/cucumber-framework');

// ── Page Objects ──────────────────────────────────────────────────────────────
const LanguagePage      = require('../../pageobjects/onboarding/LanguagePage');
const OnboardingPage    = require('../../pageobjects/onboarding/OnboardingPage');
const CountryPickerPage = require('../../pageobjects/authentication/CountryPickerPage');
const LoginPage         = require('../../pageobjects/authentication/LoginPage');
const StorePage         = require('../../pageobjects/store/StorePage');
const ProfilePage       = require('../../pageobjects/profie/ProfilePage');
const InformationPage   = require('../../pageobjects/profie/InformationPage');

// ── Utilities ─────────────────────────────────────────────────────────────────
const { handlePermissions } = require('../../utils/permissions/permissionHandler');
const LocalizationValidator = require('../../utils/localization/LocalizationValidator');

// ── Test Data ─────────────────────────────────────────────────────────────────
const userData  = require('../../fixtures/testData/userData.json');
const storeData = require('../../fixtures/testData/storeData.json');

// Required translation keys mandatory for full journey verification
const REQUIRED_TRANSLATION_KEYS = [
    'languageSelection.title',
    'languageSelection.confirm',
    'onboarding.skip',
    'onboarding.continueToApp',
    'countryPicker.welcomeTitle',
    'login.continue',
    'login.signIn',
    'store.confirm',
    'store.products',
    'store.categories',
    'store.checkIn',
    'store.stores',
    'activities.title',
    'profile.profile',
    'profile.myData',
    'profile.languageAndPreferences',
    'profile.information',
    'profile.logout',
    'faqs.items'
];

function getNestedValue(obj, pathStr) {
    return pathStr.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

let scenarioIteration = 0;

Before(async function (scenario) {
    scenarioIteration++;
    console.log(`\n======================================================`);
    console.log(`[BDD Localization] Starting: ${scenario.pickle.name} (Iteration #${scenarioIteration})`);
    console.log(`======================================================\n`);

    if (scenarioIteration > 1) {
        // Between iterations of Scenario Outline, reload the session to reset the app back to initial Language Selection
        try {
            console.log('[Before Hook] Reloading Appium session for fresh language scenario execution...');
            await browser.reloadSession();
        } catch (err) {
            console.warn(`[Before Hook] session reload warning: ${err.message}`);
        }
    }
});

After(async function (scenario) {
    if (scenario.result && scenario.result.status === 'FAILED') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedTitle = (scenario.pickle.name || 'localization').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const screenshotPath = path.join(process.cwd(), 'screenshots', `FAILED_BDD_${sanitizedTitle}_${timestamp}.png`);
        try {
            await browser.saveScreenshot(screenshotPath);
            console.log(`[Screenshot] Failure screenshot captured: ${screenshotPath}`);
        } catch (err) {
            console.warn(`[Screenshot] Failed to capture failure screenshot: ${err.message}`);
        }
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Fixture & Language Setup
// ─────────────────────────────────────────────────────────────────────────────

Given(/^I load the translation fixture for "(.*)"$/, async function (languageCode) {
    const code = (languageCode || '').toLowerCase().trim();
    this.languageCode = code;

    const fixturePath = path.resolve(process.cwd(), `test/fixtures/languages/${code}.json`);
    if (!fs.existsSync(fixturePath)) {
        throw new Error(
            `[Localization BDD] Translation fixture file not found: "${fixturePath}".\n` +
            `Ensure a valid JSON fixture exists under test/fixtures/languages/${code}.json.`
        );
    }

    try {
        delete require.cache[require.resolve(fixturePath)];
        this.languageData = require(fixturePath);
    } catch (e) {
        throw new Error(
            `[Localization BDD] Failed to read/parse fixture "${fixturePath}": ${e.message}`
        );
    }

    // Fail clearly if any required translation key or the FAQ items array is missing
    const missingKeys = [];
    for (const keyPath of REQUIRED_TRANSLATION_KEYS) {
        const val = getNestedValue(this.languageData, keyPath);
        if (val === undefined || val === null || (Array.isArray(val) && val.length === 0) || (typeof val === 'string' && val.trim() === '')) {
            missingKeys.push(keyPath);
        }
    }

    if (missingKeys.length > 0) {
        throw new Error(
            `[Localization BDD] Incomplete translation fixture for "${code}".\n` +
            `Missing or empty required keys:\n` +
            missingKeys.map(k => `  - ${k}`).join('\n') +
            `\nLocalization tests require complete fixtures. FAQ and screen verifications cannot be skipped.`
        );
    }

    this.validator = new LocalizationValidator(this.languageData);
    this.storeName = storeData.testStore || 'Austria store_02';
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Language Selection
// ─────────────────────────────────────────────────────────────────────────────

When(/^I select the language "(.*)" on the language selection screen$/, async function (languageName) {
    this.languageName = languageName;
    this.validator.printSection('Language Selection');
    await LanguagePage.selectLanguage(languageName);
});

Then('the language selection title should match the localized text', async function () {
    const expected = this.languageData.languageSelection.title;
    const langTitleEl = $(`android=new UiSelector().text("${expected}")`);
    await langTitleEl.waitForDisplayed({ timeout: 15000 });
    const actual = await this.validator.getElementText(langTitleEl);

    this.validator.logResult(expected, actual, actual === expected ? 'PASS' : 'FAIL');
    expect(actual).toBe(expected);
});

Then('the language selection confirm button should match the localized text', async function () {
    const expected = this.languageData.languageSelection.confirm;
    await LanguagePage.confirmButton.waitForDisplayed({ timeout: 15000 });
    const actual = await LanguagePage.getConfirmText();

    this.validator.logResult(expected, actual, actual === expected ? 'PASS' : 'FAIL');
    expect(actual).toBe(expected);
});

When('I confirm the language selection', async function () {
    await LanguagePage.confirmLanguage();
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Onboarding
// ─────────────────────────────────────────────────────────────────────────────

When('I proceed through the onboarding intro screen', async function () {
    this.validator.printSection('Onboarding');
    await OnboardingPage.continueButton.waitForDisplayed({ timeout: 15000 });
    await OnboardingPage.clickIntroContinue();
});

Then('the onboarding skip button should match the localized text', async function () {
    const expected = this.languageData.onboarding.skip;
    const skipBtn = $(`//*[@content-desc="${expected}" or @text="${expected}"]`);
    await skipBtn.waitForDisplayed({ timeout: 15000 });
    const actual = await this.validator.getElementText(skipBtn);

    this.validator.logResult(expected, actual, actual === expected ? 'PASS' : 'FAIL');
    expect(actual).toBe(expected);
});

When('I skip the onboarding flow', async function () {
    const expected = this.languageData.onboarding.skip;
    const skipBtn = $(`//*[@content-desc="${expected}" or @text="${expected}"]`);
    await skipBtn.click();
    await browser.pause(1000);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Permissions
// ─────────────────────────────────────────────────────────────────────────────

When('I handle app permissions', async function () {
    this.validator.printSection('Permissions');
    await browser.pause(1000);
    await handlePermissions();
});

Then('the permissions continue button should match the localized text', async function () {
    const expected = this.languageData.onboarding.continueToApp;
    const permContinueBtn = $(`//*[@text="${expected}" or @content-desc="${expected}"]`);
    await permContinueBtn.waitForDisplayed({ timeout: 15000 });
    const actual = await this.validator.getElementText(permContinueBtn);

    this.validator.logResult(expected, actual, actual === expected ? 'PASS' : 'FAIL');
    expect(actual).toBe(expected);
});

When('I continue to the app and grant required permissions', async function () {
    const expected = this.languageData.onboarding.continueToApp;
    const permContinueBtn = $(`//*[@text="${expected}" or @content-desc="${expected}"]`);
    await permContinueBtn.click();
    await browser.pause(1500);
    await handlePermissions();
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Country Picker
// ─────────────────────────────────────────────────────────────────────────────

Then('the country picker welcome title should match the localized text', async function () {
    this.validator.printSection('Country Picker');
    await CountryPickerPage.welcomeScreen.waitForDisplayed({ timeout: 25000 });
    const expected = this.languageData.countryPicker.welcomeTitle;
    const actual = await CountryPickerPage.getWelcomeText();

    this.validator.logResult(expected, actual, actual === expected ? 'PASS' : 'FAIL');
    expect(actual).toBe(expected);
});

When('I open the country picker and select the default country', async function () {
    await CountryPickerPage.openCountryPicker();
    await CountryPickerPage.selectCountry(userData.defaultUser.country || 'Croatia');
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Login
// ─────────────────────────────────────────────────────────────────────────────

Then('the login continue button should match the localized text', async function () {
    this.validator.printSection('Login');
    await LoginPage.phoneInput.waitForDisplayed({ timeout: 25000 });
    await LoginPage.continueButton.waitForDisplayed({ timeout: 15000 });
    const expected = this.languageData.login.continue;
    const actual = await this.validator.getElementText(LoginPage.continueButton);

    this.validator.logResult(expected, actual, actual === expected ? 'PASS' : 'FAIL');
    expect(actual).toBe(expected);
});

When('I enter phone number and click continue', async function () {
    await LoginPage.enterPhoneNumber(userData.defaultUser.phoneNumber || '563563563');
    await LoginPage.clickContinue();
});

Then('the login sign in button should match the localized text', async function () {
    await LoginPage.passwordInput.waitForDisplayed({ timeout: 20000 });
    await LoginPage.signInButton.waitForDisplayed({ timeout: 15000 });
    const expected = this.languageData.login.signIn;
    const actual = await this.validator.getElementText(LoginPage.signInButton);

    this.validator.logResult(expected, actual, actual === expected ? 'PASS' : 'FAIL');
    expect(actual).toBe(expected);
});

When('I enter password and click sign in', async function () {
    await LoginPage.enterPassword(userData.defaultUser.password || 'Test@123');
    await LoginPage.signIn();
    await LoginPage.signInButton
        .waitForDisplayed({ reverse: true, timeout: 15000 })
        .catch(() => {});
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Store Confirmation
// ─────────────────────────────────────────────────────────────────────────────

Then('the store confirmation button should match the localized text', async function () {
    this.validator.printSection('Store Confirmation');
    await StorePage.confirmButtonToStore.waitForDisplayed({ timeout: 30000 });

    let actualConfirmStore = await this.validator.getElementText(StorePage.confirmButtonToStore);
    if (!actualConfirmStore) {
        try {
            const childTv = await StorePage.confirmButtonToStore.$('android.widget.TextView');
            actualConfirmStore = await this.validator.getElementText(childTv);
        } catch (_) {}
    }

    const expected = this.languageData.store.confirm;
    this.validator.logResult(expected, actualConfirmStore, actualConfirmStore === expected ? 'PASS' : 'FAIL');
    expect(actualConfirmStore).toBe(expected);
});

When('I confirm store selection and enter the store', async function () {
    await StorePage.clickConfirmToStore(this.languageData.store.confirm);
    await browser.pause(2000);

    // Dismiss tour if present
    try {
        await StorePage.clickTourSkip(this.languageData.onboarding.skip);
    } catch (_) {}

    // Handle search screen if displayed
    if (await StorePage.searchInput.isDisplayed().catch(() => false)) {
        this.storeName = storeData.ageRestrictedStore || 'first-store-in-keyur';
        await StorePage.searchAndOpenStore(this.storeName);
        try {
            await StorePage.clickTourSkip(this.languageData.onboarding.skip);
        } catch (_) {}
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Store Home
// ─────────────────────────────────────────────────────────────────────────────

Then('the store home navigation tabs should match the localized text', async function () {
    this.validator.printSection('Store Home');
    await browser.pause(2000);

    // Products tab
    const productsTabEl = $(
        `//*[@resource-id="home-tab-products-btn"]//android.widget.TextView` +
        ` | //*[@resource-id="home-tab-products-btn"]` +
        ` | //*[@text="${this.languageData.store.products}" or @content-desc="${this.languageData.store.products}"]`
    );
    await productsTabEl.waitForDisplayed({ timeout: 15000 });
    const actualProducts = await this.validator.getElementText(productsTabEl);
    this.validator.logResult(this.languageData.store.products, actualProducts, actualProducts === this.languageData.store.products ? 'PASS' : 'FAIL');
    expect(actualProducts).toBe(this.languageData.store.products);

    // Categories tab
    const categoriesTabEl = $(
        `//*[@resource-id="home-tab-categories-btn"]//android.widget.TextView` +
        ` | //*[@resource-id="home-tab-categories-btn"]` +
        ` | //*[@text="${this.languageData.store.categories}" or @content-desc="${this.languageData.store.categories}"]`
    );
    await categoriesTabEl.waitForDisplayed({ timeout: 15000 });
    const actualCategories = await this.validator.getElementText(categoriesTabEl);
    this.validator.logResult(this.languageData.store.categories, actualCategories, actualCategories === this.languageData.store.categories ? 'PASS' : 'FAIL');
    expect(actualCategories).toBe(this.languageData.store.categories);

    // Check-In button
    const checkInEl = $(
        `//*[@resource-id="home-checkin-btn"]//android.widget.TextView` +
        ` | //*[@resource-id="home-checkin-btn"]` +
        ` | //*[@text="${this.languageData.store.checkIn}" or @content-desc="${this.languageData.store.checkIn}"]`
    );
    await checkInEl.waitForDisplayed({ timeout: 15000 });
    const actualCheckIn = await this.validator.getElementText(checkInEl);
    this.validator.logResult(this.languageData.store.checkIn, actualCheckIn, actualCheckIn === this.languageData.store.checkIn ? 'PASS' : 'FAIL');
    expect(actualCheckIn).toBe(this.languageData.store.checkIn);

    // Stores tab
    const storesTabEl = $(
        `//*[@resource-id="tab-stores-btn"]//android.widget.TextView` +
        ` | //*[@resource-id="tab-stores-btn"]` +
        ` | //*[@text="${this.languageData.store.stores}" or @content-desc="${this.languageData.store.stores}"]`
    );
    await storesTabEl.waitForDisplayed({ timeout: 15000 });
    const actualStoresTab = await this.validator.getElementText(storesTabEl);
    this.validator.logResult(this.languageData.store.stores, actualStoresTab, actualStoresTab === this.languageData.store.stores ? 'PASS' : 'FAIL');
    expect(actualStoresTab).toBe(this.languageData.store.stores);

    // Activities tab
    const activitiesTabEl = $(
        `//*[@resource-id="activity-tab-all-btn"]//android.widget.TextView` +
        ` | //*[@resource-id="activity-tab-all-btn"]` +
        ` | //*[@text="${this.languageData.activities.title}" or @content-desc="${this.languageData.activities.title}"]`
    );
    await activitiesTabEl.waitForDisplayed({ timeout: 15000 });
    const actualActivitiesTab = await this.validator.getElementText(activitiesTabEl);
    this.validator.logResult(this.languageData.activities.title, actualActivitiesTab, actualActivitiesTab === this.languageData.activities.title ? 'PASS' : 'FAIL');
    expect(actualActivitiesTab).toBe(this.languageData.activities.title);
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Profile & Screen Text Scan
// ─────────────────────────────────────────────────────────────────────────────

When('I navigate to the profile screen', async function () {
    this.validator.printSection('Profile');

    const profileTabEl = $(
        `//*[@resource-id="tab-profile-btn"]//android.widget.TextView` +
        ` | //*[@resource-id="tab-profile-btn"]` +
        ` | //*[@text="${this.languageData.profile.profile}" or @content-desc="${this.languageData.profile.profile}"]`
    );
    await profileTabEl.waitForDisplayed({ timeout: 15000 });
    await profileTabEl.click();
    await browser.pause(1000);

    // Dismiss tour coachmarks if displayed
    try {
        for (let i = 0; i < 3; i++) {
            const skipCoachmark = $(
                `//*[@resource-id="tour-skip-btn" or @content-desc="${this.languageData.onboarding.skip}" or @text="${this.languageData.onboarding.skip}"]`
            );
            if (await skipCoachmark.waitForDisplayed({ timeout: 3000 }).catch(() => false)) {
                await skipCoachmark.click();
                await browser.pause(1000);
            } else {
                break;
            }
        }
    } catch (_) {}
    await browser.pause(1000);
});

Then('the profile tab and page title should match the localized text', async function () {
    const profileTabEl = $(
        `//*[@resource-id="tab-profile-btn"]//android.widget.TextView` +
        ` | //*[@resource-id="tab-profile-btn"]` +
        ` | //*[@text="${this.languageData.profile.profile}" or @content-desc="${this.languageData.profile.profile}"]`
    );
    const actualProfileTab = await this.validator.getElementText(profileTabEl);
    this.validator.logResult(this.languageData.profile.profile, actualProfileTab, actualProfileTab === this.languageData.profile.profile ? 'PASS' : 'FAIL');
    expect(actualProfileTab).toBe(this.languageData.profile.profile);

    const profileTitleEl = $(
        `//*[@resource-id="profile-title"]//android.widget.TextView` +
        ` | //*[@resource-id="profile-title"]` +
        ` | //*[@content-desc="${this.languageData.profile.profile}" or @text="${this.languageData.profile.profile}"]`
    );
    await profileTitleEl.waitForDisplayed({ timeout: 15000 });
    const actualProfileTitle = await this.validator.getElementText(profileTitleEl);
    this.validator.logResult(this.languageData.profile.profile, actualProfileTitle, actualProfileTitle === this.languageData.profile.profile ? 'PASS' : 'FAIL');
    expect(actualProfileTitle).toBe(this.languageData.profile.profile);
});

Then('all mandatory profile menu tiles should match the localized text', async function () {
    const mandatoryProfileTiles = [
        {
            element: $(`//*[@resource-id="profile-tile-MyDataScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-MyDataScreen" or @content-desc="${this.languageData.profile.myData}" or @text="${this.languageData.profile.myData}"]`),
            expected: this.languageData.profile.myData,
            label: 'My Data',
        },
        {
            element: $(`//*[@resource-id="profile-tile-LanguagePreferences"]//android.widget.TextView | //*[@resource-id="profile-tile-LanguagePreferences" or @content-desc="${this.languageData.profile.languageAndPreferences}" or @text="${this.languageData.profile.languageAndPreferences}"]`),
            expected: this.languageData.profile.languageAndPreferences,
            label: 'Language & Preferences',
        },
        {
            element: $(`//*[@resource-id="profile-tile-InformationScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-InformationScreen" or @content-desc="${this.languageData.profile.information}" or @text="${this.languageData.profile.information}"]`),
            expected: this.languageData.profile.information,
            label: 'Information',
        },
        {
            element: $(`//*[@resource-id="profile-login-logout-btn"]//android.widget.TextView | //*[@resource-id="profile-login-logout-btn" or @content-desc="${this.languageData.profile.logout}" or @text="${this.languageData.profile.logout}"]`),
            expected: this.languageData.profile.logout,
            label: 'Logout',
        },
    ];

    for (const tile of mandatoryProfileTiles) {
        await tile.element.waitForDisplayed({ timeout: 15000 });
        let tileText = await this.validator.getElementText(tile.element);
        if (!tileText) {
            tileText = await ProfilePage.getTileText(tile.element);
        }
        this.validator.logResult(tile.expected, tileText, tileText === tile.expected ? 'PASS' : 'FAIL');
        expect(tileText).toBe(tile.expected);
    }
});

Then('all visible optional profile menu tiles should match the localized text', async function () {
    const optionalProfileTiles = [
        {
            element: $(`//*[@resource-id="profile-tile-Orders"]//android.widget.TextView | //*[@resource-id="profile-tile-Orders" or @content-desc="${this.languageData.profile.myPurchases}" or @text="${this.languageData.profile.myPurchases}"]`),
            expected: this.languageData.profile.myPurchases,
            label: 'My Purchases',
        },
        {
            element: $(`//*[@resource-id="profile-tile-WalletScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-WalletScreen" or @content-desc="${this.languageData.profile.wallet}" or @text="${this.languageData.profile.wallet}"]`),
            expected: this.languageData.profile.wallet,
            label: 'Wallet',
        },
        {
            element: $(`//*[@resource-id="profile-delete-account-btn"]//android.widget.TextView | //*[@resource-id="profile-delete-account-btn" or @content-desc="${this.languageData.profile.deleteAccount}" or @text="${this.languageData.profile.deleteAccount}"]`),
            expected: this.languageData.profile.deleteAccount,
            label: 'Delete Account',
        },
    ];

    for (const tile of optionalProfileTiles) {
        if (await tile.element.isDisplayed().catch(() => false)) {
            let tileText = await this.validator.getElementText(tile.element);
            if (!tileText) {
                tileText = await ProfilePage.getTileText(tile.element);
            }
            this.validator.logResult(tile.expected, tileText, tileText === tile.expected ? 'PASS' : 'FAIL');
            expect(tileText).toBe(tile.expected);
        }
    }
});

Then('all mandatory profile strings should be visible without untranslated English', async function () {
    const expectedProfileTexts = [
        this.languageData.profile.profile,
        this.languageData.profile.myData,
        this.languageData.profile.languageAndPreferences,
        this.languageData.profile.information,
        this.languageData.profile.logout,
    ];

    const visibleProfileTexts = await this.validator.verifyScreenTexts(expectedProfileTexts, {
        screenName: 'Profile Screen',
        customIgnoreList: [this.storeName, 'first-store-in-keyur', '18plush', 'Lokbest', 'Austria store_02'],
    });

    // Guard: detect any untranslated English text on localized screens
    this.validator.detectUntranslatedEnglish(visibleProfileTexts);
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Information & FAQ
// ─────────────────────────────────────────────────────────────────────────────

When('I navigate to the information screen', async function () {
    this.validator.printSection('Information');
    await InformationPage.clickInformationTile();
});

When('I open the FAQ screen', async function () {
    this.validator.printSection('FAQ');
    await InformationPage.clickFaqTile();
});

Then('the FAQ item count should match the localized fixture', async function () {
    const expectedFaqItems = this.languageData.faqs.items;
    this.actualFaqItems = await InformationPage.getAllFaqItems();

    this.validator.logResult(
        'FAQ item count',
        `${this.actualFaqItems.length}/${expectedFaqItems.length}`,
        this.actualFaqItems.length === expectedFaqItems.length ? 'PASS' : 'FAIL'
    );
    expect(this.actualFaqItems.length).toBe(expectedFaqItems.length);
});

Then('all FAQ questions and answers should match the localized fixture', async function () {
    const expectedFaqItems = this.languageData.faqs.items;

    for (let i = 0; i < expectedFaqItems.length; i++) {
        const expected = expectedFaqItems[i];
        const actual   = this.actualFaqItems[i];

        this.validator.logResult(
            `FAQ ${i + 1} Question`,
            actual ? actual.question : '',
            actual && actual.question === expected.question ? 'PASS' : 'FAIL'
        );
        expect(actual.question).toBe(expected.question);

        this.validator.logResult(
            `FAQ ${i + 1} Answer`,
            actual ? actual.answer : '',
            actual && actual.answer === expected.answer ? 'PASS' : 'FAIL'
        );
        expect(actual.answer).toBe(expected.answer);
    }
});
