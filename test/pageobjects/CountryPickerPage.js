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
        await browser.pause(2000); // Let Welcome screen transition finish
        await this.clickElement(this.countryPicker);
        await browser.pause(2000); // Let country list modal open
    }

    async selectCountry(countryName) {
        const country = this.getCountry(countryName);
        // Wait for the country element to be present after scrolling
        await country.waitForExist({ timeout: 20000 });
        await this.clickElement(country, 15000);
    }


}

module.exports = new CountryPickerPage();