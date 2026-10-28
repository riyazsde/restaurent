import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import uiConfigService from '../../services/uiConfigService';

export const UI_CONFIG_QUERY_KEY = 'restaurant_ui_config';

/**
 * Hook to consume localized UI configuration and store currency
 * Consumes GET /api/v1/restaurant/ui-config?locale=${locale}
 */
export const useUiConfig = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const query = useQuery({
    queryKey: [UI_CONFIG_QUERY_KEY, currentLang],
    queryFn: async () => {
      const localeParam = currentLang.startsWith('fr') ? 'fr-FR' : 'en-US';
      const response = await uiConfigService.getUiConfig(localeParam);
      return response?.data || response || {};
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const uiConfig = query.data || {};
  const currency = uiConfig.currency || 'USD';
  const labels = uiConfig.labels || {};
  const orderStatuses = uiConfig.order_statuses || [];
  const dashboardFilters = uiConfig.dashboard_filters || ['this_week', 'this_month', '6_month', 'one_year'];

  const getLabel = (key, fallback = '') => {
    return labels[key] || fallback;
  };

  return {
    ...query,
    uiConfig,
    currency,
    labels,
    orderStatuses,
    dashboardFilters,
    getLabel,
  };
};

export default useUiConfig;
