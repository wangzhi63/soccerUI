import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BettingService, Card, WalletBalance } from '../../../services/betting.service';

@Component({
  selector: 'app-card-shop',
  templateUrl: './card-shop.component.html',
  styleUrls: ['./card-shop.component.scss']
})
export class CardShopComponent implements OnInit {
  cards: Card[] = [];
  walletBalance: WalletBalance | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  filterRarity: string = 'all';

  constructor(
    private bettingService: BettingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.bettingService.isAuthenticated()) {
      this.error = 'Please login to access the betting game';
      setTimeout(() => {
        this.router.navigate(['/betting/login']);
      }, 2000);
      return;
    }

    this.loadShopCards();
    this.loadWalletBalance();
  }

  loadShopCards(): void {
    this.loading = true;
    this.error = null;
    
    this.bettingService.getShopCards().subscribe({
      next: (response) => {
        this.cards = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load cards';
        this.loading = false;
        console.error(error);
      }
    });
  }

  loadWalletBalance(): void {
    this.bettingService.walletBalance$.subscribe(balance => {
      this.walletBalance = balance;
    });
    this.bettingService.refreshWalletBalance();
  }

  get filteredCards(): Card[] {
    if (this.filterRarity === 'all') {
      return this.cards;
    }
    return this.cards.filter(card => card.rarity === this.filterRarity);
  }

  purchaseCard(card: Card): void {
    if (!this.walletBalance || this.walletBalance.chipBalance < card.chipCost) {
      this.error = 'Insufficient chips!';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.bettingService.purchaseCard(card.cardId).subscribe({
      next: (response) => {
        this.successMessage = `Successfully purchased ${card.cardName}!`;
        this.loading = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.error = error.error?.error || 'Failed to purchase card';
        this.loading = false;
      }
    });
  }

  getRarityColor(rarity: string): string {
    return this.bettingService.getRarityColor(rarity);
  }

  canAfford(card: Card): boolean {
    return this.walletBalance ? this.walletBalance.chipBalance >= card.chipCost : false;
  }
}
