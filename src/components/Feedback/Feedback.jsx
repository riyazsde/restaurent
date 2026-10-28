
import React, { useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { FaFilter } from 'react-icons/fa';
import { BiExport } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { useFeedbackTypes, useFeedbacks, useReviews } from '../../hooks/queries/useFeedback';

const FeedbackDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { data: feedbackTypes = [] } = useFeedbackTypes(1, 100);
    const { data: reviews = [] } = useReviews(1, 100);
    const { data: feedbacksResponse, isLoading } = useFeedbacks({ page: 1, limit: 100, search: searchQuery });

    const feedbacks = feedbacksResponse?.data?.feedbacks || 
        (Array.isArray(feedbacksResponse?.data) ? feedbacksResponse.data : 
        (Array.isArray(feedbacksResponse) ? feedbacksResponse : []));

    const handleSearch = () => {
        setSearchQuery(searchTerm);
    };

    const getStarEmoji = (starCount) => {
        if (starCount >= 5) return '😍';
        if (starCount >= 4) return '😊';
        if (starCount >= 3) return '😐';
        if (starCount >= 2) return '😕';
        return '😡';
    };

    const getStarLabel = (starCount) => {
        if (starCount >= 5) return 'Loved it';
        if (starCount >= 4) return 'Good';
        if (starCount >= 3) return 'Average';
        if (starCount >= 2) return 'Bad';
        return 'Worst';
    };

    const getFeedbackSummary = () => {
        const summary = {
            'Loved it': 0,
            'Good': 0,
            'Average': 0,
            'Bad': 0,
            'Worst': 0
        };

        reviews.forEach(review => {
            const label = getStarLabel(review.ReviewStarCount);
            summary[label]++;
        });

        return [
            { emoji: '😍', label: 'Loved it', count: summary['Loved it'] },
            { emoji: '😊', label: 'Good', count: summary['Good'] },
            { emoji: '😐', label: 'Average', count: summary['Average'] },
            { emoji: '😕', label: 'Bad', count: summary['Bad'] },
            { emoji: '😡', label: 'Worst', count: summary['Worst'] }
        ];
    };

    const getCategoryFeedback = (feedbackTypeId) => {
        const categoryReviews = reviews.filter(r => 
            r.Review_Type_id?.Review_type_id === feedbackTypeId
        );
        
        if (categoryReviews.length === 0) {
            return { emoji: '😐', label: 'No data' };
        }

        const avgStars = categoryReviews.reduce((sum, r) => sum + r.ReviewStarCount, 0) / categoryReviews.length;
        return {
            emoji: getStarEmoji(avgStars),
            label: getStarLabel(avgStars)
        };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    };

    const handleExport = () => {
        toast.info('Export functionality coming soon');
    };

    const feedbackSummary = getFeedbackSummary();

    return (
        <div className="p-4 md:p-6">
            <h2 style={{ fontFamily: 'Manrope' }} className="hidden md:block text-2xl md:text-[29px] font-semibold mb-4">
                Feedback Dashboard
            </h2>

            {/* Summary and Cards Grid */}
            <div style={{ fontFamily: 'Poppins' }} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
                {/* Left Side Summary */}
                <div
                    style={{
                        background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)',
                    }}
                    className="rounded-xl p-4 shadow-sm"
                >
                    <div className="flex justify-between font-medium mb-2">
                        <span>Overall Feedback</span>
                        <span>Peoples</span>
                    </div>
                    <div className="space-y-2">
                        {feedbackSummary.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span>{item.emoji}</span>
                                    <span>{item.label}</span>
                                </div>
                                <span className="font-semibold">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feedbackTypes.map((feedbackType) => {
                        const categoryData = getCategoryFeedback(feedbackType.feedback_type_id);
                        return (
                            <div
                                style={{
                                    background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)',
                                }}
                                key={feedbackType.feedback_type_id}
                                className="rounded-xl p-4 shadow-sm"
                            >
                                <p className="text-sm font-medium mb-1">{feedbackType.feedback_type}</p>
                                <div className="flex items-center gap-2 text-base md:text-lg font-semibold">
                                    <span>{categoryData.emoji}</span>
                                    <span>{categoryData.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="pt-4 md:pt-6 flex flex-col lg:flex-row lg:flex-wrap justify-between items-center mb-4 gap-4">
                <div className="flex md:flex-row items-center gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search Feedbacks"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="px-3 py-2 rounded-md border border-gray-300 text-sm placeholder-gray-500 bg-gradient-to-r from-[#f8f4f9] to-[#f4edf8] w-full md:w-auto"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm text-white rounded-md bg-gradient-to-r from-[#9c27b0] to-[#d32f2f] w-full md:w-auto disabled:opacity-50">
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                    <FaFilter className="text-lg text-gray-600 cursor-pointer" />
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md bg-gradient-to-r from-[#9c27b0] to-[#d32f2f] w-full md:w-auto">
                    <BiExport className="text-lg" />
                    Export
                </button>
            </div>

            {/* Mobile Card Layout (Visible on Mobile) */}
            <div className="lg:hidden space-y-4">
                {feedbacks.length > 0 ? (
                    feedbacks.map((feedback) => {
                        const relatedReview = reviews.find(r => r.for_Review_id === feedback.order_id?.Quick_Order_id);
                        return (
                            <div
                                key={feedback.feedback_id}
                                className="border border-[#B9B9B9] rounded-lg p-4 shadow-sm bg-white"
                                style={{ fontFamily: 'Poppins' }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold">
                                        {feedback.feedback_Type_id?.feedback_type || 'N/A'}
                                    </span>
                                    <FiEye 
                                        className="text-purple-600 cursor-pointer text-lg" 
                                        onClick={() => {
                                            setSelectedFeedback(feedback);
                                            setShowDetailModal(true);
                                        }}
                                    />
                                </div>
                                <div className="text-xs text-gray-700 space-y-1">
                                    <p><span className="font-medium">Date:</span> {formatDate(feedback.CreateAt)}</p>
                                    <p><span className="font-medium">Phone:</span> {feedback.order_id?.client_mobile_no || 'N/A'}</p>
                                    <p><span className="font-medium">Order:</span> #{feedback.order_id?.Quick_Order_id || 'N/A'}</p>
                                    {relatedReview && (
                                        <p>
                                            <span className="font-medium">Rating:</span> {getStarEmoji(relatedReview.ReviewStarCount)} {getStarLabel(relatedReview.ReviewStarCount)}
                                        </p>
                                    )}
                                    <p><span className="font-medium">Feedback:</span> {feedback.feedback}</p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {isLoading ? 'Loading...' : 'No feedback data available'}
                    </div>
                )}
            </div>

            {/* Desktop Table Layout (Visible on Desktop) */}
            <div className="hidden lg:block overflow-x-auto">
                <table style={{ fontFamily: 'Poppins' }} className="min-w-full border border-[#B9B9B9] text-sm text-left">
                    <thead>
                        <tr className="border-r border-[#B9B9B9] bg-[#F2E3F9] text-black">
                            <th className="px-4 py-3 border border-[#E0E0E0]">Date</th>
                            <th className="px-4 py-3 border border-[#E0E0E0]">Feedback Type</th>
                            <th className="px-4 py-3 border border-[#E0E0E0]">Phone</th>
                            <th className="px-4 py-3 border border-[#E0E0E0]">Order ID</th>
                            <th className="px-4 py-3 border border-[#E0E0E0]">Rating</th>
                            <th className="px-4 py-3 border border-[#E0E0E0]">Feedback</th>
                            <th className="px-4 py-3 border border-[#E0E0E0]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.length > 0 ? (
                            feedbacks.map((feedback) => {
                                const relatedReview = reviews.find(r => r.for_Review_id === feedback.order_id?.Quick_Order_id);
                                return (
                                    <tr key={feedback.feedback_id} className="text-black">
                                        <td className="px-4 py-3 border border-[#E0E0E0]">{formatDate(feedback.CreateAt)}</td>
                                        <td className="px-4 py-3 border border-[#E0E0E0]">
                                            {feedback.feedback_Type_id?.feedback_type || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0]">
                                            {feedback.order_id?.client_mobile_no || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0]">
                                            #{feedback.order_id?.Quick_Order_id || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0]">
                                            {relatedReview ? (
                                                <span>{getStarEmoji(relatedReview.ReviewStarCount)} {getStarLabel(relatedReview.ReviewStarCount)}</span>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0] text-gray-700 truncate max-w-[200px]">
                                            {feedback.feedback}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0] text-center">
                                            <FiEye 
                                                className="inline-block text-purple-600 cursor-pointer text-[18px]" 
                                                onClick={() => {
                                                    setSelectedFeedback(feedback);
                                                    setShowDetailModal(true);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                    {isLoading ? 'Loading...' : 'No feedback data available'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Feedback Detail Modal */}
            {showDetailModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-[90%] sm:max-w-md rounded-xl p-4 sm:p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => setShowDetailModal(false)} 
                            className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800">
                            ×
                        </button>
                        <h2 style={{ fontFamily: 'Manrope' }} className="text-xl sm:text-2xl font-semibold mb-4">
                            Feedback Details
                        </h2>
                        <div style={{ fontFamily: 'Poppins' }} className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Feedback Type</p>
                                <p className="text-base font-medium">
                                    {selectedFeedback.feedback_Type_id?.feedback_type || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order ID</p>
                                <p className="text-base font-medium">
                                    #{selectedFeedback.order_id?.Quick_Order_id || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Customer Phone</p>
                                <p className="text-base font-medium">
                                    {selectedFeedback.order_id?.client_mobile_no || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="text-base font-medium">
                                    {formatDate(selectedFeedback.CreateAt)}
                                </p>
                            </div>
                            {reviews.find(r => r.for_Review_id === selectedFeedback.order_id?.Quick_Order_id) && (
                                <div>
                                    <p className="text-sm text-gray-600">Rating</p>
                                    <p className="text-base font-medium">
                                        {getStarEmoji(reviews.find(r => r.for_Review_id === selectedFeedback.order_id?.Quick_Order_id).ReviewStarCount)} {' '}
                                        {getStarLabel(reviews.find(r => r.for_Review_id === selectedFeedback.order_id?.Quick_Order_id).ReviewStarCount)}
                                        {' '}({reviews.find(r => r.for_Review_id === selectedFeedback.order_id?.Quick_Order_id).ReviewStarCount}/5)
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-600">Feedback</p>
                                <p className="text-base font-medium">
                                    {selectedFeedback.feedback}
                                </p>
                            </div>
                            {reviews.find(r => r.for_Review_id === selectedFeedback.order_id?.Quick_Order_id)?.Review_type && (
                                <div>
                                    <p className="text-sm text-gray-600">Review</p>
                                    <p className="text-base font-medium">
                                        {reviews.find(r => r.for_Review_id === selectedFeedback.order_id?.Quick_Order_id).Review_type}
                                    </p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowDetailModal(false)}
                            style={{ background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)' }}
                            className="w-full mt-6 py-2 rounded-md text-white font-medium">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackDashboard;