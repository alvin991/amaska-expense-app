import { useCallback } from 'react';

function useCategoryListPicker(navigation) {
  const openCategoryList = useCallback(
    (event) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      // Simply navigate to categoryList - the selected category will come back via navigation params
      navigation.navigate('categoryList');
    },
    [navigation]
  );

  return { openCategoryList };
}

export default useCategoryListPicker;