/**
 * Manages modal navigation and shared state
 */
class ModalStateManager {
  constructor(initialPage, initialTransaction) {
    this.currentPage = initialPage;
    this.transaction = initialTransaction || {};
    this.observers = [];
  }

  setCurrentPage(page) {
    this.currentPage = page;
    this.notifyObservers();
  }

  setTransaction(transaction) {
    this.transaction = { ...this.transaction, ...transaction };
    this.notifyObservers();
  }

  updateCategory(categoryId) {
    this.setTransaction({ category: categoryId });
  }

  navigateTo(page) {
    this.setCurrentPage(page);
  }

  subscribe(observer) {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  notifyObservers() {
    this.observers.forEach(observer => observer(this.getState()));
  }

  getState() {
    return {
      currentPage: this.currentPage,
      transaction: this.transaction,
    };
  }

  reset(initialPage, initialTransaction) {
    this.currentPage = initialPage;
    this.transaction = initialTransaction || {};
    this.notifyObservers();
  }
}

export default ModalStateManager;