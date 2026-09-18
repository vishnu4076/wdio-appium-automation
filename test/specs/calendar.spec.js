const StorePage = require('../pageobjects/StorePage');
const BookingPage = require('../pageobjects/BookingPage');

const { loginToStore } = require('../../utils/loginFlow');

describe('Calendar Module', function () {

    this.timeout(300000);

    before(async () => {
        await loginToStore();

        // Navigate to the booking/calendar screen
        await StorePage.searchAndOpenStore('18plush');
        await StorePage.clickSkip();
        await StorePage.clickCheckIn();
        await StorePage.clickVerifyNow();
        await StorePage.clickContactStoreManager();
        await StorePage.clickStoreToBook("Aditya's Confectionery");
        await StorePage.clickSkip();
    });

    it('should open calendar', async () => {
        await BookingPage.openDatePicker();
    });

    it('should verify current month and year', async () => {
        const monthYear = await BookingPage.getDisplayedMonthYear();

        console.log(`Displayed month/year: ${monthYear}`);

        expect(monthYear).toBe('September 2026');
    });

    it('should verify available date', async () => {
        const isAvailable =
            await BookingPage.isDateAvailable('2026-09-22');

        expect(isAvailable).toBe(true);
    });

    it('should select available date', async () => {
        await BookingPage.selectAvailableDate('2026-09-22');
    });

    it('should verify available time slots', async () => {
        await BookingPage.verifyAvailableSlots();

        const slots =
            await BookingPage.printAvailableTimeSlots();

        expect(slots.length).toBeGreaterThan(0);
    });

    it('should select first available time slot', async () => {
        const selectedSlot =
            await BookingPage.selectFirstAvailableTimeSlot();

        console.log(`Selected slot: ${selectedSlot}`);
    });

    it('should apply booking', async () => {
        await BookingPage.clickApply();
    });
});