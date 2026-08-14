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
    // Flask backend health endpoint.
    // Success  -> Flask is UP.
    // Failure  -> Flask is DOWN.
    // =========================================================

    const flaskApi = this.http
      .get('https://flask-restapi-tzdm.onrender.com/')
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // Django API
    // =========================================================
    // Django backend tasks endpoint.
    // Success  -> Django is UP.
    // Failure  -> Django is DOWN.
    // =========================================================

    const djangoApi = this.http
      .get('https://django-restapi-r7yj.onrender.com/api/tasks/')
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // ASP.NET Core .NET 9 API
    // =========================================================
    // ASP.NET Core health endpoint.
    // Success  -> .NET is UP.
    // Failure  -> .NET is DOWN.
    // =========================================================

    const dotnetApi = this.http
      .get('https://dotnet-user-service-latest.onrender.com/health')
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // Java Spring Boot API
    // =========================================================
    // Spring Boot Actuator health endpoint.
    //
    // Success  -> Java is UP.
    // Failure  -> Java is DOWN.
    //
    // Java backend:
    // https://java-springboot-user-backend.onrender.com/
    //
    // Health endpoint:
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
    // CHECK ALL FOUR BACKEND SERVICES
    // =========================================================
    //
    // forkJoin waits until all four requests complete.
    //
    // Each request returns:
    //
    //   Actual response -> Service is UP
    //   null            -> Service is DOWN
    //
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
        // Flask status
        // -----------------------------------------------------

        const flaskIsRunning =
          response.flask !== null;


        // -----------------------------------------------------
        // Django status
        // -----------------------------------------------------

        const djangoIsRunning =
          response.django !== null;


        // -----------------------------------------------------
        // Java Spring Boot status
        // -----------------------------------------------------

        const javaIsRunning =
          response.java !== null;


        // -----------------------------------------------------
        // ASP.NET Core status
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
          // ONE OR MORE SERVICES ARE UNAVAILABLE
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