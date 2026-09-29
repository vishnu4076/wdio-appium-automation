const StorePage = require('../../pageobjects/store/StorePage');
const ProductPage = require('../../pageobjects/store/ProductPage');
const { loginToStore } = require('../../utils/authentication/authFlow');
const storeData = require('../../fixtures/testData/storeData.json');

describe('Store Module', function () {
    this.timeout(300000);

    before(async () => {
        await loginToStore();
    });

    it('should subscribe to a store and add product to favorites', async () => {
        const storeName = storeData.testStore; // "Austria store_02"
        const productName = storeData.favoriteProduct; // "test_automation_p1"

        await StorePage.subscribeToStore(storeName);
        await StorePage.openStore(storeName);
        await ProductPage.addToFavorites(productName);

        const favoriteBtn = ProductPage.getFavoriteButton(productName);
        expect(await favoriteBtn.isDisplayed().catch(() => false)).toBe(true);
    });
});
