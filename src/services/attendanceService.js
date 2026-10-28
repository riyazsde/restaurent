import api from '../api/api';

class AttendanceService {
  // Get dashboard data (current shift, worked today, leaves left)
  async getDashboard() {
    try {
      const response = await api.get('/employee/attendance/dashboard');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get attendance history
  async getHistory() {
    try {
      const response = await api.get('/employee/attendance/history');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get leave status
  async getLeaveStatus() {
    try {
      const response = await api.get('/employee/attendance/leave');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Clock in
  async clockIn() {
    try {
      const response = await api.post('/employee/attendance/clock-in');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Clock out
  async clockOut() {
    try {
      const response = await api.post('/employee/attendance/clock-out');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Start break
  async startBreak() {
    try {
      const response = await api.post('/employee/attendance/break/start');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // End break
  async endBreak() {
    try {
      const response = await api.post('/employee/attendance/break/end');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Apply for leave
  async applyLeave(data) {
    try {
      const response = await api.post('/employee/attendance/leave', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel pending leave
  async cancelLeave(id) {
    try {
      const response = await api.patch(`/employee/attendance/leave/${id}/cancel`);
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

const attendanceService = new AttendanceService();
export default attendanceService;
