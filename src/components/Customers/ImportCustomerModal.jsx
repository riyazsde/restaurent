import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaCloudUploadAlt, FaFileCsv, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import customerService from '../../services/customerService';
import { parseCustomersCSV, downloadCustomerTemplateCSV } from '../../utils/customerCsvUtils';

const ImportCustomerModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation('customer');
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [skippedCount, setSkippedCount] = useState(0);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const processFile = (selectedFile) => {
        if (!selectedFile.name.endsWith('.csv')) {
            toast.error(t('importModal.noValidRows', 'Please select a valid CSV file.'));
            return;
        }

        setFile(selectedFile);
        setIsParsing(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                const { validRows, skippedCount: skipped } = parseCustomersCSV(text);
                setParsedData(validRows);
                setSkippedCount(skipped);
                if (validRows.length === 0) {
                    toast.warning(t('importModal.noValidRows', 'No valid customer rows found in CSV.'));
                }
            } catch (err) {
                console.error('CSV parse error:', err);
                toast.error(t('importModal.importError', 'Failed to read CSV file.'));
                setParsedData([]);
            } finally {
                setIsParsing(false);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        if (parsedData.length === 0) return;

        setIsImporting(true);
        setImportProgress({ current: 0, total: parsedData.length });

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < parsedData.length; i++) {
            const customer = parsedData[i];
            try {
                await customerService.createCustomer(customer);
                successCount++;
            } catch (error) {
                console.error(`Failed to import customer ${customer.Name}:`, error);
                failCount++;
            }
            setImportProgress({ current: i + 1, total: parsedData.length });
        }

        setIsImporting(false);

        if (successCount > 0) {
            if (failCount > 0) {
                toast.warn(t('importModal.importPartial', { success: successCount, failed: failCount }));
            } else {
                toast.success(t('importModal.importSuccess', { count: successCount }));
            }
            onSuccess();
            handleClose();
        } else {
            toast.error(t('importModal.importError', 'Failed to import customers'));
        }
    };

    const handleClose = () => {
        setFile(null);
        setParsedData([]);
        setSkippedCount(0);
        setIsImporting(false);
        setImportProgress({ current: 0, total: 0 });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 font-poppins">
            <div className="bg-white w-full max-w-xl rounded-2xl relative shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('importModal.title', 'Import Customers')}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{t('importModal.subtitle', 'Upload a CSV file to bulk import customers into your database.')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isImporting}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                    {/* Template download helper */}
                    <div className="flex items-center justify-between bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                            <FaFileCsv className="text-[#6A1B9A] text-xl" />
                            <span className="text-xs sm:text-sm text-gray-700 font-medium">
                                {t('importModal.downloadTemplate', 'Download CSV Template')}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={downloadCustomerTemplateCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 text-[#6A1B9A] text-xs font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-2xs"
                        >
                            <FaDownload className="text-xs" />
                            <span>CSV</span>
                        </button>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                            file ? 'border-[#6A1B9A] bg-purple-50/20' : 'border-gray-200 hover:border-[#6A1B9A] hover:bg-gray-50/50'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-[#6A1B9A] text-xl">
                                <FaCloudUploadAlt />
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                                {file ? file.name : t('importModal.dragDrop', 'Click to upload or drag and drop a CSV file')}
                            </p>
                            <p className="text-xs text-gray-400">
                                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'CSV with headers: Name, Phone, DOB, Address, Notes'}
                            </p>
                        </div>
                    </div>

                    {/* Parsing Spinner */}
                    {isParsing && (
                        <div className="text-center py-4 text-sm text-gray-500">
                            Loading and parsing CSV file...
                        </div>
                    )}

                    {/* Preview Table */}
                    {parsedData.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-gray-700">
                                    {t('importModal.readyToImport', { count: parsedData.length })}
                                </span>
                                {skippedCount > 0 && (
                                    <span className="text-amber-600 font-medium">
                                        {t('importModal.skippedRows', { count: skippedCount })}
                                    </span>
                                )}
                            </div>

                            <div className="border border-gray-100 rounded-lg overflow-x-auto max-h-48 text-xs">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                                        <tr>
                                            <th className="p-2 font-medium">Name</th>
                                            <th className="p-2 font-medium">Phone</th>
                                            <th className="p-2 font-medium">DOB</th>
                                            <th className="p-2 font-medium">Type</th>
                                            <th className="p-2 font-medium">Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {parsedData.slice(0, 5).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="p-2 font-medium truncate max-w-[120px]">{row.Name}</td>
                                                <td className="p-2 whitespace-nowrap">{row.phone}</td>
                                                <td className="p-2 whitespace-nowrap">{row.DOB}</td>
                                                <td className="p-2 whitespace-nowrap">
                                                    {row.Customer_type_id === 2 ? 'VIP' : 'Premium VIP'}
                                                </td>
                                                <td className="p-2 truncate max-w-[140px]">{row.Address || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedData.length > 5 && (
                                <p className="text-[11px] text-gray-400 text-right">
                                    + {parsedData.length - 5} more customers
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isImporting}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
                    >
                        {t('importModal.cancel', 'Cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={parsedData.length === 0 || isImporting}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                        {isImporting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('importModal.importing', { current: importProgress.current, total: importProgress.total })}
                            </>
                        ) : (
                            t('importModal.importButton', 'Import Customers')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportCustomerModal;
