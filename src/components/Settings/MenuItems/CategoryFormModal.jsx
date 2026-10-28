import React, { useState, useRef, useEffect } from 'react';
import Modal from '../../common/Modal';
import { useTranslation } from 'react-i18next';
import { IMAGE_BASE_URL } from '../../../services/fileUploadService';
import { useUploadStoreImage } from '../../../hooks/queries/useStore';
import { toast } from 'react-toastify';

const CategoryFormModal = ({ isOpen, onClose, isEdit, categoryData, onSave, isLoading }) => {
    const { t } = useTranslation('settings');
    const [formData, setFormData] = useState({
        name: '',
        image: ''
    });
    const uploadImageMutation = useUploadStoreImage();
    const isUploading = uploadImageMutation.isPending;
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (isEdit && categoryData) {
                setFormData({
                    name: categoryData.Name || '',
                    image: categoryData.image || ''
                });
            } else {
                setFormData({ name: '', image: '' });
            }
        }
    }, [isOpen, isEdit, categoryData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        try {
            const response = await uploadImageMutation.mutateAsync(file);
            if (response && (response.success || response.data)) {
                const imgData = response.data || response;
                setFormData(prev => ({ ...prev, image: imgData.serverfile || imgData.filename || imgData }));
                toast.success('Image uploaded successfully');
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to upload image');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getImageUrl = (imageTail) => {
        if (!imageTail) return '';
        if (imageTail.startsWith('http')) return imageTail;
        return `${IMAGE_BASE_URL}${imageTail}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error(t('menuItems.messages.enterCategoryName', 'Please enter a category name'));
            return;
        }
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[500px]">
            <form onSubmit={handleSubmit} className="p-2">
                <h2 className="text-2xl font-bold text-black mb-6">
                    {isEdit ? 'Edit Category' : 'Add New Category'}
                </h2>

                <div className="space-y-6">
                    {/* Category Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-black font-bold text-[15px]">Category Title</label>
                        <div className="p-[1px] rounded-xl bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Infused Chicken"
                                className="w-full bg-[#F5EAF4] text-gray-800 rounded-[11px] px-4 py-3 outline-none font-medium placeholder-gray-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Upload Image */}
                    <div className="flex flex-col gap-2">
                        <div className="p-[1px] rounded-xl bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]">
                            <div className="w-full bg-[#F5EAF4] rounded-[11px] px-4 py-4 flex flex-col gap-3">
                                <label className="text-black font-medium text-sm">Please Upload image of the Product</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {formData.image ? (
                                            <img
                                                src={getImageUrl(formData.image)}
                                                alt="Category Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            disabled={isUploading || isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading || isLoading}
                                            className="px-5 py-2 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]"
                                        >
                                            {isUploading ? 'Uploading...' : 'Choose File'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isUploading || isLoading}
                                            className="px-5 py-2 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]"
                                        >
                                            Take Photo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading || isUploading}
                        className="flex-1 py-3 rounded-xl border border-gray-300 text-black font-semibold text-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || isUploading}
                        className="flex-1 py-3 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : 'Okay'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CategoryFormModal;
