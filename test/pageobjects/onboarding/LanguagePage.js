const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

// Display names shown in the language selection sheet
const languageDisplayNames = {
    Deutsch: 'Deutsch',
    English: 'English',
    Italiano: 'Italiano',
};

// Resource-id based index map (used as primary strategy)
const languageIds = {
    Deutsch: 'language-sheet-language-option-0',
    English: 'language-sheet-language-option-1',
    Italiano: 'language-sheet-language-option-2',
};

class LanguagePage extends BasePage {
    getLanguageOption(language) {
        const resourceId = languageIds[language];
        if (!resourceId) {
            throw new Error(`Unsupported language: ${language}`);
        }
        return $(`android=new UiSelector().resourceId("${resourceId}")`);
    }

    /**
     * Select a language using a 3-layer fallback:
     *  1. resourceId index (e.g. language-sheet-language-option-2)
     *  2. content-desc matching the display name
     *  3. text matching the display name via UiSelector
     */
    async selectLanguage(language) {
        const displayName = languageDisplayNames[language] || language;

        // Strategy 1: resource-id index
        try {
            const byId = this.getLanguageOption(language);
            const visible = await byId.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM }).then(() => true).catch(() => false);
            if (visible) {
                await byId.click();
                console.log(`[LanguagePage] Selected "${language}" via resourceId`);
                return;
            }
        } catch (_) { /* fall through */ }

        // Strategy 2: content-desc equals display name
        try {
            const byDesc = $(`~${displayName}`);
            const visible = await byDesc.waitForDisplayed({ timeout: TIMEOUTS.SHORT }).then(() => true).catch(() => false);
            if (visible) {
                await byDesc.click();
                console.log(`[LanguagePage] Selected "${language}" via content-desc`);
                return;
            }
        } catch (_) { /* fall through */ }

        // Strategy 3: visible text
        try {
            const byText = $(`android=new UiSelector().text("${displayName}")`);
            await byText.waitForDisplayed({ timeout: TIMEOUTS.SHORT });
            await byText.click();
            console.log(`[LanguagePage] Selected "${language}" via UiSelector text`);
            return;
        } catch (_) { /* fall through */ }

        throw new Error(`[LanguagePage] Could not select language: ${language}`);
    }

    async getLanguageTitle(expectedTitle) {
        const title = $(`android=new UiSelector().text("${expectedTitle}")`);
        await title.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        return await title.getText();
    }

    get confirmButton() {
        return $('android=new UiSelector().resourceId("language-select-btn")');
    }

    async getConfirmText() {
        await this.confirmButton.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });

        // 1. Try finding child TextView inside the button
        try {
            const childText = $(
                'android=new UiSelector().resourceId("language-select-btn").childSelector(new UiSelector().className("android.widget.TextView"))'
            );
            if (await childText.isDisplayed()) {
                const text = await childText.getText();
                if (text && text.trim()) return text.trim();
            }
        } catch (e) {
            // fallback
        }

        // 2. Try XPath child TextView
        try {
            const xpathText = $('//*[@resource-id="language-select-btn"]//android.widget.TextView');
            if (await xpathText.isDisplayed()) {
                const text = await xpathText.getText();
                if (text && text.trim()) return text.trim();
            }
        } catch (e) {
            // fallback
        }

        // 3. Try direct element text
        const directText = await this.confirmButton.getText();
        if (directText && directText.trim()) return directText.trim();

        // 4. Try content-desc
        const contentDesc = await this.confirmButton.getAttribute('content-desc');
        if (contentDesc && contentDesc.trim()) return contentDesc.trim();

        return '';
    }

    async confirmLanguage() {
        await this.clickElement(this.confirmButton, TIMEOUTS.MEDIUM);
    }
}

module.exports = new LanguagePage();
