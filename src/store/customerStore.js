import { create } from 'zustand';

const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  searchQuery: '',

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Set customers
  setCustomers: (customers) => set({ customers, error: null }),

  // Set selected customer
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  // Add customer
  addCustomer: (customer) => set((state) => ({
    customers: [customer, ...state.customers]
  })),

  // Update customer
  updateCustomer: (updatedCustomer) => set((state) => ({
    customers: state.customers.map((customer) =>
      customer.Customer_id === updatedCustomer.Customer_id
        ? updatedCustomer
        : customer
    ),
    selectedCustomer: state.selectedCustomer?.Customer_id === updatedCustomer.Customer_id
      ? updatedCustomer
      : state.selectedCustomer
  })),

  // Delete customer
  deleteCustomer: (customerId) => set((state) => ({
    customers: state.customers.filter((customer) => customer.Customer_id !== customerId),
    selectedCustomer: state.selectedCustomer?.Customer_id === customerId
      ? null
      : state.selectedCustomer
  })),

  // Set search query
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Get filtered customers
  getFilteredCustomers: () => {
    const { customers, searchQuery } = get();
    if (!searchQuery) return customers;

    const query = searchQuery.toLowerCase();
    return customers.filter((customer) =>
      customer.Name?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.CustomerType?.type?.toLowerCase().includes(query)
    );
  },

  // Clear all
  clearAll: () => set({
    customers: [],
    selectedCustomer: null,
    isLoading: false,
    error: null,
    searchQuery: ''
  })
}));

export default useCustomerStore;
