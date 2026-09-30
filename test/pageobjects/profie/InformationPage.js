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

    get faqItems() {
        return $$(
            '//*[@resource-id="faq-list"]//android.view.ViewGroup[starts-with(@resource-id, "faq-item-")]'
        );
    }

    getFaqQuestion(faqItemId) {
        return $(`//*[@resource-id="${faqItemId}"]/following-sibling::android.widget.TextView[1]`);
    }

    getFaqToggle(faqItemId) {
        return $(
            `//*[@resource-id="${faqItemId}-toggle-btn"]` +
            ` | //*[@resource-id="${faqItemId}"]/following-sibling::*[contains(@resource-id, "-toggle-btn")][1]` +
            ` | //*[@resource-id="${faqItemId}"]//android.view.ViewGroup[contains(@resource-id, "-toggle-btn")]`
        );
    }

    getFaqAnswer(faqItemId) {
        return $(`//*[@resource-id="${faqItemId}"]/following-sibling::android.widget.TextView[2]`);
    }

    async getFaqQuestionText(faqItemId) {
        // Prioritize sibling (DOM confirmed: TextView is sibling of faq-item-*)
        const sibling = this.getFaqQuestion(faqItemId);
        let text = (await sibling.getText().catch(() => '')).trim();
        if (text) {
            return text;
        }

        // Fallback to child/descendant
        const child = $(`//*[@resource-id="${faqItemId}"]//android.widget.TextView[1]`);
        text = (await child.getText().catch(() => '')).trim();
        if (text) {
            return text;
        }

        return '';
    }

    async getFaqAnswerText(faqItemId) {
        // Prioritize sibling (when expanded, answer is following-sibling TextView 2)
        const sibling = this.getFaqAnswer(faqItemId);
        let text = (await sibling.getText().catch(() => '')).trim();
        if (text) {
            return text;
        }

        // Fallback to child/descendant
        const child = $(`//*[@resource-id="${faqItemId}"]//android.widget.TextView[2]`);
        text = (await child.getText().catch(() => '')).trim();
        if (text) {
            return text;
        }

        return '';
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
                await container.click().catch(() => { });
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
        }).catch(() => { });
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

    /**
     * Collects all FAQ items (questions and expanded answers) from the UI by dynamically
     * scrolling through the FAQ list until all items are discovered.
     * @returns {Promise<Array<{ id: string, question: string, answer: string }>>}
     */
    async getAllFaqItems() {
        const extractedFaqs = [];
        const processedItemIds = new Set();
        let consecutiveStall = 0;
        const MAX_SCROLLS = 15;

        for (let scroll = 0; scroll < MAX_SCROLLS; scroll++) {
            const items = await this.faqItems;
            let newProcessed = 0;

            for (const item of items) {
                const faqItemId = await item.getAttribute('resource-id').catch(() => null);
                if (!faqItemId || !faqItemId.startsWith('faq-item-') || faqItemId.includes('-toggle-btn')) {
                    continue;
                }

                if (processedItemIds.has(faqItemId)) {
                    continue;
                }

                // 1. Extract Question text
                let questionText = await this.getFaqQuestionText(faqItemId);
                if (!questionText) {
                    await browser.pause(400);
                    questionText = await this.getFaqQuestionText(faqItemId);
                }

                // 2. Expand Toggle
                const toggleEl = this.getFaqToggle(faqItemId);
                if (await toggleEl.isDisplayed().catch(() => false)) {
                    await toggleEl.click();
                    await browser.pause(500);
                }

                // Retry question if boundary rendering delayed it
                if (!questionText) {
                    questionText = await this.getFaqQuestionText(faqItemId);
                }

                // 3. Extract Answer text
                let answerText = await this.getFaqAnswerText(faqItemId);
                if (!answerText) {
                    await browser.pause(400);
                    answerText = await this.getFaqAnswerText(faqItemId);
                }

                // 4. Collapse Toggle to maintain clean scroll geometry
                if (await toggleEl.isDisplayed().catch(() => false)) {
                    await toggleEl.click().catch(() => { });
                    await browser.pause(300);
                }

                if (!questionText) {
                    throw new Error(`Failed to extract question text for FAQ item: "${faqItemId}"`);
                }

                extractedFaqs.push({
                    id: faqItemId,
                    question: questionText,
                    answer: answerText
                });

                processedItemIds.add(faqItemId);
                newProcessed++;
            }

            if (newProcessed === 0) {
                consecutiveStall++;
                if (consecutiveStall >= 2) {
                    break;
                }
            } else {
                consecutiveStall = 0;
            }

            await this.scrollDown();
        }

        return extractedFaqs;
    }

    /**
     * Backward-compatible alias for getAllFaqItems
     */
    async extractAllFaqQnA() {
        return this.getAllFaqItems();
    }
}

const informationPage = new InformationPage();

informationPage.default = informationPage;

module.exports = informationPage;