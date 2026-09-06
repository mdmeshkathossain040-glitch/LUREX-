const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('lurex_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || 'Admin API Request Failed');
  }
  return json.data;
}

export const AdminApi = {
  getAnalytics: () => adminFetch('/admin/analytics'),
  getUsers: (role?: string) => adminFetch(`/admin/users${role ? `?role=${role}` : ''}`),
  toggleUserStatus: (id: string, is_active: boolean) =>
    adminFetch(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active })
    }),
  getShops: (status?: string) => adminFetch(`/admin/shops${status ? `?status=${status}` : ''}`),
  updateShopStatus: (id: string, status: string) =>
    adminFetch(`/admin/shops/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  getWithdrawals: (status?: string) => adminFetch(`/admin/withdrawals${status ? `?status=${status}` : ''}`),
  processWithdrawal: (id: string, status: string, transaction_ref?: string) =>
    adminFetch(`/admin/withdrawals/${id}/process`, {
      method: 'PUT',
      body: JSON.stringify({ status, transaction_ref })
    })
};
