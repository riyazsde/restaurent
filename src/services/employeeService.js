import api from '../api/api';

class EmployeeService {
  // Get all roles by auth (account-level roles)
  async getRolesByAuth() {
    try {
      const response = await api.get('/admin/role/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get job roles from Employee schema enum (GET /api/v1/employee/roles)
  async getEmployeeRoles() {
    try {
      const response = await api.get('/employee/roles');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get role by ID (GET /api/v1/admin/role/getbyid/:id or /get/:id)
  async getRoleById(id) {
    try {
      try {
        const response = await api.get(`/admin/role/getbyid/${id}`);
        return response.data;
      } catch (err) {
        const fallback = await api.get(`/admin/role/get/${id}`);
        return fallback.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user by auth (to get restaurant ID)
  async getUserByAuth() {
    try {
      const response = await api.get('/user/getbyauth');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all employees
  async getAllEmployees() {
    try {
      const response = await api.get('/employee/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get employees by role name or ID
  async getEmployeesByRole(role) {
    try {
      const response = await api.get(`/employee/role/${role}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get responsibilities by auth
  async getResponsibilitiesByAuth() {
    try {
      const response = await api.get('/admin/responsibility/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get languages by auth
  async getLanguagesByAuth() {
    try {
      const response = await api.get('/admin/language/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all countries
  async getAllCountries() {
    try {
      const response = await api.get('/admin/country/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get states by country
  async getStatesByCountry(countryId) {
    try {
      const response = await api.get(`/admin/state/getbycountry/${countryId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get cities by state
  async getCitiesByState(stateId) {
    try {
      const response = await api.get(`/admin/city/bystate/${stateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create employee
  async createEmployee(employeeData) {
    try {
      const response = await api.post('/employee/create', employeeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get employee by ID
  async getEmployeeById(id) {
    try {
      const response = await api.get(`/employee/get/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get employee performance by ID
  async getEmployeePerformance(id) {
    try {
      const response = await api.get(`/restaurant/reports/employee-performance/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update employee
  async updateEmployee(employeeData) {
    try {
      const response = await api.put('/employee/update', employeeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete employee
  async deleteEmployee(id) {
    try {
      const response = await api.delete(`/employee/delete/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search employees by term
  async searchEmployees(query) {
    try {
      const response = await api.get(`/employee/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get employee role summary / statistics
  async getEmployeeStatistics() {
    try {
      const response = await api.get('/employee/statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create staff responsibility
  async createResponsibility(responsibilityData) {
    try {
      const response = await api.post('/admin/responsibility/create', responsibilityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
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

export default new EmployeeService();
