import { useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import { toast } from 'react-toastify';
import { useTicketTypes, useCreateTicket } from '../../hooks/queries/useSupport';
import { useCustomers } from '../../hooks/queries/useCustomers';
import useAuthStore from '../../store/authStore';

const CreateSupportTicket = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('support');
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);

  const postedTime = useMemo(() => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${t('createTicket.postedAt', 'Posted at')} ${time}`;
  }, [t]);

  const [formData, setFormData] = useState({
    email: user?.email || "AOHBars@gmail.com",
    businessName: user?.restaurant_name || user?.businessName || user?.Name || "AOH BARS",
    subject: "",
    question: "",
    support_ticket_type_id: "",
    customer_id: "",
    Ticket_status: "Open",
    Status: true
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const { data: ticketTypes = [] } = useTicketTypes();
  const { data: customers = [] } = useCustomers();
  const createTicketMutation = useCreateTicket();
  const loading = createTicketMutation.isPending;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadedFiles(files);
      toast.success(`${files.length} image(s) selected`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullQuestion = formData.subject 
      ? `[${formData.subject}] ${formData.question}`
      : formData.question;

    if (!formData.question.trim() && !formData.subject.trim()) {
      toast.error(t('createTicket.validation.issue'));
      return;
    }

    // Default to first ticket type and customer if not selected
    const typeId = formData.support_ticket_type_id || ticketTypes[0]?.support_ticket_type_id || 1;
    const customerId = formData.customer_id || customers[0]?.Customer_id || 1;

    try {
      const ticketData = {
        support_ticket_type_id: parseInt(typeId),
        customer_id: parseInt(customerId),
        question: fullQuestion,
        Ticket_status: formData.Ticket_status,
        Status: formData.Status
      };

      const response = await createTicketMutation.mutateAsync(ticketData);
      if (response && response.success !== false) {
        toast.success(t('createTicket.success'));
        navigate('/support/tickets');
      } else {
        toast.error(response?.message || t('createTicket.error'));
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(t('createTicket.genericError'));
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white" style={{ fontFamily: 'Poppins' }}>
      {/* Header */}
      <h1 className="text-2xl sm:text-[32px] font-bold mb-8 flex items-center gap-2">
        <span
          className="text-[#00000099] cursor-pointer hover:text-black transition-colors"
          onClick={() => navigate('/support')}
        >
          {t('createTicket.breadcrumb', 'Support Ticket')}
        </span>
        <span className="text-black font-bold">&gt;</span>
        <span className="text-black font-bold">
          {t('createTicket.title', 'Create Support Ticket')}
        </span>
      </h1>

      {/* Main Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] bg-[#FAF5F8] border border-[#F2E7EE] p-6 sm:p-10 max-w-5xl shadow-xs"
      >
        {/* Ticket Header Metadata */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium mb-6">
          <span className="font-semibold text-black">Ticket# 2023-CS123</span>
          <span className="text-gray-600">{postedTime}</span>
        </div>

        {/* Row 1: Email and Business Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              {t('createTicket.email', 'Email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              {t('createTicket.businessName', 'Business Name')}
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-[8px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />
          </div>
        </div>

        {/* Row 2: Reply Ticket (Subject + Textarea) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-1.5">
            {t('createTicket.replyTicket', 'Reply Ticket')}
          </label>
          <div className="border border-gray-300 rounded-[12px] bg-white p-4 focus-within:ring-2 focus-within:ring-purple-400">
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder={t('createTicket.subjectPlaceholder', 'Enter Subject....')}
              className="w-full text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-2 focus:outline-none placeholder-gray-400"
            />
            <textarea
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              placeholder={t('createTicket.explainPlaceholder', 'Explain here...')}
              className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none min-h-[120px]"
              required
            />
          </div>
        </div>

        {/* Row 3: Images Uploaded */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-800 mb-1.5">
            {t('createTicket.imagesUploaded', 'Images Uploaded')}
          </label>
          <div className="flex items-center gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 border border-gray-300 rounded-[8px] bg-white px-3 py-2 cursor-pointer hover:border-purple-400 transition-colors"
            >
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white shadow-xs"
                style={{ background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)' }}
              >
                <span>{t('createTicket.uploadImg', 'Upload Img')}</span>
                <ImageIcon size={14} />
              </button>
              {uploadedFiles.length > 0 && (
                <span className="text-xs text-gray-600 font-medium">
                  {uploadedFiles.length} file(s) attached
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-3 rounded-xl font-semibold text-white text-base shadow hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)' }}
          >
            {loading ? t('createTicket.submitting', 'Submitting...') : t('createTicket.submit', 'Submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupportTicket;
