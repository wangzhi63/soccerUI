import { Component, OnInit } from '@angular/core';
import { BettingService, Card } from '../../../services/betting.service';

interface UserCard extends Card {
  quantity: number;
  acquiredAt: string;
}

@Component({
  selector: 'app-my-cards',
  templateUrl: './my-cards.component.html',
  styleUrls: ['./my-cards.component.scss']
})
export class MyCardsComponent implements OnInit {
  cards: UserCard[] = [];
  loading = false;
  error: string | null = null;
  filterRarity: string = 'all';

  constructor(private bettingService: BettingService) {}

  ngOnInit(): void {
    this.loadUserCards();
  }

  loadUserCards(): void {
    this.loading = true;
    this.error = null;

    this.bettingService.getUserCards().subscribe({
      next: (response) => {
        this.cards = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load your cards';
        this.loading = false;
        console.error(error);
      }
    });
  }

  get filteredCards(): UserCard[] {
    if (this.filterRarity === 'all') {
      return this.cards;
    }
    return this.cards.filter(card => card.rarity === this.filterRarity);
  }

  get totalCards(): number {
    return this.cards.reduce((sum, card) => sum + card.quantity, 0);
  }

  getRarityColor(rarity: string): string {
    return this.bettingService.getRarityColor(rarity);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
