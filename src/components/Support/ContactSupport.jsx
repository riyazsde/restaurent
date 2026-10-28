import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import FAQAccordion from "./FAQAccordion";
import SendMailModal from "./SendMailModal";
import { useFaqs } from "../../hooks/queries/useSupport";
import Loader from "../common/Loader";

const ContactSupport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('support');
  const [showMailModal, setShowMailModal] = useState(false);

  // TanStack React Query
  const { data: rawFaqs = [], isLoading } = useFaqs();

  const defaultSections = useMemo(() => [
    {
      heading: t('contactSupport.faqSections.ordersReservations', 'Orders & Reservations'),
      items: [
        {
          id: 'faq-ord-1',
          question: "I don't need a brand strategist but I need help executing an upcoming campaign. Can we still work together?",
          answer: "Yes, our team can help you execute and manage specific promotional campaigns, integrate discount rules, and track campaign ROI directly through our POS and dashboard."
        },
        {
          id: 'faq-ord-2',
          question: "I don't need a brand strategist but I need help executing an upcoming campaign. Can we still work together?",
          answer: "Yes, our team is equipped to handle campaign execution, menu promotion setup, and loyalty triggers seamlessly."
        }
      ]
    },
    {
      heading: t('contactSupport.faqSections.invoicesFeedbacks', 'Invoices & Feed Backs'),
      items: [
        {
          id: 'faq-inv-1',
          question: "I don't need a brand strategist but I need help executing an upcoming campaign. Can we still work together?",
          answer: "Yes, invoice generation, customer feedback forms, and review aggregation are fully supported across all restaurant outlets."
        },
        {
          id: 'faq-inv-2',
          question: "I don't need a brand strategist but I need help executing an upcoming campaign. Can we still work together?",
          answer: "Yes, we support custom integrations and direct feedback analytics to power your customer retention efforts."
        }
      ]
    }
  ], [t]);

  const faqs = useMemo(() => {
    if (rawFaqs && rawFaqs.length > 0) {
      return [{
        heading: t('contactSupport.faqHeading'),
        items: rawFaqs.map(faq => ({
          id: faq.faq_in_id,
          question: faq.faq_question,
          answer: faq.faq_answer
        }))
      }];
    }
    return defaultSections;
  }, [rawFaqs, defaultSections, t]);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white" style={{ fontFamily: 'Poppins' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-black font-bold text-2xl sm:text-[32px]">
          {t('contactSupport.title')}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-8 max-w-5xl">
        {/* Top Row: Need Help Card and Email Pill */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
          <div className="border border-gray-300 rounded-[24px] p-6 flex-1 max-w-[420px] bg-white shadow-xs">
            <h2 className="font-bold text-xl text-black mb-2">{t('contactSupport.needHelp')}</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('contactSupport.helpDescription')}
              <br />
              <span className="font-bold text-black">{t('contactSupport.mail')} hi@uiflow.in</span>
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setShowMailModal(true)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-base shadow hover:opacity-95 transition-all cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)' }}
            >
              <Mail className="w-5 h-5 text-white" />
              hi@uiflow.in
            </button>
          </div>
        </div>

        {/* Support Ticket Card */}
        <div className="max-w-[420px] border border-gray-300 rounded-[24px] p-8 flex flex-col items-center bg-white shadow-xs text-center">
          <h2 className="font-bold text-2xl text-black mb-6">{t('contactSupport.supportTicket')}</h2>
          <button
            className="w-full max-w-xs py-3 rounded-xl font-semibold text-white text-base mb-4 shadow hover:opacity-95 transition-opacity cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)' }}
            onClick={() => navigate("/support/create-ticket")}
          >
            {t('contactSupport.createTicket')}
          </button>
          
          <button
            className="w-full max-w-xs py-2.5 rounded-xl font-semibold text-gray-800 border-2 border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer text-base"
            onClick={() => navigate("/support/tickets")}
          >
            {t('contactSupport.viewRaisedTicket')}
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">
            {t('contactSupport.faqs')}
          </h2>
          {isLoading ? (
            <Loader text={t('contactSupport.loadingFaqs')} />
          ) : (
            <FAQAccordion sections={faqs} />
          )}
        </div>
      </div>

      {/* Send Mail Modal */}
      <SendMailModal
        isOpen={showMailModal}
        onClose={() => setShowMailModal(false)}
        email="hi@uiflow.in"
      />
    </div>
  );
};

export default ContactSupport;
