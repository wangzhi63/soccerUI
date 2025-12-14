import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface OAuthConfig {
  google: {
    clientId: string;
    redirectUri: string;
    scope: string;
  };
  apple: {
    clientId: string;
    redirectUri: string;
    scope: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private config: OAuthConfig = {
    google: {
      clientId: '443871161397-v0qjsfpbbmsgd5uhl0at7ie5u1dmps7i.apps.googleusercontent.com',
      redirectUri: window.location.origin + '/betting/login',
      scope: 'openid profile email'
    },
    apple: {
      clientId: 'YOUR_APPLE_CLIENT_ID',
      redirectUri: window.location.origin + '/betting/login',
      scope: 'name email'
    }
  };

  constructor(private http: HttpClient) {}

  /**
   * Initiate Google OAuth login
   */
  loginWithGoogle(): void {
    const params = new URLSearchParams({
      client_id: this.config.google.clientId,
      redirect_uri: this.config.google.redirectUri,
      response_type: 'token id_token',
      scope: this.config.google.scope,
      nonce: this.generateNonce()
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Initiate Apple OAuth login
   */
  loginWithApple(): void {
    const params = new URLSearchParams({
      client_id: this.config.apple.clientId,
      redirect_uri: this.config.apple.redirectUri,
      response_type: 'code id_token',
      scope: this.config.apple.scope,
      response_mode: 'form_post',
      state: this.generateNonce()
    });

    const authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Parse OAuth callback from URL hash
   */
  parseOAuthCallback(): any {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    return {
      accessToken: params.get('access_token'),
      idToken: params.get('id_token'),
      expiresIn: params.get('expires_in'),
      tokenType: params.get('token_type')
    };
  }

  /**
   * Verify OAuth token with backend
   */
  verifyOAuthToken(provider: string, token: string): Observable<any> {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api/auth/oauth'
      : 'https://crkgob67va.execute-api.us-east-1.amazonaws.com/Prod/api/auth/oauth';
    
    return this.http.post(apiUrl, {
      provider,
      token
    });
  }

  /**
   * Generate random nonce for OAuth security
   */
  private generateNonce(): string {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, num => num.toString(36)).join('');
  }
}
