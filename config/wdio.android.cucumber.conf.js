const path = require('path');
const { globSync } = require('glob');
const { config: androidConfig } = require('./wdio.android.conf');

/**
 * WebdriverIO Android Cucumber Configuration
 * ==========================================
 * Configures WebdriverIO to execute Cucumber BDD features with Appium Android driver.
 * Reuses all capabilities, Appium server configurations, and timeouts from wdio.android.conf.js.
 */
exports.config = {
    ...androidConfig,

    // Cucumber framework setup
    framework: 'cucumber',

    // Features path
    specs: [
        './test/features/**/*.feature'
    ],

    // Cucumber runner options
    // Pre-expanding require globs ensures full cross-platform compatibility on Windows (resolving win32 file:// globbing issue)
    cucumberOpts: {
        require: globSync('test/step-definitions/**/*.js', { posix: true }),
        backtrace: false,
        requireModule: [],
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: true,
        tagExpression: '',
        timeout: 400000,
        ignoreUndefinedDefinitions: false
    },

    // Cucumber hook for capturing screenshots on failed scenarios
    afterScenario: async function (world, result, context) {
        const passed = result && (result.passed !== undefined ? result.passed : result.status === 'PASSED');
        if (!passed) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const sanitizedTitle = ((world.pickle && world.pickle.name) || 'bdd_scenario')
                .replace(/[^a-zA-Z0-9]/g, '_')
                .substring(0, 50);
            const screenshotPath = path.join(process.cwd(), 'screenshots', `FAILED_BDD_${sanitizedTitle}_${timestamp}.png`);
            try {
                await browser.saveScreenshot(screenshotPath);
                console.log(`[Screenshot] Failure screenshot captured: ${screenshotPath}`);
            } catch (err) {
                console.warn(`[Screenshot] Failed to capture failure screenshot: ${err.message}`);
            }
        }
    }
};
