const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');

class ProductPage extends BasePage {
    get skipButton() {
        return $('//android.widget.TextView[@text="Skip"] | ~Skip');
    }

    /**
     * Skip tour prompt if displayed
     */
    async skipTour() {
        try {
            const isSkipVisible = await this.skipButton.waitForDisplayed({ timeout: 5000 }).then(() => true).catch(() => false);
            if (isSkipVisible) {
                await this.skipButton.click();
                await browser.pause(500);
            }
        } catch (e) {
            // Tour not present, ignore
        }
    }

    /**
     * Dynamic product locator
     */
    getProduct(productName) {
        return $(`//android.widget.TextView[@text="${productName}"]`);
    }

    /**
     * Dynamic Favorite button based on Product Name
     */
    getFavoriteButton(productName) {
        return $(
            `//android.widget.TextView[@text="${productName}"]` +
            `/ancestor::android.view.ViewGroup[contains(@resource-id,"product-item-") or @clickable="true"][1]` +
            `//*[@content-desc="Favorites" or @content-desc="Favorite" or contains(@content-desc,"Fav")]`
        );
    }

    /**
     * Fallback Favorite button in case ancestor layout varies
     */
    getGenericFavoriteButton() {
        return $('//*[@content-desc="Favorites" or @content-desc="Favorite"] | ~Favorites');
    }

    /**
     * Click favorite icon for specific product
     */
    async addToFavorites(productName) {
        await this.skipTour();

        // 1. Locate product element
        const product = this.getProduct(productName);
        try {
            await product.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        } catch (e) {
            // Scroll to product if not directly visible
            try {
                await this.scrollToText(productName, TIMEOUTS.LONG);
            } catch (scrollErr) {
                console.warn(`[ProductPage] Scroll to ${productName} timed out, checking visibility...`);
            }
        }

        // 2. Locate favorite button for this product
        let favoriteBtn = this.getFavoriteButton(productName);
        let isFavoriteBtnVisible = await favoriteBtn.waitForDisplayed({ timeout: 5000 }).then(() => true).catch(() => false);

        if (!isFavoriteBtnVisible) {
            // Try original hierarchical selector
            const origSelector = $(
                `//android.widget.TextView[@text="${productName}"]` +
                `/ancestor::android.view.ViewGroup[@resource-id="product-list"]` +
                `//android.view.ViewGroup[starts-with(@resource-id,"product-item-")]` +
                `//*[@content-desc="Favorites" or @content-desc="Favorite"]`
            );
            if (await origSelector.isDisplayed().catch(() => false)) {
                favoriteBtn = origSelector;
                isFavoriteBtnVisible = true;
            }
        }

        if (!isFavoriteBtnVisible) {
            favoriteBtn = this.getGenericFavoriteButton();
            await favoriteBtn.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        }

        await favoriteBtn.click();
        await browser.pause(1000);
    }
}

module.exports = new ProductPage();
