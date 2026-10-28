import api from '../api/api';

class RecipeService {
  // Get all recipes for auth user
  async getRecipes() {
    try {
      const response = await api.get('/admin/recipe/getbyauth');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get recipe statistics
  async getStatistics() {
    try {
      const response = await api.get('/admin/recipe/statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single recipe by id
  async getRecipeById(id) {
    try {
      const response = await api.get(`/admin/recipe/get/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search recipes
  async searchRecipes(query) {
    try {
      const response = await api.get(`/admin/recipe/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create recipe
  async createRecipe(recipeData) {
    try {
      const response = await api.post('/admin/recipe/create', recipeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update recipe
  async updateRecipe(recipeData) {
    try {
      const rawId = recipeData?.id ?? recipeData?.recipe_id ?? recipeData?.Recipe_id ?? recipeData?._id;
      const numericId = !isNaN(Number(rawId)) && rawId !== null && rawId !== '' ? Number(rawId) : rawId;

      const payload = {
        ...recipeData,
        id: numericId,
        recipe_id: numericId
      };

      // First attempt PUT per Postman collection
      const response = await api.put('/admin/recipe/update', payload);
      return response.data;
    } catch (error) {
      try {
        const rawId = recipeData?.id ?? recipeData?.recipe_id ?? recipeData?.Recipe_id ?? recipeData?._id;
        const numericId = !isNaN(Number(rawId)) && rawId !== null && rawId !== '' ? Number(rawId) : rawId;
        const payload = {
          ...recipeData,
          id: numericId,
          recipe_id: numericId
        };
        const fallback = await api.post('/admin/recipe/update', payload);
        return fallback.data;
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  // Delete recipe
  async deleteRecipe(id) {
    try {
      const recipeId = typeof id === 'object' && id !== null ? (id.recipe_id ?? id.id ?? id._id) : id;
      const response = await api.delete(`/admin/recipe/delete/${recipeId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
}

export default new RecipeService();
