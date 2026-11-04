import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaCloudDownloadAlt } from 'react-icons/fa';
import { LuTable } from 'react-icons/lu';
import { FaUser, FaPen, FaTimes, FaTrash } from 'react-icons/fa';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { toast } from 'react-toastify';
import cancel from '../assets/cancel.svg';
import Phone from '../assets/Phone.svg';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../../hooks/queries/useCustomers';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../utils/queryKeys';
import customerService from '../../services/customerService';
import { exportCustomersToCSV } from '../../utils/customerCsvUtils';
import { formatDateOnly } from '../../utils/dateUtils';
import ImportCustomerModal from './ImportCustomerModal';
import SearchBar from '../common/SearchBar';
import GradientOutlineButton from '../common/GradientOutlineButton';
import useSearchStore from '../../store/searchStore';



const CustomerSkeleton = () => (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white animate-pulse">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 h-[68px]">
            <div className="flex items-center gap-2">
                <div className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gray-300"></div>
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    <div className="h-3 w-28 bg-gray-300 rounded"></div>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
            </div>
        </div>
        <div className="p-4 space-y-4">
            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
        </div>
    </div>
);

const Customers = () => {
    const { t } = useTranslation('customer');
    const navigate = useNavigate();
    const [showNew, setShowNew] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCustomerForAction, setSelectedCustomerForAction] = useState(null);

    const [newCustomerForm, setNewCustomerForm] = useState({
        phone: '',
        Name: '',
        DOB: '',
        Customer_type_id: 1,
        Table_id: 5,
        Address: '',
        Notes: '',
        Status: true
    });

    const [updateCustomerForm, setUpdateCustomerForm] = useState({
        id: null,
        phone: '',
        Name: '',
        DOB: '',
        Customer_type_id: 1,
        Table_id: 5,
        Address: '',
        Notes: '',
        Status: true
    });

    const dropdownRef = useRef(null);
    const queryClient = useQueryClient();
    const [showImportModal, setShowImportModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { searchQuery: globalSearch, setSearchPlaceholder } = useSearchStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');

    useEffect(() => {
        setSearchPlaceholder(t('searchPlaceholder', 'Search customers...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearchQuery(globalSearch);
            setSubmittedSearch(globalSearch.trim());
        }
    }, [globalSearch]);

    // React Query Hooks
    const { data: customers = [], isLoading } = useCustomers(submittedSearch);
    const createMutation = useCreateCustomer();
    const updateMutation = useUpdateCustomer();
    const deleteMutation = useDeleteCustomer();



    const handleCreateCustomer = async (e) => {
        e.preventDefault();

        if (!newCustomerForm.phone?.trim() || !newCustomerForm.Name?.trim()) {
            toast.error(t('validation.requiredFields'));
            return;
        }

        const cleanPhone = newCustomerForm.phone.trim().replace(/[\s\-()]/g, '');
        if (!/^\+?[0-9]+$/.test(cleanPhone) || cleanPhone.length < 10 || cleanPhone.length > 15) {
            toast.error(t('validation.invalidPhone', 'Phone must be between 10 and 15 characters'));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...newCustomerForm,
                phone: cleanPhone,
                DOB: newCustomerForm.DOB || null,
                Customer_type_id: Number(newCustomerForm.Customer_type_id) || 1
            };
            const response = await createMutation.mutateAsync(payload);
            toast.success(response.message || t('validation.createSuccess'));
            setShowNew(false);
            resetNewCustomerForm();
        } catch (error) {
            // Error is handled by global hook or explicitly here
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();

        if (!updateCustomerForm.phone?.trim() || !updateCustomerForm.Name?.trim()) {
            toast.error(t('validation.requiredFields'));
            return;
        }

        const cleanPhone = updateCustomerForm.phone.trim().replace(/[\s\-()]/g, '');
        if (!/^\+?[0-9]+$/.test(cleanPhone) || cleanPhone.length < 10 || cleanPhone.length > 15) {
            toast.error(t('validation.invalidPhone', 'Phone must be between 10 and 15 characters'));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...updateCustomerForm,
                phone: cleanPhone,
                DOB: updateCustomerForm.DOB || null,
                Customer_type_id: Number(updateCustomerForm.Customer_type_id) || 1
            };
            const response = await updateMutation.mutateAsync(payload);
            toast.success(response.message || t('validation.updateSuccess'));
            setIsModalOpen(false);
            setShowUpdate(true);
            setTimeout(() => setShowUpdate(false), 2000);
        } catch (error) {
            // Error handled
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCustomer = async () => {
        if (!selectedCustomerForAction) return;

        setIsSubmitting(true);
        try {
            await deleteMutation.mutateAsync(selectedCustomerForAction.Customer_id);
            toast.success(t('validation.deleteSuccess'));
            setShowDeleteConfirm(false);
            setSelectedCustomerForAction(null);
        } catch (error) {
            // Error handled
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (customer) => {
        setUpdateCustomerForm({
            id: customer.Customer_id,
            phone: customer.phone || '',
            Name: customer.Name || '',
            DOB: customer.DOB ? customer.DOB.split('T')[0] : '',
            Customer_type_id: customer.Customer_type_id || 1,
            Table_id: customer.Table_id || 5,
            Address: customer.Address || '',
            Notes: customer.Notes || '',
            Status: customer.Status !== undefined ? customer.Status : true
        });
        setSelectedCustomerForAction(customer);
        setIsModalOpen(true);
    };

    const openDeleteConfirm = (customer) => {
        setSelectedCustomerForAction(customer);
        setShowDeleteConfirm(true);
    };

    const resetNewCustomerForm = () => {
        setNewCustomerForm({
            phone: '',
            Name: '',
            DOB: '',
            Customer_type_id: 1,
            Table_id: 5,
            Address: '',
            Notes: '',
            Status: true
        });
    };

    const handleNewCustomerInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomerForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateCustomerInputChange = (e) => {
        const { name, value } = e.target;
        setUpdateCustomerForm(prev => ({ ...prev, [name]: value }));
    };

    const filteredCustomers = React.useMemo(() => {
        if (!Array.isArray(customers)) return [];
        const activeSearch = (globalSearch || searchQuery || '').toLowerCase().trim();
        if (!activeSearch) return customers;
        return customers.filter(c => {
            const name = (c.Name || c.name || '').toLowerCase();
            const phone = (c.phone || c.Phone || '').toLowerCase();
            const address = (c.Address || c.address || '').toLowerCase();
            const notes = (c.Notes || c.notes || '').toLowerCase();
            return name.includes(activeSearch) || phone.includes(activeSearch) || address.includes(activeSearch) || notes.includes(activeSearch);
        });
    }, [customers, globalSearch, searchQuery]);

    const handleDownloadVisible = () => {
        setOpen(false);
        if (!filteredCustomers || filteredCustomers.length === 0) {
            toast.info(t('export.noData', 'No customers available to download'));
            return;
        }
        const date = new Date().toISOString().slice(0, 10);
        exportCustomersToCSV(filteredCustomers, `customers_visible_${date}.csv`);
        toast.success(t('export.downloadSuccess', 'Customers downloaded successfully'));
    };

    const handleDownloadAll = async () => {
        setOpen(false);
        setIsExporting(true);
        try {
            let allCustomers = customers;
            if (submittedSearch) {
                const res = await customerService.getAllCustomerByAuth();
                if (res && res.success !== false) {
                    allCustomers = res.data || res;
                }
            }

            if (!allCustomers || allCustomers.length === 0) {
                toast.info(t('export.noData', 'No customers available to download'));
                return;
            }

            const date = new Date().toISOString().slice(0, 10);
            exportCustomersToCSV(allCustomers, `customers_all_${date}.csv`);
            toast.success(t('export.downloadSuccess', 'Customers downloaded successfully'));
        } catch (err) {
            console.error('Export all error:', err);
            if (customers && customers.length > 0) {
                const date = new Date().toISOString().slice(0, 10);
                exportCustomersToCSV(customers, `customers_all_${date}.csv`);
                toast.success(t('export.downloadSuccess', 'Customers downloaded successfully'));
            } else {
                toast.error(t('export.noData', 'No customers available to download'));
            }
        } finally {
            setIsExporting(false);
        }
    };

    const handleOpenImport = () => {
        setOpen(false);
        setShowImportModal(true);
    };

    const handleImportSuccess = () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    const CustomerCard = ({ customer }) => {
        return (
            <div style={{ fontFamily: 'Poppins' }} className="border border-[#000000] rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-[#F5EBFF] to-[#FDF3F3]">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-light rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">

                            <FaUser className="text-gray-600 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-xs sm:text-sm">{customer.Name}</p>
                            <div className="flex items-center gap-2">
                                <img src={Phone} alt="Phone" className="w-3 h-3 sm:w-4 sm:h-4" />
                                <p className="text-xs text-black">{customer.phone}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <FaPen
                            onClick={() => openEditModal(customer)}
                            className="text-gray-600 text-sm cursor-pointer hover:text-purple-600"
                        />
                        <FaTrash
                            onClick={() => openDeleteConfirm(customer)}
                            className="text-red-500 text-sm cursor-pointer hover:text-red-700"
                        />
                    </div>
                </div>
                <div
                    onClick={() => navigate(`customerdetails`, { state: { customer } })}
                    className="p-4 text-xs sm:text-sm space-y-2 text-gray-800 cursor-pointer hover:bg-gray-50"
                >
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{t('card.type')}</span>
                        <span>{customer.CustomerType?.type || (customer.Customer_type_id === 1 ? t('form.options.premiumVip', 'Premium VIP') : customer.Customer_type_id === 2 ? t('form.options.vip', 'VIP') : 'N/A')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{t('card.birthDate')}</span>
                        <span>{formatDateOnly(customer.DOB)}</span>
                    </div>
                    {customer.Address && (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{t('card.address')}</span>
                            <span className="truncate">{customer.Address}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{t('card.created')}</span>
                        <span>{formatDate(customer.CreateAt)}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div style={{ fontFamily: 'Poppins' }} className="p-4 sm:p-6 font-[Poppins] space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex sm:flex-row items-start sm:items-center gap-4">
                        <h2 className="text-2xl sm:text-[32px] font-bold">{t('title')}</h2>
                        <GradientOutlineButton
                            onClick={() => setShowNew(true)}
                            className="px-5 rounded-[12px]"
                        >
                            {t('new')}
                        </GradientOutlineButton>

                        {/* New Customer Modal */}
                        {showNew && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
                                <div className="bg-white rounded-xl p-4 sm:p-6 w-[90%] max-w-[400px] relative shadow-lg max-h-[90vh] overflow-y-auto">
                                    <h2 style={{ fontFamily: 'Manrope' }} className="text-xl sm:text-[29px] font-semibold mb-4">
                                        {t('form.newTitle')}
                                    </h2>
                                    <button
                                        className="absolute top-3 right-3 text-xl sm:text-2xl text-gray-600"
                                        onClick={() => {
                                            setShowNew(false);
                                            resetNewCustomerForm();
                                        }}
                                    >
                                        ×
                                    </button>
                                    <form onSubmit={handleCreateCustomer} style={{ fontFamily: 'Poppins' }} className="space-y-4">
                                        <div>
                                            <label className="block text-xs sm:text-sm mb-1">{t('form.phone')}</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={newCustomerForm.phone}
                                                onChange={handleNewCustomerInputChange}
                                                placeholder={t('form.placeholders.phone')}
                                                className="w-full border border-purple-300 rounded-md px-3 py-2 text-xs sm:text-sm"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm mb-1">{t('form.name')}</label>
                                            <input
                                                type="text"
                                                name="Name"
                                                value={newCustomerForm.Name}
                                                onChange={handleNewCustomerInputChange}
                                                placeholder={t('form.placeholders.name')}
                                                className="w-full border border-purple-300 rounded-md px-3 py-2 text-xs sm:text-sm"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            <div className="w-full sm:w-1/2">
                                                <label className="block text-xs sm:text-sm mb-1">{t('form.dobOptional', 'Date of Birth (optional)')}</label>
                                                <input
                                                    type="date"
                                                    name="DOB"
                                                    value={newCustomerForm.DOB}
                                                    onChange={handleNewCustomerInputChange}
                                                    className="bg-gradient-light w-full border border-purple-300 rounded-md px-3 py-2 text-xs sm:text-sm"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="w-full sm:w-1/2">
                                                <label className="block text-xs sm:text-sm mb-1">{t('form.customerType')}</label>
                                                <select
                                                    name="Customer_type_id"
                                                    value={newCustomerForm.Customer_type_id}
                                                    onChange={handleNewCustomerInputChange}
                                                    className="bg-gradient-light w-full border border-purple-300 rounded-md px-3 py-2 text-xs sm:text-sm"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value={1}>{t('form.options.premiumVip')}</option>
                                                    <option value={2}>{t('form.options.vip')}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm mb-1">{t('form.address')}</label>
                                            <input
                                                type="text"
                                                name="Address"
                                                value={newCustomerForm.Address}
                                                onChange={handleNewCustomerInputChange}
                                                placeholder={t('form.placeholders.address')}
                                                className="w-full border border-purple-300 rounded-md px-3 py-2 text-xs sm:text-sm"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm mb-1">{t('form.notes')}</label>
                                            <textarea
                                                name="Notes"
                                                value={newCustomerForm.Notes}
                                                onChange={handleNewCustomerInputChange}
                                                placeholder={t('form.placeholders.notes')}
                                                rows="3"
                                                className="w-full border border-purple-300 rounded-md px-3 py-2 text-xs sm:text-sm"
                                                disabled={isSubmitting}
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-gradient-primary w-full py-2 text-white rounded-md text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {t('form.creating')}
                                                </>
                                            ) : (
                                                t('form.save')
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-end gap-2 h-auto sm:h-9">
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.trim() === '') {
                                    setSubmittedSearch('');
                                }
                            }}
                            onSearch={() => setSubmittedSearch(searchQuery.trim())}
                            placeholder={t('searchPlaceholder')}
                            showButton={true}
                            buttonText={t('search', { defaultValue: 'Search' })}
                        />
                        <div className="relative inline-block text-left h-full" ref={dropdownRef}>
                            <GradientOutlineButton
                                variant="subtle"
                                onClick={() => setOpen(!open)}
                                icon={<FiMenu className="text-base" />}
                                className="h-9 px-4 rounded-lg font-medium w-full sm:w-auto"
                            >
                                {t('actions')}
                            </GradientOutlineButton>
                            {open && (
                                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                                    <div className="py-2 px-2 space-y-1 text-xs sm:text-sm">
                                        <button 
                                            type="button"
                                            onClick={handleDownloadVisible}
                                            className="flex items-center gap-2.5 hover:bg-gray-50 w-full p-2 rounded-lg text-gray-700 transition-colors text-left cursor-pointer"
                                        >
                                            <FaDownload className="text-[#6A1B9A]" />
                                            <span>{t('downloadVisible')}</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleDownloadAll}
                                            disabled={isExporting}
                                            className="flex items-center gap-2.5 hover:bg-gray-50 w-full p-2 rounded-lg text-gray-700 transition-colors text-left cursor-pointer disabled:opacity-50"
                                        >
                                            <FaCloudDownloadAlt className="text-[#6A1B9A]" />
                                            <span>{isExporting ? t('export.exporting', 'Preparing download...') : t('downloadAll')}</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleOpenImport}
                                            className="flex items-center gap-2.5 hover:bg-gray-50 w-full p-2 rounded-lg text-gray-700 transition-colors text-left cursor-pointer"
                                        >
                                            <LuTable className="text-[#6A1B9A]" />
                                            <span>{t('import')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="p-4 sm:p-6 grid cursor-pointer grid-cols-[repeat(auto-fill,minmax(300px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 sm:gap-6">
                {isLoading ? (
                    <>
                        <CustomerSkeleton />
                        <CustomerSkeleton />
                        <CustomerSkeleton />
                        <CustomerSkeleton />
                        <CustomerSkeleton />
                        <CustomerSkeleton />
                    </>
                ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                        <CustomerCard key={customer.Customer_id} customer={customer} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        {searchQuery ? t('noCustomersFound') : t('noCustomersAvailable')}
                    </div>
                )}
            </div>

            {/* Update Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white w-[90%] max-w-[450px] p-4 sm:p-6 rounded-xl relative shadow-xl max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-3 right-3 text-black text-lg sm:text-xl"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <FaTimes />
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">{t('form.updateTitle')}</h2>
                        <form onSubmit={handleUpdateCustomer} className="space-y-3">
                            <div>
                                <label className="block text-xs sm:text-sm mb-1">{t('form.phone')}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={updateCustomerForm.phone}
                                    onChange={handleUpdateCustomerInputChange}
                                    placeholder="+27 72-123-4567"
                                    className="w-full px-3 py-2 rounded-md text-xs sm:text-sm border border-purple-300 outline-none"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm mb-1">{t('form.name')}</label>
                                <input
                                    type="text"
                                    name="Name"
                                    value={updateCustomerForm.Name}
                                    onChange={handleUpdateCustomerInputChange}
                                    placeholder="Jimmy"
                                    className="w-full px-3 py-2 rounded-md text-xs sm:text-sm border border-purple-300 outline-none"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <div className="w-full sm:w-1/2">
                                    <label className="block text-xs sm:text-sm mb-1">{t('form.dobOptional', 'Date of Birth (optional)')}</label>
                                    <input
                                        type="date"
                                        name="DOB"
                                        value={updateCustomerForm.DOB}
                                        onChange={handleUpdateCustomerInputChange}
                                        className="bg-gradient-light w-full px-3 py-2 rounded-md text-xs sm:text-sm border border-red-300 outline-none"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="w-full sm:w-1/2">
                                    <label className="block text-xs sm:text-sm mb-1">{t('form.customerType')}</label>
                                    <select
                                        name="Customer_type_id"
                                        value={updateCustomerForm.Customer_type_id}
                                        onChange={handleUpdateCustomerInputChange}
                                        className="bg-gradient-light w-full px-3 py-2 rounded-md text-xs sm:text-sm border border-red-300 outline-none"
                                        disabled={isSubmitting}
                                    >
                                        <option value={1}>{t('form.options.premiumVip')}</option>
                                        <option value={2}>{t('form.options.vip')}</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm mb-1">{t('form.address')}</label>
                                <input
                                    type="text"
                                    name="Address"
                                    value={updateCustomerForm.Address}
                                    onChange={handleUpdateCustomerInputChange}
                                    placeholder={t('form.placeholders.address')}
                                    className="w-full px-3 py-2 rounded-md text-xs sm:text-sm border border-purple-300 outline-none"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm mb-1">{t('form.notes')}</label>
                                <textarea
                                    name="Notes"
                                    value={updateCustomerForm.Notes}
                                    onChange={handleUpdateCustomerInputChange}
                                    placeholder={t('form.placeholders.notes')}
                                    rows="3"
                                    className="w-full px-3 py-2 rounded-md text-xs sm:text-sm border border-purple-300 outline-none"
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gradient-primary w-full py-2 rounded-md text-white font-medium text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('form.updating')}
                                    </>
                                ) : (
                                    t('form.save')
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => !isSubmitting && setShowDeleteConfirm(false)} />
                    <div
                        style={{ fontFamily: 'Poppins' }}
                        className="fixed z-50 inset-0 flex items-center justify-center px-4"
                    >
                        <div className="bg-white max-w-md w-full p-4 sm:p-6 rounded-2xl text-center shadow-lg">
                            <div className="flex justify-center mb-4">
                                <img src={cancel} alt="Cancel" className="w-12 sm:w-16" />
                            </div>
                            <h3 className="text-lg sm:text-[24px] pt-2 font-bold text-[#C51800] mb-2">{t('delete.title')}</h3>
                            <p className="text-base sm:text-[20px] pt-3 font-bold text-black mb-6">
                                {t('delete.warning')}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    className="flex-1 bg-gray-300 text-black px-6 py-2 rounded-md text-sm sm:text-base disabled:opacity-50"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isSubmitting}
                                >
                                    {t('delete.cancel')}
                                </button>
                                <button
                                    className="flex-1 bg-[#C51800] text-white px-6 py-2 rounded-md text-sm sm:text-base disabled:opacity-50 flex items-center justify-center"
                                    onClick={handleDeleteCustomer}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Success Modal */}
            {showUpdate && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-40" />
                    <div
                        style={{ fontFamily: 'Poppins' }}
                        className="fixed z-50 inset-0 flex items-center justify-center px-4"
                    >
                        <div className="bg-white max-w-md w-full p-4 sm:p-6 rounded-2xl text-center shadow-lg">
                            <div className="flex justify-center mb-4">
                                <IoCheckmarkCircle className="text-[#34C759] text-5xl sm:text-6xl" />
                            </div>
                            <h3 className="text-lg sm:text-[24px] pt-2 font-bold text-[#34C759] mb-2">{t('success.updatedTitle')}</h3>
                            <p className="text-sm sm:text-[16px] pt-3 font-bold text-black mb-6">
                                {t('success.updatedMessage')}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Import Customer Modal */}
            <ImportCustomerModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={handleImportSuccess}
            />
        </>
    );
};

export default Customers;
