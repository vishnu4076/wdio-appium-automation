/**
 * Age Restriction - Book ID Verification Flow (Localization E2E)
 * -----------------------------------------------------------------
 * Verifies the full Age Restriction and Book ID Verification flow with
 * dynamic language detection, resolution from existing translation JSON files,
 * and localization assertions on every screen.
 *
 * Supported Languages:
 *   - English    ('en') -> test/fixtures/languages/en.json
 *   - Deutsch    ('de') -> test/fixtures/languages/de.json
 *   - Italiano   ('it') -> test/fixtures/languages/it.json
 *   - Nederlands ('nl') -> test/fixtures/languages/nl.json
 *
 * Usage:
 *   npm run test:age-verification
 *   npm test -- --spec test/specs/age-verification/ageRestrictionFlow.spec.js
 */

const StorePage = require('../../pageobjects/store/StorePage');
const BookingPage = require('../../pageobjects/booking/BookingPage');
const { loginToStore } = require('../../utils/authentication/authFlow');
const storeData = require('../../fixtures/testData/storeData.json');
const LanguageHelper = require('../../utils/localization/languageHelper');
const LocalizationValidator = require('../../utils/localization/LocalizationValidator');

// 1. Detect active language and dynamically load matching JSON fixture
const languageHelper = new LanguageHelper();
const langCode = languageHelper.getLanguageCode();
const langDisplayName = languageHelper.getDisplayName();
const languageData = languageHelper.getTranslations();

// Initialize shared localization validator
const validator = new LocalizationValidator(languageData);

describe(`Age Restriction - Book ID Verification Flow [${langDisplayName} (${langCode.toUpperCase()})]`, function () {
    this.timeout(300000);

    before(async () => {
        await loginToStore();
    });

    // =========================================================
    // 1. Search & Open 18+ Store
    // =========================================================

    it('should search and open the 18+ store', async () => {
        validator.printSection('Open 18+ Store');
        await StorePage.searchAndOpenStore(storeData.ageRestrictedStore);
    });

    // =========================================================
    // 2. Age Verification Page Localization
    // =========================================================

    it('should navigate to the Age Verification page and verify translations', async () => {
        validator.printSection('Age Verification Page');

        // Resolve expected strings strictly from the active language JSON
        const expectedVerifyNow = languageHelper.getText('verification.verifyNow');
        const expectedAgeTitle = languageHelper.getText(['verification.ageVerification', 'AgeVerification']);
        const expectedContactManager = languageHelper.getText('ContactTheSeller');

        // Perform navigation
        await StorePage.clickSkip();
        await StorePage.clickCheckIn();

        // Verify "Verify now" button translation
        const verifyNowBtn = $(`//*[@content-desc="${expectedVerifyNow}" or @text="${expectedVerifyNow}" or @content-desc="Verify now" or @text="Verify now"]`);
        if (await verifyNowBtn.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
            const actualVerifyNow = await validator.getElementText(verifyNowBtn);
            validator.logResult(expectedVerifyNow, actualVerifyNow, actualVerifyNow === expectedVerifyNow ? 'PASS' : 'FAIL');
            expect(actualVerifyNow).toBe(expectedVerifyNow);
        }

        await StorePage.clickVerifyNow();

        // Verify Age Verification Page Title translation
        const titleFound = await StorePage.ageVerificationTitle.waitForDisplayed({ timeout: 10000 }).catch(() => false);
        if (titleFound) {
            const actualAgeTitle = await validator.getElementText(StorePage.ageVerificationTitle);
            if (actualAgeTitle) {
                validator.logResult(expectedAgeTitle, actualAgeTitle, actualAgeTitle === expectedAgeTitle ? 'PASS' : 'FAIL');
                expect(actualAgeTitle).toBe(expectedAgeTitle);
            }
        } else {
            console.warn('[WARN] age-verification-title not found — verify accessibility ID in the app.');
            const visibleTexts = await validator.collectVisibleTexts();
            const titlePresent = visibleTexts.includes(expectedAgeTitle);
            validator.logResult(expectedAgeTitle, titlePresent ? expectedAgeTitle : `[NOT FOUND in ${visibleTexts.join(' | ')}]`, titlePresent ? 'PASS' : 'FAIL');
            expect(titlePresent).toBe(true);
        }

        // Verify "Age verification is required to enter the store" description if visible
        try {
            const expectedAgeInfo = languageHelper.getText('AgeValidationInfo');
            const visibleTexts = await validator.collectVisibleTexts();
            if (visibleTexts.some(t => t.includes(expectedAgeInfo) || expectedAgeInfo.includes(t))) {
                console.log(`[PASS] Age requirement info text verified: "${expectedAgeInfo}"`);
            }
        } catch (_) {}

        // Verify "Contact the store manager directly" button translation
        const contactBtn = $(`//*[@content-desc="${expectedContactManager}" or @text="${expectedContactManager}" or @content-desc="Contact the store manager directly" or @text="Contact the store manager directly"]`);
        if (await contactBtn.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
            const actualContactText = await validator.getElementText(contactBtn);
            validator.logResult(expectedContactManager, actualContactText, actualContactText === expectedContactManager ? 'PASS' : 'FAIL');
            expect(actualContactText).toBe(expectedContactManager);
        }

        // Verify any visible navigation controls
        await assertVisibleNavigationControls();
    });

    // =========================================================
    // 3. Book ID Verification Page Localization
    // =========================================================

    it('should navigate to the Book ID Verification page and verify translations', async () => {
        validator.printSection('Book ID Verification Page');

        const expectedBookIdTitle = languageHelper.getText('BookIDVerification');
        const expectedHowToGetVerified = languageHelper.getText('How to get verified');

        await StorePage.clickContactStoreManager();

        // Verify Book ID Verification Title translation
        const titleFound = await StorePage.bookIdTitle.waitForDisplayed({ timeout: 10000 }).catch(() => false);
        if (titleFound) {
            const actualTitle = await validator.getElementText(StorePage.bookIdTitle);
            if (actualTitle) {
                validator.logResult(expectedBookIdTitle, actualTitle, actualTitle === expectedBookIdTitle ? 'PASS' : 'FAIL');
                expect(actualTitle).toBe(expectedBookIdTitle);
            }
        } else {
            console.warn('[WARN] book-id-verification-title not found — verify accessibility ID in the app.');
            const visibleTexts = await validator.collectVisibleTexts();
            const titlePresent = visibleTexts.includes(expectedBookIdTitle);
            validator.logResult(expectedBookIdTitle, titlePresent ? expectedBookIdTitle : `[NOT FOUND in ${visibleTexts.join(' | ')}]`, titlePresent ? 'PASS' : 'FAIL');
            expect(titlePresent).toBe(true);
        }

        // Verify "How to get verified" instructional text translation if present
        const visibleTexts = await validator.collectVisibleTexts();
        const firstLineExpected = expectedHowToGetVerified.split('\n')[0].trim();
        const foundInstruction = visibleTexts.find(t => t.includes(firstLineExpected) || firstLineExpected.includes(t));
        if (foundInstruction) {
            console.log(`[PASS] "How to get verified" instruction header verified: "${foundInstruction}"`);
        }

        // Verify visible navigation controls
        await assertVisibleNavigationControls();
    });

    // =========================================================
    // 4. Store Selection & Call the Seller Localization
    // =========================================================

    it('should select the store for Book ID verification and verify Call the Seller button localization', async () => {
        validator.printSection('Store Selection for ID Verification');

        await StorePage.clickStoreToBook(storeData.bookingStore);
        await StorePage.clickSkip();

        // Verify "Call the Seller" button localization & state
        const expectedCallSeller = languageHelper.getText('callTheSeller');
        const callSellerBtn = $(`//*[@content-desc="${expectedCallSeller}" or @text="${expectedCallSeller}" or @content-desc="Call the Seller" or @text="Call the Seller"]`);

        if (await callSellerBtn.waitForDisplayed({ timeout: 15000 }).catch(() => false)) {
            const actualCallSellerText = await validator.getElementText(callSellerBtn);
            validator.logResult(expectedCallSeller, actualCallSellerText, actualCallSellerText === expectedCallSeller ? 'PASS' : 'FAIL');
            expect(actualCallSellerText).toBe(expectedCallSeller);
        }

        const callSellerState = await StorePage.getCallTheSellerButtonState();
        expect(callSellerState.displayed).toBe(true);
        expect(callSellerState.clickable).toBe(true);

        // Verify visible navigation controls
        await assertVisibleNavigationControls();
    });

    // =========================================================
    // 5. Calendar Header & Displayed Month/Year Localization
    // =========================================================

    it('should open the booking calendar and verify localized header month/year', async () => {
        validator.printSection('Calendar Header & Month/Year Localization');

        await BookingPage.openDatePicker();

        // Read displayed Month and Year from calendar header
        const displayedMonthYear = await BookingPage.getDisplayedMonthYear();
        console.log(`Actual Displayed Calendar Header: "${displayedMonthYear}"`);

        // Calendar header format: "<LocalizedMonth> <YYYY>"
        expect(displayedMonthYear).toMatch(/^[^0-9]+ [0-9]{4}$/);

        const [actualMonthName, actualYear] = displayedMonthYear.split(' ');
        expect(actualYear).toMatch(/^\d{4}$/);

        // Map displayed localized month back to month index
        const monthIndex = languageHelper.getMonthIndexFromLocalized(actualMonthName);
        expect(monthIndex).toBeGreaterThanOrEqual(1);
        expect(monthIndex).toBeLessThanOrEqual(12);

        // Resolve expected localized month strictly from active language JSON keys (January..December)
        const expectedLocalizedMonth = languageHelper.getLocalizedMonth(monthIndex);
        const expectedMonthYear = `${expectedLocalizedMonth} ${actualYear}`;

        validator.logResult(
            expectedMonthYear,
            displayedMonthYear,
            displayedMonthYear.toLowerCase() === expectedMonthYear.toLowerCase() ? 'PASS' : 'FAIL'
        );

        expect(displayedMonthYear.toLowerCase()).toBe(expectedMonthYear.toLowerCase());
    });

    // =========================================================
    // 6. Booking Window Validation
    // =========================================================

    it('should allow booking only from tomorrow up to 15 days', async () => {
        validator.printSection('Booking Window Validation');

        const results = await BookingPage.validateBookingWindow();
        for (const result of results) {
            expect(result.actual).toBe(result.expected);
        }
    });

    // =========================================================
    // 7. Available Slots Heading & Time Slots Localization
    // =========================================================

    it('should display and verify available slots heading and time slots translations', async () => {
        validator.printSection('Available Slots Localization');

        // Resolve expected "Available slots" heading from JSON
        const expectedAvailableSlots = languageHelper.getText('availableSlots');

        await BookingPage.verifyAvailableSlots();
        await BookingPage.availableSlotsText.waitForDisplayed({ timeout: 10000 });
        expect(await BookingPage.availableSlotsText.isDisplayed()).toBe(true);

        const actualHeading = await validator.getElementText(BookingPage.availableSlotsText);
        validator.logResult(
            expectedAvailableSlots,
            actualHeading,
            actualHeading === expectedAvailableSlots ? 'PASS' : 'FAIL'
        );
        expect(actualHeading).toBe(expectedAvailableSlots);

        // Verify displayed time slots
        const availableSlots = await BookingPage.getAvailableTimeSlots();
        expect(availableSlots.length).toBeGreaterThan(0);
        console.log(`Found ${availableSlots.length} displayed time slots for booking.`);

        // Validate each displayed slot label / format
        for (const slot of availableSlots) {
            expect(slot).toMatch(/^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/);

            const slotEl = $(`//android.view.ViewGroup[@content-desc="${slot}"]`);
            if (await slotEl.isExisting().catch(() => false)) {
                const desc = await slotEl.getAttribute('content-desc');
                expect(desc).toContain(slot);
            }
        }
    });

    // =========================================================
    // 8. Time Slot Selection
    // =========================================================

    it('should select an available booking time slot', async () => {
        validator.printSection('Time Slot Selection');

        const availableSlots = await BookingPage.getAvailableTimeSlots();
        expect(availableSlots.length).toBeGreaterThan(0);

        const slotToSelect = availableSlots[0];
        const selected = await BookingPage.selectTimeSlot(slotToSelect);
        expect(selected).toBe(true);
        console.log(`[INFO] Selected booking slot: ${slotToSelect}`);
    });

    // =========================================================
    // 9. Apply Button Localization & Confirmation
    // =========================================================

    it('should verify Apply button translation and apply the selected booking slot', async () => {
        validator.printSection('Apply Button Localization');

        // Resolve expected Apply button text strictly from JSON ('Apply' / 'navigation.apply')
        const expectedApply = languageHelper.getText(['Apply', 'navigation.apply']);

        await BookingPage.applyButton.waitForDisplayed({ timeout: 10000 });
        const actualApplyText = await validator.getElementText(BookingPage.applyButton);

        validator.logResult(
            expectedApply,
            actualApplyText,
            actualApplyText === expectedApply ? 'PASS' : 'FAIL'
        );
        expect(actualApplyText).toBe(expectedApply);

        // Click Apply to finalize booking selection
        await BookingPage.clickApply();
    });

    // =========================================================
    // 10. Navigation Controls Verification (Skip, Back, Close)
    // =========================================================

    it('should verify visible navigation controls match localized JSON translations', async () => {
        validator.printSection('Navigation Controls Verification');
        await assertVisibleNavigationControls();
    });
});

/**
 * Reusable helper to inspect any currently visible navigation controls (Back, Close, Skip, Continue)
 * and assert that their text or accessibility labels match the active language JSON keys.
 */
async function assertVisibleNavigationControls() {
    const expectedBack = languageHelper.getText('navigation.back');
    const expectedClose = languageHelper.getText(['navigation.close', 'apiTimeOutClose']);
    const expectedSkip = languageHelper.getText(['navigation.skip', 'onboarding.skip']);
    const expectedContinue = languageHelper.getText(['navigation.continue', 'login.continue']);

    // Check Back button if present
    const backBtn = $(`//*[@content-desc="${expectedBack}" or @text="${expectedBack}"]`);
    if (await backBtn.isDisplayed().catch(() => false)) {
        const actualBack = await validator.getElementText(backBtn);
        validator.logResult(expectedBack, actualBack, actualBack === expectedBack ? 'PASS' : 'FAIL');
        expect(actualBack).toBe(expectedBack);
    }

    // Check Close button if present
    const closeBtn = $(`//*[@content-desc="${expectedClose}" or @text="${expectedClose}"]`);
    if (await closeBtn.isDisplayed().catch(() => false)) {
        const actualClose = await validator.getElementText(closeBtn);
        validator.logResult(expectedClose, actualClose, actualClose === expectedClose ? 'PASS' : 'FAIL');
        expect(actualClose).toBe(expectedClose);
    }

    // Check Skip button if present
    const skipBtn = $(`//*[@content-desc="${expectedSkip}" or @text="${expectedSkip}"]`);
    if (await skipBtn.isDisplayed().catch(() => false)) {
        const actualSkip = await validator.getElementText(skipBtn);
        validator.logResult(expectedSkip, actualSkip, actualSkip === expectedSkip ? 'PASS' : 'FAIL');
        expect(actualSkip).toBe(expectedSkip);
    }

    // Check Continue button if present
    const continueBtn = $(`//*[@content-desc="${expectedContinue}" or @text="${expectedContinue}"]`);
    if (await continueBtn.isDisplayed().catch(() => false)) {
        const actualContinue = await validator.getElementText(continueBtn);
        validator.logResult(expectedContinue, actualContinue, actualContinue === expectedContinue ? 'PASS' : 'FAIL');
        expect(actualContinue).toBe(expectedContinue);
    }
}
