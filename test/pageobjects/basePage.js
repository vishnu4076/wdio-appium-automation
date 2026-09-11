class BasePage {

    async waitForElement(element, timeout = 10000) {
        await element.waitForDisplayed({ timeout });
    }

    async clickElement(element, timeout = 10000) {
        await element.waitForDisplayed({ timeout });
        await element.click();
    }

    async setText(element, value, timeout = 10000) {
        await element.waitForDisplayed({ timeout });
        await element.setValue(value);
    }
}

module.exports = BasePage;