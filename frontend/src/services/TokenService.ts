import Cookies from 'js-cookie';

export class TokenService {
  private static ACCESS_TOKEN_KEY = 'accessToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';

  static setTokens(accessToken: string, refreshToken: string): void {
    // Lưu token vào cookie với domain và path
    Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, {
      expires: 1/48, // 30 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined
    });
    
    Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined
    });
  }

  static getAccessToken(): string | null {
    try {
      return Cookies.get(this.ACCESS_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      return Cookies.get(this.REFRESH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }

  static removeTokens(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY, {
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined
    });
    Cookies.remove(this.REFRESH_TOKEN_KEY, {
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined
    });
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
} 