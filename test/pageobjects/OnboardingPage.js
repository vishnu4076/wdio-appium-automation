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
        try {
            await this.clickElement(this.englishButton, 20000);
        } catch (e) {
            console.warn('[OnboardingPage] selectEnglish: English button not found, skipping.');
        }
    }

    async clickSelect() {
        try {
            await this.clickElement(this.selectButton, 10000);
        } catch (e) {
            try {
                // Fallback: try locating the Select button by visible text
                const altSelect = $('android=new UiSelector().text("Select")');
                await this.clickElement(altSelect, 5000);
            } catch (e2) {
                console.warn('[OnboardingPage] clickSelect: Select button not found, skipping.');
            }
        }
    }

    async clickIntroContinue() {
        try {
            await this.clickElement(this.continueButton, 10000);
        } catch (e) {
            console.warn('[OnboardingPage] clickIntroContinue: intro-next-btn not found, skipping.');
        }
    }

    async skip() {
        try {
            await this.clickElement(this.skipButton, 10000);
        } catch (e) {
            console.warn('[OnboardingPage] skip: Skip button not found, skipping.');
        }
    }

    async continueToApp() {
        try {
            await this.clickElement(this.continueToAppButton, 15000);
        } catch (e) {
            console.warn('[OnboardingPage] continueToApp: Continue button not found, skipping.');
        }
    }

    async completeOnboarding() {
        await this.selectEnglish();
        await this.clickSelect();
        await this.clickIntroContinue();
        await this.skip();
    }
}

module.exports = new OnboardingPage();
