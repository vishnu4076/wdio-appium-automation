class BookingPage {

    // Locators
    get dateTimeButton() {
        return $(
            '//android.view.ViewGroup[@content-desc="Choose your preferred date and time."]/android.widget.ImageView'
        );
    }

    get availableSlotsText() {
        return $(
            '//android.widget.TextView[@text="Available slots"]'
        );
    }

    get applyButton() {
        return $(
            '//android.widget.TextView[@text="Apply"]'
        );
    }

    // Open date picker
    async openDatePicker() {
        await this.dateTimeButton.waitForDisplayed({
            timeout: 10000
        });

        await this.dateTimeButton.click();

        console.log('Date picker opened');
    }

    // Select date
    async selectDate(dateString) {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date: ${dateString}`);
        }

        const day = date.getDate();

        const dateElement = await $(
            `//android.widget.TextView[@text="${day}"]`
        );

        await dateElement.waitForDisplayed({
            timeout: 10000
        });

        await dateElement.click();

        console.log(`Date ${day} selected`);
    }

    // Verify available slots
    async verifyAvailableSlots() {
        await this.availableSlotsText.waitForDisplayed({
            timeout: 10000
        });

        console.log('Available slots section is displayed');
    }

    // Get available time slots
    async getAvailableTimeSlots() {
        const elements = await $$(
            '//android.view.ViewGroup[@content-desc]'
        );

        const timeSlotRegex =
            /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/;

        const availableSlots = [];

        for (const element of elements) {
            const contentDesc =
                await element.getAttribute('content-desc');

            if (
                contentDesc &&
                timeSlotRegex.test(contentDesc.trim())
            ) {
                availableSlots.push(contentDesc.trim());
            }
        }

        return availableSlots;
    }

    // Print available time slots
    async printAvailableTimeSlots() {
        const slots = await this.getAvailableTimeSlots();

        console.log(`Available slot count: ${slots.length}`);
        console.log(`Available slots: ${slots.join(', ')}`);

        return slots;
    }

    // Select specific time slot
    async selectTimeSlot(timeSlot) {
        const slot = await $(
            `//android.view.ViewGroup[@content-desc="${timeSlot}"]`
        );

        await slot.waitForDisplayed({
            timeout: 10000
        });

        await slot.click();

        console.log(`Selected time slot: ${timeSlot}`);
    }

    // Select first available slot
    async selectFirstAvailableTimeSlot() {
        const slots = await this.getAvailableTimeSlots();

        if (slots.length === 0) {
            throw new Error('No available time slots found');
        }

        const firstSlot = slots[0];

        console.log(`Selecting first available slot: ${firstSlot}`);

        await this.selectTimeSlot(firstSlot);

        return firstSlot;
    }

    // Click Apply
    async clickApply() {
        await this.applyButton.waitForDisplayed({
            timeout: 10000
        });

        await this.applyButton.click();

        console.log('Apply button clicked');
    }

    // Get displayed month and year
    async getDisplayedMonthYear() {
        const monthYear = await $(
            '//android.widget.TextView[matches(@text, "^[A-Za-z]+ [0-9]{4}$")]'
        );

        await monthYear.waitForDisplayed({
            timeout: 10000
        });

        const value = await monthYear.getText();

        console.log(`Displayed month/year: ${value}`);

        return value.trim();
    }

    // Get exact calendar date
    getCalendarDate(dateString) {
        return $(
            `//*[@resource-id="age-verify-calendar-day-${dateString}"]`
        );
    }

    // Click next month
    async clickNextMonth() {
        const nextMonthButton = await $(
            '~age-verify-calendar-next-month-btn'
        );

        await nextMonthButton.waitForDisplayed({
            timeout: 10000
        });

        await nextMonthButton.click();

        console.log('Next month clicked');
    }

    // Check date availability
    async isDateAvailable(dateString) {
        const dateElement =
            this.getCalendarDate(dateString);

        if (!(await dateElement.isExisting())) {
            console.log(`Date ${dateString} is not present`);
            return false;
        }

        const enabled =
            await dateElement.isEnabled();

        const clickable =
            await dateElement.getAttribute('clickable');

        console.log(
            `Date: ${dateString} | Enabled: ${enabled} | Clickable: ${clickable}`
        );

        return enabled && clickable === 'true';
    }

    // Select available date
    async selectAvailableDate(dateString) {
        const available =
            await this.isDateAvailable(dateString);

        if (!available) {
            throw new Error(
                `Date ${dateString} is not available for booking`
            );
        }

        const dateElement =
            this.getCalendarDate(dateString);

        await dateElement.click();

        console.log(
            `Available date selected: ${dateString}`
        );
    }

    // Check whether date exists
    async isDatePresent(dateString) {
        const dateElement =
            this.getCalendarDate(dateString);

        return await dateElement.isExisting();
    }

    // Get all available dates
    async getAvailableDates(year, month) {
        const monthString =
            String(month).padStart(2, '0');

        const dateElements = await $$(
            `//*[starts-with(@resource-id, "age-verify-calendar-day-${year}-${monthString}-")]`
        );

        const availableDates = [];

        for (const dateElement of dateElements) {

            const enabled =
                await dateElement.isEnabled();

            const clickable =
                await dateElement.getAttribute('clickable');

            if (
                enabled &&
                clickable === 'true'
            ) {
                const resourceId =
                    await dateElement.getAttribute(
                        'resource-id'
                    );

                const date =
                    resourceId.replace(
                        'age-verify-calendar-day-',
                        ''
                    );

                availableDates.push(date);
            }
        }

        console.log(
            `Available dates: ${availableDates.join(', ')}`
        );

        return availableDates;
    }

    // Select date after navigating to month
    async selectDateFromCalendar(dateString) {
        const targetDate =
            new Date(dateString);

        if (isNaN(targetDate.getTime())) {
            throw new Error(
                `Invalid date: ${dateString}`
            );
        }

        const targetMonth =
            targetDate.toLocaleString('en-US', {
                month: 'long'
            });

        const targetYear =
            targetDate.getFullYear();

        const targetMonthYear =
            `${targetMonth} ${targetYear}`;

        console.log(
            `Target month/year: ${targetMonthYear}`
        );

        for (let i = 0; i < 12; i++) {

            const currentMonthYear =
                await this.getDisplayedMonthYear();

            if (
                currentMonthYear ===
                targetMonthYear
            ) {
                break;
            }

            await this.clickNextMonth();

            await browser.pause(300);
        }

        const available =
            await this.isDateAvailable(dateString);

        if (!available) {
            throw new Error(
                `Date ${dateString} is not available for booking`
            );
        }

        const dateElement =
            this.getCalendarDate(dateString);

        await dateElement.click();

        console.log(
            `Successfully selected date: ${dateString}`
        );
    }

    // Get available time slots using resource ID
    async getAvailableTimeSlotsById() {
        const slotElements = await $$(
            '//*[starts-with(@resource-id, "age-verify-time-slot-")]'
        );

        const availableSlots = [];

        for (const slot of slotElements) {

            const enabled =
                await slot.isEnabled();

            const clickable =
                await slot.getAttribute('clickable');

            if (
                enabled &&
                clickable === 'true'
            ) {
                const contentDesc =
                    await slot.getAttribute(
                        'content-desc'
                    );

                const resourceId =
                    await slot.getAttribute(
                        'resource-id'
                    );

                availableSlots.push({
                    time: contentDesc,
                    resourceId: resourceId
                });
            }
        }

        console.log(
            `Available time slots: ${availableSlots.length}`
        );

        availableSlots.forEach((slot, index) => {
            console.log(
                `${index + 1}. ${slot.time}`
            );
        });

        return availableSlots;
    }

    // Select time slot using resource ID
    async selectTimeSlotById(time) {
        const slot = await $(
            `//*[@resource-id="age-verify-time-slot-${time}"]`
        );

        await slot.waitForDisplayed({
            timeout: 10000
        });

        const enabled =
            await slot.isEnabled();

        const clickable =
            await slot.getAttribute('clickable');

        if (
            !enabled ||
            clickable !== 'true'
        ) {
            throw new Error(
                `Time slot ${time} is not available`
            );
        }

        await slot.click();

        console.log(
            `Selected time slot: ${time}`
        );
    }

    // Select first available slot using resource ID
    async selectFirstAvailableTimeSlotById() {
        const slots =
            await this.getAvailableTimeSlotsById();

        if (slots.length === 0) {
            throw new Error(
                'No available time slots found'
            );
        }

        const firstSlot = slots[0];

        await this.selectTimeSlotById(
            firstSlot.time.split(' - ')[0]
        );

        console.log(
            `Selected first available slot: ${firstSlot.time}`
        );

        return firstSlot.time;
    }
}

module.exports = new BookingPage();