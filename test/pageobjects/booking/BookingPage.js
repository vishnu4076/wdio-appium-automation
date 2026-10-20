const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');
const DateHelper = require('../../utils/helpers/dateHelper');
const SlotHelper = require('../../utils/helpers/slotHelper');

class BookingPage extends BasePage {
    // =========================================================
    // LOCATORS
    // =========================================================

    getDateTimeButton(localizedText = null) {
        if (localizedText) {
            return $(
                `//*[@content-desc="${localizedText}" or @text="${localizedText}"]//android.widget.ImageView` +
                ` | //*[@content-desc="${localizedText}" or @text="${localizedText}"]` +
                ` | //android.view.ViewGroup[contains(@content-desc, "date") or contains(@content-desc, "time") or contains(@content-desc, "Datum")]/android.widget.ImageView`
            );
        }
        return $(
            '//android.view.ViewGroup[@content-desc="Choose your preferred date and time."]/android.widget.ImageView' +
            ' | //android.view.ViewGroup[contains(@content-desc, "date") or contains(@content-desc, "time") or contains(@content-desc, "Datum")]/android.widget.ImageView'
        );
    }

    get dateTimeButton() {
        return this.getDateTimeButton();
    }

    getAvailableSlotsHeading(localizedText = null) {
        if (localizedText) {
            return $(
                `//*[@resource-id="available-slots-header" or @text="${localizedText}" or @content-desc="${localizedText}"` +
                ` or @text="Available slots" or @content-desc="Available slots"]`
            );
        }
        return $(
            '//*[@resource-id="available-slots-header" or @text="Available slots" or @content-desc="Available slots"]'
        );
    }

    get availableSlotsText() {
        return this.getAvailableSlotsHeading();
    }

    getApplyButton(localizedText = null) {
        if (localizedText) {
            return $(
                `//*[@resource-id="booking-apply-btn" or @text="${localizedText}" or @content-desc="${localizedText}"` +
                ` or @text="Apply" or @content-desc="Apply"]`
            );
        }
        return $(
            '//*[@resource-id="booking-apply-btn" or @text="Apply" or @content-desc="Apply"]'
        );
    }

    get applyButton() {
        return this.getApplyButton();
    }

    // =========================================================
    // DATE PICKER
    // =========================================================

    async openDatePicker(localizedText = null) {
        const btn = this.getDateTimeButton(localizedText);
        await btn.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        await btn.click();
        console.log('[BookingPage] Date picker opened');
    }

    async selectDate(dateString) {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            throw new Error(`Invalid date: ${dateString}`);
        }

        const day = date.getDate();
        const dateElement = $(`//android.widget.TextView[@text="${day}"]`);
        await dateElement.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        await dateElement.click();
        console.log(`[BookingPage] Selected date: ${dateString}`);
    }

    // =========================================================
    // AVAILABLE SLOTS
    // =========================================================

    async verifyAvailableSlots(localizedText = null) {
        const heading = this.getAvailableSlotsHeading(localizedText);
        await heading.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        console.log('[BookingPage] Available slots section is displayed');
    }

    async getAvailableTimeSlots() {
        const elements = await $$('//android.view.ViewGroup[@content-desc]');
        const slots = [];

        for (const element of elements) {
            const contentDesc = await element.getAttribute('content-desc');
            if (contentDesc && SlotHelper.isValidTimeSlot(contentDesc)) {
                slots.push(contentDesc);
            }
        }

        return slots;
    }

    async printAvailableTimeSlots() {
        const slots = await this.getAvailableTimeSlots();
        console.log(`Available time slots: ${slots.length}`);
        slots.forEach((slot, index) => {
            console.log(`${index + 1}. ${slot}`);
        });
        return slots;
    }

    // =========================================================
    // TIME SLOT SELECTION
    // =========================================================

    async selectTimeSlot(timeSlot) {
        try {
            const availableSlots = await this.getAvailableTimeSlots();
            if (!availableSlots.includes(timeSlot)) {
                return false;
            }

            const slotElement = $(`//android.view.ViewGroup[@content-desc="${timeSlot}"]`);
            const isDisplayed = await slotElement.isDisplayed().catch(() => false);
            const isEnabled = await slotElement.isEnabled().catch(() => false);
            const isClickable = (await slotElement.getAttribute('clickable').catch(() => 'false')) === 'true';

            if (!isDisplayed || !isEnabled || !isClickable) {
                return false;
            }

            await slotElement.click();
            console.log(`[BookingPage] Selected time slot: ${timeSlot}`);
            return true;
        } catch (error) {
            return false;
        }
    }

    async selectFirstAvailableTimeSlot() {
        const slots = await this.getAvailableTimeSlots();
        if (slots.length === 0) {
            return null;
        }

        const firstSlot = slots[0];
        await this.selectTimeSlot(firstSlot);
        console.log(`[BookingPage] First available slot selected: ${firstSlot}`);
        return firstSlot;
    }

    // =========================================================
    // APPLY BOOKING
    // =========================================================

    async clickApply(localizedText = null) {
        const btn = this.getApplyButton(localizedText);
        await btn.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        await btn.click();
        console.log('[BookingPage] Apply button clicked');
    }

    // =========================================================
    // CALENDAR MONTH / YEAR
    // =========================================================

    async getDisplayedMonthYear() {
        try {
            const byAccId = $('~age-verify-calendar-header');
            await byAccId.waitForDisplayed({ timeout: TIMEOUTS.SHORT });
            return (await byAccId.getText()).trim();
        } catch (e) {
            // Support Unicode letters for non-English month names like März (German), etc.
            const fallback = $(
                'android=new UiSelector().className("android.widget.TextView").textMatches("^[^0-9]+ [0-9]{4}$")'
            );
            await fallback.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
            return (await fallback.getText()).trim();
        }
    }

    getCalendarDate(dateString) {
        return $(`//*[@resource-id="age-verify-calendar-day-${dateString}"]`);
    }

    async clickNextMonth() {
        const byAccId = $('~age-verify-calendar-next-month-btn');
        const byResId = $('android=new UiSelector().resourceIdMatches(".*age-verify-calendar-next-month-btn.*")');
        const byXpath = $('//*[@resource-id="age-verify-calendar-next-month-btn" or @content-desc="age-verify-calendar-next-month-btn"]');

        let clicked = false;
        for (const btn of [byAccId, byResId, byXpath]) {
            if (await btn.isDisplayed().catch(() => false)) {
                await btn.click();
                clicked = true;
                break;
            }
        }

        if (!clicked) {
            try {
                await byAccId.waitForDisplayed({ timeout: TIMEOUTS.SHORT });
                await byAccId.click();
            } catch (e) {
                await byResId.waitForDisplayed({ timeout: TIMEOUTS.SHORT });
                await byResId.click();
            }
        }

        console.log('[BookingPage] Moved to next month');
        await browser.pause(500);
    }

    async clickPreviousMonth() {
        const byAccId = $('~age-verify-calendar-prev-month-btn');
        const byResId = $('android=new UiSelector().resourceIdMatches(".*age-verify-calendar-prev-month-btn.*")');
        const byXpath = $('//*[@resource-id="age-verify-calendar-prev-month-btn" or @content-desc="age-verify-calendar-prev-month-btn"]');

        let clicked = false;
        for (const btn of [byAccId, byResId, byXpath]) {
            if (await btn.isDisplayed().catch(() => false)) {
                await btn.click();
                clicked = true;
                break;
            }
        }

        if (!clicked) {
            try {
                await byAccId.waitForDisplayed({ timeout: TIMEOUTS.SHORT });
                await byAccId.click();
            } catch (e) {
                await byResId.waitForDisplayed({ timeout: TIMEOUTS.SHORT });
                await byResId.click();
            }
        }

        console.log('[BookingPage] Moved to previous month');
        await browser.pause(500);
    }

    async isDateAvailable(dateString) {
        const dateElement = this.getCalendarDate(dateString);
        const exists = await dateElement.isExisting();
        if (!exists) return false;

        const enabled = await dateElement.isEnabled();
        const clickable = await dateElement.getAttribute('clickable');
        return enabled && clickable === 'true';
    }

    async selectAvailableDate(dateString) {
        const available = await this.isDateAvailable(dateString);
        if (!available) return false;

        const dateElement = this.getCalendarDate(dateString);
        await dateElement.click();
        console.log(`[BookingPage] Selected available date: ${dateString}`);
        return true;
    }

    // =========================================================
    // NAVIGATE TO TARGET DATE MONTH
    // =========================================================

    async navigateToDateMonth(dateString, languageHelper = null) {
        const { year: targetYear, month: targetMonth } = DateHelper.parseYearMonth(dateString);

        for (let attempt = 0; attempt < 12; attempt++) {
            const displayedMonthYear = await this.getDisplayedMonthYear();
            const [monthName, year] = displayedMonthYear.split(' ');
            const displayedYear = Number(year);

            let displayedMonth;
            if (languageHelper && typeof languageHelper.getMonthIndexFromLocalized === 'function') {
                displayedMonth = languageHelper.getMonthIndexFromLocalized(monthName);
            } else {
                const parsedDate = new Date(`${monthName} 1, ${displayedYear}`);
                displayedMonth = Number.isNaN(parsedDate.getTime()) ? NaN : parsedDate.getMonth() + 1;
            }

            if (displayedYear === targetYear && displayedMonth === targetMonth) {
                return true;
            }

            const targetTotalMonths = targetYear * 12 + targetMonth;
            const displayedTotalMonths = displayedYear * 12 + displayedMonth;

            if (targetTotalMonths > displayedTotalMonths) {
                await this.clickNextMonth();
            } else {
                await this.clickPreviousMonth();
            }

            await browser.pause(300);
        }

        return false;
    }

    async validateBookingWindow(languageHelper = null) {
        const results = [];

        // Tomorrow (+1) through +15 should be available
        for (let day = 1; day <= 15; day++) {
            const date = DateHelper.getDateAfterDays(day);
            const dateString = DateHelper.formatDate(date);

            await this.navigateToDateMonth(dateString, languageHelper);
            const available = await this.isDateAvailable(dateString);

            results.push({
                date: dateString,
                expected: true,
                actual: available
            });
        }

        // +16 should NOT be available
        const dateAfter16 = DateHelper.getDateAfterDays(16);
        const dateString16 = DateHelper.formatDate(dateAfter16);

        await this.navigateToDateMonth(dateString16, languageHelper);
        const available16 = await this.isDateAvailable(dateString16);

        results.push({
            date: dateString16,
            expected: false,
            actual: available16
        });

        // Re-select tomorrow's date so subsequent tests can execute
        const tomorrow = DateHelper.getDateAfterDays(1);
        const tomorrowStr = DateHelper.formatDate(tomorrow);
        await this.navigateToDateMonth(tomorrowStr, languageHelper);
        await this.selectAvailableDate(tomorrowStr);

        return results;
    }
}

module.exports = new BookingPage();
