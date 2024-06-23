import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  // Define the URL for the API endpoint
  url = "http://localhost:8000/api/tasks/";

  // Fetch tasks from the server and return an Observable of an array of tasks
  fetchTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  // Post a new task to the server and return an Observable of the response
  postTask(body: any): Observable<any> {
    return this.http.post<any>(this.url, body);
  }

  // Delete a task by its ID on the server and return an Observable of the response
  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(this.url + id + "/");
  }

  // Update an existing task on the server and return an Observable of the response
  putTask(id: number, body: any): Observable<any> {
    return this.http.put<any>(this.url + id + "/", body);
  }
}
