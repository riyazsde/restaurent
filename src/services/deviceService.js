import api from '../api/api';

class DeviceService {
  async getDevicesByAuth() {
    try {
      const response = await api.get('/master/myDevices/getbyauth');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all devices across the platform (Admin)
  async getAllDevices() {
    try {
      const response = await api.get('/master/myDevices/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Register physical terminal / hardware device (POST /master/myDevices/create)
  async createDevice(deviceData) {
    try {
      const response = await api.post('/master/myDevices/create', deviceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Enrol Android Bridge / rotate token (POST /master/myDevices/:deviceId/bridge/rotate-token)
  async rotateBridgeToken(deviceId) {
    try {
      const response = await api.post(`/master/myDevices/${deviceId}/bridge/rotate-token`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lock Device (POST /master/myDevices/:deviceId/lock)
  async lockDevice(deviceId, reason = 'Device reported lost') {
    try {
      const response = await api.post(`/master/myDevices/${deviceId}/lock`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Restart Device (POST /master/myDevices/:deviceId/restart)
  async restartDevice(deviceId, options = {}) {
    try {
      const payload = {
        Restart_Reason: options.Restart_Reason || 'Apply configuration changes',
        Scheduled_Restart: options.Scheduled_Restart || new Date().toISOString(),
        Restart_Queue: options.Restart_Queue || 'maintenance',
        Restart_Success_Confirmation: options.Restart_Success_Confirmation || 'Required',
        Auto_Recovery_Mode: options.Auto_Recovery_Mode !== undefined ? options.Auto_Recovery_Mode : true
      };
      const response = await api.post(`/master/myDevices/${deviceId}/restart`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Device Push Update (POST /master/myDevices/:deviceId/push-update)
  async pushUpdate(deviceId, appVersion = 'v3.2.2') {
    try {
      const response = await api.post(`/master/myDevices/${deviceId}/push-update`, {
        App_Version: appVersion
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Remote Wipe Device (POST /master/myDevices/:deviceId/wipe)
  async remoteWipe(deviceId, wipeData) {
    try {
      const response = await api.post(`/master/myDevices/${deviceId}/wipe`, wipeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Session Logs (GET /master/myDevices/:deviceId/session-logs)
  async getSessionLogs(deviceId) {
    try {
      const response = await api.get(`/master/myDevices/${deviceId}/session-logs`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export Session Logs (GET /master/myDevices/:deviceId/session-logs/export)
  async exportSessionLogs(deviceId) {
    try {
      const response = await api.get(`/master/myDevices/${deviceId}/session-logs/export`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete Device (DELETE /master/myDevices/delete/:deviceId)
  async deleteDevice(deviceId) {
    try {
      const response = await api.delete(`/master/myDevices/delete/${deviceId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
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

export default new DeviceService();
