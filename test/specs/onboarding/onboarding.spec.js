const OnboardingPage = require('../../pageobjects/onboarding/OnboardingPage');
const { handlePermissions } = require('../../utils/permissions/permissionHandler');

describe('Onboarding Flow', function () {
    this.timeout(300000);

    it('should complete onboarding flow successfully', async () => {
        await OnboardingPage.selectEnglish();
        await OnboardingPage.clickSelect();
        await OnboardingPage.clickIntroContinue();
        await OnboardingPage.skip();

        // Handle permissions after skipping intro
        await handlePermissions();

        // Continue into app
        await OnboardingPage.continueToApp();
        await handlePermissions();
    });
});
