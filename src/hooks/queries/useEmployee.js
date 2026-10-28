import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import employeeService from '../../services/employeeService';

export const EMPLOYEE_KEYS = {
    STATISTICS: ['employeeStatistics'],
    ROLES: ['employeeRoles'],
    BY_ROLE: (role, search = '') => ['employeesByRole', role, search],
    DETAILS: (id) => ['employeeDetails', id],
    PERFORMANCE: (id) => ['employeePerformance', id],
    RESPONSIBILITIES: ['employeeResponsibilities'],
};

/**
 * Hook to fetch restaurant employee statistics
 */
export const useEmployeeStatistics = (options = {}) => {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.STATISTICS,
        queryFn: async () => {
            const res = await employeeService.getEmployeeStatistics();
            return res?.data || res || null;
        },
        retry: false,
        ...options
    });
};

/**
 * Hook to fetch employee roles by auth (account-access roles)
 */
export const useEmployeeRoles = (options = {}) => {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.ROLES,
        queryFn: async () => {
            const response = await employeeService.getRolesByAuth();
            if (response && (response.success || response.data)) {
                return response.data || response || [];
            }
            return [];
        },
        retry: false,
        ...options
    });
};

/**
 * Hook to fetch employee job roles (GET /api/v1/employee/roles)
 */
export const useJobRoles = (options = {}) => {
    return useQuery({
        queryKey: ['employeeJobRoles'],
        queryFn: async () => {
            const response = await employeeService.getEmployeeRoles();
            if (response && (response.success || response.data)) {
                return response.data || response || [];
            } else if (Array.isArray(response)) {
                return response;
            }
            return [];
        },
        retry: false,
        staleTime: 10 * 60 * 1000,
        ...options
    });
};

/**
 * Hook to fetch employees by role and optional search
 */
export const useEmployeesByRole = (role, searchTerm = '', options = {}) => {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.BY_ROLE(role, searchTerm),
        queryFn: async () => {
            if (searchTerm && searchTerm.trim()) {
                const searchRes = await employeeService.searchEmployees({ query: searchTerm, role });
                const list = searchRes?.data || (Array.isArray(searchRes) ? searchRes : []);
                return Array.isArray(list) ? list : [];
            }
            const empResponse = await employeeService.getEmployeesByRole(role);
            if (empResponse && empResponse.success) {
                return empResponse.data || empResponse.employees || [];
            } else if (Array.isArray(empResponse)) {
                return empResponse;
            }
            return [];
        },
        retry: false,
        ...options
    });
};

/**
 * Hook to fetch single employee details by ID
 */
export const useEmployeeDetails = (id, options = {}) => {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.DETAILS(id),
        queryFn: async () => {
            if (!id) return null;
            const res = await employeeService.getEmployeeById(id);
            return res?.data || res || null;
        },
        enabled: Boolean(id),
        ...options
    });
};

/**
 * Hook to fetch employee performance metrics by ID
 */
export const useEmployeePerformance = (id, options = {}) => {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.PERFORMANCE(id),
        queryFn: async () => {
            if (!id) return null;
            const res = await employeeService.getEmployeePerformance(id);
            return res?.data || res || null;
        },
        enabled: Boolean(id),
        ...options
    });
};

/**
 * Mutation hook to search employees on demand
 */
export const useSearchEmployeesMutation = (options = {}) => {
    return useMutation({
        mutationFn: async (params) => {
            const res = await employeeService.searchEmployees(params);
            return res?.data || (Array.isArray(res) ? res : []);
        },
        ...options
    });
};

/**
 * Hook to create a new employee
 */
export const useCreateEmployee = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => employeeService.createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.ROLES });
            queryClient.invalidateQueries({ queryKey: ['allEmployees'] });
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.STATISTICS });
        },
        ...options
    });
};

/**
 * Hook to create a new responsibility
 */
export const useCreateResponsibility = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => employeeService.createResponsibility(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.RESPONSIBILITIES });
        },
        ...options
    });
};

/**
 * Hook to update an employee
 */
export const useUpdateEmployee = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => employeeService.updateEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.ROLES });
            queryClient.invalidateQueries({ queryKey: ['allEmployees'] });
        },
        ...options
    });
};

/**
 * Hook to delete an employee
 */
export const useDeleteEmployee = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => employeeService.deleteEmployee(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.ROLES });
            queryClient.invalidateQueries({ queryKey: ['allEmployees'] });
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.STATISTICS });
        },
        ...options
    });
};
