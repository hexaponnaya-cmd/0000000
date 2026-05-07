const API_BASE = import.meta.env.VITE_API_URL || 'https://legsend-api.hexaponnaya.workers.dev'

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('legsend_token')
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new APIError(res.status, (data as any).message || 'Request failed')
  return data as T
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // Emails
  listEmails: (params?: Record<string, string>) =>
    request(`/v1/emails?${new URLSearchParams(params)}`),
  getEmail: (id: string) => request(`/v1/emails/${id}`),
  sendEmail: (body: any) =>
    request('/v1/emails', { method: 'POST', body: JSON.stringify(body) }),
  cancelEmail: (id: string) =>
    request(`/v1/emails/${id}`, { method: 'PATCH', body: JSON.stringify({ cancel: true }) }),

  // Domains
  listDomains: () => request('/v1/domains'),
  addDomain: (name: string) =>
    request('/v1/domains', { method: 'POST', body: JSON.stringify({ name }) }),
  getDomain: (id: string) => request(`/v1/domains/${id}`),
  verifyDomain: (id: string) =>
    request(`/v1/domains/${id}/verify`, { method: 'POST' }),
  deleteDomain: (id: string) =>
    request(`/v1/domains/${id}`, { method: 'DELETE' }),

  // API Keys
  listApiKeys: () => request('/v1/api-keys'),
  createApiKey: (name: string, permissions: string) =>
    request('/v1/api-keys', { method: 'POST', body: JSON.stringify({ name, permissions }) }),
  deleteApiKey: (id: string) =>
    request(`/v1/api-keys/${id}`, { method: 'DELETE' }),
  renameApiKey: (id: string, name: string) =>
    request(`/v1/api-keys/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),

  // Audiences
  listAudiences: () => request('/v1/audiences'),
  createAudience: (name: string) =>
    request('/v1/audiences', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteAudience: (id: string) =>
    request(`/v1/audiences/${id}`, { method: 'DELETE' }),
  listContacts: (audienceId: string, params?: any) =>
    request(`/v1/audiences/${audienceId}/contacts?${new URLSearchParams(params)}`),
  addContact: (audienceId: string, data: any) =>
    request(`/v1/audiences/${audienceId}/contacts`, { method: 'POST', body: JSON.stringify(data) }),
  deleteContact: (audienceId: string, contactId: string) =>
    request(`/v1/audiences/${audienceId}/contacts/${contactId}`, { method: 'DELETE' }),

  // Broadcasts
  listBroadcasts: () => request('/v1/broadcasts'),
  createBroadcast: (data: any) =>
    request('/v1/broadcasts', { method: 'POST', body: JSON.stringify(data) }),
  getBroadcast: (id: string) => request(`/v1/broadcasts/${id}`),
  updateBroadcast: (id: string, data: any) =>
    request(`/v1/broadcasts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  sendBroadcast: (id: string) =>
    request(`/v1/broadcasts/${id}/send`, { method: 'POST' }),
  deleteBroadcast: (id: string) =>
    request(`/v1/broadcasts/${id}`, { method: 'DELETE' }),

  // Webhooks
  listWebhooks: () => request('/v1/webhooks'),
  createWebhook: (data: any) =>
    request('/v1/webhooks', { method: 'POST', body: JSON.stringify(data) }),
  updateWebhook: (id: string, data: any) =>
    request(`/v1/webhooks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteWebhook: (id: string) =>
    request(`/v1/webhooks/${id}`, { method: 'DELETE' }),
  getWebhookDeliveries: (id: string) =>
    request(`/v1/webhooks/${id}/deliveries`),

  // Logs
  listLogs: (params?: Record<string, string>) =>
    request(`/v1/logs?${new URLSearchParams(params)}`),
  getLog: (id: string) => request(`/v1/logs/${id}`),

  // Templates
  listTemplates: () => request('/v1/templates'),
  createTemplate: (data: any) =>
    request('/v1/templates', { method: 'POST', body: JSON.stringify(data) }),
  getTemplate: (id: string) => request(`/v1/templates/${id}`),
  updateTemplate: (id: string, data: any) =>
    request(`/v1/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTemplate: (id: string) =>
    request(`/v1/templates/${id}`, { method: 'DELETE' }),
}
