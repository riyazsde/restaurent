import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, X } from 'lucide-react';
import { toast } from 'react-toastify';

const SendMailModal = ({ isOpen, onClose, email = "hi@uiflow.in" }) => {
  const { t } = useTranslation('support');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success(t('sendMail.copySuccess'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDefaultMailApp = () => {
    window.location.href = `mailto:${email}`;
  };

  const handleGmailApp = () => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[24px] sm:rounded-[28px] p-7 sm:p-8 w-full max-w-[480px] relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: 'Poppins' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-black transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <Mail className="w-6 h-6 text-black stroke-[1.8]" />
          <h2 className="text-xl sm:text-2xl font-bold text-black">{t('sendMail.title')}</h2>
        </div>

        {/* Email Input with Copy Button */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 border border-purple-500 rounded-xl px-4 py-2.5 bg-white text-sm sm:text-base font-medium text-black truncate select-all">
            {email}
          </div>
          <button
            onClick={handleCopy}
            className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm shadow hover:opacity-95 transition-all cursor-pointer flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, #7B1FA2 0%, #C2185B 100%)'
            }}
          >
            {copied ? t('sendMail.copied') : t('sendMail.copy')}
          </button>
        </div>

        {/* Centered OR */}
        <div className="text-center text-gray-600 text-sm font-normal my-4">
          {t('sendMail.or')}
        </div>

        {/* Mail App Buttons */}
        <div className="flex flex-col gap-3">
          {/* Default Mail App */}
          <button
            onClick={handleDefaultMailApp}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base shadow hover:opacity-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            style={{
              background: 'linear-gradient(180deg, #7B1FA2 0%, #C2185B 100%)'
            }}
          >
            <Mail className="w-5 h-5 text-white stroke-[1.8]" />
            <span>{t('sendMail.defaultApp')}</span>
          </button>

          {/* Gmail Mail App */}
          <button
            onClick={handleGmailApp}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base shadow hover:opacity-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            style={{
              background: 'linear-gradient(180deg, #7B1FA2 0%, #C2185B 100%)'
            }}
          >
            <Mail className="w-5 h-5 text-white stroke-[1.8]" />
            <span>{t('sendMail.gmailApp')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMailModal;
