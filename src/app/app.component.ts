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

  This component:

  1. Displays the Angular application.
  2. Checks the availability of four backend services.
  3. Shows:

       🟡 Checking System...

     while the checks are running.

  4. Shows:

       🟢 System Ready

     ONLY when ALL four backend APIs respond successfully.

  5. Shows:

       🔴 System Offline

     when one or more backend APIs cannot be reached.

  IMPORTANT:
  ---------------------------------------------------------------
  A backend being accessible directly in the browser does NOT
  automatically mean Angular is allowed to call it.

  If the backend does not allow CORS requests from your Angular
  application's domain, Angular will receive an HTTP/network
  error even though the backend itself is running.

  Therefore, if all APIs are actually running but this indicator
  remains RED, check the browser Developer Tools -> Console and
  Network tabs for CORS errors.
  ================================================================
*/

@Component({
  selector: 'app-root',

  /*
    HTML template file.
  */
  templateUrl: './app.component.html',

  /*
    CSS file.
  */
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {


  // ==============================================================
  // APPLICATION TITLE
  // ==============================================================

  title = 'Angular_Test_App';


  // ==============================================================
  // SYSTEM STATUS
  // ==============================================================

  /*
    Initial state.

    When Angular starts, we do not yet know whether the four
    backend services are available.

    Therefore we initially display a yellow "Checking" status.
  */
  systemStatus = '🟡 Checking System...';


  /*
    CSS class used by app.component.css.

    Initial value = yellow.
  */
  statusColor = 'yellow-status';


  // ==============================================================
  // OPTIONAL INDIVIDUAL SERVICE STATUS
  // ==============================================================

  /*
    These variables are useful when debugging.

    They tell us which individual service failed.

    This is much better than simply returning null and hiding
    the actual problem.
  */

  flaskStatus = false;
  djangoStatus = false;
  dotnetStatus = false;
  javaStatus = false;


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
      Start checking all backend services.

      We keep this inside ngOnInit so that the health checks start
      automatically when the Angular application loads.
    */

    this.checkAllBackends();

  }


  // ==============================================================
  // CHECK ALL BACKENDS
  // ==============================================================

  checkAllBackends(): void {

    /*
      --------------------------------------------------------------
      IMPORTANT
      --------------------------------------------------------------

      We use forkJoin() because we want to check all four APIs.

      forkJoin waits until all four Observables complete.

      Each health check returns:

        true  = request succeeded
        false = request failed

      Therefore:

        true + true + true + true
                         |
                         v
                  System Ready

      Anything else:

        false somewhere
              |
              v
         System Offline
    */


    // ============================================================
    // FLASK API
    // ============================================================

    const flaskApi: Observable<boolean> = this.http
      .get(
        'https://flask-restapi-tzdm.onrender.com/',
        {
          /*
            We don't need the response body.

            We only care whether the HTTP request succeeds.
          */
          responseType: 'json'
        }
      )
      .pipe(

        /*
          ----------------------------------------------------------
          TIMEOUT
          ----------------------------------------------------------

          Render/free services can sometimes take a while to wake
          up.

          We allow up to 15 seconds.

          If the request takes longer than 15 seconds, we consider
          the health check unsuccessful.
        */
        timeout(15000),

        /*
          ----------------------------------------------------------
          MAP SUCCESS TO TRUE
          ----------------------------------------------------------

          If Angular receives a successful HTTP response,
          return true.
        */
        map(() => true),

        /*
          ----------------------------------------------------------
          ERROR -> FALSE
          ----------------------------------------------------------

          Any error becomes false.

          This includes:

          - CORS errors
          - Network errors
          - Timeout
          - DNS errors
          - Server unavailable
          - HTTP error responses
        */
        catchError((error) => {

          console.error(
            '❌ Flask API health check failed:',
            error
          );

          return of(false);

        })
      );


    // ============================================================
    // DJANGO API
    // ============================================================

    const djangoApi: Observable<boolean> = this.http
      .get(
        'https://django-restapi-r7yj.onrender.com/',
        {
          /*
            Django returns text:

              Django API is LIVE 🚀

            Therefore responseType must be text.
          */
          responseType: 'text'
        }
      )
      .pipe(

        /*
          Wait maximum 15 seconds.
        */
        timeout(15000),

        /*
          Successful HTTP request = true.
        */
        map(() => true),

        /*
          Failed request = false.
        */
        catchError((error) => {

          console.error(
            '❌ Django API health check failed:',
            error
          );

          return of(false);

        })
      );


    // ============================================================
    // .NET API
    // ============================================================

    const dotnetApi: Observable<boolean> = this.http
      .get(
        'https://dotnet-user-service-latest.onrender.com/',
        {
          /*
            The .NET root endpoint returns text.

            Therefore we explicitly use responseType: text.
          */
          responseType: 'text'
        }
      )
      .pipe(

        /*
          Maximum wait time.
        */
        timeout(15000),

        /*
          Successful request = true.
        */
        map(() => true),

        /*
          Failed request = false.
        */
        catchError((error) => {

          console.error(
            '❌ .NET API health check failed:',
            error
          );

          return of(false);

        })
      );


    // ============================================================
    // JAVA SPRING BOOT API
    // ============================================================

    const javaApi: Observable<boolean> = this.http
      .get(
        'https://java-springboot-user-backend.onrender.com/',
        {
          /*
            Java endpoint returns text.

            Therefore use responseType: text.
          */
          responseType: 'text'
        }
      )
      .pipe(

        /*
          Maximum wait time.
        */
        timeout(15000),

        /*
          Successful request = true.
        */
        map(() => true),

        /*
          Failed request = false.
        */
        catchError((error) => {

          console.error(
            '❌ Java API health check failed:',
            error
          );

          return of(false);

        })
      );


    // ============================================================
    // RUN ALL FOUR CHECKS
    // ============================================================

    forkJoin({

      /*
        Flask result.
      */
      flask: flaskApi,

      /*
        Django result.
      */
      django: djangoApi,

      /*
        .NET result.
      */
      dotnet: dotnetApi,

      /*
        Java result.
      */
      java: javaApi,

    }).subscribe({

      // ==========================================================
      // ALL REQUESTS COMPLETED
      // ==========================================================

      next: (response) => {

        /*
          --------------------------------------------------------
          STORE INDIVIDUAL RESULTS
          --------------------------------------------------------
        */

        this.flaskStatus = response.flask;

        this.djangoStatus = response.django;

        this.dotnetStatus = response.dotnet;

        this.javaStatus = response.java;


        /*
          --------------------------------------------------------
          PRINT RESULTS TO CONSOLE
          --------------------------------------------------------

          This is very useful for debugging.

          Open:

            Browser
              ->
            F12
              ->
            Console

          You should see something similar to:

            Flask: true
            Django: true
            .NET: true
            Java: true
        */

        console.log(
          '================ BACKEND STATUS ================'
        );

        console.log(
          'Flask:',
          this.flaskStatus
        );

        console.log(
          'Django:',
          this.djangoStatus
        );

        console.log(
          '.NET:',
          this.dotnetStatus
        );

        console.log(
          'Java:',
          this.javaStatus
        );

        console.log(
          '=================================================='
        );


        // ========================================================
        // CHECK WHETHER ALL SERVICES ARE UP
        // ========================================================

        const allServicesRunning =
          this.flaskStatus &&
          this.djangoStatus &&
          this.dotnetStatus &&
          this.javaStatus;


        // ========================================================
        // ALL SERVICES ARE AVAILABLE
        // ========================================================

        if (allServicesRunning) {

          /*
            Every API successfully responded.

            Therefore display green.
          */

          this.systemStatus = '🟢 System Ready';

          this.statusColor = 'green-status';


          console.log(
            '🟢 ALL BACKEND SERVICES ARE AVAILABLE'
          );

        }


        // ========================================================
        // ONE OR MORE SERVICES FAILED
        // ========================================================

        else {

          /*
            At least one request failed.

            Therefore display red.
          */

          this.systemStatus = '🔴 System Offline';

          this.statusColor = 'red-status';


          /*
            ------------------------------------------------------
            INDIVIDUAL DEBUGGING
            ------------------------------------------------------

            This tells us exactly which service failed.
          */

          if (!this.flaskStatus) {

            console.error(
              '🔴 Flask is not reachable from Angular.'
            );

          }

          if (!this.djangoStatus) {

            console.error(
              '🔴 Django is not reachable from Angular.'
            );

          }

          if (!this.dotnetStatus) {

            console.error(
              '🔴 .NET is not reachable from Angular.'
            );

          }

          if (!this.javaStatus) {

            console.error(
              '🔴 Java is not reachable from Angular.'
            );

          }

        }

      },


      // ==========================================================
      // FORKJOIN UNEXPECTED ERROR
      // ==========================================================

      error: (error) => {

        /*
          Normally our individual catchError() handlers prevent
          this from happening.

          But we keep this handler as an additional safety net.
        */

        console.error(
          '❌ Unexpected system health-check error:',
          error
        );


        this.systemStatus = '🔴 System Offline';

        this.statusColor = 'red-status';

      }

    });

  }

}