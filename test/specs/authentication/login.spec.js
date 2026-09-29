const CountryPickerPage = require('../../pageobjects/authentication/CountryPickerPage');
const LoginPage = require('../../pageobjects/authentication/LoginPage');
const StorePage = require('../../pageobjects/store/StorePage');
const OnboardingPage = require('../../pageobjects/onboarding/OnboardingPage');
const { handlePermissions } = require('../../utils/permissions/permissionHandler');
const userData = require('../../fixtures/testData/userData.json');

describe('Authentication Flow', function () {
    this.timeout(300000);

    it('should complete login and navigate to store confirmation', async () => {
        // Complete initial onboarding to reach welcome/country selection
        await OnboardingPage.selectEnglish();
        await OnboardingPage.clickSelect();
        await OnboardingPage.clickIntroContinue();
        await OnboardingPage.skip();
        await handlePermissions();
        await OnboardingPage.continueToApp();
        await handlePermissions();

        // Select country
        await CountryPickerPage.openCountryPicker();
        await CountryPickerPage.selectCountry(userData.defaultUser.country);

        // Perform login
        await LoginPage.login(
            userData.defaultUser.phoneNumber,
            userData.defaultUser.password
        );

        // Confirm store access
        await StorePage.clickConfirmToStore();
    });
});
