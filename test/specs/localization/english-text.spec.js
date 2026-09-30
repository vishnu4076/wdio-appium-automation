/**
 * English Localization E2E Verification
 * ---------------------------------------
 * Full localization verification for Lokbest Android App.
 *
 * Flow:
 *  1. Language Selection
 *  2. Onboarding
 *  3. Permissions
 *  4. Country Picker
 *  5. Login
 *  6. Store Confirmation
 *  7. Store Home
 *  8. Profile
 *  9. Information
 * 10. FAQ
 */

const LanguagePage = require('../../pageobjects/onboarding/LanguagePage');
const OnboardingPage = require('../../pageobjects/onboarding/OnboardingPage');
const CountryPickerPage = require('../../pageobjects/authentication/CountryPickerPage');
const LoginPage = require('../../pageobjects/authentication/LoginPage');
const StorePage = require('../../pageobjects/store/StorePage');
const ProfilePage = require('../../pageobjects/profie/ProfilePage');
const InformationPage = require('../../pageobjects/profie/InformationPage');

const { handlePermissions } = require('../../utils/permissions/permissionHandler');
const LocalizationValidator = require('../../utils/localization/LocalizationValidator');

const enData = require('../../fixtures/languages/en.json');
const userData = require('../../fixtures/testData/userData.json');
const storeData = require('../../fixtures/testData/storeData.json');

describe('English Localization E2E Verification', function () {

    this.timeout(400000);

    const validator = new LocalizationValidator(enData);

    it('should execute full English localization journey with strict text assertions', async () => {

        let storeName = storeData.testStore || 'Austria store_02';


        // ============================================================
        // 1. LANGUAGE SELECTION
        // ============================================================

        validator.printSection('Language Selection');

        await LanguagePage.selectLanguage('English');

        const actualLangTitle = await LanguagePage.getLanguageTitle(
            enData.languageSelection.title
        );

        validator.logResult(
            enData.languageSelection.title,
            actualLangTitle,
            actualLangTitle === enData.languageSelection.title
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualLangTitle).toBe(
            enData.languageSelection.title
        );

        await LanguagePage.confirmButton.waitForDisplayed({
            timeout: 15000
        });

        const actualLangConfirm = await LanguagePage.getConfirmText();

        validator.logResult(
            enData.languageSelection.confirm,
            actualLangConfirm,
            actualLangConfirm === enData.languageSelection.confirm
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualLangConfirm).toBe(
            enData.languageSelection.confirm
        );

        await LanguagePage.confirmLanguage();


        // ============================================================
        // 2. ONBOARDING
        // ============================================================

        validator.printSection('Onboarding');

        await OnboardingPage.continueButton.waitForDisplayed({
            timeout: 15000
        });

        await OnboardingPage.clickIntroContinue();

        await OnboardingPage.skipButton.waitForDisplayed({
            timeout: 15000
        });

        const actualSkipText = await validator.getElementText(
            OnboardingPage.skipButton
        );

        validator.logResult(
            enData.onboarding.skip,
            actualSkipText,
            actualSkipText === enData.onboarding.skip
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualSkipText).toBe(
            enData.onboarding.skip
        );

        await OnboardingPage.skipButton.click();

        await browser.pause(1000);


        // ============================================================
        // 3. PERMISSIONS
        // ============================================================

        validator.printSection('Permissions');

        await browser.pause(1000);

        await handlePermissions();

        await OnboardingPage.continueToAppButton.waitForDisplayed({
            timeout: 15000
        });

        const actualPermContinue = await validator.getElementText(
            OnboardingPage.continueToAppButton
        );

        validator.logResult(
            enData.onboarding.continueToApp,
            actualPermContinue,
            actualPermContinue === enData.onboarding.continueToApp
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualPermContinue).toBe(
            enData.onboarding.continueToApp
        );

        await OnboardingPage.continueToAppButton.click();

        await browser.pause(1500);

        await handlePermissions();


        // ============================================================
        // 4. COUNTRY PICKER
        // ============================================================

        validator.printSection('Country Picker');

        await CountryPickerPage.welcomeScreen.waitForDisplayed({
            timeout: 25000
        });

        const actualWelcomeTitle =
            await CountryPickerPage.getWelcomeText();

        validator.logResult(
            enData.countryPicker.welcomeTitle,
            actualWelcomeTitle,
            actualWelcomeTitle === enData.countryPicker.welcomeTitle
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualWelcomeTitle).toBe(
            enData.countryPicker.welcomeTitle
        );

        await CountryPickerPage.openCountryPicker();

        await CountryPickerPage.selectCountry(
            userData.defaultUser.country || 'Croatia'
        );


        // ============================================================
        // 5. LOGIN
        // ============================================================

        validator.printSection('Login');

        await LoginPage.phoneInput.waitForDisplayed({
            timeout: 25000
        });

        await LoginPage.continueButton.waitForDisplayed({
            timeout: 15000
        });

        const actualLoginContinue =
            await validator.getElementText(
                LoginPage.continueButton
            );

        validator.logResult(
            enData.login.continue,
            actualLoginContinue,
            actualLoginContinue === enData.login.continue
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualLoginContinue).toBe(
            enData.login.continue
        );

        await LoginPage.enterPhoneNumber(
            userData.defaultUser.phoneNumber || '563563563'
        );

        await LoginPage.clickContinue();

        await LoginPage.passwordInput.waitForDisplayed({
            timeout: 20000
        });

        await LoginPage.signInButton.waitForDisplayed({
            timeout: 15000
        });

        const actualSignIn =
            await validator.getElementText(
                LoginPage.signInButton
            );

        validator.logResult(
            enData.login.signIn,
            actualSignIn,
            actualSignIn === enData.login.signIn
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualSignIn).toBe(
            enData.login.signIn
        );

        await LoginPage.enterPassword(
            userData.defaultUser.password || 'Test@123'
        );

        await LoginPage.signIn();

        await LoginPage.signInButton
            .waitForDisplayed({
                reverse: true,
                timeout: 15000
            })
            .catch(() => { });


        // ============================================================
        // 6. STORE CONFIRMATION
        // ============================================================

        validator.printSection('Store Confirmation');

        await StorePage.confirmButtonToStore.waitForDisplayed({
            timeout: 30000
        });

        const actualConfirmStore =
            await validator.getElementText(
                StorePage.confirmButtonToStore
            );

        validator.logResult(
            enData.store.confirm,
            actualConfirmStore,
            actualConfirmStore === enData.store.confirm
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualConfirmStore).toBe(
            enData.store.confirm
        );

        await StorePage.clickConfirmToStore(
            enData.store.confirm
        );

        await browser.pause(2000);

        try {
            await StorePage.clickTourSkip(
                enData.onboarding.skip
            );
        } catch (_) { }

        if (
            await StorePage.searchInput
                .isDisplayed()
                .catch(() => false)
        ) {

            storeName =
                storeData.testStore ||
                'Austria store_02';

            await StorePage.searchAndOpenStore(
                storeName
            );

            try {
                await StorePage.clickTourSkip(
                    enData.onboarding.skip
                );
            } catch (_) { }
        }


        // ============================================================
        // 7. STORE HOME
        // ============================================================

        validator.printSection('Store Home');

        await browser.pause(2000);

        await StorePage.productsTab.waitForDisplayed({
            timeout: 15000
        });

        const actualProducts =
            await validator.getElementText(
                StorePage.productsTab
            );

        validator.logResult(
            enData.store.products,
            actualProducts,
            actualProducts === enData.store.products
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualProducts).toBe(
            enData.store.products
        );

        await StorePage.categoriesTab.waitForDisplayed({
            timeout: 15000
        });

        const actualCategories =
            await validator.getElementText(
                StorePage.categoriesTab
            );

        validator.logResult(
            enData.store.categories,
            actualCategories,
            actualCategories === enData.store.categories
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualCategories).toBe(
            enData.store.categories
        );

        await StorePage.checkInButton.waitForDisplayed({
            timeout: 15000
        });

        const actualCheckIn =
            await validator.getElementText(
                StorePage.checkInButton
            );

        validator.logResult(
            enData.store.checkIn,
            actualCheckIn,
            actualCheckIn === enData.store.checkIn
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualCheckIn).toBe(
            enData.store.checkIn
        );

        await StorePage.storesTab.waitForDisplayed({
            timeout: 15000
        });

        const actualStoresTab =
            await validator.getElementText(
                StorePage.storesTab
            );

        validator.logResult(
            enData.store.stores,
            actualStoresTab,
            actualStoresTab === enData.store.stores
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualStoresTab).toBe(
            enData.store.stores
        );

        await StorePage.activitiesTab.waitForDisplayed({
            timeout: 15000
        });

        const actualActivitiesTab =
            await validator.getElementText(
                StorePage.activitiesTab
            );

        validator.logResult(
            enData.activities.title,
            actualActivitiesTab,
            actualActivitiesTab === enData.activities.title
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualActivitiesTab).toBe(
            enData.activities.title
        );


        // ============================================================
        // 8. PROFILE
        // ============================================================

        validator.printSection('Profile');

        await StorePage.profileTab.waitForDisplayed({
            timeout: 15000
        });

        const actualProfileTab =
            await validator.getElementText(
                StorePage.profileTab
            );

        validator.logResult(
            enData.profile.profile,
            actualProfileTab,
            actualProfileTab === enData.profile.profile
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualProfileTab).toBe(
            enData.profile.profile
        );

        await StorePage.profileTab.click();

        try {
            for (let i = 0; i < 3; i++) {
                if (
                    await StorePage.skipTourButton
                        .waitForDisplayed({
                            timeout: 5000
                        })
                        .catch(() => false)
                ) {
                    await StorePage.skipTourButton.click();
                    await browser.pause(1000);
                } else {
                    break;
                }
            }
        } catch (_) { }

        await browser.pause(1000);

        await ProfilePage.profileTitle.waitForDisplayed({
            timeout: 15000
        });

        const actualProfileTitle =
            await validator.getElementText(
                ProfilePage.profileTitle
            );

        validator.logResult(
            enData.profile.profile,
            actualProfileTitle,
            actualProfileTitle === enData.profile.profile
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualProfileTitle).toBe(
            enData.profile.profile
        );

        const profileTiles = [
            {
                element: ProfilePage.myDataButton,
                expected: enData.profile.myData
            },
            {
                element: ProfilePage.languageAndPreferencesButton,
                expected: enData.profile.languageAndPreferences
            },
            {
                element: ProfilePage.informationButton,
                expected: enData.profile.information
            },
            {
                element: ProfilePage.logoutButton,
                expected: enData.profile.logout
            }
        ];

        for (const tile of profileTiles) {

            await tile.element.waitForDisplayed({
                timeout: 15000
            });

            let tileText =
                await validator.getElementText(
                    tile.element
                );

            if (!tileText) {
                tileText =
                    await ProfilePage.getTileText(
                        tile.element
                    );
            }

            validator.logResult(
                tile.expected,
                tileText,
                tileText === tile.expected
                    ? 'PASS'
                    : 'FAIL'
            );

            expect(tileText).toBe(
                tile.expected
            );
        }

        const additionalTiles = [
            {
                element: ProfilePage.myPurchasesButton,
                expected: enData.profile.myPurchases
            },
            {
                element: ProfilePage.walletButton,
                expected: enData.profile.wallet
            },
            {
                element: ProfilePage.deleteAccountButton,
                expected: enData.profile.deleteAccount
            }
        ];

        for (const tile of additionalTiles) {

            if (
                await tile.element
                    .isDisplayed()
                    .catch(() => false)
            ) {

                let tileText =
                    await validator.getElementText(
                        tile.element
                    );

                if (!tileText) {
                    tileText =
                        await ProfilePage.getTileText(
                            tile.element
                        );
                }

                validator.logResult(
                    tile.expected,
                    tileText,
                    tileText === tile.expected
                        ? 'PASS'
                        : 'FAIL'
                );

                expect(tileText).toBe(
                    tile.expected
                );
            }
        }

        const expectedProfileTexts = [
            enData.profile.profile,
            enData.profile.myData,
            enData.profile.languageAndPreferences,
            enData.profile.information,
            enData.profile.logout
        ];

        const visibleProfileTexts =
            await validator.verifyScreenTexts(
                expectedProfileTexts,
                {
                    screenName: 'Profile Screen',
                    customIgnoreList: [
                        storeName,
                        'Austria store_02'
                    ]
                }
            );

        validator.detectUntranslatedEnglish(
            visibleProfileTexts
        );


        // ============================================================
        // 9. INFORMATION
        // ============================================================

        validator.printSection('Information');

        await InformationPage.clickInformationTile();


        // ============================================================
        // 10. FAQ
        // ============================================================

        validator.printSection('FAQ');

        await InformationPage.clickFaqTile();

        const expectedFaqTexts =
            enData.faqs.questions;

        const actualFaqTexts =
            await InformationPage.getAllFaqTexts(
                expectedFaqTexts
            );

        validator.logResult(
            'FAQ question count',
            `${actualFaqTexts.length}/${expectedFaqTexts.length}`,
            actualFaqTexts.length === expectedFaqTexts.length
                ? 'PASS'
                : 'FAIL'
        );

        expect(actualFaqTexts.length).toBe(
            expectedFaqTexts.length
        );

        expectedFaqTexts.forEach(
            (expectedText, index) => {

                const actualText =
                    actualFaqTexts[index];

                validator.logResult(
                    `FAQ ${index + 1}`,
                    actualText,
                    actualText === expectedText
                        ? 'PASS'
                        : 'FAIL'
                );

                expect(actualText).toBe(
                    expectedText
                );
            }
        );

    });

});
