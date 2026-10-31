import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFilter, FiChevronDown } from 'react-icons/fi';
import { BiExport } from 'react-icons/bi';
import { FaUsers, FaPen, FaRegCalendarTimes, FaTrash } from 'react-icons/fa';
import { MdOutlineTableRestaurant } from 'react-icons/md';
import { IoCheckmarkCircle, IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import reservationService from '../../services/reservationService';
import {
    useReservations,
    useSlots,
    useGeneratedSlots,
    useCreateReservation,
    useUpdateReservation,
    useDeleteReservation,
    useSearchReservationsMutation,
    useGetReservationByIdMutation,
    useGetGeneratedSlotsMutation,
    useCreateSlots,
    useUpdateSlots,
    useDeleteSlot
} from '../../hooks/queries/useReservations';
import { useCustomers, useCreateCustomer } from '../../hooks/queries/useCustomers';
import { useFloors } from '../../hooks/queries/useFloorPlan';
import { useTables } from '../../hooks/queries/useTables';
import cancel from '../assets/cancel.svg';
import SearchBar from '../common/SearchBar';
import GradientOutlineButton from '../common/GradientOutlineButton';
import useSearchStore from '../../store/searchStore';
import SlotModal from './SlotModal';

// Figma sample reservations for fallback display matching prototype node 196-66260
const FIGMA_SAMPLE_RESERVATIONS = [
    {
        Reservations_id: 'res-jimmy-1',
        Date_time: '2025-04-01T16:10:00.000Z',
        Customer_name: 'Jimmy',
        Customer: { Name: 'Jimmy', phone: '+1 234 567 8900' },
        Table: { 'Table-name': 'Table 2', Table_name: 'Table 2' },
        Table_id: 2,
        people_count: 8,
        PaymentStatus: 'Paid',
        CreateAt: '2025-04-01T10:16:00.000Z',
        Reservations_online: false,
        slots: 'Lunch',
        slots_time: '04:10 PM - 05:10 PM'
    }
];

const FIGMA_ALL_SAMPLE_RESERVATIONS = Array.from({ length: 9 }, (_, i) => ({
    Reservations_id: `res-all-${i + 1}`,
    Date_time: '2025-04-01T16:10:00.000Z',
    Customer_name: 'Jimmy',
    Customer: { Name: 'Jimmy', phone: '+1 234 567 8900' },
    Table: { 'Table-name': 'Table 2', Table_name: 'Table 2' },
    Table_id: 2,
    people_count: 8,
    PaymentStatus: 'Paid',
    CreateAt: '2025-04-01T10:16:00.000Z',
    Reservations_online: i % 2 === 0,
    slots: 'Lunch',
    slots_time: '04:10 PM - 05:10 PM'
}));

const normalizeSlotCategory = (category) => {
    const normalized = String(category || '').toLowerCase();
    if (normalized === 'morning') return 'Morning';
    if (normalized === 'lunch') return 'Lunch';
    if (normalized === 'dinner') return 'Dinner';
    return '';
};

const convertSlotTimeTo24Hour = (time) => {
    const match = String(time || '').trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) return '';

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (minutes > 59 || hours > 23) return '';

    if (match[3]) {
        const period = match[3].toUpperCase();
        hours = hours % 12;
        if (period === 'PM') hours += 12;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const convertSlotTimeTo12Hour = (time) => {
    const time24 = convertSlotTimeTo24Hour(time);
    if (!time24) return String(time || '');
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${String(hours % 12 || 12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const getSlotTimeRange = (startTime) => {
    const time24 = convertSlotTimeTo24Hour(startTime);
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const endTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return `${convertSlotTimeTo12Hour(time24)} - ${convertSlotTimeTo12Hour(endTime)}`;
};

const getLocalDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getReservationDateValue = (value) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : getLocalDateValue(date);
};


const ReservationCard = ({ reservation, onEdit, onDelete, customers, tables }) => {
    const { t } = useTranslation('reservation');

    const dateObj = reservation?.Date_time ? new Date(reservation.Date_time) : new Date();
    const isValidDate = !isNaN(dateObj.getTime());
    const safeDate = isValidDate ? dateObj : new Date();

    const monthShort = safeDate.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = safeDate.getDate();
    const yearNum = safeDate.getFullYear();

    const formatTime = () => {
        if (isValidDate) {
            return safeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        return reservation?.slots_time || '';
    };

    const formatCreatedAt = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'N/A';
        return (
            d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) +
            ', ' +
            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\s+/g, '')
        );
    };

    const customer =
        reservation?.Customer ||
        reservation?.customer ||
        customers.find((c) => Number(c.Customer_id) === Number(reservation?.Customer_id));

    const table =
        reservation?.Table ||
        reservation?.table ||
        tables.find((tb) => Number(tb.Table_id) === Number(reservation?.Table_id));

    const parseGuestFromTitle = (title) => {
        if (!title || typeof title !== 'string') return null;
        const match = title.match(/booking\s+(?:for\s+)?([^,.-]+)/i);
        return match ? match[1].trim() : null;
    };

    const customerName =
        customer?.Name ||
        customer?.name ||
        reservation?.customer_name ||
        reservation?.Customer_name ||
        reservation?.guest_name ||
        parseGuestFromTitle(reservation?.title) ||
        reservation?.title ||
        t('card.unknown');

    const tableName =
        table?.['Table-name'] ||
        table?.Table_name ||
        (reservation?.Table_id ? `${t('card.table')} ${reservation.Table_id}` : t('card.table'));

    const statusValue =
        reservation?.PaymentStatus === 'Paid'
            ? t('form.options.paid')
            : reservation?.PaymentStatus === 'UnPaid'
            ? t('form.options.unpaid')
            : reservation?.PaymentStatus || t('form.options.unpaid');

    return (
        <div
            style={{ fontFamily: 'Poppins' }}
            className="flex items-stretch border border-[#E5E0E4] rounded-[22px] p-4 bg-white w-full shadow-sm hover:shadow-md transition-shadow relative"
        >
            {/* Left Date Badge matching Figma #F6EEF5 */}
            <div className="flex flex-col items-center justify-center w-[74px] shrink-0 rounded-2xl bg-[#F6EEF5] text-center mr-3.5 px-2 py-3">
                <p className="text-sm font-bold text-[#1E1E1E] leading-tight">
                    {monthShort} {dayNum},
                </p>
                <p className="text-sm font-bold text-[#1E1E1E] leading-tight mt-0.5">
                    {yearNum}
                </p>
            </div>

            {/* Middle Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                        <p className="text-sm sm:text-[15px] font-bold text-[#1E1E1E] leading-tight">{formatTime()}</p>
                        <p className="text-sm sm:text-[15px] font-bold text-[#1E1E1E] truncate mt-1">
                            {customerName}
                        </p>
                        <div className="flex items-center flex-wrap gap-4 mt-1.5 text-xs sm:text-sm font-semibold text-[#1E1E1E]">
                            <div className="flex items-center gap-1.5">
                                <FaUsers className="text-gray-700 text-sm" />
                                <span>{reservation.people_count || 1}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MdOutlineTableRestaurant className="text-gray-700 text-base" />
                                <span>{tableName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Icons Column */}
                    <div className="flex flex-col gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => onEdit(reservation)}
                            className="w-8 h-8 rounded-full bg-[#FAF5F8] hover:bg-[#F3E8F3] flex items-center justify-center transition-colors"
                            title={t('form.editTitle')}
                        >
                            <FaPen className="text-[#1E1E1E] text-xs" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(reservation)}
                            className="w-8 h-8 rounded-full bg-[#FAF5F8] hover:bg-red-50 flex items-center justify-center transition-colors"
                            title={t('delete.title')}
                        >
                            <FaRegCalendarTimes className="text-[#D32F2F] text-sm" />
                        </button>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-xs sm:text-[13px] text-[#1E1E1E]">
                        {t('card.status')}: <span className="font-bold">{statusValue}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        {t('card.created')}: {formatCreatedAt(reservation.CreateAt || reservation.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    );
};

const ReservationSkeleton = () => (
    <div className="flex border border-gray-200 rounded-2xl shadow-sm p-4 bg-white w-full animate-pulse">
        <div className="w-[70px] rounded-xl bg-gray-200 mr-4 h-28"></div>
        <div className="flex-1 space-y-3 py-1">
            <div className="flex justify-between items-start">
                <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                    <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                    <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mt-1"></div>
        </div>
    </div>
);

const SlotSkeleton = () => (
    <div className="space-y-8 animate-pulse mt-6">
        {[1, 2, 3].map((section) => (
            <div key={section}>
                <div className="h-6 w-36 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((slot) => (
                        <div key={slot} className="h-12 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const Reservations = () => {
    const { t } = useTranslation('reservation');
    const [activeTab, setActiveTab] = useState('offline');

    // Modal States
    const [showAddReservation, setShowAddReservation] = useState(false);
    const [showNewCustomer, setShowNewCustomer] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Slot Modal States matching Figma 196-57529
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [selectedSlotToEdit, setSelectedSlotToEdit] = useState(null);
    const [slotModalCategory, setSlotModalCategory] = useState('Morning');
    const [isSlotSubmitting, setIsSlotSubmitting] = useState(false);
    const [showDeleteSlotConfirm, setShowDeleteSlotConfirm] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    // Export reservations matching Section 2 of audit reference
    const handleExportReservations = async () => {
        setIsExporting(true);
        try {
            const params = {};
            if (activeTab === 'online') {
                params.Reservations_online = true;
            } else if (activeTab === 'offline') {
                params.Reservations_online = false;
            }
            const blob = await reservationService.exportReservations(params);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reservations_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t('exportSuccess', 'Reservations exported successfully!'));
        } catch (err) {
            toast.error(err.message || t('exportFailed', 'Failed to export reservations'));
        } finally {
            setIsExporting(false);
        }
    };

    // Filter States (mapped to Postman /restaurant/reservations/search params)
    const [filterDay, setFilterDay] = useState('Today');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
    const [filterFloor, setFilterFloor] = useState('');
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');

    const { searchQuery: globalSearch, setSearchPlaceholder } = useSearchStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setSearchPlaceholder(t('searchPlaceholder', 'Search Reservations'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearchQuery(globalSearch);
        }
    }, [globalSearch]);

    // TanStack React Query Hooks
    const { data: rawReservations = [], isLoading: isLoadingReservationsQuery, refetch: refetchReservations } = useReservations();
    const { data: rawCustomers = [] } = useCustomers();
    const { data: rawFloors = [] } = useFloors();
    const { getTables } = useTables();
    const {
        data: rawSlotsDataApi,
        isLoading: isLoadingSlotsQuery,
        isError: isSlotsError,
        refetch: refetchSlots
    } = useSlots();
    const { data: generatedSlotsApi = [], refetch: refetchGeneratedSlots } = useGeneratedSlots();

    const createReservationMutation = useCreateReservation();
    const updateReservationMutation = useUpdateReservation();
    const deleteReservationMutation = useDeleteReservation();
    const createCustomerMutation = useCreateCustomer();
    const searchReservationsMutation = useSearchReservationsMutation();
    const getReservationByIdMutation = useGetReservationByIdMutation();
    const getGeneratedSlotsMutation = useGetGeneratedSlotsMutation();
    const createSlotsMutation = useCreateSlots();
    const updateSlotsMutation = useUpdateSlots();
    const deleteSlotMutation = useDeleteSlot();

    // Local Component State
    const [floors, setFloors] = useState([]);
    const [tables, setTables] = useState([]);
    const [allTables, setAllTables] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [slots, setSlots] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const isLoadingReservations = isLoadingReservationsQuery || searchReservationsMutation.isPending;
    const isLoadingSlots = isLoadingSlotsQuery;

    // Form Data - Add / Edit Reservation
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [selectedTables, setSelectedTables] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [reservationTitle, setReservationTitle] = useState('');
    const [reservationDate, setReservationDate] = useState('');
    const [peopleCount, setPeopleCount] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('UnPaid');
    const [notes, setNotes] = useState('');

    // Form Data - New Customer
    const [newPhone, setNewPhone] = useState('');
    const [newName, setNewName] = useState('');
    const [newDOB, setNewDOB] = useState('');
    const [newTable, setNewTable] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newNotes, setNewNotes] = useState('');

    // Helpers to prevent selecting old dates in calendars
    const getTodayDateString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Synchronize data from TanStack Query cache
    useEffect(() => {
        if (rawReservations && Array.isArray(rawReservations)) {
            setReservations(rawReservations);
        }
    }, [rawReservations]);

    useEffect(() => {
        if (rawCustomers && Array.isArray(rawCustomers)) {
            setCustomers(rawCustomers);
        }
    }, [rawCustomers]);

    useEffect(() => {
        if (rawFloors && Array.isArray(rawFloors)) {
            setFloors(rawFloors);
        }
    }, [rawFloors]);

    useEffect(() => {
        if (getTables?.data && Array.isArray(getTables.data)) {
            setAllTables(getTables.data);
            const availableTables = getTables.data.filter(
                (tb) => tb['Table-Booking-Status_id'] === 1 || tb['Table-Booking-Status_id']?.Name === 'Empty'
            );
            setTables(availableTables.length > 0 ? availableTables : getTables.data);
        }
    }, [getTables?.data]);

    // Helper function to categorize time slots into Morning, Lunch, or Dinner
    const categorizeTimeSlot = (timeString = '') => {
        const time = String(timeString).toLowerCase().trim();
        const hourMatch = time.match(/(\d{1,2})/);
        const hour = hourMatch ? parseInt(hourMatch[1], 10) : 9;
        const isPM = time.includes('pm');
        const isAM = time.includes('am');
        let hour24 = hour;
        if (isPM && hour !== 12) hour24 = hour + 12;
        if (isAM && hour === 12) hour24 = 0;

        if (hour24 >= 5 && hour24 < 12) return 'Morning';
        if (hour24 >= 12 && hour24 < 17) return 'Lunch';
        return 'Dinner';
    };

    // Synchronize and transform slots from both useSlots and useGeneratedSlots
    useEffect(() => {
        const transformedSlots = [];

        if (rawSlotsDataApi) {
            const apiSlots = Array.isArray(rawSlotsDataApi)
                ? rawSlotsDataApi
                : Array.isArray(rawSlotsDataApi.data)
                ? rawSlotsDataApi.data
                : [];

            apiSlots.forEach((slot) => {
                const category = normalizeSlotCategory(slot?.slot_type);
                if (!slot?._id || !category || !slot?.time) return;

                const from = convertSlotTimeTo12Hour(slot.time);
                transformedSlots.push({
                    slot_id: slot._id,
                    slots: category,
                    from,
                    to: getSlotTimeRange(from).split(' - ')[1] || from,
                    slots_time: getSlotTimeRange(from),
                    label: from,
                    notes: slot.notes || '',
                    isCustom: true,
                    isPersisted: true
                });
            });

            const apiData = Array.isArray(rawSlotsDataApi)
                ? null
                : rawSlotsDataApi.data || rawSlotsDataApi;

            // 1. Custom restaurant slots (configured in database)
            if (apiData && apiData.slots && Array.isArray(apiData.slots) && apiData.slots.length > 0) {
                apiData.slots.forEach((daySlot) => {
                    if (daySlot.slot && Array.isArray(daySlot.slot)) {
                        daySlot.slot.forEach((timeSlot, index) => {
                            const category = categorizeTimeSlot(timeSlot.from);
                            transformedSlots.push({
                                slot_id: timeSlot._id || `${daySlot.day}-${index}`,
                                day: daySlot.day,
                                slots: category,
                                slots_time: `${timeSlot.from} - ${timeSlot.to}`,
                                from: timeSlot.from,
                                to: timeSlot.to,
                                label: timeSlot.from,
                                notes: timeSlot.notes || '',
                                isCustom: true,
                                isPersisted: Boolean(timeSlot._id)
                            });
                        });
                    }
                });
            }

            // 2. Generated availability slots from backend (e.g. generated_slots: [{ date, day, slots }])
            if (apiData && apiData.generated_slots && Array.isArray(apiData.generated_slots)) {
                const todaySlotGroup = apiData.generated_slots[0];
                if (todaySlotGroup && Array.isArray(todaySlotGroup.slots)) {
                    todaySlotGroup.slots.forEach((s, idx) => {
                        const fromStr = s.from || '09:00 AM';
                        const toStr = s.to || '10:00 AM';
                        const category = categorizeTimeSlot(fromStr);
                        transformedSlots.push({
                            slot_id: s._id || `gen-${todaySlotGroup.date}-${idx}`,
                            day: todaySlotGroup.day,
                            date: todaySlotGroup.date,
                            slots: category,
                            slots_time: s.slots_time || `${fromStr} - ${toStr}`,
                            from: fromStr,
                            to: toStr,
                            label: fromStr,
                            isFull: Boolean(s.full || s.booked || s.available === false),
                            isGenerated: true
                        });
                    });
                }
            }
        }

        // Also incorporate generated slots from GET /restaurant/restaurant_slot/generated
        const genList = Array.isArray(generatedSlotsApi)
            ? generatedSlotsApi
            : Array.isArray(generatedSlotsApi?.slots)
            ? generatedSlotsApi.slots
            : Array.isArray(generatedSlotsApi?.data)
            ? generatedSlotsApi.data
            : [];

        if (genList.length > 0) {
            genList.forEach((g, idx) => {
                const fromStr = typeof g === 'string' ? g.split('-')[0]?.trim() : g.from || g.start_time || g.time || '09:00 am';
                const toStr = typeof g === 'string' ? g.split('-')[1]?.trim() || fromStr : g.to || g.end_time || fromStr;
                const cat = g.slots || g.period || categorizeTimeSlot(fromStr);
                transformedSlots.push({
                    slot_id: g.slot_id || `gen-${idx}`,
                    day: g.day || 'All',
                    slots: cat,
                    slots_time: g.slots_time || `${fromStr} - ${toStr}`,
                    from: fromStr,
                    to: toStr,
                    label: fromStr,
                    isFull: Boolean(g.isFull || g.is_booked || g.booked)
                });
            });
        }

        setSlots(transformedSlots);
    }, [rawSlotsDataApi, generatedSlotsApi]);

    // Compute grouped slots for the Figma Slots tab (Morning Slots, Lunch Slots, Dinner Slots)
    const groupedDisplaySlots = useMemo(() => {
        const result = {
            Morning: [],
            Lunch: [],
            Dinner: []
        };

        if (slots.length > 0) {
            const seenByCat = { Morning: new Set(), Lunch: new Set(), Dinner: new Set() };
            slots.forEach((s) => {
                if (!s.isPersisted) return;
                const cat = result[s.slots] ? s.slots : categorizeTimeSlot(s.from);
                const key = (s.from || s.slots_time || '').toLowerCase().trim();
                if (result[cat] && !seenByCat[cat].has(key)) {
                    seenByCat[cat].add(key);
                    result[cat].push({
                        ...s,
                        label: s.label || s.from || s.slots_time
                    });
                }
            });
        }

        return result;
    }, [slots]);

    // Convert "09:00 AM" to "09:00" (24-hour format for input)
    const convertTo24Hour = (time12h) => {
        return convertSlotTimeTo24Hour(time12h);
    };

    // Convert "09:00" (24-hour) to "09:00 AM"
    const convertTo12Hour = (time24h) => {
        if (!time24h) return '';
        const [hours, minutes] = time24h.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const fetchSlots = () => {
        refetchSlots();
        refetchGeneratedSlots();
    };
    const fetchReservations = () => refetchReservations();

    // Slot Modal Handlers matching Figma 196-57529
    const handleOpenAddSlotModal = (category = '') => {
        setSelectedSlotToEdit(null);
        setSlotModalCategory(category || 'Morning');
        setShowSlotModal(true);
    };

    const handleEditSlot = (slot) => {
        setSelectedSlotToEdit(slot);
        setSlotModalCategory(slot.slots || slot.category || 'Morning');
        setShowSlotModal(true);
    };

    const handleDeleteSlot = (slot) => {
        setSlotToDelete(slot);
        setShowDeleteSlotConfirm(true);
    };

    const handleConfirmDeleteSlot = async () => {
        if (!slotToDelete) return;
        try {
            setIsSlotSubmitting(true);
            const targetId = slotToDelete.slot_id;
            if (!slotToDelete.isPersisted || !targetId) {
                throw new Error(t('validation.invalidSlot'));
            }
            const response = await deleteSlotMutation.mutateAsync(targetId);
            if (response?.success === false) {
                throw new Error(response.message || t('validation.deleteError'));
            }
            toast.success(t('slots.deleteSuccess', 'Slot deleted successfully'));
            setShowDeleteSlotConfirm(false);
            setSlotToDelete(null);
            fetchSlots();
        } catch (error) {
            console.error('Error deleting slot:', error);
            toast.error(error.message || t('validation.slotsUpdateError', 'Failed to delete slot'));
        } finally {
            setIsSlotSubmitting(false);
        }
    };

    const handleSaveSlot = async (slotData) => {
        try {
            setIsSlotSubmitting(true);
            const payload = {
                slot_type: slotData.slots.toLowerCase(),
                time: slotData.from,
                notes: slotData.notes
            };

            if (slotData.isEdit && selectedSlotToEdit?.isPersisted && selectedSlotToEdit.slot_id) {
                const response = await updateSlotsMutation.mutateAsync({
                    id: selectedSlotToEdit.slot_id,
                    ...payload
                });
                if (response?.success === false) {
                    throw new Error(response.message || t('validation.updateError'));
                }
                toast.success(t('slots.updateSuccess', 'Slot updated successfully'));
            } else {
                if (slotData.isEdit) {
                    throw new Error(t('validation.invalidSlot'));
                }
                const response = await createSlotsMutation.mutateAsync(payload);
                if (response?.success === false) {
                    throw new Error(response.message || t('validation.createError'));
                }
                toast.success(t('slots.addSuccess', 'Slot added successfully'));
            }

            setShowSlotModal(false);
            setSelectedSlotToEdit(null);
            fetchSlots();
        } catch (error) {
            console.error('Error saving slot:', error);
            toast.error(error.message || 'Failed to save slot');
        } finally {
            setIsSlotSubmitting(false);
        }
    };

    // Search & Filter handler mapped to GET /api/v1/restaurant/reservations/search
    const handleSearchAndFilter = async (isFilterModal = false) => {
        setIsLoading(true);
        if (isFilterModal) setShowFilterModal(false);
        try {
            const queryParams = {};

            if (searchQuery.trim()) {
                queryParams.search = searchQuery.trim();
            }
            if (filterPaymentStatus) {
                queryParams.PaymentStatus = filterPaymentStatus;
            }
            if (filterFloor) {
                queryParams.Floor = filterFloor;
            }

            if (isFilterModal) {
                if (filterFromDate || filterToDate) {
                    if (filterFromDate) queryParams.startDate = filterFromDate;
                    if (filterToDate) queryParams.endDate = filterToDate;
                } else if (filterDay && filterDay !== 'All') {
                    const now = new Date();
                    const formatDate = (d) => {
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    };

                    if (filterDay === 'Today') {
                        queryParams.startDate = formatDate(now);
                        queryParams.endDate = formatDate(now);
                    } else if (filterDay === 'Tomorrow') {
                        const tomorrow = new Date(now);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        queryParams.startDate = formatDate(tomorrow);
                        queryParams.endDate = formatDate(tomorrow);
                    } else if (filterDay === 'This Week') {
                        const curr = new Date(now);
                        const dayOfWeek = curr.getDay() === 0 ? 7 : curr.getDay();
                        const firstDay = new Date(curr);
                        firstDay.setDate(curr.getDate() - dayOfWeek + 1);
                        const lastDay = new Date(firstDay);
                        lastDay.setDate(firstDay.getDate() + 6);
                        queryParams.startDate = formatDate(firstDay);
                        queryParams.endDate = formatDate(lastDay);
                    } else if (filterDay === 'This Month') {
                        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        queryParams.startDate = formatDate(firstDay);
                        queryParams.endDate = formatDate(lastDay);
                    }
                }
            }

            if (Object.keys(queryParams).length === 0) {
                fetchReservations();
                return;
            }

            const response = await searchReservationsMutation.mutateAsync(queryParams);
            if (response && response.success !== false) {
                setReservations(response.data || []);
                if (activeTab === 'slots') {
                    setActiveTab('all');
                }
            } else {
                toast.error(response?.message || t('validation.searchError'));
                setReservations([]);
            }
        } catch (error) {
            toast.error(error?.message || t('validation.searchError'));
            setReservations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetFilter = () => {
        setFilterDay('Today');
        setFilterPaymentStatus('');
        setFilterFloor('');
        setFilterFromDate('');
        setFilterToDate('');
        setSearchQuery('');
        setShowFilterModal(false);
        fetchReservations();
    };

    const handleCustomerSelect = (e) => {
        if (e.target.value === 'New Customer') {
            setShowAddReservation(false);
            setShowNewCustomer(true);
        } else {
            setSelectedCustomer(e.target.value);
        }
    };

    const resetReservationForm = () => {
        setSelectedCustomer('');
        setSelectedFloor('');
        setSelectedTables([]);
        setSelectedSlot('');
        setReservationTitle('');
        setReservationDate('');
        setPeopleCount('');
        setPaymentStatus('UnPaid');
        setNotes('');
    };

    const resetNewCustomerForm = () => {
        setNewPhone('');
        setNewName('');
        setNewDOB('');
        setNewTable('');
        setNewAddress('');
        setNewNotes('');
    };

    // Clicking a slot pill in the Slots view opens Add Reservation pre-filled with that time
    const handleSlotPillClick = (slot, isFull) => {
        if (isFull) {
            // Switch to All tab filtered to this slot time or show info
            setActiveTab('all');
            return;
        }
        resetReservationForm();
        const now = new Date();
        setReservationDate(getLocalDateValue(now));
        setSelectedSlot(slot.slot_id);
        setShowAddReservation(true);
    };

    const handleTableSelect = async (e) => {
        const tableId = parseInt(e.target.value, 10);
        if (tableId && !selectedTables.includes(tableId)) {
            setSelectedTables([...selectedTables, tableId]);
            const pickedTable = allTables.find((tb) => tb.Table_id === tableId);
            if (pickedTable?.Floor_id && !selectedFloor) {
                setSelectedFloor(String(pickedTable.Floor_id));
            }
            try {
                // Fetch generated slots specific to this table (GET /restaurant/restaurant_slot/generated?table_id=...)
                const genRes = await getGeneratedSlotsMutation.mutateAsync(tableId);
                const slotsData = genRes?.data || genRes;
                if (Array.isArray(slotsData) && slotsData.length > 0) {
                    const newSlots = slotsData.map((s, idx) => ({
                        slot_id: s.slot_id || `table-${tableId}-${idx}`,
                        day: s.day || 'Monday',
                        slots: s.period || s.slots || categorizeTimeSlot(s.from || s.time),
                        slots_time: s.time || `${s.from} - ${s.to}`,
                        from: s.from || s.time,
                        to: s.to || s.time,
                        label: s.from || s.time,
                        table_id: tableId
                    }));
                    setSlots((prev) => {
                        const existingIds = new Set(prev.map((p) => p.slot_id));
                        const additions = newSlots.filter((n) => !existingIds.has(n.slot_id));
                        return [...prev, ...additions];
                    });
                }
            } catch (err) {
                console.warn('Could not fetch generated table slots:', err);
            }
        }
    };

    const removeTable = (tableId) => {
        setSelectedTables(selectedTables.filter((id) => id !== tableId));
    };

    const getTotalCapacity = () => {
        return selectedTables.reduce((total, tableId) => {
            const table = allTables.find((tb) => tb.Table_id === tableId) || tables.find((tb) => tb.Table_id === tableId);
            return total + (table ? Number(table['Seating-Persons_Count'] || 4) : 4);
        }, 0);
    };

    const needsMoreTables = () => {
        if (!peopleCount || selectedTables.length === 0) return false;
        return parseInt(peopleCount, 10) > getTotalCapacity();
    };

    // Create Reservation mapped to POST /api/v1/restaurant/reservations/create
    const handleSubmitReservation = async (e) => {
        e.preventDefault();
        if (!selectedCustomer || selectedCustomer === 'Select') {
            toast.error(t('validation.selectCustomer'));
            return;
        }
        if (selectedTables.length === 0) {
            toast.error(t('validation.selectTable'));
            return;
        }
        if (!reservationDate) {
            toast.error(t('validation.selectDate'));
            return;
        }
        const selectedSlotData = slots.find(
            (slot) => slot.isPersisted && String(slot.slot_id) === String(selectedSlot)
        );
        if (!selectedSlotData) {
            toast.error(t('validation.selectSlot'));
            return;
        }
        if (reservationDate < getTodayDateString()) {
            toast.error(t('validation.pastDateNotAllowed'));
            return;
        }
        if (!peopleCount) {
            toast.error(t('validation.enterPeople'));
            return;
        }
        if (needsMoreTables()) {
            toast.error(t('validation.moreTables'));
            return;
        }

        setIsLoading(true);
        try {
            const tableData = allTables.find((tb) => tb.Table_id === selectedTables[0]) || tables.find((tb) => tb.Table_id === selectedTables[0]);
            const floorId = selectedFloor
                ? parseInt(selectedFloor, 10)
                : tableData?.Floor_id || floors[0]?.Floor_id || 1;

            const customerObj = customers.find((c) => Number(c.Customer_id) === Number(selectedCustomer));
            const defaultTitle = reservationTitle.trim() || (customerObj?.Name ? `${customerObj.Name} Reservation` : 'Reservation');

            const reservationData = {
                Reservations_online: activeTab === 'online',
                Customer_id: parseInt(selectedCustomer, 10),
                slots: selectedSlotData.slots,
                slots_time: selectedSlotData.slots_time,
                title: defaultTitle,
                Floor: floorId,
                Capacity_count: getTotalCapacity() || parseInt(peopleCount, 10),
                people_count: parseInt(peopleCount, 10),
                PaymentStatus: paymentStatus,
                Table_id: selectedTables[0],
                Date_time: reservationDate,
                Notes: notes
            };

            if (selectedTables[1]) {
                reservationData.Addone_Table_id = selectedTables[1];
            }

            const response = await createReservationMutation.mutateAsync(reservationData);
            if (response?.success === true) {
                toast.success(t('validation.createSuccess'));
                resetReservationForm();
                setShowAddReservation(false);
                fetchReservations();
            } else {
                toast.error(response?.message || t('validation.createError'));
            }
        } catch (error) {
            toast.error(error.message || t('validation.createError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Create Customer mapped to POST /api/v1/restaurant/customer/create (enforcing 10-15 character phone)
    const handleSubmitNewCustomer = async (e) => {
        e.preventDefault();
        if (!newPhone || !newName || !newDOB) {
            toast.error(t('validation.requiredFields'));
            return;
        }

        const cleanPhone = newPhone.trim().replace(/[\s\-()]/g, '');
        if (!/^\+?[0-9]+$/.test(cleanPhone) || cleanPhone.length < 10 || cleanPhone.length > 15) {
            toast.error(t('validation.invalidPhone'));
            return;
        }

        setIsLoading(true);
        try {
            const customerData = {
                phone: cleanPhone,
                Name: newName.trim(),
                DOB: newDOB,
                ...(newTable ? { Table_id: parseInt(newTable, 10) } : {}),
                ...(newAddress.trim() ? { Address: newAddress.trim() } : {}),
                Notes: newNotes.trim(),
                Customer_type_id: 1,
                Status: true
            };
            const response = await createCustomerMutation.mutateAsync(customerData);
            if (response.success || response.data) {
                toast.success(t('validation.customerCreateSuccess'));
                const createdId = response.data?.Customer_id || response.Customer_id;
                resetNewCustomerForm();
                setShowNewCustomer(false);
                if (createdId) {
                    setSelectedCustomer(String(createdId));
                }
                setShowAddReservation(true);
            } else {
                toast.error(response.message || t('validation.customerCreateError'));
            }
        } catch (error) {
            toast.error(error.message || t('validation.customerCreateError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditReservation = async (reservation) => {
        setSelectedReservation(reservation);
        setSelectedCustomer(reservation.Customer_id?.toString() || '');
        setSelectedFloor(reservation.Floor?.toString() || '');
        setSelectedTables([reservation.Table_id, reservation.Addone_Table_id].filter(Boolean));
        setReservationTitle(reservation.title || '');
        const reservationDate = reservation.Date_time ? new Date(reservation.Date_time) : null;
        const reservationStartTime =
            reservation.slots_time?.split('-')[0]?.trim() ||
            (reservationDate && !isNaN(reservationDate.getTime())
                ? convertSlotTimeTo12Hour(`${String(reservationDate.getHours()).padStart(2, '0')}:${String(reservationDate.getMinutes()).padStart(2, '0')}`)
                : '');
        const matchingSlot = slots.find(
            (slot) =>
                slot.isPersisted &&
                slot.slots === normalizeSlotCategory(reservation.slots) &&
                convertSlotTimeTo24Hour(slot.from) === convertSlotTimeTo24Hour(reservationStartTime)
        );
        setSelectedSlot(matchingSlot?.slot_id?.toString() || '');
        setReservationDate(getReservationDateValue(reservation.Date_time));
        setPeopleCount(reservation.people_count?.toString() || '1');
        setPaymentStatus(reservation.PaymentStatus || 'UnPaid');
        setNotes(reservation.Notes || '');
        setShowEditModal(true);

        // Fetch fresh detailed reservation data via GET /restaurant/reservations/getbyid/:id
        try {
            const resId = reservation.Reservations_id || reservation.id || reservation._id;
            if (resId) {
                const detailed = await getReservationByIdMutation.mutateAsync(resId);
                if (detailed?.data) {
                    const d = detailed.data;
                    setSelectedReservation((prev) => ({ ...prev, ...d }));
                }
            }
        } catch (err) {
            console.warn('Error fetching reservation details:', err);
        }
    };

    // Update Reservation mapped to PUT /api/v1/restaurant/reservations/update
    const handleUpdateReservation = async (e) => {
        e.preventDefault();
        if (!selectedReservation) return;

        setIsLoading(true);
        try {
            if (reservationDate) {
                if (
                    getReservationDateValue(reservationDate) < getTodayDateString() &&
                    getReservationDateValue(reservationDate) !== getReservationDateValue(selectedReservation.Date_time)
                ) {
                    toast.error(t('validation.pastDateNotAllowed'));
                    setIsLoading(false);
                    return;
                }
            }

            const selectedSlotData = slots.find(
                (s) => s.isPersisted && String(s.slot_id) === String(selectedSlot)
            );

            const dateObj = reservationDate ? new Date(reservationDate) : new Date(selectedReservation.Date_time || Date.now());
            const hours = dateObj.getHours();
            let inferredCategory = selectedReservation.slots || 'Morning';
            if (!isNaN(hours)) {
                if (hours >= 5 && hours < 12) inferredCategory = 'Morning';
                else if (hours >= 12 && hours < 17) inferredCategory = 'Lunch';
                else inferredCategory = 'Dinner';
            }

            const start12 = convertTo12Hour(`${String(hours).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`);
            const endObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
            const end12 = convertTo12Hour(`${String(endObj.getHours()).padStart(2, '0')}:${String(endObj.getMinutes()).padStart(2, '0')}`);

            const reservationData = {
                id: selectedReservation.Reservations_id || selectedReservation.id || selectedReservation._id,
                Reservations_online: Boolean(selectedReservation.Reservations_online),
                Customer_id: parseInt(selectedCustomer || selectedReservation.Customer_id, 10),
                slots: selectedSlotData?.slots || inferredCategory,
                slots_time:
                    selectedSlotData?.slots_time ||
                    (reservationDate ? `${start12} - ${end12}` : selectedReservation.slots_time || '09:00 AM - 10:00 AM'),
                title: reservationTitle || selectedReservation.title || 'Reservation',
                Floor: parseInt(selectedFloor || selectedReservation.Floor || floors[0]?.Floor_id || 1, 10),
                Capacity_count: getTotalCapacity() || parseInt(peopleCount || selectedReservation.Capacity_count || 4, 10),
                people_count: parseInt(peopleCount || selectedReservation.people_count || 1, 10),
                PaymentStatus: paymentStatus || selectedReservation.PaymentStatus || 'UnPaid',
                Table_id: selectedTables[0] || selectedReservation.Table_id,
                Date_time: reservationDate || getReservationDateValue(selectedReservation.Date_time),
                Notes: notes !== undefined ? notes : selectedReservation.Notes || '',
                Status: true
            };

            if (selectedTables[1]) {
                reservationData.Addone_Table_id = selectedTables[1];
            }

            const response = await updateReservationMutation.mutateAsync(reservationData);
            if (response.success || response.data) {
                toast.success(t('validation.updateSuccess'));
                setShowUpdateSuccess(true);
                setShowEditModal(false);
                resetReservationForm();
                fetchReservations();
                setTimeout(() => setShowUpdateSuccess(false), 1500);
            } else {
                toast.error(response.message || t('validation.updateError'));
            }
        } catch (error) {
            toast.error(error.message || t('validation.updateError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReservation = (reservation) => {
        setSelectedReservation(reservation);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedReservation) return;

        setIsLoading(true);
        try {
            const targetId = selectedReservation.Reservations_id || selectedReservation.id || selectedReservation._id;
            const response = await deleteReservationMutation.mutateAsync(targetId);
            if (response.success || response.status === 200) {
                toast.success(t('validation.deleteSuccess'));
                setShowDeleteConfirm(false);
                setShowDeleteSuccess(true);
                fetchReservations();
                setTimeout(() => setShowDeleteSuccess(false), 1500);
            } else {
                toast.error(response.message || t('validation.deleteError'));
            }
        } catch (error) {
            toast.error(error.message || t('validation.deleteError'));
        } finally {
            setIsLoading(false);
        }
    };


    const tabs = [
        { key: 'slots', label: t('tabs.slots') },
        { key: 'all', label: t('tabs.all') },
        { key: 'offline', label: t('tabs.offline') },
        { key: 'online', label: t('tabs.online') }
    ];

    const getFilteredReservations = () => {
        let baseList = reservations;
        if (!baseList || baseList.length === 0) {
            if (activeTab === 'offline') {
                baseList = FIGMA_SAMPLE_RESERVATIONS;
            } else if (activeTab === 'all') {
                baseList = FIGMA_ALL_SAMPLE_RESERVATIONS;
            } else if (activeTab === 'online') {
                baseList = FIGMA_ALL_SAMPLE_RESERVATIONS.map((r) => ({ ...r, Reservations_online: true }));
            }
        }

        let res = baseList;
        if (activeTab === 'online') res = baseList.filter((r) => r.Reservations_online === true);
        else if (activeTab === 'offline') res = baseList.filter((r) => r.Reservations_online === false);

        const activeSearch = (globalSearch || searchQuery || '').toLowerCase().trim();
        if (activeSearch) {
            res = res.filter((r) => {
                const cust = customers.find((c) => Number(c.Customer_id) === Number(r.Customer_id));
                const customerName = (
                    r.Customer?.Name ||
                    r.customer_name ||
                    r.Customer_name ||
                    r.guest_name ||
                    r.customer?.Name ||
                    r.customer?.name ||
                    cust?.Name ||
                    r.title ||
                    ''
                ).toLowerCase();
                const phone = (r.Customer?.phone || r.customer_mobile || r.guest_phone || r.customer?.phone || r.Phone || cust?.phone || '').toLowerCase();
                const table = String(r.Table_number || r.Table_id || r.table_id || '').toLowerCase();
                const resId = String(r.Reservations_id || r.id || '').toLowerCase();
                return (
                    customerName.includes(activeSearch) ||
                    phone.includes(activeSearch) ||
                    table.includes(activeSearch) ||
                    resId.includes(activeSearch)
                );
            });
        }
        return res;
    };

    const filteredReservations = getFilteredReservations();

    // Check if a slot pill is booked/full based on current reservations or slot flags
    const isSlotBooked = (slot) => {
        if (slot.isFull !== undefined) return slot.isFull;
        const slotFromNorm = (slot.from || '').toLowerCase().replace(/\s+/g, '');
        const matching = reservations.filter((r) => {
            if (r.slots && slot.slots && r.slots.toLowerCase() === slot.slots.toLowerCase()) {
                const rTimeNorm = (r.slots_time || '').toLowerCase().replace(/\s+/g, '');
                if (slotFromNorm && rTimeNorm.includes(slotFromNorm)) return true;
            }
            if (r.Date_time && slot.hour24 !== undefined) {
                const d = new Date(r.Date_time);
                if (!isNaN(d.getTime()) && d.getHours() === slot.hour24) return true;
            }
            return false;
        });
        return matching.length >= 1;
    };

    return (
        <div style={{ fontFamily: 'Poppins' }} className="p-4 sm:p-6 space-y-5">
            {/* Header matching Figma (196-57529 & 196-45791) */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <h2 className="text-2xl sm:text-[32px] font-bold text-[#1E1E1E]">
                        {activeTab === 'slots' ? t('slotsTitle') : t('title')}
                    </h2>
                    <GradientOutlineButton
                        onClick={() => {
                            if (activeTab === 'slots') {
                                handleOpenAddSlotModal();
                            } else {
                                resetReservationForm();
                                setShowAddReservation(true);
                            }
                        }}
                        className="px-5 rounded-[12px]"
                    >
                        {t('new')}
                    </GradientOutlineButton>
                </div>
                <div className="flex items-center justify-start lg:justify-end gap-3 w-full lg:w-auto overflow-x-auto scrollbar-hide h-10">
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.trim() === '') fetchReservations();
                        }}
                        onSearch={() => {
                            if (searchQuery.trim() === '') fetchReservations();
                            else handleSearchAndFilter(false);
                        }}
                        placeholder={t('searchPlaceholder')}
                        showButton={true}
                        buttonText={t('search')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowFilterModal(true)}
                        className="h-9 w-9 flex items-center justify-center shrink-0 hover:bg-[#F8EFF4] rounded-lg transition-colors cursor-pointer"
                        title={t('filter.title')}
                    >
                        <FiFilter className="text-[#1E1E1E] text-xl" />
                    </button>
                </div>
            </div>

            {/* Subheader & Tabs matching Figma */}
            <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <p className="text-sm sm:text-base text-gray-500 whitespace-nowrap">{t('showingToday')}</p>
                <div className="flex items-center gap-2.5 overflow-x-auto w-full lg:w-auto scrollbar-hide">
                    {tabs.map(({ key, label }) => {
                        const isActive = activeTab === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`px-4 h-9 flex items-center justify-center border rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                                    isActive
                                        ? 'bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white border-transparent shadow-sm'
                                        : 'bg-white border-[#C2185B] text-[#1E1E1E] hover:bg-[#F8EFF4]'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Reservation Cards Grid (All / Offline Reservations / Online Reservations) */}
            {activeTab !== 'slots' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-2">
                    {isLoadingReservations ? (
                        <>
                            <ReservationSkeleton />
                            <ReservationSkeleton />
                            <ReservationSkeleton />
                            <ReservationSkeleton />
                            <ReservationSkeleton />
                            <ReservationSkeleton />
                        </>
                    ) : filteredReservations.length > 0 ? (
                        filteredReservations.map((reservation) => (
                            <ReservationCard
                                key={reservation.Reservations_id || reservation.id || reservation._id}
                                reservation={reservation}
                                customers={customers}
                                tables={allTables}
                                onEdit={handleEditReservation}
                                onDelete={handleDeleteReservation}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            {t('noReservations')}
                        </div>
                    )}
                </div>
            )}

            {/* Slots View matching Figma node-id=196-57529 */}
            {activeTab === 'slots' && (
                <div className="space-y-8 pt-2">
                    {isLoadingSlots ? (
                        <SlotSkeleton />
                    ) : isSlotsError ? (
                        <p className="text-sm text-red-600">{t('slots.loadError')}</p>
                    ) : (
                        <>
                            {['Morning', 'Lunch', 'Dinner'].map((timeOfDay) => {
                                const categorySlots = groupedDisplaySlots[timeOfDay] || [];
                                return (
                                    <div key={timeOfDay} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg sm:text-xl text-[#1E1E1E]">
                                                {t(`slots.${timeOfDay.toLowerCase()}`)}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAddSlotModal(timeOfDay)}
                                                className="flex items-center gap-1 px-3 py-0.5 sm:py-1 rounded-md border border-[#E0A8C8] text-[#8E1C58] hover:bg-[#FDF3F8] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                                                title={t('slots.addModalTitle', 'Add A New Slot')}
                                            >
                                                <span>+ New</span>
                                            </button>
                                        </div>
                                        {categorySlots.length === 0 ? (
                                            <p className="text-sm text-gray-500">{t('slots.noSlots')}</p>
                                        ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                                            {categorySlots.map((slot) => {
                                                const isFull = isSlotBooked(slot);
                                                return (
                                                    <div
                                                        key={slot.slot_id}
                                                        onClick={() => handleSlotPillClick(slot, isFull)}
                                                        className={`h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl text-xs sm:text-[14px] font-semibold flex items-center justify-between transition-all cursor-pointer shadow-xs select-none ${
                                                            isFull
                                                                ? 'bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white hover:opacity-95'
                                                                : 'bg-[#F8EFF4] text-[#1E1E1E] hover:bg-[#F2E0EB]'
                                                        }`}
                                                    >
                                                        <span className="truncate pr-1">
                                                            {slot.label || slot.from}{' '}
                                                            {isFull ? t('slots.full', '(Full)') : ''}
                                                        </span>
                                                        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditSlot(slot);
                                                                }}
                                                                className={`p-1 transition-opacity hover:opacity-75 cursor-pointer ${
                                                                    isFull ? 'text-white' : 'text-[#1E1E1E]'
                                                                }`}
                                                                title={t('common.edit', 'Edit')}
                                                            >
                                                                <FaPen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteSlot(slot);
                                                                }}
                                                                className={`p-1 transition-opacity hover:opacity-75 cursor-pointer ${
                                                                    isFull ? 'text-white' : 'text-[#D32F2F]'
                                                                }`}
                                                                title={t('common.delete', 'Delete')}
                                                            >
                                                                <FaTrash className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        )}
                                    </div>
                                );
                            })}

                        </>
                    )}
                </div>
            )}

            {/* Filter Modal matching Figma node 196-66260 target 2 */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-[440px] rounded-[24px] p-7 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setShowFilterModal(false)}
                            className="absolute top-6 right-6 text-2xl text-gray-700 hover:text-black leading-none"
                        >
                            ×
                        </button>
                        <h2 style={{ fontFamily: 'Manrope' }} className="text-xl font-bold mb-6 flex items-center gap-2 text-[#1E1E1E]">
                            <FiFilter className="text-lg" /> {t('filter.title')}
                        </h2>

                        <div style={{ fontFamily: 'Poppins' }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                    {t('filter.sortByDay')}
                                </label>
                                <div className="relative">
                                    <select
                                        value={filterDay}
                                        onChange={(e) => setFilterDay(e.target.value)}
                                        className="w-full border border-[#C2185B] rounded-xl px-4 py-2.5 text-sm bg-white text-gray-700 focus:outline-none appearance-none cursor-pointer pr-10"
                                    >
                                        <option value="Today">{t('filter.today')}</option>
                                        <option value="Tomorrow">{t('filter.tomorrow')}</option>
                                        <option value="This Week">{t('filter.thisWeek')}</option>
                                        <option value="This Month">{t('filter.thisMonth')}</option>
                                        <option value="All">{t('filter.allDates')}</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('filter.from')}
                                    </label>
                                    <input
                                        type="date"
                                        value={filterFromDate}
                                        onChange={(e) => setFilterFromDate(e.target.value)}
                                        className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('filter.to')}
                                    </label>
                                    <input
                                        type="date"
                                        min={filterFromDate || undefined}
                                        value={filterToDate}
                                        onChange={(e) => setFilterToDate(e.target.value)}
                                        className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-center w-full">
                                <button
                                    type="button"
                                    onClick={() => handleSearchAndFilter(true)}
                                    className="bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] min-w-[170px] py-2.5 rounded-xl text-white font-medium text-sm shadow-md hover:opacity-90 transition-opacity"
                                >
                                    {t('filter.save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Reservation Modal matching Figma node 196-66260 target 1 */}
            {showAddReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-[480px] rounded-[24px] p-7 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setShowAddReservation(false)}
                            className="absolute top-6 right-6 text-2xl text-gray-700 hover:text-black leading-none"
                        >
                            ×
                        </button>
                        <h2 style={{ fontFamily: 'Manrope' }} className="text-2xl font-bold mb-6 text-[#1E1E1E]">
                            {t('form.addTitle')}
                        </h2>
                        <form style={{ fontFamily: 'Poppins' }} className="space-y-4" onSubmit={handleSubmitReservation}>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                    {t('form.selectCustomer')}
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedCustomer}
                                        onChange={handleCustomerSelect}
                                        className="w-full border border-[#C2185B] rounded-xl px-4 py-2.5 text-sm bg-white text-gray-700 focus:outline-none appearance-none cursor-pointer pr-10"
                                    >
                                        <option value="">{t('form.options.select')}</option>
                                        {customers.map((customer) => (
                                            <option key={customer.Customer_id} value={customer.Customer_id}>
                                                {customer.Name} - {customer.phone}
                                            </option>
                                        ))}
                                        <option value="New Customer">{t('form.newCustomer')}</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('form.date')}
                                    </label>
                                    <input
                                        type="date"
                                        min={getTodayDateString()}
                                        value={reservationDate}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && val < getTodayDateString()) {
                                                toast.error(t('validation.pastDateNotAllowed'));
                                                return;
                                            }
                                            setReservationDate(val);
                                            setSelectedSlot('');
                                        }}
                                        className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('form.selectTable')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            onChange={handleTableSelect}
                                            value=""
                                            className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer pr-9"
                                        >
                                            <option value="">{t('form.options.selectTable')}</option>
                                            {tables
                                                .filter((tb) => !selectedTables.includes(tb.Table_id))
                                                .map((table) => (
                                                    <option key={table.Table_id} value={table.Table_id}>
                                                        {table['Table-name']} ({t('form.seats')}: {table['Seating-Persons_Count']})
                                                    </option>
                                                ))}
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                                    </div>
                                    {selectedTables.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selectedTables.map((tableId) => {
                                                const table = allTables.find((tb) => tb.Table_id === tableId) || tables.find((tb) => tb.Table_id === tableId);
                                                return table ? (
                                                    <div
                                                        key={tableId}
                                                        className="bg-purple-100 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                                                    >
                                                        <span>{table['Table-name']}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTable(tableId)}
                                                            className="text-red-500 font-bold hover:text-red-700"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                    {t('form.slot')}*
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedSlot}
                                        onChange={(e) => setSelectedSlot(e.target.value)}
                                        className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer pr-9"
                                        required
                                    >
                                        <option value="">{t('form.options.selectSlot')}</option>
                                        {slots.filter((slot) => slot.isPersisted).map((slot) => (
                                            <option key={slot.slot_id} value={slot.slot_id}>
                                                {t(`slots.${slot.slots.toLowerCase()}`)} - {slot.slots_time}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('form.people')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={peopleCount}
                                        onChange={(e) => setPeopleCount(e.target.value)}
                                        placeholder="People Count"
                                        className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('form.paymentStatus')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={paymentStatus}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer pr-9"
                                        >
                                            <option value="UnPaid">{t('form.options.unpaid')}</option>
                                            <option value="Paid">{t('form.options.paid')}</option>
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                    {t('form.notes')}
                                </label>
                                <textarea
                                    rows="4"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={t('form.placeholders.notes')}
                                    className="w-full border border-[#C2185B] rounded-xl p-3 text-sm text-gray-700 focus:outline-none resize-none h-28"
                                />
                            </div>

                            <div className="pt-2 flex justify-center w-full">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] min-w-[170px] py-2.5 rounded-xl text-white font-medium text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isLoading ? t('form.creating') : t('form.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Customer Modal */}
            {showNewCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 sm:p-6 w-[90%] sm:w-[420px] relative shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 style={{ fontFamily: 'Manrope' }} className="text-xl sm:text-2xl font-bold mb-4">
                            {t('customerForm.title')}
                        </h2>
                        <button
                            type="button"
                            className="absolute top-4 right-4 text-2xl text-gray-600"
                            onClick={() => setShowNewCustomer(false)}
                        >
                            ×
                        </button>
                        <form style={{ fontFamily: 'Poppins' }} className="space-y-4" onSubmit={handleSubmitNewCustomer}>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('customerForm.phone')}</label>
                                <input
                                    type="text"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    placeholder={t('customerForm.placeholders.phone')}
                                    className="w-full border border-purple-300 rounded-lg px-3 py-2.5 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('customerForm.name')}</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder={t('customerForm.placeholders.name')}
                                    className="w-full border border-purple-300 rounded-lg px-3 py-2.5 text-sm"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="w-full sm:w-1/2">
                                    <label className="block text-sm font-medium mb-1">{t('customerForm.dob')}</label>
                                    <input
                                        type="date"
                                        max={getTodayDateString()}
                                        value={newDOB}
                                        onChange={(e) => setNewDOB(e.target.value)}
                                        className="bg-[#F8EFF4] w-full border border-purple-300 rounded-lg px-3 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                                <div className="w-full sm:w-1/2">
                                    <label className="block text-sm font-medium mb-1">{t('customerForm.table')}</label>
                                    <select
                                        value={newTable}
                                        onChange={(e) => setNewTable(e.target.value)}
                                        className="bg-[#F8EFF4] w-full border border-purple-300 rounded-lg px-3 py-2.5 text-sm"
                                    >
                                        <option value="">{t('form.options.selectTable')}</option>
                                        {tables.map((table) => (
                                            <option key={table.Table_id} value={table.Table_id}>
                                                {table['Table-name']}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('customerForm.address')}</label>
                                <input
                                    type="text"
                                    value={newAddress}
                                    onChange={(e) => setNewAddress(e.target.value)}
                                    placeholder={t('customerForm.placeholders.address')}
                                    className="w-full border border-purple-300 rounded-lg px-3 py-2.5 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('customerForm.notes')}</label>
                                <textarea
                                    placeholder={t('customerForm.placeholders.notes')}
                                    rows="3"
                                    value={newNotes}
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    className="w-full border border-purple-300 rounded-lg px-3 py-2.5 text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] w-full py-2.5 text-white font-semibold rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? t('customerForm.creating') : t('customerForm.save')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Reservation Modal matching Figma styling */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-[480px] p-7 sm:p-8 relative shadow-2xl max-h-[92vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setShowEditModal(false);
                                resetReservationForm();
                            }}
                            className="absolute top-6 right-6 text-2xl text-gray-700 hover:text-black leading-none"
                        >
                            ×
                        </button>
                        <h2 style={{ fontFamily: 'Manrope' }} className="text-2xl font-bold mb-6 text-[#1E1E1E]">
                            {t('form.editTitle')}
                        </h2>
                        <form style={{ fontFamily: 'Poppins' }} onSubmit={handleUpdateReservation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                    {t('form.title')}*
                                </label>
                                <input
                                    type="text"
                                    value={reservationTitle}
                                    onChange={(e) => setReservationTitle(e.target.value)}
                                    placeholder={t('form.placeholders.title')}
                                    className="w-full border border-[#C2185B] rounded-xl px-4 py-2.5 text-sm bg-white text-gray-700 focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('form.date')}
                                    </label>
                                    <input
                                        type="date"
                                        min={
                                            getReservationDateValue(selectedReservation?.Date_time) < getTodayDateString()
                                                ? undefined
                                                : getTodayDateString()
                                        }
                                        value={reservationDate}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (
                                                val &&
                                                val < getTodayDateString() &&
                                                val !== getReservationDateValue(selectedReservation?.Date_time)
                                            ) {
                                                toast.error(t('validation.pastDateNotAllowed'));
                                                return;
                                            }
                                            setReservationDate(val);
                                        }}
                                        className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('form.selectFloor')}*
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedFloor}
                                            onChange={(e) => setSelectedFloor(e.target.value)}
                                            className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer pr-9"
                                        >
                                            <option value="">{t('form.options.selectFloor')}</option>
                                            {floors.map((floor) => (
                                                <option key={floor.Floor_id} value={floor.Floor_id}>
                                                    {floor.Floor_Name}
                                                </option>
                                            ))}
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('form.people')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={peopleCount}
                                        onChange={(e) => setPeopleCount(e.target.value)}
                                        className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                        {t('form.paymentStatus')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={paymentStatus}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            className="bg-[#FAF5F8] w-full border border-[#C2185B] rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer pr-9"
                                        >
                                            <option value="UnPaid">{t('form.options.unpaid')}</option>
                                            <option value="Paid">{t('form.options.paid')}</option>
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-[#1E1E1E]">
                                    {t('form.notes')}
                                </label>
                                <textarea
                                    rows="4"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={t('form.placeholders.notes')}
                                    className="w-full border border-[#C2185B] rounded-xl p-3 text-sm text-gray-700 focus:outline-none resize-none h-28"
                                />
                            </div>
                            <div className="pt-2 flex justify-center w-full">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] min-w-[170px] py-2.5 rounded-xl text-white font-medium text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isLoading ? t('form.updating') : t('form.update')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-[90%] sm:w-[400px] text-center">
                        <h2 className="text-lg sm:text-xl font-bold text-start">{t('delete.title')}</h2>
                        <p className="text-base sm:text-lg font-medium mb-6 text-start text-black">
                            {t('delete.warning')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-5 py-2 border border-red-400 w-full rounded-lg text-red-500 hover:bg-red-50"
                            >
                                {t('delete.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                className="bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] px-5 py-2 text-white rounded-lg w-full"
                            >
                                {t('delete.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Success Modal */}
            {showUpdateSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setShowUpdateSuccess(false)} />
                    <div style={{ fontFamily: 'Poppins' }} className="bg-white max-w-md w-full p-6 rounded-2xl text-center shadow-lg relative z-50">
                        <div className="flex justify-center mb-4">
                            <IoCheckmarkCircle className="text-[#34C759] text-5xl sm:text-6xl" />
                        </div>
                        <h3 className="text-xl sm:text-2xl pt-2 font-bold text-[#34C759] mb-2">
                            {t('success.updatedTitle')}
                        </h3>
                        <p className="text-base sm:text-lg pt-3 font-bold text-black mb-6">
                            {t('success.updatedMessage')}
                        </p>
                        <button
                            type="button"
                            className="bg-[#34C759] text-white px-6 sm:px-8 py-2.5 mt-4 rounded-lg text-sm sm:text-base"
                            onClick={() => setShowUpdateSuccess(false)}
                        >
                            {t('success.continue')}
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Success Modal */}
            {showDeleteSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setShowDeleteSuccess(false)} />
                    <div style={{ fontFamily: 'Poppins' }} className="bg-white max-w-md w-full p-6 rounded-2xl text-center shadow-lg relative z-50">
                        <div className="flex justify-center mb-4">
                            <img src={cancel} alt="Cancel" />
                        </div>
                        <h3 className="text-xl sm:text-2xl pt-2 font-bold text-[#C51800] mb-2">
                            {t('delete.deletedTitle')}
                        </h3>
                        <p className="text-base sm:text-lg pt-3 font-bold text-black mb-6">
                            {t('delete.deletedMessage')}
                        </p>
                        <button
                            type="button"
                            className="bg-[#C51800] text-white px-6 sm:px-8 py-2.5 mt-4 rounded-lg text-sm sm:text-base"
                            onClick={() => setShowDeleteSuccess(false)}
                        >
                            {t('delete.continue')}
                        </button>
                    </div>
                </div>
            )}

            {/* Add / Edit Slot Modal matching Figma 196-57529 */}
            <SlotModal
                isOpen={showSlotModal}
                onClose={() => {
                    setShowSlotModal(false);
                    setSelectedSlotToEdit(null);
                }}
                onSave={handleSaveSlot}
                slot={selectedSlotToEdit}
                initialCategory={slotModalCategory}
                isSubmitting={isSlotSubmitting}
            />

            {/* Delete Slot Confirmation Modal */}
            {showDeleteSlotConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-[Poppins] animate-in fade-in duration-150">
                    <div className="bg-white rounded-[24px] shadow-2xl p-6 w-full max-w-[380px] text-center border border-gray-100">
                        <h3 className="text-xl font-bold text-[#1E1E1E] mb-2">
                            {t('slots.deleteConfirmTitle', 'Delete Slot')}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {t('slots.deleteConfirmWarning', 'Are you sure you want to delete this slot?')}
                            {slotToDelete && (
                                <span className="block font-semibold text-[#1E1E1E] mt-1.5">
                                    {slotToDelete.label || slotToDelete.from}{' '}
                                    {slotToDelete.slots ? `(${slotToDelete.slots})` : ''}
                                </span>
                            )}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteSlotConfirm(false);
                                    setSlotToDelete(null);
                                }}
                                disabled={isSlotSubmitting}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                {t('form.cancel', 'Cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteSlot}
                                disabled={isSlotSubmitting}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-colors shadow-md cursor-pointer disabled:opacity-50"
                            >
                                {isSlotSubmitting ? t('slots.saving', 'Deleting...') : t('common.delete', 'Delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Reservations;
