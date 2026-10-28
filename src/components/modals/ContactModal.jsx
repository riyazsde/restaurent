import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { useTalkToExpert } from '../../hooks/queries/useStore';

const ContactModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: ''
  });

  const talkToExpertMutation = useTalkToExpert();
  const loading = talkToExpertMutation.isPending;

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) {
      toast.error('Please fill in your name and email.');
      return;
    }

    try {
      await talkToExpertMutation.mutateAsync({
        Name: formData.name.trim(),
        Business_Name: formData.business_name?.trim() || '',
        Email: formData.email.trim(),
        PhoneNo: formData.phone?.trim() || ''
      });
      toast.success('Your request has been submitted! A specialist will contact you soon.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-4xl p-8 md:p-12 z-10 flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-black transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-3">Talk to POS Specialist</h2>
          <p className="text-gray-600 font-medium">We are here for you! How can we help?</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <form onSubmit={handleSubmit} className="w-full md:w-1/2 space-y-4 text-left">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label>
              <input 
                type="text" 
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Restaurant / Business name"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@business.com"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-primary" 
              />
            </div>
            <div className="pt-4 flex justify-center">
              <button 
                type="submit"
                disabled={loading}
                className="bg-gradient-to-b from-brand-primary to-brand-secondary text-white px-12 py-3.5 rounded-[12px] text-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Contact Specialist</span>
                )}
              </button>
            </div>
          </form>
          
          <div className="w-full md:w-1/2">
            <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 h-[300px]">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 right-4 bg-white p-4 rounded-lg shadow-md flex items-start justify-between">
                <div className="text-left">
                  <div className="text-brand-secondary font-bold text-sm mb-1">We are Here !</div>
                  <div className="font-bold text-sm text-black">Main Street, London</div>
                  <div className="text-xs text-gray-500 leading-tight mt-1">Riverside Building, County Hall,<br/>London SE1 7PB</div>
                </div>
                <div className="text-blue-500 flex flex-col items-center justify-center">
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                  <span className="text-[10px] font-bold">Directions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
