const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class StorePage extends BasePage {
    // ============================================================
    // CONFIRM STORE
    // ============================================================

    get confirmButtonToStore() {
        // Language-independent selector: matches testID TextView or button container
        return $(
            '//*[@resource-id="select-location-confirm-btn"]//android.widget.TextView' +
            ' | //*[@resource-id="select-location-confirm-btn" or @content-desc="select-location-confirm-btn"]' +
            ' | (//android.widget.EditText/following::android.widget.TextView)[last()]'
        );
    }

    get confirmButton() {
        return this.confirmButtonToStore;
    }

    getLocalizedConfirmButton(localizedText) {
        if (!localizedText || localizedText === 'Confirm') {
            return this.confirmButtonToStore;
        }

        return $(
            `//*[@content-desc="${localizedText}" or @text="${localizedText}"` +
            ` or @content-desc="Confirm" or @text="Confirm"]`
        );
    }

    get selectStoreTitle() {
        return $('id:select-store-title');
    }

    get storeListSearchInput() {
        return $('id:store-list-search-input');
    }

    get storesTab() {
        return $(
            '//*[@resource-id="tab-stores-btn" or @content-desc="Stores" or @text="Stores"' +
            ' or @content-desc="Geschäfte" or @text="Geschäfte"' +
            ' or @content-desc="Läden" or @text="Läden"' +
            ' or @content-desc="Negozi" or @text="Negozi"]'
        );
    }

    get activitiesTab() {
        return $(
            '//*[@resource-id="activity-tab-all-btn" or @content-desc="Activities" or @text="Activities"' +
            ' or @content-desc="Aktivitäten" or @text="Aktivitäten"' +
            ' or @content-desc="Attività" or @text="Attività"]'
        );
    }

    get profileTab() {
        return $(
            '//*[@resource-id="tab-profile-btn" or @content-desc="Profile" or @text="Profile"' +
            ' or @content-desc="Profil" or @text="Profil"' +
            ' or @content-desc="Profilo" or @text="Profilo"]'
        );
    }

    get productsTab() {
        return $(
            '//*[@resource-id="home-tab-products-btn"]//android.widget.TextView | //*[@resource-id="home-tab-products-btn"]'
        );
    }

    get categoriesTab() {
        return $(
            '//*[@resource-id="home-tab-categories-btn"]//android.widget.TextView | //*[@resource-id="home-tab-categories-btn"]'
        );
    }

    async clickActivitiesTab() {
        await this.activitiesTab.waitForDisplayed({ timeout: 15000 });
        await this.activitiesTab.click();
    }


    // ============================================================
    // CONFIRM TO STORE
    // ============================================================

    async clickConfirmToStore() {
        // Hide keyboard if still open
        try {
            if (await driver.isKeyboardShown()) {
                await driver.hideKeyboard();
            }
        } catch (e) {
            // Keyboard is not open
        }

        // Wait for independent Confirm to Store button
        await this.confirmButtonToStore.waitForDisplayed({
            timeout: TIMEOUTS.EXTRA_LONG
        });

        // Click Confirm to Store (clicks TextView)
        await this.confirmButtonToStore.click();
        await browser.pause(1000);

        // If location screen is still present, tap parent container
        const locationInput = $('//android.widget.EditText');
        if (await locationInput.isDisplayed().catch(() => false)) {
            try {
                const parentBtn = await this.confirmButtonToStore.parentElement();
                await parentBtn.click();
            } catch (_) {
                await this.confirmButtonToStore.click().catch(() => { });
            }
        }

        // Wait for location screen to dismiss (address input disappears)
        await locationInput.waitForDisplayed({
            reverse: true,
            timeout: 15000
        }).catch(() => {
            console.warn('[WARN] Confirm to Store screen took longer to dismiss.');
        });
    }

    async confirm() {
        await this.clickConfirmToStore();
    }

    // ============================================================
    // STORE LOCATORS
    // ============================================================

    getStore(storeName) {
        return $(`//android.view.ViewGroup[@content-desc="${storeName}"]`);
    }

    getSubscribeButton(storeName) {
        return $(
            `//android.view.ViewGroup[@content-desc="${storeName}"]` +
            `/parent::android.view.ViewGroup` +
            `//android.view.ViewGroup[contains(@resource-id,"notification-btn")]`
        );
    }

    // ============================================================
    // SEARCH STORE
    // ============================================================

    get searchInput() {
        return $(
            '//*[@content-desc="Address, store" or @text="Address, store"' +
            ' or @resource-id="store-list-search-input" or contains(@resource-id, "store-list-search")]'
        );
    }

    async searchAndOpenStore(storeName) {
        // Dismiss keyboard if open
        try {
            if (await driver.isKeyboardShown()) {
                await driver.hideKeyboard();
            }
        } catch (_) { }

        // 1. Open search
        await this.searchInput.waitForDisplayed({
            timeout: TIMEOUTS.EXTRA_LONG
        });

        await this.searchInput.click();
        await browser.pause(500);

        // 2. Clear and enter store name
        await this.searchInput.clearValue();
        await this.searchInput.setValue(storeName);

        // 3. Wait for search results
        await browser.pause(2500);

        // 4. Find store result
        const storeResult = $(
            `android=new UiSelector().className("android.widget.TextView").textContains("${storeName}")`
        );

        await storeResult.waitForExist({
            timeout: TIMEOUTS.MEDIUM
        });

        // 5. Find clickable store card
        const storeCard = $(
            `//android.widget.TextView[contains(@text, "${storeName}")]` +
            `/ancestor::android.view.ViewGroup[@clickable="true"][1]`
        );

        try {
            await storeCard.waitForExist({
                timeout: TIMEOUTS.SHORT
            });

            // First click dismisses keyboard
            await storeCard.click();
            await browser.pause(1000);

            // Second click opens store
            await storeCard.click();

        } catch (e) {
            await storeResult.click();
            await browser.pause(1000);
            await storeResult.click();
        }

        // Allow store page to load
        await browser.pause(3000);
    }

    // ============================================================
    // SCROLL TO STORE
    // ============================================================

    async scrollToStore(storeName) {
        const selector =
            `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(` +
            `new UiSelector().description("${storeName}")` +
            `)`;

        await $(selector).waitForExist({
            timeout: TIMEOUTS.LONG
        });
    }

    // ============================================================
    // OPEN STORE
    // ============================================================

    async openStore(storeName) {
        const scrollSelector =
            `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(` +
            `new UiSelector().description("${storeName}")` +
            `)`;

        try {
            await $(scrollSelector).waitForExist({
                timeout: TIMEOUTS.LONG
            });

        } catch (e) {
            const scrollByText =
                `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(` +
                `new UiSelector().textContains("${storeName}")` +
                `)`;

            await $(scrollByText).waitForExist({
                timeout: 15000
            });
        }

        await browser.pause(1000);

        // Primary locator
        try {
            const store = $(
                `//android.view.ViewGroup[@content-desc="${storeName}"]`
            );

            await store.waitForDisplayed({
                timeout: 8000
            });

            await store.click();

        } catch (e) {
            try {
                const store = $(`~${storeName}`);

                await store.waitForDisplayed({
                    timeout: TIMEOUTS.SHORT
                });

                await store.click();

            } catch (e2) {
                const store = $(
                    `android=new UiSelector().description("${storeName}")`
                );

                await store.waitForDisplayed({
                    timeout: TIMEOUTS.SHORT
                });

                await store.click();
            }
        }

        await browser.pause(2000);
    }

    // ============================================================
    // SUBSCRIBE TO STORE
    // ============================================================

    get subscriptionSuccessMessage() {
        return $(
            'android=new UiSelector().text("News subscriber updated successfully")'
        );
    }

    async subscribeToStore(storeName) {
        await this.scrollToStore(storeName);

        const store = this.getStore(storeName);

        await store.waitForDisplayed({
            timeout: 15000
        });

        const subscribeButton = this.getSubscribeButton(storeName);

        await subscribeButton.waitForDisplayed({
            timeout: 15000
        });

        await subscribeButton.click();

        await this.subscriptionSuccessMessage.waitForDisplayed({
            timeout: 15000
        });
    }

    async getSubscriptionSuccessMessage() {
        await this.subscriptionSuccessMessage.waitForDisplayed({
            timeout: 15000
        });

        return await this.subscriptionSuccessMessage.getText();
    }

    // ============================================================
    // SKIP
    // ============================================================

    get skipTourButton() {
        return $(
            '//*[@resource-id="tour-skip-btn" or @content-desc="tour-skip-btn"]//android.widget.TextView' +
            ' | //*[@resource-id="tour-skip-btn" or @content-desc="tour-skip-btn"]' +
            ' | //*[@text="Skip" or @content-desc="Skip"]'
        );
    }

    async clickTourSkip(localizedText = null) {
        const btn = localizedText
            ? $(`//*[@resource-id="tour-skip-btn" or @content-desc="${localizedText}" or @text="${localizedText}"]`)
            : this.skipTourButton;

        await btn.waitForDisplayed({
            timeout: 10000
        });

        await btn.click();
        await browser.pause(1000);
    }

    get skipButton() {
        return $('~Skip');
    }

    async clickSkip() {
        try {
            await this.skipButton.waitForDisplayed({
                timeout: TIMEOUTS.MEDIUM
            });

            await this.skipButton.click();
            await browser.pause(1000);

        } catch (e) {
            console.warn(
                '[StorePage] Skip button not displayed, continuing.'
            );
        }
    }

    // ============================================================
    // CHECK IN
    // ============================================================

    get checkInButton() {
        return $(
            '//*[@resource-id="home-checkin-btn"]//android.widget.TextView | //*[@resource-id="home-checkin-btn"]'
        );
    }

    async clickCheckIn() {
        await this.checkInButton.waitForDisplayed({
            timeout: TIMEOUTS.SHORT
        });

        await this.checkInButton.click();
    }

    // ============================================================
    // AGE VERIFICATION
    // ============================================================

    get verifyNowButton() {
        return $('~Verify now');
    }

    get ageVerificationTitle() {
        return $('~age-verification-title');
    }

    async clickVerifyNow() {
        await this.verifyNowButton.waitForDisplayed({
            timeout: TIMEOUTS.SHORT
        });

        await this.verifyNowButton.click();
        await browser.pause(2500);
    }

    // ============================================================
    // CONTACT STORE MANAGER
    // ============================================================

    get contactManagerBtn() {
        return $('~Contact the store manager directly');
    }

    get bookIdTitle() {
        return $('~book-id-verification-title');
    }

    async clickContactStoreManager() {
        await this.contactManagerBtn.waitForDisplayed({
            timeout: TIMEOUTS.MEDIUM
        });

        await this.contactManagerBtn.click();
        await browser.pause(2500);
    }

    // ============================================================
    // CALL THE SELLER
    // ============================================================

    get callTheSellerButton() {
        return $('~Call the Seller');
    }

    async getCallTheSellerButtonState() {
        await this.callTheSellerButton.waitForDisplayed({
            timeout: TIMEOUTS.LONG
        });

        const displayed = await this.callTheSellerButton.isDisplayed();

        const clickable =
            (await this.callTheSellerButton.getAttribute('clickable')) === 'true';

        return {
            displayed,
            clickable
        };
    }

    // ============================================================
    // SELECT STORE FOR BOOK ID VERIFICATION
    // ============================================================

    async clickStoreToBook(storeName) {
        await browser.pause(1000);

        const storeText = $(
            `android=new UiSelector().textContains("${storeName}")`
        );

        const exists = await storeText.isExisting();

        if (!exists) {
            try {
                const scrollSelector =
                    `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(` +
                    `new UiSelector().textContains("${storeName}")` +
                    `)`;

                await $(scrollSelector).waitForExist({
                    timeout: TIMEOUTS.MEDIUM
                });

            } catch (e) {
                console.log(
                    `[clickStoreToBook] Scroll not needed or failed.`
                );
            }
        }

        await storeText.waitForExist({
            timeout: TIMEOUTS.MEDIUM
        });

        const storeCard = $(
            `//android.widget.TextView[contains(@text, "${storeName}")]` +
            `/ancestor::android.view.ViewGroup[@clickable="true"][1]`
        );

        try {
            if (await storeCard.isExisting()) {
                await storeCard.click();
            } else {
                await storeText.click();
            }

        } catch (e) {
            await storeText.click();
        }

        return storeName;
    }
}

module.exports = new StorePage();

