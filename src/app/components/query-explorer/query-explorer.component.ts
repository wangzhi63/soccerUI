import { Component, OnInit } from '@angular/core';
import { QueryService, QueryPattern, QueryResult } from '../../services/query.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-query-explorer',
  templateUrl: './query-explorer.component.html',
  styleUrls: ['./query-explorer.component.scss']
})
export class QueryExplorerComponent implements OnInit {
  queries: QueryPattern[] = [];
  selectedQuery: QueryPattern | null = null;
  queryResult: QueryResult | null = null;
  matches: string[] = [];
  selectedMatch: string = '';
  loading = false;
  error: string | null = null;
  stats: any = null;
  parameterValues: { [key: string]: string } = {};
  showPipeline: boolean = false;
  showCode: boolean = false; // For Python query code display

  constructor(
    private queryService: QueryService,
    public userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadQueries();
    this.loadMatches();
    this.loadStats();
  }

  loadQueries(): void {
    this.loading = true;
    this.queryService.listQueries().subscribe({
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

  loadStats(): void {
    this.queryService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  selectQuery(query: QueryPattern): void {
    this.queryResult = null;
    this.error = null;
    this.showPipeline = false;
    
    // Fetch full query details including pipeline
    this.loading = true;
    this.queryService.getQuery(query.name).subscribe({
      next: (fullQuery) => {
        this.selectedQuery = fullQuery;
        this.loading = false;
        
        // Initialize parameter values
        this.parameterValues = {};
        if (fullQuery.parameters && fullQuery.parameters.length > 0) {
          fullQuery.parameters.forEach(param => {
            this.parameterValues[param] = '';
          });
        }
      },
      error: (err) => {
        this.error = 'Failed to load query details: ' + err.message;
        this.loading = false;
      }
    });
  }

  togglePipeline(): void {
    this.showPipeline = !this.showPipeline;
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
        const paramName = this.getParamName(param);
        // Allow empty parameters - backend will treat as wildcard
        options.parameters[paramName] = this.parameterValues[paramName] || '';
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

  // Helper methods for handling both string and object parameters
  getParamName(param: any): string {
    return typeof param === 'string' ? param : param.name;
  }

  getParamLabel(param: any): string {
    const name = this.getParamName(param);
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getParamType(param: any): string {
    if (typeof param === 'string') return 'text';
    const type = param.type?.toLowerCase() || 'text';
    if (type === 'boolean') return 'checkbox';
    if (type === 'number' || type === 'integer') return 'number';
    return 'text';
  }

  getParamRequired(param: any): boolean {
    return typeof param === 'object' && param.required === true;
  }

  getResultKeys(): string[] {
    if (!this.queryResult || !this.queryResult.results || this.queryResult.results.length === 0) {
      return [];
    }
    
    // Get all unique keys from the first result
    const firstResult = this.queryResult.results[0];
    return this.extractKeys(firstResult).filter(key => key !== '_id');
  }

  private extractKeys(obj: any, prefix: string = ''): string[] {
    let keys: string[] = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          // Nested object - flatten it
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
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return value;
  }

  saveToCollection(queryName: string): void {
    const user = this.userService.currentUserValue;
    if (!user) {
      alert('Please login to save queries to your collection');
      return;
    }

    this.userService.addQueryToCollection(user.user_id, queryName).subscribe({
      next: () => {
        alert(`Added "${queryName}" to your collection!`);
      },
      error: (err) => {
        alert('Failed to save query: ' + err.message);
      }
    });
  }

  deleteQuery(queryName: string): void {
    if (!confirm(`Are you sure you want to delete query "${queryName}"?`)) {
      return;
    }

    this.loading = true;
    this.queryService.deleteQuery(queryName).subscribe({
      next: () => {
        alert(`Query "${queryName}" deleted successfully!`);
        // Clear selected query if it was the deleted one
        if (this.selectedQuery?.name === queryName) {
          this.selectedQuery = null;
          this.queryResult = null;
        }
        // Reload the queries list
        this.loadQueries();
        this.loadStats(); // Update stats as well
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to delete query';
        alert('Error: ' + this.error);
      }
    });
  }

  isQuerySaved(queryName: string): boolean {
    return this.userService.isQuerySaved(queryName);
  }
}
