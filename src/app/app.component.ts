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
  // Overall system status
  // =========================================================

  systemStatus = '🟡 Checking System...';
  statusColor = 'yellow-status';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    // =========================================================
    // FLASK REST API
    // =========================================================
    //
    // Endpoint:
    // https://flask-restapi-tzdm.onrender.com/
    //
    // Expected successful response:
    // {
    //   "message": "Backend is running",
    //   "service": "Flask REST API",
    //   "status": "ok"
    // }
    //
    // HTTP success = Flask is UP
    // HTTP error   = Flask is DOWN
    // =========================================================

    const flaskApi = this.http
      .get('https://flask-restapi-tzdm.onrender.com/')
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // DJANGO REST API
    // =========================================================
    //
    // Endpoint:
    // https://django-restapi-r7yj.onrender.com/
    //
    // Expected response:
    // Django API is LIVE 🚀
    //
    // HTTP success = Django is UP
    // HTTP error   = Django is DOWN
    // =========================================================

    const djangoApi = this.http
      .get(
        'https://django-restapi-r7yj.onrender.com/',
        {
          responseType: 'text'
        }
      )
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // ASP.NET CORE .NET 9 API
    // =========================================================
    //
    // Endpoint:
    // https://dotnet-user-service-latest.onrender.com/
    //
    // Expected response contains:
    // DotNet User Service
    // ASP.NET Core API running on Render
    //
    // HTTP success = .NET is UP
    // HTTP error   = .NET is DOWN
    // =========================================================

    const dotnetApi = this.http
      .get(
        'https://dotnet-user-service-latest.onrender.com/',
        {
          responseType: 'text'
        }
      )
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // JAVA SPRING BOOT API
    // =========================================================
    //
    // Endpoint:
    // https://java-springboot-user-backend.onrender.com/
    //
    // Expected response contains:
    // Java Spring Boot Backend
    // Backend is up and running successfully!
    //
    // HTTP success = Java is UP
    // HTTP error   = Java is DOWN
    // =========================================================

    const javaApi = this.http
      .get(
        'https://java-springboot-user-backend.onrender.com/',
        {
          responseType: 'text'
        }
      )
      .pipe(
        catchError(() => of(null))
      );


    // =========================================================
    // CHECK ALL FOUR BACKENDS
    // =========================================================
    //
    // forkJoin waits for ALL four requests.
    //
    // Response != null -> service is UP
    // Response == null -> service is DOWN
    //
    // IMPORTANT:
    // The system becomes GREEN ONLY when ALL FOUR are UP.
    // =========================================================

    forkJoin({
      flask: flaskApi,
      django: djangoApi,
      dotnet: dotnetApi,
      java: javaApi,
    }).subscribe({

      // =======================================================
      // ALL CHECKS COMPLETED
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
        // Check .NET
        // -----------------------------------------------------

        const dotnetIsRunning =
          response.dotnet !== null;


        // -----------------------------------------------------
        // Check Java
        // -----------------------------------------------------

        const javaIsRunning =
          response.java !== null;


        // =====================================================
        // STRICT OVERALL STATUS
        // =====================================================
        //
        // ALL FOUR must be UP.
        //
        // If even ONE service is down:
        //
        // 🔴 System Offline
        //
        // Only when all four are up:
        //
        // 🟢 System Ready / Available
        // =====================================================

        const allServicesRunning =
          flaskIsRunning &&
          djangoIsRunning &&
          dotnetIsRunning &&
          javaIsRunning;


        if (allServicesRunning) {

          // ===================================================
          // 🟢 ALL SERVICES ARE AVAILABLE
          // ===================================================

          this.systemStatus = '🟢 System Ready';
          this.statusColor = 'green-status';

        } else {

          // ===================================================
          // 🔴 ONE OR MORE SERVICES ARE DOWN
          // ===================================================

          this.systemStatus = '🔴 System Offline';
          this.statusColor = 'red-status';
        }
      },


      // =======================================================
      // UNEXPECTED ERROR
      // =======================================================

      error: () => {

        this.systemStatus = '🔴 System Offline';
        this.statusColor = 'red-status';
      },
    });
  }
}
