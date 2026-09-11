const BasePage = require('./basePage');

class LoginPage extends BasePage {

    // Locators

    get phoneNumberInput() {
        return $('~Phone Number *');
    }

    get continueButton() {
        return $(
            'android=new UiSelector().resourceId("landing-continue-btn")'
        );
    }

    get passwordInput() {
        return $(
            'android=new UiSelector().resourceId("login-password-input")'
        );
    }

    get signInButton() {
        return $('~Sign In');
    }


    // Actions

    async enterPhoneNumber(phoneNumber) {
        await this.setText(
            this.phoneNumberInput,
            phoneNumber
        );
    }

    async clickContinue() {
        await this.clickElement(this.continueButton);
    }

    async enterPassword(password) {
        await this.setText(
            this.passwordInput,
            password
        );
    }

    async signIn() {
        await this.clickElement(this.signInButton);
    }

    async login(phoneNumber, password) {

        await this.enterPhoneNumber(phoneNumber);

        await this.clickContinue();

        await this.enterPassword(password);

        await this.signIn();
    }
}

module.exports = new LoginPage();
