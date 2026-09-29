const OnboardingPage = require('../pageobjects/onboarding/OnboardingPage');
const CountryPickerPage = require('../pageobjects/authentication/CountryPickerPage');
const LoginPage = require('../pageobjects/authentication/LoginPage');
const StorePage = require('../pageobjects/store/StorePage');
const { handlePermissions } = require('../utils/permissions/permissionHandler');
const storeData = require('../fixtures/testData/storeData.json');

describe('User Flow - App Launch to Store', function () {
    this.timeout(300000);

    it('should complete onboarding, login and enter store', async function () {
        // 1. Onboarding
        await OnboardingPage.selectEnglish();
        await OnboardingPage.clickSelect();
        await OnboardingPage.clickIntroContinue();
        await OnboardingPage.skip();

        // 2. Permissions
        await handlePermissions();

        // 3. Enter App
        await OnboardingPage.continueToApp();

        // 4. Country Selection
        await CountryPickerPage.openCountryPicker();
        await CountryPickerPage.selectCountry('Croatia');

        // 5. Login
        await LoginPage.login('3653653650', 'Test@1234');

        // 6. Store
        await StorePage.clickConfirmToStore();
        await StorePage.subscribeToStore(storeData.raymondStore);
    });
});
