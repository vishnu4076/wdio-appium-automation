const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class InformationPage extends BasePage {

    get informationTile() {
        return $(
            '//*[contains(@resource-id, "Information")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "Information")]' +
            ' | //*[@text="Information" or @content-desc="Information"]'
        );
    }

    get faqTile() {
        return $(
            '//*[contains(@resource-id, "Faq")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "Faq")]' +
            ' | //*[@text="FAQs" or @text="FAQ" or @content-desc="FAQs" or @content-desc="FAQ"]'
        );
    }

    get faqList() {
        return $(
            '//*[@resource-id="faq-list" or contains(@resource-id, "faq-list") or @content-desc="faq-list"]'
        );
    }

    async clickInformationTile() {
        await this.informationTile.waitForDisplayed({
            timeout: TIMEOUTS.LONG
        });

        await this.informationTile.click();

        try {
            await this.faqTile.waitForDisplayed({
                timeout: 5000
            });
        } catch (_) {
            const container = await $('//*[@resource-id="profile-tile-InformationScreen"]').catch(() => null);
            if (container && await container.isDisplayed().catch(() => false)) {
                await container.click().catch(() => {});
            }
            await this.faqTile.waitForDisplayed({
                timeout: TIMEOUTS.LONG
            });
        }
    }

    async clickFaqTile() {
        await this.faqTile.waitForDisplayed({
            timeout: TIMEOUTS.LONG
        });

        await this.faqTile.click();

        const faqIndicator = $(
            '//*[@resource-id="faq-list" or contains(@resource-id, "faq-list") or contains(@resource-id, "faq-item-")]'
        );
        await faqIndicator.waitForDisplayed({
            timeout: TIMEOUTS.LONG
        }).catch(() => {});
        await browser.pause(1000);
    }

    async scrollDown() {
        try {
            const { width, height } = await driver.getWindowRect();
            const startX = Math.floor(width / 2);
            const startY = Math.floor(height * 0.7);
            const endY = Math.floor(height * 0.3);

            await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                .move({ x: startX, y: startY })
                .down()
                .pause(100)
                .move({ duration: 300, x: startX, y: endY })
                .up()
                .perform();

            await browser.pause(600);
            return true;
        } catch (_) {
            return false;
        }
    }

    async getAllFaqTexts(expectedList = []) {
        const collectedTexts = [];
        const seenTexts = new Set();
        let consecutiveStall = 0;

        for (let scroll = 0; scroll < 10; scroll++) {
            const elements = await $$('//android.widget.TextView');

            let newFoundInScroll = 0;
            for (const el of elements) {
                try {
                    const text = await el.getText().catch(() => '');
                    const trimmed = text ? text.trim() : '';
                    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
                        continue;
                    }

                    // Ignore screen title, navigation or non-question labels
                    if (/^faqs?$/i.test(trimmed) || trimmed === 'Information' || trimmed === '<' || trimmed.length < 5) {
                        continue;
                    }

                    if (expectedList.length > 0 && !expectedList.includes(trimmed)) {
                        continue;
                    }

                    if (!seenTexts.has(trimmed)) {
                        seenTexts.add(trimmed);
                        collectedTexts.push(trimmed);
                        newFoundInScroll++;
                    }
                } catch (_) {}
            }

            if (collectedTexts.length >= 12) {
                break;
            }

            if (newFoundInScroll === 0) {
                consecutiveStall++;
                if (consecutiveStall >= 3) {
                    break;
                }
            } else {
                consecutiveStall = 0;
            }

            await this.scrollDown();
        }

        return collectedTexts;
    }
}

const informationPage = new InformationPage();

informationPage.default = informationPage;

module.exports = informationPage;