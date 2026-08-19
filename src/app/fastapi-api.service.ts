import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mobile {
  id?: number;
  name: string;
  price: number;
  ram: string;
  storage: string;
}

@Injectable({
  providedIn: 'root'
})
export class FastapiApiService {

  private apiUrl = 'https://fastapi-rest-api.onrender.com/mobiles';


  constructor(private http: HttpClient) { }

  // GET all mobiles
  getMobiles(): Observable<Mobile[]> {
    return this.http.get<Mobile[]>(`${this.apiUrl}/`);
  }

  // GET one mobile
  getMobile(id: number): Observable<Mobile> {
    return this.http.get<Mobile>(`${this.apiUrl}/${id}`);
  }

  // CREATE mobile
  createMobile(mobile: Mobile): Observable<Mobile> {
    return this.http.post<Mobile>(`${this.apiUrl}/`, mobile);
  }

  // UPDATE mobile
  updateMobile(id: number, mobile: Mobile): Observable<Mobile> {
    return this.http.put<Mobile>(`${this.apiUrl}/${id}`, mobile);
  }

  // DELETE mobile
  deleteMobile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
