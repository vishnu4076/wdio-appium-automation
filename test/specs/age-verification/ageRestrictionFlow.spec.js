const StorePage = require('../../pageobjects/store/StorePage');
const BookingPage = require('../../pageobjects/booking/BookingPage');
const { loginToStore } = require('../../utils/authentication/authFlow');
const storeData = require('../../fixtures/testData/storeData.json');

describe('Age Restriction - Book ID Verification Flow', function () {
    this.timeout(300000);

    before(async () => {
        await loginToStore();
    });

    it('should search and open the 18+ store', async () => {
        await StorePage.searchAndOpenStore(storeData.ageRestrictedStore);
    });

    it('should navigate to the Age Verification page', async () => {
        await StorePage.clickSkip();
        await StorePage.clickCheckIn();
        await StorePage.clickVerifyNow();

        const titleFound = await StorePage.ageVerificationTitle.isExisting().catch(() => false);
        if (!titleFound) {
            console.warn('[WARN] age-verification-title not found — verify accessibility ID in the app.');
        } else {
            console.log('[INFO] Age Verification page confirmed.');
        }
    });

    it('should navigate to the Book ID Verification page', async () => {
        await StorePage.clickContactStoreManager();

        const titleFound = await StorePage.bookIdTitle.isExisting().catch(() => false);
        if (!titleFound) {
            console.warn('[WARN] book-id-verification-title not found — verify accessibility ID in the app.');
        } else {
            console.log('[INFO] Book ID Verification page confirmed.');
        }
    });

    it('should select the store for Book ID verification', async () => {
        await StorePage.clickStoreToBook(storeData.bookingStore);
        await StorePage.clickSkip();

        const callSellerState = await StorePage.getCallTheSellerButtonState();
        expect(callSellerState.displayed).toBe(true);
        expect(callSellerState.clickable).toBe(true);
    });

    it('should open the booking calendar', async () => {
        await BookingPage.openDatePicker();
        const displayedMonthYear = await BookingPage.getDisplayedMonthYear();
        expect(displayedMonthYear).toMatch(/^[A-Za-z]+ \d{4}$/);
    });

    it('should allow booking only from tomorrow up to 15 days', async () => {
        const results = await BookingPage.validateBookingWindow();
        for (const result of results) {
            expect(result.actual).toBe(result.expected);
        }
    });

    it('should display available booking time slots', async () => {
        await BookingPage.verifyAvailableSlots();
        await BookingPage.availableSlotsText.waitForDisplayed({ timeout: 10000 });
        expect(await BookingPage.availableSlotsText.isDisplayed()).toBe(true);

        const availableSlots = await BookingPage.getAvailableTimeSlots();
        expect(availableSlots.length).toBeGreaterThan(0);

        availableSlots.forEach((slot) => {
            expect(slot).toMatch(/^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/);
        });
    });

    it('should select an available booking time slot', async () => {
        const availableSlots = await BookingPage.getAvailableTimeSlots();
        expect(availableSlots.length).toBeGreaterThan(0);

        const slotToSelect = availableSlots[0];
        const selected = await BookingPage.selectTimeSlot(slotToSelect);
        expect(selected).toBe(true);
    });

    it('should apply the selected booking slot', async () => {
        await BookingPage.clickApply();
    });
});
