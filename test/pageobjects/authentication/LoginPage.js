const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class LoginPage extends BasePage {
    // Locators
    get phoneNumberInput() {
        return $('~Phone Number *');
    }

    get phoneInput() {
        return $('android=new UiSelector().resourceId("landing-phone-input")');
    }

    get continueButton() {
        return $('android=new UiSelector().resourceId("landing-continue-btn")');
    }

    get passwordInput() {
        return $('android=new UiSelector().resourceId("login-password-input")');
    }
    get forgotPasswordButton() {
        return $('android=new UiSelector().resourceId("login-forgot-password-btn")');
    }

    get signInButton() {
        return $('android=new UiSelector().resourceId("login-signin-btn")');
    }

    // Actions
    async enterPhoneNumber(phoneNumber) {
        await this.setText(this.phoneInput, phoneNumber, TIMEOUTS.EXTRA_LONG);
    }

    async clickContinue() {
        await this.clickElement(this.continueButton, TIMEOUTS.MEDIUM);
        await this.passwordInput.waitForDisplayed({ timeout: TIMEOUTS.LONG });
    }

    async enterPassword(password) {
        await this.setText(this.passwordInput, password, TIMEOUTS.LONG);
    }

    async signIn() {
        await this.clickElement(this.signInButton, TIMEOUTS.MEDIUM);
    }

    async login(phoneNumber, password) {
        await this.enterPhoneNumber(phoneNumber);
        await this.clickContinue();
        await this.enterPassword(password);
        await this.signIn();
    }
}

module.exports = new LoginPage();
