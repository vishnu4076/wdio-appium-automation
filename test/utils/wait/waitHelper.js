const { TIMEOUTS } = require('../../constants/timeouts');

class WaitHelper {
    /**
     * Wait for an element to be displayed
     * @param {WebdriverIO.Element} element
     * @param {number} timeout
     * @param {string} customMsg
     */
    static async waitForDisplayed(element, timeout = TIMEOUTS.MEDIUM, customMsg = '') {
        await element.waitForDisplayed({
            timeout,
            timeoutMsg: customMsg || `Element ${element.selector || ''} was not displayed after ${timeout}ms`
        });
    }

    /**
     * Wait for an element to exist in DOM
     * @param {WebdriverIO.Element} element
     * @param {number} timeout
     */
    static async waitForExist(element, timeout = TIMEOUTS.MEDIUM) {
        await element.waitForExist({
            timeout,
            timeoutMsg: `Element ${element.selector || ''} was not present in DOM after ${timeout}ms`
        });
    }

    /**
     * Wait for element to disappear / not be displayed
     * @param {WebdriverIO.Element} element
     * @param {number} timeout
     */
    static async waitForDisappear(element, timeout = TIMEOUTS.MEDIUM) {
        await element.waitForDisplayed({
            reverse: true,
            timeout,
            timeoutMsg: `Element ${element.selector || ''} was still displayed after ${timeout}ms`
        });
    }

    /**
     * Poll condition until it returns true or times out
     * @param {Function} conditionFn - async function returning boolean
     * @param {number} maxWaitMs
     * @param {number} pollIntervalMs
     * @param {string} failureMessage
     */
    static async pollUntil(conditionFn, maxWaitMs = TIMEOUTS.SCREEN_TRANSITION, pollIntervalMs = TIMEOUTS.POLL_INTERVAL, failureMessage = '') {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitMs) {
            try {
                const res = await conditionFn();
                if (res) return true;
            } catch (err) {
                // Keep polling
            }
            await browser.pause(pollIntervalMs);
        }
        throw new Error(failureMessage || `Condition not met within ${maxWaitMs}ms`);
    }
}

module.exports = WaitHelper;
