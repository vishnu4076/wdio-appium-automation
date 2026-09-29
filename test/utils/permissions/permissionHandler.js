/**
 * Handler for standard Android system runtime permission dialogues
 */
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
                const button = $(`android=new UiSelector().resourceId("${buttonId}")`);
                const isVisible = await button.waitForDisplayed({ timeout: 2500 }).then(() => true).catch(() => false);

                if (isVisible) {
                    await button.click();
                    console.log(`[PermissionHandler] Granted permission via: ${buttonId}`);
                    permissionHandled = true;
                    await browser.pause(800);
                    break;
                }
            } catch (error) {
                // Button not present or already dismissed
            }
        }
    }
}

module.exports = {
    handlePermissions
};
