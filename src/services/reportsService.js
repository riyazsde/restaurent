import api from '../api/api';

class ReportsService {
  // Get report based on period and optional dashboard filter
  async getReportByPeriod(period, customFilter = null) {
    let endpoint = '/restaurant/reports/reports_today';
    let dashFilter = customFilter || 'week';

    switch (period) {
      case 'Today':
        endpoint = '/restaurant/reports/reports_today';
        dashFilter = customFilter || 'week';
        break;
      case 'This Month':
        endpoint = '/restaurant/reports/reports_month';
        dashFilter = customFilter || 'month';
        break;
      case 'Six Month':
        endpoint = '/restaurant/reports/reports_six_month';
        dashFilter = customFilter || 'year';
        break;
      case 'One Year':
        endpoint = '/restaurant/reports/reports_one_year';
        dashFilter = customFilter || 'year';
        break;
      default:
        endpoint = '/restaurant/reports/reports_today';
        dashFilter = customFilter || 'week';
    }

    try {
      const [periodRes, dashRes] = await Promise.allSettled([
        api.get(endpoint),
        api.get('/restaurant/reports/dashboard', { params: { filter: dashFilter } })
      ]);

      const periodData = periodRes.status === 'fulfilled' ? (periodRes.value?.data?.data || periodRes.value?.data || {}) : {};
      const dashData = dashRes.status === 'fulfilled' ? (dashRes.value?.data?.data || dashRes.value?.data || {}) : {};

      // Combine period metrics with dashboard top sellers if period top sellers is empty
      const topSellers = (dashData.TopSellers && dashData.TopSellers.length > 0)
        ? dashData.TopSellers
        : (periodData.topSellers || []);

      return {
        ...dashData,
        ...periodData,
        TopSellers: topSellers,
        dashboardData: dashData
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get dashboard metrics with filter (week, month, year)
  async getDashboard(filter = 'week') {
    try {
      const response = await api.get('/restaurant/reports/dashboard', {
        params: { filter }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get restaurant-dashboard metrics with filter (this_week, this_month, 6_month, one_year)
  async getRestaurantDashboard(filter = 'this_week') {
    try {
      const response = await api.get('/restaurant/reports/restaurant-dashboard', {
        params: { filter }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get daily restaurant reports metrics
  async getDailyRestaurantReports() {
    return this.getReportByPeriod('Today');
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
}

export default new ReportsService();
