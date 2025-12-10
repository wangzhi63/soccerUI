import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BettingService } from '../../../services/betting.service';

@Component({
  selector: 'app-betting-login',
  templateUrl: './betting-login.component.html',
  styleUrls: ['./betting-login.component.scss']
})
export class BettingLoginComponent {
  isLoginMode = true;
  email = '';
  password = '';
  username = '';
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private bettingService: BettingService,
    private router: Router
  ) {
    // If already logged in, redirect to shop
    if (this.bettingService.isAuthenticated()) {
      this.router.navigate(['/betting/shop']);
    }
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
}
