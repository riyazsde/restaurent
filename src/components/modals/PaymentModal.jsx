import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { useCreatePublicSubscriptionPayment } from '../../hooks/queries/usePlan';

const PaymentModal = ({ isOpen, onClose, onSuccess, price, planId }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [zipCode, setZipCode] = useState('');

  const paymentMutation = useCreatePublicSubscriptionPayment();
  const loading = paymentMutation.isPending;

  if (!isOpen) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv) {
      toast.error('Please enter valid payment details.');
      return;
    }

    try {
      const payload = {
        amount: price,
        plan_id: planId || 1,
        cardNumber: cardNumber.replace(/\s+/g, ''),
        expiry,
        cvv,
        cardHolder,
        zipCode
      };
      await paymentMutation.mutateAsync(payload);
      toast.success('Payment completed successfully!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg p-8 z-10 flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-black transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-4 text-dark">Payment Method</h2>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Credit or Debit Card</h3>
        
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Card number</label>
            <input 
              type="text" 
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456" 
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-accent" 
            />
            <div className="flex gap-2 mt-2">
              <div className="w-8 h-5 bg-blue-800 rounded flex items-center justify-center text-[8px] text-white font-bold italic">VISA</div>
              <div className="w-8 h-5 bg-orange-500 rounded flex items-center justify-center text-[8px] text-white font-bold relative overflow-hidden"><div className="absolute w-3 h-3 bg-red-500 rounded-full -left-0.5 opacity-90"></div><div className="absolute w-3 h-3 bg-yellow-400 rounded-full -right-0.5 opacity-90"></div></div>
              <div className="w-8 h-5 bg-blue-400 rounded flex items-center justify-center text-[8px] text-white font-bold">AMEX</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Expiry date</label>
              <input 
                type="text" 
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY" 
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-accent" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Security code</label>
              <input 
                type="password" 
                required
                maxLength="4"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="CVV" 
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-accent" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name on card</label>
            <input 
              type="text" 
              required
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Full Name" 
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-accent" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Zip code</label>
            <input 
              type="text" 
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="e.g. 10001" 
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-accent" 
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-b from-brand-primary to-brand-secondary text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay {price || '$49.00'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
