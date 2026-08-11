import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDotnetService {

  constructor(private http: HttpClient) {}

  // .NET User Service backend API
  // Local development URL from launchSettings.json
  private url = 'http://localhost:5228/api/users'; // http://localhost:5228/api/users

  // Get all users
  fetchUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  // Get one user by ID
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  // Create a new user
  postUser(body: any): Observable<any> {
    return this.http.post<any>(this.url, body);
  }

  // Update an existing user
  putUser(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, body);
  }

  // Delete a user
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}