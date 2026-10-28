# Workspace Guidelines & Rules

## 1. Internationalization (i18n) by Default
- **Mandatory Localization**: All user-facing UI elements, buttons, tabs, modal titles, actions, and notifications MUST use `useTranslation()` from `react-i18next`.
- **Maintain Language Dictionaries**: When adding or updating strings, update both `src/locales/en/` and `src/locales/fr/`.
- **Language Selector**: POS and major views must include the `<LanguageSelector />` component in the header.
- **Button & Component Reactivity**: All interactive buttons must react immediately to language switching without requiring full-page reloads.

## 2. Dynamic Currency
- Never hardcode currency strings like `"XOF"` or `"$"`.
- Always derive the currency from the store profile (`restaurantData?.currency`) and display prices dynamically.

## 3. Build & Execution Rules
- Do NOT run `npm run build` unless explicitly instructed by the user.
