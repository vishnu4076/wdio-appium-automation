const OnboardingPage = require('../pageobjects/OnboardingPage');
const CountryPickerPage = require('../pageobjects/CountryPickerPage');
const LoginPage = require('../pageobjects/LoginPage');
const StorePage = require('../pageobjects/StorePage');

const {
    handlePermissions
} = require('../pageobjects/permissions');


describe(' User Flow', () => {

    it('should enter the store ', async () => {

        // -------------------------
        // ONBOARDING
        // -------------------------

        await OnboardingPage.selectEnglish();

        await OnboardingPage.clickSelect();

        await OnboardingPage.clickIntroContinue();

        await OnboardingPage.skip();


        // -------------------------
        // PERMISSIONS
        // -------------------------

        await handlePermissions();


        // -------------------------
        // ENTER APP
        // -------------------------

        await OnboardingPage.continueToApp();


        // -------------------------
        // COUNTRY
        // -------------------------

        await CountryPickerPage.openCountryPicker();

        await CountryPickerPage.selectCountry('Croatia');


        // -------------------------
        // LOGIN
        // -------------------------

        await LoginPage.login(
            '3653653650',
            'Test@1234'
        );


        // -------------------------
        // STORE
        // -------------------------

        // Click Confirm once to enter the store list
        await StorePage.clickConfirmToStore();


        await StorePage.subscribeToStore("Raymond Bakers");




    });

});
// const { expect } = require('@wdio/globals')

// // describe('Guest User Flow', () => {

// //     it('should open app and click login as guest', async () => {
// //         // Wait for the "Continue as a guest" button using its accessibility id
// //         const guestBtn = await $('~Continue as a guest');

// //         await guestBtn.waitForDisplayed({ timeout: 15000 });

// //         // Click the Guest button
// //         await guestBtn.click();

// //         console.log('Continue as Guest button clicked successfully!');

// //         // Wait a moment to see the result
// //         await browser.pause(3000);
// //     });

// // });
// describe('Guest User Flow', () => {

//     it('debug app screen', async () => {


//         console.log(await browser.getPageSource());

//         await browser.saveScreenshot('./debug.png');
//         const englishButton = await $('~English');

//         await englishButton.click();

//         const selectButton = await $('~Select');
//         await selectButton.click();
//         const continueButton = await $('android=new UiSelector().resourceId("intro-next-btn")');
//         await continueButton.click();
//         await $('~Skip').click();
//         // Dismiss ALL permission dialogs in a loop
//         // The app may trigger multiple permission requests (location, notifications, etc.)
//         let permissionHandled = true;
//         while (permissionHandled) {
//             permissionHandled = false;

//             // Try each known permission button type
//             const permissionButtons = [
//                 'com.android.permissioncontroller:id/permission_allow_foreground_only_button', // "While using the app"
//                 'com.android.permissioncontroller:id/permission_allow_one_time_button',        // "Only this time"
//                 'com.android.permissioncontroller:id/permission_allow_button',                  // "Allow"
//             ];

//             for (const buttonId of permissionButtons) {
//                 try {
//                     const btn = await $(`android=new UiSelector().resourceId("${buttonId}")`);
//                     await btn.waitForDisplayed({ timeout: 3000 });
//                     await btn.click();
//                     console.log(`Permission granted via: ${buttonId}`);
//                     permissionHandled = true;
//                     await browser.pause(1000); // Wait for next dialog to appear
//                     break; // Restart the while loop to check for more dialogs
//                 } catch (e) {
//                     // This button type not found, try next
//                 }
//             }
//         }
//         console.log('All permission dialogs handled');

//         // Debug: capture what's on screen before looking for Continue
//         await browser.pause(1000); // Wait for any transitions

//         const continueToApp = await $(
//             'android=new UiSelector().text("Continue")'
//         );

//         await continueToApp.waitForDisplayed({ timeout: 15000 });
//         await continueToApp.click();

//         // Click the country picker (the clickable ViewGroup with content-desc)
//         // const countryPicker = $('id=com.lokbest.stage:id/country-picker');

//         // await countryPicker.waitForDisplayed({ timeout: 10000 });
//         // await countryPicker.click(); // Wait for country list to load
//         // await browser.saveScreenshot('./after_country_picker.png');
//         const countryPicker = $('//android.widget.TextView[@text="🇩🇪"]');

//         await countryPicker.waitForDisplayed({ timeout: 10000 });
//         await countryPicker.click();

//         const croatia = await $(
//             'android=new UiSelector().textContains("Croatia")'
//         );

//         await croatia.waitForDisplayed({ timeout: 10000 });
//         await croatia.click();

//         const phoneNumber = await $('~Phone Number *');

//         await phoneNumber.waitForDisplayed({ timeout: 10000 });
//         await phoneNumber.setValue('3653653650');

//         await $('android=new UiSelector().resourceId("landing-continue-btn")').click();


//         const password = await $(
//             'android=new UiSelector().resourceId("login-password-input")'
//         );

//         await password.setValue('Test@1234');
//         await $('~Sign In').click();
//         await browser.pause(30000);

//         await $('~Confirm').click();

//     });



// });
