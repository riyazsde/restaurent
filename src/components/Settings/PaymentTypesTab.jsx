import { useState } from 'react';
import { SettingsGridSkeleton } from './SettingsSkeletons';
import { FiEdit } from 'react-icons/fi';
import { FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { 
    usePaymentTypes, 
    useCreatePaymentType, 
    useUpdatePaymentType,
    useDeletePaymentType 
} from '../../hooks/queries/usePaymentTypes';
import GradientOutlineButton from '../common/GradientOutlineButton';
import MerchantGatewaysSection from './MerchantGatewaysSection';

const PaymentTypesTab = () => {
    const { t } = useTranslation('settings');
    const [activeSubTab, setActiveSubTab] = useState('gateways');
    const { data: paymentTypes = [], isLoading } = usePaymentTypes();
    const createPaymentMutation = useCreatePaymentType();
    const updatePaymentMutation = useUpdatePaymentType();
    const deletePaymentMutation = useDeletePaymentType();

    const isSubmitting = createPaymentMutation.isPending || updatePaymentMutation.isPending || deletePaymentMutation.isPending;
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [newPaymentForm, setNewPaymentForm] = useState({
        option: '',
        Details: ''
    });

    const [editPaymentForm, setEditPaymentForm] = useState({
        id: null,
        option: '',
        Details: ''
    });

    const handleNewInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPaymentForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditPaymentForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();

        if (!newPaymentForm.option) {
            toast.error(t('paymentTypes.validationError'));
            return;
        }

        try {
            const requestData = {
                Name: newPaymentForm.option,
                image: '',
                Status: true,
                PaymentOption: [{
                    option: newPaymentForm.option,
                    Details: newPaymentForm.Details
                }]
            };
            const response = await createPaymentMutation.mutateAsync(requestData);
            if (response && response.success !== false) {
                toast.success(response?.message || t('paymentTypes.createSuccess'));
                setShowNewModal(false);
                resetNewForm();
            } else {
                toast.error(response?.message || t('paymentTypes.createError'));
            }
        } catch (error) {
            toast.error(error.message || t('paymentTypes.createError'));
        }
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();

        if (!editPaymentForm.option) {
            toast.error(t('paymentTypes.validationError'));
            return;
        }

        try {
            const requestData = {
                id: editPaymentForm.id,
                Name: editPaymentForm.option,
                Status: true,
                PaymentOption: [{
                    option: editPaymentForm.option,
                    Details: editPaymentForm.Details,
                    _id: selectedPayment?.PaymentOption?.[0]?._id
                }]
            };
            const response = await updatePaymentMutation.mutateAsync({
                id: editPaymentForm.id,
                data: requestData
            });
            if (response && response.success !== false) {
                toast.success(response?.message || t('paymentTypes.updateSuccess'));
                setShowEditModal(false);
            } else {
                toast.error(response?.message || t('paymentTypes.updateError'));
            }
        } catch (error) {
            toast.error(error.message || t('paymentTypes.updateError'));
        }
    };

    const handleDeletePayment = async () => {
        if (!selectedPayment) return;

        const id = selectedPayment.payment_type_id || selectedPayment.Payment_Options_id || selectedPayment.id || selectedPayment._id;
        try {
            const response = await deletePaymentMutation.mutateAsync(id);
            if (response && response.success !== false) {
                toast.success(response?.message || t('paymentTypes.deleteSuccess'));
                setShowDeleteModal(false);
                setSelectedPayment(null);
            } else {
                toast.error(response?.message || t('paymentTypes.deleteError'));
            }
        } catch (error) {
            toast.error(error.message || t('paymentTypes.deleteError'));
        }
    };

    const openEditModal = (payment) => {
        const id = payment.payment_type_id || payment.Payment_Options_id || payment.id || payment._id;
        const option = payment.Name || payment.PaymentOption?.[0]?.option || payment.option || '';
        const details = payment.nodes || payment.Details || payment.PaymentOption?.[0]?.Details || '';

        setEditPaymentForm({
            id,
            option,
            Details: details
        });
        setSelectedPayment(payment);
        setShowEditModal(true);
    };

    const openDeleteModal = (payment) => {
        setSelectedPayment(payment);
        setShowDeleteModal(true);
    };

    const resetNewForm = () => {
        setNewPaymentForm({
            option: '',
            Details: ''
        });
    };

    if (isLoading) {
        return <SettingsGridSkeleton />;
    }

    return (
        <div className="font-poppins">
            {/* Top Sub-tabs Switcher */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveSubTab('gateways')}
                    className={`pb-3 px-3 text-sm font-semibold transition-all relative cursor-pointer ${
                        activeSubTab === 'gateways'
                            ? 'text-purple-900 border-b-2 border-purple-800'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    {t('paymentTypes.tabs.gateways', 'Payment Gateways & Accounts (Card & MoMo)')}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSubTab('options')}
                    className={`pb-3 px-3 text-sm font-semibold transition-all relative cursor-pointer ${
                        activeSubTab === 'options'
                            ? 'text-purple-900 border-b-2 border-purple-800'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    {t('paymentTypes.tabs.options', 'POS Payment Options')}
                </button>
            </div>

            {activeSubTab === 'gateways' ? (
                <MerchantGatewaysSection />
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                        <h1 className="text-2xl md:text-[32px] font-bold text-black">{t('paymentTypes.title')}</h1>
                        <GradientOutlineButton
                            onClick={() => setShowNewModal(true)}
                            className="mt-2 sm:mt-0 sm:ml-6 px-5 rounded-[12px]"
                        >
                            {t('common.new')}
                        </GradientOutlineButton>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm">
                            <thead className="bg-[#F8EAF0] text-left">
                                <tr>
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">{t('paymentTypes.table.name')}</th>
                                    <th className="px-4 py-2 border">{t('paymentTypes.table.description')}</th>
                                    <th className="px-4 py-2 border">{t('paymentTypes.table.status')}</th>
                                    <th className="px-4 py-2 border">{t('paymentTypes.table.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentTypes.length > 0 ? (
                                    paymentTypes.map((item, index) => {
                                        const id = item.payment_type_id || item.Payment_Options_id || item.id || item._id;
                                        const optionName = item.Name || item.PaymentOption?.[0]?.option || item.option || '-';
                                        const optionDetails = item.nodes || item.Details || item.PaymentOption?.[0]?.Details || '-';

                                        return (
                                            <tr key={id || index}>
                                                <td className="px-4 py-2 border">{index + 1}</td>
                                                <td className="px-4 py-2 border font-medium text-black">{optionName}</td>
                                                <td className="px-4 py-2 border text-gray-700">{optionDetails}</td>
                                                <td className="px-4 py-2 border">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.Status !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {item.Status !== false ? t('paymentTypes.active') : t('paymentTypes.inactive')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 border flex items-center gap-3">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="text-[#8A1538] hover:scale-110 transition"
                                                        title={t('common.edit')}
                                                    >
                                                        <FiEdit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(item)}
                                                        className="text-red-600 hover:scale-110 transition"
                                                        title={t('common.delete')}
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            {t('paymentTypes.noPaymentTypes')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* New Payment Type Modal */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-[420px] relative shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-black">{t('paymentTypes.newPaymentType')}</h2>
                        <button
                            className="absolute top-4 right-4 text-lg text-gray-500 hover:text-black"
                            onClick={() => {
                                setShowNewModal(false);
                                resetNewForm();
                            }}
                        >
                            <FaTimes />
                        </button>

                        <form onSubmit={handleCreatePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">{t('paymentTypes.form.name') || 'Payment Option'}*</label>
                                <input
                                    type="text"
                                    name="option"
                                    value={newPaymentForm.option}
                                    onChange={handleNewInputChange}
                                    placeholder={t('paymentTypes.form.namePlaceholder') || 'e.g., Credit Card'}
                                    className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">{t('paymentTypes.form.description') || 'Description'}</label>
                                <textarea
                                    name="Details"
                                    value={newPaymentForm.Details}
                                    onChange={handleNewInputChange}
                                    placeholder={t('paymentTypes.form.descriptionPlaceholder') || 'Payment option details'}
                                    rows="3"
                                    className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
                                }}
                                className="w-full py-2.5 text-white rounded-lg text-sm font-semibold shadow hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg> {t('common.creating')}...
                                    </>
                                ) : (
                                    t('paymentTypes.form.createPaymentType')
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Payment Type Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-[420px] relative shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-black">{t('paymentTypes.editPaymentType')}</h2>
                        <button
                            className="absolute top-4 right-4 text-lg text-gray-500 hover:text-black"
                            onClick={() => setShowEditModal(false)}
                        >
                            <FaTimes />
                        </button>

                        <form onSubmit={handleUpdatePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">{t('paymentTypes.form.name') || 'Payment Option'}*</label>
                                <input
                                    type="text"
                                    name="option"
                                    value={editPaymentForm.option}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-black">{t('paymentTypes.form.description') || 'Description'}</label>
                                <textarea
                                    name="Details"
                                    value={editPaymentForm.Details}
                                    onChange={handleEditInputChange}
                                    rows="3"
                                    className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
                                }}
                                className="w-full py-2.5 text-white rounded-lg text-sm font-semibold shadow hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg> {t('common.updating')}...
                                    </>
                                ) : (
                                    t('paymentTypes.form.updatePaymentType')
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-[400px] text-center shadow-lg">
                        <h3 className="text-xl font-bold text-red-600 mb-2">{t('paymentTypes.deletePaymentType')}</h3>
                        <p className="text-gray-700 mb-6">
                            {t('paymentTypes.deleteConfirmation', { name: selectedPayment?.Name || selectedPayment?.PaymentOption?.[0]?.option || '' })}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-gray-200 text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                                disabled={isSubmitting}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDeletePayment}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg> {t('common.deleting')}...
                                    </>
                                ) : (
                                    t('common.delete')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentTypesTab;
