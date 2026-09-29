/**
 * Italian (Italiano) Localization E2E Verification
 * --------------------------------------------------
 * Professional, deterministic end-to-end localization test for Lokbest Android App.
 *
 * Mandatory & Unconditional verification across the entire user journey:
 *  1. Language Selection (Title, Confirm button)
 *  2. Onboarding (Intro Continue, Skip button)
 *  3. Permissions (Continue to App button)
 *  4. Country Picker (Welcome title, Country selection)
 *  5. Login (Continue button, Sign In button)
 *  6. Store Confirmation (Confirm to Store button)
 *  7. Store Home (Products, Categories, Check In, Stores, Activities)
 *  8. Profile (Profile tab, Profile title, and all menu tiles)
 *
 * Source of truth: test/fixtures/languages/it.json
 */

const LanguagePage = require('../../pageobjects/onboarding/LanguagePage');
const OnboardingPage = require('../../pageobjects/onboarding/OnboardingPage');
const CountryPickerPage = require('../../pageobjects/authentication/CountryPickerPage');
const LoginPage = require('../../pageobjects/authentication/LoginPage');
const StorePage = require('../../pageobjects/store/StorePage');
const ProfilePage = require('../../pageobjects/profie/ProfilePage');
const { handlePermissions } = require('../../utils/permissions/permissionHandler');
const LocalizationValidator = require('../../utils/localization/LocalizationValidator');
const itData = require('../../fixtures/languages/it.json');
const userData = require('../../fixtures/testData/userData.json');
const storeData = require('../../fixtures/testData/storeData.json');

describe('Italian (Italiano) Localization E2E Verification', function () {
    this.timeout(400000);

    const validator = new LocalizationValidator(itData);

    it('should execute full Italian localization journey with strict text assertions', async () => {
        let storeName = storeData.ageRestrictedStore || 'first-store-in-keyur';

        // ============================================================
        // 1. LANGUAGE SELECTION
        // ============================================================
        validator.printSection('Language Selection');

        await LanguagePage.selectLanguage('Italiano');

        // Mandatory assertion: Language Selection Title ("Scegli la tua lingua")
        const langTitleEl = $(`android=new UiSelector().text("${itData.languageSelection.title}")`);
        await langTitleEl.waitForDisplayed({ timeout: 15000 });
        const actualLangTitle = await validator.getElementText(langTitleEl);
        validator.logResult(itData.languageSelection.title, actualLangTitle, actualLangTitle === itData.languageSelection.title ? 'PASS' : 'FAIL');
        expect(actualLangTitle).toBe(itData.languageSelection.title);

        // Mandatory assertion: Confirm Button ("Conferma")
        await LanguagePage.confirmButton.waitForDisplayed({ timeout: 15000 });
        const actualLangConfirm = await LanguagePage.getConfirmText();
        validator.logResult(itData.languageSelection.confirm, actualLangConfirm, actualLangConfirm === itData.languageSelection.confirm ? 'PASS' : 'FAIL');
        expect(actualLangConfirm).toBe(itData.languageSelection.confirm);

        await LanguagePage.confirmLanguage();

        // ============================================================
        // 2. ONBOARDING
        // ============================================================
        validator.printSection('Onboarding');

        await OnboardingPage.continueButton.waitForDisplayed({ timeout: 15000 });
        await OnboardingPage.clickIntroContinue();

        // Mandatory assertion: Skip Button in Italian ("Salta") - No English fallback
        const skipBtn = $(`//*[@content-desc="${itData.onboarding.skip}" or @text="${itData.onboarding.skip}"]`);
        await skipBtn.waitForDisplayed({ timeout: 15000 });
        const actualSkipText = await validator.getElementText(skipBtn);
        validator.logResult(itData.onboarding.skip, actualSkipText, actualSkipText === itData.onboarding.skip ? 'PASS' : 'FAIL');
        expect(actualSkipText).toBe(itData.onboarding.skip);

        // Click Skip to transition to permissions
        await skipBtn.click();
        await browser.pause(1000);

        // ============================================================
        // 3. PERMISSIONS
        // ============================================================
        validator.printSection('Permissions');

        // Handle runtime Android system permission dialogs
        await browser.pause(1000);
        await handlePermissions();

        // Mandatory assertion: Continue Button in Italian ("Continua") - No English fallback
        const permContinueBtn = $(`//*[@text="${itData.onboarding.continueToApp}" or @content-desc="${itData.onboarding.continueToApp}"]`);
        await permContinueBtn.waitForDisplayed({ timeout: 15000 });
        const actualPermContinue = await validator.getElementText(permContinueBtn);
        validator.logResult(itData.onboarding.continueToApp, actualPermContinue, actualPermContinue === itData.onboarding.continueToApp ? 'PASS' : 'FAIL');
        expect(actualPermContinue).toBe(itData.onboarding.continueToApp);

        // Click Continue to transition to Welcome / Country Picker
        await permContinueBtn.click();
        await browser.pause(1500);
        await handlePermissions();

        // ============================================================
        // 4. COUNTRY PICKER
        // ============================================================
        validator.printSection('Country Picker');

        // Mandatory assertion: Welcome Screen Title in Italian ("Benvenuti!")
        await CountryPickerPage.welcomeScreen.waitForDisplayed({ timeout: 25000 });
        const actualWelcomeTitle = await CountryPickerPage.getWelcomeText();
        validator.logResult(itData.countryPicker.welcomeTitle, actualWelcomeTitle, actualWelcomeTitle === itData.countryPicker.welcomeTitle ? 'PASS' : 'FAIL');
        expect(actualWelcomeTitle).toBe(itData.countryPicker.welcomeTitle);

        await CountryPickerPage.openCountryPicker();
        await CountryPickerPage.selectCountry(userData.defaultUser.country || 'Croatia');

        // ============================================================
        // 5. LOGIN
        // ============================================================
        validator.printSection('Login');

        await LoginPage.phoneInput.waitForDisplayed({ timeout: 25000 });

        // Mandatory assertion: Continue Button in Italian ("Continua")
        await LoginPage.continueButton.waitForDisplayed({ timeout: 15000 });
        const actualLoginContinue = await validator.getElementText(LoginPage.continueButton);
        validator.logResult(itData.login.continue, actualLoginContinue, actualLoginContinue === itData.login.continue ? 'PASS' : 'FAIL');
        expect(actualLoginContinue).toBe(itData.login.continue);

        // Enter phone number & continue
        await LoginPage.enterPhoneNumber(userData.defaultUser.phoneNumber || '563563563');
        await LoginPage.clickContinue();

        // Mandatory assertion: Sign In Button in Italian ("Accedi")
        await LoginPage.passwordInput.waitForDisplayed({ timeout: 20000 });
        await LoginPage.signInButton.waitForDisplayed({ timeout: 15000 });
        const actualSignIn = await validator.getElementText(LoginPage.signInButton);
        validator.logResult(itData.login.signIn, actualSignIn, actualSignIn === itData.login.signIn ? 'PASS' : 'FAIL');
        expect(actualSignIn).toBe(itData.login.signIn);

        // Enter password & sign in
        await LoginPage.enterPassword(userData.defaultUser.password || 'Test@123');
        await LoginPage.signIn();
        await LoginPage.signInButton.waitForDisplayed({ reverse: true, timeout: 15000 }).catch(() => { });

        // ============================================================
        // 6. STORE CONFIRMATION & NAVIGATION
        // ============================================================
        validator.printSection('Store Confirmation');

        // Mandatory assertion: Confirm Button in Italian ("Conferma") - No English fallback
        await StorePage.confirmButtonToStore.waitForDisplayed({ timeout: 30000 });
        let actualConfirmStore = await validator.getElementText(StorePage.confirmButtonToStore);
        if (!actualConfirmStore) {
            try {
                const childTv = await StorePage.confirmButtonToStore.$('android.widget.TextView');
                actualConfirmStore = await validator.getElementText(childTv);
            } catch (_) { }
        }
        validator.logResult(itData.store.confirm, actualConfirmStore, actualConfirmStore === itData.store.confirm ? 'PASS' : 'FAIL');
        expect(actualConfirmStore).toBe(itData.store.confirm);

        await StorePage.clickConfirmToStore(itData.store.confirm);
        await browser.pause(2000);

        // Dismiss store tour coachmark if shown ("Il tuo negozio" -> "Salta")
        try {
            await StorePage.clickTourSkip(itData.onboarding.skip);
        } catch (_) { }

        // If on store selection screen, search & open target store
        if (await StorePage.searchInput.isDisplayed().catch(() => false)) {
            storeName = storeData.ageRestrictedStore || 'first-store-in-keyur';
            await StorePage.searchAndOpenStore(storeName);
            try {
                await StorePage.clickTourSkip(itData.onboarding.skip);
            } catch (_) { }
        }

        // ============================================================
        // 7. STORE HOME (WITHOUT CLICKING BUTTONS/TABS)
        // ============================================================
        validator.printSection('Store Home');
        await browser.pause(2000);

        // Mandatory assertion: Products Tab ("Prodotti")
        const productsTabEl = $(`//*[@resource-id="home-tab-products-btn"]//android.widget.TextView | //*[@resource-id="home-tab-products-btn" or @content-desc="${itData.store.products}" or contains(@content-desc, "${itData.store.products}") or @text="${itData.store.products}"]`);
        await productsTabEl.waitForDisplayed({ timeout: 15000 });
        const actualProducts = await validator.getElementText(productsTabEl);
        validator.logResult(itData.store.products, actualProducts, actualProducts === itData.store.products ? 'PASS' : 'FAIL');
        expect(actualProducts).toBe(itData.store.products);

        // Mandatory assertion: Categories Tab ("Categorie")
        const categoriesTabEl = $(`//*[@resource-id="home-tab-categories-btn"]//android.widget.TextView | //*[@resource-id="home-tab-categories-btn" or @content-desc="${itData.store.categories}" or contains(@content-desc, "${itData.store.categories}") or @text="${itData.store.categories}"]`);
        await categoriesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualCategories = await validator.getElementText(categoriesTabEl);
        validator.logResult(itData.store.categories, actualCategories, actualCategories === itData.store.categories ? 'PASS' : 'FAIL');
        expect(actualCategories).toBe(itData.store.categories);

        // Mandatory assertion: Check In Button ("Entra")
        const checkInEl = $(`//*[@resource-id="home-checkin-btn"]//android.widget.TextView | //*[@resource-id="home-checkin-btn" or @content-desc="${itData.store.checkIn}" or contains(@content-desc, "${itData.store.checkIn}") or @text="${itData.store.checkIn}"]`);
        await checkInEl.waitForDisplayed({ timeout: 15000 });
        const actualCheckIn = await validator.getElementText(checkInEl);
        validator.logResult(itData.store.checkIn, actualCheckIn, actualCheckIn === itData.store.checkIn ? 'PASS' : 'FAIL');
        expect(actualCheckIn).toBe(itData.store.checkIn);

        // Mandatory assertion: Stores Tab ("Negozi")
        const storesTabEl = $(`//*[@resource-id="tab-stores-btn"]//android.widget.TextView | //*[@resource-id="tab-stores-btn" or @content-desc="${itData.store.stores}" or contains(@content-desc, "${itData.store.stores}") or @text="${itData.store.stores}"]`);
        await storesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualStoresTab = await validator.getElementText(storesTabEl);
        validator.logResult(itData.store.stores, actualStoresTab, actualStoresTab === itData.store.stores ? 'PASS' : 'FAIL');
        expect(actualStoresTab).toBe(itData.store.stores);

        // Mandatory assertion: Activities Tab ("Attività")
        const activitiesTabEl = $(`//*[@resource-id="activity-tab-all-btn"]//android.widget.TextView | //*[@resource-id="activity-tab-all-btn" or @content-desc="${itData.activities.title}" or contains(@content-desc, "${itData.activities.title}") or @text="${itData.activities.title}"]`);
        await activitiesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualActivitiesTab = await validator.getElementText(activitiesTabEl);
        validator.logResult(itData.activities.title, actualActivitiesTab, actualActivitiesTab === itData.activities.title ? 'PASS' : 'FAIL');
        expect(actualActivitiesTab).toBe(itData.activities.title);

        // ============================================================
        // 8. PROFILE
        // ============================================================
        validator.printSection('Profile');

        // Mandatory Profile Tab assertion and navigation
        const profileTabEl = $(`//*[@resource-id="tab-profile-btn"]//android.widget.TextView | //*[@resource-id="tab-profile-btn" or @content-desc="${itData.profile.profile}" or contains(@content-desc, "${itData.profile.profile}") or @text="${itData.profile.profile}"]`);
        await profileTabEl.waitForDisplayed({ timeout: 15000 });
        const actualProfileTab = await validator.getElementText(profileTabEl);
        validator.logResult(itData.profile.profile, actualProfileTab, actualProfileTab === itData.profile.profile ? 'PASS' : 'FAIL');
        expect(actualProfileTab).toBe(itData.profile.profile);

        await profileTabEl.click();
        await browser.pause(1000);

        // Dismiss tour coachmark modal if displayed ("I miei dati" -> "Salta")
        try {
            for (let i = 0; i < 3; i++) {
                const skipCoachmark = $(
                    `//*[@resource-id="tour-skip-btn" or @content-desc="${itData.onboarding.skip}" or @text="${itData.onboarding.skip}"]`
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

        // Mandatory Profile Title assertion ("Profilo")
        const profileTitleEl = $(`//*[@resource-id="profile-title"]//android.widget.TextView | //*[@resource-id="profile-title" or @content-desc="${itData.profile.profile}" or @text="${itData.profile.profile}"]`);
        await profileTitleEl.waitForDisplayed({ timeout: 15000 });
        const actualProfileTitle = await validator.getElementText(profileTitleEl);
        validator.logResult(itData.profile.profile, actualProfileTitle, actualProfileTitle === itData.profile.profile ? 'PASS' : 'FAIL');
        expect(actualProfileTitle).toBe(itData.profile.profile);

        // Mandatory assertions for all standard Profile menu tiles
        const profileTiles = [
            { element: $(`//*[@resource-id="profile-tile-MyDataScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-MyDataScreen" or @content-desc="${itData.profile.myData}" or @text="${itData.profile.myData}"]`), expected: itData.profile.myData, label: 'My Data' },
            { element: $(`//*[@resource-id="profile-tile-LanguagePreferences"]//android.widget.TextView | //*[@resource-id="profile-tile-LanguagePreferences" or @content-desc="${itData.profile.languageAndPreferences}" or @text="${itData.profile.languageAndPreferences}"]`), expected: itData.profile.languageAndPreferences, label: 'Language & Preferences' },
            { element: $(`//*[@resource-id="profile-tile-InformationScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-InformationScreen" or @content-desc="${itData.profile.information}" or @text="${itData.profile.information}"]`), expected: itData.profile.information, label: 'Information' },
            { element: $(`//*[@resource-id="profile-login-logout-btn"]//android.widget.TextView | //*[@resource-id="profile-login-logout-btn" or @content-desc="${itData.profile.logout}" or @text="${itData.profile.logout}"]`), expected: itData.profile.logout, label: 'Logout' },
        ];

        for (const tile of profileTiles) {
            await tile.element.waitForDisplayed({ timeout: 15000 });
            let tileText = await validator.getElementText(tile.element);
            if (!tileText) {
                tileText = await ProfilePage.getTileText(tile.element);
            }
            validator.logResult(tile.expected, tileText, tileText === tile.expected ? 'PASS' : 'FAIL');
            expect(tileText).toBe(tile.expected);
        }

        // Additional profile tiles (verified if present for the account)
        const additionalTiles = [
            { element: $(`//*[@resource-id="profile-tile-Orders"]//android.widget.TextView | //*[@resource-id="profile-tile-Orders" or @content-desc="${itData.profile.myPurchases}" or @text="${itData.profile.myPurchases}"]`), expected: itData.profile.myPurchases, label: 'My Purchases' },
            { element: $(`//*[@resource-id="profile-tile-WalletScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-WalletScreen" or @content-desc="${itData.profile.wallet}" or @text="${itData.profile.wallet}"]`), expected: itData.profile.wallet, label: 'Wallet' },
            { element: $(`//*[@resource-id="profile-delete-account-btn"]//android.widget.TextView | //*[@resource-id="profile-delete-account-btn" or @content-desc="${itData.profile.deleteAccount}" or @text="${itData.profile.deleteAccount}"]`), expected: itData.profile.deleteAccount, label: 'Delete Account' },
        ];
        for (const tile of additionalTiles) {
            if (await tile.element.isDisplayed().catch(() => false)) {
                let tileText = await validator.getElementText(tile.element);
                if (!tileText) {
                    tileText = await ProfilePage.getTileText(tile.element);
                }
                validator.logResult(tile.expected, tileText, tileText === tile.expected ? 'PASS' : 'FAIL');
                expect(tileText).toBe(tile.expected);
            }
        }

        // Mandatory screen-level verification via LocalizationValidator
        const expectedProfileTexts = [
            itData.profile.profile,
            itData.profile.myData,
            itData.profile.languageAndPreferences,
            itData.profile.information,
            itData.profile.logout
        ];
        const visibleProfileTexts = await validator.verifyScreenTexts(expectedProfileTexts, {
            screenName: 'Profile Screen',
            customIgnoreList: [storeName, 'first-store-in-keyur', '18plush', 'Lokbest']
        });

        // Verify no untranslated English text is displayed on Profile screen
        validator.detectUntranslatedEnglish(visibleProfileTexts);
    });
});
