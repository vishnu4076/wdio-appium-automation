const BasePage = require('./basePage');

class CountryPickerPage extends BasePage {

    get welcomeTitle() {
        return $('android=new UiSelector().text("Welcome!")');
    }

    get countryPicker() {
        return $('android=new UiSelector().descriptionContains("+49")');
    }

    getCountry(countryName) {
        return $(
            `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("${countryName}"))`
        );
    }

    async openCountryPicker() {
        await this.waitForElement(this.welcomeTitle, 10000);
        await this.clickElement(this.countryPicker);
        await browser.pause(1500); // Wait for country list modal to open
    }

    async selectCountry(countryName) {
        const country = this.getCountry(countryName);
        await country.click();
    }
}

module.exports = new CountryPickerPage();