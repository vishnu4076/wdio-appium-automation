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
        await this.clickElement(this.englishButton, 20000);
    }

    async clickSelect() {
        try {
            await this.clickElement(this.selectButton, 10000);
        } catch (e) {
            // Fallback: try locating the Select button by visible text
            const altSelect = $('android=new UiSelector().text("Select")');
            await this.clickElement(altSelect, 10000);
        }
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
