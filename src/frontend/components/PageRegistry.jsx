import { PAGE_TYPES, createPageConfig } from '../types/PageConfig';
import TransactionPage from './TransactionPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage from './CategoryDetailsPage';

/**
 * Registry of all available pages in the modal
 */
class PageRegistry {
  constructor() {
    this.pages = new Map();
  }

  register(pageConfig) {
    this.pages.set(pageConfig.type, pageConfig);
  }

  getPage(pageType) {
    return this.pages.get(pageType);
  }

  getAllPages() {
    return Array.from(this.pages.values());
  }
}

// Initialize and register pages
const pageRegistry = new PageRegistry();

pageRegistry.register(
  createPageConfig(
    PAGE_TYPES.TRANSACTION,
    TransactionPage,
    'Transaction'
  )
);

pageRegistry.register(
  createPageConfig(
    PAGE_TYPES.CATEGORY_LIST,
    CategoryListPage,
    'Select Category'
  )
);

pageRegistry.register(
  createPageConfig(
    PAGE_TYPES.CATEGORY_DETAILS,
    CategoryDetailsPage,
    'Category Details'
  )
);

export default pageRegistry;