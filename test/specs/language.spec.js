const languagePage = require('../pageobjects/LanguagePage');

const languages = {
    English: require('../data/languages/en.json'),
    Deutsch: require('../data/languages/de.json'),
    Italiano: require('../data/languages/it.json')
};

describe('Language Selection', () => {

    it('should display Italian translations', async () => {

        const language = languages.Deutsch;

        await languagePage.selectLanguage('Deutsch');

        const actualTitle =
            await languagePage.getLanguageTitle(language.languageSelection.title);

        const actualConfirm =
            await languagePage.getConfirmText();

        expect(actualTitle).toBe(language.languageSelection.title);
        expect(actualConfirm).toBe(language.languageSelection.confirm);

        await languagePage.confirmLanguage();
    });
});