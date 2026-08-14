// Angular dependency injection support.
import { Injectable } from '@angular/core';

// Angular HTTP client for communicating with the local Java backend.
import { HttpClient } from '@angular/common/http';

// Observable represents asynchronous HTTP responses.
import { Observable } from 'rxjs';


// ============================================================
// JAVA USER MODEL
// ============================================================

// Represents a user returned from or sent to the Java backend.
export interface JavaUser {

  // ID is optional because a newly created user does not
  // have an ID before the Java backend/database generates it.
  id?: number;

  // Username stored in the Java SQLite database.
  username: string;

  // Email stored in the Java SQLite database.
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
  // LOCAL JAVA SPRING BOOT API
  // ============================================================

  // Local Angular development communicates with the
  // locally running Java Spring Boot backend.
  //
  // Angular
  //    ↓
  // Java Spring Boot :8080
  //    ↓
  // SQLite
  //
  // Local Java API:
  // http://localhost:8080/api/users
  //
  // IMPORTANT:
  // This is intentionally LOCAL ONLY for the current
  // feature-development and end-to-end testing phase.

  private readonly apiUrl =
  'https://java-springboot-user-backend.onrender.com/api/users';


  // ============================================================
  // HTTP CLIENT
  // ============================================================

  constructor(
    private http: HttpClient
  ) { }


  // ============================================================
  // GET ALL USERS
  // ============================================================

  // Fetch all users from the local Java Spring Boot backend.
  //
  // HTTP:
  // GET /api/users

  getUsers(): Observable<JavaUser[]> {

    return this.http.get<JavaUser[]>(
      this.apiUrl
    );
  }


  // ============================================================
  // GET ONE USER
  // ============================================================

  // Fetch one user using its ID.
  //
  // HTTP:
  // GET /api/users/{id}

  getUser(id: number): Observable<JavaUser> {

    return this.http.get<JavaUser>(
      `${this.apiUrl}/${id}`
    );
  }


  // ============================================================
  // CREATE USER
  // ============================================================

  // Create a new user in the local Java backend.
  //
  // HTTP:
  // POST /api/users
  //
  // Request body:
  // {
  //   "username": "Alice",
  //   "email": "alice@example.com"
  // }

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
  //
  // HTTP:
  // PUT /api/users/{id}

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

  // Delete an existing user.
  //
  // HTTP:
  // DELETE /api/users/{id}
  //
  // Java backend returns:
  // 204 No Content

  deleteUser(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}