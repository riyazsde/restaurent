/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import bill from '../assets/bill.svg'
import { FaSearch, FaPrint, FaUtensils, FaEdit } from 'react-icons/fa';
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdNotes } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { usePaymentOptions, useCreatePayment, useCreatePosOrder, useTaxSetup, useRestaurant } from '../../hooks/queries/usePos';
import useAuthStore from '../../store/authStore';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useSearchCustomersMutation } from '../../hooks/queries/useCustomers';
import { useTables } from '../../hooks/queries/useTables';
import { useKitchenStations } from '../../hooks/queries/useKitchen';
import posService from '../../services/posService';
import Dropdown from '../common/Dropdown';
import { useTranslation } from 'react-i18next';
import { useDragScroll } from './hooks/useDragScroll';
import {
    formatReceiptDate,
    validatePhoneNumber as helperValidatePhone,
    calculateItemPrices,
    calculateCartTotals,
    buildPosOrderPayload,
    formatCurrency
} from './utils/posHelpers';
import PosCheckoutModal from './modals/PosCheckoutModal';
import invoiceService from '../../services/invoiceService';

/* ------------------------------------------------------------------ */
/* Fetch configured restaurant slots for the selected table           */
/* ------------------------------------------------------------------ */
const useRestaurantSlots = () => {
    return useQuery({
        queryKey: ['restaurant-slot-items'],
        queryFn: async () => {
            const response = await api.get('/restaurant/restaurant_slot/items');
            return response.data;
        },
        staleTime: 60 * 1000,
    });
};

/* ------------------------------------------------------------------ */
/* Inline component: SlotPicker                                       */
/* ------------------------------------------------------------------ */
const SLOT_TYPE_LABELS = {
    morning: 'Morning',
    lunch: 'Lunch',
    dinner: 'Dinner',
};

const SlotChip = ({ slot, selected, onSelect }) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(slot)}
            title={slot.time}
            className={[
                'px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                selected
                    ? 'bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-800 border-purple-200 hover:border-purple-500 hover:bg-purple-50',
            ].join(' ')}
        >
            {slot.time}
        </button>
    );
};

const SlotPicker = ({
    response,
    loading,
    error,
    tableId,
    selectedSlot,
    onSelectSlot,
}) => {
    const { t } = useTranslation(['pos', 'common']);

    const slotsByType = useMemo(() => {
        const slots = Array.isArray(response?.data) ? response.data : [];
        return slots.reduce((groups, slot) => {
            const type = String(slot.slot_type || '').toLowerCase();
            if (groups[type]) groups[type].push(slot);
            return groups;
        }, { morning: [], lunch: [], dinner: [] });
    }, [response]);

    if (!tableId) {
        return (
            <div className="mb-3 text-[11px] text-gray-500 italic px-2 py-2 bg-gray-50 rounded-lg">
                {t('selectTableFirst', 'Select a table to see available time slots')}
            </div>
        );
    }
    if (loading) {
        return (
            <div className="mb-3 text-[11px] text-gray-500 px-2 py-2 bg-gray-50 rounded-lg animate-pulse">
                {t('loadingSlots', 'Loading slots...')}
            </div>
        );
    }
    if (error) {
        return (
            <div className="mb-3 text-[11px] text-red-600 px-2 py-2 bg-red-50 rounded-lg">
                {t('slotsError', 'Unable to load slots. Please try again.')}
            </div>
        );
    }
    if (Object.values(slotsByType).every((slots) => slots.length === 0)) {
        return (
            <div className="mb-3 text-[11px] text-gray-500 px-2 py-2 bg-gray-50 rounded-lg">
                {t('noSlots', 'No slots available for this table')}
            </div>
        );
    }

    return (
        <div className="mb-3 border border-purple-200 rounded-xl bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="flex items-center gap-1.5">
                    <FaClock className="text-purple-700 text-xs" />
                    <span className="text-[12px] font-semibold text-gray-800">
                        {t('selectSlot', 'Select Time Slot')}
                    </span>
                </div>
            </div>

            <div className="px-2 py-2 space-y-2 max-h-[220px] overflow-y-auto hide-scrollbar">
                    {['morning', 'lunch', 'dinner'].map((type) => {
                        const list = slotsByType[type];
                        if (list.length === 0) return null;
                        return (
                            <div key={type}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                                        {t(`slotTypes.${type}`, SLOT_TYPE_LABELS[type])}
                                    </span>
                                    <span className="text-[9px] text-gray-400">
                                        ({list.length})
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {list.map((slot) => (
                                        <SlotChip
                                            key={slot._id}
                                            slot={slot}
                                            selected={selectedSlot?._id === slot._id}
                                            onSelect={onSelectSlot}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

            {selectedSlot && (
                <div className="px-3 py-1.5 bg-purple-50 border-t border-purple-100 flex items-center justify-between">
                    <span className="text-[10px] text-purple-700 font-medium">
                        ✓ {t(`slotTypes.${selectedSlot.slot_type}`, selectedSlot.slot_type)} · {selectedSlot.time}
                    </span>
                    <button
                        type="button"
                        onClick={() => onSelectSlot(null)}
                        className="text-[10px] text-red-500 hover:underline"
                    >
                        {t('clear', 'Clear')}
                    </button>
                </div>
            )}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
const RightPanelAll = ({
    selectedDining,
    onDiningTypeSelect,
    onDropdownToggle,
    setShowBoxes,
    cartItems: cartItemsProp,
    setCartItems: setCartItemsProp,
    selectedCustomer: selectedCustomerProp,
    setSelectedCustomer: setSelectedCustomerProp,
    selectedSlot: selectedSlotProp,
    setSelectedSlot: setSelectedSlotProp,
    customers: customersProp,
    customerSearchTerm: customerSearchTermProp,
    setCustomerSearchTerm: setCustomerSearchTermProp,
    showCustomerDropdown: showCustomerDropdownProp,
    setShowCustomerDropdown: setShowCustomerDropdownProp,
    customerDropdownRef: customerDropdownRefProp,
    diningOption: diningOptionProp,
    handleDiningOptionSelect: handleDiningOptionSelectProp,
    selectedTable: selectedTableProp,
    tables: tablesProp,
    showTableSelection: showTableSelectionProp,
    setShowTableSelection: setShowTableSelectionProp,
    handleTableSelect: handleTableSelectProp,
    updateCartItemQuantity: updateCartItemQuantityProp,
    removeFromCart: removeFromCartProp,
    subTotal: subTotalProp,
    taxAmount: taxAmountProp,
    taxRate: taxRateProp,
    total: totalProp,
    handleSendToKitchen: handleSendToKitchenProp,
    isSubmitting: isSubmittingProp,
    handleCreateCustomer: handleCreateCustomerProp,
    handleUpdateCustomer: handleUpdateCustomerProp,
    onCustomerCreated: onCustomerCreatedProp,
    onCustomerUpdated: onCustomerUpdatedProp,
    currency: currencyProp,
    restaurantData: restaurantDataProp,
}) => {

    const currency = currencyProp || 'XOF';
    const { user: authUser } = useAuthStore();
    const { data: defaultRestaurantData } = useRestaurant();
    const restaurantData = restaurantDataProp || defaultRestaurantData;
    const restaurantObj = React.useMemo(() => {
        if (!restaurantData) return null;
        if (Array.isArray(restaurantData)) return restaurantData[0] || null;
        if (restaurantData?.data) {
            return Array.isArray(restaurantData.data) ? restaurantData.data[0] : restaurantData.data;
        }
        return restaurantData;
    }, [restaurantData]);

    const [showBillModal, setShowBillModal] = useState(false);
    const scrollRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItemIndex, setDeleteItemIndex] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { data: remotePaymentOptions = [], refetch: refetchPaymentOptions } = usePaymentOptions();
    const createPaymentMutation = useCreatePayment();
    const createPosOrderMutation = useCreatePosOrder();
    const createCustomerMutation = useCreateCustomer();
    const updateCustomerMutation = useUpdateCustomer();
    const searchCustomersMutation = useSearchCustomersMutation();
    const { getTables } = useTables();
    const fetchTables = () => getTables.refetch();
    const { data: defaultKitchenStations = [] } = useKitchenStations();
    const { data: defaultTaxSetup = [] } = useTaxSetup();
    const { data: defaultCustomers = [] } = useCustomers();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [paymentOptions, setPaymentOptions] = useState([]);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [orderTotal, setOrderTotal] = useState(0);
    const [createdOrderTotals, setCreatedOrderTotals] = useState(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [isPrintingPdf, setIsPrintingPdf] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [paymentReceipt, setPaymentReceipt] = useState(null);
    const receiptRef = useRef(null);

    /* -------------------- SLOT STATE -------------------- */
    const [localSelectedSlot, setLocalSelectedSlot] = useState(null);
    const selectedSlot = selectedSlotProp === undefined ? localSelectedSlot : selectedSlotProp;
    const setSelectedSlot = setSelectedSlotProp || setLocalSelectedSlot;
    /* ---------------------------------------------------- */

    useEffect(() => {
        if (remotePaymentOptions && remotePaymentOptions.length > 0) {
            const reversedOptions = [...remotePaymentOptions].reverse();
            setPaymentOptions(reversedOptions);
            if (!selectedPaymentMethod) {
                setSelectedPaymentMethod(reversedOptions[0].Payment_Options_id);
            }
        }
    }, [remotePaymentOptions]);

    const { t } = useTranslation(['pos', 'customer', 'common']);
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [newCustomerForm, setNewCustomerForm] = useState({
        phone: '',
        Name: '',
        DOB: '',
        Table_id: '',
        Notes: ''
    });

    const validatePhoneNumber = (phone) => {
        const res = helperValidatePhone(phone);
        if (!res.isValid) {
            return t(res.errorKey, res.defaultMsg);
        }
        return '';
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value;
        const filtered = val.replace(/[^\d+\-\s()]/g, '');
        const sanitized = filtered.startsWith('+')
            ? '+' + filtered.slice(1).replace(/\+/g, '')
            : filtered.replace(/\+/g, '');

        setNewCustomerForm(prev => ({ ...prev, phone: sanitized }));

        if (phoneError) {
            const err = validatePhoneNumber(sanitized);
            setPhoneError(err);
        }
    };

    const handlePhoneBlur = () => {
        if (newCustomerForm.phone?.trim()) {
            const err = validatePhoneNumber(newCustomerForm.phone);
            setPhoneError(err);
        }
    };

    const cartItems = cartItemsProp;
    const setCartItems = setCartItemsProp;

    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [kitchen, setKitchen] = useState(null);
    const [taxSetup, setTaxSetup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchingCustomers, setSearchingCustomers] = useState(false);

    const useNewProps = !!handleSendToKitchenProp;

    const availableTables = (useNewProps && tablesProp && tablesProp.length > 0) ? tablesProp : (tables || []);

    /* -------------------- SLOT QUERY -------------------- */
    const activeTable = useNewProps ? selectedTableProp : selectedTable;
    const activeTableId =
        activeTable?.table_id?.Table_id ||
        activeTable?.Table_id ||
        activeTable?.id;

    const {
        data: slotsResponse,
        isLoading: slotsLoading,
        isError: slotsError,
    } = useRestaurantSlots();

    /* ---------------------------------------------------- */

    const handleOpenNewCustomerModal = () => {
        setEditingCustomer(null);
        setPhoneError('');
        const currentTable = useNewProps ? selectedTableProp : selectedTable;
        const currentTableId = currentTable?.table_id?.Table_id || currentTable?.Table_id || currentTable?.id || '';
        setNewCustomerForm({
            phone: '',
            Name: '',
            DOB: '',
            Table_id: currentTableId ? String(currentTableId) : '',
            Notes: ''
        });
        if (availableTables.length === 0) {
            fetchTables();
        }
        setShowNewCustomerModal(true);
    };

    const handleOpenEditCustomerModal = (customer) => {
        if (!customer) return;
        const currentTable = useNewProps ? selectedTableProp : selectedTable;
        const currentTableId = customer.Table_id || currentTable?.table_id?.Table_id || currentTable?.Table_id || currentTable?.id || '';
        setEditingCustomer(customer);
        setPhoneError('');
        setNewCustomerForm({
            phone: customer.phone || '',
            Name: customer.Name || '',
            DOB: customer.DOB ? customer.DOB.split('T')[0] : '',
            Table_id: currentTableId ? String(currentTableId) : '',
            Notes: customer.Notes || ''
        });
        if (availableTables.length === 0) {
            fetchTables();
        }
        setShowNewCustomerModal(true);
    };

    const handleCreateCustomerSubmit = async (e) => {
        e.preventDefault();

        if (!newCustomerForm.phone?.trim() || !newCustomerForm.Name?.trim()) {
            toast.error(t('validation.requiredFields', 'Please fill in all required fields'));
            return;
        }

        const phoneValidationErr = validatePhoneNumber(newCustomerForm.phone);
        if (phoneValidationErr) {
            setPhoneError(phoneValidationErr);
            toast.error(phoneValidationErr);
            return;
        }

        setIsSubmittingCustomer(true);
        try {
            const isUpdating = Boolean(editingCustomer);
            const customerId = editingCustomer ? (editingCustomer.Customer_id || editingCustomer.id) : null;

            const payload = {
                phone: newCustomerForm.phone.trim().replace(/[\s\-()]/g, ''),
                Name: newCustomerForm.Name.trim(),
                DOB: newCustomerForm.DOB || null,
                Table_id: newCustomerForm.Table_id ? parseInt(newCustomerForm.Table_id, 10) : undefined,
                Notes: newCustomerForm.Notes?.trim() || '',
                Customer_type_id: editingCustomer?.Customer_type_id || 1,
                Status: true
            };

            let response;
            if (isUpdating && customerId) {
                const updatePayload = {
                    id: customerId,
                    Customer_id: customerId,
                    ...payload
                };
                if (handleUpdateCustomerProp) {
                    response = await handleUpdateCustomerProp(updatePayload);
                } else {
                    response = await updateCustomerMutation.mutateAsync(updatePayload);
                }
            } else {
                if (handleCreateCustomerProp) {
                    response = await handleCreateCustomerProp(payload);
                } else {
                    response = await createCustomerMutation.mutateAsync(payload);
                }
            }

            if (response && response.success !== false) {
                const successMsg = isUpdating
                    ? (response.message || t('validation.updateSuccess', 'Customer updated successfully!'))
                    : (response.message || t('validation.createSuccess', 'Customer created successfully!'));
                toast.success(successMsg);

                if (newCustomerForm.Table_id) {
                    const chosenTable = availableTables.find(tb => {
                        const tid = tb?.table_id?.Table_id || tb?.Table_id || tb?.id;
                        return String(tid) === String(newCustomerForm.Table_id);
                    });

                    if (chosenTable) {
                        if (useNewProps && handleTableSelectProp) {
                            handleTableSelectProp(chosenTable);
                        } else {
                            setSelectedTable(chosenTable);
                        }
                    }
                }

                const responseData = (response.data && typeof response.data === 'object') ? response.data : ((response.customer && typeof response.customer === 'object') ? response.customer : {});
                const updatedCust = {
                    Customer_id: customerId || responseData.Customer_id || response.id || response.Customer_id || Date.now(),
                    ...payload,
                    ...responseData
                };

                if (useNewProps) {
                    if (setSelectedCustomerProp) setSelectedCustomerProp(updatedCust);
                    if (setShowCustomerDropdownProp) setShowCustomerDropdownProp(false);
                    if (setCustomerSearchTermProp) setCustomerSearchTermProp('');
                } else {
                    setSelectedCustomer(updatedCust);
                    setSearchQuery(updatedCust.Name);
                    setCustomers(prev => {
                        const list = Array.isArray(prev) ? prev : [];
                        const index = list.findIndex(c => c.Customer_id === updatedCust.Customer_id);
                        if (index >= 0) {
                            const updated = [...list];
                            updated[index] = { ...updated[index], ...updatedCust };
                            return updated;
                        }
                        return [updatedCust, ...list];
                    });
                }

                if (isUpdating && onCustomerUpdatedProp) {
                    onCustomerUpdatedProp(updatedCust);
                } else if (onCustomerCreatedProp) {
                    onCustomerCreatedProp(updatedCust);
                }

                setShowNewCustomerModal(false);
                setEditingCustomer(null);
                setNewCustomerForm({
                    phone: '',
                    Name: '',
                    DOB: '',
                    Table_id: '',
                    Notes: ''
                });
            } else {
                toast.error(response?.message || (isUpdating ? t('validation.updateError', 'Failed to update customer') : t('validation.createError', 'Failed to create customer')));
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.error(error.message || t('validation.updateError', 'Failed to save customer'));
        } finally {
            setIsSubmittingCustomer(false);
        }
    };

    useDragScroll(scrollRef);

    const internalCustomerRef = useRef(null);
    const [showInternalCustomerDropdown, setShowInternalCustomerDropdown] = useState(false);

    const fetchDefaultCustomers = () => {
        if (defaultCustomers && Array.isArray(defaultCustomers)) {
            setCustomers(defaultCustomers);
        }
    };

    useEffect(() => {
        if (!useNewProps) {
            if (defaultKitchenStations.length > 0 && !kitchen) {
                setKitchen(defaultKitchenStations[0]);
            }
            if (defaultTaxSetup.length > 0 && !taxSetup) {
                setTaxSetup(defaultTaxSetup[0]);
            }
            if (getTables?.data && getTables.data.length > 0 && tables.length === 0) {
                const emptyTables = getTables.data.filter(
                    table => table['Table-Booking-Status_id'] === 1 || table['Table-Booking-Status_id']?.Name === 'Empty'
                );
                setTables(emptyTables.length > 0 ? emptyTables : getTables.data);
            }
            if (!searchQuery.trim() && defaultCustomers.length > 0 && customers.length === 0) {
                setCustomers(defaultCustomers);
            }

            const handleClickOutside = (e) => {
                if (internalCustomerRef.current && !internalCustomerRef.current.contains(e.target)) {
                    setShowInternalCustomerDropdown(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [useNewProps, defaultKitchenStations, defaultTaxSetup, getTables?.data, defaultCustomers, searchQuery, kitchen, taxSetup, tables.length, customers.length]);

    useEffect(() => {
        if (!useNewProps) {
            if (searchQuery.trim().length > 0) {
                searchCustomers();
            } else {
                fetchDefaultCustomers();
            }
        }
    }, [searchQuery, useNewProps, defaultCustomers]);

    const searchCustomers = async () => {
        try {
            setSearchingCustomers(true);
            const response = await searchCustomersMutation.mutateAsync(searchQuery);
            if (response?.success && Array.isArray(response.data)) {
                setCustomers(response.data);
            }
        } catch (error) {
            console.error('Error searching customers:', error);
        } finally {
            setSearchingCustomers(false);
        }
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const incrementQuantity = (index) => {
        const item = cartItems[index];
        if (!item) return;
        const currentQty = item.item_Quentry || 1;
        if (useNewProps && updateCartItemQuantityProp) {
            updateCartItemQuantityProp(item.cartId ?? index, currentQty + 1);
        } else {
            const updatedCart = [...cartItems];
            updatedCart[index] = { ...updatedCart[index], item_Quentry: currentQty + 1 };
            setCartItems(updatedCart);
        }
    };

    const decrementQuantity = (index) => {
        const item = cartItems[index];
        if (!item) return;
        const currentQty = item.item_Quentry || 1;
        if (currentQty > 1) {
            if (useNewProps && updateCartItemQuantityProp) {
                updateCartItemQuantityProp(item.cartId ?? index, currentQty - 1);
            } else {
                const updatedCart = [...cartItems];
                updatedCart[index] = { ...updatedCart[index], item_Quentry: currentQty - 1 };
                setCartItems(updatedCart);
            }
        }
    };

    const calculateSubtotal = () => {
        if (useNewProps && subTotalProp !== undefined) return subTotalProp;
        return calculateCartTotals(cartItems, taxSetup?.rate, currency).subTotal;
    };

    const calculateTax = () => {
        if (useNewProps && taxAmountProp !== undefined) return taxAmountProp;
        if (!taxSetup) return 0;
        return calculateCartTotals(cartItems, taxSetup.rate, currency).taxAmount;
    };

    const calculateTotal = () => {
        if (useNewProps && totalProp !== undefined) return totalProp;
        return calculateCartTotals(cartItems, taxSetup?.rate, currency).total;
    };
    const handleDropdownClick = () => {
        const newState = !isDropdownOpen;
        setIsDropdownOpen(newState);

        if (newState) {
            setIsTableDropdownOpen(false);
            if (useNewProps && setShowCustomerDropdownProp) {
                setShowCustomerDropdownProp(false);
            }
        }

        if (onDropdownToggle) {
            onDropdownToggle(newState);
        }

        if (!newState) {
            if (useNewProps && handleDiningOptionSelectProp) {
                handleDiningOptionSelectProp(null);
            } else if (onDiningTypeSelect) {
                onDiningTypeSelect(null);
            }
        }
    };

    const handleTableDropdownClick = () => {
        const newState = !isTableDropdownOpen;
        setIsTableDropdownOpen(newState);

        if (newState) {
            setIsDropdownOpen(false);
            if (useNewProps && setShowCustomerDropdownProp) {
                setShowCustomerDropdownProp(false);
            }
        }
    };

    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [note, setNote] = useState('');
    const [selectedNoteItemIndex, setSelectedNoteItemIndex] = useState(null);
    const [billNote, setBillNote] = useState('');
    const [noteTarget, setNoteTarget] = useState('item');

    const openModal1 = (index) => {
        setNoteTarget('item');
        setSelectedNoteItemIndex(index);
        const item = cartItems[index];
        setNote(item?.notes || '');
        setIsModalOpen1(true);
    };

    const closeModal1 = () => {
        setIsModalOpen1(false);
        setSelectedNoteItemIndex(null);
        setNoteTarget('item');
        setNote('');
    };

    const handleSave = () => {
        if (noteTarget === 'bill') {
            setBillNote(note);
            closeModal1();
            toast.success(t('noteSavedPrinting', 'Note saved, printing bill...'));
            setShowBillModal(true);
            setTimeout(() => {
                window.print();
            }, 150);
        } else if (selectedNoteItemIndex !== null && selectedNoteItemIndex >= 0 && selectedNoteItemIndex < cartItems.length) {
            const updatedCart = cartItems.map((it, idx) =>
                idx === selectedNoteItemIndex ? { ...it, notes: note } : it
            );
            if (useNewProps && setCartItemsProp) {
                setCartItemsProp(updatedCart);
            } else {
                setCartItems(updatedCart);
            }
            toast.success(t('noteUpdated', 'Note updated'));
            closeModal1();
        } else {
            closeModal1();
        }
    };

    const handleOptionClick = (type) => {
        if (useNewProps && handleDiningOptionSelectProp) {
            handleDiningOptionSelectProp(type);
        } else if (onDiningTypeSelect) {
            onDiningTypeSelect(type);
        }
        setIsDropdownOpen(false);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        if (deleteItemIndex !== null) {
            if (useNewProps && removeFromCartProp) {
                removeFromCartProp(deleteItemIndex);
            } else {
                const updatedCart = cartItems.filter((_, index) => index !== deleteItemIndex);
                setCartItems(updatedCart);
                if (updatedCart.length === 0 && setShowBoxes) {
                    setShowBoxes(false);
                }
            }
        }
        setShowDeleteModal(false);
        setDeleteItemIndex(null);
    };

    const loadPaymentOptions = async () => {
        if (!remotePaymentOptions || remotePaymentOptions.length === 0) {
            await refetchPaymentOptions();
        }
    };

    const createOrderForPayment = async () => {
        if (createdOrderId) return createdOrderId;

        const customer = useNewProps ? selectedCustomerProp : selectedCustomer;
        const dining = useNewProps ? diningOptionProp : selectedDining;
        const table = useNewProps ? selectedTableProp : selectedTable;

        const kitchenData = kitchen || (defaultKitchenStations.length > 0 ? defaultKitchenStations[0] : { Kitchen_id: 1 });

        setIsCreatingOrder(true);
        try {
            const orderData = buildPosOrderPayload({
                cartItems,
                selectedCustomer: customer,
                diningOption: dining,
                selectedTable: table,
                restaurantId: undefined,
                kitchenId: kitchenData?.Kitchen_id || kitchenData?.[0]?.Kitchen_id || 1,
                taxAmount: useNewProps ? taxAmountProp : calculateTax(),
                slot: selectedSlot,
                currency,
            });

            const response = await createPosOrderMutation.mutateAsync(orderData);

            if (response.success) {
                const posOrderId = response.data?.POS_Order_id || response.data?.Order_id;
                if (!posOrderId) {
                    throw new Error('The created order response did not include an order ID.');
                }
                setCreatedOrderId(posOrderId);
                const localSubtotal = Number(calculateSubtotal()) || 0;
                const localTax = Number(calculateTax()) || 0;
                const localTotal = Number(calculateTotal()) || localSubtotal + localTax;

                setOrderTotal(localTotal);
                setCreatedOrderTotals({
                    subTotal: localSubtotal,
                    taxAmount: localTax,
                    total: localTotal
                });
                try {
                    await invoiceService.generatePosInvoice(posOrderId);
                } catch (invErr) {
                    console.warn('POS invoice auto-generation note:', invErr);
                }
                return posOrderId;
            } else {
                toast.error('Failed to create order: ' + (response.message || 'Unknown error'));
                return false;
            }
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Error creating order: ' + (error.message || 'Unknown error'));
            return false;
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const validateOrderPrerequisites = () => {
        if (!cartItems || cartItems.length === 0) {
            toast.info('Please add items to cart first');
            return false;
        }
        const customer = useNewProps ? selectedCustomerProp : selectedCustomer;
        if (!customer) {
            toast.warn('Please select a customer first');
            return false;
        }
        const dining = useNewProps ? diningOptionProp : selectedDining;
        if (!dining) {
            toast.warn('Please select a dining option');
            return false;
        }
        const table = useNewProps ? selectedTableProp : selectedTable;
        if (dining === 'Dine in' && !table) {
            toast.warn('Please select a table for Dine in');
            return false;
        }
        if (dining === 'Dine in' && !selectedSlot) {
            toast.warn(t('pleaseSelectSlot', 'Please select a time slot for Dine in'));
            return false;
        }
        return true;
    };

    const handlePrintBill = async () => {
        if (!validateOrderPrerequisites()) return;
        setShowBillModal(true);
    };

    const handlePrintBillNow = async () => {
        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) {
            toast.error(t('pdfPopupBlocked', 'Allow pop-ups to open the order PDF.'));
            return;
        }

        setIsPrintingPdf(true);
        try {
            const orderId = await createOrderForPayment();
            if (!orderId) {
                pdfWindow.close();
                return;
            }

            const pdfBlob = await posService.getOrderPdf(orderId);
            if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
                throw new Error('The order PDF response was empty or invalid.');
            }

            const pdfUrl = URL.createObjectURL(pdfBlob);
            pdfWindow.location.href = pdfUrl;
            window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
        } catch (error) {
            console.error('Failed to print POS order PDF:', error);
            pdfWindow.close();
            toast.error(error.message || t('pdfPrintError', 'Unable to open the order PDF.'));
        } finally {
            setIsPrintingPdf(false);
        }
    };

    const handleGenerateBill = async () => {
        if (!validateOrderPrerequisites()) return;
        await loadPaymentOptions();
        const orderCreated = await createOrderForPayment();
        if (orderCreated) {
            setShowPaymentModal(true);
        }
    };

    const handlePosPaymentSuccess = (paymentResult) => {
        setShowPaymentModal(false);
        const customer = useNewProps ? selectedCustomerProp : selectedCustomer;
        const receiptData = {
            orderTotal: orderTotal,
            subTotal: createdOrderTotals?.subTotal ?? (useNewProps ? subTotalProp : calculateSubtotal()),
            tax: createdOrderTotals?.taxAmount ?? (useNewProps ? taxAmountProp : calculateTax()),
            customerName: customer?.Name || 'Guest',
            paymentMethod: paymentResult.paymentMethod || 'Paid',
            orderId: createdOrderId,
            date: new Date().toISOString(),
            maskedPan: paymentResult.maskedPan,
            authCode: paymentResult.authCode,
            customerPhone: paymentResult.customerPhone,
            changeDue: paymentResult.changeDue
        };
        setPaymentReceipt(receiptData);
        setShowReceiptModal(true);
        setCreatedOrderId(null);
        setOrderTotal(0);
        setCreatedOrderTotals(null);
        setSelectedPaymentMethod(null);
    };

    const handleProcessPayment = async () => {
        if (!selectedPaymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        if (!createdOrderId) {
            toast.error('Order not created');
            return;
        }

        setIsProcessingPayment(true);
        try {
            const paymentData = {
                Payment_Options_id: selectedPaymentMethod,
                paymentStatus: 'Success',
                Order_id: createdOrderId
            };

            const response = await createPaymentMutation.mutateAsync(paymentData);

            if (response.success) {
                setShowPaymentModal(false);
                const customer = useNewProps ? selectedCustomerProp : selectedCustomer;

                const receiptData = {
                    ...response.data,
                    orderTotal: orderTotal,
                    subTotal: createdOrderTotals?.subTotal ?? (useNewProps ? subTotalProp : calculateSubtotal()),
                    tax: createdOrderTotals?.taxAmount ?? (useNewProps ? taxAmountProp : calculateTax()),
                    customerName: customer?.Name || 'Guest',
                    paymentMethod: paymentOptions.find(opt => opt.Payment_Options_id === selectedPaymentMethod)?.PaymentOption?.[0]?.option || 'N/A'
                };

                setPaymentReceipt(receiptData);
                setShowReceiptModal(true);
                toast.success('Payment processed successfully!');

                setCreatedOrderId(null);
                setOrderTotal(0);
                setCreatedOrderTotals(null);
                setSelectedPaymentMethod(null);
            } else {
                toast.error('Payment failed: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Error processing payment: ' + (error.message || 'Unknown error'));
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleSendToKitchen = async () => {
        if (!selectedCustomer) {
            toast.error('Please select a customer');
            return;
        }
        if (!selectedDining) {
            toast.error('Please select a dining option');
            return;
        }
        if (selectedDining === 'Dine in' && !selectedTable) {
            toast.error('Please select a table for dine-in');
            return;
        }
        if (!kitchen) {
            toast.error('Kitchen not configured');
            return;
        }
        if (cartItems.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        try {
            setLoading(true);

            const orderData = buildPosOrderPayload({
                cartItems,
                selectedCustomer,
                diningOption: selectedDining,
                selectedTable,
                kitchenId: kitchen.Kitchen_id,
                taxAmount: calculateTax(),
                slot: selectedSlot,
                currency
            });

            const response = await createPosOrderMutation.mutateAsync(orderData);

            if (response.success) {
                setShowSuccessModal(true);
                setIsModalOpen(false);
            } else {
                alert('Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Error creating order: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };
    const rawCustomerList = useNewProps ? (customersProp || []) : (customers || []);
    const currentSearchTerm = (useNewProps ? customerSearchTermProp : searchQuery) || '';

    const filteredCustomerList = currentSearchTerm.trim()
        ? rawCustomerList.filter(c =>
            c.Name?.toLowerCase().includes(currentSearchTerm.trim().toLowerCase()) ||
            c.phone?.includes(currentSearchTerm.trim())
          )
        : rawCustomerList;

    const displayedCustomers = currentSearchTerm.trim()
        ? filteredCustomerList.slice(0, 10)
        : filteredCustomerList.slice(0, 5);

    const shouldShowCustomerDropdown = useNewProps
        ? Boolean(showCustomerDropdownProp)
        : Boolean(showInternalCustomerDropdown);

    const rawRestaurantName = restaurantObj?.restaurant_name
        || restaurantObj?.Name
        || restaurantObj?.store_name
        || restaurantData?.restaurant_name
        || 'TRIAXX RESTAURANT';
    const cleanRestaurantName = rawRestaurantName
        .replace(/\bbar\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    const restaurantName = cleanRestaurantName
        ? (cleanRestaurantName.toLowerCase().includes('restaurant') ? cleanRestaurantName : `${cleanRestaurantName} RESTAURANT`)
        : 'TRIAXX RESTAURANT';
    const restaurantAddress = restaurantObj?.address
        || restaurantObj?.Location
        || restaurantObj?.location
        || '';
    const restaurantPhone = restaurantObj?.phone
        || restaurantObj?.Phone_Number
        || restaurantObj?.contact
        || '';

    const billNumber = paymentReceipt?.Order_id || createdOrderId || `BILL-${Date.now().toString().slice(-6)}`;
    const billDate = formatReceiptDate(paymentReceipt?.CreateAt || new Date().toISOString());
    const activeTableObj = useNewProps ? selectedTableProp : selectedTable;
    const tableDisplay = (typeof activeTableObj === 'string' ? activeTableObj : (
        activeTableObj?.table_id?.['Table-code']
        || activeTableObj?.table_id?.['Table-name']
        || activeTableObj?.['Table-code']
        || activeTableObj?.['Table-name']
        || activeTableObj?.table_name
        || activeTableObj?.table_number
        || (activeTableObj?.Table_No ? `Table ${activeTableObj.Table_No}` : null)
    ))
        || (useNewProps ? diningOptionProp : selectedDining)
        || 'Dine in';
    const diningOptionDisplay = (useNewProps ? diningOptionProp : selectedDining) || t('dineIn', 'Dine in');
    const currentCustomer = useNewProps ? selectedCustomerProp : selectedCustomer;
    const customerName = currentCustomer?.Name || t('walkInCustomer', 'Walk-in Customer');
    const customerPhone = currentCustomer?.phone || currentCustomer?.Phone_Number || '';
    const cashierName = authUser?.Name || authUser?.name || 'Staff';

    const displaySubtotal = createdOrderTotals?.subTotal ?? (useNewProps ? subTotalProp : calculateSubtotal());
    const displayTaxRate = useNewProps ? taxRateProp : (taxSetup?.rate || 0);
    const displayTaxAmount = createdOrderTotals?.taxAmount ?? (useNewProps ? taxAmountProp : calculateTax());
    const displayTotal = createdOrderTotals?.total ?? (useNewProps ? totalProp : calculateTotal());

    return (
        <>
            <div className="bg-white border border-[#D95A82] rounded-2xl shadow-sm flex flex-col min-h-[710px]">

                <div className='border-b border-gray-200 flex-shrink-0'>
                    <div className='p-4'>
                        <div className="mb-4">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1" ref={useNewProps ? customerDropdownRefProp : internalCustomerRef}>
                                    <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    {((useNewProps ? (selectedCustomerProp || customerSearchTermProp) : (selectedCustomer || searchQuery))) && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (useNewProps) {
                                                    if (setSelectedCustomerProp) setSelectedCustomerProp(null);
                                                    if (setCustomerSearchTermProp) setCustomerSearchTermProp('');
                                                    if (setShowCustomerDropdownProp) setShowCustomerDropdownProp(true);
                                                } else {
                                                    setSelectedCustomer(null);
                                                    setSearchQuery('');
                                                    setShowInternalCustomerDropdown(true);
                                                }
                                            }}
                                            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 transition-colors"
                                            aria-label="Clear customer"
                                            title="Clear"
                                        >
                                            <IoMdClose size={18} />
                                        </button>
                                    )}
                                    <input
                                        type="text"
                                        placeholder={t('searchCustomer', 'Search Customer')}
                                        value={useNewProps ? (selectedCustomerProp ? selectedCustomerProp.Name : customerSearchTermProp || '') : (selectedCustomer ? selectedCustomer.Name : searchQuery)}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (useNewProps) {
                                                if (setCustomerSearchTermProp) setCustomerSearchTermProp(val);
                                                if (setShowCustomerDropdownProp) setShowCustomerDropdownProp(true);
                                                if (selectedCustomerProp && setSelectedCustomerProp) setSelectedCustomerProp(null);
                                            } else {
                                                setSearchQuery(val);
                                                setShowInternalCustomerDropdown(true);
                                                if (selectedCustomer) setSelectedCustomer(null);
                                            }
                                        }}
                                        onFocus={() => {
                                            if (useNewProps) {
                                                if (setShowCustomerDropdownProp) setShowCustomerDropdownProp(true);
                                            } else {
                                                setShowInternalCustomerDropdown(true);
                                            }
                                        }}
                                        className="w-full pl-4 pr-16 py-3 bg-gradient-to-b from-[#6A1B9A1A] to-[#D32F2F1A] border-none text-gray-900 rounded-xl text-sm font-manrope font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder-gray-600"
                                    />
                                    {shouldShowCustomerDropdown && (
                                        <div className="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                            {searchingCustomers ? (
                                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                    Searching...
                                                </div>
                                            ) : displayedCustomers.length > 0 ? (
                                                <>
                                                    {!currentSearchTerm && (
                                                        <div className="px-3.5 py-1.5 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between border-b border-gray-100">
                                                            <span>Default Customers ({displayedCustomers.length})</span>
                                                            <span className="text-[10px] text-gray-400 font-normal lowercase">type to search</span>
                                                        </div>
                                                    )}
                                                    {displayedCustomers.map((customer) => (
                                                        <div
                                                            key={customer.Customer_id}
                                                            className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-b-0 flex items-center justify-between group"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                if (useNewProps) {
                                                                    if (setSelectedCustomerProp) setSelectedCustomerProp(customer);
                                                                    if (setShowCustomerDropdownProp) setShowCustomerDropdownProp(false);
                                                                    if (setCustomerSearchTermProp) setCustomerSearchTermProp('');
                                                                } else {
                                                                    setSelectedCustomer(customer);
                                                                    setSearchQuery('');
                                                                    setShowInternalCustomerDropdown(false);
                                                                }
                                                            }}
                                                        >
                                                            <div>
                                                                <p className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">{customer.Name}</p>
                                                                <p className="text-xs text-gray-500">{customer.phone}</p>
                                                            </div>
                                                            {customer.Table_id && (
                                                                <span className="text-[11px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">
                                                                    Table #{customer.Table_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                    {currentSearchTerm ? 'No customers found' : 'No customers available'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenNewCustomerModal}
                                    className="px-6 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-primary hover:opacity-90 active:scale-95 transition-all whitespace-nowrap shadow-sm"
                                >
                                    {t('add', 'Add')}
                                </button>
                            </div>
                            {(useNewProps ? selectedCustomerProp : selectedCustomer) && (
                                <div className="mt-2 p-2.5 bg-purple-50 rounded-xl text-sm border border-purple-200/60 flex items-center justify-between">
                                    <div
                                        className="cursor-pointer flex-1"
                                        onClick={() => handleOpenEditCustomerModal(useNewProps ? selectedCustomerProp : selectedCustomer)}
                                        title="Click to edit/update customer in API"
                                    >
                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                            <span>{(useNewProps ? selectedCustomerProp : selectedCustomer).Name}</span>
                                            <span className="text-[11px] font-normal px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md">{t('edit', 'Edit')}</span>
                                        </div>
                                        <div className="text-gray-500 text-xs">{(useNewProps ? selectedCustomerProp : selectedCustomer).phone}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditCustomerModal(useNewProps ? selectedCustomerProp : selectedCustomer)}
                                            className="text-gray-500 hover:text-purple-700 p-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                                            title="Edit/Update Customer"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (useNewProps && setSelectedCustomerProp) {
                                                    setSelectedCustomerProp(null);
                                                } else {
                                                    setSelectedCustomer(null);
                                                    setSearchQuery('');
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Remove Customer"
                                        >
                                            <IoMdClose size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-3 relative ">
                            <Dropdown
                                options={['Dine in', 'Take away']}
                                value={useNewProps ? diningOptionProp : selectedDining}
                                onChange={(val) => handleOptionClick(val)}
                                onOpenChange={(open) => {
                                    if (onDropdownToggle) onDropdownToggle(open);
                                    if (open && useNewProps && setShowCustomerDropdownProp) setShowCustomerDropdownProp(false);
                                }}
                                placeholder={t('orderType', 'Dining Option')}
                                ariaLabel="Select Dining Option"
                            />
                        </div>

                        <div className="mb-3 relative">
                            <Dropdown
                                options={useNewProps ? tablesProp : tables}
                                value={useNewProps ? selectedTableProp : selectedTable}
                                onChange={(table) => {
                                    if (useNewProps && handleTableSelectProp) {
                                        handleTableSelectProp(table);
                                    } else {
                                        setSelectedTable(table);
                                    }

                                    const currentCust = useNewProps ? selectedCustomerProp : selectedCustomer;
                                    const newTableId = table?.table_id?.Table_id || table?.Table_id || table?.id;
                                    if (currentCust && (currentCust.Customer_id || currentCust.id) && newTableId) {
                                        updateCustomerMutation.mutateAsync({
                                            id: currentCust.Customer_id || currentCust.id,
                                            Customer_id: currentCust.Customer_id || currentCust.id,
                                            phone: currentCust.phone,
                                            Name: currentCust.Name,
                                            DOB: currentCust.DOB ? currentCust.DOB.split('T')[0] : undefined,
                                            Table_id: parseInt(newTableId, 10),
                                            Notes: currentCust.Notes || '',
                                            Customer_type_id: currentCust.Customer_type_id || 1,
                                            Status: currentCust.Status !== undefined ? currentCust.Status : true
                                        }).catch(err => console.warn('Could not sync customer table in API:', err));
                                    }
                                }}
                                onOpenChange={(open) => {
                                    if (open && useNewProps && setShowCustomerDropdownProp) setShowCustomerDropdownProp(false);
                                }}
                                placeholder={t('selectTable', 'Select Table')}
                                displayKey={(table) => {
                                    if (!table) return '';
                                    if (typeof table === 'string' || typeof table === 'number') return String(table);
                                    if (table.table_id && typeof table.table_id === 'object') {
                                        const code = table.table_id['Table-code'] || table.table_id['Table-name'] || table.table_id.table_name || `Table ${table.table_id.Table_id || ''}`;
                                        const floor = table.floor_id?.Floor_Name || table.Floor_Name;
                                        return floor ? `${code} - ${floor}` : code;
                                    }
                                    const code = table['Table-code'] || table['Table-name'] || table.table_name || table.table_number || (table.Table_No ? `Table ${table.Table_No}` : null) || `Table ${table.Table_id || table.table_id || table.id || ''}`;
                                    const floor = table.floor_id?.Floor_Name || table.Floor_Name;
                                    return floor ? `${code} - ${floor}` : code;
                                }}
                                ariaLabel="Select Table"
                            />
                        </div>

                        {/* -------------------- Time slot picker (replaces duplicate dropdown) -------------------- */}
                        <SlotPicker
                            response={slotsResponse}
                            loading={slotsLoading}
                            error={slotsError}
                            tableId={activeTableId}
                            selectedSlot={selectedSlot}
                            onSelectSlot={setSelectedSlot}
                        />
                    </div>
                </div>
                <div ref={scrollRef} className="flex-1 min-h-[160px] max-h-[360px] overflow-y-auto hide-scrollbar mt-4 px-4 pb-4">
                    {cartItems.length > 0 ? (
                        cartItems.map((item, index) => {
                            const { basePrice, variantPrice, addonPrice, totalPrice } = calculateItemPrices(item);

                            return (
                                <div key={index} style={{ fontFamily: 'Manrope' }} className={`${index > 0 ? 'mt-4' : ''} relative border border-[#D95A82] rounded-2xl p-4 bg-white shadow-md`}>
                                    <button
                                        onClick={() => {
                                            setDeleteItemIndex(useNewProps ? item.cartId : index);
                                            setShowDeleteModal(true);
                                        }}
                                        className="absolute top-3 right-3 text-red-500"
                                    >
                                        <FaTrashAlt size={14} />
                                    </button>

                                    <div className="mb-2">
                                        <p className="font-bold text-[20px]">
                                            #{index + 1} {item.itemDetails?.['item-name'] || item.itemDetails?.item_name || item.itemDetails?.Title || item.itemDetails?.Name || item.itemDetails?.name || item.item_name || item.name || 'Dish'}
                                        </p>

                                        <div className="mt-1 space-y-0.5">
                                            <p className="text-[14px] text-gray-700">
                                                {t('base', 'Base')}: {formatCurrency(basePrice, currency)}
                                            </p>

                                            {variantPrice > 0 && (
                                                <p className="text-[11px] text-gray-500 pl-2">
                                                    + {t('variant', 'Variant')} ({item.selectedVariants ? item.selectedVariants.map(v => v.Variants).join(', ') : item.variantDetails?.item_Variants_id?.Variants}): {formatCurrency(variantPrice, currency)}
                                                </p>
                                            )}

                                            {addonPrice > 0 && (
                                                <p className="text-[11px] text-gray-500 pl-2">
                                                    + {t('addon', 'Addon')} ({item.selectedAddons ? item.selectedAddons.map(a => a.Addons).join(', ') : item.addonDetails?.item_Addons_id?.Addons}): {formatCurrency(addonPrice, currency)}
                                                </p>
                                            )}

                                            <p className="text-[16px] font-semibold text-[#9C2C77] mt-1">
                                                {formatCurrency(basePrice + variantPrice + addonPrice, currency)} × {item.item_Quentry} = <span className="font-bold text-[18px]">{formatCurrency(totalPrice, currency)}</span>
                                            </p>
                                            {item.notes && (
                                                <div className="mt-1.5 text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                                                    <span className="font-semibold">{t('notes', 'Note')}:</span>
                                                    <span className="truncate">{item.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 flex-wrap gap-y-2">
                                        <div className="flex items-center gap-3">
                                            <button
                                                className="bg-gradient-to-b from-purple-700 to-pink-600 text-white rounded w-7 h-7 flex items-center justify-center hover:opacity-90 transition-opacity"
                                                onClick={() => decrementQuantity(index)}
                                            >
                                                <FaMinus size={10} />
                                            </button>
                                            <span className="text-sm font-semibold">{item.item_Quentry}</span>
                                            <button
                                                className="bg-gradient-to-b from-purple-700 to-pink-600 text-white rounded w-7 h-7 flex items-center justify-center hover:opacity-90 transition-opacity"
                                                onClick={() => incrementQuantity(index)}
                                            >
                                                <FaPlus size={10} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openModal1(index)}
                                                className="bg-[#F2F2F2] hover:bg-gray-200 text-[#ADADAD] hover:text-gray-800 ml-6 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                                            >
                                                <MdNotes size={14} /> {item.notes ? t('editNote', 'Edit Note') : t('addNotes', 'Add Notes')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <p className="text-lg">{t('emptyCart', 'Cart is empty')}</p>
                                <p className="text-sm mt-2">{t('emptyCartSubtext', 'Add items to get started')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {showDeleteModal && (
                    <>
                        <div
                            className="fixed inset-0 bg-black bg-opacity-40 z-40"
                            onClick={() => setShowDeleteModal(false)}
                        ></div>
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                            <div className="bg-white max-w-sm w-full p-6 rounded-xl text-center shadow-xl">
                                <h2 style={{ fontFamily: 'Manrope' }} className="text-[29px] font-semibold text-gray-800 mb-6">
                                    Delete item
                                </h2>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="border border-gray-300 w-[112px] text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-100"
                                    >
                                        No
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 text-sm w-[112px] rounded-md text-white"
                                        style={{
                                            background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className='border-t border-[#6A1B9A] flex-shrink-0'>
                    <div className='p-4'>
                        {cartItems.length > 0 && (
                            <div className="mb-4 space-y-2 bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('subtotal', 'Subtotal')}:</span>
                                    <span className="font-medium">{formatCurrency(useNewProps ? subTotalProp : calculateSubtotal(), currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('tax', 'Tax')} ({useNewProps ? taxRateProp : (taxSetup?.rate || 0)}%):</span>
                                    <span className="font-medium">{formatCurrency(useNewProps ? taxAmountProp : calculateTax(), currency)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                                    <span className="text-[#6A1B9A]">{t('total', 'Total')}:</span>
                                    <span className="text-[#D32F2F]">{formatCurrency(useNewProps ? totalProp : calculateTotal(), currency)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-3">
                            <button
                                onClick={handlePrintBill}
                                disabled={
                                    isCreatingOrder ||
                                    (useNewProps ? isSubmittingProp : false) ||
                                    cartItems.length === 0
                                }
                                className="flex items-center justify-center gap-2 text-[14px] font-manrope font-medium text-gray-900 py-2.5 border border-[#D95A82] rounded-lg w-1/2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                {isCreatingOrder ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FaPrint /> {t('printBill', 'Print bill')}
                                    </>
                                )}
                            </button>
                            {isModalOpen1 && (
                                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 no-print print:hidden">
                                    <div className="bg-white rounded-xl shadow-lg w-[90%] sm:w-[400px] relative px-6 py-6">
                                        <button
                                            onClick={closeModal1}
                                            className="absolute top-3 right-3 text-black text-xl"
                                        >
                                            <IoMdClose />
                                        </button>

                                        <h2 className="text-xl font-semibold text-start mb-4">{t('addNotes', 'Add Note')}</h2>
                                        <p className="text-sm text-gray-500 mb-2 text-start">
                                            (100 Characters Max)
                                        </p>

                                        <input
                                            type="text"
                                            placeholder="Enter your Notes"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            maxLength={100}
                                            className="w-full border border-pink-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />

                                        <button style={{
                                            background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)', fontFamily: 'Poppins'
                                        }}
                                            onClick={handleSave}
                                            className="w-full bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white py-2 rounded-lg text-sm font-medium"
                                        >
                                            {t('save', 'Save')}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    if (!validateOrderPrerequisites()) return;
                                    if (useNewProps && handleSendToKitchenProp) {
                                        handleSendToKitchenProp();
                                    } else {
                                        setIsModalOpen(true);
                                    }
                                }}
                                disabled={
                                    (useNewProps ? isSubmittingProp : loading) ||
                                    cartItems.length === 0
                                }
                                className="flex items-center justify-center gap-2 text-[14px] font-manrope font-medium text-gray-900 py-2.5 border border-[#D95A82] rounded-lg w-1/2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                {useNewProps && isSubmittingProp ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('orderSending', 'Sending...')}
                                    </>
                                ) : (
                                    <>
                                        <FaUtensils /> {t('sendToKitchen', 'Send to Kitchen')}
                                    </>
                                )}
                            </button>
                            {isModalOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 bg-black bg-opacity-40 z-40"
                                        onClick={() => setIsModalOpen(false)}
                                    />
                                    <div className="fixed z-50 inset-0 flex items-center justify-center px-4">
                                        <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative">
                                            <button
                                                onClick={() => setIsModalOpen(false)}
                                                className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-black"
                                            >
                                                <IoMdClose />
                                            </button>

                                            <h2 style={{ fontFamily: 'Manrope' }} className="text-[29px] font-bold mb-6 text-gray-900">Order Summary</h2>

                                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 mb-4">
                                                {cartItems.map((item, index) => {
                                                    const { totalPrice, quantity } = calculateItemPrices(item);
                                                    const addonNames = item.selectedAddons?.map(addon => addon.Addons).join(', ')
                                                        || item.addonDetails?.item_Addons_id?.Addons
                                                        || item.addonDetails?.Addons;
                                                    const variantNames = item.selectedVariants?.map(variant => variant.Variants).join(', ')
                                                        || item.variantDetails?.item_Variants_id?.Variants
                                                        || item.variantDetails?.Variants;

                                                    return (
                                                        <div key={index} className="border-b border-gray-200 pb-3">
                                                            <p className="text-gray-800 text-sm font-medium">
                                                                {(item.itemDetails?.['item-name'] || item.itemDetails?.item_name || item.itemDetails?.Title || item.itemDetails?.Name || item.itemDetails?.name || item.item_name || item.name || 'Dish')} x{quantity}
                                                            </p>                                                             <p className="text-xs text-gray-500">
                                                                {formatCurrency(totalPrice, currency)}
                                                            </p>
                                                            {addonNames && (
                                                                <p className="text-xs text-gray-500">
                                                                    Addons: {addonNames}
                                                                </p>
                                                            )}
                                                            {variantNames && (
                                                                <p className="text-xs text-gray-500">
                                                                    Variants: {variantNames}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="border-t pt-4 mb-4">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>{t('subtotal', 'Subtotal')}:</span>
                                                    <span>{formatCurrency(calculateSubtotal(), currency)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>{t('tax', 'Tax')}:</span>
                                                    <span>{formatCurrency(calculateTax(), currency)}</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span>{t('total', 'Total')}:</span>
                                                    <span>{formatCurrency(calculateTotal(), currency)}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleSendToKitchen}
                                                disabled={loading}
                                                className="mt-4 w-full py-2 rounded-md text-white font-medium disabled:opacity-50"
                                                style={{
                                                    background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                                                    fontFamily: 'Poppins'
                                                }}
                                            >
                                                {loading ? t('orderSending', 'Sending...') : t('sendToKitchen', 'Send to Kitchen')}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {showSuccessModal && (
                                <>
                                    <div
                                        className="fixed inset-0 bg-black bg-opacity-40 z-40"
                                        onClick={() => setShowSuccessModal(false)}
                                    />
                                    <div style={{ fontFamily: 'Poppins' }} className="fixed z-50 inset-0 flex items-center justify-center px-4">
                                        <div className="bg-white max-w-md w-full p-6 rounded-2xl text-center shadow-lg">
                                            <div className="flex justify-center mb-4">
                                                <IoCheckmarkCircle className="text-green-500 text-6xl" />
                                            </div>
                                            <h3 className="text-[24px] font-semibold text-green-600 mb-2">
                                                Order Sent to Kitchen
                                            </h3>
                                            <p className="text-[16px] text-gray-600 mb-6">
                                                Your Dish has been created and will be updated in the menu
                                                in couple of minutes
                                            </p>
                                            <button
                                                className="bg-green-500 text-white px-8 py-3 mt-4 rounded-md hover:bg-green-600"
                                                onClick={() => {
                                                    setShowSuccessModal(false);
                                                    setShowBoxes(false);
                                                    setCartItems([]);
                                                    setSelectedCustomer(null);
                                                    setSelectedTable(null);
                                                    setSearchQuery('');
                                                    setSelectedSlot(null);
                                                    onDiningTypeSelect(null);
                                                }}
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={handleGenerateBill}
                            disabled={
                                isCreatingOrder ||
                                (useNewProps ? isSubmittingProp : false) ||
                                cartItems.length === 0
                            }
                            className="w-full text-white bg-gradient-to-b from-brand-primary to-brand-secondary py-3 rounded-lg text-[15px] font-manrope font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        >
                            {isCreatingOrder ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Order...
                                </>
                            ) : (
                                <>
                                    <img src={bill} alt="bill" /> {t('generateBill', 'Generate Bill')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <PosCheckoutModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                orderId={createdOrderId}
                orderTotal={orderTotal}
                currency={currency}
                customer={useNewProps ? selectedCustomerProp : selectedCustomer}
                tableName={tableDisplay}
                paymentOptions={paymentOptions}
                onPaymentSuccess={handlePosPaymentSuccess}
            />

            {showReceiptModal && paymentReceipt && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowReceiptModal(false)}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
                            <div ref={receiptRef} className="p-4 print:p-8">
                                <div className="text-center mb-3">
                                    <h1 className="text-2xl font-bold mb-2">Order Receipt</h1>
                                    <div className="bg-gradient-to-r from-pink-100 to-pink-200 py-1.5 px-3 rounded-lg">
                                        <p className="text-xs text-gray-600">Order Number</p>
                                        <p className="text-xl font-bold text-gray-800">#{paymentReceipt.Order_id || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center mb-3">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
                                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold mt-3 mb-1">Payment Success!</h2>
                                    <p className="text-gray-500 text-sm text-center">Your payment has been successfully done.</p>
                                </div>

                                <div className="text-center mb-3 py-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-600 text-xs mb-1">Total Payment</p>
                                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(paymentReceipt.orderTotal, currency)}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-gray-50 p-2.5 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Order Number</p>
                                        <p className="font-semibold text-xs">{paymentReceipt.Order_id || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                                        <p className="font-semibold text-xs">{formatReceiptDate(paymentReceipt.CreateAt)}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Payment Type</p>
                                        <p className="font-semibold text-xs">{paymentReceipt.paymentMethod}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                                        <p className="font-semibold text-xs">{paymentReceipt.customerName}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                                        <p className="font-semibold text-xs">{paymentReceipt.Trangection_id?.transagtion_id || paymentReceipt.Payment_id || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                                        <p className="font-semibold text-xs">{paymentReceipt.Trangection_id?.reference_number || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">SubTotal</p>
                                        <p className="font-semibold text-xs">{formatCurrency(paymentReceipt.subTotal, currency)}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Tax</p>
                                        <p className="font-semibold text-xs">{formatCurrency(paymentReceipt.tax, currency)}</p>
                                    </div>
                                </div>

                                <div className="border-t-2 border-dashed border-gray-300 my-3"></div>

                                <button
                                    onClick={handlePrintReceipt}
                                    className="w-full py-2.5 bg-white border-2 border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-2"
                                >
                                    <FaPrint className="text-lg" />
                                    Print Receipt
                                </button>

                                <button
                                    onClick={() => {
                                        setShowReceiptModal(false);
                                        setPaymentReceipt(null);
                                        setSelectedSlot(null);
                                        if (useNewProps) {
                                            if (setCartItemsProp) setCartItemsProp([]);
                                            if (setSelectedCustomerProp) setSelectedCustomerProp(null);
                                            if (handleDiningOptionSelectProp) handleDiningOptionSelectProp(null);
                                            if (setShowBoxes) setShowBoxes(false);
                                        } else {
                                            setCartItems([]);
                                            setSelectedCustomer(null);
                                            setSelectedTable(null);
                                            setSearchQuery('');
                                            if (onDiningTypeSelect) onDiningTypeSelect(null);
                                            if (setShowBoxes) setShowBoxes(false);
                                        }
                                    }}
                                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-red-700 transition-colors"
                                >
                                    Start New Order
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showNewCustomerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-[460px] relative shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-black">
                                {editingCustomer ? t('form.updateTitle', 'Update Customer') : t('form.newTitle', 'New Customer')}
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewCustomerModal(false);
                                    setEditingCustomer(null);
                                }}
                                className="text-gray-600 hover:text-black transition-colors p-1"
                                aria-label="Close"
                            >
                                <IoMdClose size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCustomerSubmit} className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        {t('form.phone', 'Phone*')}
                                    </label>
                                    <span className="text-[11px] text-gray-400 font-normal">
                                        (8-15 digits)
                                    </span>
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={newCustomerForm.phone}
                                    onChange={handlePhoneChange}
                                    onBlur={handlePhoneBlur}
                                    placeholder={t('form.placeholders.phone', 'Enter Phone number here......')}
                                    className={`w-full border ${
                                        phoneError
                                            ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                                            : 'border-[#B388FF] focus:border-[#7C3AED]'
                                    } focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 bg-white transition-colors`}
                                />
                                {phoneError && (
                                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                                        <span>⚠️</span>
                                        <span>{phoneError}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    {t('form.name', 'Name*')}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newCustomerForm.Name}
                                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, Name: e.target.value }))}
                                    placeholder={t('form.placeholders.name', 'Enter Name here......')}
                                    className="w-full border border-[#B388FF] focus:border-[#7C3AED] focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 bg-white transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                        {t('form.dobOptional', 'Date of Birth (optional)')}
                                    </label>
                                    <input
                                        type="date"
                                        value={newCustomerForm.DOB}
                                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, DOB: e.target.value }))}
                                        className="bg-gradient-light w-full border border-[#B388FF] focus:border-[#7C3AED] focus:outline-none rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                        {t('form.table', 'Table*')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            required={availableTables.length > 0}
                                            value={newCustomerForm.Table_id}
                                            onChange={(e) => setNewCustomerForm(prev => ({ ...prev, Table_id: e.target.value }))}
                                            className="bg-gradient-light w-full border border-[#B388FF] focus:border-[#7C3AED] focus:outline-none rounded-xl px-3 py-2.5 text-sm text-gray-700 appearance-none pr-8 cursor-pointer transition-colors"
                                        >
                                            <option value="">{t('form.options.select', 'Select')}</option>
                                            {availableTables.map((tableItem, idx) => {
                                                const tableId = tableItem?.table_id?.Table_id || tableItem?.Table_id || tableItem?.id || idx;
                                                let label = '';
                                                if (tableItem.table_id && typeof tableItem.table_id === 'object') {
                                                    const code = tableItem.table_id['Table-code'] || tableItem.table_id['Table-name'] || `Table ${tableId}`;
                                                    const floor = tableItem.floor_id?.Floor_Name;
                                                    label = floor ? `${code} - ${floor}` : code;
                                                } else {
                                                    label = tableItem['Table-code'] || tableItem['Table-name'] || tableItem.Title || `Table ${tableId}`;
                                                }
                                                return (
                                                    <option key={tableId} value={tableId}>
                                                        {label}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 text-xl" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                                    {t('form.notes', 'Notes')}
                                </label>
                                <input
                                    type="text"
                                    value={newCustomerForm.Notes}
                                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, Notes: e.target.value }))}
                                    placeholder={t('form.placeholders.notes', 'Enter Notes Here......')}
                                    className="w-full border border-[#B388FF] focus:border-[#7C3AED] focus:outline-none rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 bg-white transition-colors"
                                />
                            </div>

                            <div className="flex justify-center pt-3 pb-1">
                                <button
                                    type="submit"
                                    disabled={isSubmittingCustomer}
                                    className="w-56 py-3 rounded-xl text-white font-semibold text-base bg-gradient-primary hover:opacity-95 active:scale-95 transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSubmittingCustomer
                                        ? (editingCustomer ? t('form.updating', 'Updating...') : t('form.creating', 'Saving...'))
                                        : (editingCustomer ? (t('form.update', 'Update') || t('form.save', 'Save')) : t('form.save', 'Save'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showBillModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 no-print"
                        onClick={() => setShowBillModal(false)}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
                                <div className="flex items-center gap-2">
                                    <FaPrint className="text-brand-accent text-lg" />
                                    <h2 className="text-lg font-bold text-gray-900">{t('billReceiptPreview', 'Bill / Guest Check')}</h2>
                                </div>
                                <button
                                    onClick={() => setShowBillModal(false)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <IoMdClose className="text-xl" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto hide-scrollbar space-y-4">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 font-mono text-xs">
                                    <div className="text-center pb-3 border-b border-dashed border-gray-300">
                                        <h3 className="font-bold text-base uppercase text-gray-900">{restaurantName}</h3>
                                        {restaurantAddress && <p className="text-[11px] text-gray-500 mt-0.5">{restaurantAddress}</p>}
                                        {restaurantPhone && <p className="text-[11px] text-gray-500">Tel: {restaurantPhone}</p>}
                                        <div className="inline-block mt-2 px-3 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase tracking-wider text-gray-700">
                                            {t('billTitle', 'BILL / GUEST CHECK')}
                                        </div>
                                    </div>

                                    <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-[11px]">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('orderNumber', 'Order #')}:</span>
                                            <span className="font-bold text-gray-800">#{billNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('dateTime', 'Date & Time')}:</span>
                                            <span>{billDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('typeTable', 'Type / Table')}:</span>
                                            <span className="font-semibold">{diningOptionDisplay} - {tableDisplay}</span>
                                        </div>
                                        {selectedSlot && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">{t('slot', 'Slot')}:</span>
                                                <span className="font-semibold">
                                                    {t(`slotTypes.${selectedSlot.slot_type}`, selectedSlot.slot_type)} · {selectedSlot.time}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('customer', 'Customer')}:</span>
                                            <span className="font-medium truncate max-w-[200px]">{customerName} {customerPhone ? `(${customerPhone})` : ''}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('server', 'Server')}:</span>
                                            <span>{cashierName}</span>
                                        </div>
                                    </div>

                                    <div className="py-2.5 border-b border-dashed border-gray-300">
                                        <div className="grid grid-cols-12 text-[10px] font-bold text-gray-500 pb-1 border-b border-dotted border-gray-200 uppercase">
                                            <span className="col-span-6">{t('item', 'Item')}</span>
                                            <span className="col-span-2 text-center">{t('qty', 'Qty')}</span>
                                            <span className="col-span-4 text-right">{t('amount', 'Amount')}</span>
                                        </div>

                                        <div className="divide-y divide-dotted divide-gray-100 pt-1">
                                            {cartItems.map((item, idx) => {
                                                const { totalPrice, quantity } = calculateItemPrices(item);
                                                const itemName = item.itemDetails?.['item-name'] || item.itemDetails?.Title || item.itemDetails?.Name || item.itemDetails?.name || item.name || item.Item_name || `Item ${idx + 1}`;
                                                const variantText = item.selectedVariants?.map(v => v.Variants).join(', ') || item.variantDetails?.item_Variants_id?.Variants || '';
                                                const addonText = item.selectedAddons?.map(a => a.Addons).join(', ') || item.addonDetails?.item_Addons_id?.Addons || '';

                                                return (
                                                    <div key={idx} className="py-1 text-[11px]">
                                                        <div className="grid grid-cols-12">
                                                            <span className="col-span-6 font-medium text-gray-800 truncate pr-1">{itemName}</span>
                                                            <span className="col-span-2 text-center text-gray-600">{quantity}</span>
                                                            <span className="col-span-4 text-right font-semibold text-gray-900">{formatCurrency(totalPrice, currency)}</span>
                                                        </div>
                                                        {(variantText || addonText) && (
                                                            <div className="text-[10px] text-gray-400 pl-1">
                                                                {variantText && <span>• {variantText} </span>}
                                                                {addonText && <span>(+{addonText})</span>}
                                                            </div>
                                                        )}
                                                        {item.notes && (
                                                            <div className="text-[10px] text-amber-600 italic pl-1">
                                                                * {item.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-[11px]">
                                        <div className="flex justify-between text-gray-600">
                                            <span>{t('subtotal', 'Subtotal')}:</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(displaySubtotal, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>{t('tax', 'Tax')} ({displayTaxRate}%):</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(displayTaxAmount, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-dotted border-gray-200">
                                            <span>{t('total', 'TOTAL')}:</span>
                                            <span className="text-[#D32F2F]">{formatCurrency(displayTotal, currency)}</span>
                                        </div>
                                    </div>

                                    <div className="text-center pt-2.5 text-[10px] text-gray-400">
                                        <p className="font-semibold text-gray-600 mb-0.5">{t('thankYouVisit', 'Thank you for dining with us!')}</p>
                                        <p>{t('pleaseComeAgain', 'Please come again')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50/70">
                                <button
                                    onClick={handlePrintBillNow}
                                    disabled={isPrintingPdf || isCreatingOrder}
                                    aria-busy={isPrintingPdf || isCreatingOrder}
                                    className="flex-1 py-3 bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
                                >
                                    {isPrintingPdf || isCreatingOrder ? (
                                        t('generatingOrderPdf', 'Generating PDF...')
                                    ) : (
                                        <>
                                            <FaPrint className="text-base" />
                                            {t('printBill', 'Print bill')}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowBillModal(false)}
                                    className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
                                >
                                    {t('close', 'Close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div id="printable-pos-bill" className="hidden font-mono text-black bg-white p-4">
                <div className="text-center pb-2 border-b border-dashed border-gray-400">
                    <h2 className="text-lg font-bold uppercase tracking-wider">{restaurantName}</h2>
                    {restaurantAddress && <p className="text-xs text-gray-700">{restaurantAddress}</p>}
                    {restaurantPhone && <p className="text-xs text-gray-700">Tel: {restaurantPhone}</p>}
                    <div className="mt-1.5 pt-1.5 border-t border-dotted border-gray-300">
                        <span className="text-sm font-extrabold uppercase tracking-widest">
                            {paymentReceipt ? t('receiptTitle', 'ORDER RECEIPT') : t('billTitle', 'BILL / GUEST CHECK')}
                        </span>
                    </div>
                </div>

                <div className="py-2 border-b border-dashed border-gray-400 text-xs space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('orderNumber', 'Order #')}:</span>
                        <span className="font-bold">#{billNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('dateTime', 'Date & Time')}:</span>
                        <span>{billDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('typeTable', 'Type / Table')}:</span>
                        <span className="font-semibold">{diningOptionDisplay} - {tableDisplay}</span>
                    </div>
                    {selectedSlot && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">{t('slot', 'Slot')}:</span>
                            <span className="font-semibold">
                                {t(`slotTypes.${selectedSlot.slot_type}`, selectedSlot.slot_type)} · {selectedSlot.time}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('customer', 'Customer')}:</span>
                        <span className="font-medium">{customerName} {customerPhone ? `(${customerPhone})` : ''}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('server', 'Server / Cashier')}:</span>
                        <span>{cashierName}</span>
                    </div>
                </div>

                <div className="py-2 border-b border-dashed border-gray-400">
                    <div className="grid grid-cols-12 text-[11px] font-bold text-gray-700 pb-1 border-b border-dotted border-gray-300 uppercase">
                        <span className="col-span-6">{t('item', 'Item')}</span>
                        <span className="col-span-2 text-center">{t('qty', 'Qty')}</span>
                        <span className="col-span-4 text-right">{t('amount', 'Amount')}</span>
                    </div>

                    <div className="divide-y divide-dotted divide-gray-200">
                        {cartItems.map((item, idx) => {
                            const { totalPrice, quantity } = calculateItemPrices(item);
                            const itemName = item.itemDetails?.['item-name'] || item.itemDetails?.Title || item.itemDetails?.Name || item.itemDetails?.name || item.name || item.Item_name || `Item ${idx + 1}`;
                            const variantText = item.selectedVariants?.map(v => v.Variants).join(', ') || item.variantDetails?.item_Variants_id?.Variants || '';
                            const addonText = item.selectedAddons?.map(a => a.Addons).join(', ') || item.addonDetails?.item_Addons_id?.Addons || '';

                            return (
                                <div key={idx} className="py-1 text-xs">
                                    <div className="grid grid-cols-12">
                                        <span className="col-span-6 font-semibold break-words pr-1">{itemName}</span>
                                        <span className="col-span-2 text-center">{quantity}</span>
                                        <span className="col-span-4 text-right font-semibold">{formatCurrency(totalPrice, currency)}</span>
                                    </div>
                                    {(variantText || addonText) && (
                                        <div className="text-[10px] text-gray-600 pl-1">
                                            {variantText && <span>• {variantText} </span>}
                                            {addonText && <span>(+{addonText})</span>}
                                        </div>
                                    )}
                                    {item.notes && (
                                        <div className="text-[10px] text-gray-500 italic pl-1">
                                            * {item.notes}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="py-2 border-b border-dashed border-gray-400 text-xs space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('subtotal', 'Subtotal')}:</span>
                        <span>{formatCurrency(displaySubtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('tax', 'Tax')} ({displayTaxRate}%):</span>
                        <span>{formatCurrency(displayTaxAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-dotted border-gray-300">
                        <span>{t('total', 'TOTAL')}:</span>
                        <span>{formatCurrency(displayTotal, currency)}</span>
                    </div>
                </div>

                <div className="text-center pt-2 text-xs space-y-1">
                    <div className="font-bold tracking-wider">
                        {paymentReceipt ? `STATUS: PAID (${paymentReceipt.paymentMethod})` : 'STATUS: UNPAID (CHECK)'}
                    </div>
                    <p className="text-[11px] text-gray-600">{t('thankYouVisit', 'Thank you for your visit!')}</p>
                    <p className="text-[11px] text-gray-500">{t('pleaseComeAgain', 'Please come again')}</p>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    #printable-pos-bill, #printable-pos-bill * {
                        visibility: visible !important;
                    }

                    #printable-pos-bill {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 80mm !important;
                        margin: 0 auto !important;
                        padding: 6mm 4mm !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    .fixed, .no-print, button, input, textarea, select {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    @page {
                        margin: 4mm;
                        size: auto;
                    }
                }
            `}</style>
        </>
    )
}

export default RightPanelAll