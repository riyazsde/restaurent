import React, { useState, useEffect } from 'react';
import { FiFilter, FiEye } from 'react-icons/fi';
import { BiExport } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useFeedbacks, useGetFeedbackByIdMutation } from '../../hooks/queries/useFeedback';
import feedbackService from '../../services/feedbackService';
import FeedbackFilterModal from './FeedbackFilterModal';
import useSearchStore from '../../store/searchStore';

const FeedbackTable = () => {
    const { searchQuery: globalSearch, setSearchPlaceholder } = useSearchStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        setSearchPlaceholder('Search feedback & reviews...');
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder]);

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearchTerm(globalSearch);
            setSearchQuery(globalSearch);
        }
    }, [globalSearch]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        sortByDay: 'Today',
        from: '',
        to: ''
    });

    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [feedbackDetails, setFeedbackDetails] = useState(null);
    const getFeedbackByIdMutation = useGetFeedbackByIdMutation();
    const isLoadingDetails = getFeedbackByIdMutation.isPending;

    const handleViewFeedback = async (item) => {
        setSelectedFeedback(item);
        setIsDetailModalOpen(true);
        try {
            const id = item.feedback_id || item.id || item._id;
            const res = await getFeedbackByIdMutation.mutateAsync(id);
            setFeedbackDetails(res?.data || res || item);
        } catch (err) {
            setFeedbackDetails(item);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const params = {};
            if (filters.from) params.from = filters.from;
            if (filters.to) params.to = filters.to;
            if (searchQuery) params.search = searchQuery;
            const blob = await feedbackService.exportFeedback(params);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Feedback exported successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to export feedback');
        } finally {
            setIsExporting(false);
        }
    };

    const { data: response, isLoading } = useFeedbacks({
        page: 1,
        limit: 10,
        search: searchQuery,
        from: filters.from,
        to: filters.to
    });

    // Mock data fallback if API fails
    const mockFeedbacks = [
        { feedback_id: 1, CreateAt: '2025-03-26T00:00:00', order_id: { client_mobile_no: '+27 72-123-4567', Quick_Order_id: 2029 }, feedback_Type_id: { feedback_type: 'Good' }, feedback: 'Could improve servings speed...' },
    ];

    // The API returns { success: true, data: { feedbacks: [...] } }
    let feedbacks = mockFeedbacks;
    if (response?.data?.feedbacks) {
        feedbacks = response.data.feedbacks;
    } else if (Array.isArray(response?.data)) {
        feedbacks = response.data;
    } else if (Array.isArray(response)) {
        feedbacks = response;
    }

    const handleSearch = () => {
        setSearchQuery(searchTerm);
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setIsFilterModalOpen(false);
    };

    return (
        <div className="mt-8 font-poppins">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search Invoices"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="bg-[#FDF4F9] text-gray-700 placeholder-gray-500 rounded-xl px-4 py-2.5 w-[220px] outline-none text-sm font-medium border border-transparent focus:border-purple-200"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white rounded-xl px-8 py-2.5 text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
                    >
                        Search
                    </button>
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="p-2 text-gray-500 hover:text-black transition-colors"
                    >
                        <FiFilter size={20} />
                    </button>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white rounded-xl px-6 py-2.5 text-sm font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    <BiExport size={16} /> {isExporting ? 'Exporting...' : 'Export'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-[#F9EAF2] border-b border-gray-200">
                                <th className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap border-r border-gray-200">Date</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap border-r border-gray-200">Customer</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap border-r border-gray-200">Phone</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap border-r border-gray-200">Invoice</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap border-r border-gray-200">Overall Feedback</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap border-r border-gray-200">Remarks</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="p-8">
                                        <div className="space-y-4 animate-pulse">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-12 bg-gray-100 rounded"></div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ) : feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-gray-500 font-medium">No feedback found.</td>
                                </tr>
                            ) : (
                                feedbacks?.map((item, idx) => (
                                    <tr key={item.feedback_id || idx} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">
                                            {item.CreateAt ? new Date(item.CreateAt).toLocaleDateString('en-US') : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">
                                            {/* We don't have customer name easily in this endpoint, mock for now or use phone */}
                                            {item.customer_name || 'Walk-in Customer'}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">
                                            {item.order_id?.client_mobile_no || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">
                                            #{item.order_id?.Quick_Order_id || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">
                                            {item.feedback_Type_id?.feedback_type || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200 truncate max-w-[200px]">
                                            {item.feedback || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button 
                                                onClick={() => handleViewFeedback(item)}
                                                className="p-1.5 bg-[#F9EAF2] text-[#6A1B9A] rounded-full hover:bg-purple-100 transition-colors"
                                                title="View Details"
                                            >
                                                <FiEye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <FeedbackFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
            />

            {/* Feedback Details Modal */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in">
                        <button
                            onClick={() => setIsDetailModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                        >
                            <IoMdClose size={22} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Customer Feedback Details</h3>
                        
                        {isLoadingDetails ? (
                            <div className="space-y-4 py-8 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-20 bg-gray-100 rounded"></div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <span className="text-xs text-gray-500">Customer</span>
                                        <p className="font-semibold text-gray-800">{feedbackDetails?.customer_name || 'Walk-in Guest'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Mobile Phone</span>
                                        <p className="font-semibold text-gray-800">{feedbackDetails?.order_id?.client_mobile_no || feedbackDetails?.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Invoice / Order ID</span>
                                        <p className="font-semibold text-purple-700">#{feedbackDetails?.order_id?.Quick_Order_id || feedbackDetails?.order_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Feedback Type</span>
                                        <p className="font-semibold text-green-700">{feedbackDetails?.feedback_Type_id?.feedback_type || feedbackDetails?.rating || 'Good'}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-500">Comments & Suggestions</span>
                                    <div className="mt-1 p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-gray-700 min-h-[80px]">
                                        {feedbackDetails?.feedback || 'No written remarks provided.'}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={() => setIsDetailModalOpen(false)}
                                        style={{ background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)' }}
                                        className="px-6 py-2 text-white rounded-xl text-sm font-medium hover:opacity-90"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackTable;
