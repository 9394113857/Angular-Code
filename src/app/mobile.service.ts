import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MobileService {

  constructor(private http: HttpClient) { }

  // url = "http://localhost:5000/mobiles"

     url = "http://127.0.0.1:5000/mobiles"

     fetchMobiles(): Observable<any[]> {
      return this.http.get<any[]>(this.url).pipe(
        catchError((error: any) => {
          console.error('Error fetching mobiles:', error);
          return throwError(() => new Error('Failed to fetch mobiles from server'));
        })
      );
    }
    

  deleteMobile(id: number): Observable<any> {
    return this.http.delete<any>(this.url + "/" + id);
  }

  postMobile(body: any): Observable<any> {
    return this.http.post<any>(this.url, body);
  }

  putMobile(id: number, body: any): Observable<any> {
    return this.http.put<any>(this.url + "/" + id, body);
  }
}
