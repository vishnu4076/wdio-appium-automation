/**
 * Lokbest – Language-Driven Localization E2E Verification
 * =========================================================
 * A single, environment-variable-driven spec that covers the complete
 * localization journey for any supported language without code duplication.
 *
 * Usage:
 *   LANGUAGE=en   npm run test:localize
 *   LANGUAGE=de   npm run test:localize
 *   LANGUAGE=it   npm run test:localize
 *   LANGUAGE=nl   npm run test:localize
 *
 * Supported screens verified:
 *   1.  Language Selection     – title + confirm button
 *   2.  Onboarding             – skip button
 *   3.  Permissions            – continueToApp button
 *   4.  Country Picker         – welcome title
 *   5.  Login                  – continue + sign-in buttons
 *   6.  Store Confirmation     – confirm button
 *   7.  Store Home             – products, categories, checkIn, stores, activities tabs
 *   8.  Profile                – profile tab, page title, all mandatory tiles,
 *                               optional tiles (myPurchases, wallet, deleteAccount),
 *                               full screen-text scan + untranslated-English guard
 *   9.  Information            – information tile navigation
 *  10.  FAQ                    – item count + every question / answer pair
 *  11.  Wallet                 – wallet navigation, how it works popup (heading + 4 messages),
 *                               popup close, back to profile navigation
 *
 * Source of truth: test/fixtures/languages/<LANGUAGE>.json
 *
 * Rules:
 *   – LANGUAGE env-var is mandatory; the test fails immediately if absent/unsupported.
 *   – "nl" fixture has no faqs.items → FAQ block is skipped with a clear warning.
 *   – Every assertion uses validator.logResult() + expect() so the console always
 *     shows: Expected / Actual / PASS|FAIL.
 *   – Page objects, selectors, and LocalizationValidator are reused unchanged.
 *   – This file does not touch the three existing language-specific spec files.
 */

'use strict';

// ── Page Objects ──────────────────────────────────────────────────────────────
const LanguagePage      = require('../../pageobjects/onboarding/LanguagePage');
const OnboardingPage    = require('../../pageobjects/onboarding/OnboardingPage');
const CountryPickerPage = require('../../pageobjects/authentication/CountryPickerPage');
const LoginPage         = require('../../pageobjects/authentication/LoginPage');
const StorePage         = require('../../pageobjects/store/StorePage');
const ProfilePage       = require('../../pageobjects/profie/ProfilePage');
const InformationPage   = require('../../pageobjects/profie/InformationPage');
const WalletPage        = require('../../pageobjects/profie/WalletPage');

// ── Utilities ─────────────────────────────────────────────────────────────────
const { handlePermissions }  = require('../../utils/permissions/permissionHandler');
const LocalizationValidator  = require('../../utils/localization/LocalizationValidator');

// ── Test data ─────────────────────────────────────────────────────────────────
const userData  = require('../../fixtures/testData/userData.json');
const storeData = require('../../fixtures/testData/storeData.json');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Resolve & validate the target language
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = {
    en: { fixture: 'en', displayName: 'English'     },
    de: { fixture: 'de', displayName: 'Deutsch'     },
    it: { fixture: 'it', displayName: 'Italiano'    },
    nl: { fixture: 'nl', displayName: 'Nederlands'  },
};

// Resolved at module-load time so the describe() title reflects the real value.
const langCode = (process.env.LANGUAGE || '').toLowerCase().trim();

if (!langCode) {
    throw new Error(
        '[localization-language.spec] LANGUAGE environment variable is not set.\n' +
        '  Set it to one of: ' + Object.keys(SUPPORTED_LANGUAGES).join(', ') + '\n' +
        '  Example: LANGUAGE=de npm run test:localize'
    );
}

if (!SUPPORTED_LANGUAGES[langCode]) {
    throw new Error(
        `[localization-language.spec] Unsupported language "${langCode}".\n` +
        '  Supported values: ' + Object.keys(SUPPORTED_LANGUAGES).join(', ')
    );
}

const { fixture: fixtureFile, displayName: langDisplayName } = SUPPORTED_LANGUAGES[langCode];

// ─────────────────────────────────────────────────────────────────────────────
// 2. Dynamically load the language fixture
//    Never falls back silently – missing file causes an immediate throw.
// ─────────────────────────────────────────────────────────────────────────────

let languageData;
try {
    languageData = require(`../../fixtures/languages/${fixtureFile}.json`);
} catch (e) {
    throw new Error(
        `[localization-language.spec] Fixture file not found: ` +
        `test/fixtures/languages/${fixtureFile}.json\n` +
        `  Original error: ${e.message}`
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Suite
// ─────────────────────────────────────────────────────────────────────────────

describe(`Lokbest Localization E2E – ${langDisplayName} (${langCode.toUpperCase()})`, function () {

    this.timeout(600000);

    /** Shared validator constructed with the dynamically loaded fixture. */
    const validator = new LocalizationValidator(languageData);

    it(`should execute full ${langDisplayName} localization journey with strict text assertions`, async () => {

        // Store name resolved once; may be re-assigned if the search screen is shown.
        let storeName = storeData.testStore || 'Austria store_02';

        // ============================================================
        // 1. LANGUAGE SELECTION
        // ============================================================

        validator.printSection('Language Selection');

        await LanguagePage.selectLanguage(langDisplayName);

        // Title assertion – UiSelector text-match (mirrors de/it spec approach)
        const langTitleEl = $(`android=new UiSelector().text("${languageData.languageSelection.title}")`);
        await langTitleEl.waitForDisplayed({ timeout: 15000 });
        const actualLangTitle = await validator.getElementText(langTitleEl);

        validator.logResult(
            languageData.languageSelection.title,
            actualLangTitle,
            actualLangTitle === languageData.languageSelection.title ? 'PASS' : 'FAIL'
        );
        expect(actualLangTitle).toBe(languageData.languageSelection.title);

        // Confirm button text assertion
        await LanguagePage.confirmButton.waitForDisplayed({ timeout: 15000 });
        const actualLangConfirm = await LanguagePage.getConfirmText();

        validator.logResult(
            languageData.languageSelection.confirm,
            actualLangConfirm,
            actualLangConfirm === languageData.languageSelection.confirm ? 'PASS' : 'FAIL'
        );
        expect(actualLangConfirm).toBe(languageData.languageSelection.confirm);

        await LanguagePage.confirmLanguage();


        // ============================================================
        // 2. ONBOARDING
        // ============================================================

        validator.printSection('Onboarding');

        await OnboardingPage.continueButton.waitForDisplayed({ timeout: 15000 });
        await OnboardingPage.clickIntroContinue();

        // Skip button – match by content-desc OR @text (language-agnostic XPath)
        const skipBtn = $(`//*[@content-desc="${languageData.onboarding.skip}" or @text="${languageData.onboarding.skip}"]`);
        await skipBtn.waitForDisplayed({ timeout: 15000 });
        const actualSkipText = await validator.getElementText(skipBtn);

        validator.logResult(
            languageData.onboarding.skip,
            actualSkipText,
            actualSkipText === languageData.onboarding.skip ? 'PASS' : 'FAIL'
        );
        expect(actualSkipText).toBe(languageData.onboarding.skip);

        await skipBtn.click();
        await browser.pause(1000);


        // ============================================================
        // 3. PERMISSIONS
        // ============================================================

        validator.printSection('Permissions');

        await browser.pause(1000);
        await handlePermissions();

        // "Continue to App" button (localised text varies per language)
        const permContinueBtn = $(`//*[@text="${languageData.onboarding.continueToApp}" or @content-desc="${languageData.onboarding.continueToApp}"]`);
        await permContinueBtn.waitForDisplayed({ timeout: 15000 });
        const actualPermContinue = await validator.getElementText(permContinueBtn);

        validator.logResult(
            languageData.onboarding.continueToApp,
            actualPermContinue,
            actualPermContinue === languageData.onboarding.continueToApp ? 'PASS' : 'FAIL'
        );
        expect(actualPermContinue).toBe(languageData.onboarding.continueToApp);

        await permContinueBtn.click();
        await browser.pause(1500);
        await handlePermissions();


        // ============================================================
        // 4. COUNTRY PICKER
        // ============================================================

        validator.printSection('Country Picker');

        await CountryPickerPage.welcomeScreen.waitForDisplayed({ timeout: 25000 });
        const actualWelcomeTitle = await CountryPickerPage.getWelcomeText();

        validator.logResult(
            languageData.countryPicker.welcomeTitle,
            actualWelcomeTitle,
            actualWelcomeTitle === languageData.countryPicker.welcomeTitle ? 'PASS' : 'FAIL'
        );
        expect(actualWelcomeTitle).toBe(languageData.countryPicker.welcomeTitle);

        await CountryPickerPage.openCountryPicker();
        await CountryPickerPage.selectCountry(userData.defaultUser.country || 'Croatia');


        // ============================================================
        // 5. LOGIN
        // ============================================================

        validator.printSection('Login');

        await LoginPage.phoneInput.waitForDisplayed({ timeout: 25000 });

        await LoginPage.continueButton.waitForDisplayed({ timeout: 15000 });
        const actualLoginContinue = await validator.getElementText(LoginPage.continueButton);

        validator.logResult(
            languageData.login.continue,
            actualLoginContinue,
            actualLoginContinue === languageData.login.continue ? 'PASS' : 'FAIL'
        );
        expect(actualLoginContinue).toBe(languageData.login.continue);

        await LoginPage.enterPhoneNumber(userData.defaultUser.phoneNumber || '563563563');
        await LoginPage.clickContinue();

        await LoginPage.passwordInput.waitForDisplayed({ timeout: 20000 });
        await LoginPage.signInButton.waitForDisplayed({ timeout: 15000 });
        const actualSignIn = await validator.getElementText(LoginPage.signInButton);

        validator.logResult(
            languageData.login.signIn,
            actualSignIn,
            actualSignIn === languageData.login.signIn ? 'PASS' : 'FAIL'
        );
        expect(actualSignIn).toBe(languageData.login.signIn);

        await LoginPage.enterPassword(userData.defaultUser.password || 'Test@123');
        await LoginPage.signIn();
        await LoginPage.signInButton
            .waitForDisplayed({ reverse: true, timeout: 15000 })
            .catch(() => { });


        // ============================================================
        // 6. STORE CONFIRMATION
        // ============================================================

        validator.printSection('Store Confirmation');

        await StorePage.confirmButtonToStore.waitForDisplayed({ timeout: 30000 });

        // Retrieve text; fall back to child TextView when the container has no text.
        let actualConfirmStore = await validator.getElementText(StorePage.confirmButtonToStore);
        if (!actualConfirmStore) {
            try {
                const childTv = await StorePage.confirmButtonToStore.$('android.widget.TextView');
                actualConfirmStore = await validator.getElementText(childTv);
            } catch (_) { }
        }

        validator.logResult(
            languageData.store.confirm,
            actualConfirmStore,
            actualConfirmStore === languageData.store.confirm ? 'PASS' : 'FAIL'
        );
        expect(actualConfirmStore).toBe(languageData.store.confirm);

        await StorePage.clickConfirmToStore(languageData.store.confirm);
        await browser.pause(2000);

        // Dismiss store-tour coachmark if shown
        try {
            await StorePage.clickTourSkip(languageData.onboarding.skip);
        } catch (_) { }

        // If on store-selection search screen, navigate into the target store
        if (await StorePage.searchInput.isDisplayed().catch(() => false)) {
            storeName = storeData.ageRestrictedStore || 'first-store-in-keyur';
            await StorePage.searchAndOpenStore(storeName);
            try {
                await StorePage.clickTourSkip(languageData.onboarding.skip);
            } catch (_) { }
        }


        // ============================================================
        // 7. STORE HOME
        // ============================================================

        validator.printSection('Store Home');
        await browser.pause(2000);

        // Products tab
        const productsTabEl = $(
            `//*[@resource-id="home-tab-products-btn"]//android.widget.TextView` +
            ` | //*[@resource-id="home-tab-products-btn"]` +
            ` | //*[@text="${languageData.store.products}" or @content-desc="${languageData.store.products}"]`
        );
        await productsTabEl.waitForDisplayed({ timeout: 15000 });
        const actualProducts = await validator.getElementText(productsTabEl);
        validator.logResult(languageData.store.products, actualProducts, actualProducts === languageData.store.products ? 'PASS' : 'FAIL');
        expect(actualProducts).toBe(languageData.store.products);

        // Categories tab
        const categoriesTabEl = $(
            `//*[@resource-id="home-tab-categories-btn"]//android.widget.TextView` +
            ` | //*[@resource-id="home-tab-categories-btn"]` +
            ` | //*[@text="${languageData.store.categories}" or @content-desc="${languageData.store.categories}"]`
        );
        await categoriesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualCategories = await validator.getElementText(categoriesTabEl);
        validator.logResult(languageData.store.categories, actualCategories, actualCategories === languageData.store.categories ? 'PASS' : 'FAIL');
        expect(actualCategories).toBe(languageData.store.categories);

        // Check-In button
        const checkInEl = $(
            `//*[@resource-id="home-checkin-btn"]//android.widget.TextView` +
            ` | //*[@resource-id="home-checkin-btn"]` +
            ` | //*[@text="${languageData.store.checkIn}" or @content-desc="${languageData.store.checkIn}"]`
        );
        await checkInEl.waitForDisplayed({ timeout: 15000 });
        const actualCheckIn = await validator.getElementText(checkInEl);
        validator.logResult(languageData.store.checkIn, actualCheckIn, actualCheckIn === languageData.store.checkIn ? 'PASS' : 'FAIL');
        expect(actualCheckIn).toBe(languageData.store.checkIn);

        // Stores tab
        const storesTabEl = $(
            `//*[@resource-id="tab-stores-btn"]//android.widget.TextView` +
            ` | //*[@resource-id="tab-stores-btn"]` +
            ` | //*[@text="${languageData.store.stores}" or @content-desc="${languageData.store.stores}"]`
        );
        await storesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualStoresTab = await validator.getElementText(storesTabEl);
        validator.logResult(languageData.store.stores, actualStoresTab, actualStoresTab === languageData.store.stores ? 'PASS' : 'FAIL');
        expect(actualStoresTab).toBe(languageData.store.stores);

        // Activities tab
        const activitiesTabEl = $(
            `//*[@resource-id="activity-tab-all-btn"]//android.widget.TextView` +
            ` | //*[@resource-id="activity-tab-all-btn"]` +
            ` | //*[@text="${languageData.activities.title}" or @content-desc="${languageData.activities.title}"]`
        );
        await activitiesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualActivitiesTab = await validator.getElementText(activitiesTabEl);
        validator.logResult(languageData.activities.title, actualActivitiesTab, actualActivitiesTab === languageData.activities.title ? 'PASS' : 'FAIL');
        expect(actualActivitiesTab).toBe(languageData.activities.title);


        // ============================================================
        // 8. PROFILE
        // ============================================================

        validator.printSection('Profile');

        // Profile tab in the bottom navigation bar
        const profileTabEl = $(
            `//*[@resource-id="tab-profile-btn"]//android.widget.TextView` +
            ` | //*[@resource-id="tab-profile-btn"]` +
            ` | //*[@text="${languageData.profile.profile}" or @content-desc="${languageData.profile.profile}"]`
        );
        await profileTabEl.waitForDisplayed({ timeout: 15000 });
        const actualProfileTab = await validator.getElementText(profileTabEl);
        validator.logResult(languageData.profile.profile, actualProfileTab, actualProfileTab === languageData.profile.profile ? 'PASS' : 'FAIL');
        expect(actualProfileTab).toBe(languageData.profile.profile);

        await profileTabEl.click();
        await browser.pause(1000);

        // Dismiss tour coachmark (up to 3 iterations)
        try {
            for (let i = 0; i < 3; i++) {
                const skipCoachmark = $(
                    `//*[@resource-id="tour-skip-btn" or @content-desc="${languageData.onboarding.skip}" or @text="${languageData.onboarding.skip}"]`
                );
                if (await skipCoachmark.waitForDisplayed({ timeout: 3000 }).catch(() => false)) {
                    await skipCoachmark.click();
                    await browser.pause(1000);
                } else {
                    break;
                }
            }
        } catch (_) { }
        await browser.pause(1000);

        // Profile page title
        const profileTitleEl = $(
            `//*[@resource-id="profile-title"]//android.widget.TextView` +
            ` | //*[@resource-id="profile-title"]` +
            ` | //*[@content-desc="${languageData.profile.profile}" or @text="${languageData.profile.profile}"]`
        );
        await profileTitleEl.waitForDisplayed({ timeout: 15000 });
        const actualProfileTitle = await validator.getElementText(profileTitleEl);
        validator.logResult(languageData.profile.profile, actualProfileTitle, actualProfileTitle === languageData.profile.profile ? 'PASS' : 'FAIL');
        expect(actualProfileTitle).toBe(languageData.profile.profile);

        // Mandatory profile menu tiles (always present)
        const mandatoryProfileTiles = [
            {
                element: $(`//*[@resource-id="profile-tile-MyDataScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-MyDataScreen" or @content-desc="${languageData.profile.myData}" or @text="${languageData.profile.myData}"]`),
                expected: languageData.profile.myData,
                label:    'My Data',
            },
            {
                element: $(`//*[@resource-id="profile-tile-LanguagePreferences"]//android.widget.TextView | //*[@resource-id="profile-tile-LanguagePreferences" or @content-desc="${languageData.profile.languageAndPreferences}" or @text="${languageData.profile.languageAndPreferences}"]`),
                expected: languageData.profile.languageAndPreferences,
                label:    'Language & Preferences',
            },
            {
                element: $(`//*[@resource-id="profile-tile-InformationScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-InformationScreen" or @content-desc="${languageData.profile.information}" or @text="${languageData.profile.information}"]`),
                expected: languageData.profile.information,
                label:    'Information',
            },
            {
                element: $(`//*[@resource-id="profile-login-logout-btn"]//android.widget.TextView | //*[@resource-id="profile-login-logout-btn" or @content-desc="${languageData.profile.logout}" or @text="${languageData.profile.logout}"]`),
                expected: languageData.profile.logout,
                label:    'Logout',
            },
        ];

        for (const tile of mandatoryProfileTiles) {
            await tile.element.waitForDisplayed({ timeout: 15000 });
            let tileText = await validator.getElementText(tile.element);
            if (!tileText) {
                tileText = await ProfilePage.getTileText(tile.element);
            }
            validator.logResult(tile.expected, tileText, tileText === tile.expected ? 'PASS' : 'FAIL');
            expect(tileText).toBe(tile.expected);
        }

        // Optional profile tiles (asserted only when visible for the current account)
        const optionalProfileTiles = [
            {
                element: $(`//*[@resource-id="profile-tile-Orders"]//android.widget.TextView | //*[@resource-id="profile-tile-Orders" or @content-desc="${languageData.profile.myPurchases}" or @text="${languageData.profile.myPurchases}"]`),
                expected: languageData.profile.myPurchases,
                label:    'My Purchases',
            },
            {
                element: $(`//*[@resource-id="profile-tile-WalletScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-WalletScreen" or @content-desc="${languageData.profile.wallet}" or @text="${languageData.profile.wallet}"]`),
                expected: languageData.profile.wallet,
                label:    'Wallet',
            },
            {
                element: $(`//*[@resource-id="profile-delete-account-btn"]//android.widget.TextView | //*[@resource-id="profile-delete-account-btn" or @content-desc="${languageData.profile.deleteAccount}" or @text="${languageData.profile.deleteAccount}"]`),
                expected: languageData.profile.deleteAccount,
                label:    'Delete Account',
            },
        ];

        for (const tile of optionalProfileTiles) {
            if (await tile.element.isDisplayed().catch(() => false)) {
                let tileText = await validator.getElementText(tile.element);
                if (!tileText) {
                    tileText = await ProfilePage.getTileText(tile.element);
                }
                validator.logResult(tile.expected, tileText, tileText === tile.expected ? 'PASS' : 'FAIL');
                expect(tileText).toBe(tile.expected);
            }
        }

        // Full-screen text scan: all mandatory profile strings must be visible
        const expectedProfileTexts = [
            languageData.profile.profile,
            languageData.profile.myData,
            languageData.profile.languageAndPreferences,
            languageData.profile.information,
            languageData.profile.logout,
        ];

        const visibleProfileTexts = await validator.verifyScreenTexts(expectedProfileTexts, {
            screenName:       'Profile Screen',
            customIgnoreList: [storeName, 'first-store-in-keyur', '18plush', 'Lokbest', 'Austria store_02'],
        });

        // Guard: no untranslated English text must be visible on a localised screen
        validator.detectUntranslatedEnglish(visibleProfileTexts);


        // ============================================================
        // 9. INFORMATION
        // ============================================================

        validator.printSection('Information');

        await InformationPage.clickInformationTile();


        // ============================================================
        // 10. FAQ
        // ============================================================

        validator.printSection('FAQ');

        // Guard: nl.json has no faqs.items – skip FAQ assertions with a clear warning.
        const expectedFaqItems = (languageData.faqs && languageData.faqs.items)
            ? languageData.faqs.items
            : null;

        if (!expectedFaqItems) {
            console.warn(
                `[localization-language.spec] WARNING: No "faqs.items" found in ` +
                `fixtures/languages/${fixtureFile}.json for language "${langCode.toUpperCase()}". ` +
                `FAQ assertions are SKIPPED. Add "faqs.items" to the fixture to enable them.`
            );
            return; // End test cleanly – fixture incomplete, not an app defect.
        }

        await InformationPage.clickFaqTile();

        const actualFaqItems = await InformationPage.getAllFaqItems(expectedFaqItems.length);

        // Count assertion
        validator.logResult(
            'FAQ item count',
            `${actualFaqItems.length}/${expectedFaqItems.length}`,
            actualFaqItems.length === expectedFaqItems.length ? 'PASS' : 'FAIL'
        );
        expect(actualFaqItems.length).toBe(expectedFaqItems.length);

        // Per-item question + answer assertions
        for (let i = 0; i < expectedFaqItems.length; i++) {
            const expected = expectedFaqItems[i];
            const actual   = actualFaqItems[i];

            validator.logResult(
                `FAQ ${i + 1} Question`,
                actual ? actual.question : '',
                actual && actual.question === expected.question ? 'PASS' : 'FAIL'
            );
            expect(actual.question).toBe(expected.question);

            validator.logResult(
                `FAQ ${i + 1} Answer`,
                actual ? actual.answer : '',
                actual && actual.answer === expected.answer ? 'PASS' : 'FAIL'
            );
            expect(actual.answer).toBe(expected.answer);
        }
        await InformationPage.clickBackButtonInfo();
        await InformationPage.clickBackToProfile();

        // ============================================================
        // 11. WALLET
        // ============================================================

        validator.printSection('Wallet');

        await ProfilePage.profileTitle.waitForDisplayed({ timeout: 15000 });
        await ProfilePage.clickWallet();

        await WalletPage.dismissTourIfPresent();

        // ── Verify How It Works Popup ──────────────────────────────
        const expectedWalletHowItWorks = (languageData.wallet && languageData.wallet.walletHowItWorks)
            ? languageData.wallet.walletHowItWorks
            : null;

        if (!expectedWalletHowItWorks) {
            console.warn(
                `[localization-language.spec] WARNING: No "wallet.walletHowItWorks" found in ` +
                `fixtures/languages/${fixtureFile}.json for language "${langCode.toUpperCase()}". ` +
                `Wallet How It Works popup assertions are SKIPPED.`
            );
        } else {
            await WalletPage.clickHowItWorksButton();

            // Heading assertion
            const actualHeading = await WalletPage.getHowItWorksHeading();
            validator.logResult(
                expectedWalletHowItWorks.title,
                actualHeading,
                actualHeading === expectedWalletHowItWorks.title ? 'PASS' : 'FAIL'
            );
            expect(actualHeading).toBe(expectedWalletHowItWorks.title);

            // Four messages assertion
            const actualMessages = await WalletPage.getHowItWorksMessages();
            const expectedMessages = expectedWalletHowItWorks.messages || [];

            validator.logResult(
                'Wallet How It Works message count',
                `${actualMessages.length}/${expectedMessages.length}`,
                actualMessages.length === expectedMessages.length ? 'PASS' : 'FAIL'
            );
            expect(actualMessages.length).toBe(expectedMessages.length);

            for (let i = 0; i < expectedMessages.length; i++) {
                const expectedMsg = expectedMessages[i];
                const actualMsg   = actualMessages[i] || '';

                validator.logResult(
                    `Wallet Message ${i + 1}`,
                    actualMsg,
                    actualMsg === expectedMsg ? 'PASS' : 'FAIL'
                );
                expect(actualMsg).toBe(expectedMsg);
            }

            // Close popup
            await WalletPage.clickCloseWalletHowItWorksButton();
        }

        // ── Back to Profile ─────────────────────────────────────────
        await WalletPage.clickBackButton();
        await ProfilePage.profileTitle.waitForDisplayed({ timeout: 15000 });

        
    });

});
