import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDotnetService {

  constructor(private http: HttpClient) {}

  // ============================================================
  // .NET User Service Backend API
  // ============================================================
  //
  // LOCAL DEVELOPMENT:
  // Use this URL when running the .NET backend locally.
  //
  // private url = 'http://localhost:5228/api/users';
  //
  // PRODUCTION / RENDER:
  // The deployed .NET User Service is running on Render.
  // This is the active URL used by the Angular application.
  //
  private url = 'https://dotnet-user-service-latest.onrender.com/api/users';

  // ============================================================
  // Get all users
  // ============================================================
  fetchUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  // ============================================================
  // Get one user by ID
  // ============================================================
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  // ============================================================
  // Create a new user
  // ============================================================
  postUser(body: any): Observable<any> {
    return this.http.post<any>(this.url, body);
  }

  // ============================================================
  // Update an existing user
  // ============================================================
  putUser(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, body);
  }

  // ============================================================
  // Delete a user
  // ============================================================
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
