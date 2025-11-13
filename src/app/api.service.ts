/**
 * Fetches a limited list of products from the fake store API.
 * @param limit - The maximum number of products to retrieve.
 * @returns An Observable that emits an array of products or throws a user-friendly error message.
 * @throws Error with a descriptive message if the request fails or network is unavailable.
 */
// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://fakestoreapi.com/products';

  constructor(private http: HttpClient) {}

  getData(limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?limit=${limit}`).pipe(
      catchError((error) => {
        // Log for debugging
        console.error('API request failed:', error);

        // Custom error message for component
        let errorMsg = '';
        if (!navigator.onLine) {
          errorMsg = 'No internet connection. Please check your network.';
        } else {
          errorMsg = 'Backend unavailable. Please try again later.';
        }

        // Throw readable error for component
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}

// ✅ What this does:

// Catches network or HTTP errors.

// Checks if you’re offline (navigator.onLine).

// Passes a user-friendly error message to the component.
