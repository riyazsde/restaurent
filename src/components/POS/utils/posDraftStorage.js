const POS_DRAFT_STORAGE_KEY = 'pos_draft';

export const loadPosDraft = () => {
    try {
        const storedDraft = sessionStorage.getItem(POS_DRAFT_STORAGE_KEY);
        if (!storedDraft) return {};

        const draft = JSON.parse(storedDraft);
        if (!draft || typeof draft !== 'object' || Array.isArray(draft)) {
            throw new Error('Stored POS draft is invalid');
        }

        return {
            cartItems: Array.isArray(draft.cartItems) ? draft.cartItems : [],
            selectedDining: draft.selectedDining ?? null,
            diningOption: draft.diningOption ?? null,
            selectedTable: draft.selectedTable ?? null,
            selectedFloor: draft.selectedFloor ?? null,
            selectedSlot: draft.selectedSlot ?? null,
        };
    } catch (error) {
        console.error('Failed to restore POS draft:', error);
        return {};
    }
};

export const savePosDraft = (draft) => {
    try {
        sessionStorage.setItem(POS_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
        console.error('Failed to save POS draft:', error);
    }
};

export const clearPosDraft = () => {
    try {
        sessionStorage.removeItem(POS_DRAFT_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear POS draft:', error);
    }
};
