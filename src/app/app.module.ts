import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QueryExplorerComponent } from './components/query-explorer/query-explorer.component';
import { LoginComponent } from './components/login/login.component';
import { MyQueriesComponent } from './components/my-queries/my-queries.component';

@NgModule({
  declarations: [
    AppComponent,
    QueryExplorerComponent,
    LoginComponent,
    MyQueriesComponent
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
