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

      1. Runs the Angular application.
      2. Checks Flask.
      3. Checks Django.
      4. Checks Java Spring Boot.
      5. Checks ASP.NET Core.
      6. Displays individual UP/DOWN status.
      7. Displays overall system status.
      8. Displays a live 5-second countdown.

  ================================================================

  COUNTDOWN BEHAVIOR
  ---------------------------------------------------------------

  When the page loads:

      5

      ↓

      4

      ↓

      3

      ↓

      2

      ↓

      1

      ↓

      HIDE

  Every number is displayed for approximately one second.

  The countdown number blinks.

  Every number uses a different color.

  After 1:

      showSystemStatus = false

  The complete popup disappears.

  Refreshing the page starts the countdown again.
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
    Initial state.

    While the backend checks are running:

        🟡 Checking System...
  */

  systemStatus = '🟡 Checking System...';


  /*
    Overall status CSS class.
  */

  statusColor = 'yellow-status';


  // ==============================================================
  // SHOW / HIDE STATUS POPUP
  // ==============================================================

  /*
    TRUE:

        Popup is visible.

    FALSE:

        Popup is hidden.
  */

  showSystemStatus = true;


  // ==============================================================
  // LIVE COUNTDOWN
  // ==============================================================

  /*
    Countdown starts at 5.

    It will become:

        5
        4
        3
        2
        1
        0
  */

  countdown = 5;


  /*
    CSS class used to give each countdown number a different
    color.

    The classes are:

        countdown-red
        countdown-orange
        countdown-yellow
        countdown-green
        countdown-blue
  */

  countdownColor = 'countdown-red';


  /*
    Interval reference.

    We keep this so we can stop the timer after the countdown
    finishes.
  */

  private countdownTimer: any;


  // ==============================================================
  // INDIVIDUAL BACKEND STATUS
  // ==============================================================

  /*
    Each service initially starts as false.

    After the health checks:

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
  // COMPONENT INITIALIZATION
  // ==============================================================

  ngOnInit(): void {


    /*
      ============================================================
      START BACKEND HEALTH CHECKS
      ============================================================
    */

    this.checkAllBackends();


    /*
      ============================================================
      START 5-SECOND LIVE COUNTDOWN
      ============================================================
    */

    this.startCountdown();

  }


  // ==============================================================
  // START COUNTDOWN
  // ==============================================================

  startCountdown(): void {


    /*
      Reset everything.

      This makes sure the countdown always starts at 5.
    */

    this.countdown = 5;

    this.showSystemStatus = true;


    /*
      Set the first color.

      5 = RED
    */

    this.updateCountdownColor();


    /*
      ============================================================
      LIVE TIMER
      ============================================================

      Every 1 second:

          5 -> 4
          4 -> 3
          3 -> 2
          2 -> 1
          1 -> HIDE

      ============================================================
    */

    this.countdownTimer = setInterval(() => {


      /*
        Reduce countdown by one.
      */

      this.countdown--;


      /*
        ==========================================================
        CHECK WHETHER COUNTDOWN FINISHED
        ==========================================================
      */

      if (this.countdown <= 0) {


        /*
          Stop the interval.

          No more timer events are needed.
        */

        clearInterval(this.countdownTimer);


        /*
          Hide the entire status popup.
        */

        this.showSystemStatus = false;


        /*
          Keep countdown at zero internally.
        */

        this.countdown = 0;


        return;

      }


      /*
        ==========================================================
        CHANGE COUNTDOWN COLOR
        ==========================================================

        Every number gets a different color.
      */

      this.updateCountdownColor();

    }, 1000);

  }


  // ==============================================================
  // UPDATE COUNTDOWN COLOR
  // ==============================================================

  updateCountdownColor(): void {


    /*
      ============================================================
      5 = RED
      ============================================================
    */

    if (this.countdown === 5) {

      this.countdownColor = 'countdown-red';

    }


    /*
      ============================================================
      4 = ORANGE
      ============================================================
    */

    else if (this.countdown === 4) {

      this.countdownColor = 'countdown-orange';

    }


    /*
      ============================================================
      3 = YELLOW
      ============================================================
    */

    else if (this.countdown === 3) {

      this.countdownColor = 'countdown-yellow';

    }


    /*
      ============================================================
      2 = GREEN
      ============================================================
    */

    else if (this.countdown === 2) {

      this.countdownColor = 'countdown-green';

    }


    /*
      ============================================================
      1 = BLUE
      ============================================================
    */

    else if (this.countdown === 1) {

      this.countdownColor = 'countdown-blue';

    }

  }


  // ==============================================================
  // GENERIC BACKEND HEALTH CHECK
  // ==============================================================

  /*
    Performs an HTTP GET request.

    Successful response:

        true

    Error:

        false
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
            We only care whether the backend responds.

            Therefore responseType is text.
          */

          responseType: 'text'
        }
      )
      .pipe(


        // ========================================================
        // TIMEOUT
        // ========================================================

        /*
          Render services may need time to wake up.

          Allow 20 seconds.
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
        // ERROR
        // ========================================================

        catchError((error) => {


          /*
            Log the actual error.

            This helps identify:

                CORS
                timeout
                404
                500
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

      because that is a local development address.

      The deployed Angular application needs the deployed Java
      backend.

      Java API:

          /api/users
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


        /*
          --------------------------------------------------------
          STORE INDIVIDUAL RESULTS
          --------------------------------------------------------
        */

        this.flaskStatus = response.flask;

        this.djangoStatus = response.django;

        this.javaStatus = response.java;

        this.dotnetStatus = response.dotnet;


        /*
          --------------------------------------------------------
          DEBUG INFORMATION
          --------------------------------------------------------
        */

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
        // CHECK ALL FOUR SERVICES
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
            Every backend responded successfully.
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
            At least one backend failed.
          */

          this.systemStatus =
            '🔴 System Offline';

          this.statusColor =
            'red-status';


          /*
            Individual debugging.
          */

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


  // ==============================================================
  // COMPONENT DESTROY
  // ==============================================================

  /*
    Stop the countdown timer if Angular destroys the component.

    This prevents an unnecessary timer from continuing to run.
  */

  ngOnDestroy(): void {


    if (this.countdownTimer) {

      clearInterval(this.countdownTimer);

    }

  }

}