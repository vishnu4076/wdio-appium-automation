const StorePage = require('../../pageobjects/store/StorePage');
const BookingPage = require('../../pageobjects/booking/BookingPage');
const { loginToStore } = require('../../utils/authentication/authFlow');
const storeData = require('../../fixtures/testData/storeData.json');
const bookingData = require('../../fixtures/testData/bookingData.json');

describe('Calendar and Booking Module', function () {
    this.timeout(300000);

    before(async () => {
        await loginToStore();

        // Navigate to booking / calendar screen
        await StorePage.searchAndOpenStore(storeData.ageRestrictedStore);
        await StorePage.clickSkip();
        await StorePage.clickCheckIn();
        await StorePage.clickVerifyNow();
        await StorePage.clickContactStoreManager();

        const openedStore = await StorePage.clickStoreToBook(storeData.bookingStore);
        expect(openedStore).toContain(storeData.bookingStore);

        // Verify "Call the Seller" button
        const callSellerState = await StorePage.getCallTheSellerButtonState();
        expect(callSellerState.displayed).toBe(true);
        expect(callSellerState.clickable).toBe(true);

        await StorePage.clickSkip();
    });

    it('should open calendar', async () => {
        await BookingPage.openDatePicker();
    });

    it('should verify current month and year format', async () => {
        const monthYear = await BookingPage.getDisplayedMonthYear();
        console.log(`[Test] Displayed month/year: ${monthYear}`);
        expect(monthYear).toMatch(/^[A-Za-z]+ \d{4}$/);
    });

    it('should verify available date', async () => {
        const isAvailable = await BookingPage.isDateAvailable(bookingData.testDate);
        expect(isAvailable).toBe(true);
    });

    it('should select available date', async () => {
        await BookingPage.selectAvailableDate(bookingData.testDate);
    });

    it('should verify available time slots', async () => {
        await BookingPage.verifyAvailableSlots();
        const slots = await BookingPage.printAvailableTimeSlots();
        expect(slots.length).toBeGreaterThan(0);
    });

    it('should select first available time slot', async () => {
        const selectedSlot = await BookingPage.selectFirstAvailableTimeSlot();
        console.log(`[Test] Selected slot: ${selectedSlot}`);
        expect(selectedSlot).not.toBeNull();
    });

    it('should apply booking', async () => {
        await BookingPage.clickApply();
    });
});
