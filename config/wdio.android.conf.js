const { config } = require('./wdio.shared.conf');

exports.config = {
    ...config,

    // Appium Server details
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    path: '/',

    // Spec patterns
    specs: [
        './test/specs/**/*.js'
    ],

    maxInstances: 1,

    // Capabilities
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': process.env.ANDROID_AUTOMATION_NAME || 'UiAutomator2',
        'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
        'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '17.0',
        'appium:fullReset': process.env.APP_FULL_RESET === 'true' || false,
        'appium:noReset': process.env.APP_NO_RESET === 'true' || false,
        'appium:newCommandTimeout': 120,
        'appium:appWaitDuration': 30000,
        'appium:app': process.env.ANDROID_APP_PATH || 'C:\\Users\\vishnu\\Desktop\\apk\\LokbestWithTestIDs.apk'
    }]
};
