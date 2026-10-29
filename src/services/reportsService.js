import api from '../api/api';

class ReportsService {
  /**
   * Get report based on period and optional dashboard filter.
   * Accepts an optional custom date range (start_date / end_date) which is
   * forwarded to the endpoint as query params.
   * Normalizes both camelCase and PascalCase keys returned by the backend.
   */
  async getReportByPeriod(period, customFilter = null, startDate = null, endDate = null) {
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

    // Forward custom date range only when both ends are provided
    const params = {};
    if (startDate && endDate) {
      params.start_date = startDate;
      params.end_date = endDate;
    }

    try {
      const [periodRes, dashRes] = await Promise.allSettled([
        api.get(endpoint, { params }),
        api.get('/restaurant/reports/dashboard', { params: { filter: dashFilter } })
      ]);

      const unwrap = (res) => {
        if (res.status !== 'fulfilled') return {};
        const body = res.value?.data;
        if (body && typeof body === 'object') {
          return body.data && typeof body.data === 'object' ? body.data : body;
        }
        return {};
      };

      const periodData = unwrap(periodRes);
      const dashData = unwrap(dashRes);

      const pickArray = (...candidates) => {
        for (const c of candidates) {
          if (Array.isArray(c) && c.length > 0) return c;
        }
        return [];
      };

      const topSellers = pickArray(
        dashData.TopSellers,
        dashData.topSellers,
        periodData.topSellers,
        periodData.TopSellers
      );

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

  async getDailyRestaurantReports() {
    return this.getReportByPeriod('Today');
  }

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