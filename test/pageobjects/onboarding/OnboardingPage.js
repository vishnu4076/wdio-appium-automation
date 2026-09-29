const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

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
            await this.clickElement(this.englishButton, TIMEOUTS.LONG);
        } catch (e) {
            console.warn('[OnboardingPage] selectEnglish: English button not found, skipping.');
        }
    }

    async clickSelect() {
        try {
            await this.clickElement(this.selectButton, TIMEOUTS.MEDIUM);
        } catch (e) {
            try {
                const altSelect = $('android=new UiSelector().text("Select")');
                await this.clickElement(altSelect, TIMEOUTS.SHORT);
            } catch (e2) {
                console.warn('[OnboardingPage] clickSelect: Select button not found, skipping.');
            }
        }
    }

    async clickIntroContinue() {
        try {
            await this.clickElement(this.continueButton, TIMEOUTS.MEDIUM);
        } catch (e) {
            console.warn('[OnboardingPage] clickIntroContinue: intro-next-btn not found, skipping.');
        }
    }

    async skip() {
        try {
            await this.clickElement(this.skipButton, TIMEOUTS.MEDIUM);
        } catch (e) {
            console.warn('[OnboardingPage] skip: Skip button not found, skipping.');
        }
    }

    async continueToApp() {
        try {
            await this.clickElement(this.continueToAppButton, TIMEOUTS.LONG);
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
