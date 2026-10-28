import { useQuery, useMutation } from '@tanstack/react-query';
import feedbackService from '../../services/feedbackService';
import reviewService from '../../services/reviewService';

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

export const useFeedbackSummary = (filters = {}) => {
    return useQuery({
        queryKey: ['feedbackSummary', filters],
        queryFn: async () => {
            const [feedbackTypesRes, reviewsRes] = await Promise.all([
                feedbackService.getAllFeedbackTypes(1, 100),
                reviewService.getAllReviews(1, 100)
            ]);

            const reviews = reviewsRes?.data?.reviews || [];
            const feedbackTypes = feedbackTypesRes?.data?.feedback_types || [];

            // 1. Calculate overall counts
            const summaryMap = { 'Loved it': 0, 'Good': 0, 'Average': 0, 'Bad': 0, 'Worst': 0 };
            reviews.forEach(review => {
                const label = getStarLabel(review.ReviewStarCount);
                if (summaryMap[label] !== undefined) summaryMap[label]++;
            });

            const overallCounts = [
                { label: 'Loved it', emoji: '😍', count: summaryMap['Loved it'] },
                { label: 'Good', emoji: '😊', count: summaryMap['Good'] },
                { label: 'Average', emoji: '😐', count: summaryMap['Average'] },
                { label: 'Bad', emoji: '😕', count: summaryMap['Bad'] },
                { label: 'Worst', emoji: '😡', count: summaryMap['Worst'] }
            ];

            // 2. Calculate category metrics
            const metrics = feedbackTypes.map(ft => {
                const categoryReviews = reviews.filter(r => r.Review_Type_id?.Review_type_id === ft.feedback_type_id);
                if (categoryReviews.length === 0) {
                    return { title: ft.feedback_type, emoji: '😐', label: 'No data' };
                }
                const avgStars = categoryReviews.reduce((sum, r) => sum + r.ReviewStarCount, 0) / categoryReviews.length;
                return {
                    title: ft.feedback_type,
                    emoji: getStarEmoji(avgStars),
                    label: getStarLabel(avgStars)
                };
            });

            return { overallCounts, metrics };
        },
        keepPreviousData: true,
    });
};

export const useFeedbacks = (params = { page: 1, limit: 10 }) => {
    return useQuery({
        queryKey: ['feedbacks', params],
        queryFn: () => feedbackService.getAllFeedbacks(params),
        keepPreviousData: true,
    });
};

export const useFeedbackTypes = (page = 1, limit = 100) => {
    return useQuery({
        queryKey: ['feedbackTypes', page, limit],
        queryFn: async () => {
            const res = await feedbackService.getAllFeedbackTypes(page, limit);
            return res?.data?.feedback_types || res?.data || [];
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useReviews = (page = 1, limit = 100) => {
    return useQuery({
        queryKey: ['reviews', page, limit],
        queryFn: async () => {
            const res = await reviewService.getAllReviews(page, limit);
            return res?.data?.reviews || res?.data || [];
        },
        staleTime: 60 * 1000,
    });
};

export const useGetFeedbackByIdMutation = () => {
    return useMutation({
        mutationFn: async (id) => {
            const res = await feedbackService.getFeedbackById(id);
            return res?.data || res;
        }
    });
};
