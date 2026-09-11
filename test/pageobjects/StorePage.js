const BasePage = require('./basePage');

class StorePage extends BasePage {

    get confirmButtonToStore() {
        return $('~Confirm');
    }

    async clickConfirmToStore() {
        try {
            await this.confirmButtonToStore.waitForDisplayed({ timeout: 20000 });
            await this.clickElement(this.confirmButtonToStore, 30000);
        } catch (e) {
            // Continue button may not be present on some store pages; proceed without error
            console.warn('Continue button not found, proceeding without clicking');
        }
    }
    get confirmButton() {
        return $('~Confirm');
    }

    async confirm() {
        await this.clickElement(
            this.confirmButton,
            30000
        );
        // No explicit wait needed after confirming; proceed to the next step
        // (If the store page loads asynchronously, subsequent actions will handle waiting)
    }

    getStore(storeName) {
        return $(
            `//android.view.ViewGroup[@content-desc=\"${storeName}\"]`
        );
    }

    getSubscribeButton(storeName) {
        return $(
            `//android.view.ViewGroup[@content-desc=\"${storeName}\"]` +
            `/parent::android.view.ViewGroup` +
            `//android.view.ViewGroup[contains(@resource-id,\"notification-btn\")]`
        );
    }

    async scrollToStore(storeName) {
        // Use Android UiScrollable to bring the store into view based on content-desc
        const selector = `android=new UiScrollable(new UiSelector().scrollable(true))` +
            `.scrollIntoView(new UiSelector().description("${storeName}"))`;
        await $(selector).waitForExist({ timeout: 20000 });
    }

    async subscribeToStore(storeName) {
        // Ensure the store list is visible and scroll to the desired store
        await this.scrollToStore(storeName);

        // Find the store element after scrolling
        const store = this.getStore(storeName);
        await store.waitForDisplayed({ timeout: 15000 });

        // Find Subscribe/Bell button for that store
        const subscribeButton = this.getSubscribeButton(storeName);
        await subscribeButton.waitForDisplayed({ timeout: 15000 });

        // Click Subscribe/Bell
        await subscribeButton.click();
    }



}

module.exports = new StorePage();