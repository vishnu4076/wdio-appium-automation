const { TIMEOUTS } = require('./timeouts');

const LANGUAGES = {
    ENGLISH: 'English',
    DEUTSCH: 'Deutsch',
    ITALIANO: 'Italiano'
};

const REGEX_PATTERNS = {
    MONTH_YEAR: /^[A-Za-z]+ \d{4}$/,
    TIME_SLOT: /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/
};

module.exports = {
    TIMEOUTS,
    LANGUAGES,
    REGEX_PATTERNS
};
