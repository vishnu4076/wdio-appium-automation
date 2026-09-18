const StorePage = require('../pageobjects/StorePage');
const BookingPage = require('../pageobjects/BookingPage');

const {
    loginToStore
} = require('../../utils/loginFlow');

describe('Store Module', function () {

    this.timeout(300000);

    before(async () => {
        await loginToStore();
    });

    it('should search and open 18+ store', async () => {
        await StorePage.searchAndOpenStore('18plush');
    });

    it('should complete store check-in and age verification', async () => {
        await StorePage.clickSkip();
        await StorePage.clickCheckIn();
        await StorePage.clickVerifyNow();
        await StorePage.assertAgeVerificationPage();
    });

    it('should open Book ID verification', async () => {
        await StorePage.clickContactStoreManager();
        await StorePage.assertBookIdVerificationPage();
    });

    it('should select store for Book ID verification', async () => {
        await StorePage.clickStoreToBook("Aditya's Confectionery");
        await StorePage.clickSkip();
    });

    it('should select booking date', async () => {
        await BookingPage.openDatePicker();
        await BookingPage.selectDate('2026-09-22');
    }); 

    it('should verify and display available time slots', async () => {
        await BookingPage.verifyAvailableSlots();

        const slots =
            await BookingPage.printAvailableTimeSlots();

        expect(slots.length).toBeGreaterThan(0);
    });

    it('should select an available time slot and apply booking', async () => {
        const selectedSlot =
            await BookingPage.selectFirstAvailableTimeSlot();

        console.log(`Final selected slot: ${selectedSlot}`);

        await BookingPage.clickApply();
    });
});


// const StorePage = require('../pageobjects/StorePage');
// const bookingPage = require('../pageobjects/BookingPage');

// const {
//     loginToStore
// } = require('../../utils/loginFlow');
// const ProductPage = require('../pageobjects/ProductPage');


// describe('Store Module', function () {
//     this.timeout(300000);

//     before(async () => {

//         await loginToStore();

//     });


//     it('should search and click a specific store dynamically', async () => {
//         await StorePage.searchAndOpenStore('18plush');
//         await StorePage.clickSkip();
//         await StorePage.clickCheckIn();
//         await StorePage.clickVerifyNow();
//         await StorePage.assertAgeVerificationPage();
//         await StorePage.clickContactStoreManager();
//         await StorePage.assertBookIdVerificationPage();
//         await StorePage.clickStoreToBook("Aditya's Confectionery");
//         await StorePage.clickSkip();

//     });
//     it('should select date and handle available slots', async () => {

//         // Date and time selection
//         await bookingPage.openDatePicker();

//         await bookingPage.selectDate('2026-09-21');

//         await bookingPage.verifyAvailableSlots();

//         const slots =
//             await bookingPage.printAvailableTimeSlots();

//         expect(slots.length).toBeGreaterThan(0);

//         const selectedSlot =
//             await bookingPage.selectFirstAvailableTimeSlot();

//         console.log(`Final selected slot: ${selectedSlot}`);

//         await bookingPage.clickApply();
//     });



// });
