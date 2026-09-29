/**
 * English Localization E2E Verification
 * ---------------------------------------
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
 * Source of truth: test/fixtures/languages/en.json
 */

const LanguagePage = require('../../pageobjects/onboarding/LanguagePage');
const OnboardingPage = require('../../pageobjects/onboarding/OnboardingPage');
const CountryPickerPage = require('../../pageobjects/authentication/CountryPickerPage');
const LoginPage = require('../../pageobjects/authentication/LoginPage');
const StorePage = require('../../pageobjects/store/StorePage');
const ProfilePage = require('../../pageobjects/profie/ProfilePage');
const { handlePermissions } = require('../../utils/permissions/permissionHandler');
const LocalizationValidator = require('../../utils/localization/LocalizationValidator');
const enData = require('../../fixtures/languages/en.json');
const userData = require('../../fixtures/testData/userData.json');
const storeData = require('../../fixtures/testData/storeData.json');

describe('English Localization E2E Verification', function () {
    this.timeout(400000);

    const validator = new LocalizationValidator(enData);

    it('should execute full English localization journey with strict text assertions', async () => {
        let storeName = storeData.ageRestrictedStore || 'first-store-in-keyur';

        // ============================================================
        // 1. LANGUAGE SELECTION
        // ============================================================
        validator.printSection('Language Selection');

        await LanguagePage.selectLanguage('English');

        // Mandatory assertion: Language Selection Title ("Choose your language")
        const langTitleEl = $(`android=new UiSelector().text("${enData.languageSelection.title}")`);
        await langTitleEl.waitForDisplayed({ timeout: 15000 });
        const actualLangTitle = await validator.getElementText(langTitleEl);
        validator.logResult(enData.languageSelection.title, actualLangTitle, actualLangTitle === enData.languageSelection.title ? 'PASS' : 'FAIL');
        expect(actualLangTitle).toBe(enData.languageSelection.title);

        // Mandatory assertion: Confirm Button ("Select")
        await LanguagePage.confirmButton.waitForDisplayed({ timeout: 15000 });
        const actualLangConfirm = await LanguagePage.getConfirmText();
        validator.logResult(enData.languageSelection.confirm, actualLangConfirm, actualLangConfirm === enData.languageSelection.confirm ? 'PASS' : 'FAIL');
        expect(actualLangConfirm).toBe(enData.languageSelection.confirm);

        await LanguagePage.confirmLanguage();

        // ============================================================
        // 2. ONBOARDING
        // ============================================================
        validator.printSection('Onboarding');

        await OnboardingPage.continueButton.waitForDisplayed({ timeout: 15000 });
        await OnboardingPage.clickIntroContinue();

        // Mandatory assertion: Skip Button in English ("Skip")
        const skipBtn = $(`//*[@content-desc="${enData.onboarding.skip}" or @text="${enData.onboarding.skip}"]`);
        await skipBtn.waitForDisplayed({ timeout: 15000 });
        const actualSkipText = await validator.getElementText(skipBtn);
        validator.logResult(enData.onboarding.skip, actualSkipText, actualSkipText === enData.onboarding.skip ? 'PASS' : 'FAIL');
        expect(actualSkipText).toBe(enData.onboarding.skip);

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

        // Mandatory assertion: Continue Button in English ("Continue")
        const permContinueBtn = $(`//*[@text="${enData.onboarding.continueToApp}" or @content-desc="${enData.onboarding.continueToApp}"]`);
        await permContinueBtn.waitForDisplayed({ timeout: 15000 });
        const actualPermContinue = await validator.getElementText(permContinueBtn);
        validator.logResult(enData.onboarding.continueToApp, actualPermContinue, actualPermContinue === enData.onboarding.continueToApp ? 'PASS' : 'FAIL');
        expect(actualPermContinue).toBe(enData.onboarding.continueToApp);

        // Click Continue to transition to Welcome / Country Picker
        await permContinueBtn.click();
        await browser.pause(1500);
        await handlePermissions();

        // ============================================================
        // 4. COUNTRY PICKER
        // ============================================================
        validator.printSection('Country Picker');

        // Mandatory assertion: Welcome Screen Title in English ("Welcome!")
        await CountryPickerPage.welcomeScreen.waitForDisplayed({ timeout: 25000 });
        const actualWelcomeTitle = await CountryPickerPage.getWelcomeText();
        validator.logResult(enData.countryPicker.welcomeTitle, actualWelcomeTitle, actualWelcomeTitle === enData.countryPicker.welcomeTitle ? 'PASS' : 'FAIL');
        expect(actualWelcomeTitle).toBe(enData.countryPicker.welcomeTitle);

        await CountryPickerPage.openCountryPicker();
        await CountryPickerPage.selectCountry(userData.defaultUser.country || 'Croatia');

        // ============================================================
        // 5. LOGIN
        // ============================================================
        validator.printSection('Login');

        await LoginPage.phoneInput.waitForDisplayed({ timeout: 25000 });

        // Mandatory assertion: Continue Button in English ("Continue")
        await LoginPage.continueButton.waitForDisplayed({ timeout: 15000 });
        const actualLoginContinue = await validator.getElementText(LoginPage.continueButton);
        validator.logResult(enData.login.continue, actualLoginContinue, actualLoginContinue === enData.login.continue ? 'PASS' : 'FAIL');
        expect(actualLoginContinue).toBe(enData.login.continue);

        // Enter phone number & continue
        await LoginPage.enterPhoneNumber(userData.defaultUser.phoneNumber || '563563563');
        await LoginPage.clickContinue();

        // Mandatory assertion: Sign In Button in English ("Sign In")
        await LoginPage.passwordInput.waitForDisplayed({ timeout: 20000 });
        await LoginPage.signInButton.waitForDisplayed({ timeout: 15000 });
        const actualSignIn = await validator.getElementText(LoginPage.signInButton);
        validator.logResult(enData.login.signIn, actualSignIn, actualSignIn === enData.login.signIn ? 'PASS' : 'FAIL');
        expect(actualSignIn).toBe(enData.login.signIn);

        // Enter password & sign in
        await LoginPage.enterPassword(userData.defaultUser.password || 'Test@123');
        await LoginPage.signIn();
        await LoginPage.signInButton.waitForDisplayed({ reverse: true, timeout: 15000 }).catch(() => { });

        // ============================================================
        // 6. STORE CONFIRMATION & NAVIGATION
        // ============================================================
        validator.printSection('Store Confirmation');

        // Mandatory assertion: Confirm Button in English ("Confirm")
        await StorePage.confirmButtonToStore.waitForDisplayed({ timeout: 30000 });
        let actualConfirmStore = await validator.getElementText(StorePage.confirmButtonToStore);
        if (!actualConfirmStore) {
            try {
                const childTv = await StorePage.confirmButtonToStore.$('android.widget.TextView');
                actualConfirmStore = await validator.getElementText(childTv);
            } catch (_) { }
        }
        validator.logResult(enData.store.confirm, actualConfirmStore, actualConfirmStore === enData.store.confirm ? 'PASS' : 'FAIL');
        expect(actualConfirmStore).toBe(enData.store.confirm);

        await StorePage.clickConfirmToStore(enData.store.confirm);
        await browser.pause(2000);

        // Dismiss store tour coachmark if shown
        try {
            await StorePage.clickTourSkip(enData.onboarding.skip);
        } catch (_) { }

        // If on store selection screen, search & open target store
        if (await StorePage.searchInput.isDisplayed().catch(() => false)) {
            storeName = storeData.ageRestrictedStore || 'first-store-in-keyur';
            await StorePage.searchAndOpenStore(storeName);
            try {
                await StorePage.clickTourSkip(enData.onboarding.skip);
            } catch (_) { }
        }

        // ============================================================
        // 7. STORE HOME (WITHOUT CLICKING BUTTONS/TABS)
        // ============================================================
        validator.printSection('Store Home');
        await browser.pause(2000);

        // Mandatory assertion: Products Tab ("Products")
        const productsTabEl = $(`//*[@resource-id="home-tab-products-btn"]//android.widget.TextView | //*[@resource-id="home-tab-products-btn"] | //*[@text="${enData.store.products}"]`);
        await productsTabEl.waitForDisplayed({ timeout: 15000 });
        const actualProducts = await validator.getElementText(productsTabEl);
        validator.logResult(enData.store.products, actualProducts, actualProducts === enData.store.products ? 'PASS' : 'FAIL');
        expect(actualProducts).toBe(enData.store.products);

        // Mandatory assertion: Categories Tab ("Categories")
        const categoriesTabEl = $(`//*[@resource-id="home-tab-categories-btn"]//android.widget.TextView | //*[@resource-id="home-tab-categories-btn"] | //*[@text="${enData.store.categories}"]`);
        await categoriesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualCategories = await validator.getElementText(categoriesTabEl);
        validator.logResult(enData.store.categories, actualCategories, actualCategories === enData.store.categories ? 'PASS' : 'FAIL');
        expect(actualCategories).toBe(enData.store.categories);

        // Mandatory assertion: Check In Button ("Check In")
        const checkInEl = $(`//*[@resource-id="home-checkin-btn"]//android.widget.TextView | //*[@resource-id="home-checkin-btn"] | //*[@text="${enData.store.checkIn}"]`);
        await checkInEl.waitForDisplayed({ timeout: 15000 });
        const actualCheckIn = await validator.getElementText(checkInEl);
        validator.logResult(enData.store.checkIn, actualCheckIn, actualCheckIn === enData.store.checkIn ? 'PASS' : 'FAIL');
        expect(actualCheckIn).toBe(enData.store.checkIn);

        // Mandatory assertion: Stores Tab ("Stores")
        const storesTabEl = $(`//*[@resource-id="tab-stores-btn"]//android.widget.TextView | //*[@resource-id="tab-stores-btn"] | //*[@text="${enData.store.stores}"]`);
        await storesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualStoresTab = await validator.getElementText(storesTabEl);
        validator.logResult(enData.store.stores, actualStoresTab, actualStoresTab === enData.store.stores ? 'PASS' : 'FAIL');
        expect(actualStoresTab).toBe(enData.store.stores);

        // Mandatory assertion: Activities Tab ("Activities")
        const activitiesTabEl = $(`//*[@resource-id="activity-tab-all-btn"]//android.widget.TextView | //*[@resource-id="activity-tab-all-btn"] | //*[@text="${enData.activities.title}"]`);
        await activitiesTabEl.waitForDisplayed({ timeout: 15000 });
        const actualActivitiesTab = await validator.getElementText(activitiesTabEl);
        validator.logResult(enData.activities.title, actualActivitiesTab, actualActivitiesTab === enData.activities.title ? 'PASS' : 'FAIL');
        expect(actualActivitiesTab).toBe(enData.activities.title);

        // ============================================================
        // 8. PROFILE
        // ============================================================
        validator.printSection('Profile');

        // Mandatory Profile Tab assertion and navigation
        const profileTabEl = $(`//*[@resource-id="tab-profile-btn"]//android.widget.TextView | //*[@resource-id="tab-profile-btn"] | //*[@text="${enData.profile.profile}"]`);
        await profileTabEl.waitForDisplayed({ timeout: 15000 });
        const actualProfileTab = await validator.getElementText(profileTabEl);
        validator.logResult(enData.profile.profile, actualProfileTab, actualProfileTab === enData.profile.profile ? 'PASS' : 'FAIL');
        expect(actualProfileTab).toBe(enData.profile.profile);

        await profileTabEl.click();
        await browser.pause(1000);

        // Dismiss tour coachmark modal if displayed ("My Data" -> "Skip")
        try {
            for (let i = 0; i < 3; i++) {
                const skipCoachmark = $(
                    `//*[@resource-id="tour-skip-btn" or @content-desc="${enData.onboarding.skip}" or @text="${enData.onboarding.skip}"]`
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

        // Mandatory Profile Title assertion ("Profile")
        const profileTitleEl = $(`//*[@resource-id="profile-title"]//android.widget.TextView | //*[@resource-id="profile-title" or @content-desc="${enData.profile.profile}" or @text="${enData.profile.profile}"]`);
        await profileTitleEl.waitForDisplayed({ timeout: 15000 });
        const actualProfileTitle = await validator.getElementText(profileTitleEl);
        validator.logResult(enData.profile.profile, actualProfileTitle, actualProfileTitle === enData.profile.profile ? 'PASS' : 'FAIL');
        expect(actualProfileTitle).toBe(enData.profile.profile);

        // Mandatory assertions for all standard Profile menu tiles
        const profileTiles = [
            { element: $(`//*[@resource-id="profile-tile-MyDataScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-MyDataScreen" or @content-desc="${enData.profile.myData}" or @text="${enData.profile.myData}"]`), expected: enData.profile.myData, label: 'My Data' },
            { element: $(`//*[@resource-id="profile-tile-LanguagePreferences"]//android.widget.TextView | //*[@resource-id="profile-tile-LanguagePreferences" or @content-desc="${enData.profile.languageAndPreferences}" or @text="${enData.profile.languageAndPreferences}"]`), expected: enData.profile.languageAndPreferences, label: 'Language & Preferences' },
            { element: $(`//*[@resource-id="profile-tile-InformationScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-InformationScreen" or @content-desc="${enData.profile.information}" or @text="${enData.profile.information}"]`), expected: enData.profile.information, label: 'Information' },
            { element: $(`//*[@resource-id="profile-login-logout-btn"]//android.widget.TextView | //*[@resource-id="profile-login-logout-btn" or @content-desc="${enData.profile.logout}" or @text="${enData.profile.logout}"]`), expected: enData.profile.logout, label: 'Logout' },
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
            { element: $(`//*[@resource-id="profile-tile-Orders"]//android.widget.TextView | //*[@resource-id="profile-tile-Orders" or @content-desc="${enData.profile.myPurchases}" or @text="${enData.profile.myPurchases}"]`), expected: enData.profile.myPurchases, label: 'My Purchases' },
            { element: $(`//*[@resource-id="profile-tile-WalletScreen"]//android.widget.TextView | //*[@resource-id="profile-tile-WalletScreen" or @content-desc="${enData.profile.wallet}" or @text="${enData.profile.wallet}"]`), expected: enData.profile.wallet, label: 'Wallet' },
            { element: $(`//*[@resource-id="profile-delete-account-btn"]//android.widget.TextView | //*[@resource-id="profile-delete-account-btn" or @content-desc="${enData.profile.deleteAccount}" or @text="${enData.profile.deleteAccount}"]`), expected: enData.profile.deleteAccount, label: 'Delete Account' },
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
            enData.profile.profile,
            enData.profile.myData,
            enData.profile.languageAndPreferences,
            enData.profile.information,
            enData.profile.logout
        ];
        const visibleProfileTexts = await validator.verifyScreenTexts(expectedProfileTexts, {
            screenName: 'Profile Screen',
            customIgnoreList: [storeName, 'first-store-in-keyur', '18plush', 'Lokbest']
        });

        // Verify no untranslated English text is displayed on Profile screen
        validator.detectUntranslatedEnglish(visibleProfileTexts);
    });
});
