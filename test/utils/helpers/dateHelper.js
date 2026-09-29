/**
 * Helper methods for calendar date math and formatting
 */
class DateHelper {
    /**
     * Get a Date object offset by N days from today
     * @param {number} days
     * @returns {Date}
     */
    static getDateAfterDays(days) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + days);
        return date;
    }

    /**
     * Format a Date object to YYYY-MM-DD
     * @param {Date} date
     * @returns {string}
     */
    static formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Parse date string into target year and month
     * @param {string} dateString
     */
    static parseYearMonth(dateString) {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
        }
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        };
    }
}

module.exports = DateHelper;
