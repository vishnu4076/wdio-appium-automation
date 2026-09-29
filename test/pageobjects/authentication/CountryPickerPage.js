const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class CountryPickerPage extends BasePage {
    // All known welcome-title texts across supported languages
    static get WELCOME_TEXTS() {
        return ['Welcome!', 'Benvenuto!', 'Benvenuti!', 'Willkommen!'];
    }

    // Language-agnostic: finds the welcome title by resource-id, not by text
    get welcomeTitle() {
        return $('id:country-picker-welcome-title');
    }

    // Resilient selector: matches resource-id OR any known localized welcome text
    get welcomeScreen() {
        const textConditions = CountryPickerPage.WELCOME_TEXTS
            .map(t => `@text="${t}" or @content-desc="${t}"`)
            .join(' or ');
        return $(
            `//*[@resource-id="country-picker-welcome-title" or ${textConditions}]`
        );
    }

    // Fallback: find by any of the known welcome texts across languages
    getWelcomeTitleByText(expectedText) {
        return $(`android=new UiSelector().text("${expectedText}")`);
    }

    // Reads the actual welcome text using resource-id element → content-desc → getText() fallback
    async getWelcomeText() {
        try {
            const desc = await this.welcomeTitle.getAttribute('content-desc');
            if (desc && desc.trim()) return desc.trim();
        } catch (_) { /* ignore */ }
        try {
            return (await this.welcomeTitle.getText()).trim();
        } catch (_) { /* ignore */ }
        // Fallback: try welcomeScreen element
        try {
            const text = await this.welcomeScreen.getText();
            if (text && text.trim()) return text.trim();
        } catch (_) { /* ignore */ }
        return '';
    }

    get countryPicker() {
        // Matches German (+49) OR any phone code prefix (fallback)
        return $(
            '//*[contains(@content-desc, "+49") or contains(@content-desc, "phone")' +
            ' or @resource-id="country-picker-phone-code"]'
        );
    }

    getCountry(countryName) {
        return $(
            `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("${countryName}"))`
        );
    }

    async openCountryPicker() {
        const maxWaitMs = TIMEOUTS.SCREEN_TRANSITION;
        const pollIntervalMs = 2000;
        const startTime = Date.now();
        let reached = false;

        while (Date.now() - startTime < maxWaitMs) {
            // Check by resource-id first, then by resilient text-based selector
            const byId = await this.welcomeTitle.isDisplayed().catch(() => false);
            const byText = byId ? true : await this.welcomeScreen.isDisplayed().catch(() => false);
            if (byId || byText) {
                reached = true;
                break;
            }
            await browser.pause(pollIntervalMs);
        }

        if (!reached) {
            throw new Error(
                `Welcome screen not reached after ${maxWaitMs / 1000}s. Check app launch.`
            );
        }

        await browser.pause(1000);

        // Click country picker — try resource-id selector, fall back to +49 content-desc
        try {
            await this.clickElement(this.countryPicker, TIMEOUTS.MEDIUM);
        } catch (_) {
            const fallback = $('android=new UiSelector().descriptionContains("+49")');
            await this.clickElement(fallback, TIMEOUTS.MEDIUM);
        }

        await browser.pause(2000);
    }

    async selectCountry(countryName) {
        const country = this.getCountry(countryName);
        await country.waitForExist({ timeout: TIMEOUTS.LONG });
        await this.clickElement(country, TIMEOUTS.LONG);
    }
}

module.exports = new CountryPickerPage();
