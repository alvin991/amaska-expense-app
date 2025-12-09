import { useRef } from 'react';
import { Button } from 'react-bootstrap';
import './CategoryListPage.css';
import { DEFAULT_CATEGORY } from '../constants/defaults';   // <-- shared import
import {
  iconsFromDb,
  categoryToIconKey,
  getColorForIconKey,
} from '../iconRegistry';
import IconElement from "./IconElement";

const iconSize = 18;
const circleSize = iconSize + 12; // similar padding to IconElement

const CategoryListPage = ({
  categories,
  categoriesUsed,
  transaction,
  navigation, // { navigate, back, resetToRoot, currentPage, canGoBack }
  onCategorySelected,   // NEW
}) => {
  const clickTimer = useRef(null);

  const usedCategories = categories.filter(el => categoriesUsed.has(el.id));
  const otherCategories = categories.filter(el => !categoriesUsed.has(el.id));

  const handleCategoryClick = (categoryId) => {
    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      if (clickTimer.current) {
        onCategorySelected?.(categoryId);
        navigation.back();
        clickTimer.current = null;
      }
    }, 250);
  };

  const handleCategoryDoubleClick = (categoryId) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    const category = categories.find(cat => cat.id === categoryId);
    navigation.navigate('categoryDetails', { category });
  };

  const handleCreateCategory = () => {
    navigation.navigate('categoryDetails', { category: DEFAULT_CATEGORY });
  };

  return (
    <div className="category-list-page">
      <div className="lists-container">
        <div className="list-section">
          <h3>Used Categories</h3>
          <div className="scrollable-list">
            {usedCategories.map((category) => {
              const iconKey = categoryToIconKey(category.name);
              const iconInfo = iconsFromDb.find(ic => ic.id === iconKey);
              const bgColor = getColorForIconKey(iconKey);

              return (
                <div
                  key={category.id}
                  className="list-item"
                  onClick={() => handleCategoryClick(category.id)}
                  onDoubleClick={() => handleCategoryDoubleClick(category.id)}
                >
                  {transaction?.category_id === category.id ? (
                    <span className="list-item-tick">✓</span>
                  ) : (
                    <span className="list-item-tick" aria-hidden="true"></span>
                  )}

                  <div className="list-item-icon">
                    <IconElement
                      key={iconKey}
                      iconKey={iconKey}
                      label={iconInfo.label}
                      size={iconSize}
                      color={bgColor}
                      showLabel={false}
                    />
                  </div>

                  <span className="list-item-label">{category.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="list-section">
          <h3>Other Categories</h3>
          <div className="scrollable-list">
            {otherCategories.map((category) => {
              const iconKey = categoryToIconKey(category.name);
              const iconInfo = iconsFromDb.find(ic => ic.id === iconKey);
              const bgColor = getColorForIconKey(iconKey);

              return (
                <div
                  key={category.id}
                  className="list-item"
                  onClick={() => handleCategoryClick(category.id)}
                  onDoubleClick={() => handleCategoryDoubleClick(category.id)}
                >
                  <span className="list-item-tick" aria-hidden="true"></span>

                  <div className="list-item-icon">
                    <IconElement
                      key={iconKey}
                      iconKey={iconKey}
                      label={iconInfo.label}
                      size={iconSize}
                      color={bgColor}
                      showLabel={false}
                    />
                  </div>

                  <span className="list-item-label">{category.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Button
        variant="success"
        className="w-100"
        size="md"
        onClick={handleCreateCategory}
      >
        New Category
      </Button>
    </div>
  );
};

export default CategoryListPage;