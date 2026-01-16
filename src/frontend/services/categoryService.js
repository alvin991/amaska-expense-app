import axios from 'axios';

export async function saveCategory(category) {
  const payload = {
    name: category.name,
    description: category.description ?? category.notes,
    color: category.color,
    icon: category.icon,
  };

  if (category.id) {
    await axios.put(`/api/categories/${category.id}`, payload);
  } else {
    await axios.post('/api/categories', payload);
  }
}

export async function deleteCategoryById(id) {
  await axios.delete(`/api/categories/${id}`);
}

export async function fetchCategories() {
  const response = await axios.get('/api/categories');
  return response.data;
};