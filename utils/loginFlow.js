const OnboardingPage = require('../test/pageobjects/OnboardingPage');
const CountryPickerPage = require('../test/pageobjects/CountryPickerPage');
const LoginPage = require('../test/pageobjects/LoginPage');
const StorePage = require('../test/pageobjects/StorePage');

const {
    handlePermissions
} = require('../test/pageobjects/permissions');


async function loginToStore() {

    // -------------------------
    // ONBOARDING
    // -------------------------

    await OnboardingPage.selectEnglish();

    await OnboardingPage.clickSelect();

    await OnboardingPage.clickIntroContinue();

    await OnboardingPage.skip();


    // -------------------------
    // PERMISSIONS
    // -------------------------

    await handlePermissions();


    // -------------------------
    // ENTER APP
    // -------------------------

    await OnboardingPage.continueToApp();


    // -------------------------
    // COUNTRY
    // -------------------------

    await CountryPickerPage.openCountryPicker();

    await CountryPickerPage.selectCountry('Croatia');


    // -------------------------
    // LOGIN
    // -------------------------

    await LoginPage.login(
        '3653653650',
        'Test@1234'
    );


    // -------------------------
    // STORE
    // -------------------------

    await StorePage.clickConfirmToStore();
}


module.exports = {
    loginToStore
};