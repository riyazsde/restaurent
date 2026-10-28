import React from 'react';
import { Check } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, variant = 'contact', onNext }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');`}
      </style>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {variant === 'contact' ? (
        <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl p-12 md:p-16 z-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-40 h-40 rounded-full bg-[#E8F8EE] flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-success flex items-center justify-center shadow-lg">
                <Check className="w-16 h-16 text-white" strokeWidth={4} />
              </div>
            </div>
            <div className="absolute top-2 right-4 text-success font-bold text-xl">+</div>
            <div className="absolute top-0 left-16 w-3 h-3 rounded-full bg-success"></div>
            <div className="absolute bottom-6 left-2 w-2.5 h-2.5 rounded-full border-2 border-success"></div>
            <div className="absolute top-12 -left-2 text-success text-sm">✓</div>
          </div>

          <h2 className="text-4xl font-bold text-success mb-4">Good Job !</h2>
          <p className="text-gray-800 text-lg font-medium mb-12 max-w-md leading-relaxed">
            Our Team will Contact you and Assist you for the Queries or The Onboarding Process
          </p>

          <button 
            onClick={onClose}
            className="bg-success text-white px-12 py-3.5 rounded-[12px] font-semibold text-lg hover:opacity-90 transition-colors"
          >
            Back to Website
          </button>
        </div>
      ) : (
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 md:p-14 z-10 flex flex-col items-center text-center">
          <div className="mb-10">
            <div className="w-24 h-24 rounded-full bg-success flex items-center justify-center shadow-sm">
              <Check className="w-12 h-12 text-white" strokeWidth={5} />
            </div>
          </div>

          <h2 
            className="text-[39px] font-semibold text-dark mb-12 px-4 leading-none text-center tracking-normal"
            style={{ fontFamily: "'Poppins', sans-serif", textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
          >
            You Successfully Purchased Your Subscription.
          </h2>

          <button 
            onClick={() => {
              onClose();
              if (onNext) onNext();
            }}
            className="w-full bg-gradient-to-b from-brand-primary to-brand-secondary text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SuccessModal;
