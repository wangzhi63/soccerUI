import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueryExplorerComponent } from './components/query-explorer/query-explorer.component';
import { LoginComponent } from './components/login/login.component';
import { MyQueriesComponent } from './components/my-queries/my-queries.component';
import { CardShopComponent } from './components/betting/card-shop/card-shop.component';
import { WalletComponent } from './components/betting/wallet/wallet.component';
import { MyCardsComponent } from './components/betting/my-cards/my-cards.component';
import { BettingTableComponent } from './components/betting/betting-table/betting-table.component';
import { LeaderboardComponent } from './components/betting/leaderboard/leaderboard.component';
import { BettingLoginComponent } from './components/betting/betting-login/betting-login.component';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { BettingLayoutComponent } from './layouts/betting-layout/betting-layout.component';

const routes: Routes = [
  // Default route - redirect to betting for regular users
  { path: '', redirectTo: '/betting/login', pathMatch: 'full' },
  
  // Admin section - wrapped in admin layout
  { 
    path: 'admin', 
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'queries', component: QueryExplorerComponent },
      { path: 'my-queries', component: MyQueriesComponent }
    ]
  },
  
  // Betting section - wrapped in betting layout
  { 
    path: 'betting', 
    component: BettingLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: BettingLoginComponent },
      { path: 'shop', component: CardShopComponent },
      { path: 'wallet', component: WalletComponent },
      { path: 'cards', component: MyCardsComponent },
      { path: 'tables', component: BettingTableComponent },
      { path: 'leaderboard', component: LeaderboardComponent }
    ]
  },
  
  // Legacy routes - redirect to new structure
  { path: 'login', redirectTo: '/admin/login', pathMatch: 'full' },
  { path: 'queries', redirectTo: '/admin/queries', pathMatch: 'full' },
  { path: 'my-queries', redirectTo: '/admin/my-queries', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
