const StorePage = require('../../pageobjects/store/StorePage');
const ProductPage = require('../../pageobjects/store/ProductPage');
const { loginToStore } = require('../../utils/authentication/authFlow');
const storeData = require('../../fixtures/testData/storeData.json');
const FavoritesPage = require('../../pageobjects/store/FavouritePage');
describe('Store - Add Product to Favorites Flow', function () {
    this.timeout(300000);

    before(async () => {
        // Complete onboarding, permissions, country selection, login and store confirmation
        await loginToStore();
    });

    it('should open store, skip tour prompt, and add product to favorites', async () => {
        const targetStore = storeData.testStore; // "Austria store_02"
        const targetProduct = storeData.favoriteProduct; // "test_automation_p1"

        console.log(`[Test] Opening store: ${targetStore}`);
        try {
            await StorePage.searchAndOpenStore(targetStore);
        } catch (err) {
            console.warn(`[Test] searchAndOpenStore encountered an issue, trying openStore directly: ${err.message}`);
            await StorePage.openStore(targetStore);
        }

        // Click Skip button on store screen if tour/banner prompt appears
        console.log('[Test] Clicking skip button on store screen...');
        await StorePage.clickSkip();

        // Add the product to favorites
        console.log(`[Test] Adding product to favorites: ${targetProduct}`);
        await ProductPage.addToFavorites(targetProduct);

        // Verify product is added to favorites list
        await FavoritesPage.openFavorites();
        console.log('[Test] Opened Favorites tab');
        const isInFavorites = await FavoritesPage.isProductInFavorites(targetProduct);
        expect(isInFavorites).toBe(true);
        console.log('[Test] Verification of product in Favorites passed');

        console.log(`[Test] Successfully added product "${targetProduct}" to favorites!`);
    });
});
