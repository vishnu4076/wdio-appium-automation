require('dotenv').config();
const path = require('path');

exports.config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',

    // ==================
    // Test Configurations
    // ==================
    logLevel: process.env.LOG_LEVEL || 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 300000
    },

    //
    // =====
    // Hooks
    // =====
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const sanitizedTitle = test.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
            const screenshotPath = path.join(process.cwd(), 'screenshots', `FAILED_${sanitizedTitle}_${timestamp}.png`);
            try {
                await browser.saveScreenshot(screenshotPath);
                console.log(`[Screenshot] Failure screenshot captured: ${screenshotPath}`);
            } catch (err) {
                console.warn(`[Screenshot] Failed to capture failure screenshot: ${err.message}`);
            }
        }
    }
};
