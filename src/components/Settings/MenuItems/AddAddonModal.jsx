import React from 'react';

const AddAddonModal = ({ isOpen, onClose, newAddon, setNewAddon, onSave, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black"
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope' }}>
                    Add Addon
                </h2>

                <div className="space-y-4" style={{ fontFamily: 'Poppins' }}>
                    <div>
                        <label className="block text-base font-medium mb-2">Addon Name</label>
                        <input
                            type="text"
                            value={newAddon.name}
                            onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                            placeholder="Extra cheese"
                            className="w-full px-4 py-3 rounded-lg text-base"
                            style={{
                                background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)',
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-2">Addon Price</label>
                        <input
                            type="number"
                            value={newAddon.price}
                            onChange={(e) => setNewAddon({ ...newAddon, price: e.target.value })}
                            placeholder="100 XOF"
                            className="w-full px-4 py-3 rounded-lg text-base"
                            style={{
                                background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)',
                            }}
                        />
                        <p className="text-sm text-gray-600 mt-1">*Entered price = Final price, overrides base price.</p>
                    </div>

                    <button
                        onClick={onSave}
                        disabled={isLoading}
                        className="w-full py-3 rounded-lg text-white text-lg font-medium hover:opacity-90 disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                        }}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAddonModal;
