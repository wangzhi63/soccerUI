import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QueryPattern {
  name: string;
  type?: string; // 'pipeline' or 'python'
  description: string;
  tags: string[];
  parameters: string[] | any[]; // Can be simple strings or parameter objects for python queries
  pipeline?: any[];
  python_code?: string; // For python queries
  lambda_arn?: string; // For python queries
  created_at?: Date;
}

export interface QueryResult {
  query_name: string;
  query_type?: string;
  count?: number;
  result_count?: number;
  results?: any[];
  error?: string;
  python_code?: string;
  lambda_response?: any;
}

export interface ExecuteOptions {
  match_id?: string;
  parameters?: { [key: string]: any };
  limit?: number;
}

export interface NaturalQueryResult {
  query: string;
  explanation: string;
  confidence: number;
  pipeline: any[];
  results?: any[];
  count?: number;
  mock?: boolean;
  error?: string;
  execution_error?: string;
  similar_queries?: { name: string; description: string; tags: string[] }[];
  saved_as?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  // Use localhost for development, Lambda for production
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api'
    : 'https://hi5z21yq40.execute-api.us-east-1.amazonaws.com/Prod/api';

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

  /**
   * Execute natural language query
   */
  naturalQuery(query: string, options: { matchId?: string, execute?: boolean, limit?: number } = {}): Observable<NaturalQueryResult> {
    return this.http.post<NaturalQueryResult>(`${this.apiUrl}/queries/natural`, {
      query: query,
      match_id: options.matchId,
      execute: options.execute !== false,
      limit: options.limit || 100
    });
  }

  /**
   * Save a query pattern
   */
  saveQuery(query: { name: string; description: string; pipeline: any[]; tags?: string[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/queries`, query);
  }

  /**
   * Search for similar queries
   */
  searchQueries(query: string): Observable<{ matches: QueryPattern[]; count: number }> {
    return this.http.post<{ matches: QueryPattern[]; count: number }>(`${this.apiUrl}/queries/search`, { query });
  }

  /**
   * Save a manually entered pipeline query
   */
  saveManualQuery(data: { 
    description: string; 
    pipeline: any[]; 
    execute?: boolean;
    based_on?: string;
    tags?: string[];
    name?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/queries/manual`, data);
  }

  /**
   * Delete a query by name
   */
  deleteQuery(name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/queries/${name}`);
  }
}
