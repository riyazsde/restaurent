import React from 'react';
import { FiX } from 'react-icons/fi';

const AddVariantModal = ({ isOpen, onClose, newVariant, setNewVariant, onSave, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[20px] p-10 w-full max-w-lg shadow-2xl relative font-poppins">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                    <FiX size={28} />
                </button>

                <h2 className="text-3xl font-bold mb-8 text-black">
                    Add Variant
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[18px] font-medium text-black mb-3">Variant Name</label>
                        <input
                            type="text"
                            value={newVariant?.name || ''}
                            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                            placeholder="Extra cheese"
                            className="w-full px-5 py-4 rounded-xl text-[16px] font-medium text-black focus:outline-none"
                            style={{
                                background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)',
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-[18px] font-medium text-black mb-3">Variant Price</label>
                        <input
                            type="text"
                            value={newVariant?.price || ''}
                            onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                            placeholder="100 XOF"
                            className="w-full px-5 py-4 rounded-xl text-[16px] font-medium text-black focus:outline-none"
                            style={{
                                background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)',
                            }}
                        />
                        <p className="text-[12px] text-black font-bold mt-2">*Entered price = Final price, overrides base price.</p>
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button
                            onClick={onSave}
                            disabled={isLoading}
                            className="w-[280px] py-4 rounded-xl text-white text-[20px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                            style={{
                                background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                            }}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddVariantModal;
