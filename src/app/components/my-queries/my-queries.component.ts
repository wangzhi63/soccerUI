import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { QueryService, QueryResult } from '../../services/query.service';

@Component({
  selector: 'app-my-queries',
  templateUrl: './my-queries.component.html',
  styleUrls: ['./my-queries.component.scss']
})
export class MyQueriesComponent implements OnInit {
  user: User | null = null;
  queries: any[] = [];
  selectedQuery: any = null;
  queryResult: QueryResult | null = null;
  matches: string[] = [];
  selectedMatch: string = '';
  parameterValues: { [key: string]: string } = {};
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private queryService: QueryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.userService.currentUserValue;
    
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserQueries();
    this.loadMatches();
  }

  loadUserQueries(): void {
    if (!this.user) return;

    this.loading = true;
    this.userService.getUserQueries(this.user.user_id).subscribe({
      next: (queries) => {
        this.queries = queries;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load queries: ' + err.message;
        this.loading = false;
      }
    });
  }

  loadMatches(): void {
    this.queryService.listMatches().subscribe({
      next: (matches) => {
        this.matches = matches;
      },
      error: (err) => {
        console.error('Failed to load matches:', err);
      }
    });
  }

  selectQuery(query: any): void {
    this.selectedQuery = query;
    this.queryResult = null;
    this.error = null;
    
    // Initialize parameter values
    this.parameterValues = {};
    if (query.parameters && query.parameters.length > 0) {
      query.parameters.forEach((param: string) => {
        this.parameterValues[param] = '';
      });
    }
  }

  executeQuery(): void {
    if (!this.selectedQuery) return;

    this.loading = true;
    this.error = null;

    const options: any = {
      limit: 50
    };

    if (this.selectedMatch) {
      options.match_id = this.selectedMatch;
    }

    // Add parameters if the query has them
    if (this.selectedQuery.parameters && this.selectedQuery.parameters.length > 0) {
      options.parameters = {};
      for (const param of this.selectedQuery.parameters) {
        options.parameters[param] = this.parameterValues[param] || '';
      }
    }

    this.queryService.executeQuery(this.selectedQuery.name, options).subscribe({
      next: (result) => {
        this.queryResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to execute query: ' + err.message;
        this.loading = false;
      }
    });
  }

  removeQuery(queryName: string): void {
    if (!this.user) return;

    if (confirm(`Remove "${queryName}" from your collection?`)) {
      this.userService.removeQueryFromCollection(this.user.user_id, queryName).subscribe({
        next: () => {
          this.queries = this.queries.filter(q => q.name !== queryName);
          if (this.selectedQuery?.name === queryName) {
            this.selectedQuery = null;
            this.queryResult = null;
          }
        },
        error: (err) => {
          this.error = 'Failed to remove query: ' + err.message;
        }
      });
    }
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  getTagColor(tag: string): string {
    const colors: { [key: string]: string } = {
      'goals': 'success',
      'passing': 'info',
      'dribbling': 'warning',
      'tactics': 'primary',
      'messi': 'danger',
      'generic': 'secondary'
    };
    return colors[tag] || 'secondary';
  }

  getResultKeys(): string[] {
    if (!this.queryResult || this.queryResult.results.length === 0) {
      return [];
    }
    return this.extractKeys(this.queryResult.results[0]).filter(key => key !== '_id');
  }

  private extractKeys(obj: any, prefix: string = ''): string[] {
    let keys: string[] = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys = keys.concat(this.extractKeys(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
    }
    return keys;
  }

  formatValue(result: any, key: string): any {
    const keys = key.split('.');
    let value = result;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value);
    return value;
  }
}
