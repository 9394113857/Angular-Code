import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Mobile {
  id?: number | null;
  name: string;
  price: number;
  ram: number;
  storage: number;
}

@Injectable({
  providedIn: 'root'
})
export class MobileService {

  private baseUrl = "http://localhost:5000/mobiles";

  constructor(private http: HttpClient) {}

  fetchMobiles(): Observable<Mobile[]> {
    return this.http.get<Mobile[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  postMobile(body: Mobile): Observable<any> {
    return this.http.post(this.baseUrl, body)
      .pipe(catchError(this.handleError));
  }

  putMobile(id: number, body: Mobile): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, body)
      .pipe(catchError(this.handleError));
  }

  deleteMobile(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Something went wrong';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = `Error ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(message));
  }
}