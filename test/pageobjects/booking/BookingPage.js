const BasePage = require('../common/BasePage');
const { TIMEOUTS } = require('../../constants/timeouts');
const DateHelper = require('../../utils/helpers/dateHelper');
const SlotHelper = require('../../utils/helpers/slotHelper');

class BookingPage extends BasePage {
    // =========================================================
    // LOCATORS
    // =========================================================

    get dateTimeButton() {
        return $(
            '//android.view.ViewGroup[@content-desc="Choose your preferred date and time."]/android.widget.ImageView'
        );
    }

    get availableSlotsText() {
        return $('//android.widget.TextView[@text="Available slots"]');
    }

    get applyButton() {
        return $('//android.widget.TextView[@text="Apply"]');
    }

    // =========================================================
    // DATE PICKER
    // =========================================================

    async openDatePicker() {
        await this.dateTimeButton.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        await this.dateTimeButton.click();
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

    async verifyAvailableSlots() {
        await this.availableSlotsText.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
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

    async clickApply() {
        await this.applyButton.waitForDisplayed({ timeout: TIMEOUTS.MEDIUM });
        await this.applyButton.click();
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
            const fallback = $(
                'android=new UiSelector().className("android.widget.TextView").textMatches("^[A-Za-z]+ [0-9]{4}$")'
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

    async navigateToDateMonth(dateString) {
        const { year: targetYear, month: targetMonth } = DateHelper.parseYearMonth(dateString);

        for (let attempt = 0; attempt < 12; attempt++) {
            const displayedMonthYear = await this.getDisplayedMonthYear();
            const [monthName, year] = displayedMonthYear.split(' ');
            const displayedYear = Number(year);
            const displayedMonth = new Date(`${monthName} 1, ${displayedYear}`).getMonth() + 1;

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

    async validateBookingWindow() {
        const results = [];

        // Tomorrow (+1) through +15 should be available
        for (let day = 1; day <= 15; day++) {
            const date = DateHelper.getDateAfterDays(day);
            const dateString = DateHelper.formatDate(date);

            await this.navigateToDateMonth(dateString);
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

        await this.navigateToDateMonth(dateString16);
        const available16 = await this.isDateAvailable(dateString16);

        results.push({
            date: dateString16,
            expected: false,
            actual: available16
        });

        // Re-select tomorrow's date so subsequent tests can execute
        const tomorrow = DateHelper.getDateAfterDays(1);
        const tomorrowStr = DateHelper.formatDate(tomorrow);
        await this.navigateToDateMonth(tomorrowStr);
        await this.selectAvailableDate(tomorrowStr);

        return results;
    }
}

module.exports = new BookingPage();
