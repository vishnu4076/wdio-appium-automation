/**
 * LanguageHelper
 * --------------
 * Reusable localization helper for Lokbest Mobile Automation.
 *
 * Capabilities:
 *  - Detects selected language from parameter, env var (LANGUAGE / LANG), or default.
 *  - Dynamically loads matching JSON fixture (en.json, de.json, it.json, nl.json).
 *  - Preserves original nested JSON structure and key names without creating artificial dictionaries.
 *  - Resolves nested keys (e.g. 'verification.ageVerification') and root keys (e.g. 'BookIDVerification').
 *  - Reports missing translations strictly rather than silently passing.
 *  - Provides localized month resolution for calendar headers and navigation.
 */

const fs = require('fs');
const path = require('path');

const SUPPORTED_LANGUAGES = {
    en: { code: 'en', displayName: 'English', fixture: 'en.json' },
    de: { code: 'de', displayName: 'Deutsch', fixture: 'de.json' },
    it: { code: 'it', displayName: 'Italiano', fixture: 'it.json' },
    nl: { code: 'nl', displayName: 'Nederlands', fixture: 'nl.json' },
};

const ENGLISH_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

class MissingTranslationError extends Error {
    constructor(keyPath, languageCode) {
        super(
            `[MISSING TRANSLATION] Required translation key "${keyPath}" was not found in "${languageCode}.json". ` +
            `Ensure this key is defined in the language fixture.`
        );
        this.name = 'MissingTranslationError';
        this.keyPath = keyPath;
        this.languageCode = languageCode;
    }
}

class LanguageHelper {
    /**
     * @param {string} [languageCode] - Optional explicit language code (en, de, it, nl)
     */
    constructor(languageCode = null) {
        this.languageCode = this.resolveLanguageCode(languageCode);
        this.languageConfig = SUPPORTED_LANGUAGES[this.languageCode];
        this.languageData = this.loadFixture(this.languageCode);
    }

    /**
     * Resolve language code from parameter, process.env.LANGUAGE, process.env.LANG, or fallback to 'en'
     * @param {string} [code]
     * @returns {'en' | 'de' | 'it' | 'nl'}
     */
    resolveLanguageCode(code) {
        const candidate = (
            code ||
            process.env.LANGUAGE ||
            process.env.LANG ||
            'en'
        ).toLowerCase().trim();

        // Handle language names like 'english', 'deutsch', 'italiano', 'nederlands'
        for (const [key, config] of Object.entries(SUPPORTED_LANGUAGES)) {
            if (candidate === key || candidate === config.displayName.toLowerCase()) {
                return key;
            }
        }

        // Substring check (e.g., 'en-US' -> 'en')
        const prefix = candidate.slice(0, 2);
        if (SUPPORTED_LANGUAGES[prefix]) {
            return prefix;
        }

        console.warn(
            `[LanguageHelper] Unsupported language "${candidate}". Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}. Defaulting to 'en'.`
        );
        return 'en';
    }

    /**
     * Dynamically loads the matching language JSON file
     * @param {string} code
     * @returns {Record<string, any>}
     */
    loadFixture(code) {
        const potentialPaths = [
            path.resolve(__dirname, `../../fixtures/languages/${code}.json`),
            path.resolve(process.cwd(), `test/fixtures/languages/${code}.json`),
            path.resolve(process.cwd(), `wdio-appium-automation/test/fixtures/languages/${code}.json`),
            path.resolve(process.cwd(), `${code}.json`),
            path.resolve(__dirname, `../../../../${code}.json`)
        ];

        let fixturePath = null;
        for (const p of potentialPaths) {
            if (fs.existsSync(p)) {
                fixturePath = p;
                break;
            }
        }

        if (!fixturePath) {
            throw new Error(
                `[LanguageHelper] Translation fixture for "${code}" not found. Searched in:\n` +
                potentialPaths.map(p => `  - ${p}`).join('\n')
            );
        }

        try {
            // Require or parse JSON
            return require(fixturePath);
        } catch (e) {
            // In case of UTF-16LE or parse issue, fallback to fs.readFileSync
            try {
                let content = fs.readFileSync(fixturePath, 'utf8');
                if (content.charCodeAt(0) === 0xFEFF) {
                    content = content.slice(1);
                }
                return JSON.parse(content);
            } catch (err2) {
                throw new Error(
                    `[LanguageHelper] Failed to load translation fixture at "${fixturePath}": ${e.message} / ${err2.message}`
                );
            }
        }
    }

    /**
     * Switch currently active language
     * @param {string} languageCode
     */
    setLanguage(languageCode) {
        this.languageCode = this.resolveLanguageCode(languageCode);
        this.languageConfig = SUPPORTED_LANGUAGES[this.languageCode];
        this.languageData = this.loadFixture(this.languageCode);
        return this;
    }

    /**
     * Returns the 2-letter language code (en, de, it, nl)
     * @returns {string}
     */
    getLanguageCode() {
        return this.languageCode;
    }

    /**
     * Returns human-readable language display name (English, Deutsch, Italiano, Nederlands)
     * @returns {string}
     */
    getDisplayName() {
        return this.languageConfig.displayName;
    }

    /**
     * Returns the loaded translation JSON dictionary preserving its original nested structure
     * @returns {Record<string, any>}
     */
    getTranslations() {
        return this.languageData;
    }

    /**
     * Resolve value by dot-notation path or direct key from nested JSON
     * @param {Record<string, any>} obj
     * @param {string} pathStr
     * @returns {any}
     */
    getNestedValue(obj, pathStr) {
        if (!obj || !pathStr) return undefined;
        if (Object.prototype.hasOwnProperty.call(obj, pathStr)) {
            return obj[pathStr];
        }
        const parts = pathStr.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === undefined || current === null) return undefined;
            current = current[part];
        }
        return current;
    }

    /**
     * Strictly resolves expected translation text from active language JSON.
     * Reports missing translation if key does not exist.
     *
     * @param {string | string[]} keyOrKeys - Single key path or array of candidate key paths
     * @returns {string}
     * @throws {MissingTranslationError}
     */
    getText(keyOrKeys) {
        const candidates = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];

        for (const key of candidates) {
            const val = this.getNestedValue(this.languageData, key);
            if (val !== undefined && val !== null && val !== '') {
                return val;
            }
        }

        // Key is missing!
        const primaryKey = candidates[0];
        throw new MissingTranslationError(primaryKey, this.languageCode);
    }

    /**
     * Safe lookup that returns undefined instead of throwing if key is not present.
     * @param {string} keyPath
     * @returns {string | undefined}
     */
    lookup(keyPath) {
        return this.getNestedValue(this.languageData, keyPath);
    }

    /**
     * Returns the localized month name for a given 1-based month index (1-12) or English month name
     * @param {number | string} month - Month index (1-12) or English month name ('January', etc.)
     * @returns {string}
     */
    getLocalizedMonth(month) {
        let englishMonthName = '';
        if (typeof month === 'number') {
            if (month < 1 || month > 12) {
                throw new Error(`[LanguageHelper] Invalid month index: ${month}. Must be 1-12.`);
            }
            englishMonthName = ENGLISH_MONTHS[month - 1];
        } else if (typeof month === 'string') {
            const match = ENGLISH_MONTHS.find(m => m.toLowerCase() === month.trim().toLowerCase());
            if (match) {
                englishMonthName = match;
            } else {
                englishMonthName = month.trim();
            }
        }

        // Resolve localized month from JSON keys ('January'..'December')
        const localized = this.getText(englishMonthName);
        return localized;
    }

    /**
     * Maps a localized month name back to its 1-based month index (1-12)
     * @param {string} localizedMonthName
     * @returns {number}
     */
    getMonthIndexFromLocalized(localizedMonthName) {
        if (!localizedMonthName) return NaN;
        const target = localizedMonthName.trim().toLowerCase();

        for (let i = 0; i < ENGLISH_MONTHS.length; i++) {
            const engMonth = ENGLISH_MONTHS[i];
            let localizedCandidate = '';
            try {
                localizedCandidate = (this.lookup(engMonth) || '').toLowerCase();
            } catch (_) {}

            if (localizedCandidate === target || engMonth.toLowerCase() === target) {
                return i + 1;
            }
        }

        // Fallback: standard Date parsing
        const dateParsed = new Date(`${localizedMonthName} 1, 2026`).getMonth();
        return Number.isNaN(dateParsed) ? NaN : dateParsed + 1;
    }

    /**
     * Builds expected localized month/year header string (e.g. "Oktober 2026" or "März 2026")
     * @param {Date | { year: number, month: number }} dateOrYearMonth
     * @returns {string}
     */
    formatMonthYear(dateOrYearMonth) {
        let year, month;
        if (dateOrYearMonth instanceof Date) {
            year = dateOrYearMonth.getFullYear();
            month = dateOrYearMonth.getMonth() + 1;
        } else {
            year = dateOrYearMonth.year;
            month = dateOrYearMonth.month;
        }
        const monthName = this.getLocalizedMonth(month);
        return `${monthName} ${year}`;
    }
}

// Export class and singleton instance for convenience
module.exports = LanguageHelper;
module.exports.MissingTranslationError = MissingTranslationError;
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
