const { REGEX_PATTERNS } = require('../../constants');

class SlotHelper {
    /**
     * Validate if string matches time slot format (e.g. "14:00 - 18:00")
     * @param {string} slot
     * @returns {boolean}
     */
    static isValidTimeSlot(slot) {
        if (!slot || typeof slot !== 'string') return false;
        return REGEX_PATTERNS.TIME_SLOT.test(slot.trim());
    }
}

module.exports = SlotHelper;
