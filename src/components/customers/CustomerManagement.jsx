import React from 'react';
import CustomerList from './CustomerList';
import ReceivedPaymentList from './ReceivedPaymentList';

const CustomerManagement = () => {
  return (
    <div className="space-y-6">
      <ReceivedPaymentList />
      <CustomerList />
    </div>
  );
};

export default CustomerManagement;
