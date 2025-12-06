import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  user_id: string;
  email: string;
  name: string;
  provider: string;
  saved_queries: string[];
  created_at?: Date;
  last_login?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5001/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Load user from localStorage if exists
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login with email (auto-creates user if doesn't exist)
   */
  login(email: string, name?: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, { email, name })
      .pipe(
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Get user's saved queries with full details
   */
  getUserQueries(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/queries`);
  }

  /**
   * Add query to user's collection
   */
  addQueryToCollection(userId: string, queryName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/queries`, { query_name: queryName })
      .pipe(
        tap(() => {
          // Update local user object
          const user = this.currentUserValue;
          if (user && !user.saved_queries.includes(queryName)) {
            user.saved_queries.push(queryName);
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  /**
   * Remove query from user's collection
   */
  removeQueryFromCollection(userId: string, queryName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}/queries/${queryName}`)
      .pipe(
        tap(() => {
          // Update local user object
          const user = this.currentUserValue;
          if (user) {
            user.saved_queries = user.saved_queries.filter(q => q !== queryName);
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  /**
   * Check if query is in user's collection
   */
  isQuerySaved(queryName: string): boolean {
    const user = this.currentUserValue;
    return user ? user.saved_queries.includes(queryName) : false;
  }
}
