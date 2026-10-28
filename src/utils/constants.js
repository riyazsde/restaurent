export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN_RESTAURANT: '/user/login-restaurant',
  LOGIN_EMPLOYEE: '/user/login-employee',
  LOGIN_EMPLOYEE_VERIFY_OTP: '/user/login-employee/verify-otp',
  LOGIN_EMPLOYEE_RESEND_OTP: '/user/login-employee/resend-otp',
  LOGIN_ADMIN: '/user/login-admin',
  LOGOUT: '/user/logout',
  FORGOT_PASSWORD_SEND_OTP: '/user/forget-password/send-otp',
  FORGOT_PASSWORD_VERIFY_OTP: '/user/forget-password/verify-otp',
  CHANGE_PASSWORD: '/user/change-password',
  USER_UPDATE: '/user/update',
  REFRESH_TOKEN: '/auth/refresh-token',

  // Reports endpoints
  REPORTS_TODAY: '/restaurant/reports/reports_today',
  REPORTS_MONTH: '/restaurant/reports/reports_month',
  REPORTS_SIX_MONTHS: '/restaurant/reports/reports_six_month',
  REPORTS_ONE_YEAR: '/restaurant/reports/reports_one_year',

  // Customer endpoints
  CUSTOMERS_GET_ALL: '/restaurant/customer/getall',
  CUSTOMERS_GET_ALL_BY_AUTH: '/restaurant/customer/getbyauth',
  CUSTOMERS_GET_BY_ID: '/restaurant/customer/getbyid',
  CUSTOMERS_CREATE: '/restaurant/customer/create',
  CUSTOMERS_UPDATE: '/restaurant/customer/update',
  CUSTOMERS_DELETE: '/restaurant/customer/delete',

  // Store endpoints
  STORE_GET_BY_AUTH: '/restaurant/store_details/getbyauth',
  STORE_SAVE: '/restaurant/store_details/save',
  STORE_UPDATE: '/restaurant/store_details/update',

  // Subscription endpoints
  SUBSCRIPTION_GET_PURCHASED: '/restaurant/admin_plan_buy_restaurant/getRestaurantSubscriptionPurchased',
  SUBSCRIPTION_RENEW: '/restaurant/admin_plan_buy_restaurant/renew',

  // Print Settings endpoints
  PRINT_SETTINGS_GET_BY_AUTH: '/restaurant/print_settings/getbyauth',
  PRINT_SETTINGS_UPDATE: '/restaurant/print_settings/update',

  // Table endpoints
  TABLES_GET_ALL: '/admin/table/getbyauth',
  TABLES_GET_BY_ID: '/admin/table/get',
  TABLES_CREATE: '/admin/table/create',
  TABLES_UPDATE: '/admin/table/update',
  TABLES_DELETE: '/admin/table/delete',

  // Table Booking Status endpoints
  TABLE_BOOKING_STATUS_GET_ALL: '/admin/table_booking_status/getall',

  // Table Types endpoints
  TABLE_TYPES_GET_ALL: '/admin/table_types/getall',

  // Tax Setup endpoints
  TAX_SETUP_GET_BY_AUTH: '/restaurant/tax_setup/getbyauth',
  TAX_SETUP_GET_BY_ID: '/restaurant/tax_setup/getbyid',
  TAX_SETUP_CREATE: '/restaurant/tax_setup/create',
  TAX_SETUP_UPDATE: '/restaurant/tax_setup/update',
  TAX_SETUP_DELETE: '/restaurant/tax_setup/delete',

  // Payment Type endpoints
  PAYMENT_TYPE_GET_BY_AUTH: '/restaurant/payment_options/auth/my-options',
  PAYMENT_TYPE_CREATE: '/restaurant/payment_options/create',
  PAYMENT_TYPE_UPDATE: '/restaurant/payment_options/update',

  // Invoice endpoints
  INVOICES_GET_BY_AUTH: '/restaurant/invoices/getbyauth',
  INVOICES_GET_BY_ID: '/restaurant/invoices/getbyid',

  // Orders & POS Order endpoints
  ORDERS_GET_MY_ORDERS: '/restaurant/pos_order/my-orders',
  ORDERS_CREATE: '/restaurant/pos_order/create',
  POS_ORDER_MY_ORDERS: '/restaurant/pos_order/my-orders',
  POS_ORDER_CREATE: '/restaurant/pos_order/create',
  POS_ORDER_UPDATE: '/restaurant/pos_order/update',
  POS_ORDER_SEND_TO_KITCHEN: '/restaurant/pos_order/send-to-kitchen',
  POS_ORDER_GET_ALL: '/restaurant/pos_order/getall',
  POS_ORDER_UPDATE_ITEM_STATUS: '/restaurant/pos_order/update-item-status',
  POS_ORDER_UPDATE_STATUS: '/restaurant/pos_order/update-status',
  POS_ORDER_DELETE_ITEM: '/restaurant/pos_order/delete-item',
  POS_ORDER_GET_BY_ID: '/restaurant/pos_order/getbyid',
  POS_ORDER_CURRENT_TABLE: '/restaurant/pos_order/table',

  // Items endpoints
  ITEMS_GET_BY_AUTH: '/admin/items/getbyauth',

  // Addons endpoints
  ADDONS_GET_ALL: '/restaurant/item_addons/getall',

  // Variants endpoints
  VARIANTS_GET_ALL: '/restaurant/item_variants/getall',

  // Customer search endpoint
  CUSTOMERS_SEARCH: '/restaurant/customer/search',

  // Table endpoints (additional)
  TABLES_GET_BY_AUTH: '/admin/table/getbyauth',
  TABLE_BOOKING_STATUS_GET_ALL: '/admin/table_booking_status/getall',

  // Kitchen endpoints
  KITCHEN_GET_BY_AUTH: '/restaurant/Kitchen/getbyauth',
  KITCHEN_CREATE: '/restaurant/kitchen/create',
  KITCHEN_UPDATE: '/restaurant/kitchen/update',
  KITCHEN_GET_BY_ID: '/restaurant/kitchen/get',
  KITCHEN_DELETE: '/restaurant/kitchen/delete',

  // Support Ticket Type endpoints
  SUPPORT_TICKET_TYPE_GET_ALL: '/restaurant/support_ticket_type/getall',

  // Support Ticket endpoints
  SUPPORT_TICKET_GET_ALL: '/restaurant/support_ticket/getall',
  SUPPORT_TICKET_CREATE: '/restaurant/support_ticket/create',

  // Support Ticket Reply endpoints
  SUPPORT_TICKET_REPLY_GET_ALL: '/restaurant/support_ticket_reply/getall',
  SUPPORT_TICKET_REPLY_CREATE: '/restaurant/support_ticket_reply/create',
  SUPPORT_TICKET_REPLY_UPDATE: '/restaurant/support_ticket_reply/update',

  // Floor endpoints
  FLOOR_GET_BY_AUTH: '/admin/floor/getbyauth',
  FLOOR_GET_BY_ID: '/admin/floor/get',
  FLOOR_GET_WITH_TABLES: '/admin/floor/getWithTables',
  FLOOR_CREATE: '/admin/floor/create',
  FLOOR_UPDATE: '/admin/floor/update',
  FLOOR_DELETE: '/admin/floor/delete',

  // Waitlist endpoints
  WAITLIST_GET_ALL: '/restaurant/waitlist/getall',
  WAITLIST_GET_BY_ID: '/restaurant/waitlist/getbyid',
  WAITLIST_NOTIFY: '/restaurant/waitlist/notify',

  // Floor Map endpoints
  FLOOR_MAP_GET_ALL: '/master/floor_map_table/getall',
  FLOOR_MAP_CREATE: '/master/floor_map_table/create',
  FLOOR_MAP_UPDATE: '/master/floor_map_table/update',
  FLOOR_MAP_DELETE: '/master/floor_map_table/delete',
  FLOOR_MAP_GET_BY_FLOOR_ID: '/master/floor_map_table/getTablebyFloorid',

  // Table QR & Scan endpoints
  TABLES_GET_QR: '/admin/table/qr-data',
  TABLES_SCAN: '/admin/table/scan',

  // Reservation endpoints
  RESERVATIONS_GET_BY_ID: '/restaurant/reservations/getbyid',
  SLOTS_GENERATED: '/restaurant/restaurant_slot/generated',

  // Items by ID & Menu QR
  ITEMS_GET_BY_ID: '/admin/items/get',
  STORE_MENU_GENERATE_QR: '/restaurant/store_menu/generate-qr',

  // Subscription Lifecycle endpoints
  SUBSCRIPTION_GET_PURCHASED: '/restaurant/admin_plan_buy_restaurant/getRestaurantSubscriptionPurchased',
  SUBSCRIPTION_AUTO_RENEW: '/restaurant/admin_plan_buy_restaurant/auto-renew',
  SUBSCRIPTION_CHANGE_PLAN: '/restaurant/admin_plan_buy_restaurant/change-plan',

  // Customer Loyalty endpoints
  CUSTOMER_LOYALTY: '/restaurant/customer/loyalty',

  // Employee Search & Statistics
  EMPLOYEE_SEARCH: '/employee/search',
  EMPLOYEE_STATISTICS: '/employee/statistics',

  // Feedback, Responsibility & Reports endpoints
  FEEDBACK_GET_BY_ID: '/master/feedback/get',
  RESPONSIBILITY_CREATE: '/admin/responsibility/create',
  REPORTS_TODAY_ADMIN: '/admin/restaurant-reports/reports_today',

  // Store & Print Settings Save aliases
  STORE_SAVE: '/restaurant/store_details/save',
  PRINT_SETTINGS_SAVE: '/restaurant/print_settings/save',

  // Auth & Public Leads endpoints
  REGISTER_RESTAURANT: '/user/register-restaurant',
  FORGOT_PASSWORD_RESEND_OTP: '/user/forget-password/resend-otp',
  LOGIN_SOCIAL: '/user/login-social',
  TALK_TO_EXPERT: '/admin/posspealist/create',
  PUBLIC_SUBSCRIPTION_PAYMENT: '/master/subscriptions_payment/create',

  // Restaurant Notes endpoints
  RESTAURANT_NOTES: '/restaurant/notes',

  // Website Key Features & Statistics endpoints
  WEBSITE_KEY_FEATURES_PUBLIC: '/admin/website-key-features/public',
  WEBSITE_STATISTICS_PUBLIC: '/admin/website-statistics/public',
  WEBSITE_KEY_FEATURES_GET_ALL: '/admin/website-key-features/getall',
  WEBSITE_KEY_FEATURES_GET_BY_ID: '/admin/website-key-features/getbyid',
  WEBSITE_KEY_FEATURES_CREATE: '/admin/website-key-features/create',
  WEBSITE_KEY_FEATURES_UPDATE: '/admin/website-key-features/update',
  WEBSITE_KEY_FEATURES_DELETE: '/admin/website-key-features/delete',
  WEBSITE_STATISTICS_GET_ALL: '/admin/website-statistics/getall',
  WEBSITE_STATISTICS_CREATE: '/admin/website-statistics/create',
  WEBSITE_STATISTICS_UPDATE: '/admin/website-statistics/update',
  WEBSITE_STATISTICS_DELETE: '/admin/website-statistics/delete'
};

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://pos-backend-7xuw.onrender.com/api/v1';
export const INVOICE_TABLE_HEADERS = [
  'Invoice ID', 'Tokens', 'Date', 'Tax', 'Subtotal', 'Service Charge',
  'Total', 'Delivery Type', 'Customer Type', 'Table', 'Action'
];

