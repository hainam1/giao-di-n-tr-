import { siteConfig } from '../config/site.config.js';

export class ApiClient {
  static getAuthToken() {
    return localStorage.getItem('auth_token') || null;
  }

  static setAuthToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  static async request(endpoint, options = {}) {
    const url = `${siteConfig.api.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi gọi API');
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  }

  static get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  static post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  static put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
