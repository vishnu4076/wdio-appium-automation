const { TIMEOUTS } = require('../../constants/timeouts');

class BasePage {
    /**
     * Wait for element to be displayed
     * @param {WebdriverIO.Element} element
     * @param {number} timeout
     */
    async waitForElement(element, timeout = TIMEOUTS.MEDIUM) {
        await element.waitForDisplayed({ timeout });
    }

    /**
     * Wait for element and click
     * @param {WebdriverIO.Element} element
     * @param {number} timeout
     */
    async clickElement(element, timeout = TIMEOUTS.MEDIUM) {
        await element.waitForDisplayed({ timeout });
        await element.click();
    }

    /**
     * Wait for element and set value
     * @param {WebdriverIO.Element} element
     * @param {string} value
     * @param {number} timeout
     */
    async setText(element, value, timeout = TIMEOUTS.MEDIUM) {
        await element.waitForDisplayed({ timeout });
        await element.setValue(value);
    }

    /**
     * Scroll to element containing text
     * @param {string} text
     * @param {number} timeout
     */
    async scrollToText(text, timeout = TIMEOUTS.LONG) {
        const selector = `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("${text}"))`;
        const el = $(selector);
        await el.waitForExist({ timeout });
        return el;
    }
}

module.exports = BasePage;
