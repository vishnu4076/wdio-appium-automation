const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class ProfilePage extends BasePage {

    // ============================================================
    // PAGE TITLE
    // ============================================================

    get profileTitle() {
        return $(
            '//*[@resource-id="profile-title"]//android.widget.TextView | //*[@resource-id="profile-title"] | //*[@text="Profile" or @content-desc="Profile"]'
        );
    }

    // ============================================================
    // MENU TILES
    // ============================================================

    get myPurchasesButton() {
        return $(
            '//*[contains(@resource-id, "Orders") or contains(@resource-id, "Purchase")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "Orders") or contains(@resource-id, "Purchase")]' +
            ' | //*[@text="My Purchases" or @content-desc="My Purchases"]'
        );
    }

    get myDataButton() {
        return $(
            '//*[contains(@resource-id, "MyData")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "MyData")]' +
            ' | //*[@text="My Data" or @content-desc="My Data"]'
        );
    }

    get walletButton() {
        return $(
            '//*[contains(@resource-id, "Wallet")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "Wallet")]' +
            ' | //*[@text="Wallet" or @content-desc="Wallet"]'
        );
    }

    get returnDepositButton() {
        return $(
            '//*[contains(@resource-id, "Deposit") or contains(@resource-id, "ReturnDeposit")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "Deposit") or contains(@resource-id, "ReturnDeposit")]' +
            ' | //*[@text="Deposit" or @content-desc="Deposit"]'
        );
    }

    get languageAndPreferencesButton() {
        return $(
            '//*[contains(@resource-id, "Language") or contains(@resource-id, "Preferences")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "Language") or contains(@resource-id, "Preferences")]' +
            ' | //*[@text="Language & Preferences" or @content-desc="Language & Preferences"]'
        );
    }

    get informationButton() {
        return $(
            '//*[contains(@resource-id, "Information")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "Information")]' +
            ' | //*[@text="Information" or @content-desc="Information"]'
        );
    }

    get informationTile() {
        return this.informationButton;
    }

    get backButton() {
        return $('~header-back-btn');
    }

    // ============================================================
    // ACTIONS
    // ============================================================

    get logoutButton() {
        return $(
            '//*[@resource-id="profile-login-logout-btn"]//android.widget.TextView' +
            ' | //*[@resource-id="profile-login-logout-btn"]' +
            ' | //*[@text="Logout" or @content-desc="Logout"]'
        );
    }

    get deleteAccountButton() {
        return $(
            '//*[contains(@resource-id, "delete-account")]//android.widget.TextView' +
            ' | //*[contains(@resource-id, "delete-account")]' +
            ' | //*[@text="Delete Account" or @content-desc="Delete Account"]'
        );
    }
    async clickBack() {
        await this.backButton.click();
    }


    // ============================================================
    // HELPER – reads content-desc first, then getText(), then UiSelector by id
    // ============================================================

    async getTileText(element) {
        try {
            const desc = await element.getAttribute('content-desc');
            if (desc && desc.trim()) {
                return desc.replace(/^(Selezionato|Selezionata|Selected|Ausgewählt)[\s,.-]+/i, '').trim();
            }
        } catch (_) { /* ignore */ }
        try {
            const text = await element.getText();
            if (text && text.trim()) {
                return text.replace(/^(Selezionato|Selezionata|Selected|Ausgewählt)[\s,.-]+/i, '').trim();
            }
        } catch (_) { /* ignore */ }
        return '';
    }

    // ============================================================
    // ACTIONS
    // ============================================================

    async clickMyData() {
        await this.clickElement(this.myDataButton, TIMEOUTS.MEDIUM);
    }

    async clickWallet() {
        await this.clickElement(this.walletButton, TIMEOUTS.MEDIUM);
    }

    async clickInformation() {
        await this.clickElement(this.informationButton, TIMEOUTS.MEDIUM);
    }

    async clickLogout() {
        await this.clickElement(this.logoutButton, TIMEOUTS.MEDIUM);
    }
}

module.exports = new ProfilePage();
