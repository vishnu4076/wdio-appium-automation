# Lokbest Mobile Automation Framework (WDIO + Appium)

Enterprise-grade mobile test automation framework for the **Lokbest Android Application**, architected with **WebdriverIO**, **Appium**, and **JavaScript**, adhering strictly to the **Page Object Model (POM)** and mobile automation best practices.

---

## Architecture Overview

```text
lokbest-mobile-automation/
├── apps/                        # Android APK binaries directory (.apk)
├── config/                      # WebdriverIO configurations
│   ├── wdio.shared.conf.js      # Shared base configuration (reporters, hooks, timeouts)
│   └── wdio.android.conf.js     # Android device capabilities & Appium host settings
├── logs/                        # Appium & test execution logs
├── reports/                     # Test execution reports
├── screenshots/                 # Automatic failure screenshots
├── test/
│   ├── constants/               # Global constants (timeouts, language enums, regexes)
│   │   ├── timeouts.js
│   │   └── index.js
│   ├── fixtures/                # Static test data & localization dictionaries
│   │   ├── testData/            # Credentials, store names, booking data
│   │   └── localization/        # en.json, de.json, it.json
│   ├── pageobjects/             # Page Object Model layer (locators & UI actions)
│   │   ├── common/              # BasePage and shared screen components
│   │   ├── onboarding/          # LanguagePage, OnboardingPage
│   │   ├── authentication/      # CountryPickerPage, LoginPage
│   │   ├── store/               # StorePage, ProductPage
│   │   └── booking/             # BookingPage (Calendar, slots, dates)
│   ├── utils/                   # Reusable business logic & helper utilities
│   │   ├── authentication/      # Reusable login & store entry flow (authFlow.js)
│   │   ├── permissions/         # Android system permission dialog handler
│   │   ├── helpers/             # Date, slot, country math and helpers
│   │   └── wait/                # Explicit wait utilities and polling
│   └── specs/                   # Test specifications organized by domain
│       ├── onboarding/          # Intro and onboarding tests
│       ├── authentication/      # Login and country selection tests
│       ├── store/               # Store subscription and favorites tests
│       ├── booking/             # Calendar and time-slot booking tests
│       ├── age-verification/    # 18+ store check-in and Book ID verification
│       ├── localization/        # Language selection, English & German text checks
│       └── favourite.spec.js    # Dedicated Add Product to Favorites flow
├── .env.example                 # Environment configuration template
├── .env                         # Active local environment settings
├── package.json                 # Project dependencies & npm test scripts
├── wdio.conf.js                 # Backward-compatible configuration entry point
└── README.md                    # Project documentation
```

---

## Key Design Principles

1. **Page Object Model (POM)**: Locators and user interaction logic reside exclusively inside Page Objects. Assertions remain in test specs.
2. **Robust Locator Strategy Priority**:
   - `1.` Accessibility ID (`~<id>`)
   - `2.` Resource ID (`android=new UiSelector().resourceId("<id>")`)
   - `3.` UiAutomator text/scroll queries
   - `4.` XPath only when navigating complex relative hierarchies
3. **Decoupled Test Data & Localization**:
   - All expected text strings for **English**, **German**, and **Italian** reside in `test/fixtures/localization/*.json`.
   - User credentials, target stores, and test dates reside in `test/fixtures/testData/*.json`.
4. **Resilient Synchronization**:
   - Explicit waits (`waitForDisplayed`, `waitForExist`, `waitForClickable`) replace arbitrary sleeps.
   - Built-in failure hooks capture screenshots automatically to `screenshots/`.
5. **CI/CD & Multi-Environment Ready**:
   - Controlled via `.env` with configurable device name, Appium host/port, APK path, reset strategies, and timeouts.

---

## Prerequisites

- **Node.js**: v18.x or v20.x
- **Java JDK**: 11 or 17 (with `JAVA_HOME` configured)
- **Android SDK**: Build-tools & platform-tools (`adb` accessible in PATH)
- **Appium Server**: v2.x with `uiautomator2` driver installed:
  ```powershell
  appium driver install uiautomator2
  ```
- **Android Emulator or Real Device**: e.g., Android 12+ / 14+ / 17 (API 34/35)

---

## Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env` and adjust your device name and APK path:
```env
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
ANDROID_DEVICE_NAME=emulator-5554
ANDROID_PLATFORM_VERSION=17.0
ANDROID_AUTOMATION_NAME=UiAutomator2
ANDROID_APP_PATH=C:\Users\vishnu\Desktop\apk\LokbestWithTestIDs.apk
APP_FULL_RESET=false
APP_NO_RESET=false
LOG_LEVEL=info
```

### 3. Start Appium Server
```powershell
appium --port 4723
```

### 4. Verify Connected Android Device
```powershell
adb devices
```

---

## Test Execution Commands

| Test Suite / Scope | Command |
|---|---|
| **Run All Tests** | `npm run test` |
| **Favorites Spec** (User requested) | `npx wdio run ./config/wdio.android.conf.js --spec test/specs/favourite.spec.js` |
| **Store Tests** | `npm run test:store` |
| **Onboarding Tests** | `npm run test:onboarding` |
| **Authentication Tests** | `npm run test:auth` |
| **Booking & Calendar Tests** | `npm run test:booking` |
| **Age Verification (18+) Tests** | `npm run test:age-verification` |
| **All Localization Tests** | `npm run test:localization` |
| **English Text Verification** | `npm run test:english` |
| **Deutsch Text Verification** | `npm run test:deutsch` |

---

## Debugging & Reporting

- **Screenshots on Failure**: Captured automatically to the `screenshots/` directory with test title and timestamp.
- **Spec Reporter**: Real-time console reporting enabled by default (`@wdio/spec-reporter`).
- **Verbose Logging**: Set `LOG_LEVEL=debug` or `LOG_LEVEL=trace` in `.env` to inspect full Appium JSON-WP / W3C command payloads.