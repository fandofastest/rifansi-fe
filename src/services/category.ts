import { graphQLClient } from '@/lib/graphql';

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;

}

export interface CategoryWithSubcategories {
  id: string;
  code: string;
  name: string;
  description?: string;
  subCategories: {
    id: string;
    name: string;
    description?: string;
  }[];
}

interface GetCategoriesResponse {
  categories: Category[];
}

interface GetCategoryResponse {
  category: Category;
}

interface CreateCategoryInput {
  code: string;
  name: string;
  description?: string;
}

interface UpdateCategoryInput {
  id: string;
  code?: string;
  name?: string;
  description?: string;
}

interface DeleteCategoryInput {
  id: string;
}

interface CreateCategoryResponse {
  createCategory: Category;
}

interface UpdateCategoryResponse {
  updateCategory: Category;
}

interface DeleteCategoryResponse {
  deleteCategory: boolean;
}

const GET_CATEGORIES = `
  query GetCategories {
    categories {
      id
      code
      name
      description
     
    }
  }
`;

const GET_CATEGORY = `
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      code
      name
      description
     
    }
  }
`;

const CREATE_CATEGORY = `
  mutation CreateCategory($code: String!, $name: String!, $description: String) {
    createCategory(code: $code, name: $name, description: $description) {
      id
      code
      name
      description
     
      updatedAt
    }
  }
`;

const UPDATE_CATEGORY = `
  mutation UpdateCategory($id: ID!, $code: String, $name: String, $description: String) {
    updateCategory(id: $id, code: $code, name: $name, description: $description) {
      id
      code
      name
      description
     
    }
  }
`;

const DELETE_CATEGORY = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

const GET_CATEGORIES_WITH_SUBCATEGORIES = `
  query GetCategoriesWithSubcategories {
    categories {
      id
      code
      name
      description
      subCategories {
        id
        name
        description
      }
    }
  }
`;

interface GetCategoriesWithSubcategoriesResponse {
  categories: CategoryWithSubcategories[];
}

export const getCategories = async (token: string): Promise<Category[]> => {
  try {
    const response = await graphQLClient.request<GetCategoriesResponse>(GET_CATEGORIES, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategory = async (id: string, token: string): Promise<Category> => {
  try {
    const response = await graphQLClient.request<GetCategoryResponse>(
      GET_CATEGORY,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.category;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

export const createCategory = async (input: CreateCategoryInput, token: string): Promise<Category> => {
  try {
    const response = await graphQLClient.request<CreateCategoryResponse>(
      CREATE_CATEGORY,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.createCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (input: UpdateCategoryInput, token: string): Promise<Category> => {
  try {
    const response = await graphQLClient.request<UpdateCategoryResponse>(
      UPDATE_CATEGORY,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateCategory;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (input: DeleteCategoryInput, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteCategoryResponse>(
      DELETE_CATEGORY,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteCategory;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getCategoriesWithSubcategories = async (token: string): Promise<CategoryWithSubcategories[]> => {
  try {
    const response = await graphQLClient.request<GetCategoriesWithSubcategoriesResponse>(
      GET_CATEGORIES_WITH_SUBCATEGORIES,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response.categories;
  } catch (error) {
    console.error('Error fetching categories with subcategories:', error);
    throw error;
  }
}; 