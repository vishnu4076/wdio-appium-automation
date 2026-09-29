/**
 * LocalizationValidator
 * ---------------------
 * Senior QA Automation utility for mobile localization testing with WDIO + Appium.
 * - Extracts visible user-facing text from screen or container.
 * - Compares actual UI text with localized translations dictionary.
 * - Enforces mandatory assertions without silent skipping.
 * - Formats standardized PASS/FAIL output.
 * - Detects untranslated English text on localized screens.
 * - Intelligently filters dynamic values (prices, dates, numbers, IDs).
 */

class LocalizationValidator {
    /**
     * @param {Record<string, any>} languageData - Source of truth dictionary (e.g. it.json)
     */
    constructor(languageData) {
        this.data = languageData;

        // Known common English strings to detect when asserting non-English localization
        this.knownEnglishIndicators = [
            'Continue', 'Confirm', 'Skip', 'Welcome', 'Search',
            'Products', 'Categories', 'Check In', 'Stores', 'Activities',
            'Profile', 'My Purchases', 'My Data', 'Language & Preferences',
            'Language and Preferences', 'Information', 'Log out', 'Delete Account',
            'Settings', 'Orders'
        ];
    }

    /**
     * Prints a standardized section banner
     * @param {string} name
     */
    printSection(name) {
        console.log(`\n========== ${name.toUpperCase()} ==========`);
    }

    /**
     * Formats and prints assertion result
     * @param {string} expected
     * @param {string} actual
     * @param {'PASS' | 'FAIL'} status
     */
    logResult(expected, actual, status) {
        console.log(`Expected: ${expected}`);
        console.log(`Actual:   ${actual}`);
        console.log(`Status:   ${status}\n`);
    }

    /**
     * Identifies genuinely dynamic values (prices, dates, timestamps, pure numbers, IDs)
     * @param {string} text
     * @returns {boolean}
     */
    isDynamicValue(text) {
        if (!text || typeof text !== 'string') return true;
        const trimmed = text.trim();
        if (!trimmed) return true;

        // Pure numbers or phone codes (e.g. "123", "+385", "563563563")
        if (/^[\d+\-()\s]+$/.test(trimmed)) return true;

        // Currency / Prices (e.g. "€ 12.50", "12,50 €", "12.50kn", "$5")
        if (/[\$€£¥]|kn|EUR/i.test(trimmed) && /\d/.test(trimmed)) return true;

        // Time / Date formats (e.g. "12:30", "28.09.2026", "28/09/2026", "2026-09-28")
        if (/\b\d{1,2}[:.]\d{2}([:.]\d{2})?\b/.test(trimmed)) return true;
        if (/\b\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/.test(trimmed)) return true;

        // Standalone punctuation / bullet symbols (e.g. "*", "•", "1/6", ">")
        if (/^[\*\•\-\>\<\/\#\d\s]+$/.test(trimmed)) return true;

        return false;
    }

    /**
     * Cleans TalkBack/accessibility state prefixes/suffixes (e.g. "Selezionato Prodotti" -> "Prodotti")
     * @param {string} text
     * @returns {string}
     */
    cleanAccessibilityText(text) {
        if (!text || typeof text !== 'string') return '';
        return text
            .replace(/^(Selezionato|Selezionata|Selected|Ausgewählt|Ausgewählte|Ausgewähltes)[\s,.-]+/i, '')
            .replace(/[\s,.-]+(Selezionato|Selezionata|Selected|Ausgewählt|Ausgewählte|Ausgewähltes)$/i, '')
            .trim();
    }

    /**
     * Retrieves visible text from an element via content-desc, text, or child TextView
     * @param {WebdriverIO.Element} element
     * @returns {Promise<string>}
     */
    async getElementText(element) {
        try {
            const text = await element.getText();
            if (text && text.trim() && text.trim() !== 'null' && text.trim() !== 'undefined') {
                return this.cleanAccessibilityText(text.trim());
            }
        } catch (_) {}

        try {
            const child = await element.$('.//android.widget.TextView');
            if (await child.isExisting()) {
                const childText = await child.getText();
                if (childText && childText.trim() && childText.trim() !== 'null' && childText.trim() !== 'undefined') {
                    return this.cleanAccessibilityText(childText.trim());
                }
            }
        } catch (_) {}

        try {
            let desc = await element.getAttribute('content-desc');
            if (desc && desc.trim() && desc.trim() !== 'null' && desc.trim() !== 'undefined') {
                return this.cleanAccessibilityText(desc.trim());
            }
        } catch (_) {}

        try {
            const child = await element.$('.//android.widget.TextView');
            if (await child.isExisting()) {
                let childDesc = await child.getAttribute('content-desc');
                if (childDesc && childDesc.trim() && childDesc.trim() !== 'null' && childDesc.trim() !== 'undefined') {
                    return this.cleanAccessibilityText(childDesc.trim());
                }
            }
        } catch (_) {}

        return '';
    }

    /**
     * Enforces mandatory text equality with standardized logging
     * @param {WebdriverIO.Element} element
     * @param {string} expectedText
     * @param {string} [label]
     */
    async assertElementText(element, expectedText, label = '') {
        await element.waitForDisplayed({ timeout: 15000 });
        const actualText = await this.getElementText(element);
        const pass = actualText === expectedText;
        if (label) {
            console.log(`[Field] ${label}`);
        }
        this.logResult(expectedText, actualText, pass ? 'PASS' : 'FAIL');
        expect(actualText).toBe(expectedText);
    }

    /**
     * Collects all visible user-facing text from screen or container
     * @param {WebdriverIO.Element} [container]
     * @param {string[]} [customIgnoreList]
     * @returns {Promise<string[]>}
     */
    async collectVisibleTexts(container = null, customIgnoreList = []) {
        const textElements = container
            ? await container.$$('.//android.widget.TextView')
            : await $$('//android.widget.TextView');

        const collected = new Set();

        for (const el of textElements) {
            try {
                if (await el.isDisplayed()) {
                    let text = await el.getText();
                    if (!text || text === 'null') {
                        text = await el.getAttribute('content-desc');
                    }
                    if (text && text.trim() && text.trim() !== 'null' && text.trim() !== 'undefined') {
                        const cleaned = this.cleanAccessibilityText(text.trim());
                        if (cleaned && !this.isDynamicValue(cleaned) && !customIgnoreList.includes(cleaned)) {
                            collected.add(cleaned);
                        }
                    }
                }
            } catch (_) {}
        }

        return Array.from(collected);
    }

    /**
     * Verifies that all expected texts are present among visible screen texts
     * @param {string[]} expectedList
     * @param {{ screenName?: string, customIgnoreList?: string[] }} [options]
     * @returns {Promise<string[]>}
     */
    async verifyScreenTexts(expectedList, options = {}) {
        const { screenName = 'Screen', customIgnoreList = [] } = options;
        console.log(`\n--- Validating visible texts on ${screenName} ---`);
        const visibleTexts = await this.collectVisibleTexts(null, customIgnoreList);

        for (const expected of expectedList) {
            const isPresent = visibleTexts.includes(expected);
            this.logResult(
                expected,
                isPresent ? expected : `[NOT FOUND in visible: ${visibleTexts.join(' | ')}]`,
                isPresent ? 'PASS' : 'FAIL'
            );
            expect(visibleTexts).toContain(expected);
        }

        return visibleTexts;
    }

    /**
     * Detects untranslated English text on screen and fails if any is found.
     * Respects legitimate loanwords (e.g. "Wallet") that exist in the localization dictionary.
     * @param {string[]} visibleTexts
     */
    detectUntranslatedEnglish(visibleTexts) {
        const untranslatedFound = [];

        // Collect all legitimate localized strings in the active dictionary
        const legitimateValues = new Set();
        const extractStrings = (obj) => {
            for (const key of Object.keys(obj)) {
                if (typeof obj[key] === 'string') {
                    legitimateValues.add(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    extractStrings(obj[key]);
                }
            }
        };
        if (this.data) extractStrings(this.data);

        for (const text of visibleTexts) {
            if (this.knownEnglishIndicators.includes(text) && !legitimateValues.has(text)) {
                untranslatedFound.push(text);
            }
        }

        if (untranslatedFound.length > 0) {
            console.error(
                `[LocalizationValidator] Untranslated English text detected: ${untranslatedFound.join(', ')}`
            );
        }
        expect(untranslatedFound).toEqual([]);
    }
}

module.exports = LocalizationValidator;
