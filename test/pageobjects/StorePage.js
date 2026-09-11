const BasePage = require('./basePage');

class StorePage extends BasePage {

    get confirmButton() {
        return $('~Confirm');
    }

    async confirm() {
        await this.clickElement(
            this.confirmButton,
            30000
        );
    }
}

module.exports = new StorePage();