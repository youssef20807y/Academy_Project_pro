// خدمة API للتواصل مع الخادم الخلفي
const resolveBaseUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // في وضع التطوير استخدم البروكسي
      if (import.meta.env.DEV) {
        console.log('Running in development mode, using proxy');
        return '';
      }
      if (import.meta.env.VITE_API_BASE_URL) {
        console.log('Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
        return import.meta.env.VITE_API_BASE_URL;
      }
    }
  } catch (error) {
    console.warn('Error checking import.meta.env:', error);
  }
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    console.log('Using window.__API_BASE_URL__:', window.__API_BASE_URL__);
    return window.__API_BASE_URL__;
  }
  console.log('Using default API base URL: http://localhost:8000');
  return 'http://localhost:8000';
};

const API_BASE_URL = resolveBaseUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    this.refreshTokenValue = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  }

  setToken(token) {
    this.token = token || null;
    try {
      if (token && typeof localStorage !== 'undefined') localStorage.setItem('authToken', token);
      else if (!token && typeof localStorage !== 'undefined') localStorage.removeItem('authToken');
    } catch (_) {}
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { isAuthenticated: Boolean(token) } }));
      }
    } catch (_) {}
  }

  setRefreshToken(refreshToken) {
    this.refreshTokenValue = refreshToken || null;
    try {
      if (refreshToken && typeof localStorage !== 'undefined') localStorage.setItem('refreshToken', refreshToken);
      else if (!refreshToken && typeof localStorage !== 'undefined') localStorage.removeItem('refreshToken');
    } catch (_) {}
  }

  hasToken() {
    return Boolean(this.token);
  }

  isTokenExpired() {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;
      
      // Check if token is expired (with 30 seconds buffer)
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = currentTime >= (exp - 30);
      
      if (isExpired) {
        console.log('⚠️ Token is expired or will expire soon');
        // Clear expired token
        this.setToken(null);
        this.setRefreshToken(null);
        
        // Dispatch auth change event
        try {
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('auth-changed', { 
              detail: { isAuthenticated: false, reason: 'token_expired' } 
            }));
          }
        } catch (_) {}
      }
      
      return isExpired;
    } catch (error) {
      console.warn('⚠️ Failed to parse JWT token for expiration check:', error);
      // If we can't parse the token, consider it invalid
      this.setToken(null);
      this.setRefreshToken(null);
      return true;
    }
  }

  getTokenExpirationTime() {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return null;
      
      return new Date(exp * 1000);
    } catch (error) {
      console.warn('⚠️ Failed to parse JWT token for expiration time:', error);
      return null;
    }
  }

  // Debug method to show current authentication state
  debugAuthState() {
    console.log('🔍 === AUTHENTICATION DEBUG INFO ===');
    console.log('🔑 Has Token:', this.hasToken());
    console.log('🔑 Token Value:', this.token ? `${this.token.substring(0, 20)}...` : 'null');
    console.log('🔄 Has Refresh Token:', Boolean(this.refreshTokenValue));
    console.log('⏰ Token Expired:', this.isTokenExpired());
    
    if (this.token) {
      try {
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        console.log('📋 JWT Claims:', payload);
        console.log('⏰ Expires At:', new Date(payload.exp * 1000));
        console.log('👤 User ID:', payload.sub || payload.nameid);
        console.log('📧 Email:', payload.email);
        console.log('🔐 Role:', payload.role);
      } catch (error) {
        console.warn('⚠️ Failed to parse JWT token:', error);
      }
    }
    
    console.log('🌐 Base URL:', this.baseURL);
    console.log('🔍 === END DEBUG INFO ===');
  }

  extractTokens(res) {
    // Updated to match backend C# TokenResultDto structure
    const accessToken = res?.AccessToken || res?.accessToken || res?.token || res?.jwt || res?.data?.AccessToken || res?.data?.accessToken || res?.result?.AccessToken;
    const refreshToken = res?.RefreshToken || res?.refreshToken || res?.data?.RefreshToken || res?.data?.refreshToken || res?.result?.RefreshToken;
    const expiresAt = res?.ExpiresAt || res?.expiresAt || res?.data?.ExpiresAt || res?.data?.expiresAt || res?.result?.ExpiresAt;
    
    return { accessToken, refreshToken, expiresAt };
  }

  // Test server connectivity
  async testServerConnection() {
    try {
      console.log('🔍 Testing server connectivity...');
      
      // في وضع التطوير، استخدم الـ proxy
      let testUrl;
      if (this.baseURL === '') {
        // وضع التطوير - استخدم الـ proxy
        testUrl = '/api/Account/me';
        console.log('🔍 Development mode - testing proxy connection to:', testUrl);
        console.log('🔍 Proxy should redirect to: http://localhost:8000/api/Account/me');
      } else {
        // وضع الإنتاج - استخدم الـ baseURL
        testUrl = `${this.baseURL}/api/Account/me`;
        console.log('🔍 Production mode - testing direct connection to:', testUrl);
      }
      
      const response = await fetch(testUrl);
      console.log('🔍 Server test response status:', response.status);
      console.log('🔍 Server test response URL:', response.url);
      
      // في وضع التطوير، 401 يعني أن الـ proxy يعمل ولكن الخادم يتطلب مصادقة
      if (this.baseURL === '' && response.status === 401) {
        console.log('🔍 Proxy is working (401 is expected for /me endpoint)');
        console.log('🔍 Response URL shows proxy redirection:', response.url);
        return true;
      }
      
      return response.ok;
    } catch (error) {
      console.log('🔍 Server test failed:', error.message);
      return false;
    }
  }

  async login(email, password) {
    try {
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password ? password.length : 0);
      console.log('🌐 Base URL:', this.baseURL);
      console.log('🔧 Development mode:', this.baseURL === '' ? 'Yes (using proxy)' : 'No (direct connection)');
      console.log('📡 Proxy target:', 'http://localhost:8000');
      
      // اختبار اتصال الخادم أولاً
      const serverOk = await this.testServerConnection();
      if (!serverOk) {
        throw new Error('Server is not accessible. Please check your connection.');
      }
      
      console.log('✅ Server connectivity test passed');
      
      // اختبار إضافي للـ proxy
      if (this.baseURL === '') {
        console.log('🔍 Testing proxy configuration...');
        console.log('🔍 Current baseURL:', this.baseURL);
        console.log('🔍 Proxy should redirect /api/Account/login to http://localhost:8000/api/Account/login');
        console.log('🔍 Full URL that should be requested: /api/Account/login');
      }
      
      // استخدام نفس تنسيق صفحة إنشاء الحساب - camelCase
      const loginData = { email: email, password: password };
      console.log('📋 Login payload:', loginData);
      console.log('📋 Payload keys:', Object.keys(loginData));
      console.log('📋 Payload values:', Object.values(loginData));
      console.log('📋 JSON stringified:', JSON.stringify(loginData));
      
      const res = await this.request('/api/Account/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Login successful!');
      console.log('✅ Response:', res);
      
      // Extract tokens using the updated method that matches backend structure
      const { accessToken, refreshToken, expiresAt } = this.extractTokens(res);
      
      if (accessToken) {
        this.setToken(accessToken);
        console.log('✅ Access token set successfully');
      }
      
      if (refreshToken) {
        this.setRefreshToken(refreshToken);
        console.log('✅ Refresh token set successfully');
      }
      
      if (expiresAt) {
        console.log('✅ Token expires at:', expiresAt);
      }
      
      // Try to get user data from token if not in response
      let userData = res.user || res.User || res.data?.user || res.data?.User;
      if (!userData && accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          userData = {
            id: payload.sub || payload.userId || payload.UserId || payload.nameid,
            email: payload.email || payload.Email,
            role: payload.role || payload.Role,
            firstName: payload.firstName || payload.FirstName,
            lastName: payload.lastName || payload.LastName,
            name: payload.name || payload.Name
          };
          console.log('✅ User data extracted from JWT token');
        } catch (tokenError) {
          console.warn('⚠️ Failed to parse JWT token:', tokenError);
          // If token parsing fails, use basic user data
          userData = {
            id: res.id || res.Id || Date.now(),
            email: email,
            role: res.role || res.Role || 'User'
          };
        }
      }
      
      console.log('=== LOGIN SUCCESS ===');
      
      // Debug authentication state after successful login
      this.debugAuthState();
      
      return {
        ...res,
        user: userData,
        accessToken,
        refreshToken,
        expiresAt
      };
      
    } catch (error) {
      console.error('=== LOGIN FAILURE ===');
      console.error('Error:', error);
      throw error;
    }
  }

  // Get current user data
  async getCurrentUser() {
    try {
      // First try to get user from API call to get complete user data
      const res = await this.request('/api/Account/me');
      if (res) {
        console.log('✅ User data from API:', res);
        return res;
      }
      
      // Fallback to JWT token claims if API call fails
      if (this.token) {
        try {
          const payload = JSON.parse(atob(this.token.split('.')[1]));
          const userFromToken = {
            id: payload.sub || payload.nameid,
            email: payload.email,
            role: payload.role,
            firstName: payload.firstName,
            lastName: payload.lastName,
            name: payload.name,
            // Extract other claims as needed
            academyDataId: payload.academyDataId,
            branchesDataId: payload.branchesDataId
          };
          
          console.log('✅ User data extracted from JWT token:', userFromToken);
          return userFromToken;
        } catch (tokenError) {
          console.warn('⚠️ Failed to parse JWT token for user data:', tokenError);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async register(payload) {
    const res = await this.request('/api/Account/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Create complete user data from payload and response
    const userData = {
      id: res.id || res.Id || res.userId || res.UserId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
      active: true,
      // Add alternative field names for compatibility
      FirstName: payload.firstName,
      LastName: payload.lastName,
      PhoneNumber: payload.phoneNumber,
      Email: payload.email,
      Role: payload.role
    };
    
    // Extract tokens if available
    const { accessToken, refreshToken } = this.extractTokens(res);
    if (accessToken) this.setToken(accessToken);
    if (refreshToken) this.setRefreshToken(refreshToken);
    
    // Save complete user data to localStorage
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('✅ User data saved to localStorage:', userData);
    } catch (error) {
      console.warn('⚠️ Failed to save user data to localStorage:', error);
    }
    
    return {
      ...res,
      user: userData,
      accessToken,
      refreshToken
    };
  }

  // Admin-safe register: create user without altering current session tokens or localStorage
  async adminRegister(payload) {
    const res = await this.request('/api/Account/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    // Do NOT extract tokens or save userData; just return API response
    return res;
  }

  async sendEmailConfirmation(email) {
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    const cleanEmail = email.trim();
    console.log('Sending email confirmation for:', cleanEmail);
    
    try {
      const result = await this.request('/api/Account/send-email-confirmation', {
      method: 'POST',
        body: JSON.stringify({ email: cleanEmail }),
    });
      console.log('Email confirmation sent successfully');
      return result;
    } catch (error) {
      console.error('Email confirmation failed:', error);
      // Check if it's a server configuration issue
      if (error?.status === 400 && error?.body) {
        try {
          const errorData = JSON.parse(error.body);
          if (errorData?.detail?.includes('Failed to send email confirmation')) {
            throw new Error('Email service is not configured. Please contact administrator.');
          }
        } catch (parseError) {
          // Continue with original error
        }
      }
      throw error;
    }
  }

  async confirmEmail(email, token) {
    const url = `/api/Account/confirm-email?Email=${encodeURIComponent(email)}&Token=${encodeURIComponent(token)}`;
    return this.request(url);
  }

  async forgotPassword(email) {
    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
    if (isDev) {
      console.log('ForgotPassword API call:', { email, endpoint: '/api/Account/forgot-password' });
    }
    
    const result = await this.request('/api/Account/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (isDev) {
      console.log('ForgotPassword API response:', result);
    }
    
    return result;
  }

  async resetPassword(email, token, newPassword) {
    return this.request('/api/Account/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/api/Account/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async sendPhoneCode(phoneNumber) {
    // API schema expects camelCase: phoneNumber
    return this.request('/api/Account/send-phone-code', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async confirmPhone(phoneNumber, code) {
    return this.request('/api/Account/confirm-phone', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async enable2FA(userId) {
    return this.request(`/api/Account/enable-2fa/${userId}`, { method: 'POST' });
  }

  async disable2FA(userId) {
    return this.request(`/api/Account/disable-2fa/${userId}`, { method: 'POST' });
  }

  async verify2FA(userId, code) {
    return this.request('/api/Account/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ userId, code }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async deactivateUser(userId) {
    return this.request(`/api/Account/deactivate/${userId}`, { method: 'PUT' });
  }

  async activateUser(userId) {
    return this.request(`/api/Account/activate/${userId}`, { method: 'PUT' });
  }

  async lastLoginTime(userId) {
    try {
      return await this.request(`/api/Account/last-login-time/${userId}`, {}, { silent: true });
    } catch (e) {
      // Handle 404 error silently - this is normal for new users
      if (e?.status === 404) {
        console.log(`Last login time not found for user ${userId} (404) - this is normal for new users`);
        return null;
      }
      // Re-throw other errors
      throw e;
    }
  }

  async uploadProfilePicture(userId, file) {
    const form = new FormData();
    form.append('File', file);
    
    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
    if (isDev) {
      console.log(`Uploading profile picture for user ${userId}, file size: ${file.size} bytes, file name: ${file.name}`);
    }
    
    const result = await this.request(`/api/Account/profile-picture/${userId}`, { method: 'POST', body: form });
    
    if (isDev) {
      console.log(`Profile picture upload completed for user ${userId}, result:`, result);
    }
    
    return result;
  }

  async getProfilePicture(userId) {
    try {
      const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
      if (isDev) {
        console.log(`Fetching profile picture for user: ${userId}`);
      }
      
      const blob = await this.request(`/api/Account/profile-picture/${userId}`, { headers: { Accept: 'image/*' } }, { silent: true });
      
      if (isDev) {
        if (blob && blob.size) {
          console.log(`Profile picture fetched successfully for user ${userId}, size: ${blob.size} bytes`);
        } else {
          console.log(`No profile picture found for user ${userId}`);
        }
      }
      
      return blob;
    } catch (e) {
      // تجاهل أخطاء 404 و 401 للصور - هذا طبيعي إن لم تكن موجودة
      if (e?.status === 404 || e?.status === 401) {
        console.log(`Profile picture not found for user ${userId} (${e?.status}) - this is normal for new users`);
        return null;
      }
      // إعادة رمي الأخطاء الأخرى
      throw e;
    }
  }

  async externalLogin(provider, idToken, accessToken) {
    return this.request('/api/Account/external-login', {
      method: 'POST',
      body: JSON.stringify({ provider, idToken, accessToken }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async linkExternalAccount(userId, provider, idToken, accessToken) {
    return this.request(`/api/Account/link-external-account/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ provider, idToken, accessToken }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async revokeToken(refreshToken) {
    const tokenToRevoke = refreshToken || this.refreshTokenValue;
    return this.request('/api/Account/revoke-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokenToRevoke }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async me() {
    return this.request('/api/Account/me');
  }

  async refreshToken() {
    if (!this.refreshTokenValue) throw new Error('No refresh token');
    
    try {
      console.log('🔄 Attempting to refresh token...');
      
      const res = await this.request('/api/Account/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshTokenValue }),
        headers: { 
          'X-Skip-Auth': '1',
          'Content-Type': 'application/json'
        }
      }, { skipAuthHeader: false });
      
      console.log('✅ Token refresh successful');
      console.log('✅ Refresh response:', res);
      
      // Extract tokens using the updated method that matches backend structure
      const { accessToken, refreshToken, expiresAt } = this.extractTokens(res);
      
      if (accessToken) {
        this.setToken(accessToken);
        console.log('✅ New access token set successfully');
      }
      
      if (refreshToken) {
        this.setRefreshToken(refreshToken);
        console.log('✅ New refresh token set successfully');
      }
      
      if (expiresAt) {
        console.log('✅ New token expires at:', expiresAt);
      }
      
      return res;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  }

    async request(endpoint, options = {}, requestOptions = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...options.headers,
      },
      ...options,
    };
    
    const isSilent = requestOptions.silent === true;

    // Only set Content-Type for JSON, not for FormData, unless explicitly provided
    if (!(options.body instanceof FormData)) {
      if (options.headers?.['Content-Type']) {
        config.headers['Content-Type'] = options.headers['Content-Type'];
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    // For FormData, let the browser set the Content-Type automatically

    // Skip authentication for silent requests
    if (!isSilent) {
      // Check if token is expired before making request
      if (this.token && !options?.headers?.['X-Skip-Auth']) {
        if (this.isTokenExpired()) {
          console.log('⚠️ Token expired, attempting to refresh...');
          try {
            await this.refreshToken();
          } catch (refreshError) {
            console.error('❌ Token refresh failed, redirecting to login');
            // If refresh fails, redirect to login
            try {
              if (typeof window !== 'undefined' && window.location) {
                window.location.href = '/login';
              }
            } catch (_) {}
            throw new Error('Authentication required. Please log in again.');
          }
        }
      }

      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
    }

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      console.log('📋 Request config:', config);
      console.log('📋 Request headers:', config.headers);
      console.log('📋 Request body type:', config.body ? config.body.constructor.name : 'undefined');
      console.log('🌐 Base URL being used:', this.baseURL);
      console.log('🌐 Full URL being requested:', url);
      
      // اختبار إضافي للـ proxy
      if (this.baseURL === '') {
        console.log('🔍 Proxy mode detected');
        console.log('🔍 Request will be proxied to: http://localhost:8000' + endpoint);
      }
      
      if (config.body) {
        if (config.body instanceof FormData) {
          console.log('📋 Request body: FormData');
          // Log FormData contents
          for (let [key, value] of config.body.entries()) {
            console.log(`📋 FormData ${key}:`, value);
          }
        } else {
          console.log('📋 Request body:', config.body);
        }
      }

      const response = await fetch(url, config);
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📡 Response URL:', response.url);

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          console.warn('🔐 401 Unauthorized - User not authenticated or token expired');
          
          // For silent requests, don't clear tokens or attempt refresh
          if (isSilent) {
            console.warn('🔐 Silent request - skipping auth error handling');
            let body = '';
            try { 
              body = await response.text(); 
              // Try to parse as JSON for better error handling
              try {
                const jsonBody = JSON.parse(body);
                body = JSON.stringify(jsonBody, null, 2);
              } catch (_) {}
            } catch (_) {}
            
            const error = new Error(`HTTP error! status: ${response.status}, body: ${body}`);
            error.status = response.status;
            error.body = body;
            throw error;
          }
          
          // Clear invalid tokens
          if (this.token) {
            console.warn('🔐 Clearing invalid token');
            this.setToken(null);
            this.setRefreshToken(null);
            
            // Dispatch auth change event
            try {
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('auth-changed', { 
                  detail: { isAuthenticated: false, reason: 'token_expired' } 
                }));
              }
            } catch (_) {}
          }
          
          // Attempt refresh on 401 once, then retry the original request
          const canRefresh = this.refreshTokenValue && !options?.headers?.['X-Skip-Auth'];
        if (canRefresh) {
          try {
            console.warn('401 Unauthorized. Attempting to refresh token...');
            await this.refreshToken();
            
            // Update auth header and retry once
            const retryConfig = { ...config, headers: { ...config.headers } };
            if (this.token) retryConfig.headers.Authorization = `Bearer ${this.token}`;
            
            console.log('Retrying request with new token...');
            const retryResp = await fetch(url, retryConfig);
            console.log(`Retry API Response: ${retryResp.status} ${retryResp.statusText}`);
            
            if (!retryResp.ok) {
              let retryBody = '';
              try { 
                retryBody = await retryResp.text(); 
                // Try to parse as JSON for better error handling
                try {
                  const jsonBody = JSON.parse(retryBody);
                  retryBody = JSON.stringify(jsonBody, null, 2);
                } catch (_) {}
              } catch (_) {}
              
              const retryErr = new Error(`HTTP error! status: ${retryResp.status}, body: ${retryBody}`);
              retryErr.status = retryResp.status;
              retryErr.body = retryBody;
              throw retryErr;
            }
            
            const retryContentType = retryResp.headers.get('content-type');
            if (retryContentType && retryContentType.includes('application/json')) {
              const data = await retryResp.json();
              console.log('API Response data (retry):', data);
              return data;
            } else if (retryContentType && retryContentType.includes('text/')) {
              const data = await retryResp.text();
              console.log('API Response text (retry):', data);
              return data;
            } else {
              const data = await retryResp.blob();
              console.log('API Response blob (retry):', data);
              return data;
            }
          } catch (refreshErr) {
            console.error('Token refresh or retry failed:', refreshErr);
            
            // If refresh fails, clear tokens and throw auth error
            if (refreshErr.status === 401 || refreshErr.status === 403) {
              this.setToken(null);
              this.setRefreshToken(null);
              
              // Dispatch auth change event
              try {
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('auth-changed', { 
                    detail: { isAuthenticated: false, reason: 'token_refresh_failed' } 
                  }));
                }
              } catch (_) {}
            }
            
              // Create a more helpful error for authentication issues
              const authError = new Error('Authentication required. Please log in to access this resource.');
              authError.status = 401;
              authError.isAuthError = true;
              throw authError;
            }
          } else {
            // No refresh token available, create helpful error
            const authError = new Error('Authentication required. Please log in to access this resource.');
            authError.status = 401;
            authError.isAuthError = true;
            throw authError;
          }
        }

        let errorBody = '';
        try {
          errorBody = await response.text();
          
          // Try to parse as JSON for better error handling
          try {
            const jsonBody = JSON.parse(errorBody);
            errorBody = JSON.stringify(jsonBody, null, 2);
          } catch (_) {}
          
          if (!isSilent) {
            console.error('Error response body:', errorBody);
          }
        } catch (e) {
          if (!isSilent) {
            console.warn('Could not read error response body');
          }
        }

        const error = new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        error.status = response.status;
        error.body = errorBody;
        error.url = url;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('API Response data:', data);
        return data;
      } else if (contentType && contentType.includes('text/')) {
        const data = await response.text();
        console.log('API Response text:', data);
        return data;
      } else {
        const data = await response.blob();
        console.log('API Response blob:', data);
        return data;
      }
    } catch (error) {
      if (!isSilent) {
        console.error('API request failed:', error);
        console.error('Request details:', { url, config });
        
        // Provide more helpful error messages for common issues
        if (error.isAuthError) {
          console.error('🔐 Authentication error - user needs to log in');
        } else if (error.status === 401) {
          console.error('🔐 401 Unauthorized - check if user is logged in');
        } else if (error.status === 403) {
          console.error('🚫 403 Forbidden - user lacks permission for this resource');
        } else if (error.status === 404) {
          console.error('🔍 404 Not Found - resource not available');
        } else if (error.status >= 500) {
          console.error('💥 Server error - backend service issue');
        }
      }
      throw error;
    }
  }

  // الدورات (AcademyClaseDetail/Master)
  async getCourses(options = {}) {
    return this.request('/api/AcademyClaseDetail', {}, options);
  }

  async getCourse(id) {
    return this.request(`/api/AcademyClaseDetail/${id}`);
  }

  async getCourseImage(id) {
    return this.request(`/api/AcademyClaseDetail/${id}/image`, { headers: { 'Accept': 'image/*' } });
  }

  async createCourse(formData) {
    // If already FormData, use directly; else wrap in FormData
    const body = formData instanceof FormData ? formData : (() => {
      const form = new FormData();
      if (formData && typeof formData === 'object') {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            form.append(key, value);
          }
        });
      }
      return form;
    })();

    return this.request('/api/AcademyClaseDetail', {
      method: 'POST',
      body,
      headers: {
        // Let browser set multipart boundary
      },
    });
  }

  async updateCourse(id, formData) {
    const body = formData instanceof FormData ? formData : (() => {
      const form = new FormData();
      if (formData && typeof formData === 'object') {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            form.append(key, value);
          }
        });
      }
      return form;
    })();

    return this.request(`/api/AcademyClaseDetail/${id}`, {
      method: 'PUT',
      body,
      headers: {
        // Let browser set multipart boundary
      },
    });
  }

  async deleteCourse(id) {
    return this.request(`/api/AcademyClaseDetail/${id}`, {
      method: 'DELETE',
    });
  }

  async getCourseMasters(options = {}) {
    return this.request('/api/AcademyClaseMaster', {}, options);
  }

  async getCourseMaster(id, options = {}) {
    return this.request(`/api/AcademyClaseMaster/${id}`, {}, options);
  }

  async getCourseTypes(options = {}) {
    return this.request('/api/AcademyClaseType', {}, options);
  }

  // البرامج (ProgramsContentMaster/Detail)
  async getPrograms(options = {}) {
    return this.request('/api/ProgramsContentMaster', options);
  }

  async getProgram(id) {
    return this.request(`/api/ProgramsContentMaster/${id}`);
  }

  async getProgramDetails() {
    return this.request('/api/ProjectsDetail');
  }

  // المشاريع
  async getProjects(options = {}) {
    return this.request('/api/ProjectsMaster', options);
  }

  async getProject(id) {
    return this.request(`/api/ProjectsMaster/${id}`);
  }

  async createProject(formData) {
    // Convert formData to FormData for multipart/form-data
    const form = new FormData();
    
    // Clean formData by removing problematic fields
    const cleanFormData = { ...formData };
    delete cleanFormData.id;
    delete cleanFormData.Id;
    delete cleanFormData.ID;
    delete cleanFormData.createdAt;
    delete cleanFormData.updatedAt;
    delete cleanFormData.CreatedAt;
    delete cleanFormData.UpdatedAt;
    
    // Add all form fields
    Object.keys(cleanFormData).forEach(key => {
      if (cleanFormData[key] !== null && cleanFormData[key] !== undefined && cleanFormData[key] !== '') {
        form.append(key, cleanFormData[key]);
      }
    });
    
    return this.request('/api/ProjectsMaster', {
      method: 'POST',
      body: form,
      headers: {
        // Remove Content-Type to let browser set it for FormData
      },
    });
  }

  async updateProject(id, formData) {
    // Convert formData to FormData for multipart/form-data
    const form = new FormData();
    
    // Clean formData by removing problematic fields
    const cleanFormData = { ...formData };
    delete cleanFormData.id;
    delete cleanFormData.Id;
    delete cleanFormData.ID;
    delete cleanFormData.createdAt;
    delete cleanFormData.updatedAt;
    delete cleanFormData.CreatedAt;
    delete cleanFormData.UpdatedAt;
    
    console.log('updateProject - Original formData keys:', Object.keys(formData));
    console.log('updateProject - Cleaned formData keys:', Object.keys(cleanFormData));
    
    // Add all form fields
    Object.keys(cleanFormData).forEach(key => {
      if (cleanFormData[key] !== null && cleanFormData[key] !== undefined && cleanFormData[key] !== '') {
        form.append(key, cleanFormData[key]);
      }
    });
    
    // Log to verify no ID fields are being sent
    console.log('updateProject - Cleaned form data keys:', Object.keys(cleanFormData));
    console.log('updateProject - FormData entries:');
    for (let [key, value] of form.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    return this.request(`/api/ProjectsMaster/${id}`, {
      method: 'PUT',
      body: form,
      headers: {
        // Remove Content-Type to let browser set it for FormData
      },
    });
  }

  async deleteProject(id, options = {}) {
    const { force = false, cascade = false, recursive = false, hard = false, purge = false } = options;
    
    // بناء URL مع معاملات الحذف القسري
    let url = `/api/ProjectsMaster/${id}`;
    const params = new URLSearchParams();
    
    if (force) params.append('force', 'true');
    if (cascade) params.append('cascade', 'true');
    if (recursive) params.append('recursive', 'true');
    if (hard) params.append('hard', 'true');
    if (purge) params.append('purge', 'true');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url, {
      method: 'DELETE',
    });
  }

  async forceDeleteProject(id) {
    // محاولة حذف قسري شامل مع جميع المعاملات الممكنة
    const forceParams = [
      'force=true&cascade=true&recursive=true&hard=true&purge=true',
      'force=true&cascade=true&recursive=true',
      'force=true&hard=true&purge=true',
      'cascade=true&recursive=true&hard=true',
      'force=true&cascade=true',
      'recursive=true&hard=true',
      'force=true&purge=true'
    ];

    for (const params of forceParams) {
      try {
        const response = await fetch(`${this.baseURL}/api/ProjectsMaster/${id}?${params}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'X-Force-Delete': 'true',
            'X-Cascade-Delete': 'true',
            'X-Recursive-Delete': 'true',
            'X-Hard-Delete': 'true',
            'X-Purge-Delete': 'true'
          }
        });

        if (response.ok) {
          return { success: true, method: `force-delete-${params}` };
        }
      } catch (error) {
        console.log(`Force delete attempt with ${params} failed:`, error);
        continue;
      }
    }

    throw new Error('All force delete attempts failed');
  }

  async getProjectDetails(masterId) {
    if (masterId) {
      return this.request(`/api/ProjectsDetail/by-master/${masterId}`);
    }
    return this.request('/api/ProjectsDetail');
  }

  // الأكاديميات
  async getAcademies(options = {}) {
    return this.request('/api/AcademyData', options);
  }

  async getAcademy(id) {
    return this.request(`/api/AcademyData/${id}`);
  }

  async createAcademy(formData) {
    // Convert formData to FormData for multipart/form-data
    const form = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        form.append(key, formData[key]);
      }
    });
    
    return this.request('/api/AcademyData', {
      method: 'POST',
      body: form,
      headers: {
        // Remove Content-Type to let browser set it for FormData
      },
    });
  }

  async updateAcademy(id, formData) {
    // Convert formData to FormData for multipart/form-data
    const form = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        form.append(key, formData[key]);
      }
    });
    
    return this.request(`/api/AcademyData/${id}`, {
      method: 'PUT',
      body: form,
      headers: {
        // Remove Content-Type to let browser set it for FormData
      },
    });
  }

  async deleteAcademy(id) {
    return this.request(`/api/AcademyData/${id}`, {
      method: 'DELETE',
    });
  }

  // الفروع
  async getBranches(options = {}) {
    return this.request('/api/BranchData', options);
  }

  async getBranch(id) {
    return this.request(`/api/BranchData/${id}`);
  }

  async createBranch(formData) {
    // Convert formData to FormData for multipart/form-data
    const form = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        form.append(key, formData[key]);
      }
    });
    
    return this.request('/api/BranchData', {
      method: 'POST',
      body: form,
      headers: {
        // Remove Content-Type to let browser set it for FormData
      },
    });
  }

  async updateBranch(id, formData) {
    // Convert formData to FormData for multipart/form-data
    const form = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        form.append(key, formData[key]);
      }
    });
    
    return this.request(`/api/BranchData/${id}`, {
      method: 'PUT',
      body: form,
      headers: {
        // Remove Content-Type to let browser set it for FormData
      },
    });
  }

  async deleteBranch(id) {
    return this.request(`/api/BranchData/${id}`, {
      method: 'DELETE',
    });
  }

  async getBranchesByAcademy(academyId, options = {}) {
    return this.request(`/api/BranchData/by-academy/${academyId}`, {}, options);
  }

  async getBranchesByGovernorate(governorateId, options = {}) {
    return this.request(`/api/BranchData/by-governorate/${governorateId}`, {}, options);
  }

  async getBranchesByCity(cityId, options = {}) {
    return this.request(`/api/CityCode`, {}, options);
  }

  // الطلاب
  async getStudents(options = {}) {
    return this.request('/api/StudentData', {}, options);
  }

  async getStudent(id) {
    return this.request(`/api/StudentData/${id}`);
  }

  async deleteStudent(id) {
    return this.request(`/api/StudentData/${id}`, {
      method: 'DELETE',
    });
  }

  // المعلمون
  async getTeachers(options = {}) {
    return this.request('/api/TeacherData', {}, options);
  }

  async getTeacher(id) {
    return this.request(`/api/TeacherData/${id}`);
  }

  async deleteTeacher(id) {
    try {
      console.log('Attempting to delete teacher with ID:', id);
      const result = await this.request(`/api/TeacherData/${id}`, {
        method: 'DELETE',
      });
      console.log('Teacher deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      console.error('Teacher ID:', id);
      console.error('Error status:', error.status);
      console.error('Error body:', error.body);
      throw error;
    }
  }

  // تطوير المهارات
  async getSkillDevelopment(options = {}) {
    return this.request('/api/SkillDevelopment', {}, options);
  }

  // الوظائف
  async getJobs() {
    return this.request('/api/AcademyJob');
  }

  async getJob(id) {
    return this.request(`/api/AcademyJob/${id}`);
  }

  async createJob(formData) {
    return this.request('/api/AcademyJob', {
      method: 'POST',
      body: formData,
    });
  }

  async updateJob(id, formData) {
    return this.request(`/api/AcademyJob/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteJob(id) {
    return this.request(`/api/AcademyJob/${id}`, {
      method: 'DELETE',
    });
  }

  // Trainer API methods
  async getTrainers(options = {}) {
    return this.request('/api/TeacherData', options);
  }

  async getTrainer(id) {
    return this.request(`/api/TeacherData/${id}`);
  }

  async getTrainersByCategory(category, options = {}) {
    // This would need to be implemented based on your API structure
    // For now, we'll filter trainers by category on the frontend
    const trainers = await this.getTrainers(options);
    return trainers.filter(trainer => trainer.category === category);
  }

  async getTrainersByBranch(branchId, options = {}) {
    return this.request(`/api/TeacherData/by-branch/${branchId}`, options);
  }

  async getTrainersByGovernorate(governorateId, options = {}) {
    return this.request(`/api/TeacherData/by-governorate/${governorateId}`, options);
  }

  async getTrainersByCity(cityId, options = {}) {
    return this.request(`/api/TeacherData/by-city/${cityId}`, options);
  }

  async getInactiveTrainers(options = {}) {
    return this.request('/api/TeacherData/not-active', options);
  }

  async createTrainer(formData) {
    return this.request('/api/TeacherData', {
      method: 'POST',
      body: formData,
    });
  }

  async updateTrainer(id, formData) {
    // Send as FormData to satisfy backend validation that expects multipart/form-data
    const body = formData instanceof FormData ? formData : (() => {
      const fd = new FormData();
      Object.entries(formData || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      return fd;
    })();
    
    return this.request(`/api/TeacherData/${id}`, {
      method: 'PUT',
      body,
    });
  }

  async deleteTrainer(id) {
    return this.request(`/api/TeacherData/${id}`, {
      method: 'DELETE',
    });
  }

  // بنك الأسئلة
  async getQuestionBank() {
    return this.request('/api/QuestionBankMaster');
  }

  async getQuestionDetails(masterId) {
    if (masterId) {
      return this.request(`/api/QuestionBankDetail/by-master/${masterId}`);
    }
    return this.request('/api/QuestionBankDetail');
  }

  // الشكاوى
  async getComplaints() {
    return this.request('/api/ComplaintsStudent');
  }

  async getComplaintTypes(options = {}) {
    return this.request('/api/ComplaintsType', {}, options);
  }

  async getComplaintStatus(options = {}) {
    return this.request('/api/ComplaintsStatus', {}, options);
  }

  async getComplaintTypesByBranch(branchId) {
    return this.request(`/api/ComplaintsType/branch/${branchId}`);
  }

  async getComplaintsByStudent(studentId) {
    return this.request(`/api/ComplaintsStudent/student/${studentId}`);
  }

  async getComplaintsCountByStatus(statusId, options = {}) {
    return this.request(`/api/ComplaintsStudent/count/${statusId}`, {}, options);
  }

  async createComplaint(formData) {
    return this.request('/api/ComplaintsStudent', {
      method: 'POST',
      body: formData,
    });
  }

  async createComplaintStudent(formData) {
    return this.request('/api/ComplaintsStudent', {
      method: 'POST',
      body: formData,
    });
  }

  // المواقع الجغرافية
  async getCountries() {
    return this.request('/api/CountryCode');
  }

  async getGovernorates(options = {}) {
    return this.request('/api/GovernorateCode', {}, options);
  }

  async getCities(options = {}) {
    return this.request('/api/CityCode', {}, options);
  }

  // الحضور والتقييم
  async getAttendance() {
    return this.request('/api/StudentAttend');
  }

  async getEvaluations() {
    return this.request('/api/StudentEvaluation');
  }

  async getStudentGroups() {
    return this.request('/api/StudentGroup');
  }

  // إنشاء وتحديث بيانات الطالب
  async createStudent(data) {
    // Normalize keys to backend expected PascalCase fields
    const payload = {
      AcademyDataId: data.AcademyDataId ?? data.academyDataId ?? data.academyId,
      BranchesDataId: data.BranchesDataId ?? data.branchesDataId ?? data.branchId,
      StudentNameL1: data.StudentNameL1 ?? data.studentNameL1 ?? data.nameAr ?? '',
      StudentNameL2: data.StudentNameL2 ?? data.studentNameL2 ?? data.nameEn ?? '',
      StudentAddress: data.StudentAddress ?? data.studentAddress ?? data.address ?? '',
      StudentPhone: data.StudentPhone ?? data.studentPhone ?? data.phoneNumber ?? data.StudentMobil ?? data.studentMobil ?? '',
      StudentMobil: data.StudentMobil ?? data.studentMobil ?? data.StudentPhone ?? data.studentPhone ?? data.phoneNumber ?? '',
      StudentWhatsapp: data.StudentWhatsapp ?? data.studentWhatsapp ?? data.whatsapp ?? data.phoneNumber ?? '',
      StudentEmail: data.StudentEmail ?? data.studentEmail ?? data.email ?? '',
    };
    return this.request('/api/StudentData', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async updateStudent(id, data) {
    // Send JSON; backend likely expects application/json for updates
    const payload = { ...data };
    return this.request(`/api/StudentData/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // إنشاء حضور/انصراف
  async createAttendance(data) {
    let studentIdInput = data?.StudentsDataId ?? data?.studentsDataId ?? data?.StudentDataId ?? data?.studentDataId;

    const toNumericId = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && /^\s*\d+\s*$/.test(value)) return Number(value.trim());
      return NaN;
    };

    let numericId = toNumericId(studentIdInput);
    let bestIdentifier = (typeof studentIdInput === 'string' ? studentIdInput.trim() : studentIdInput);

    // If not numeric, try resolving ID by looking up the student list with many possible identifiers
    if (!Number.isFinite(numericId) && studentIdInput) {
      try {
        const list = await this.getStudents({ silent: true }).catch(() => []);
        const arr = Array.isArray(list) ? list : [];
        const match = arr.find((s) => {
          const candidates = [
            s.id, s.Id,
            s.studentsDataId, s.StudentsDataId,
            s.guid, s.Guid,
            s.studentBarCode, s.StudentBarCode,
            s.studentCode, s.StudentCode,
          ];
          return candidates.some((c) => c !== undefined && c !== null && String(c) === String(studentIdInput));
        });
        if (match) {
          const possibleNumerics = [match.id, match.Id, match.studentsDataId, match.StudentsDataId];
          for (const candidate of possibleNumerics) {
            const n = toNumericId(candidate);
            if (Number.isFinite(n)) {
              numericId = n;
              break;
            }
          }
          if (!Number.isFinite(numericId)) {
            const possibleIds = [
              match.id, match.Id,
              match.studentsDataId, match.StudentsDataId,
              match.guid, match.Guid,
              match.studentBarCode, match.StudentBarCode,
              match.studentCode, match.StudentCode,
            ];
            const found = possibleIds.find(v => v !== undefined && v !== null);
            if (found !== undefined && found !== null) {
              bestIdentifier = typeof found === 'string' ? found.trim() : found;
            }
          }
        }
      } catch (_) {}
    }

    // If still not numeric, try fetching single student by provided identifier to resolve numeric Id
    if (!Number.isFinite(numericId) && studentIdInput) {
      try {
        const one = await this.getStudent(studentIdInput).catch(() => null);
        if (one) {
          const possibleNumerics = [one.id, one.Id, one.studentsDataId, one.StudentsDataId];
          for (const candidate of possibleNumerics) {
            const n = toNumericId(candidate);
            if (Number.isFinite(n)) {
              numericId = n;
              break;
            }
          }
          if (!Number.isFinite(numericId)) {
            const possibleIds = [
              one.id, one.Id,
              one.studentsDataId, one.StudentsDataId,
              one.guid, one.Guid,
              one.studentBarCode, one.StudentBarCode,
              one.studentCode, one.StudentCode,
            ];
            const found = possibleIds.find(v => v !== undefined && v !== null);
            if (found !== undefined && found !== null) {
              bestIdentifier = typeof found === 'string' ? found.trim() : found;
            }
          }
        }
      } catch (_) {}
    }

    const finalId = Number.isFinite(numericId)
      ? numericId
      : (bestIdentifier !== undefined && bestIdentifier !== null && String(bestIdentifier).trim() !== '' ? bestIdentifier : null);

    // Optional pre-check: verify student exists before POST
    if (finalId !== null) {
      try { await this.getStudent(finalId); } catch (_) {}
    }

    if (finalId === null) {
      const err = new Error('Student ID not found. Please select a valid student.');
      err.body = JSON.stringify({ type: 'Not Found', title: 'Student.NotFound', status: 404, detail: 'Student ID not found' });
      err.status = 404;
      throw err;
    }

    const dateAttendValue = data?.dateAttend ?? data?.DateAttend;
    const attendAcceptValue = data?.attendAccept ?? data?.AttendAccept;

    // Include multiple casing variants to maximize compatibility
    const payload = {
      studentDataId: finalId,
      StudentDataId: finalId,
      StudentsDataId: finalId,
      dateAttend: dateAttendValue,
      DateAttend: dateAttendValue,
      attendAccept: attendAcceptValue,
      AttendAccept: attendAcceptValue,
    };

    return this.request('/api/StudentAttend', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // إنشاء تقييم
  async createEvaluation(data) {
    const pick = (obj, keys) => keys.find(k => obj[k] !== undefined && obj[k] !== null);
    const get = (obj, keys) => obj[pick(obj, keys) || ''];

    const studentIdInput = get(data || {}, ['studentDataId','StudentDataId','StudentsDataId','studentId','StudentId']);
    const attendanceRateInput = get(data || {}, ['attendanceRate','AttendanceRate']);
    const browsingRateInput = get(data || {}, ['browsingRate','BrowsingRate']);
    const contentRatioInput = get(data || {}, ['contentRatio','ContentRatio']);
    const dateInput = get(data || {}, ['date','Date']);

    const payload = {
      studentDataId: studentIdInput,
      attendanceRate: attendanceRateInput,
      browsingRate: browsingRateInput,
      contentRatio: contentRatioInput,
    };
    if (dateInput) payload.date = dateInput;

    return this.request('/api/StudentEvaluation', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // الدردشة
  async getChatConversations() {
    return this.request('/api/chat/conversations');
  }

  async getChatMessages() {
    return this.request('/api/chat/conversation');
  }

  async getChatHistory() {
    try {
      const response = await this.request('/api/chat/history');
      return response;
    } catch (error) {
      console.log('Chat history not available, using fallback');
      // إرجاع رسائل تجريبية في حالة فشل API
      return [
        {
          id: '1',
          text: 'Hello! How can I help you today?',
          senderIsAgent: true,
          senderDisplayName: 'AI Assistant',
          timestamp: new Date().toISOString()
        }
      ];
    }
  }

  async sendChatMessage(data) {
    // التأكد من وجود جميع الحقول المطلوبة بالـ PascalCase كما يتوقع الـ backend
    const messageData = {
      Text: data.text || '',
      MessageType: data.messageType ?? 0,
      SenderIsAgent: !!data.senderIsAgent,
      SenderDisplayName: data.senderDisplayName || 'User',
      ReceiverDisplayName: data.receiverDisplayName || 'AI Assistant',
      SenderId: data.senderId || ('user-' + Date.now()),
      ReceiverId: data.receiverId || 'ai-assistant'
    };

    return this.request('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // بيانات الأكاديمية
  async getAcademyData() {
    return this.request('/api/AcademyData');
  }

  // دوال إضافية مفقودة من API
  
  // ProjectsDetail
  async getProjectsDetail(options = {}) {
    return this.request('/api/ProjectsDetail', options);
  }

  async getProjectDetail(id) {
    return this.request(`/api/ProjectsDetail/${id}`);
  }

  async createProjectDetail(formData) {
    console.log('createProjectDetail called with:', formData);
    
    // Try JSON first, then fallback to FormData if needed
    try {
      console.log('Attempting to send as JSON first...');
      
      // Try multiple field name variations
      const jsonData = {
        Id: formData.Id && formData.Id !== '' ? formData.Id : undefined,
        ProjectsMasterId: formData.ProjectsMasterId || '',
        ProjectNameL1: formData.ProjectNameL1 || '',
        ProjectNameL2: formData.ProjectNameL2 || '',
        Description: formData.Description || '',
        // Alternative field names that .NET APIs might expect
        projectNameL1: formData.ProjectNameL1 || '',
        projectNameL2: formData.ProjectNameL2 || '',
        description: formData.Description || '',
        projectsMasterId: formData.ProjectsMasterId || ''
      };
      
      console.log('JSON data to send:', jsonData);
      
      const jsonResponse = await this.request('/api/ProjectsDetail', {
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('JSON request successful:', jsonResponse);
      return jsonResponse;
      
    } catch (jsonError) {
      console.log('JSON request failed, trying FormData:', jsonError);
      
      // Fallback to FormData
      const form = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          form.append(key, formData[key]);
          console.log(`Added to FormData: ${key} =`, formData[key]);
        }
      });
      
      // Always add required fields even if empty
      if (!form.has('Id')) form.append('Id', '');
      if (!form.has('ProjectsMasterId')) form.append('ProjectsMasterId', formData.ProjectsMasterId || '');
      if (!form.has('ProjectNameL1')) form.append('ProjectNameL1', formData.ProjectNameL1 || '');
      if (!form.has('Description')) form.append('Description', formData.Description || '');
      
      console.log('Final FormData contents:');
      for (let [key, value] of form.entries()) {
        console.log(`${key}:`, value);
      }
      
      return this.request('/api/ProjectsDetail', {
        method: 'POST',
        body: form,
        headers: {
          // Don't set Content-Type for FormData - let browser handle it automatically
        },
      });
    }
  }

  async updateProjectDetail(id, formData) {
    // First try a safe JSON PUT with only editable fields (exclude keys)
    const updateData = {};
    if (formData.ProjectNameL1 !== undefined) updateData.ProjectNameL1 = formData.ProjectNameL1;
    if (formData.ProjectNameL2 !== undefined) updateData.ProjectNameL2 = formData.ProjectNameL2;
    if (formData.Description !== undefined) updateData.Description = formData.Description;

    try {
      return await this.request(`/api/ProjectsDetail/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      const bodyText = (err && err.body) || '';
      const isMasterNotFound = err?.status === 404 && bodyText.includes('Related master not found');
      const isKeyModification = err?.status === 500 && bodyText.includes("part of a key");

      if (!isMasterNotFound && !isKeyModification) {
        throw err;
      }

      // Fallback: delete then recreate as backend suggests for identifying FK changes
      try {
        await this.deleteProjectDetail(id);
      } catch (_) {
        // ignore delete failure and try create anyway
      }

      // Build create payload with required fields; rely on existing createProjectDetail
      const createPayload = {
        ProjectsMasterId: formData.ProjectsMasterId || formData.projectsMasterId,
        ProjectNameL1: formData.ProjectNameL1,
        ProjectNameL2: formData.ProjectNameL2,
        Description: formData.Description,
      };

      return await this.createProjectDetail(createPayload);
    }
  }

  async deleteProjectDetail(id) {
    return this.request(`/api/ProjectsDetail/${id}`, {
      method: 'DELETE',
    });
  }

  // ProgramsContentMaster
  async getProgramsContentMaster(options = {}) {
    return this.request('/api/ProgramsContentMaster', options);
  }

  async getProgramContentMaster(id) {
    return this.request(`/api/ProgramsContentMaster/${id}`);
  }

  async createProgramContentMaster(formData) {
    console.log('Creating program content master with data:', formData);
    console.log('FormData type:', typeof formData);
    console.log('FormData keys:', Object.keys(formData));
    
    // Try sending as form-urlencoded first, as some .NET APIs expect this format
    const formBody = new URLSearchParams();
    
    // Try multiple field name variations to ensure compatibility
    formBody.append('SessionNameL1', formData.SessionNameL1 || '');
    formBody.append('sessionNameL1', formData.SessionNameL1 || '');
    formBody.append('SessionNameL2', formData.SessionNameL2 || '');
    formBody.append('sessionNameL2', formData.SessionNameL2 || '');
    formBody.append('Description', formData.Description || '');
    formBody.append('description', formData.Description || '');
    
    // Also try without L1/L2 suffix
    formBody.append('SessionName', formData.SessionNameL1 || '');
    formBody.append('sessionName', formData.SessionNameL1 || '');
    
    // Try with different casing variations
    formBody.append('sessionnamel1', formData.SessionNameL1 || '');
    formBody.append('sessionnamel2', formData.SessionNameL2 || '');
    formBody.append('description', formData.Description || '');
    
    // Try with numbers instead of L1/L2
    formBody.append('SessionName1', formData.SessionNameL1 || '');
    formBody.append('SessionName2', formData.SessionNameL2 || '');
    formBody.append('sessionName1', formData.SessionNameL1 || '');
    formBody.append('sessionName2', formData.SessionNameL2 || '');
    
    console.log('Sending form-urlencoded data:', formBody.toString());
    
    try {
      return await this.request('/api/ProgramsContentMaster', {
        method: 'POST',
        body: formBody.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      });
    } catch (error) {
      console.log('Form-urlencoded request failed, trying JSON as fallback:', error);
      
      // If form-urlencoded fails, try JSON
      const jsonData = {
        // Primary field names (PascalCase) - what the API expects
        SessionNameL1: formData.SessionNameL1 || '',
        SessionNameL2: formData.SessionNameL2 || '',
        Description: formData.Description || '',
        
        // Alternative field names (camelCase) - in case the API expects these
        sessionNameL1: formData.SessionNameL1 || '',
        sessionNameL2: formData.SessionNameL2 || '',
        description: formData.Description || '',
        
        // Also try without L1/L2 suffix
        SessionName: formData.SessionNameL1 || '',
        sessionName: formData.SessionNameL1 || ''
      };
      
      console.log('Sending JSON data as fallback:', jsonData);
      
      try {
        return await this.request('/api/ProgramsContentMaster', {
          method: 'POST',
          body: JSON.stringify(jsonData),
          headers: {
            'Content-Type': 'application/json'
          },
        });
      } catch (jsonError) {
        console.log('JSON request also failed, trying FormData as final fallback:', jsonError);
        
        // If JSON fails, fall back to FormData
        if (formData instanceof FormData) {
          console.log('FormData is already FormData, using directly');
          return this.request('/api/ProgramsContentMaster', {
            method: 'POST',
            body: formData,
            headers: {
              // Remove Content-Type to let browser set it for FormData
            },
          });
        }
        
        // Convert formData to FormData for multipart/form-data
        const form = new FormData();
        
        // Add all form fields - don't filter out empty strings as the API might require them
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            form.append(key, formData[key]);
            console.log(`Adding field ${key}: ${formData[key]} (type: ${typeof formData[key]})`);
          } else {
            console.log(`Skipping field ${key}: ${formData[key]} (type: ${typeof formData[key]})`);
          }
        });
        
        // Log what's being sent
        console.log('FormData contents:');
        for (let [key, value] of form.entries()) {
          console.log(`${key}: ${value} (type: ${typeof value})`);
        }
        
        // Also log the raw formData for comparison
        console.log('Raw formData being sent:', JSON.stringify(formData, null, 2));
        
        return this.request('/api/ProgramsContentMaster', {
          method: 'POST',
          body: form,
          headers: {
            // Remove Content-Type to let browser set it for FormData
          },
        });
      }
    }
  }

  async updateProgramContentMaster(id, formData) {
    console.log('Updating program content master with ID:', id);
    console.log('Update formData:', formData);
    console.log('FormData keys:', Object.keys(formData));
    
    // Send clean data with primary field names - EXCLUDE the id field
    const updateData = {
      SessionNameL1: formData.SessionNameL1 || '',
      SessionNameL2: formData.SessionNameL2 || '',
      Description: formData.Description || ''
    };
    
    // Only add other fields if they exist and are not null/undefined
    if (formData.ProgramsDetailsId) {
      updateData.ProgramsDetailsId = formData.ProgramsDetailsId;
    }
    if (formData.SessionNo) {
      updateData.SessionNo = formData.SessionNo;
    }
    
    // IMPORTANT: Remove the id field to prevent Entity Framework errors
    delete updateData.id;
    delete updateData.Id;
    
    console.log('Sending update data:', updateData);
    console.log('SessionNameL1 value:', updateData.SessionNameL1);
    console.log('Raw updateData being sent:', JSON.stringify(updateData, null, 2));
    
    // Try multiple approaches in sequence
    try {
      // First try: form-urlencoded with PUT
      console.log('Trying form-urlencoded PUT...');
      const formBody = new URLSearchParams();
      Object.keys(updateData).forEach(key => {
        formBody.append(key, updateData[key]);
      });
      
      return await this.request(`/api/ProgramsContentMaster/${id}`, {
        method: 'PUT',
        body: formBody.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (error1) {
      console.log('Form-urlencoded PUT failed, trying POST...', error1);
      
      try {
        // Second try: form-urlencoded with POST
        console.log('Trying form-urlencoded POST...');
        const formBody = new URLSearchParams();
        Object.keys(updateData).forEach(key => {
          formBody.append(key, updateData[key]);
        });
        
        return await this.request(`/api/ProgramsContentMaster/${id}`, {
          method: 'POST',
          body: formBody.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (error2) {
        console.log('Form-urlencoded POST failed, trying JSON...', error2);
        
        try {
          // Third try: JSON with PUT
          console.log('Trying JSON PUT...');
          return await this.request(`/api/ProgramsContentMaster/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (error3) {
          console.log('JSON PUT failed, trying PATCH...', error3);
          
          try {
            // Fourth try: JSON with PATCH
            console.log('Trying JSON PATCH...');
            return await this.request(`/api/ProgramsContentMaster/${id}`, {
              method: 'PATCH',
              body: JSON.stringify(updateData),
              headers: {
                'Content-Type': 'application/json'
              }
            });
          } catch (error4) {
            console.log('JSON PATCH failed, trying wrapped JSON...', error4);
            
            try {
              // Fifth try: Wrapped JSON (some .NET APIs expect this)
              console.log('Trying wrapped JSON...');
              const wrappedData = {
                ProgramsContentMaster: updateData,  // Use the exact model name from the error
                id: id,
                model: 'ProgramsContentMaster'
              };
              
              return await this.request(`/api/ProgramsContentMaster/${id}`, {
                method: 'PUT',
                body: JSON.stringify(wrappedData),
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            } catch (error5) {
              console.log('Wrapped JSON failed, trying query parameters...', error5);
              
              try {
                // Sixth try: query parameters
                console.log('Trying query parameters...');
                const queryParams = new URLSearchParams();
                Object.keys(updateData).forEach(key => {
                  queryParams.append(key, updateData[key]);
                });
                
                const url = `/api/ProgramsContentMaster/${id}?${queryParams.toString()}`;
                console.log('Query parameters URL:', url);
                
                return await this.request(url, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });
              } catch (error6) {
                console.log('Query parameters failed, trying DELETE + CREATE approach...', error6);
                
                try {
                  // Seventh try: DELETE + CREATE approach (workaround for Entity Framework issues)
                  console.log('Trying DELETE + CREATE approach...');
                  
                  // First, delete the existing entity
                  console.log('Deleting existing entity...');
                  await this.request(`/api/ProgramsContentMaster/${id}`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  // Then create a new one with the updated data
                  console.log('Creating new entity with updated data...');
                  return await this.createProgramContentMaster(updateData);
                  
                } catch (error7) {
                  console.log('DELETE + CREATE approach failed, trying different field names...', error7);
                  
                  try {
                    // Eighth try: Different field name variations
                    console.log('Trying different field name variations...');
                    const alternativeData = {
                      sessionNameL1: updateData.SessionNameL1,
                      sessionNameL2: updateData.SessionNameL2,
                      description: updateData.Description,
                      sessionName: updateData.SessionNameL1,
                      sessionName1: updateData.SessionNameL1,
                      sessionName2: updateData.SessionNameL2
                    };
                    
                    if (updateData.ProgramsDetailsId) {
                      alternativeData.programsDetailsId = updateData.ProgramsDetailsId;
                    }
                    if (updateData.SessionNo) {
                      alternativeData.sessionNo = updateData.SessionNo;
                    }
                    
                    console.log('Trying with alternative field names:', alternativeData);
                    
                    return await this.request(`/api/ProgramsContentMaster/${id}`, {
                      method: 'PUT',
                      body: JSON.stringify(alternativeData),
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    });
                  } catch (error8) {
                    console.log('Alternative field names failed, trying direct POST to root endpoint...', error8);
                    
                    try {
                      // Ninth try: POST to root endpoint with ID in body
                      console.log('Trying POST to root endpoint with ID in body...');
                      const postData = {
                        ...updateData,
                        id: id  // Include ID in body for POST
                      };
                      
                      return await this.request('/api/ProgramsContentMaster', {
                        method: 'POST',
                        body: JSON.stringify(postData),
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      });
                    } catch (error9) {
                      console.log('All update approaches failed:', error9);
                      throw new Error(`Failed to update program after trying 9 different approaches. Last error: ${error9.message}`);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  async deleteProgramContentMaster(id, options = {}) {
    // إذا كانت هناك خيارات حذف قسري، نضيفها كمعاملات query
    let endpoint = `/api/ProgramsContentMaster/${id}`;
    
    if (options && Object.keys(options).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      endpoint += `?${queryParams.toString()}`;
    }
    
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // ProgramsContentDetail
  async getProgramsContentDetail(options = {}) {
    return this.request('/api/ProgramsContentDetail', options);
  }

  async getProgramContentDetail(id) {
    return this.request(`/api/ProgramsContentDetail/${id}`);
  }

  async createProgramContentDetail(formData) {
    // Per API spec, this endpoint expects multipart/form-data
    // Always build a fresh FormData and map accepted fields with correct casing
    const form = new FormData();

    const mapped = {
      ProgramsContentMasterId: formData?.ProgramsContentMasterId || formData?.programsContentMasterId,
      Title: formData?.Title || formData?.title || formData?.Description || formData?.description, // Map Title or fallback to Description
      SessionTasks: formData?.SessionTasks || formData?.sessionTasks,
      SessionProject: formData?.SessionProject || formData?.sessionProject,
      ScientificMaterial: formData?.ScientificMaterial || formData?.scientificMaterial,
      SessionVideo: formData?.SessionVideo || formData?.sessionVideo,
      SessionQuiz: formData?.SessionQuiz || formData?.sessionQuiz,
      Description: formData?.Description || formData?.description, // Keep Description as well for backend
    };

    Object.entries(mapped).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        form.append(key, value);
      }
    });

    return this.request('/api/ProgramsContentDetail', {
      method: 'POST',
      body: form,
      headers: {
        // Let the browser set the correct multipart boundary
      },
    });
  }

  async updateProgramContentDetail(id, formData) {
    // Per API spec, this endpoint expects multipart/form-data
    // Build FormData and include only provided fields
    const form = new FormData();

    // Map accepted fields; do NOT include id in body (it's in the path)
    const fields = {
      ProgramsContentMasterId: formData?.ProgramsContentMasterId,
      SessionTasks: formData?.SessionTasks,
      SessionProject: formData?.SessionProject,
      ScientificMaterial: formData?.ScientificMaterial,
      SessionVideo: formData?.SessionVideo,
      SessionQuiz: formData?.SessionQuiz,
      Description: formData?.Description
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        form.append(key, value);
      }
    });
    
    return this.request(`/api/ProgramsContentDetail/${id}`, {
      method: 'PUT',
      body: form,
      headers: {
        // Let the browser set the correct multipart boundary
      }
    });
  }

  async deleteProgramContentDetail(id) {
    return this.request(`/api/ProgramsContentDetail/${id}`, {
      method: 'DELETE',
    });
  }

  // Additional endpoints for specific resources
  async getProgramContentDetailTasks(id) {
    return this.request(`/api/ProgramsContentDetail/${id}/tasks`);
  }

  async getProgramContentDetailProject(id) {
    return this.request(`/api/ProgramsContentDetail/${id}/project`);
  }

  async getProgramContentDetailMaterial(id) {
    return this.request(`/api/ProgramsContentDetail/${id}/material`);
  }

  async getProgramContentDetailQuiz(id) {
    return this.request(`/api/ProgramsContentDetail/${id}/quiz`);
  }

  // Courses
  async getCourses(options = {}) {
    return this.request('/api/AcademyClaseDetail', options);
  }

  async getCourse(id) {
    return this.request(`/api/AcademyClaseDetail/${id}`);
  }

  async createCourse(formData) {
    // If already FormData, use directly; else wrap in FormData
    const body = formData instanceof FormData ? formData : (() => {
    const form = new FormData();
      if (formData && typeof formData === 'object') {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            form.append(key, value);
      }
    });
      }
      return form;
    })();
    
    return this.request('/api/AcademyClaseDetail', {
      method: 'POST',
      body,
      headers: {
        // Let browser set multipart boundary
      },
    });
  }

  async updateCourse(id, formData) {
    const body = formData instanceof FormData ? formData : (() => {
    const form = new FormData();
      if (formData && typeof formData === 'object') {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            form.append(key, value);
      }
    });
      }
      return form;
    })();
    
    return this.request(`/api/AcademyClaseDetail/${id}`, {
      method: 'PUT',
      body,
      headers: {
        // Let browser set multipart boundary
      },
    });
  }

  async deleteCourse(id) {
    return this.request(`/api/AcademyClaseDetail/${id}`, {
      method: 'DELETE',
    });
  }

  // دوال إضافية مفقودة من API
  
  // QuestionBank
  async getQuestionBankMaster(options = {}) {
    return this.request('/api/QuestionBankMaster', {}, options);
  }

  async getQuestionBankMasterById(id) {
    return this.request(`/api/QuestionBankMaster/${id}`);
  }

  async createQuestionBankMaster(formData) {
    return this.request('/api/QuestionBankMaster', {
      method: 'POST',
      body: formData,
    });
  }

  async updateQuestionBankMaster(id, formData) {
    return this.request(`/api/QuestionBankMaster/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteQuestionBankMaster(id) {
    return this.request(`/api/QuestionBankMaster/${id}`, {
      method: 'DELETE',
    });
  }

  async getQuestionBankDetail(options = {}) {
    return this.request('/api/QuestionBankDetail', {}, options);
  }

  async getQuestionBankDetailById(id) {
    return this.request(`/api/QuestionBankDetail/${id}`);
  }

  async createQuestionBankDetail(formData) {
    return this.request('/api/QuestionBankDetail', {
      method: 'POST',
      body: formData,
    });
  }

  async updateQuestionBankDetail(id, formData) {
    return this.request(`/api/QuestionBankDetail/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteQuestionBankDetail(id) {
    return this.request(`/api/QuestionBankDetail/${id}`, {
      method: 'DELETE',
    });
  }

  // StudentGroup
  async getStudentGroups(options = {}) {
    return this.request('/api/StudentGroup', {}, options);
  }

  async getStudentGroupById(id) {
    return this.request(`/api/StudentGroup/${id}`);
  }

  async createStudentGroup(formData) {
    return this.request('/api/StudentGroup', {
      method: 'POST',
      body: formData,
    });
  }

  async updateStudentGroup(id, formData) {
    return this.request(`/api/StudentGroup/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteStudentGroup(id) {
    return this.request(`/api/StudentGroup/${id}`, {
      method: 'DELETE',
    });
  }

  // EduContactResult
  async getEduContactResults(options = {}) {
    return this.request('/api/EduContactResult', {}, options);
  }

  async getEduContactResultById(id) {
    return this.request(`/api/EduContactResult/${id}`);
  }

  async createEduContactResult(formData) {
    return this.request('/api/EduContactResult', {
      method: 'POST',
      body: formData,
    });
  }

  async updateEduContactResult(id, formData) {
    return this.request(`/api/EduContactResult/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteEduContactResult(id) {
    return this.request(`/api/EduContactResult/${id}`, {
      method: 'DELETE',
    });
  }

  // Complaints
  async getComplaints(options = {}) {
    return this.request('/api/ComplaintsStudent', {}, options);
  }

  async getComplaintById(id) {
    return this.request(`/api/ComplaintsStudent/${id}`);
  }

  async createComplaint(formData) {
    return this.request('/api/ComplaintsStudent', {
      method: 'POST',
      body: formData,
    });
  }

  async updateComplaint(id, formData) {
    console.log('updateComplaint called with:', { id, formData });
    console.log('formData type:', typeof formData);
    console.log('formData instanceof FormData:', formData instanceof FormData);
    
    // If formData is not FormData, convert it to FormData
    let finalFormData = formData;
    if (!(formData instanceof FormData)) {
      console.log('Converting data to FormData');
      finalFormData = new FormData();
      
      // Add all fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          finalFormData.append(key, formData[key]);
        }
      });
    }
    
    console.log('Final FormData to send:', finalFormData);
    
    return this.request(`/api/ComplaintsStudent/${id}`, {
      method: 'PUT',
      body: finalFormData,
    });
  }

  async deleteComplaint(id) {
    return this.request(`/api/ComplaintsStudent/${id}`, {
      method: 'DELETE',
    });
  }

  // ComplaintsType
  async getComplaintsTypes(options = {}) {
    return this.request('/api/ComplaintsType', {}, options);
  }

  async getComplaintTypeById(id) {
    return this.request(`/api/ComplaintsType/${id}`);
  }

  async createComplaintType(data) {
    return this.request('/api/ComplaintsType', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComplaintType(id, data) {
    return this.request(`/api/ComplaintsType/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteComplaintType(id) {
    return this.request(`/api/ComplaintsType/${id}`, {
      method: 'DELETE',
    });
  }

  async getCompanyComplaintTypes(companyId) {
    return this.request(`/api/ComplaintsType/company/${companyId}`);
  }

  async getBranchComplaintTypes(branchId) {
    return this.request(`/api/ComplaintsType/branch/${branchId}`);
  }

  async checkComplaintTypeExists(name) {
    return this.request('/api/ComplaintsType/exists', {}, { params: { name } });
  }

  // Complaint Statuses API
  async getComplaintStatus(options = {}) {
    return this.request('/api/ComplaintsStatus', {}, options);
  }

  async getComplaintStatusById(id) {
    return this.request(`/api/ComplaintsStatus/${id}`);
  }

  async createComplaintStatus(data) {
    return this.request('/api/ComplaintsStatus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComplaintStatus(id, data) {
    return this.request(`/api/ComplaintsStatus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteComplaintStatus(id) {
    return this.request(`/api/ComplaintsStatus/${id}`, {
      method: 'DELETE',
    });
  }

  // دوال عامة للـ API
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      method: 'POST', 
      body: typeof data === 'string' ? data : JSON.stringify(data),
      ...options 
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      method: 'PUT', 
      body: typeof data === 'string' ? data : JSON.stringify(data),
      ...options 
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      method: 'PATCH', 
      body: typeof data === 'string' ? data : JSON.stringify(data),
      ...options 
    });
  }
}

export default new ApiService();