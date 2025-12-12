import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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

@NgModule({
  declarations: [
    AppComponent,
    QueryExplorerComponent,
    LoginComponent,
    MyQueriesComponent,
    CardShopComponent,
    WalletComponent,
    MyCardsComponent,
    BettingTableComponent,
    LeaderboardComponent,
    BettingLoginComponent,
    AdminLayoutComponent,
    BettingLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
