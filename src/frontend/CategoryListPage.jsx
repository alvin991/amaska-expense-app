import React from 'react';

const CategoryListPage = ({ onNavigate }) => {
  return (
    <div>
      <h2>Category List Page</h2>
      <p>Category list content here</p>
      <button onClick={() => onNavigate('categoryDetails')}>
        Go to Category Details
      </button>
    </div>
  );
};

export default CategoryListPage;