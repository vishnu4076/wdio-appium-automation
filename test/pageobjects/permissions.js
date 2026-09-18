async function handlePermissions() {

    let permissionHandled = true;

    const permissionButtons = [
        'com.android.permissioncontroller:id/permission_allow_foreground_only_button',
        'com.android.permissioncontroller:id/permission_allow_one_time_button',
        'com.android.permissioncontroller:id/permission_allow_button'
    ];

    while (permissionHandled) {

        permissionHandled = false;

        for (const buttonId of permissionButtons) {

            try {

                const button = $(
                    `android=new UiSelector().resourceId("${buttonId}")`
                );

                await button.waitForDisplayed({
                    timeout: 3000
                });

                await button.click();

                console.log(
                    `Permission granted via: ${buttonId}`
                );

                permissionHandled = true;

                await browser.pause(1000);

                break;

            } catch (error) {
                // Permission button not present
            }
        }
    }

    console.log('All permission dialogs handled');
}

module.exports = {
    handlePermissions
};