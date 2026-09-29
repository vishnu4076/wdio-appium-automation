const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class ActivityPage extends BasePage {

    // ============================================================
    // PAGE TITLE
    // ============================================================

    get activitiesTitle() {
        return $('id:activities-title');
    }

    // ============================================================
    // SEARCH
    // ============================================================

    get activitiesSearchInput() {
        return $('id:activities-search-input');
    }

    // ============================================================
    // TABS
    // ============================================================

    get allActivitiesTab() {
        return $('id:activity-tab-all-btn');
    }

    get storeVisitsTab() {
        return $('id:activity-tab-store-visits-btn');
    }

    get newsTab() {
        return $('id:activity-tab-news-btn');
    }

    // ============================================================
    // EMPTY STATE TEXTS
    // ============================================================

    get noActivitiesText() {
        return $('~no-activities-text');
    }

    get noNewsText() {
        return $('~no-news-text');
    }

    get noNotificationsText() {
        return $('~no-notifications-text');
    }

    // ============================================================
    // HELPER – reads content-desc first, then falls back to getText()
    // ============================================================

    async getTabText(element) {
        try {
            const desc = await element.getAttribute('content-desc');
            if (desc && desc.trim()) return desc.trim();
        } catch (_) { /* ignore */ }
        try {
            const text = await element.getText();
            if (text && text.trim()) return text.trim();
        } catch (_) { /* ignore */ }
        return '';
    }

    // ============================================================
    // ACTIONS
    // ============================================================

    async navigateToActivities() {
        await this.activitiesTitle.waitForDisplayed({ timeout: TIMEOUTS.LONG });
    }

    async clickAllActivitiesTab() {
        await this.clickElement(this.allActivitiesTab, TIMEOUTS.MEDIUM);
    }

    async clickStoreVisitsTab() {
        await this.clickElement(this.storeVisitsTab, TIMEOUTS.MEDIUM);
    }

    async clickNewsTab() {
        await this.clickElement(this.newsTab, TIMEOUTS.MEDIUM);
    }
}

module.exports = new ActivityPage();