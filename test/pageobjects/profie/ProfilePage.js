const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class ProfilePage extends BasePage {

    // ============================================================
    // PAGE TITLE
    // ============================================================

    get profileTitle() {
        return $('id:profile-title');
    }

    // ============================================================
    // MENU TILES
    // ============================================================

    get myPurchasesButton() {
        return $('id:profile-tile-Orders');
    }

    get myDataButton() {
        return $('id:profile-tile-MyDataScreen');
    }

    get walletButton() {
        return $('id:profile-tile-WalletScreen');
    }

    get returnDepositButton() {
        return $('id:profile-tile-ReturnDeposit');
    }

    get languageAndPreferencesButton() {
        return $('id:profile-tile-LanguagePreferences');
    }

    get informationButton() {
        return $('id:profile-tile-InformationScreen');
    }
    get backButton() {
        return $('~header-back-btn');
    }



    // ============================================================
    // ACTIONS
    // ============================================================

    get logoutButton() {
        return $('id:profile-login-logout-btn');
    }

    get deleteAccountButton() {
        return $('id:profile-delete-account-btn');
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
