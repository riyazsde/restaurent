import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import GradientOutlineButton from '../common/GradientOutlineButton';
import LoyaltyTiersTable from './Loyalty/LoyaltyTiersTable';
import HappyHourCard from './Loyalty/HappyHourCard';
import TierModal from './Loyalty/TierModal';
import PromotionDeleteModal from './PromotionDeleteModal';
import { 
    useCreateTier, 
    useUpdateTier, 
    useDeleteTier
} from '../../hooks/queries/useLoyalty';

const LoyaltyPrograms = () => {
    const { t } = useTranslation('common');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);

    const createMutation = useCreateTier();
    const updateMutation = useUpdateTier();
    const deleteMutation = useDeleteTier();

    const handleOpenAdd = () => {
        setSelectedTier(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (tier) => {
        setSelectedTier(tier);
        setIsFormModalOpen(true);
    };

    const handleOpenDelete = (tier) => {
        setSelectedTier(tier);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (formData.id) {
                await updateMutation.mutateAsync(formData);
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsFormModalOpen(false);
        } catch (err) {
            toast.error(err.message || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        if (selectedTier?.id) {
            try {
                await deleteMutation.mutateAsync(selectedTier.id);
                setIsDeleteModalOpen(false);
            } catch (err) {
                toast.error(err.message || 'Failed to delete tier');
            }
        }
    };

    return (
        <div className="p-8 font-poppins min-h-screen">
            {/* Header matching Figma */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-[32px] md:text-[40px] font-extrabold text-black">
                        {t('loyalty.title', 'Loyalty Programs')}
                    </h1>
                </div>
                <div>
                    <GradientOutlineButton onClick={handleOpenAdd}>
                        {t('loyalty.new', '+ New')}
                    </GradientOutlineButton>
                </div>
            </div>

            {/* Tiers Table matching Figma */}
            <LoyaltyTiersTable 
                onEdit={handleOpenEdit} 
                onDelete={handleOpenDelete} 
            />

            {/* Happy Hour Settings Card matching Figma */}
            <HappyHourCard />

            {/* Tier Add/Edit Modal matching Figma */}
            <TierModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedTier}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            {/* Tier Delete Modal */}
            <PromotionDeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                isDeleting={deleteMutation.isPending}
                title={t('loyalty.deleteConfirmTitle', 'Are you sure?')}
                description={t('loyalty.deleteConfirmDesc', 'Do you really want to delete this loyalty tier? This action cannot be undone.')}
            />
        </div>
    );
};

export default LoyaltyPrograms;
