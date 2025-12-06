import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QueryPattern {
  name: string;
  description: string;
  tags: string[];
  parameters: string[];
  pipeline?: any[];
  created_at?: Date;
}

export interface QueryResult {
  query_name: string;
  count: number;
  results: any[];
}

export interface ExecuteOptions {
  match_id?: string;
  parameters?: { [key: string]: any };
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  private apiUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient) { }

  /**
   * Get all query patterns
   */
  listQueries(tag?: string): Observable<QueryPattern[]> {
    const url = tag ? `${this.apiUrl}/queries?tag=${tag}` : `${this.apiUrl}/queries`;
    return this.http.get<QueryPattern[]>(url);
  }

  /**
   * Get a specific query pattern
   */
  getQuery(name: string): Observable<QueryPattern> {
    return this.http.get<QueryPattern>(`${this.apiUrl}/queries/${name}`);
  }

  /**
   * Execute a query pattern
   */
  executeQuery(name: string, options: ExecuteOptions = {}): Observable<QueryResult> {
    return this.http.post<QueryResult>(
      `${this.apiUrl}/queries/${name}/execute`,
      options
    );
  }

  /**
   * Get all available match IDs
   */
  listMatches(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/matches`);
  }

  /**
   * Get database statistics
   */
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
