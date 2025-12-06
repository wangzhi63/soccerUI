import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueryExplorerComponent } from './components/query-explorer/query-explorer.component';
import { LoginComponent } from './components/login/login.component';
import { MyQueriesComponent } from './components/my-queries/my-queries.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'queries', component: QueryExplorerComponent },
  { path: 'my-queries', component: MyQueriesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
