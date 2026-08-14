import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Angular_Test_App';

  // =========================================================
  // Initial system status
  // =========================================================

  systemStatus = '🟡 System Warming Up';
  statusColor = 'yellow-status';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    // =========================================================
    // Flask API
    // =========================================================
    // Flask backend health endpoint
    // If the request succeeds, Flask is considered UP.
    // If the request fails, catchError returns null.
    // =========================================================

    const flaskApi = this.http
      .get('https://flask-restapi-tzdm.onrender.com/')
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // Django API
    // =========================================================
    // Django backend tasks endpoint
    // If the request succeeds, Django is considered UP.
    // =========================================================

    const djangoApi = this.http
      .get('https://django-restapi-r7yj.onrender.com/api/tasks/')
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // ASP.NET Core .NET 9 API
    // =========================================================
    // ASP.NET Core backend health endpoint
    // If the request succeeds, .NET is considered UP.
    // =========================================================

    const dotnetApi = this.http
      .get('https://dotnet-user-service-latest.onrender.com/health')
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // Java Spring Boot API
    // =========================================================
    // Spring Boot Actuator health endpoint
    // If the request succeeds, Java Spring Boot is considered UP.
    //
    // Your Java backend root URL:
    // https://java-springboot-user-backend.onrender.com/
    //
    // Health check endpoint:
    // /actuator/health
    // =========================================================

    const javaApi = this.http
      .get(
        'https://java-springboot-user-backend.onrender.com/actuator/health'
      )
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // Check all four backend services
    // =========================================================
    // forkJoin waits for all four API requests to complete.
    // Each API returns either:
    //   - actual response -> service is UP
    //   - null            -> service is DOWN
    // =========================================================

    forkJoin({
      flask: flaskApi,
      django: djangoApi,
      java: javaApi,
      dotnet: dotnetApi,
    }).subscribe({

      // =======================================================
      // All API requests completed
      // =======================================================

      next: (response) => {

        // -----------------------------------------------------
        // Check Flask
        // -----------------------------------------------------

        const flaskIsRunning =
          response.flask !== null;


        // -----------------------------------------------------
        // Check Django
        // -----------------------------------------------------

        const djangoIsRunning =
          response.django !== null;


        // -----------------------------------------------------
        // Check Java Spring Boot
        // -----------------------------------------------------

        const javaIsRunning =
          response.java !== null;


        // -----------------------------------------------------
        // Check ASP.NET Core
        // -----------------------------------------------------

        const dotnetIsRunning =
          response.dotnet !== null;


        // =====================================================
        // ALL FOUR SERVICES ARE RUNNING
        // =====================================================

        if (
          flaskIsRunning &&
          djangoIsRunning &&
          javaIsRunning &&
          dotnetIsRunning
        ) {

          this.systemStatus = '🟢 System Ready';

          this.statusColor = 'green-status';

        } else {

          // ===================================================
          // One or more services are unavailable
          // ===================================================

          this.systemStatus = '🔴 System Offline';

          this.statusColor = 'red-status';
        }
      },


      // =======================================================
      // Unexpected error while checking services
      // =======================================================

      error: () => {

        this.systemStatus = '🔴 System Offline';

        this.statusColor = 'red-status';
      },
    });
  }
}