import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Card {
  cardId: number;
  cardName: string;
  queryName: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseMultiplier: number;
  chipCost: number;
  isTradeable: boolean;
  isAvailable: boolean;
  quantity?: number;
  acquiredAt?: string;
}

export interface WalletBalance {
  chipBalance: number;
  totalEarned: number;
  totalSpent: number;
  updatedAt: string;
}

export interface BettingTable {
  tableId: number;
  matchId: string;
  matchName?: string;
  matchDate?: string;
  status: 'open' | 'closed' | 'settled';
  totalBetsPlaced: number;
  totalChipsWagered: number;
  openedAt: string;
  closedAt?: string;
  settledAt?: string;
}

export interface Bet {
  betId: number;
  wagerAmount: number;
  multiplier: number;
  potentialPayout: number;
  actualPayout: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  isWinningCard: boolean;
  placedAt: string;
  settledAt?: string;
  card: {
    name: string;
    queryName: string;
    rarity: string;
  };
  table: {
    tableId: number;
    matchId: string;
    matchName: string;
    status: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BettingService {
  // Lambda API endpoint (use localhost:3000 for local development)
  private apiUrl = 'https://crkgob67va.execute-api.us-east-1.amazonaws.com/Prod/api';
  private walletBalanceSubject = new BehaviorSubject<WalletBalance | null>(null);
  public walletBalance$ = this.walletBalanceSubject.asObservable();

  constructor(public http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('bettingToken');
    if (!token) {
      console.warn('No betting token found. Please login to the betting system.');
      console.log('Available localStorage keys:', Object.keys(localStorage));
    } else {
      console.log('Using betting token:', token.substring(0, 20) + '...');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Auth methods
  register(email: string, password: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { email, password, username }).pipe(
      tap((response: any) => {
        if (response.success && response.data.token) {
          localStorage.setItem('bettingToken', response.data.token);
          localStorage.setItem('bettingUser', JSON.stringify(response.data.user));
        }
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.success && response.data.token) {
          localStorage.setItem('bettingToken', response.data.token);
          localStorage.setItem('bettingUser', JSON.stringify(response.data.user));
          this.refreshWalletBalance();
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('bettingToken');
    localStorage.removeItem('bettingUser');
    this.walletBalanceSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('bettingToken');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('bettingUser');
    return user ? JSON.parse(user) : null;
  }

  // Card Shop
  getShopCards(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cards/shop`);
  }

  purchaseCard(cardId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/cards/purchase`,
      { cardId },
      { headers: this.getHeaders() }
    ).pipe(tap(() => this.refreshWalletBalance()));
  }

  getUserCards(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/cards/user/inventory`,
      { headers: this.getHeaders() }
    );
  }

  // Wallet
  getWalletBalance(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/wallet/balance`,
      { headers: this.getHeaders() }
    ).pipe(
      tap((response: any) => {
        if (response.success) {
          this.walletBalanceSubject.next(response.data);
        }
      })
    );
  }

  refreshWalletBalance(): void {
    this.getWalletBalance().subscribe();
  }

  getTransactions(limit: number = 50): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/wallet/transactions?limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Betting
  getBettingTables(status: string = 'open'): Observable<any> {
    return this.http.get(`${this.apiUrl}/betting/tables?status=${status}`);
  }

  createBettingTable(matchId: string, matchName: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/betting/tables`,
      { matchId, matchName },
      { headers: this.getHeaders() }
    );
  }

  placeBet(tableId: number, cardId: number, wagerAmount: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/betting/place-bet`,
      { tableId, cardId, wagerAmount },
      { headers: this.getHeaders() }
    ).pipe(tap(() => this.refreshWalletBalance()));
  }

  getMyBets(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/betting/my-bets`,
      { headers: this.getHeaders() }
    );
  }

  settleBets(tableId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/betting/tables/${tableId}/settle`,
      {},
      { headers: this.getHeaders() }
    ).pipe(tap(() => this.refreshWalletBalance()));
  }

  // Leaderboard
  getLeaderboard(sortBy: string = 'net_profit', limit: number = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaderboard?sortBy=${sortBy}&limit=${limit}`);
  }

  getMyRank(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/leaderboard/my-rank`,
      { headers: this.getHeaders() }
    );
  }

  // Helper methods
  getRarityColor(rarity: string): string {
    switch (rarity.toLowerCase()) {
      case 'common': return 'secondary';
      case 'rare': return 'primary';
      case 'epic': return 'warning';
      case 'legendary': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'won': return 'success';
      case 'lost': return 'danger';
      case 'pending': return 'warning';
      case 'cancelled': return 'secondary';
      case 'open': return 'success';
      case 'closed': return 'warning';
      case 'settled': return 'info';
      default: return 'secondary';
    }
  }
}
