import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Inbox, Ticket as TicketIcon } from "lucide-react";
import Loader from "../common/Loader";
import { useTickets, useTicketTypes } from "../../hooks/queries/useSupport";
import useAuthStore from "../../store/authStore";

const DEFAULT_TICKETS = [
  {
    support_ticket_id: '2023-CS123',
    Ticket_status: 'On-Going',
    CreateAt: '2025-03-02T00:45:00.000Z',
    formattedTime: 'Posted at 12:45 AM',
    displaySubject: 'How to deposit money to my portal?',
    displayDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    restaurantName: 'Chinese Cusine Restaurant'
  },
  {
    support_ticket_id: '2023-CS124',
    Ticket_status: 'New',
    CreateAt: '2025-03-02T00:45:00.000Z',
    formattedTime: 'Posted at 12:45 AM',
    displaySubject: 'How to deposit money to my portal?',
    displayDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    restaurantName: 'Chinese Cusine Restaurant'
  }
];

const SupportTickets = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('support');
  const { user } = useAuthStore();

  const [filter, setFilter] = useState("On-Going");
  const [period, setPeriod] = useState("week");
  const [search, setSearch] = useState("");

  const { data: serverTickets = [], isLoading } = useTickets();
  const { data: ticketTypes = [] } = useTicketTypes();

  const tabConfig = [
    { key: "all", label: t('tickets.tabs.all', 'All Tickets'), icon: Inbox },
    { key: "On-Going", label: t('tickets.tabs.onGoing', 'On-Going'), icon: TicketIcon },
    { key: "Resolved", label: t('tickets.tabs.resolved', 'Resolved'), icon: Inbox },
  ];

  const defaultRestaurantName = user?.restaurant_name || user?.businessName || user?.Name || 'Chinese Cusine Restaurant';

  const allTickets = useMemo(() => {
    if (serverTickets && serverTickets.length > 0) {
      return serverTickets.map(ticket => {
        let subject = '';
        let description = '';
        const rawQ = ticket.question || '';

        if (rawQ.includes(']') && rawQ.startsWith('[')) {
          const parts = rawQ.split(']');
          subject = parts[0].replace('[', '').trim();
          description = parts.slice(1).join(']').trim();
        } else if (rawQ.includes('\n')) {
          const lines = rawQ.split('\n').filter(l => l.trim().length > 0);
          subject = lines[0];
          description = lines.slice(1).join('\n') || lines[0];
        } else {
          subject = rawQ.length > 50 ? (rawQ.slice(0, 50) + '...') : rawQ;
          description = rawQ;
        }

        const dateObj = new Date(ticket.CreateAt || Date.now());
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedTime = `${t('tickets.postedAt', 'Posted at')} ${timeStr}`;

        return {
          ...ticket,
          formattedTime,
          displaySubject: subject || 'Support Request',
          displayDescription: description || rawQ || 'No description provided.',
          restaurantName: ticket.Customer?.Name || ticket.CreateBy?.Name || defaultRestaurantName
        };
      });
    }
    return DEFAULT_TICKETS.map(tkt => ({
      ...tkt,
      formattedTime: `${t('tickets.postedAt', 'Posted at')} 12:45 AM`
    }));
  }, [serverTickets, defaultRestaurantName, t]);

  const getStatusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('open')) return t('tickets.tabs.open', 'Open');
    if (s.includes('process')) return t('tickets.tabs.process', 'In Process');
    if (s.includes('pending')) return t('tickets.tabs.pending', 'Pending');
    if (s.includes('solve') || s.includes('resolve')) return t('tickets.tabs.solved', 'Resolved');
    if (s.includes('close')) return t('tickets.tabs.closed', 'Closed');
    if (s.includes('on-going')) return t('tickets.tabs.onGoing', 'On-Going');
    return status;
  };

  const filteredTickets = useMemo(() => {
    return allTickets.filter(ticket => {
      const status = (ticket.Ticket_status || '').toLowerCase();
      const currentFilter = filter.toLowerCase();
      
      let matchesFilter = true;
      if (currentFilter === 'all') {
        matchesFilter = true;
      } else if (currentFilter === 'on-going') {
        matchesFilter = status.includes('on-going') || status.includes('pending') || status.includes('open') || status.includes('new') || status.includes('process');
      } else if (currentFilter === 'resolved') {
        matchesFilter = status.includes('resolve') || status.includes('solve') || status.includes('close');
      }

      const q = search.toLowerCase();
      const matchesSearch = !search ||
        (ticket.displaySubject || '').toLowerCase().includes(q) ||
        (ticket.displayDescription || '').toLowerCase().includes(q) ||
        String(ticket.support_ticket_id).toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [allTickets, filter, search]);

  const activeHeaderTitle = useMemo(() => {
    if (filter === 'On-Going') return t('tickets.ongoingTicket', 'Ongoing Ticket');
    if (filter === 'Resolved') return t('tickets.resolvedTicket', 'Resolved Ticket');
    return t('tickets.allTickets', 'All Tickets');
  }, [filter, t]);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white" style={{ fontFamily: 'Poppins' }}>
      {/* Header */}
      <h1 className="text-2xl sm:text-[32px] font-bold mb-8 flex items-center gap-2">
        <span 
          className="text-[#00000099] cursor-pointer hover:text-black transition-colors" 
          onClick={() => navigate('/support')}
        >
          {t('tickets.breadcrumb', 'Support Ticket')} &gt;
        </span>
        <span className="text-black font-bold">
          {activeHeaderTitle}
        </span>
      </h1>

      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('tickets.searchPlaceholder', 'Search for ticket')}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-[#FAF5F8] text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 shadow-xs placeholder-gray-400 text-gray-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            className="border border-gray-300 rounded-xl px-4 py-2 bg-white text-sm font-medium text-gray-800 focus:outline-none shadow-xs cursor-pointer"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">{t('tickets.periods.week', 'This Week')}</option>
            <option value="day">{t('tickets.periods.day', 'Today')}</option>
            <option value="month">{t('tickets.periods.month', 'This Month')}</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 sm:gap-10 border-b border-gray-100 mb-8 pb-1">
        {tabConfig.map((tab) => {
          const isActive = filter === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`flex items-center gap-2 font-semibold text-sm sm:text-base pb-3 relative transition-all cursor-pointer ${
                isActive ? "text-[#FFA000]" : "text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setFilter(tab.key)}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFA000] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Ticket List */}
      <div className="flex flex-col gap-6 max-w-5xl">
        {isLoading ? (
          <Loader text={t('tickets.loading', 'Loading tickets...')} />
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-medium">
            {t('tickets.noTickets', 'No tickets found.')}
          </div>
        ) : (
          filteredTickets.map((ticket, index) => {
            const status = ticket.Ticket_status || 'On-Going';
            const isOrange = !status.toLowerCase().includes('resolve') && !status.toLowerCase().includes('close') && !status.toLowerCase().includes('solve');
            const ticketIdFormatted = String(ticket.support_ticket_id).includes('-')
              ? ticket.support_ticket_id
              : `2023-CS${ticket.support_ticket_id}`;

            return (
              <div
                key={ticket.support_ticket_id || ticket._id || index}
                className="rounded-[24px] p-6 sm:p-7 bg-[#FAF5F8] border border-[#F2E7EE] shadow-xs flex flex-col gap-2 relative transition-all hover:shadow-sm"
              >
                {/* Header row: Left Dot + Ticket#, Right Posted Time + Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FFA000] flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base text-black">
                      {t('tickets.ticketPrefix', 'Ticket#')} {ticketIdFormatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 text-xs sm:text-sm">
                      {ticket.formattedTime || 'Posted at 12:45 AM'}
                    </span>
                    <div
                      className={`flex items-center gap-1.5 px-3.5 py-1 rounded-xl font-semibold text-xs text-white shadow-xs ${
                        isOrange ? "bg-[#FFA000]" : "bg-[#2E7D32]"
                      }`}
                    >
                      <Clock size={13} />
                      <span>{getStatusLabel(status)}</span>
                    </div>
                  </div>
                </div>

                {/* Subject / Title */}
                <h3 className="font-bold text-base sm:text-lg text-black mt-2 mb-1">
                  {ticket.displaySubject}
                </h3>

                {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
                  {ticket.displayDescription}
                </p>

                {/* Divider */}
                <hr className="border-t border-[#F0DFEA] my-1" />

                {/* Footer: Restaurant/Customer & Open Ticket */}
                <div className="flex items-center justify-between mt-2 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#D84315] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                      {ticket.restaurantName?.charAt(0) || 'C'}
                    </div>
                    <span className="text-sm font-bold text-black truncate max-w-[260px] sm:max-w-none">
                      {ticket.restaurantName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/support/tickets/${ticket.support_ticket_id}`)}
                    className="text-[#C2185B] hover:text-[#AD1457] font-semibold text-sm hover:underline cursor-pointer"
                  >
                    {t('tickets.openTicket', 'Open Ticket')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SupportTickets;
