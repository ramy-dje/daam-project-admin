import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types matching Spring Boot backend
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string | null;
  phoneNumber: string | null;
  role?: string;
  permissions?: string[];
  userType?: string;
}

export interface SellerResponse extends UserResponse {
  userType: 'SELLER';
}

export interface ClientResponse extends UserResponse {
  userType: 'CLIENT';
}

export interface AdminResponse extends UserResponse {
  userType: 'ADMIN';
  permissions: string[];
}

export interface ProductResponse {
  id: number;
  serialNumber: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number | null;
  isValid: boolean;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  canReview: boolean;
  seller: SellerResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate?: string;
  phoneNumber?: string;
}

export interface CreateSellerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate?: string;
  phoneNumber?: string;
}

export interface ProductRequest {
  serialNumber: string;
  name: string;
  description?: string;
  image?: string;
  price?: number;
  isValid?: boolean;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  canReview?: boolean;
}

// Auth API
export const authApi = {
  login: async (request: LoginRequest): Promise<UserResponse> => {
    const response = await api.post('/auth/login', request);
    return response.data;
  },
  
  signup: async (request: SignupRequest): Promise<UserResponse> => {
    const response = await api.post('/auth/signup', request);
    return response.data;
  },
  
  clientLogin: async (request: LoginRequest): Promise<UserResponse> => {
    const response = await api.post('/auth/client/login', request);
    return response.data;
  },
  
  clientSignup: async (request: SignupRequest): Promise<UserResponse> => {
    const response = await api.post('/auth/client/signup', request);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAllClients: async (adminId: number): Promise<ClientResponse[]> => {
    const response = await api.get('/users/clients', { params: { adminId } });
    return response.data;
  },
  
  getAllSellers: async (adminId: number): Promise<SellerResponse[]> => {
    const response = await api.get('/users/sellers', { params: { adminId } });
    return response.data;
  },
  
  createSeller: async (request: CreateSellerRequest, adminId: number): Promise<SellerResponse> => {
    const response = await api.post('/users/sellers', request, { params: { adminId } });
    return response.data;
  },
  
  deleteSeller: async (sellerId: number, adminId: number): Promise<void> => {
    await api.delete(`/users/sellers/${sellerId}`, { params: { adminId } });
  },
  
  deleteClient: async (clientId: number, adminId: number): Promise<void> => {
    await api.delete(`/users/clients/${clientId}`, { params: { adminId } });
  },
};

// Products API
export const productsApi = {
  getAllProducts: async (): Promise<ProductResponse[]> => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getProductById: async (id: number): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  createProduct: async (request: ProductRequest, sellerId: number): Promise<ProductResponse> => {
    const response = await api.post('/products', request, { params: { sellerId } });
    return response.data;
  },
  
  updateProduct: async (id: number, request: Partial<ProductRequest>, userId: number): Promise<ProductResponse> => {
    const response = await api.put(`/products/${id}`, request, { params: { userId } });
    return response.data;
  },
  
  deleteProduct: async (id: number, adminId: number): Promise<void> => {
    await api.delete(`/products/${id}`, { params: { adminId } });
  },
};

// File upload API
export const fileApi = {
  uploadFile: async (file: File): Promise<{ filename: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getFileUrl: (filename: string): string => {
    return `${API_BASE_URL}/api/files/${filename}`;
  },
};

export default api;
