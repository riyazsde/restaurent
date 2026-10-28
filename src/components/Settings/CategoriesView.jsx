import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash, FaEdit, FaTrash } from 'react-icons/fa';
import { useCategories } from '../../hooks/queries/useCategories';
import CategoryFormModal from './MenuItems/CategoryFormModal';
import ConfirmDialog from '../common/ConfirmDialog';
import CategorySkeleton from './MenuItems/CategorySkeleton';
import GradientOutlineButton from '../common/GradientOutlineButton';
import { toast } from 'react-toastify';

const CategoriesView = ({ onBack }) => {
    const { t } = useTranslation('settings');
    const { getCategories, createCategory, updateCategory, deleteCategory } = useCategories();
    const { data: categories = [], isLoading } = getCategories;

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Toggle Visibility
    const handleToggleVisibility = (category) => {
        updateCategory.mutate({
            id: category.Items_types_id,
            emozi: category.emozi,
            image: category.image,
            Name: category.Name,
            details: category.details,
            Status: !category.Status
        });
    };

    // Open Edit Modal
    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setIsEditMode(true);
        setIsFormModalOpen(true);
    };

    // Open Add Modal
    const handleAddClick = () => {
        setSelectedCategory(null);
        setIsEditMode(false);
        setIsFormModalOpen(true);
    };

    // Save Form
    const handleSaveForm = (formData) => {
        const payload = {
            Name: formData.name,
            image: formData.image || 'https://example.com/default.jpg',
            emozi: '🍕', // default or empty depending on backend needs since it's removed from UI
            details: '', 
            Status: true
        };

        if (isEditMode && selectedCategory) {
            updateCategory.mutate(
                { id: selectedCategory.Items_types_id, ...payload },
                {
                    onSuccess: () => setIsFormModalOpen(false)
                }
            );
        } else {
            createCategory.mutate(payload, {
                onSuccess: () => setIsFormModalOpen(false)
            });
        }
    };

    // Open Delete Modal
    const handleDeleteClick = (category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    // Confirm Delete
    const handleConfirmDelete = () => {
        if (selectedCategory?.Items_types_id) {
            deleteCategory.mutate(selectedCategory.Items_types_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedCategory(null);
                }
            });
        }
    };

    return (
        <div className="mx-auto p-6 md:p-8 font-poppins w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center mb-8 font-poppins">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="text-2xl md:text-[32px] font-bold text-black hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        Menu
                    </button>
                    <span className="text-2xl font-semibold text-black">›</span>
                    <h2 className="text-2xl md:text-[32px] font-bold text-black">
                        Categories
                    </h2>
                    <GradientOutlineButton
                        onClick={handleAddClick}
                        className="ml-4 px-5 rounded-[12px]"
                    >
                        {t('common.new', '+ New')}
                    </GradientOutlineButton>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#F8F9FA] rounded-[20px] overflow-hidden">
                <table className="w-full text-left font-poppins border-collapse">
                    <thead>
                        <tr className="bg-[#F5EAF4]">
                            <th className="px-6 py-4 font-semibold text-black border-b border-gray-200 w-16">#</th>
                            <th className="px-6 py-4 font-semibold text-black border-b border-gray-200">Category Title</th>
                            <th className="px-6 py-4 font-semibold text-black border-b border-gray-200 w-40">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {isLoading ? (
                            <>
                                <CategorySkeleton />
                                <CategorySkeleton />
                                <CategorySkeleton />
                                <CategorySkeleton />
                                <CategorySkeleton />
                            </>
                        ) : categories.length > 0 ? (
                            categories.map((category, index) => (
                                <tr key={category.Items_types_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-black font-medium">{index + 1}</td>
                                    <td className="px-6 py-4 text-black font-medium">{category.Name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleToggleVisibility(category)}
                                                className={`transition-colors ${category.Status ? 'text-black hover:opacity-70' : 'text-gray-400 hover:text-black'}`}
                                                title={category.Status ? 'Hide' : 'Show'}
                                            >
                                                {category.Status ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(category)}
                                                className="text-black hover:opacity-70 transition-colors"
                                            >
                                                <FaEdit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(category)}
                                                className="text-[#CC1919] hover:opacity-70 transition-colors"
                                            >
                                                <FaTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500 font-medium">
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <CategoryFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                isEdit={isEditMode}
                categoryData={selectedCategory}
                onSave={handleSaveForm}
                isLoading={createCategory.isPending || updateCategory.isPending}
            />

            <ConfirmDialog 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteCategory.isPending}
            />
        </div>
    );
};

export default CategoriesView;
