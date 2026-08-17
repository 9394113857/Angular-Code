import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  forkJoin,
  Observable,
  of
} from 'rxjs';

import {
  catchError,
  map,
  timeout
} from 'rxjs/operators';


/*
  ================================================================
  APP COMPONENT
  ================================================================

  PURPOSE
  ---------------------------------------------------------------

  This component:

  1. Displays the Angular application.
  2. Checks Flask.
  3. Checks Django.
  4. Checks Java Spring Boot.
  5. Checks ASP.NET Core.
  6. Shows individual backend status.
  7. Shows the overall system status.

  STATUS DISPLAY BEHAVIOR
  ---------------------------------------------------------------

  When the page is opened or refreshed:

      Status panel appears.

  After 5 seconds:

      Status panel automatically disappears.

  The backend health checks continue normally.

  On another refresh:

      The status panel appears again for 5 seconds.

  IMPORTANT
  ---------------------------------------------------------------

  The green status is NOT forced.

  Green means all four backend checks actually succeeded.
  ================================================================
*/


@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.css'],
})


export class AppComponent implements OnInit {


  // ==============================================================
  // APPLICATION TITLE
  // ==============================================================

  title = 'Angular_Test_App';


  // ==============================================================
  // OVERALL SYSTEM STATUS
  // ==============================================================

  /*
    Initial status while the backend health checks are running.
  */

  systemStatus = '🟡 Checking System...';


  /*
    Initial CSS class.

    Possible values:

      yellow-status
      green-status
      red-status
  */

  statusColor = 'yellow-status';


  // ==============================================================
  // SHOW / HIDE STATUS PANEL
  // ==============================================================

  /*
    This controls the temporary status panel.

    true:

      Status panel is visible.

    false:

      Status panel is hidden.
  */

  showSystemStatus = true;


  /*
    Number of milliseconds the status panel remains visible.

    5000 milliseconds = 5 seconds.
  */

  private readonly STATUS_DISPLAY_TIME = 5000;


  // ==============================================================
  // INDIVIDUAL BACKEND STATUS
  // ==============================================================

  /*
    Each service starts as false.

    After the health check:

      true  = UP
      false = DOWN
  */

  flaskStatus = false;

  djangoStatus = false;

  javaStatus = false;

  dotnetStatus = false;


  // ==============================================================
  // CONSTRUCTOR
  // ==============================================================

  constructor(
    private http: HttpClient
  ) {}


  // ==============================================================
  // ANGULAR INITIALIZATION
  // ==============================================================

  ngOnInit(): void {

    /*
      Start backend checks.
    */

    this.checkAllBackends();


    /*
      ============================================================
      AUTOMATICALLY HIDE STATUS AFTER 5 SECONDS
      ============================================================

      The status panel is initially visible.

      After 5 seconds:

          showSystemStatus = false

      Angular's *ngIf then removes the panel from the page.

      If the user refreshes the page, the component is created
      again and showSystemStatus starts as true again.

      Therefore:

          Refresh
             ↓
          Show status
             ↓
          5 seconds
             ↓
          Hide status
      ============================================================
    */

    setTimeout(() => {

      this.showSystemStatus = false;

    }, this.STATUS_DISPLAY_TIME);

  }


  // ==============================================================
  // GENERIC API HEALTH CHECK
  // ==============================================================

  /*
    Performs a GET request to a backend.

    Returns:

      true  = backend responded
      false = backend failed
  */

  private checkApi(
    url: string,
    serviceName: string
  ): Observable<boolean> {


    return this.http
      .get(
        url,
        {
          /*
            Read response as text.

            This works with both text and JSON backend responses
            because this health check only cares about whether the
            HTTP request succeeds.
          */

          responseType: 'text'
        }
      )
      .pipe(


        // ========================================================
        // TIMEOUT
        // ========================================================

        /*
          Render services can sometimes take time to wake up.

          Allow up to 20 seconds.
        */

        timeout(20000),


        // ========================================================
        // SUCCESS
        // ========================================================

        map(() => {

          console.log(
            `🟢 ${serviceName} is UP`,
            url
          );

          return true;

        }),


        // ========================================================
        // FAILURE
        // ========================================================

        catchError((error) => {

          /*
            Print the real error to the browser console.

            This helps identify:

              CORS
              404
              500
              timeout
              network error
              wrong URL
          */

          console.error(
            `🔴 ${serviceName} health check failed`,
            url,
            error
          );


          return of(false);

        })

      );

  }


  // ==============================================================
  // CHECK ALL BACKENDS
  // ==============================================================

  checkAllBackends(): void {


    // ============================================================
    // FLASK
    // ============================================================

    const flaskApi = this.checkApi(
      'https://flask-restapi-tzdm.onrender.com/',
      'Flask'
    );


    // ============================================================
    // DJANGO
    // ============================================================

    const djangoApi = this.checkApi(
      'https://django-restapi-r7yj.onrender.com/',
      'Django'
    );


    // ============================================================
    // .NET
    // ============================================================

    const dotnetApi = this.checkApi(
      'https://dotnet-user-service-latest.onrender.com/',
      '.NET'
    );


    // ============================================================
    // JAVA
    // ============================================================

    /*
      IMPORTANT:

      Do NOT use:

          http://localhost:8080

      for the deployed Angular application.

      localhost refers to the user's own computer.

      The deployed Java backend is on Render.

      Your Java application uses:

          /api/users

      Therefore the health check uses the deployed API.
    */

    const javaApi = this.checkApi(
      'https://java-springboot-user-backend.onrender.com/api/users',
      'Java'
    );


    // ============================================================
    // RUN ALL FOUR CHECKS
    // ============================================================

    forkJoin({

      flask: flaskApi,

      django: djangoApi,

      java: javaApi,

      dotnet: dotnetApi,

    })
    .subscribe({


      // ==========================================================
      // ALL CHECKS COMPLETED
      // ==========================================================

      next: (response) => {


        // --------------------------------------------------------
        // SAVE INDIVIDUAL RESULTS
        // --------------------------------------------------------

        this.flaskStatus = response.flask;

        this.djangoStatus = response.django;

        this.javaStatus = response.java;

        this.dotnetStatus = response.dotnet;


        // --------------------------------------------------------
        // CONSOLE OUTPUT
        // --------------------------------------------------------

        console.log(
          '=============================================='
        );

        console.log(
          '          BACKEND SYSTEM STATUS'
        );

        console.log(
          '=============================================='
        );

        console.log(
          'Flask :',
          this.flaskStatus
        );

        console.log(
          'Django:',
          this.djangoStatus
        );

        console.log(
          'Java  :',
          this.javaStatus
        );

        console.log(
          '.NET  :',
          this.dotnetStatus
        );

        console.log(
          '=============================================='
        );


        // ========================================================
        // CHECK ALL SERVICES
        // ========================================================

        const allServicesRunning =
          this.flaskStatus &&
          this.djangoStatus &&
          this.javaStatus &&
          this.dotnetStatus;


        // ========================================================
        // ALL SERVICES UP
        // ========================================================

        if (allServicesRunning) {


          /*
            All four backends responded successfully.

            Therefore:

              🟢 System Ready / Available
          */

          this.systemStatus =
            '🟢 System Ready / Available';

          this.statusColor =
            'green-status';


          console.log(
            '🟢 ALL BACKENDS ARE AVAILABLE'
          );

        }


        // ========================================================
        // ONE OR MORE SERVICES DOWN
        // ========================================================

        else {


          /*
            At least one backend failed.

            Therefore:

              🔴 System Offline
          */

          this.systemStatus =
            '🔴 System Offline';

          this.statusColor =
            'red-status';


          // ------------------------------------------------------
          // INDIVIDUAL DEBUG INFORMATION
          // ------------------------------------------------------

          if (!this.flaskStatus) {

            console.error(
              '❌ Flask is DOWN'
            );

          }


          if (!this.djangoStatus) {

            console.error(
              '❌ Django is DOWN'
            );

          }


          if (!this.javaStatus) {

            console.error(
              '❌ Java is DOWN'
            );

          }


          if (!this.dotnetStatus) {

            console.error(
              '❌ .NET is DOWN'
            );

          }

        }

      },


      // ==========================================================
      // UNEXPECTED ERROR
      // ==========================================================

      error: (error) => {


        console.error(
          '❌ Unexpected backend status error:',
          error
        );


        this.systemStatus =
          '🔴 System Offline';

        this.statusColor =
          'red-status';

      }

    });

  }

}