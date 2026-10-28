import React from 'react';

const StatusToggleModal = ({ isOpen, onClose, onConfirm, itemName, currentStatus, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
                    {currentStatus ? 'Deactivate Item' : 'Activate Item'}
                </h2>
                <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins' }}>
                    Are you sure you want to {currentStatus ? 'deactivate' : 'activate'} <span className="font-semibold">"{itemName}"</span>?
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                        style={{ fontFamily: 'Poppins' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                            fontFamily: 'Poppins',
                        }}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </>
                        ) : (
                            'Confirm'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusToggleModal;
