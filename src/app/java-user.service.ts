// Angular dependency injection support.
import { Injectable } from '@angular/core';

// Angular HTTP client for communicating with the Java backend.
import { HttpClient } from '@angular/common/http';

// Observable represents asynchronous HTTP responses.
import { Observable } from 'rxjs';


// ============================================================
// JAVA USER MODEL
// ============================================================

// Represents a user returned from or sent to the Java backend.
export interface JavaUser {

  // ID is optional because a newly created user does not have an ID yet.
  id?: number;

  // Username stored in the Java backend.
  username: string;

  // Email stored in the Java backend.
  email: string;
}


// ============================================================
// JAVA USER SERVICE
// ============================================================

@Injectable({
  providedIn: 'root'
})
export class JavaUserService {


  // ============================================================
  // DEPLOYED JAVA SPRING BOOT API
  // ============================================================

  // Render deployed Java Spring Boot backend.
  //
  // Angular
  //    ↓
  // Java Spring Boot
  //    ↓
  // Supabase PostgreSQL
  //
  private readonly apiUrl =
    'https://java-springboot-user-backend-latest.onrender.com/api/users';


  // ============================================================
  // HTTP CLIENT
  // ============================================================

  constructor(
    private http: HttpClient
  ) {}


  // ============================================================
  // GET ALL USERS
  // ============================================================

  // Fetch all users from the Java Spring Boot backend.
  getUsers(): Observable<JavaUser[]> {

    return this.http.get<JavaUser[]>(
      this.apiUrl
    );
  }


  // ============================================================
  // GET ONE USER
  // ============================================================

  // Fetch one user using its ID.
  getUser(id: number): Observable<JavaUser> {

    return this.http.get<JavaUser>(
      `${this.apiUrl}/${id}`
    );
  }


  // ============================================================
  // CREATE USER
  // ============================================================

  // Create a new user in the Java backend.
  createUser(user: JavaUser): Observable<JavaUser> {

    return this.http.post<JavaUser>(
      this.apiUrl,
      user
    );
  }


  // ============================================================
  // UPDATE USER
  // ============================================================

  // Update an existing user.
  updateUser(
    id: number,
    user: JavaUser
  ): Observable<JavaUser> {

    return this.http.put<JavaUser>(
      `${this.apiUrl}/${id}`,
      user
    );
  }


  // ============================================================
  // DELETE USER
  // ============================================================

  // Delete an existing user using its ID.
  deleteUser(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}