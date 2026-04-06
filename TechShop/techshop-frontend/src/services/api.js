import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data), // data: { username, password, email, fullName, phone }
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.post('/auth/change-password', data),
};

export const productService = {
    getAll: (keyword = '', categoryId = null, page = 1, pageSize = 12) => 
        api.get('/products', { params: { keyword, categoryId, page, pageSize } }),
    getById: (id) => api.get(`/products/${id}`),
    getAllWithDeleted: (page = 1, pageSize = 10) => 
        api.get('/products/all-with-deleted', { params: { page, pageSize } }),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    remove: (id) => api.delete(`/products/${id}`),
    restore: (id) => api.patch(`/products/${id}/restore`)
};

export const categoryService = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    remove: (id) => api.delete(`/categories/${id}`)
};

export const cartService = {
    get: () => api.get('/cart'),
    add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
    // Gửi trực tiếp số lượng trong body cho PUT
    update: (cartItemId, quantity) => api.put(`/cart/update/${cartItemId}`, quantity, { headers: { 'Content-Type': 'application/json' } }),
    remove: (cartItemId) => api.delete(`/cart/remove/${cartItemId}`),
};

export const orderService = {
    checkout: (data) => api.post('/orders/checkout', data), // data: { shippingAddress, paymentMethod, note }
    getHistory: (page = 1, pageSize = 10) => 
        api.get('/orders/history', { params: { page, pageSize } }),
    // Quyền Admin
    getAll: (page = 1, pageSize = 10) => 
        api.get('/orders/all', { params: { page, pageSize } }),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } }),
    getAdminStats: () => api.get('/orders/admin/stats')
};

export const uploadService = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default api;
