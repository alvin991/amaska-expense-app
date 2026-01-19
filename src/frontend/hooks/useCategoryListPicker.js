import { useCallback, useEffect } from 'react';

/**
 * Unified hook for category picker navigation and form data update.
 * @param {object} navigation - Navigation object for navigating to category list page.
 * @param {object} currentParams - Params object, should contain selectedCategoryId if a category is selected.
 * @param {function} setFormData - React setState function for form data.
 * @param {string} [categoryKeyName='category_id'] - Optional key name for the category field in form data.
 */
export default function useCategoryPicker(
  navigation,
  currentParams,
  formData,
  setFormData,
  categoryKeyName = 'category_id',
  setFormDataDraft
) {
  // Open category list page
  const openCategoryList = useCallback(
    (event) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      if (setFormDataDraft) {
        setFormDataDraft(formData);
      }
      navigation.navigate('categoryList');
    },
    [navigation, setFormDataDraft, formData]
  );

  // Update form data when category is selected
  useEffect(() => {
    const selectedCategoryId = currentParams?.selectedCategoryId;
    // if (selectedCategoryId) {
    //   setFormData((prev) => ({
    //     ...prev,
    //     [categoryKeyName]: selectedCategoryId
    //   }));
    // }
    if (selectedCategoryId && setFormDataDraft) {
      setFormDataDraft((prev) => ({
        ...prev,
        [categoryKeyName]: selectedCategoryId
      }));
    }
  }, [currentParams?.selectedCategoryId, setFormData, categoryKeyName]);

  return { openCategoryList };
}