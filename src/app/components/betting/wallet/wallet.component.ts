import { Component, OnInit } from '@angular/core';
import { BettingService, WalletBalance } from '../../../services/betting.service';

interface Transaction {
  transactionId: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  referenceId: number;
  referenceType: string;
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  walletBalance: WalletBalance | null = null;
  transactions: Transaction[] = [];
  loading = false;
  error: string | null = null;
  Math = Math; // Make Math available in template

  constructor(private bettingService: BettingService) {}

  ngOnInit(): void {
    this.loadWalletBalance();
    this.loadTransactions();
  }

  loadWalletBalance(): void {
    this.bettingService.walletBalance$.subscribe(balance => {
      this.walletBalance = balance;
    });
    this.bettingService.refreshWalletBalance();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;

    this.bettingService.getTransactions().subscribe({
      next: (response) => {
        this.transactions = response.data.transactions || response.data;
        console.log('Loaded transactions:', this.transactions);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load transactions';
        this.loading = false;
        console.error(error);
      }
    });
  }

  getTransactionClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'deposit': 'table-success',
      'bet_won': 'table-success',
      'bet_placed': 'table-warning',
      'card_purchase': 'table-info',
      'bet_lost': 'table-danger'
    };
    return typeMap[type] || '';
  }

  getTransactionSign(type: string): string {
    return ['deposit', 'bet_won'].includes(type) ? '+' : '-';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
