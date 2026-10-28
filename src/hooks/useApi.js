import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiFactory } from '../core/ApiFactory';

/**
 * useApiMutation is a factory hook for all POST/PUT/DELETE requests.
 * @param {string} type - The API type identifier (e.g. 'CONTACT', 'PAYMENT')
 * @param {object} options - Tanstack React Query mutation options (onSuccess, onError, etc)
 */
export const useApiMutation = (type, options = {}) => {
  return useMutation({
    mutationFn: (payload) => ApiFactory(type, payload),
    ...options,
  });
};

/**
 * useApiQuery is a factory hook for all GET requests.
 * @param {string} type - The API type identifier
 * @param {object} params - Parameters to send with the GET request
 * @param {object} options - Tanstack React Query query options
 */
export const useApiQuery = (type, params = {}, options = {}) => {
  return useQuery({
    queryKey: [type, params],
    queryFn: () => ApiFactory(type, params),
    ...options,
  });
};
