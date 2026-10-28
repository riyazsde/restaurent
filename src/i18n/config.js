import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enPos from '../locales/en/pos.json';
import enSettings from '../locales/en/settings.json';
import enReports from '../locales/en/reports.json';
import enInvoice from '../locales/en/invoice.json';
import enEmployee from '../locales/en/employee.json';

import frCommon from '../locales/fr/common.json';
import frAuth from '../locales/fr/auth.json';
import frDashboard from '../locales/fr/dashboard.json';
import frPos from '../locales/fr/pos.json';
import frSettings from '../locales/fr/settings.json';
import frReports from '../locales/fr/reports.json';
import frInvoice from '../locales/fr/invoice.json';
import frEmployee from '../locales/fr/employee.json';

import enCustomer from '../locales/en/customer.json';
import frCustomer from '../locales/fr/customer.json';
import enReservation from '../locales/en/reservation.json';
import frReservation from '../locales/fr/reservation.json';
import enKitchen from '../locales/en/kitchen.json';
import frKitchen from '../locales/fr/kitchen.json';
import enOrders from '../locales/en/orders.json';
import frOrders from '../locales/fr/orders.json';
import enProfile from '../locales/en/profile.json';
import frProfile from '../locales/fr/profile.json';
import enSupport from '../locales/en/support.json';
import frSupport from '../locales/fr/support.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    pos: enPos,
    settings: enSettings,
    reports: enReports,
    invoice: enInvoice,
    employee: enEmployee,
    customer: enCustomer,
    reservation: enReservation,
    kitchen: enKitchen,
    orders: enOrders,
    profile: enProfile,
    support: enSupport
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    pos: frPos,
    settings: frSettings,
    reports: frReports,
    invoice: frInvoice,
    employee: frEmployee,
    customer: frCustomer,
    reservation: frReservation,
    kitchen: frKitchen,
    orders: frOrders,
    profile: frProfile,
    support: frSupport
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Default language is French
    fallbackLng: 'fr',
    ns: ['common', 'auth', 'dashboard', 'pos', 'settings', 'reports', 'invoice', 'employee', 'customer', 'reservation', 'kitchen', 'orders', 'profile', 'support'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
