const languagePage = require('../../pageobjects/onboarding/LanguagePage');
const deData = require('../../fixtures/localization/de.json');

describe('Language Selection Module', function () {
    this.timeout(300000);

    it('should display Deutsch translations and confirm', async () => {
        await languagePage.selectLanguage('Deutsch');

        const actualTitle = await languagePage.getLanguageTitle(deData.languageSelection.title);
        const actualConfirm = await languagePage.getConfirmText();

        expect(actualTitle).toBe(deData.languageSelection.title);
        expect(actualConfirm).toBe(deData.languageSelection.confirm);

        await languagePage.confirmLanguage();
    });
});
