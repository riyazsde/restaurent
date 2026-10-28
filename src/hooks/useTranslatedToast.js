import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for displaying translated toast notifications
 * @returns {Object} Toast methods with translation support
 */
const useTranslatedToast = () => {
  const { t } = useTranslation('common');

  return {
    success: (messageKey, options = {}) => {
      const message = messageKey.includes('.') ? t(messageKey) : messageKey;
      toast.success(message, options);
    },
    
    error: (messageKey, options = {}) => {
      const message = messageKey.includes('.') ? t(messageKey) : messageKey;
      toast.error(message, options);
    },
    
    info: (messageKey, options = {}) => {
      const message = messageKey.includes('.') ? t(messageKey) : messageKey;
      toast.info(message, options);
    },
    
    warning: (messageKey, options = {}) => {
      const message = messageKey.includes('.') ? t(messageKey) : messageKey;
      toast.warning(message, options);
    },
    
    // Direct access to translation function for custom messages
    t
  };
};

export default useTranslatedToast;
