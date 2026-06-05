import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  url = "http://localhost:8080/users"

  fetchUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(this.url + "/" + id);
  }

  postUser(body: any): Observable<any> {
    return this.http.post<any>(this.url, body);
  }

  putUser(id: number, body: any): Observable<any> {
    return this.http.put<any>(this.url + "/" + id, body);
  }
}
