import { Component, OnInit } from '@angular/core';
import { BettingService } from '../../../services/betting.service';

interface LeaderboardEntry {
  userId: number;
  email: string;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  netProfit: number;
  winRate: number;
  currentStreak: number;
  longestWinStreak: number;
}

interface UserRank {
  rank: number;
  totalPlayers: number;
  stats: LeaderboardEntry;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];
  userRank: UserRank | null = null;
  loading = false;
  error: string | null = null;
  sortBy: 'netProfit' | 'winRate' | 'totalWins' = 'netProfit';

  constructor(private bettingService: BettingService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
    this.loadUserRank();
  }

  loadLeaderboard(): void {
    this.loading = true;
    this.error = null;

    this.bettingService.getLeaderboard(this.sortBy).subscribe({
      next: (response) => {
        this.leaderboard = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load leaderboard';
        this.loading = false;
        console.error(error);
      }
    });
  }

  loadUserRank(): void {
    this.bettingService.getMyRank().subscribe({
      next: (response) => {
        this.userRank = response.data;
      },
      error: (error) => {
        console.error('Failed to load user rank', error);
      }
    });
  }

  onSortChange(): void {
    this.loadLeaderboard();
  }

  getRankBadgeClass(rank: number): string {
    if (rank === 1) return 'bg-warning text-dark';
    if (rank === 2) return 'bg-secondary';
    if (rank === 3) return 'bg-info';
    return 'bg-primary';
  }

  formatWinRate(winRate: number): string {
    return (winRate * 100).toFixed(1) + '%';
  }

  isCurrentUser(email: string): boolean {
    return this.userRank?.stats.email === email;
  }
}
