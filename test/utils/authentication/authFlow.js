const OnboardingPage = require('../../pageobjects/onboarding/OnboardingPage');
const CountryPickerPage = require('../../pageobjects/authentication/CountryPickerPage');
const LoginPage = require('../../pageobjects/authentication/LoginPage');
const StorePage = require('../../pageobjects/store/StorePage');
const { handlePermissions } = require('../permissions/permissionHandler');
const userData = require('../../fixtures/testData/userData.json');

/**
 * Reusable end-to-end authentication and store navigation helper
 * @param {Object} options
 * @param {string} options.language
 * @param {string} options.country
 * @param {string} options.phoneNumber
 * @param {string} options.password
 */
async function loginToStore(options = {}) {
    const {
        country = userData.defaultUser.country,
        phoneNumber = userData.defaultUser.phoneNumber,
        password = userData.defaultUser.password
    } = options;

    // 1. Onboarding
    await OnboardingPage.selectEnglish();
    await OnboardingPage.clickSelect();
    await OnboardingPage.clickIntroContinue();
    await OnboardingPage.skip();

    // 2. Initial Permissions
    await handlePermissions();

    // 3. Enter App
    await OnboardingPage.continueToApp();
    await handlePermissions();

    // 4. Country Selection
    await CountryPickerPage.openCountryPicker();
    await CountryPickerPage.selectCountry(country);

    // 5. Login
    await LoginPage.login(phoneNumber, password);

    // 6. Confirm to Store
    await StorePage.clickConfirmToStore();
}

module.exports = {
    loginToStore
};
