import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AddResponseForm = ({ onClose, onSubmit, ticketId }) => {
  const { t } = useTranslation('support');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Process');

  const statusOptions = ['Pending', 'Open', 'Process', 'Solve', 'Close'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert(t('addResponse.validation'));
      return;
    }
    onSubmit({ response: message, status });
    setMessage('');
    setStatus('Process');
  };

  return (
    <div className="w-full max-w-2xl ml-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[#00000099] font-bold text-2xl cursor-pointer">{t('addResponse.breadcrumb')} </span>
        <span className="text-black font-bold text-2xl">&gt; {t('addResponse.title')}</span>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block font-semibold mb-2">{t('addResponse.ticketStatus')}</label>
          <select
            className="w-full border rounded-md px-4 py-2 text-black focus:outline-none bg-white"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{t(`status.${opt.toLowerCase()}`)}</option>
            ))}
          </select>
        </div>

        <div className="mb-8">
          <label className="block font-semibold mb-2">{t('addResponse.title')}</label>
          <textarea
            className="w-full border rounded-md px-4 py-3 min-h-[120px] text-black placeholder-gray-400 focus:outline-none"
            placeholder={t('addResponse.placeholder')}
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="px-12 py-2 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-[#D32F2F] to-[#6A1B9A] shadow"
          >
            {t('addResponse.submit')}
          </button>
        </div>
        
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="text-[#6A1B9A] font-semibold"
            onClick={onClose}
          >
            {t('addResponse.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResponseForm;
