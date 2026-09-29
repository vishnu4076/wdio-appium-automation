class FavoritesPage {
    // Locator
    get favoritesTab() {
        // Try accessibility id first, then content-desc containing 'Favorites'
        return $('~tab-favorites-btn') || $('//*[@content-desc="tab-favorites-btn"]') || $('~Favorites') || $('~FavoritesTab');
    }

    // Action
    async openFavorites() {
        const selectors = [
            '~tab-favorites-btn',
            'android=new UiSelector().resourceId("tab-favorites-btn")',
            '//android.view.View[@content-desc="Favorites"]',
            '//*[@content-desc="tab-favorites-btn"]'
        ];
        for (const sel of selectors) {
            const el = await $(sel);
            if (await el.isExisting()) {
                await el.click();
                console.log(`[FavoritesPage] Favorites tab opened using selector ${sel}`);
                return;
            }
        }
        console.warn('[FavoritesPage] Favorites tab not found using any selector');
    }

    // Dynamic product locator on Favorites page
    getFavoriteProduct(productName) {
        return $(`//android.widget.TextView[@text="${productName}"]`);
    }

    // Verify product is displayed in Favorites
    async isProductInFavorites(productName) {
        const product = this.getFavoriteProduct(productName);
        const isDisplayed = await product.isDisplayed().catch(() => false);
        console.log(`[FavoritesPage] Product "${productName}" displayed in favorites: ${isDisplayed}`);
        return isDisplayed;
    }
}

module.exports = new FavoritesPage();