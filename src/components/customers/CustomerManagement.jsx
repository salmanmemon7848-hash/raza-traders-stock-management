import React from 'react';
import PageHeader from '../common/PageHeader';
import CustomerList from './CustomerList';
import ReceivedPaymentList from './ReceivedPaymentList';

const CustomerManagement = () => (
  <div className="page-shell">
    <PageHeader
      title="Customers"
      subtitle="Track customers, dues, and payments received."
    />
    <ReceivedPaymentList />
    <CustomerList />
  </div>
);

export default CustomerManagement;
