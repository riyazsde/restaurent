import { useQuery, useMutation } from '@tanstack/react-query';
import feedbackService from '../../services/feedbackService';

// ---------------------------------------------------------------------------
// Label ↔ emoji mapping (matches Figma)
// ---------------------------------------------------------------------------
const LABEL_TO_EMOJI = {
    'Loved it': '😍',
    'Good':     '😊',
    'Average':  '😐',
    'Bad':      '😕',
    'Worst':    '😡',
};
const LABEL_ORDER = ['Loved it', 'Good', 'Average', 'Bad', 'Worst'];

const emojiFor = (label) => LABEL_TO_EMOJI[label] ?? '😐';

// ---------------------------------------------------------------------------
// Fetch every page of /master/feedback/getall
// ---------------------------------------------------------------------------
async function fetchAllFeedbacks(params = {}) {
    const perPage = 100;
    let page = 1;
    let all = [];
    let totalPages = 1;

    do {
        const res = await feedbackService.getAllFeedbacks({
            ...params,
            page,
            limit: perPage,
        });
        const payload = res?.data ?? {};
        const list = payload.feedbacks ?? [];
        all = all.concat(list);
        totalPages = payload?.pagination?.total_pages ?? 1;
        page += 1;
    } while (page <= totalPages);

    return all;
}

// ---------------------------------------------------------------------------
// Aggregate `ratings` into overall counts + per-category dominant
// ---------------------------------------------------------------------------
const CATEGORIES = [
    { key: 'overall_feedback', title: 'Overall Feedback' },
    { key: 'food_quality',     title: 'Food Quality' },
    { key: 'ambiance',         title: 'Ambiance' },
    { key: 'staff_behavior',   title: 'Staff Behavior' },
    { key: 'services',         title: 'Services' },
    { key: 'would_recommend',  title: 'Would You Recommend?' },
];

function aggregate(records) {
    // overall_feedback counts → left-hand list
    const overallMap = { 'Loved it': 0, 'Good': 0, 'Average': 0, 'Bad': 0, 'Worst': 0 };
    records.forEach((r) => {
        const label = r?.ratings?.overall_feedback;
        if (label && overallMap[label] !== undefined) overallMap[label] += 1;
    });

    const overallCounts = LABEL_ORDER.map((label) => ({
        label,
        emoji: emojiFor(label),
        count: overallMap[label],
    }));

    // Per-category dominant label → 6 metric cards
    const metrics = CATEGORIES.map(({ key, title }) => {
        const counts = { 'Loved it': 0, 'Good': 0, 'Average': 0, 'Bad': 0, 'Worst': 0 };
        records.forEach((r) => {
            const label = r?.ratings?.[key];
            if (label && counts[label] !== undefined) counts[label] += 1;
        });

        const total = Object.values(counts).reduce((s, n) => s + n, 0);
        if (total === 0) {
            return { title, emoji: '😐', label: 'No data' };
        }

        // Pick the label with the highest count (ties → order in LABEL_ORDER)
        const dominant = LABEL_ORDER.reduce(
            (best, label) => (counts[label] > counts[best] ? label : best),
            LABEL_ORDER[0]
        );

        return { title, emoji: emojiFor(dominant), label: dominant };
    });

    return { overallCounts, metrics };
}

// ---------------------------------------------------------------------------
// Summary hook
// ---------------------------------------------------------------------------
export const useFeedbackSummary = (filters = {}) => {
    return useQuery({
        queryKey: ['feedbackSummary', filters],
        queryFn: async () => {
            const records = await fetchAllFeedbacks(filters);
            return aggregate(records);
        },
        keepPreviousData: true,
        staleTime: 60_000,
    });
};

// ---------------------------------------------------------------------------
// Other hooks (unchanged)
// ---------------------------------------------------------------------------
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

export const useGetFeedbackByIdMutation = () => {
    return useMutation({
        mutationFn: async (id) => {
            const res = await feedbackService.getFeedbackById(id);
            return res?.data || res;
        },
    });
};