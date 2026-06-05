import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MobileService {

  constructor(private http: HttpClient) { }

  // Backend API base URL
  private url = "http://localhost:5000/mobiles";

  /**
   * Fetch all mobiles.
   * Handles cases when the backend returns an empty dataset.
   */
  fetchMobiles(): Observable<any[]> {
    return this.http.get<any[]>(this.url).pipe(
      // Catch and handle errors globally for this request
      catchError(this.handleError)
    );
  }

  /**
   * Delete a mobile by ID.
   * Handles scenarios where the resource does not exist.
   * @param id - Mobile ID to be deleted.
   */
  deleteMobile(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`).pipe(
      // Catch and handle errors globally for this request
      catchError(this.handleError)
    );
  }

  /**
   * Add a new mobile.
   * Prevents duplicate entries based on backend validation.
   * @param body - Mobile data to be added (name, price, ram, storage).
   */
  postMobile(body: any): Observable<any> {
    return this.http.post<any>(this.url, body).pipe(
      // Catch and handle errors globally for this request
      catchError(this.handleError)
    );
  }

  /**
   * Update a mobile by ID.
   * Handles scenarios where the resource does not exist.
   * @param id - Mobile ID to be updated.
   * @param body - New mobile data to update.
   */
  putMobile(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, body).pipe(
      // Catch and handle errors globally for this request
      catchError(this.handleError)
    );
  }

  /**
   * Centralized error handler for HTTP requests.
   * Maps backend error codes to user-friendly error messages.
   * @param error - The HTTP error response from the server.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!'; // Default error message

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error (e.g., no internet)
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error (response from backend)
      switch (error.status) {
        case 404: // Resource not found
          errorMessage = 'Resource not found!';
          break;
        case 400: // Bad request (e.g., invalid data)
          errorMessage = error.error.message || 'Invalid request data!';
          break;
        case 409: // Conflict (e.g., duplicate entry)
          errorMessage = 'Duplicate entry detected!';
          break;
        default: // Generic server error
          errorMessage = `Server-side error: ${error.message || 'Unknown issue'}`;
          break;
      }
    }

    // Return the error message wrapped in an Observable
    return throwError(() => new Error(errorMessage));
  }
}
