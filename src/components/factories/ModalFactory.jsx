import React from 'react';
import ContactModal from '../modals/ContactModal';
import StripeSubscriptionCheckoutModal from '../modals/StripeSubscriptionCheckoutModal';
import SuccessModal from '../modals/SuccessModal';

export const ModalFactory = ({ type, isOpen, onClose, payload, openModal, navigate }) => {
  if (!isOpen) return null;

  switch (type) {
    case 'CONTACT':
      return <ContactModal isOpen={isOpen} onClose={onClose} onSuccess={() => openModal('CONTACT_SUCCESS')} />;
    case 'PAYMENT':
      return (
        <StripeSubscriptionCheckoutModal
          isOpen={isOpen}
          onClose={onClose}
          planId={payload?.planId}
          planName={payload?.planName}
        />
      );
    case 'CONTACT_SUCCESS':
      return <SuccessModal isOpen={isOpen} onClose={onClose} variant="contact" />;
    case 'PURCHASE_SUCCESS':
      return <SuccessModal isOpen={isOpen} onClose={onClose} variant="purchase" onNext={() => navigate('/register')} />;
    default:
      return null;
  }
};
