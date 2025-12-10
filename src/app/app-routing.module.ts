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

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'queries', component: QueryExplorerComponent },
  { path: 'my-queries', component: MyQueriesComponent },
  { path: 'betting/login', component: BettingLoginComponent },
  { path: 'betting/shop', component: CardShopComponent },
  { path: 'betting/wallet', component: WalletComponent },
  { path: 'betting/cards', component: MyCardsComponent },
  { path: 'betting/tables', component: BettingTableComponent },
  { path: 'betting/leaderboard', component: LeaderboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
