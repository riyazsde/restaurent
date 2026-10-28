import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTicketTypes, useCreateTicket } from '../../hooks/queries/useSupport';
import { useCustomers } from '../../hooks/queries/useCustomers';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { data: ticketTypes = [] } = useTicketTypes();
  const { data: customers = [] } = useCustomers();
  const createTicketMutation = useCreateTicket();
  const isLoading = createTicketMutation.isPending;
  
  const [formData, setFormData] = useState({
    support_ticket_type_id: '',
    question: '',
    customer_id: '',
    Ticket_status: 'Pending',
    Status: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.support_ticket_type_id) {
      toast.error('Please select a ticket type');
      return;
    }
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    if (!formData.question.trim()) {
      toast.error('Please enter your question or issue');
      return;
    }

    try {
      const ticketData = {
        ...formData,
        support_ticket_type_id: parseInt(formData.support_ticket_type_id),
        customer_id: parseInt(formData.customer_id)
      };

      const response = await createTicketMutation.mutateAsync(ticketData);
      if (response && response.success !== false) {
        toast.success('Support ticket created successfully!');
        navigate('/support/tickets');
      } else {
        toast.error(response?.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create support ticket');
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span 
          className="text-[#00000099] font-bold text-[32px] cursor-pointer"
          onClick={() => navigate('/support')}
        >
          Support &gt;
        </span>
        <span className="text-black font-bold text-[32px]">Create Ticket</span>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticket Type */}
          <div>
            <label className="block font-semibold mb-2 text-base">
              Ticket Type <span className="text-red-500">*</span>
            </label>
            <select
              name="support_ticket_type_id"
              value={formData.support_ticket_type_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-purple-500"
              required
            >
              <option value="">Select Ticket Type</option>
              {ticketTypes.map(type => (
                <option key={type.support_ticket_type_id} value={type.support_ticket_type_id}>
                  {type.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer */}
          <div>
            <label className="block font-semibold mb-2 text-base">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-purple-500"
              required
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.Customer_id} value={customer.Customer_id}>
                  {customer.Name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Question/Issue */}
          <div>
            <label className="block font-semibold mb-2 text-base">
              Describe Your Issue <span className="text-red-500">*</span>
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[150px] text-black placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Please describe your issue in detail..."
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold mb-2 text-base">
              Initial Status
            </label>
            <select
              name="Ticket_status"
              value={formData.Ticket_status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-purple-500"
            >
              <option value="Pending">Pending</option>
              <option value="Open">Open</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Ticket'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="flex-1 py-3 rounded-lg font-semibold text-gray-700 text-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
