import { graphQLClient } from '@/lib/graphql';
import { Category } from './category';

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  category: Pick<Category, 'id' | 'code' | 'name'>;
}

interface GetSubcategoriesResponse {
  subCategories: Subcategory[];
}

interface GetSubcategoryResponse {
  subcategory: Subcategory;
}

interface CreateSubcategoryInput {
  name: string;
  description?: string;
  categoryId: string;
}

interface UpdateSubcategoryInput {
  id: string;
  name?: string;
  description?: string;
  categoryId?: string;
}

interface DeleteSubcategoryInput {
  id: string;
}

interface CreateSubcategoryResponse {
  createSubCategory: Subcategory;
}

interface UpdateSubcategoryResponse {
  updateSubCategory: Subcategory;
}

interface DeleteSubcategoryResponse {
  deleteSubCategory: boolean;
}

const GET_SUBCATEGORIES = `
query GetSubCategories {
  subCategories {
    id
    categoryId
    name
    description
    category {
      id
      code
      name
    }
  }
}
`;

const GET_SUBCATEGORY = `
  query GetSubcategory($id: ID!) {
    subcategory(id: $id) {
      id
      name
      description
      categoryId
      category {
        id
        code
        name
      }
    }
  }
`;

const CREATE_SUBCATEGORY = `
  mutation CreateSubCategory($categoryId: ID!, $name: String!, $description: String) {
    createSubCategory(categoryId: $categoryId, name: $name, description: $description) {
      id
      categoryId
      name
      description
      category {
        id
        code
        name
      }
    }
  }
`;

const UPDATE_SUBCATEGORY = `
  mutation UpdateSubCategory($id: ID!, $name: String, $description: String, $categoryId: ID) {
    updateSubCategory(id: $id, name: $name, description: $description, categoryId: $categoryId) {
      id
      categoryId
      name
      description
      category {
        id
        code
        name
      }
    }
  }
`;

const DELETE_SUBCATEGORY = `
  mutation DeleteSubCategory($id: ID!) {
    deleteSubCategory(id: $id)
  }
`;

export const getSubcategories = async (token: string): Promise<Subcategory[]> => {
  try {
    const response = await graphQLClient.request<GetSubcategoriesResponse>(GET_SUBCATEGORIES, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.subCategories;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};

export const getSubcategory = async (id: string, token: string): Promise<Subcategory> => {
  try {
    const response = await graphQLClient.request<GetSubcategoryResponse>(
      GET_SUBCATEGORY,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.subcategory;
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    throw error;
  }
};

export const createSubcategory = async (input: CreateSubcategoryInput, token: string): Promise<Subcategory> => {
  try {
    const response = await graphQLClient.request<CreateSubcategoryResponse>(
      CREATE_SUBCATEGORY,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.createSubCategory;
  } catch (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }
};

export const updateSubcategory = async (input: UpdateSubcategoryInput, token: string): Promise<Subcategory> => {
  try {
    const response = await graphQLClient.request<UpdateSubcategoryResponse>(
      UPDATE_SUBCATEGORY,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateSubCategory;
  } catch (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }
};

export const deleteSubcategory = async (input: DeleteSubcategoryInput, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteSubcategoryResponse>(
      DELETE_SUBCATEGORY,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteSubCategory;
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }
}; 