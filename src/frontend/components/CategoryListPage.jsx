import { useRef } from 'react';
import './CategoryListPage.css';

const CategoryListPage = ({
  categories,
  categoriesUsed,
  transaction,
  updateCategoryId,
  onNavigate
}) => {
  const clickTimer = useRef(null);

  const usedCategories = categories.filter(el => categoriesUsed.has(el.id));
  const otherCategories = categories.filter(el => !categoriesUsed.has(el.id));

  const handleCategoryClick = (categoryId) => {
    console.log(`Category clicked: ${clickTimer.current}`);
    // Delay single click to see if double click happens
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      if (clickTimer.current)
        console.log(`20`);
        updateCategoryId(categoryId);
        onNavigate('transaction');
        clickTimer.current = null;

    }, 250); // 250ms is a common double-click threshold
  };

  const handleCategoryDoubleClick = (categoryId) => {
    console.log(`Category double-clicked: ${clickTimer.current}`);
    // Cancel single click timer
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    // Your double-click logic here
    console.log(`redirect request to category details for id: ${categoryId}`);
    onNavigate('categoryDetails');
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
                key={category.id}
                className="list-item"
                onClick={() => handleCategoryClick(category.id)}
                onDoubleClick={() => handleCategoryDoubleClick(category.id)}
              >
                <span>{category.name}</span>
                {transaction?.category_id === category.id && (
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
                key={category.id}
                className="list-item"
                onClick={() => handleCategoryClick(category.id)}
                onDoubleClick={() => handleCategoryDoubleClick(category.id)}
              >
                <span>{category.name}</span>
                {transaction?.category_id === category.id && (
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