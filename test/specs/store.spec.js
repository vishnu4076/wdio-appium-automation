const StorePage = require('../pageobjects/StorePage');

const {
    loginToStore
} = require('../../utils/loginFlow');
const ProductPage = require('../pageobjects/ProductPage');


describe('Store Module', () => {

    before(async () => {

        await loginToStore();

    });


    it('should subscribe to a store', async () => {

        await StorePage.subscribeToStore(
            "Austria store_02"
        );

        await StorePage.openStore("Austria store_02");
        await ProductPage.addToFavorites("test_automation_p1");

    });


});