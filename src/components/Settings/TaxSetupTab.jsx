import React, { useState, useEffect, useRef } from 'react';
import { SettingsTableSkeleton } from './SettingsSkeletons';
import { Plus, ChevronUp, ChevronDown, Save, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useTaxSetup, useCreateTax, useUpdateTax, useDeleteTax } from '../../hooks/queries/useTaxSetup';
import { useServiceCharge, useUpdateServiceCharge } from '../../hooks/queries/useStore';

// Default mockup rows matching design prototype if no backend records exist yet
const DEFAULT_TAX_ROWS = [
    { Tax_setup_id: 'sample-1', title: 'Gst', rate: 8, type: 'Inclusive', isSample: true },
    { Tax_setup_id: 'sample-2', title: 'Gst', rate: 8, type: 'Exclusive', isSample: true },
    { Tax_setup_id: 'sample-3', title: 'Gst', rate: 8, type: 'Exclusive', isSample: true },
];

const TaxSetupTab = () => {
    const { t } = useTranslation('settings');
    const { data: taxData = [], isLoading } = useTaxSetup();
    const { data: serviceChargeData } = useServiceCharge();
    const updateServiceChargeMutation = useUpdateServiceCharge();
    const createTaxMutation = useCreateTax();
    const updateTaxMutation = useUpdateTax();
    const deleteTaxMutation = useDeleteTax();

    const isSubmitting = createTaxMutation.isPending || updateTaxMutation.isPending || deleteTaxMutation.isPending || updateServiceChargeMutation.isPending;

    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTax, setSelectedTax] = useState(null);
    const [serviceCharges, setServiceCharges] = useState('0.00');
    const [isSavingServiceCharge, setIsSavingServiceCharge] = useState(false);
    const taxDialogOpenerRef = useRef(null);
    const isTaxDialogOpen = showNewModal || showEditModal || showDeleteModal;
    const wasTaxDialogOpenRef = useRef(false);

    useEffect(() => {
        if (isTaxDialogOpen) {
            wasTaxDialogOpenRef.current = true;
            return;
        }

        if (wasTaxDialogOpenRef.current) {
            taxDialogOpenerRef.current?.focus();
            taxDialogOpenerRef.current = null;
            wasTaxDialogOpenRef.current = false;
        }
    }, [isTaxDialogOpen]);

    useEffect(() => {
        if (!isTaxDialogOpen) return undefined;

        const handleDialogKeyDown = (event) => {
            if (event.key !== 'Escape' || isSubmitting) return;
            event.preventDefault();
            setShowNewModal(false);
            setShowEditModal(false);
            setShowDeleteModal(false);
        };

        document.addEventListener('keydown', handleDialogKeyDown);
        return () => document.removeEventListener('keydown', handleDialogKeyDown);
    }, [isTaxDialogOpen, isSubmitting]);

    const [newTaxForm, setNewTaxForm] = useState({
        title: '',
        rate: 0,
        type: 'Inclusive',
        Status: true
    });

    const [editTaxForm, setEditTaxForm] = useState({
        id: null,
        title: '',
        rate: 0,
        type: 'Inclusive',
        Status: true
    });

    // Load service charge from dedicated service-charge endpoint (with fallback to tax record)
    useEffect(() => {
        if (serviceChargeData && serviceChargeData.service_charge_percent !== undefined && serviceChargeData.service_charge_percent !== null) {
            setServiceCharges(Number(serviceChargeData.service_charge_percent).toFixed(2));
        } else if (taxData && taxData.length > 0 && taxData[0].servicecharge !== undefined && taxData[0].servicecharge !== null) {
            setServiceCharges(Number(taxData[0].servicecharge).toFixed(2));
        }
    }, [serviceChargeData, taxData]);

    const handleServiceChargeChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        setServiceCharges(val);
    };

    const handleServiceChargeBlur = () => {
        const num = parseFloat(serviceCharges);
        if (!isNaN(num)) {
            setServiceCharges(num.toFixed(2));
        } else {
            setServiceCharges('0.00');
        }
    };

    const incrementServiceCharge = () => {
        const num = parseFloat(serviceCharges) || 0;
        setServiceCharges((num + 1).toFixed(2));
    };

    const decrementServiceCharge = () => {
        const num = parseFloat(serviceCharges) || 0;
        setServiceCharges(Math.max(0, num - 1).toFixed(2));
    };

    const handleSaveServiceCharge = async () => {
        setIsSavingServiceCharge(true);
        try {
            const chargeVal = parseFloat(serviceCharges) || 0;
            const res = await updateServiceChargeMutation.mutateAsync(chargeVal);
            if (res && res.success !== false) {
                toast.success(res?.message || t('taxSetup.serviceChargeUpdated', 'Service charges updated successfully'));
            } else {
                toast.error(res?.message || t('common.error', 'Failed to update service charges'));
            }
        } catch (error) {
            toast.error(error.message || t('common.error', 'Failed to update service charges'));
        } finally {
            setIsSavingServiceCharge(false);
        }
    };

    const handleNewInputChange = (e) => {
        const { name, value } = e.target;
        setNewTaxForm(prev => ({
            ...prev,
            [name]: name === 'rate' ? parseFloat(value) || 0 : value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditTaxForm(prev => ({
            ...prev,
            [name]: name === 'rate' ? parseFloat(value) || 0 : value
        }));
    };

    const handleCreateTax = async (e) => {
        e.preventDefault();

        if (!newTaxForm.title || newTaxForm.rate <= 0) {
            toast.error(t('common.validationError'));
            return;
        }

        try {
            const taxPayload = {
                ...newTaxForm,
                servicecharge: 0
            };
            const response = await createTaxMutation.mutateAsync(taxPayload);
            if (response && response.success !== false) {
                toast.success(response?.message || t('taxSetup.createSuccess'));
                setShowNewModal(false);
                resetNewForm();
            } else {
                toast.error(response?.message || t('taxSetup.createError'));
            }
        } catch (error) {
            toast.error(error.message || t('taxSetup.createError'));
        }
    };

    const handleUpdateTax = async (e) => {
        e.preventDefault();

        if (!editTaxForm.title || editTaxForm.rate <= 0) {
            toast.error(t('common.validationError'));
            return;
        }

        try {
            const taxPayload = {
                ...editTaxForm,
                servicecharge: selectedTax?.servicecharge ?? 0
            };
            const response = await updateTaxMutation.mutateAsync(taxPayload);
            if (response && response.success !== false) {
                toast.success(response?.message || t('taxSetup.updateSuccess'));
                setShowEditModal(false);
            } else {
                toast.error(response?.message || t('taxSetup.updateError'));
            }
        } catch (error) {
            toast.error(error.message || t('taxSetup.updateError'));
        }
    };

    const handleDeleteTax = async () => {
        if (!selectedTax) return;

        if (selectedTax.isSample) {
            toast.success(t('taxSetup.deleteSuccess'));
            setShowDeleteModal(false);
            setSelectedTax(null);
            return;
        }

        try {
            const response = await deleteTaxMutation.mutateAsync(selectedTax.Tax_setup_id);
            if (response && response.success !== false) {
                toast.success(t('taxSetup.deleteSuccess'));
                setShowDeleteModal(false);
                setSelectedTax(null);
            } else {
                toast.error(response?.message || t('taxSetup.deleteError'));
            }
        } catch (error) {
            toast.error(error.message || t('taxSetup.deleteError'));
        }
    };

    const openEditModal = (tax) => {
        taxDialogOpenerRef.current = document.activeElement;
        setEditTaxForm({
            id: tax.isSample ? null : tax.Tax_setup_id,
            title: tax.title || '',
            rate: tax.rate || 0,
            type: tax.type || 'Inclusive',
            Status: tax.Status !== undefined ? tax.Status : true
        });
        setSelectedTax(tax);
        setShowEditModal(true);
    };

    const openDeleteModal = (tax) => {
        taxDialogOpenerRef.current = document.activeElement;
        setSelectedTax(tax);
        setShowDeleteModal(true);
    };

    const resetNewForm = () => {
        setNewTaxForm({
            title: '',
            rate: 0,
            type: 'Inclusive',
            Status: true
        });
    };

    if (isLoading) {
        return <SettingsTableSkeleton />;
    }

    const displayedTaxes = taxData && taxData.length > 0 ? taxData : DEFAULT_TAX_ROWS;

    return (
        <div className="font-[Poppins] max-w-[850px] bg-white min-h-full">
            {/* Header: Tax Setup Title & + New Button */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-[32px] font-bold text-black tracking-tight">
                    {t('taxSetup.title', 'Tax Setup')}
                </h1>
                <button
                    type="button"
                    onClick={(event) => {
                        taxDialogOpenerRef.current = event.currentTarget;
                        setShowNewModal(true);
                    }}
                    className="flex items-center justify-center px-4 py-1.5 rounded-lg border border-[#A855F7] bg-white text-black font-semibold text-sm hover:bg-purple-50 transition-colors shadow-2xs cursor-pointer"
                >
                    <span>+ {(t('common.new', 'New') || 'New').replace(/^\+\s*/, '')}</span>
                </button>
            </div>

            {/* Service Charges % Section */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-black mb-2">
                    {t('taxSetup.serviceCharges', 'Service Charges %')}
                </label>
                <div className="flex items-center gap-3">
                    {/* Stepper Input */}
                    <div className="relative flex-1 flex items-center bg-[#FAF5F8] border border-[#E2BBD5] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-300">
                        <input
                            type="text"
                            value={serviceCharges.endsWith('%') ? serviceCharges : `${serviceCharges}%`}
                            onChange={handleServiceChargeChange}
                            onBlur={handleServiceChargeBlur}
                            className="w-full bg-transparent px-4 py-3 text-sm font-medium text-black focus:outline-none"
                            placeholder="0.00%"
                        />
                        <div className="flex flex-col justify-center pr-3 shrink-0 select-none">
                            <button
                                type="button"
                                onClick={incrementServiceCharge}
                                aria-label={t('taxSetup.increaseServiceCharge', 'Increase service charge')}
                                className="text-gray-700 hover:text-black leading-none focus:outline-none cursor-pointer py-0.5"
                            >
                                <ChevronUp aria-hidden="true" size={14} strokeWidth={2.5} />
                            </button>
                            <button
                                type="button"
                                onClick={decrementServiceCharge}
                                aria-label={t('taxSetup.decreaseServiceCharge', 'Decrease service charge')}
                                className="text-gray-700 hover:text-black leading-none focus:outline-none cursor-pointer py-0.5"
                            >
                                <ChevronDown aria-hidden="true" size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* Gradient Save Button */}
                    <button
                        type="button"
                        onClick={handleSaveServiceCharge}
                        disabled={isSavingServiceCharge}
                        style={{
                            background: 'linear-gradient(135deg, #7B1FA2 0%, #C2185B 100%)'
                        }}
                        className="w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                        aria-label={t('common.save', 'Save')}
                    >
                        {isSavingServiceCharge ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Save size={20} strokeWidth={2} />
                        )}
                    </button>
                </div>
            </div>

            {/* Tax Setup Table */}
            <div className="overflow-x-auto border border-[#E5D7E3] rounded-sm">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#F9EFF5] text-gray-500">
                        <tr>
                            <th className="w-16 px-4 py-3.5 border border-[#E5D7E3] text-center font-semibold text-xs tracking-wider text-gray-500">
                                #
                            </th>
                            <th className="px-6 py-3.5 border border-[#E5D7E3] text-left font-semibold text-xs tracking-wider text-gray-500">
                                {t('taxSetup.table.title', 'Title')}
                            </th>
                            <th className="w-32 px-4 py-3.5 border border-[#E5D7E3] text-center font-semibold text-xs tracking-wider text-gray-500">
                                {t('taxSetup.table.rate', 'Rate')}
                            </th>
                            <th className="w-36 px-4 py-3.5 border border-[#E5D7E3] text-center font-semibold text-xs tracking-wider text-gray-500">
                                {t('taxSetup.table.type', 'Type')}
                            </th>
                            <th className="w-32 px-4 py-3.5 border border-[#E5D7E3] text-center font-semibold text-xs tracking-wider text-gray-500">
                                {t('taxSetup.table.action', 'Action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {displayedTaxes.map((item, index) => (
                            <tr key={item.Tax_setup_id || index} className="hover:bg-purple-50/20 transition-colors">
                                <td className="px-4 py-3.5 border border-[#E5D7E3] text-center font-bold text-black text-sm">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-3.5 border border-[#E5D7E3] text-left font-bold text-black text-sm capitalize">
                                    {item.title}
                                </td>
                                <td className="px-4 py-3.5 border border-[#E5D7E3] text-center font-bold text-black text-sm">
                                    {item.rate}%
                                </td>
                                <td className="px-4 py-3.5 border border-[#E5D7E3] text-center font-bold text-black text-sm capitalize">
                                    {item.type}
                                </td>
                                <td className="px-4 py-3.5 border border-[#E5D7E3] text-center">
                                    <div className="flex items-center justify-center gap-5">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(item)}
                                            className="text-gray-800 hover:text-black transition-colors cursor-pointer"
                                            aria-label={t('taxSetup.editTaxNamed', { title: item.title })}
                                        >
                                            <Pencil aria-hidden="true" size={17} strokeWidth={1.8} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openDeleteModal(item)}
                                            className="text-[#D32F2F] hover:text-red-700 transition-colors cursor-pointer"
                                            aria-label={t('taxSetup.deleteTaxNamed', { title: item.title })}
                                        >
                                            <Trash2 aria-hidden="true" size={17} strokeWidth={1.8} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* New Tax Modal */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="new-tax-dialog-title" className="bg-white rounded-2xl p-6 w-full max-w-[420px] relative shadow-2xl">
                        <h2 id="new-tax-dialog-title" className="text-xl font-bold mb-5 text-black">{t('taxSetup.newTax', 'New Tax Setup')}</h2>
                        <button
                            type="button"
                            autoFocus
                            aria-label={t('taxSetup.closeDialog', 'Close tax setup dialog')}
                            className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors cursor-pointer"
                            onClick={() => {
                                setShowNewModal(false);
                                resetNewForm();
                            }}
                        >
                            <X aria-hidden="true" size={20} />
                        </button>

                        <form onSubmit={handleCreateTax} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-black mb-1.5">{t('taxSetup.form.title', 'Title')}*</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newTaxForm.title}
                                    onChange={handleNewInputChange}
                                    placeholder={t('taxSetup.form.titlePlaceholder', 'e.g. Gst, VAT')}
                                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-black mb-1.5">{t('taxSetup.form.rate', 'Rate')} (%)*</label>
                                <input
                                    type="number"
                                    name="rate"
                                    value={newTaxForm.rate || ''}
                                    onChange={handleNewInputChange}
                                    placeholder={t('taxSetup.form.ratePlaceholder', 'e.g. 8')}
                                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                    disabled={isSubmitting}
                                    min="0"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-black mb-1.5">{t('taxSetup.form.type', 'Type')}</label>
                                <select
                                    name="type"
                                    value={newTaxForm.type}
                                    onChange={handleNewInputChange}
                                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    <option value="Inclusive">{t('taxSetup.form.types.inclusive', 'Inclusive')}</option>
                                    <option value="Exclusive">{t('taxSetup.form.types.exclusive', 'Exclusive')}</option>
                                    <option value="Percentage">{t('taxSetup.form.types.percentage', 'Percentage')}</option>
                                    <option value="Fixed">{t('taxSetup.form.types.fixed', 'Fixed')}</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    background: 'linear-gradient(90deg, #7B1FA2 0%, #C2185B 100%)'
                                }}
                                className="w-full py-3 text-white rounded-xl text-sm font-semibold shadow hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer mt-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg> {t('common.creating', 'Creating')}...
                                    </>
                                ) : (
                                    t('taxSetup.form.createTax', 'Create Tax')
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Tax Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="edit-tax-dialog-title" className="bg-white rounded-2xl p-6 w-full max-w-[420px] relative shadow-2xl">
                        <h2 id="edit-tax-dialog-title" className="text-xl font-bold mb-5 text-black">{t('taxSetup.editTax', 'Edit Tax Setup')}</h2>
                        <button
                            type="button"
                            autoFocus
                            aria-label={t('taxSetup.closeDialog', 'Close tax setup dialog')}
                            className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors cursor-pointer"
                            onClick={() => setShowEditModal(false)}
                        >
                            <X aria-hidden="true" size={20} />
                        </button>

                        <form onSubmit={handleUpdateTax} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-black mb-1.5">{t('taxSetup.form.title', 'Title')}*</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editTaxForm.title}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-black mb-1.5">{t('taxSetup.form.rate', 'Rate')} (%)*</label>
                                <input
                                    type="number"
                                    name="rate"
                                    value={editTaxForm.rate || ''}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                    disabled={isSubmitting}
                                    min="0"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-black mb-1.5">{t('taxSetup.form.type', 'Type')}</label>
                                <select
                                    name="type"
                                    value={editTaxForm.type}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    <option value="Inclusive">{t('taxSetup.form.types.inclusive', 'Inclusive')}</option>
                                    <option value="Exclusive">{t('taxSetup.form.types.exclusive', 'Exclusive')}</option>
                                    <option value="Percentage">{t('taxSetup.form.types.percentage', 'Percentage')}</option>
                                    <option value="Fixed">{t('taxSetup.form.types.fixed', 'Fixed')}</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    background: 'linear-gradient(90deg, #7B1FA2 0%, #C2185B 100%)'
                                }}
                                className="w-full py-3 text-white rounded-xl text-sm font-semibold shadow hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer mt-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg> {t('common.updating', 'Updating')}...
                                    </>
                                ) : (
                                    t('taxSetup.form.updateTax', 'Update Tax')
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="delete-tax-dialog-title" className="bg-white rounded-2xl p-6 w-full max-w-[400px] text-center shadow-2xl">
                        <h3 id="delete-tax-dialog-title" className="text-xl font-bold text-red-600 mb-2">{t('taxSetup.deleteTax', 'Delete Tax Setup')}</h3>
                        <p className="text-gray-700 mb-6 text-sm">
                            {t('taxSetup.deleteConfirmation', { title: selectedTax?.title })}
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteTax}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg> {t('common.deleting', 'Deleting')}...
                                    </>
                                ) : (
                                    t('common.delete', 'Delete')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxSetupTab;
