import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GradientOutlineButton from '../common/GradientOutlineButton';
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PromotionModal from './PromotionModal';
import PromotionDeleteModal from './PromotionDeleteModal';
import useSearchStore from '../../store/searchStore';
import {
    usePromotions,
    useCreatePromotion,
    useUpdatePromotion,
    useDeletePromotion,
    useTogglePromotionStatus
} from '../../hooks/queries/usePromotions';

const Promotions = () => {
    const { t } = useTranslation('common');
    const { searchQuery: globalSearch, setSearchPlaceholder } = useSearchStore();
    const [page, setPage] = useState(1);
    const limit = 10;
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    useEffect(() => {
        setSearchPlaceholder(t('promotions.searchPlaceholder', 'Search promotions...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    // Reset page to 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [globalSearch]);

    // Queries & Mutations
    const { data, isLoading } = usePromotions({ 
        page, 
        limit, 
        search: globalSearch ? globalSearch.trim() : undefined 
    });
    
    const createMutation = useCreatePromotion();
    const updateMutation = useUpdatePromotion();
    const deleteMutation = useDeletePromotion();
    const toggleStatusMutation = useTogglePromotionStatus();

    const promotions = data?.data || [];
    const pagination = data?.pagination || {
        current_page: page,
        total_pages: 1,
        total_promotions: promotions.length
    };

    const handleOpenAdd = () => {
        setSelectedPromotion(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (promotion) => {
        setSelectedPromotion(promotion);
        setIsFormModalOpen(true);
    };

    const handleOpenDelete = (promotion) => {
        setSelectedPromotion(promotion);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (formData.Promotion_id) {
                await updateMutation.mutateAsync(formData);
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsFormModalOpen(false);
        } catch (error) {
            // error is handled in mutation onError
        }
    };

    const handleDelete = async () => {
        if (!selectedPromotion) return;
        const targetId = selectedPromotion.Promotion_id ?? selectedPromotion._id ?? selectedPromotion.id;
        if (targetId) {
            try {
                await deleteMutation.mutateAsync(targetId);
                setIsDeleteModalOpen(false);
            } catch (error) {
                // error is handled in mutation onError
            }
        }
    };

    const handleToggleStatus = (promotion) => {
        const targetId = promotion.Promotion_id ?? promotion._id ?? promotion.id;
        toggleStatusMutation.mutate({
            id: targetId,
            status: !promotion.Status
        });
    };

    return (
        <div className="p-6 md:p-10 font-poppins min-h-screen bg-[#FDFDFD]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-[28px] md:text-[36px] font-bold text-gray-900 leading-tight">
                    {t('promotions.title', 'Promotions')}
                </h1>
                <GradientOutlineButton onClick={handleOpenAdd}>
                    {t('promotions.new', '+ New')}
                </GradientOutlineButton>
            </div>
            
            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[760px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-white">
                                <th className="px-6 py-4 text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap border-r border-gray-100 last:border-r-0 w-16">
                                    #
                                </th>
                                <th className="px-6 py-4 text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap border-r border-gray-100 last:border-r-0">
                                    {t('promotions.couponCode', 'Coupon Code')}
                                </th>
                                <th className="px-6 py-4 text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap border-r border-gray-100 last:border-r-0">
                                    {t('promotions.status', 'Status')}
                                </th>
                                <th className="px-6 py-4 text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap border-r border-gray-100 last:border-r-0">
                                    {t('promotions.offer', 'Offer')}
                                </th>
                                <th className="px-6 py-4 text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap border-r border-gray-100 last:border-r-0">
                                    {t('promotions.category', 'Catagory')}
                                </th>
                                <th className="px-6 py-4 text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap">
                                    {t('promotions.action', 'Action')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={`promo-skeleton-${i}`} className="border-b border-gray-50 animate-pulse">
                                        <td className="px-6 py-5 border-r border-gray-100">
                                            <div className="h-4 w-6 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-5 border-r border-gray-100">
                                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-5 border-r border-gray-100">
                                            <div className="h-7 w-20 bg-gray-200 rounded-full"></div>
                                        </td>
                                        <td className="px-6 py-5 border-r border-gray-100">
                                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-5 border-r border-gray-100">
                                            <div className="h-4 w-36 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-2">
                                                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : promotions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-500 text-sm">
                                        {t('promotions.noPromotions', 'No promotions found')}
                                    </td>
                                </tr>
                            ) : (
                                promotions.map((promo, index) => (
                                    <tr 
                                        key={promo.Promotion_id || promo._id || index} 
                                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-5 text-sm text-gray-800 border-r border-gray-100">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-gray-900 border-r border-gray-100">
                                            {promo.coupon_code}
                                        </td>
                                        <td className="px-6 py-5 border-r border-gray-100">
                                            <button 
                                                type="button"
                                                onClick={() => handleToggleStatus(promo)}
                                                disabled={toggleStatusMutation.isLoading}
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60 ${
                                                    promo.Status 
                                                        ? 'bg-[#4CAF50] hover:bg-[#439649]' 
                                                        : 'bg-[#B73E4D] hover:bg-[#a33543]'
                                                }`}
                                                title={promo.Status ? t('promotions.inactive', 'Inactive') : t('promotions.active', 'Active')}
                                            >
                                                <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs flex-shrink-0" />
                                                <span>{promo.Status ? t('promotions.active', 'Active') : t('promotions.inactive', 'Inactive')}</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-800 border-r border-gray-100">
                                            {promo.offer}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-800 border-r border-gray-100">
                                            {promo.category}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenEdit(promo)}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    title={t('promotions.editPromotion', 'Edit Promotion')}
                                                >
                                                    <FiEdit2 size={15} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenDelete(promo)}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer"
                                                    title={t('promotions.delete', 'Delete')}
                                                >
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (shown if more than 1 page exists) */}
                {pagination.total_pages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-white">
                        <span className="text-xs text-gray-500">
                            Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_promotions} total)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-semibold px-2 text-gray-700">
                                {page}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(p + 1, pagination.total_pages))}
                                disabled={page >= pagination.total_pages}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <PromotionModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedPromotion}
                isSubmitting={createMutation.isLoading || updateMutation.isLoading}
            />

            <PromotionDeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                isDeleting={deleteMutation.isLoading}
            />
        </div>
    );
};

export default Promotions;
