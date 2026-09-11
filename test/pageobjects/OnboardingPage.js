const BasePage = require('./basePage');

class OnboardingPage extends BasePage {

    // Locators
    get englishButton() {
        return $('~English');
    }

    get selectButton() {
        return $('~Select');
    }

    get continueButton() {
        return $('android=new UiSelector().resourceId("intro-next-btn")');
    }

    get skipButton() {
        return $('~Skip');
    }

    get continueToAppButton() {
        return $('android=new UiSelector().text("Continue")');
    }


    // Actions
    async selectEnglish() {
        await this.clickElement(this.englishButton);
    }

    async clickSelect() {
        await this.clickElement(this.selectButton);
    }

    async clickIntroContinue() {
        await this.clickElement(this.continueButton);
    }

    async skip() {
        await this.clickElement(this.skipButton);
    }

    async continueToApp() {
        await this.clickElement(this.continueToAppButton, 15000);
    }

    async completeOnboarding() {
        await this.selectEnglish();
        await this.clickSelect();
        await this.clickIntroContinue();
        await this.skip();
    }
}

module.exports = new OnboardingPage();
