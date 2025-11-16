import React from 'react';

const CategoryDetailsPage = ({ onNavigate }) => {
  return (
    <div>
      <h2>Category Details Page</h2>
      <p>Category details content here</p>
      <button onClick={() => onNavigate('transaction')}>
        Back to Transaction
      </button>
    </div>
  );
};

export default CategoryDetailsPage;