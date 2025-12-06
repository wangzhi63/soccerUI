import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  name: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    // If already logged in, redirect to my queries
    if (this.userService.currentUserValue) {
      this.router.navigate(['/my-queries']);
    }
  }

  login(): void {
    if (!this.email) {
      this.error = 'Please enter your email';
      return;
    }

    this.loading = true;
    this.error = '';

    this.userService.login(this.email, this.name || undefined).subscribe({
      next: (user) => {
        console.log('Logged in:', user);
        this.router.navigate(['/my-queries']);
      },
      error: (err) => {
        this.error = 'Login failed: ' + err.message;
        this.loading = false;
      }
    });
  }
}
