import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-betting-layout',
  templateUrl: './betting-layout.component.html',
  styleUrls: ['./betting-layout.component.scss']
})
export class BettingLayoutComponent {

  constructor(private router: Router) {}

  logout(): void {
    // Clear betting-specific local storage keys
    localStorage.removeItem('bettingToken');
    localStorage.removeItem('bettingUser');
    localStorage.removeItem('walletBalance');
    
    // Also clear any other token keys for safety
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    // Force page reload to clear any cached state
    window.location.href = '/betting/login';
  }

}
