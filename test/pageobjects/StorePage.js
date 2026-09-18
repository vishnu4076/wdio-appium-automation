const BasePage = require('./basePage');

class StorePage extends BasePage {

    get confirmButtonToStore() {
        return $('//*[@content-desc="Confirm" or @text="Confirm"]');
    }

    async clickConfirmToStore() {
        // Hide soft keyboard if still open from login
        try {
            if (await driver.isKeyboardShown()) {
                await driver.hideKeyboard();
            }
        } catch (e) { }

        // Wait for Confirm button to appear after login
        await this.confirmButtonToStore.waitForDisplayed({ timeout: 30000 });

        // Let modal / screen transition animation settle
        await browser.pause(2000);

        // Click the Confirm button
        try {
            await this.confirmButtonToStore.click();
        } catch (e) {
            // Fallback click via Android UiSelector
            const altBtn = await $('android=new UiSelector().text("Confirm")');
            await altBtn.click();
        }

        // If Confirm button is still displayed, retry clicking
        try {
            await browser.pause(1500);
            const isStillVisible = await this.confirmButtonToStore.isDisplayed();
            if (isStillVisible) {
                console.log('[StorePage] Confirm button still visible, re-clicking...');
                const altBtn = await $('android=new UiSelector().text("Confirm")');
                if (await altBtn.isDisplayed()) {
                    await altBtn.click();
                } else {
                    await this.confirmButtonToStore.click();
                }
            }
        } catch (e) { }

        // Wait for the Confirm dialog to disappear to confirm navigation
        try {
            await this.confirmButtonToStore.waitForDisplayed({ reverse: true, timeout: 15000 });
        } catch (e) {
            console.warn('[StorePage] Confirm button did not disappear within 15s');
        }

        // Pause to allow store list page to finish loading
        await browser.pause(3000);
    }

    get confirmButton() {
        return this.confirmButtonToStore;
    }

    async confirm() {
        await this.clickConfirmToStore();
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

    get searchInput() {
        return $('~Address, store');
    }
    async searchAndOpenStore(storeName) {
        // 1. Tap the search bar to open search UI
        await this.searchInput.waitForDisplayed({ timeout: 30000 });
        await this.searchInput.click();
        await browser.pause(500);

        // 2. Clear and type the store name (keyboard stays open so results stay visible)
        await this.searchInput.clearValue();
        await this.searchInput.setValue(storeName);

        // 3. Wait for results to populate
        await browser.pause(3000);

        // 4. Target only TextViews containing the store name
        //    (avoids matching the EditText search input which also contains the typed text)
        const storeResult = $(`android=new UiSelector().className("android.widget.TextView").textContains("${storeName}")`);
        await storeResult.waitForExist({ timeout: 10000 });

        // 5. Click the clickable ancestor ViewGroup (the actual touchable card),
        //    not just the inner TextView, so navigation triggers correctly.
        //    NOTE: First tap only dismisses the keyboard overlay on this screen.
        //          A second tap after a pause is required to actually open the store.
        const storeCard = $(`//android.widget.TextView[contains(@text, "${storeName}")]/ancestor::android.view.ViewGroup[@clickable="true"][1]`);
        try {
            await storeCard.waitForExist({ timeout: 5000 });
            await storeCard.click();           // tap 1 — dismisses keyboard
            await browser.pause(1000);
            await storeCard.click();           // tap 2 — actually opens the store
        } catch (e) {
            // Fallback: click the TextView directly (twice)
            await storeResult.click();
            await browser.pause(1000);
            await storeResult.click();
        }

        // 6. Wait for store page / age-restriction modal
        await browser.pause(5000);
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
        // Scroll the store into view using content-desc (most reliable for store cards)
        const scrollSelector = `android=new UiScrollable(new UiSelector().scrollable(true))` +
            `.scrollIntoView(new UiSelector().description("${storeName}"))`;

        try {
            await $(scrollSelector).waitForExist({ timeout: 20000 });
        } catch (e) {
            // Fallback: try scrolling by text
            const scrollByText = `android=new UiScrollable(new UiSelector().scrollable(true))` +
                `.scrollIntoView(new UiSelector().textContains("${storeName}"))`;
            await $(scrollByText).waitForExist({ timeout: 15000 });
        }

        // Small pause to let scroll settle
        await browser.pause(1000);

        // Click the store card — try content-desc ViewGroup first, then accessibility id, then UiAutomator
        try {
            const store = $(`//android.view.ViewGroup[@content-desc="${storeName}"]`);
            await store.waitForDisplayed({ timeout: 8000 });
            await store.click();
        } catch (e) {
            try {
                const store = $(`~${storeName}`);
                await store.waitForDisplayed({ timeout: 5000 });
                await store.click();
            } catch (e2) {
                const store = $(`android=new UiSelector().description("${storeName}")`);
                await store.waitForDisplayed({ timeout: 5000 });
                await store.click();
            }
        }

        // Allow store page or age-restriction modal to load
        await browser.pause(3000);
    }

    get skipButton() { return $('//android.widget.TextView[@text="Skip"]'); }

    async clickSkip() {
        await this.skipButton.click();
    }

    get checkInButton() {
        return $('~Check In');
    }

    async clickCheckIn() {
        await this.checkInButton.waitForDisplayed({ timeout: 5000 });
        await this.checkInButton.click();
    }
    get verifyNowButton() {
        return $('~Verify now');
    }

    async clickVerifyNow() {
        await this.verifyNowButton.waitForDisplayed({ timeout: 5000 });
        await this.verifyNowButton.click();
    }

    get ageVerificationTitle() { return $('~age-verification-title'); }
    //get personName() { return $('//android.widget.TextView[@text="Rose Allen"]'); }

    async assertAgeVerificationPage() {
        // Wait for the page to fully load
        await browser.pause(3000);

        // Try multiple selectors for the age verification title
        const selectors = [
            { name: 'accessibilityId', sel: '~age-verification-title' },
            { name: 'text-exact', sel: 'android=new UiSelector().text("Age verification")' },
            { name: 'text-exact-caps', sel: 'android=new UiSelector().text("Age Verification")' },
            { name: 'textContains', sel: 'android=new UiSelector().textContains("Age")' },
            { name: 'textContains-verify', sel: 'android=new UiSelector().textContains("verification")' },
        ];

        let found = false;
        for (const { name, sel } of selectors) {
            try {
                const el = $(sel);
                await el.waitForExist({ timeout: 5000 });
                const text = await el.getText();
                console.log(`[assertAgeVerificationPage] Found with "${name}": "${text}"`);
                found = true;
                break;
            } catch (e) {
                console.log(`[assertAgeVerificationPage] Selector "${name}" not found, trying next...`);
            }
        }

        if (!found) {
            // Dump page source for debugging
            const source = await driver.getPageSource();
            console.log('[assertAgeVerificationPage] PAGE SOURCE (first 3000 chars):');
            console.log(source.substring(0, 3000));
            throw new Error('Age verification page not found with any selector. Check page source above.');
        }
    }

    get contactManagerBtn() {
        return $('~Contact the store manager directly');
    }

    async clickContactStoreManager() {
        // Wait for the button to be visible
        await this.contactManagerBtn.waitForDisplayed({ timeout: 10000 });

        // Click the button
        await this.contactManagerBtn.click();

        // Wait for the next screen to load
        await browser.pause(1500);
    }

    get bookIdTitle() { return $('~book-id-verification-title'); }
    async assertBookIdVerificationPage() {
        await browser.pause(3000);

        const selectors = [
            { name: 'accessibilityId', sel: '~book-id-verification-title' },
            { name: 'text-exact', sel: 'android=new UiSelector().text("Book ID verification")' },
            { name: 'text-exact-caps', sel: 'android=new UiSelector().text("Book ID Verification")' },
            { name: 'textContains-book-id', sel: 'android=new UiSelector().textContains("Book ID")' },
            { name: 'textContains-id-verif', sel: 'android=new UiSelector().textContains("ID verification")' },
            { name: 'textContains-book', sel: 'android=new UiSelector().textContains("Book")' },
        ];

        let found = false;
        for (const { name, sel } of selectors) {
            try {
                const el = $(sel);
                await el.waitForExist({ timeout: 5000 });
                const text = await el.getText();
                console.log(`[assertBookIdVerificationPage] Found with "${name}": "${text}"`);
                found = true;
                break;
            } catch (e) {
                console.log(`[assertBookIdVerificationPage] Selector "${name}" not found, trying next...`);
            }
        }

        if (!found) {
            const source = await driver.getPageSource();
            console.log('[assertBookIdVerificationPage] PAGE SOURCE (first 3000 chars):');
            console.log(source.substring(0, 3000));
            throw new Error('Book ID verification page not found with any selector. Check page source above.');
        }
    }
    async clickStoreToBook(storeName) {
        await browser.pause(1500);

        const storeText = $(`android=new UiSelector().textContains("${storeName}")`);
        const exists = await storeText.isExisting();

        if (!exists) {
            try {
                const scrollSelector = `android=new UiScrollable(new UiSelector().scrollable(true))` +
                    `.scrollIntoView(new UiSelector().textContains("${storeName}"))`;
                await $(scrollSelector).waitForExist({ timeout: 10000 });
            } catch (e) {
                console.log(`[clickStoreToBook] Scroll not needed or failed, continuing...`);
            }
        }

        await storeText.waitForExist({ timeout: 10000 });

        const storeCard = $(`//android.widget.TextView[contains(@text, "${storeName}")]/ancestor::android.view.ViewGroup[@clickable="true"][1]`);
        try {
            if (await storeCard.isExisting()) {
                await storeCard.click();
            } else {
                await storeText.click();
            }
        } catch (e) {
            await storeText.click();
        }

        await browser.pause(2000);
    }



}

module.exports = new StorePage();