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

  This component is responsible for:

  1. Displaying the Angular application.
  2. Checking the four backend services.
  3. Showing the overall system status.
  4. Showing individual backend status.
  5. Logging failures to the browser console.

  IMPORTANT
  ---------------------------------------------------------------

  We should NOT check arbitrary "/" root URLs if the actual
  Angular application is using a different API endpoint.

  The health check should use an endpoint that is actually
  available from the corresponding backend.

  Also, CORS is controlled by the backend.

  Angular cannot override a backend CORS policy.
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
    Initial status while the API checks are running.
  */

  systemStatus = '🟡 Checking System...';


  /*
    Initial CSS class.
  */

  statusColor = 'yellow-status';


  // ==============================================================
  // INDIVIDUAL SERVICE STATUS
  // ==============================================================

  /*
    These values are initially false.

    After the API checks finish they will become true/false.
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
      Start checking the backend services.
    */

    this.checkAllBackends();

  }


  // ==============================================================
  // GENERIC HEALTH CHECK
  // ==============================================================

  /*
    This method performs a simple GET request.

    If the request succeeds:

      true

    If the request fails:

      false

    We use text response handling because it avoids Angular
    trying to parse different backend response formats as JSON.
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

        /*
          --------------------------------------------------------
          TIMEOUT
          --------------------------------------------------------

          Render services can sometimes take a few seconds to
          wake up.

          We therefore give each service 20 seconds.
        */

        timeout(20000),


        /*
          --------------------------------------------------------
          SUCCESS
          --------------------------------------------------------

          Any successful HTTP response means the backend endpoint
          responded.

          We don't care about the response body here.
        */

        map(() => {

          console.log(
            `🟢 ${serviceName} health check succeeded:`,
            url
          );

          return true;

        }),


        /*
          --------------------------------------------------------
          FAILURE
          --------------------------------------------------------

          Log the actual error instead of hiding it.

          This is very important for identifying:

          - CORS
          - timeout
          - 404
          - 500
          - network errors
          - Render sleeping
          - wrong URL
        */

        catchError((error) => {

          console.error(
            `🔴 ${serviceName} health check failed:`,
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


    /*
      ============================================================
      FLASK
      ============================================================

      Current Flask Render URL.
    */

    const flaskApi = this.checkApi(
      'https://flask-restapi-tzdm.onrender.com/',
      'Flask'
    );


    /*
      ============================================================
      DJANGO
      ============================================================

      Current Django Render URL.
    */

    const djangoApi = this.checkApi(
      'https://django-restapi-r7yj.onrender.com/',
      'Django'
    );


    /*
      ============================================================
      .NET
      ============================================================

      Current .NET Render URL.
    */

    const dotnetApi = this.checkApi(
      'https://dotnet-user-service-latest.onrender.com/',
      '.NET'
    );


    /*
      ============================================================
      JAVA
      ============================================================

      IMPORTANT:

      Your Java page currently displays:

        http://localhost:8080

      That is a LOCAL backend URL.

      A deployed Angular application cannot use localhost to
      communicate with YOUR computer's Java server.

      The deployed Angular application needs to use the deployed
      Render Java backend.

      We therefore use your Render Java URL here.

      HOWEVER:

      If the actual Java API endpoint is:

        /api/users

      and "/" does not respond correctly, change this URL to:

        https://java-springboot-user-backend.onrender.com/api/users

      That is preferable because your Java page says:

        API: /api/users

      ============================================================
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

      dotnet: dotnetApi,

      java: javaApi,

    }).subscribe({

      // ==========================================================
      // ALL CHECKS COMPLETED
      // ==========================================================

      next: (response) => {


        /*
          --------------------------------------------------------
          SAVE INDIVIDUAL STATUS
          --------------------------------------------------------
        */

        this.flaskStatus = response.flask;

        this.djangoStatus = response.django;

        this.dotnetStatus = response.dotnet;

        this.javaStatus = response.java;


        /*
          --------------------------------------------------------
          DEBUG OUTPUT
          --------------------------------------------------------
        */

        console.log(
          '================================================'
        );

        console.log(
          '        BACKEND SYSTEM STATUS'
        );

        console.log(
          '================================================'
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
          '================================================'
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
            ALL FOUR services successfully responded.

            Therefore the system is genuinely ready.
          */

          this.systemStatus =
            '🟢 System Ready / Available';

          this.statusColor =
            'green-status';


          console.log(
            '🟢 SYSTEM READY - ALL BACKENDS AVAILABLE'
          );

        }


        // ========================================================
        // ONE OR MORE SERVICES DOWN
        // ========================================================

        else {

          /*
            At least one backend failed.

            We keep the overall status RED because it would be
            misleading to show green when a required backend is
            unavailable.
          */

          this.systemStatus =
            '🔴 System Offline';

          this.statusColor =
            'red-status';


          console.error(
            '🔴 ONE OR MORE BACKENDS ARE NOT AVAILABLE'
          );


          // ------------------------------------------------------
          // Individual debugging
          // ------------------------------------------------------

          if (!this.flaskStatus) {

            console.error(
              '❌ Flask is unavailable.'
            );

          }


          if (!this.djangoStatus) {

            console.error(
              '❌ Django is unavailable.'
            );

          }


          if (!this.javaStatus) {

            console.error(
              '❌ Java is unavailable.'
            );

          }


          if (!this.dotnetStatus) {

            console.error(
              '❌ .NET is unavailable.'
            );

          }

        }

      },


      // ==========================================================
      // UNEXPECTED ERROR
      // ==========================================================

      error: (error) => {

        console.error(
          '❌ Unexpected system health-check error:',
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