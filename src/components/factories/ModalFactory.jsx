import React from 'react';
import ContactModal from '../modals/ContactModal';
import PaymentModal from '../modals/PaymentModal';
import SuccessModal from '../modals/SuccessModal';

export const ModalFactory = ({ type, isOpen, onClose, payload, openModal, navigate }) => {
  if (!isOpen) return null;

  switch (type) {
    case 'CONTACT':
      return <ContactModal isOpen={isOpen} onClose={onClose} onSuccess={() => openModal('CONTACT_SUCCESS')} />;
    case 'PAYMENT':
      return <PaymentModal isOpen={isOpen} onClose={onClose} price={payload?.price} onSuccess={() => openModal('PURCHASE_SUCCESS')} />;
    case 'CONTACT_SUCCESS':
      return <SuccessModal isOpen={isOpen} onClose={onClose} variant="contact" />;
    case 'PURCHASE_SUCCESS':
      return <SuccessModal isOpen={isOpen} onClose={onClose} variant="purchase" onNext={() => navigate('/register')} />;
    default:
      return null;
  }
};
