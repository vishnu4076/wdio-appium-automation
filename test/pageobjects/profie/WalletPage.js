const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class WalletPage extends BasePage {

    // ============================================================
    // LOCATORS
    // ============================================================

    get tourSkipButton() {
        return $(
            '//*[@resource-id="tour-skip-btn" or contains(@resource-id, "tour-skip-btn") or @content-desc="tour-skip-btn"]' +
            ' | //*[@text="Skip" or @content-desc="Skip"]' +
            ' | //*[@text="Salta" or @content-desc="Salta"]' +
            ' | //*[@text="Überspringen" or @content-desc="Überspringen"]' +
            ' | //*[@text="Overslaan" or @content-desc="Overslaan"]'
        );
    }

    get howItWorksButton() {
        return $(
            '//*[@resource-id="wallet-how-it-works-btn-label" or contains(@resource-id, "wallet-how-it-works-btn-label") or @content-desc="wallet-how-it-works-btn-label"]'
        );
    }

    get contentArea() {
        return $(
            '//*[@resource-id="contentarea" or contains(@resource-id, "contentarea") or @content-desc="contentarea"]'
        );
    }

    get headingElement() {
        return $(
            'android=new UiSelector().textContains("How does wallet work")'
        );
    }

    get closeWalletHowItWorksButton() {
        return $(
            '//*[@resource-id="how-wallet-works-close-btn" or contains(@resource-id, "how-wallet-works-close-btn") or @content-desc="how-wallet-works-close-btn"]'
        );
    }

    get backButton() {
        return $(
            '//*[@resource-id="header-back-btn" or contains(@resource-id, "header-back-btn") or @content-desc="header-back-btn"]'
        );
    }

    // ============================================================
    // ACTIONS
    // ============================================================

    /**
     * Dismisses wallet introductory tour/coachmark if present
     */
    async dismissTourIfPresent() {
        try {
            if (await this.tourSkipButton.waitForDisplayed({ timeout: 4000 })) {
                await this.tourSkipButton.click();
                await browser.pause(800);
            }
        } catch (_) {
            // Tour not present, proceed
        }
    }

    /**
     * Clicks "How does wallet work" button/link and waits until the popup
     * is fully opened and its content/heading is loaded.
     */
    async clickHowItWorksButton() {
        await this.dismissTourIfPresent();
        await this.clickElement(this.howItWorksButton, TIMEOUTS.MEDIUM);

        // Wait for the popup close button to confirm popup is opened
        await this.closeWalletHowItWorksButton.waitForDisplayed({ timeout: TIMEOUTS.LONG });
        await browser.pause(2000);

        // Wait until How It Works content/heading is rendered
        await browser.waitUntil(
            async () => {
                const heading = await this.getHowItWorksHeading();
                if (heading && heading.length > 0) {
                    return true;
                }

                // If card is still showing the logo side, tap the '?' button to flip card to content
                try {
                    const flipBtn = await $('//*[@text="?" or @content-desc="?"]');
                    if (await flipBtn.isDisplayed().catch(() => false)) {
                        await flipBtn.click().catch(() => {});
                        await browser.pause(1200);
                    }
                } catch (_) {}

                const retryHeading = await this.getHowItWorksHeading();
                return Boolean(retryHeading && retryHeading.length > 0);
            },
            {
                timeout: TIMEOUTS.LONG,
                interval: 1500,
                timeoutMsg: 'How it works popup content was not displayed within timeout'
            }
        );

        await browser.pause(500);
    }

    /**
     * Extracts heading/title text from the How It Works popup
     * @returns {Promise<string>}
     */
    async getHowItWorksHeading() {
        // Strategy 1: Heading via known selector or text match
        try {
            if (await this.headingElement.isDisplayed().catch(() => false)) {
                const text = (await this.headingElement.getText()).trim();
                if (text) return text;
            }
        } catch (_) {}

        // Strategy 2: XPath text match
        try {
            const headingEl = await $('//android.widget.TextView[contains(@text, "How does wallet work") or contains(@text, "wallet work") or contains(@text, "Wallet work")]');
            if (await headingEl.isDisplayed().catch(() => false)) {
                const text = (await headingEl.getText()).trim();
                if (text) return text;
            }
        } catch (_) {}

        // Strategy 3: Preceding sibling of contentarea
        try {
            const precedingSibling = await $('//*[contains(@resource-id, "contentarea")]/preceding-sibling::android.widget.TextView[last()]');
            if (await precedingSibling.isDisplayed().catch(() => false)) {
                const text = (await precedingSibling.getText()).trim();
                if (text && text.length > 5) return text;
            }
        } catch (_) {}

        // Strategy 4: First text view in contentarea if not starting with bullet
        try {
            const innerHeading = await $('//*[contains(@resource-id, "contentarea")]//android.widget.TextView[1]');
            if (await innerHeading.isDisplayed().catch(() => false)) {
                const text = (await innerHeading.getText()).trim();
                if (text && !/^[\u2022\u25E6\u25CB\u2218o•\-\*\·]/.test(text)) {
                    return text;
                }
            }
        } catch (_) {}

        // Strategy 5: Any non-bullet text view matching popup heading characteristics
        try {
            const allTvs = await $$('//android.widget.TextView');
            for (const tv of allTvs) {
                const text = (await tv.getText().catch(() => '')).trim();
                if (
                    text.length > 15 &&
                    text !== 'Wallet' &&
                    !/^[\u2022\u25E6\u25CB\u2218o•\-\*\·]/.test(text) &&
                    (text.toLowerCase().includes('wallet work') || text.toLowerCase().includes('wallet'))
                ) {
                    return text;
                }
            }
        } catch (_) {}

        return '';
    }

    /**
     * Extracts all 4 messages from the How It Works popup
     * @returns {Promise<string[]>}
     */
    async getHowItWorksMessages() {
        let textViews = await $$('//*[contains(@resource-id, "contentarea")]//android.widget.TextView');
        if (textViews.length < 4) {
            textViews = await $$('//android.widget.TextView');
        }

        const heading = await this.getHowItWorksHeading();
        const extracted = [];

        for (const tv of textViews) {
            try {
                const rawText = (await tv.getText()).trim();
                if (!rawText) continue;

                // Strip leading bullet characters (e.g. "◦ ", "• ", "o ", "· ")
                const cleaned = rawText.replace(/^[\u2022\u25E6\u25CB\u2218o•\-\*\·\s]+/, '').trim();

                // Filter out heading, close button, or other non-message texts
                if (
                    cleaned === heading ||
                    rawText === heading ||
                    cleaned === 'Close' ||
                    cleaned === 'X' ||
                    rawText === 'X' ||
                    cleaned === '?' ||
                    rawText === '?' ||
                    cleaned === 'Wallet' ||
                    rawText === 'Wallet'
                ) {
                    continue;
                }

                if (cleaned.length > 15 && !extracted.includes(cleaned)) {
                    extracted.push(cleaned);
                }
            } catch (_) {}
        }

        return extracted;
    }

    /**
     * Closes the How It Works popup via how-wallet-works-close-btn
     */
    async clickCloseWalletHowItWorksButton() {
        await this.clickElement(this.closeWalletHowItWorksButton, TIMEOUTS.MEDIUM);
        await browser.pause(1000);
    }

    /**
     * Clicks the back button on Wallet screen to navigate back to Profile
     */
    async clickBackButton() {
        await this.clickElement(this.backButton, TIMEOUTS.MEDIUM);
        await browser.pause(1000);
    }
}

module.exports = new WalletPage();