import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BettingService } from '../../../services/betting.service';
import { OAuthService } from '../../../services/oauth.service';

@Component({
  selector: 'app-betting-login',
  templateUrl: './betting-login.component.html',
  styleUrls: ['./betting-login.component.scss']
})
export class BettingLoginComponent implements OnInit {
  isLoginMode = true;
  email = '';
  password = '';
  username = '';
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private bettingService: BettingService,
    private oauthService: OAuthService,
    private router: Router
  ) {
    // If already logged in, redirect to shop
    if (this.bettingService.isAuthenticated()) {
      this.router.navigate(['/betting/shop']);
    }
  }

  ngOnInit(): void {
    // Check if returning from OAuth callback
    this.handleOAuthCallback();
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
    this.successMessage = null;
  }

  onSubmit(): void {
    this.error = null;
    this.successMessage = null;
    this.loading = true;

    if (this.isLoginMode) {
      this.bettingService.login(this.email, this.password).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Login successful!';
          setTimeout(() => {
            this.router.navigate(['/betting/shop']);
          }, 1000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.error || 'Login failed';
        }
      });
    } else {
      this.bettingService.register(this.email, this.password, this.username).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Registration successful! You received 1000 chips!';
          setTimeout(() => {
            this.router.navigate(['/betting/shop']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.error || 'Registration failed';
        }
      });
    }
  }

  /**
   * Handle OAuth callback from Google/Apple
   */
  handleOAuthCallback(): void {
    const oauthData = this.oauthService.parseOAuthCallback();
    
    if (oauthData.idToken) {
      this.loading = true;
      this.successMessage = 'Verifying your account...';
      
      // Determine provider from token
      const provider = 'google'; // You can enhance this to detect Apple vs Google
      
      this.oauthService.verifyOAuthToken(provider, oauthData.idToken).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Login successful!';
          
          // Store auth data
          localStorage.setItem('bettingToken', response.token);
          localStorage.setItem('bettingUser', JSON.stringify(response.user));
          
          // Clear URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
          
          setTimeout(() => {
            this.router.navigate(['/betting/shop']);
          }, 1000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.error || 'OAuth verification failed';
          
          // Clear URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }

  /**
   * Login with Google OAuth
   */
  loginWithGoogle(): void {
    this.oauthService.loginWithGoogle();
  }

  /**
   * Login with Apple OAuth
   */
  loginWithApple(): void {
    this.oauthService.loginWithApple();
  }
}
