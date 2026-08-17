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

  This component checks the availability of:

      1. Flask
      2. Django
      3. Java Spring Boot
      4. ASP.NET Core

  The UI shows:

      🟢 UP
      🔴 DOWN

  for every individual backend.

  OVERALL STATUS:

      All four UP
          =
      🟢 System Ready / Available

      One or more DOWN
          =
      🔴 System Offline


  STATUS PANEL BEHAVIOR
  ---------------------------------------------------------------

  When Angular starts:

      showSystemStatus = true

  The backend checks run.

  The panel remains visible for 5 seconds.

  After 5 seconds:

      showSystemStatus = false

  Therefore the complete status notification disappears.

  If the user refreshes the page:

      Angular starts again
          ↓
      showSystemStatus = true
          ↓
      status appears again
          ↓
      5 seconds
          ↓
      status disappears


  IMPORTANT
  ---------------------------------------------------------------

  We do NOT force the system to green.

  Green means that the actual backend health checks succeeded.
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
    This is displayed at the top of the temporary status panel.
  */

  systemStatus = '🟡 Checking System...';


  /*
    Controls the overall status color.

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
    TRUE:

        Status panel is visible.

    FALSE:

        Status panel is hidden.

    It starts as TRUE so that the status is shown whenever the
    page is loaded or refreshed.
  */

  showSystemStatus = true;


  // ==============================================================
  // STATUS DISPLAY TIME
  // ==============================================================

  /*
    5000 milliseconds = 5 seconds.

    Change this value if you ever want:

        3000 = 3 seconds
        4000 = 4 seconds
        5000 = 5 seconds
    */

  private readonly STATUS_DISPLAY_TIME = 5000;


  // ==============================================================
  // INDIVIDUAL BACKEND STATUS
  // ==============================================================

  /*
    These values represent the actual health of each backend.

    true:

        Backend responded successfully.

    false:

        Backend failed, timed out, or was blocked.
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
      ============================================================
      START BACKEND CHECKS
      ============================================================
    */

    this.checkAllBackends();


    /*
      ============================================================
      AUTOMATICALLY HIDE STATUS PANEL
      ============================================================

      The panel starts visible.

      After exactly 5 seconds it becomes hidden.

      This happens every time the Angular component is created.

      Therefore refreshing the browser causes the status panel to
      appear again for another 5 seconds.
    */

    setTimeout(() => {

      this.showSystemStatus = false;

    }, this.STATUS_DISPLAY_TIME);

  }


  // ==============================================================
  // GENERIC BACKEND HEALTH CHECK
  // ==============================================================

  /*
    This method performs a GET request to a backend.

    SUCCESS:

        Returns true.

    FAILURE:

        Returns false.

    We use responseType: 'text' because the health check does
    not need to understand the backend's response format.

    We only need to know whether the request succeeded.
  */

  private checkApi(
    url: string,
    serviceName: string
  ): Observable<boolean> {


    return this.http
      .get(
        url,
        {
          responseType: 'text'
        }
      )
      .pipe(


        // ========================================================
        // TIMEOUT
        // ========================================================

        /*
          Render services can sometimes take a few seconds to
          wake up.

          We allow 20 seconds for each backend.
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
            Do not hide the real error.

            This lets us identify:

              - CORS
              - timeout
              - 404
              - 500
              - network error
              - incorrect URL
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
  // CHECK ALL FOUR BACKENDS
  // ==============================================================

  checkAllBackends(): void {


    // ============================================================
    // FLASK
    // ============================================================

    /*
      Deployed Flask backend.
    */

    const flaskApi = this.checkApi(
      'https://flask-restapi-tzdm.onrender.com/',
      'Flask'
    );


    // ============================================================
    // DJANGO
    // ============================================================

    /*
      Deployed Django backend.
    */

    const djangoApi = this.checkApi(
      'https://django-restapi-r7yj.onrender.com/',
      'Django'
    );


    // ============================================================
    // .NET
    // ============================================================

    /*
      Deployed ASP.NET Core backend.
    */

    const dotnetApi = this.checkApi(
      'https://dotnet-user-service-latest.onrender.com/',
      '.NET'
    );


    // ============================================================
    // JAVA
    // ============================================================

    /*
      IMPORTANT:

      The old local Java URL was:

          http://localhost:8080

      That must NOT be used by the deployed Angular application.

      localhost means the computer where the browser is running.

      Your deployed Java backend is on Render.

      Your Java application uses:

          /api/users

      Therefore we check:

          https://java-springboot-user-backend.onrender.com/api/users
    */

    const javaApi = this.checkApi(
      'https://java-springboot-user-backend.onrender.com/api/users',
      'Java'
    );


    // ============================================================
    // RUN ALL FOUR CHECKS
    // ============================================================

    /*
      forkJoin waits until all four health checks finish.
    */

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
        // CONSOLE DEBUGGING
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
        // CHECK WHETHER ALL BACKENDS ARE UP
        // ========================================================

        const allServicesRunning =
          this.flaskStatus &&
          this.djangoStatus &&
          this.javaStatus &&
          this.dotnetStatus;


        // ========================================================
        // ALL FOUR ARE UP
        // ========================================================

        if (allServicesRunning) {


          /*
            All four backend health checks succeeded.

            Therefore show:

                🟢 System Ready / Available

            The individual services will ALSO show:

                Flask   🟢 UP
                Django  🟢 UP
                Java    🟢 UP
                .NET    🟢 UP
          */

          this.systemStatus =
            '🟢 System Ready / Available';

          this.statusColor =
            'green-status';


          console.log(
            '🟢 ALL FOUR BACKENDS ARE UP AND RUNNING'
          );

        }


        // ========================================================
        // ONE OR MORE ARE DOWN
        // ========================================================

        else {


          /*
            One or more backend checks failed.

            Therefore:

                🔴 System Offline

            The individual backend rows will show exactly which
            services are DOWN.
          */

          this.systemStatus =
            '🔴 System Offline';

          this.statusColor =
            'red-status';


          // ------------------------------------------------------
          // INDIVIDUAL DEBUG MESSAGES
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
          '❌ Unexpected backend health-check error:',
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