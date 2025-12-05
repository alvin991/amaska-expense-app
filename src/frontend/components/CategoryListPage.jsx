import { useRef } from 'react';
import { Button } from 'react-bootstrap';
import './CategoryListPage.css';
import { DEFAULT_CATEGORY } from './CategoryDetailsPage';

const CategoryListPage = ({
  categories,
  categoriesUsed,
  transaction,
  updateCategoryId,
  setTransaction,
  navigation, // { navigate, back, resetToRoot, currentPage, canGoBack }
}) => {
  const clickTimer = useRef(null);

  const usedCategories = categories.filter(el => categoriesUsed.has(el.id));
  const otherCategories = categories.filter(el => !categoriesUsed.has(el.id));

  const handleCategoryClick = (categoryId) => {
    // Delay single click to see if double click happens
    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      if (clickTimer.current) {
        updateCategoryId(categoryId);
        navigation.back(); // or navigation.navigate('transaction')
        clickTimer.current = null;
      }
    }, 250); // 250ms is a common double-click threshold
  };

  const handleCategoryDoubleClick = (categoryId) => {
    // Cancel single click timer
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    // Navigate to category details
    const category = categories.find(cat => cat.id === categoryId);
    navigation.navigate('categoryDetails', { category });
  };

  const handleCreateCategory = () => {
    navigation.navigate('categoryDetails', { category: DEFAULT_CATEGORY });
  };

  return (
    <div className="category-list-page">
      {/* <h2>Category List Page</h2>

      {navigation.canGoBack && (
        <Button
          variant="secondary"
          className="mb-3"
          onClick={navigation.back}
        >
          Back
        </Button>
      )} */}

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

      <Button
        variant="success"
        className="mt-3 w-100"
        size="lg"
        onClick={handleCreateCategory}
      >
        New Category
      </Button>
    </div>
  );
};

export default CategoryListPage;