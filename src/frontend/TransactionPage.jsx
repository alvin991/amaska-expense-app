import React from 'react';

const TransactionPage = ({ onNavigate }) => {
  return (
    <div>
      <h2>Transaction Page</h2>
      <p>Transaction form content here</p>
      <button onClick={() => onNavigate('categoryList')}>
        Go to Category List
      </button>
    </div>
  );
};

export default TransactionPage;