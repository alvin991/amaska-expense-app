import './CategoryListPage.css';

const CategoryListPage = ({ 
  categories, 
  categoriesUsed, 
  transaction,
  updateCategoryId,
  onNavigate 
}) => {
  const usedCategories = categories.filter(el => categoriesUsed.has(el.value));
  const otherCategories = categories.filter(el => !categoriesUsed.has(el.value));

  const handleCategoryClick = (categoryId) => {
    updateCategoryId(categoryId);
    onNavigate('transaction');
  };

  return (
    <div className="category-list-page">
      <h2>Category List Page</h2>
      
      <div className="lists-container">
        <div className="list-section">
          <h3>Used Categories</h3>
          <div className="scrollable-list">
            {usedCategories.map((category) => (
              <div 
                key={category.value} 
                className="list-item"
                onClick={() => handleCategoryClick(category.value)}
              >
                <span>{category.label}</span>
                {transaction?.category_id === category.value && (
                  <span className="tick-icon">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="list-section">
          <h3>Other Categories</h3>
          <div className="scrollable-list">
            {otherCategories.map((category) => (
              <div 
                key={category.value} 
                className="list-item"
                onClick={() => handleCategoryClick(category.value)}
              >
                <span>{category.label}</span>
                {transaction?.category_id === category.value && (
                  <span className="tick-icon">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListPage;