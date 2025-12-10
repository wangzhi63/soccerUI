import { Component, OnInit } from '@angular/core';
import { BettingService, BettingTable, Bet, Card } from '../../../services/betting.service';

interface UserCard extends Card {
  quantity: number;
}

@Component({
  selector: 'app-betting-table',
  templateUrl: './betting-table.component.html',
  styleUrls: ['./betting-table.component.scss']
})
export class BettingTableComponent implements OnInit {
  bettingTables: BettingTable[] = [];
  myBets: Bet[] = [];
  userCards: UserCard[] = [];
  matches: string[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Bet placement form
  selectedTable: BettingTable | null = null;
  selectedCard: UserCard | null = null;
  wagerAmount: number = 0;

  // Create table form
  showCreateForm = false;
  newTableMatchId: string = '';
  newTableMatchName: string = '';

  constructor(private bettingService: BettingService) {}

  ngOnInit(): void {
    this.loadBettingTables();
    this.loadMyBets();
    this.loadUserCards();
    this.loadMatches();
  }

  loadMatches(): void {
    // Load available matches from Flask API
    this.bettingService.http.get<string[]>('http://localhost:5001/api/matches').subscribe({
      next: (matches) => {
        this.matches = matches;
      },
      error: (error) => {
        console.error('Failed to load matches', error);
      }
    });
  }

  loadBettingTables(): void {
    this.loading = true;
    this.error = null;

    this.bettingService.getBettingTables().subscribe({
      next: (response) => {
        this.bettingTables = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load betting tables';
        this.loading = false;
        console.error(error);
      }
    });
  }

  loadMyBets(): void {
    this.bettingService.getMyBets().subscribe({
      next: (response) => {
        this.myBets = response.data;
        console.log('Loaded bets:', this.myBets);
      },
      error: (error) => {
        console.error('Failed to load bets', error);
      }
    });
  }

  loadUserCards(): void {
    this.bettingService.getUserCards().subscribe({
      next: (response) => {
        this.userCards = response.data;
      },
      error: (error) => {
        console.error('Failed to load cards', error);
      }
    });
  }

  selectTable(table: BettingTable): void {
    this.selectedTable = table;
    this.selectedCard = null;
    this.wagerAmount = 0;
  }

  selectCard(card: UserCard): void {
    this.selectedCard = card;
  }

  createBettingTable(): void {
    if (!this.newTableMatchId) {
      this.error = 'Please select a match';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.bettingService.createBettingTable(
      this.newTableMatchId,
      this.newTableMatchName || `Match ${this.newTableMatchId}`
    ).subscribe({
      next: (response) => {
        this.successMessage = 'Betting table created successfully!';
        this.loading = false;
        this.showCreateForm = false;
        this.newTableMatchId = '';
        this.newTableMatchName = '';
        this.loadBettingTables();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.error = error.error?.error || 'Failed to create betting table';
        this.loading = false;
      }
    });
  }

  get potentialPayout(): number {
    if (!this.selectedCard || !this.wagerAmount) return 0;
    return Math.floor(this.wagerAmount * this.selectedCard.baseMultiplier);
  }

  placeBet(): void {
    if (!this.selectedTable || !this.selectedCard || !this.wagerAmount) {
      this.error = 'Please select a table, card, and wager amount';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.bettingService.placeBet(
      this.selectedTable.tableId,
      this.selectedCard.cardId,
      this.wagerAmount
    ).subscribe({
      next: (response) => {
        this.successMessage = 'Bet placed successfully!';
        this.loading = false;
        this.selectedTable = null;
        this.selectedCard = null;
        this.wagerAmount = 0;
        this.loadMyBets();
        this.loadUserCards();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.error = error.error?.error || 'Failed to place bet';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    return this.bettingService.getStatusColor(status);
  }

  getRarityColor(rarity: string): string {
    return this.bettingService.getRarityColor(rarity);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  settleTable(tableId: number): void {
    if (!confirm('Are you sure you want to settle this table? This will execute all queries and determine winners.')) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.bettingService.settleBets(tableId).subscribe({   
      next: (response) => {
        const settledCount = response.data.settledBets.length;
        const wonCount = response.data.settledBets.filter((b: any) => b.status === 'won').length;
        this.successMessage = `✅ Settled ${settledCount} bets! ${wonCount} won, ${settledCount - wonCount} lost.`;
        this.loading = false;
        this.loadBettingTables();
        this.loadMyBets();
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (error) => {
        this.error = error.error?.error || 'Failed to settle bets';
        this.loading = false;
      }
    });
  }
}
