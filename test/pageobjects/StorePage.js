const BasePage = require('./basePage');

class StorePage extends BasePage {

    get confirmButtonToStore() {
        return $('~Confirm');
    }

    async clickConfirmToStore() {

        await this.confirmButtonToStore.waitForDisplayed({ timeout: 20000 });
        await this.clickElement(this.confirmButtonToStore, 30000);
    }
    get confirmButton() {
        return $('~Confirm');
    }

    async confirm() {
        await this.clickElement(
            this.confirmButton,
            30000
        );
      
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
    get subscriptionSuccessMessage() {
        return $(
            'android=new UiSelector().text("News subscriber updated successfully")'
        );
    }
    async subscribeToStore(storeName) {

        // Scroll the store into view first (it may be off-screen)
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

        // Verify success popup
        const successMessage = this.subscriptionSuccessMessage;

        await successMessage.waitForDisplayed({
            timeout: 15000
        });

        const messageText = await successMessage.getText();

        expect(messageText).toBe(
            'News subscriber updated successfully'
        );
    }

    
    async openStore(storeName) {
        const store = this.getStore(storeName);

        await store.waitForDisplayed({
            timeout: 10000
        });

        await store.click();
    }

    // async subscribeToStore(storeName) {
    //     // Ensure the store list is visible and scroll to the desired store
    //     await this.scrollToStore(storeName);

    //     // Find the store element after scrolling
    //     const store = this.getStore(storeName);
    //     await store.waitForDisplayed({ timeout: 15000 });

    //     // Find Subscribe/Bell button for that store
    //     const subscribeButton = this.getSubscribeButton(storeName);
    //     await subscribeButton.waitForDisplayed({ timeout: 15000 });

    //     // Click Subscribe/Bell
    //     await subscribeButton.click();
    // }



    // async verifySubscriptionSuccess() {

    //     const message = this.subscriptionSuccessMessage;

    //     await message.waitForDisplayed({
    //         timeout: 10000
    //     });

    //     expect(await message.getText()).toBe(
    //         'News subscriber updated successfully'
    //     );
    // }





}

module.exports = new StorePage();