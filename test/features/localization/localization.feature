@localization
Feature: Data-Driven Mobile Localization Verification for Lokbest Android App
  As a global QA team and Lokbest customer
  I want all screens and user-facing content accurately translated for each supported language
  So that the app provides a seamless native experience without untranslated English text

  @smoke @regression
  Scenario Outline: Verify complete localization journey for <languageName> (<languageCode>)
    Given I load the translation fixture for "<languageCode>"
    When I select the language "<languageName>" on the language selection screen
    Then the language selection title should match the localized text
    And the language selection confirm button should match the localized text
    When I confirm the language selection
    When I proceed through the onboarding intro screen
    Then the onboarding skip button should match the localized text
    When I skip the onboarding flow
    When I handle app permissions
    Then the permissions continue button should match the localized text
    When I continue to the app and grant required permissions
    Then the country picker welcome title should match the localized text
    When I open the country picker and select the default country
    Then the login continue button should match the localized text
    When I enter phone number and click continue
    Then the login sign in button should match the localized text
    When I enter password and click sign in
    Then the store confirmation button should match the localized text
    When I confirm store selection and enter the store
    Then the store home navigation tabs should match the localized text
    When I navigate to the profile screen
    Then the profile tab and page title should match the localized text
    And all mandatory profile menu tiles should match the localized text
    And all visible optional profile menu tiles should match the localized text
    And all mandatory profile strings should be visible without untranslated English
    When I navigate to the information screen
    And I open the FAQ screen
    Then the FAQ item count should match the localized fixture
    And all FAQ questions and answers should match the localized fixture

    Examples:
      | languageCode | languageName |
      | en           | English      |
      | de           | Deutsch      |
      | it           | Italiano     |
      # Dutch (nl) is excluded from active execution because nl.json is missing the faqs section (faqs.items).
      # Once faqs.items is added to test/fixtures/languages/nl.json, uncomment the row below:
      # | nl           | Nederlands   |
