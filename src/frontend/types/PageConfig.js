/**
 * Page configuration types
 */
export const PAGE_TYPES = {
  TRANSACTION: 'transaction',
  CATEGORY_LIST: 'categoryList',
  CATEGORY_DETAILS: 'categoryDetails',
};

export const createPageConfig = (type, component, title) => ({
  type,
  component,
  title,
});