const BasePage = require('./basePage');

class ProductPage extends BasePage {

    /**
     * Dynamic product locator
     */
    getProduct(productName) {
        return $(
            `//android.widget.TextView[@text="${productName}"]`
        );
    }

    /**
     * Dynamic Favorite button based on Product Name
     */
    getFavoriteButton(productName) {
        return $(
            `//android.widget.TextView[@text="${productName}"]` +
            `/ancestor::android.view.ViewGroup[@resource-id="product-list"]` +
            `//android.view.ViewGroup[starts-with(@resource-id,"product-item-")]` +
            `//android.widget.Button[@content-desc="Favorites"]`
        );
    }

      async skipTour() {
        const skip = this.skipButton;

        await skip.waitForDisplayed({
            timeout: 10000
        });
 
        await skip.click();
    }



    /**
     * Click favorite icon for specific product
     */
    async addToFavorites(productName) {
          await this.skipTour();

        const product = this.getProduct(productName);

        await product.waitForDisplayed({
            timeout: 10000
        });

        const favoriteBtn = this.getFavoriteButton(productName);

        await favoriteBtn.waitForDisplayed({
            timeout: 10000
        });

        await favoriteBtn.click();
    }
}

module.exports = new ProductPage();