import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  searchQuery: '',
  searchPlaceholder: 'Search...',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchPlaceholder: (placeholder) => set({ searchPlaceholder: placeholder }),
  clearSearch: () => set({ searchQuery: '' })
}));

export default useSearchStore;
