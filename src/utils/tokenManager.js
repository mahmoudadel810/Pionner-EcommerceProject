// Token Management Utility for User Control

export const tokenManager = {
  // Get all available tokens
  getAllTokens() {
    const tokens = {
      localStorage: {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken')
      },
      sessionStorage: {
        accessToken: sessionStorage.getItem('accessToken'),
        refreshToken: sessionStorage.getItem('refreshToken')
      },
      cookies: {
        accessToken: this.getCookie('accessToken'),
        refreshToken: this.getCookie('refreshToken')
      }
    };
    
    return tokens;
  },

  // Get cookie value
  getCookie(name) {
    return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
  },

  // Set token in multiple storages
  setToken(name, value) {
    localStorage.setItem(name, value);
    sessionStorage.setItem(name, value);
    // Note: Cookies are set by server, not client
  },

  // Remove token from all storages
  removeToken(name) {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
    // Note: Cookies are cleared by server
  },

  // Clear all tokens
  clearAllTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  },

  // Check if user is authenticated
  isAuthenticated() {
    const accessToken = localStorage.getItem('accessToken') || 
                       sessionStorage.getItem('accessToken') ||
                       this.getCookie('accessToken');
    return !!accessToken;
  },

  // Get current access token (from any source)
  getAccessToken() {
    return localStorage.getItem('accessToken') || 
           sessionStorage.getItem('accessToken') ||
           this.getCookie('accessToken');
  },

  // Get current refresh token (from any source)
  getRefreshToken() {
    return localStorage.getItem('refreshToken') || 
           sessionStorage.getItem('refreshToken') ||
           this.getCookie('refreshToken');
  },

  // Decode JWT token (for debugging)
  decodeToken(token) {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },

  // Get token info for display
  getTokenInfo() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    return {
      isAuthenticated: this.isAuthenticated(),
      accessToken: accessToken ? {
        value: accessToken,
        decoded: this.decodeToken(accessToken),
        expiresAt: this.decodeToken(accessToken)?.exp ? new Date(this.decodeToken(accessToken).exp * 1000) : null
      } : null,
      refreshToken: refreshToken ? {
        value: refreshToken,
        decoded: this.decodeToken(refreshToken),
        expiresAt: this.decodeToken(refreshToken)?.exp ? new Date(this.decodeToken(refreshToken).exp * 1000) : null
      } : null,
      allTokens: this.getAllTokens()
    };
  }
};

export default tokenManager; 