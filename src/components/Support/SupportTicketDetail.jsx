import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddResponseForm from './AddResponseModal';
import { getCookie } from '../../utils/cookies';
import Loader from '../common/Loader';
import { useTickets, useTicketById, useTicketReplies, useTicketTypes, useCreateTicketReply } from '../../hooks/queries/useSupport';

const SupportTicketDetail = () => {
  const { id: ticketId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('support');
  const [showAddResponse, setShowAddResponse] = useState(false);

  // TanStack React Query
  const { data: tickets = [], isLoading: isTicketsLoading } = useTickets();
  const { data: specificTicket, isLoading: isSpecificTicketLoading } = useTicketById(ticketId);
  const { data: allReplies = [], isLoading: isRepliesLoading } = useTicketReplies(ticketId);
  const { data: ticketTypes = [] } = useTicketTypes();
  const createReplyMutation = useCreateTicketReply();

  const ticket = tickets.find(t => t.support_ticket_id === parseInt(ticketId)) || specificTicket || null;
  const replies = allReplies.filter(r => !ticketId || r.support_ticket_id === parseInt(ticketId));
  const isLoading = isTicketsLoading || isRepliesLoading || isSpecificTicketLoading;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTicketTypeName = (typeId) => {
    const type = ticketTypes.find(t => t.support_ticket_type_id === typeId);
    return type ? type.Name : 'General';
  };

  const handleAddResponse = () => setShowAddResponse(true);
  const handleCloseAddResponse = () => setShowAddResponse(false);
  
  const handleSubmitResponse = async (data) => {
    try {
      const cookieData = getCookie('user_data') || '{}';
      let userData = {};
      
      try {
        userData = JSON.parse(cookieData);
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        userData = { user_id: 1 }; // Fallback to default user_id
      }
      
      const replyData = {
        support_ticket_id: parseInt(ticketId),
        reply: data.response,
        employee_id: userData.user_id || 1,
        Ticket_status: data.status,
        Status: true
      };

      const response = await createReplyMutation.mutateAsync(replyData);
      if (response && response.success !== false) {
        toast.success(t('ticketDetail.success'));
        setShowAddResponse(false);
      } else {
        toast.error(response?.message || t('ticketDetail.error'));
      }
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error(t('ticketDetail.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 min-h-screen bg-white">
        <Loader text={t('ticketDetail.loading')} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 md:p-10 min-h-screen bg-white">
        <div className="text-center py-10">{t('ticketDetail.notFound')}</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {showAddResponse ? (
        <div className="max-w-2xl mx-auto">
          <AddResponseForm
            onClose={handleCloseAddResponse}
            onSubmit={handleSubmitResponse}
            ticketId={ticket.ticketNumber}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <span 
              className="text-[#00000099] font-bold text-[32px] cursor-pointer"
              onClick={() => navigate('/support/tickets')}
            >
              {t('ticketDetail.breadcrumb')} &gt;
            </span>
            <span className="text-black font-bold text-[32px]">{t('ticketDetail.allTicket')}</span>
          </div>
          
          {/* Ticket Summary */}
          <div className="rounded-2xl bg-[#F8EAEE] p-8 flex flex-col md:flex-row md:justify-between mb-8">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="font-bold">{t('ticketDetail.requestor')}</span>
                <span className="font-bold">{ticket.Customer?.Name || 'Customer'} - {ticket.Customer?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">{t('ticketDetail.subject')}</span>
                <span className="font-bold">{getTicketTypeName(ticket.support_ticket_type_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">{t('ticketDetail.createdOn')}</span>
                <span className="font-bold">{formatDate(ticket.CreateAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">{t('ticketDetail.ticketId')}</span>
                <span className="font-bold">TKT-{ticket.support_ticket_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">{t('ticketDetail.ticketStatus')}</span>
                <span className={`font-bold ${
                  ticket.Ticket_status === 'Pending' ? 'text-[#FF9500]' :
                  ticket.Ticket_status === 'Open' ? 'text-[#007AFF]' :
                  ticket.Ticket_status === 'Process' ? 'text-[#F8A534]' :
                  ticket.Ticket_status === 'Solve' ? 'text-[#34C759]' :
                  ticket.Ticket_status === 'Close' ? 'text-[#8E8E93]' : 'text-[#007AFF]'
                }`}>
                  {ticket.Ticket_status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Conversation */}
          <div className="flex flex-col gap-6">
            {/* Original Ticket Question */}
            <div className="w-full rounded-xl border bg-white p-4 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                  {ticket.Customer?.Name?.charAt(0) || 'C'}
                </div>
                <span className="font-bold text-base">{ticket.Customer?.Name || 'Customer'}</span>
                <span className="text-sm text-gray-500 ml-auto">{formatTime(ticket.CreateAt)}</span>
              </div>
              <div className="text-black font-normal text-base">
                {ticket.question}
              </div>
            </div>

            {/* Replies */}
            {replies.map((reply) => (
              <div
                key={reply.support_ticket_reply_id}
                className="w-full rounded-xl border bg-[#F8EAEE] p-4 flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="font-bold text-base">{reply.Employee?.Name || 'Support Team'}</span>
                  <span className="text-sm text-gray-500 ml-auto">{formatTime(reply.CreateAt)}</span>
                </div>
                <div className="text-black font-normal text-base">
                  {reply.reply}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    reply.Ticket_status === 'Pending' ? 'bg-[#FF9500] text-white' :
                    reply.Ticket_status === 'Open' ? 'bg-[#007AFF] text-white' :
                    reply.Ticket_status === 'Process' ? 'bg-[#F8A534] text-white' :
                    reply.Ticket_status === 'Solve' ? 'bg-[#34C759] text-white' :
                    reply.Ticket_status === 'Close' ? 'bg-[#8E8E93] text-white' : 'bg-[#007AFF] text-white'
                  }`}>
                    {t('ticketDetail.status')} {reply.Ticket_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Response Button */}
          <div className="flex justify-center mt-10">
            <button
              className="px-12 py-2 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-[#D32F2F] to-[#6A1B9A] shadow"
              onClick={handleAddResponse}
            >
              {t('ticketDetail.addResponse')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportTicketDetail;
