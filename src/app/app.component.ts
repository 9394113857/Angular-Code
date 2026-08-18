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
      6. Detects every backend independently.
      7. Shows LIVE runtime health.
      8. Shows YELLOW while checking / waking.
      9. Shows GREEN when UP.
     10. Shows RED when DOWN.
     11. Waits for ALL FOUR current health checks to finish.
     12. Displays the final runtime system status.
     13. Starts:

             5
             4
             3
             2
             1

     14. Automatically hides the popup.
     15. Continues monitoring the backends.
     16. Checks again after the monitoring interval.
     17. Shows the popup again with the latest runtime status.
     18. Cleans up timers and subscriptions when destroyed.

  ================================================================
*/


// ================================================================
// ANGULAR IMPORTS
// ================================================================

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';


// ================================================================
// HTTP CLIENT
// ================================================================

import {
  HttpClient
} from '@angular/common/http';


// ================================================================
// RXJS
// ================================================================

import {
  Observable,
  of,
  Subscription
} from 'rxjs';


// ================================================================
// RXJS OPERATORS
// ================================================================

import {
  catchError,
  finalize,
  map,
  timeout
} from 'rxjs/operators';



// ================================================================
// BACKEND STATUS TYPE
// ================================================================

/*
  null:

      Backend has not responded yet.

  true:

      Backend is UP.

  false:

      Backend is DOWN.
*/

type BackendStatus = boolean | null;



// ================================================================
// COMPONENT
// ================================================================

@Component({

  // ==============================================================
  // COMPONENT SELECTOR
  // ==============================================================

  selector: 'app-root',


  // ==============================================================
  // HTML TEMPLATE
  // ==============================================================

  templateUrl: './app.component.html',


  // ==============================================================
  // EXISTING CSS FILE
  // ==============================================================

  styleUrls: ['./app.component.css'],


  // ==============================================================
  // EXTRA POPUP CSS
  // ==============================================================

  /*
    These styles are included here so the HTML popup works
    immediately with this TypeScript file.

    You can keep your existing app.component.css.

    These component styles are specifically for:

        traffic lights
        popup
        countdown
        blinking
        backend dots
        mobile layout
  */

  styles: [`

    /* ============================================================
       SYSTEM STATUS POPUP
       ============================================================ */

    .system-status-popup {

      position: fixed;

      left: 20px;

      bottom: 20px;

      width: 330px;

      padding: 20px;

      border-radius: 18px;

      color: #ffffff;

      background: #111827;

      border: 2px solid #374151;

      box-shadow:
        0 15px 40px rgba(0, 0, 0, 0.45);

      z-index: 99999;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      overflow: hidden;

    }



    /* ============================================================
       GREEN OVERALL STATUS
       ============================================================ */

    .system-status-popup.green-status {

      border-color: #22c55e;

      box-shadow:
        0 0 20px rgba(34, 197, 94, 0.35),
        0 15px 40px rgba(0, 0, 0, 0.45);

    }



    /* ============================================================
       YELLOW OVERALL STATUS
       ============================================================ */

    .system-status-popup.yellow-status {

      border-color: #facc15;

      box-shadow:
        0 0 20px rgba(250, 204, 21, 0.35),
        0 15px 40px rgba(0, 0, 0, 0.45);

    }



    /* ============================================================
       RED OVERALL STATUS
       ============================================================ */

    .system-status-popup.red-status {

      border-color: #ef4444;

      box-shadow:
        0 0 20px rgba(239, 68, 68, 0.35),
        0 15px 40px rgba(0, 0, 0, 0.45);

    }



    /* ============================================================
       HEADER
       ============================================================ */

    .system-status-header {

      display: flex;

      align-items: center;

      gap: 12px;

      margin-bottom: 8px;

    }



    /* ============================================================
       TRAFFIC LIGHT CONTAINER
       ============================================================ */

    .traffic-lights {

      display: flex;

      align-items: center;

      gap: 5px;

      padding: 5px 7px;

      border-radius: 20px;

      background: #030712;

      border: 1px solid #374151;

    }



    /* ============================================================
       TRAFFIC LIGHT
       ============================================================ */

    .traffic-light {

      display: inline-block;

      width: 10px;

      height: 10px;

      border-radius: 50%;

      opacity: 0.25;

      transition:
        opacity 0.25s ease,
        box-shadow 0.25s ease,
        transform 0.25s ease;

    }



    /* ============================================================
       RED LIGHT
       ============================================================ */

    .red-light {

      background: #ef4444;

    }



    /* ============================================================
       YELLOW LIGHT
       ============================================================ */

    .yellow-light {

      background: #facc15;

    }



    /* ============================================================
       GREEN LIGHT
       ============================================================ */

    .green-light {

      background: #22c55e;

    }



    /* ============================================================
       ACTIVE TRAFFIC LIGHT
       ============================================================ */

    .traffic-light.light-active {

      opacity: 1;

      transform: scale(1.15);

    }



    .red-light.light-active {

      box-shadow:
        0 0 12px #ef4444;

    }



    .yellow-light.light-active {

      box-shadow:
        0 0 12px #facc15;

    }



    .green-light.light-active {

      box-shadow:
        0 0 12px #22c55e;

    }



    /* ============================================================
       SYSTEM STATUS TITLE
       ============================================================ */

    .system-status-title {

      flex: 1;

      font-size: 17px;

      font-weight: 800;

      line-height: 1.2;

    }



    /* ============================================================
       COUNTDOWN NUMBER
       ============================================================ */

    .countdown-number {

      text-align: center;

      font-size: 58px;

      line-height: 1;

      font-weight: 900;

      margin-top: 10px;

      margin-bottom: 2px;

      text-shadow:
        0 0 12px currentColor;

      /*
        Continuous blinking.

        This gives the countdown a nice live effect.
      */

      animation:
        countdownBlink
        0.75s
        ease-in-out
        infinite;

      user-select: none;

    }



    /* ============================================================
       COUNTDOWN RED
       ============================================================ */

    .countdown-red {

      color: #ef4444;

    }



    /* ============================================================
       COUNTDOWN ORANGE
       ============================================================ */

    .countdown-orange {

      color: #fb923c;

    }



    /* ============================================================
       COUNTDOWN YELLOW
       ============================================================ */

    .countdown-yellow {

      color: #facc15;

    }



    /* ============================================================
       COUNTDOWN GREEN
       ============================================================ */

    .countdown-green {

      color: #22c55e;

    }



    /* ============================================================
       COUNTDOWN BLUE
       ============================================================ */

    .countdown-blue {

      color: #38bdf8;

    }



    /* ============================================================
       COUNTDOWN BLINK ANIMATION
       ============================================================ */

    @keyframes countdownBlink {

      0% {

        opacity: 1;

        transform: scale(1);

        filter: brightness(1);

      }


      35% {

        opacity: 0.25;

        transform: scale(0.92);

        filter: brightness(0.8);

      }


      70% {

        opacity: 1;

        transform: scale(1.08);

        filter: brightness(1.8);

      }


      100% {

        opacity: 1;

        transform: scale(1);

        filter: brightness(1);

      }

    }



    /* ============================================================
       COUNTDOWN LABEL
       ============================================================ */

    .countdown-label {

      text-align: center;

      color: #9ca3af;

      font-size: 12px;

      margin-bottom: 15px;

    }



    /* ============================================================
       STARTUP MESSAGE
       ============================================================ */

    .startup-message {

      text-align: center;

      color: #facc15;

      font-size: 12px;

      font-weight: 700;

      margin-bottom: 12px;

      animation:
        softBlink
        1.2s
        ease-in-out
        infinite;

    }



    /* ============================================================
       SOFT BLINK
       ============================================================ */

    @keyframes softBlink {

      0% {

        opacity: 1;

      }


      50% {

        opacity: 0.45;

      }


      100% {

        opacity: 1;

      }

    }



    /* ============================================================
       BACKEND SERVICES TITLE
       ============================================================ */

    .system-status-subtitle {

      color: #d1d5db;

      font-size: 11px;

      font-weight: 800;

      text-transform: uppercase;

      letter-spacing: 1px;

      padding-bottom: 7px;

      border-bottom: 1px solid #374151;

      margin-bottom: 5px;

    }



    /* ============================================================
       BACKEND ROW
       ============================================================ */

    .backend-status {

      display: flex;

      justify-content: space-between;

      align-items: center;

      min-height: 30px;

      padding: 3px 0;

      border-bottom:
        1px solid rgba(75, 85, 99, 0.35);

    }



    /* ============================================================
       BACKEND NAME
       ============================================================ */

    .backend-name {

      display: flex;

      align-items: center;

      gap: 8px;

      font-size: 14px;

      font-weight: 700;

    }



    /* ============================================================
       BACKEND DOT
       ============================================================ */

    .backend-dot {

      width: 9px;

      height: 9px;

      border-radius: 50%;

      display: inline-block;

      transition:
        background-color 0.25s ease,
        box-shadow 0.25s ease;

    }



    /* ============================================================
       GREEN BACKEND DOT
       ============================================================ */

    .dot-green {

      background: #22c55e;

      box-shadow:
        0 0 9px #22c55e;

    }



    /* ============================================================
       RED BACKEND DOT
       ============================================================ */

    .dot-red {

      background: #ef4444;

      box-shadow:
        0 0 9px #ef4444;

    }



    /* ============================================================
       YELLOW BACKEND DOT
       ============================================================ */

    .dot-yellow {

      background: #facc15;

      box-shadow:
        0 0 9px #facc15;

      animation:
        dotBlink
        0.9s
        ease-in-out
        infinite;

    }



    /* ============================================================
       BACKEND DOT BLINK
       ============================================================ */

    @keyframes dotBlink {

      0% {

        opacity: 1;

      }


      50% {

        opacity: 0.35;

      }


      100% {

        opacity: 1;

      }

    }



    /* ============================================================
       BACKEND STATE
       ============================================================ */

    .backend-state {

      font-size: 12px;

      font-weight: 800;

    }



    /* ============================================================
       RUNTIME SUMMARY
       ============================================================ */

    .runtime-summary {

      display: flex;

      justify-content: center;

      gap: 5px;

      color: #9ca3af;

      font-size: 10px;

      margin-top: 10px;

    }



    /* ============================================================
       AUTO CLOSE MESSAGE
       ============================================================ */

    .status-hide-message {

      text-align: center;

      color: #6b7280;

      font-size: 10px;

      margin-top: 8px;

    }



    /* ============================================================
       MOBILE
       ============================================================ */

    @media (max-width: 600px) {

      .system-status-popup {

        left: 10px;

        right: 10px;

        bottom: 10px;

        width: auto;

        max-width: none;

      }

    }

  `]

})



// ================================================================
// APP COMPONENT CLASS
// ================================================================

export class AppComponent
  implements OnInit, OnDestroy {



  // ==============================================================
  // APPLICATION TITLE
  // ==============================================================

  title = 'Angular_Test_App';



  // ==============================================================
  // OVERALL SYSTEM STATUS
  // ==============================================================

  /*
    Possible values:

        🟡 Checking / Waking Services...

        🟢 System Ready / All Services Live

        🔴 System Offline / Degraded
  */

  systemStatus =
    '🟡 Checking / Waking Services...';



  /*
    CSS class:

        yellow-status
        green-status
        red-status
  */

  statusColor =
    'yellow-status';



  // ==============================================================
  // POPUP VISIBILITY
  // ==============================================================

  /*
    TRUE:

        Popup is visible.

    FALSE:

        Popup is hidden.
  */

  showSystemStatus = true;



  // ==============================================================
  // COUNTDOWN
  // ==============================================================

  /*
    Starts at:

        5

    Then:

        4
        3
        2
        1

    Then:

        HIDE
  */

  countdown = 5;



  // ==============================================================
  // COUNTDOWN COLOR
  // ==============================================================

  /*
    5 = RED
    4 = ORANGE
    3 = YELLOW
    2 = GREEN
    1 = BLUE
  */

  countdownColor =
    'countdown-red';



  // ==============================================================
  // COUNTDOWN RUNNING
  // ==============================================================

  /*
    FALSE:

        We are waiting for backend responses.

    TRUE:

        5 -> 4 -> 3 -> 2 -> 1 is running.
  */

  countdownRunning = false;



  // ==============================================================
  // BACKEND STATUS
  // ==============================================================

  /*
    null:

        No result yet.

    true:

        UP.

    false:

        DOWN.

  IMPORTANT:

  We use null instead of false as the initial state.

  This prevents an API that has not responded yet from being
  incorrectly displayed as DOWN.
  */

  flaskStatus: BackendStatus = null;

  djangoStatus: BackendStatus = null;

  javaStatus: BackendStatus = null;

  dotnetStatus: BackendStatus = null;



  // ==============================================================
  // BACKEND CHECKING FLAGS
  // ==============================================================

  /*
    TRUE:

        The HTTP request for that backend is currently running.

    FALSE:

        That backend request has finished.
  */

  flaskChecking = false;

  djangoChecking = false;

  javaChecking = false;

  dotnetChecking = false;



  // ==============================================================
  // FIRST RESPONSE FLAGS
  // ==============================================================

  /*
    These remember whether each backend has completed its first
    health check.

    Example:

        Flask responds

        flaskFirstResponse = true

    This remains true for the lifetime of the component.
  */

  private flaskFirstResponse = false;

  private djangoFirstResponse = false;

  private javaFirstResponse = false;

  private dotnetFirstResponse = false;



  // ==============================================================
  // INITIAL HEALTH CHECK COMPLETE
  // ==============================================================

  /*
    FALSE:

        At least one backend has never responded yet.

    TRUE:

        All four have responded at least once.
  */

  initialHealthCheckComplete = false;



  // ==============================================================
  // COUNTDOWN TIMER
  // ==============================================================

  /*
    Controls:

        5
        4
        3
        2
        1
  */

  private countdownTimer:
    ReturnType<typeof setInterval> | null = null;



  // ==============================================================
  // NEXT HEALTH CHECK TIMER
  // ==============================================================

  /*
    After the popup disappears, this timer waits before starting
    another health-check cycle.
  */

  private healthCheckTimer:
    ReturnType<typeof setTimeout> | null = null;



  // ==============================================================
  // ACTIVE HTTP SUBSCRIPTIONS
  // ==============================================================

  /*
    Every backend request is stored here.

    When the component is destroyed, all subscriptions are
    cancelled.
  */

  private activeSubscriptions:
    Subscription[] = [];



  // ==============================================================
  // API TIMEOUT
  // ==============================================================

  /*
    Maximum time allowed for one health request.

    Render services can take time to wake up.

    20 seconds is allowed here.
  */

  private readonly API_TIMEOUT_MS =
    20000;



  // ==============================================================
  // HEALTH CHECK INTERVAL
  // ==============================================================

  /*
    After one cycle:

        popup hides

    Then:

        wait 30 seconds

    Then:

        check all APIs again.

    You can change this:

        15000 = 15 seconds

        30000 = 30 seconds

        60000 = 1 minute
  */

  private readonly HEALTH_CHECK_INTERVAL_MS =
    30000;



  // ==============================================================
  // COUNTDOWN LENGTH
  // ==============================================================

  private readonly COUNTDOWN_SECONDS =
    5;



  // ==============================================================
  // CURRENT HEALTH CHECK CYCLE
  // ==============================================================

  /*
    TRUE:

        A health-check cycle is currently running.

    FALSE:

        No health-check cycle is currently running.
  */

  private healthCheckCycleRunning =
    false;



  // ==============================================================
  // COMPLETED REQUESTS IN CURRENT CYCLE
  // ==============================================================

  /*
    Starts at:

        0

    Then:

        1
        2
        3
        4

    Only when it reaches 4 does the countdown begin.
  */

  private completedRequestsInCycle =
    0;



  // ==============================================================
  // DESTROYED FLAG
  // ==============================================================

  /*
    Prevents asynchronous callbacks from modifying the component
    after Angular destroys it.
  */

  private destroyed =
    false;



  // ==============================================================
  // CONSTRUCTOR
  // ==============================================================

  constructor(

    private http: HttpClient,

    private changeDetector: ChangeDetectorRef

  ) {}



  // ==============================================================
  // COMPONENT INITIALIZATION
  // ==============================================================

  ngOnInit(): void {


    /*
      Start the FIRST health-check cycle immediately.

      The popup is visible immediately.

      All four APIs begin independently.
    */

    this.startHealthCheckCycle();

  }



  // ==============================================================
  // START HEALTH CHECK CYCLE
  // ==============================================================

  /*
    IMPORTANT:

    This method starts all four requests.

    It does NOT wait for one API before starting another.

    Therefore:

        Flask
        Django
        Java
        .NET

    all begin checking immediately.
  */

  startHealthCheckCycle(): void {


    // ============================================================
    // DO NOT RUN AFTER DESTROY
    // ============================================================

    if (this.destroyed) {

      return;

    }



    // ============================================================
    // PREVENT OVERLAPPING CYCLES
    // ============================================================

    if (this.healthCheckCycleRunning) {

      return;

    }



    // ============================================================
    // MARK CYCLE AS RUNNING
    // ============================================================

    this.healthCheckCycleRunning =
      true;



    // ============================================================
    // RESET COMPLETED REQUEST COUNT
    // ============================================================

    this.completedRequestsInCycle =
      0;



    // ============================================================
    // SHOW POPUP
    // ============================================================

    this.showSystemStatus =
      true;



    // ============================================================
    // COUNTDOWN IS NOT RUNNING YET
    // ============================================================

    /*
      IMPORTANT:

      We do NOT start 5 -> 4 -> 3 -> 2 -> 1 yet.

      We wait until all four APIs finish.
    */

    this.countdownRunning =
      false;



    // ============================================================
    // RESET COUNTDOWN TO 5
    // ============================================================

    this.countdown =
      this.COUNTDOWN_SECONDS;



    // ============================================================
    // SET COUNTDOWN COLOR
    // ============================================================

    this.updateCountdownColor();



    // ============================================================
    // MARK ALL BACKENDS AS CHECKING
    // ============================================================

    this.flaskChecking =
      true;

    this.djangoChecking =
      true;

    this.javaChecking =
      true;

    this.dotnetChecking =
      true;



    // ============================================================
    // UPDATE OVERALL STATUS
    // ============================================================

    /*
      Since all four requests are currently running:

          🟡 Checking / Waking Services...
    */

    this.updateOverallSystemStatus();



    // ============================================================
    // REFRESH VIEW
    // ============================================================

    this.refreshView();



    // ============================================================
    // FLASK
    // ============================================================

    this.runBackendCheck(

      'flask',

      'Flask',

      'https://flask-restapi-tzdm.onrender.com/'

    );



    // ============================================================
    // DJANGO
    // ============================================================

    this.runBackendCheck(

      'django',

      'Django',

      'https://django-restapi-r7yj.onrender.com/'

    );



    // ============================================================
    // .NET
    // ============================================================

    this.runBackendCheck(

      'dotnet',

      '.NET',

      'https://dotnet-user-service-latest.onrender.com/'

    );



    // ============================================================
    // JAVA
    // ============================================================

    this.runBackendCheck(

      'java',

      'Java',

      'https://java-springboot-user-backend.onrender.com/api/users'

    );

  }



  // ==============================================================
  // RUN INDIVIDUAL BACKEND CHECK
  // ==============================================================

  /*
    This is the main dynamic part.

    We DO NOT use forkJoin().

    Instead:

        Flask -> independent subscription
        Django -> independent subscription
        Java -> independent subscription
        .NET -> independent subscription

    Therefore responses are displayed as soon as they arrive.
  */

  private runBackendCheck(

    backend:
      'flask' |
      'django' |
      'java' |
      'dotnet',

    serviceName: string,

    url: string

  ): void {


    // ============================================================
    // CREATE REQUEST
    // ============================================================

    const request$ =
      this.checkApi(

        url,

        serviceName

      );



    // ============================================================
    // SUBSCRIBE
    // ============================================================

    const subscription =
      request$.subscribe({

        // ========================================================
        // RESPONSE RECEIVED
        // ========================================================

        next: (isUp: boolean) => {


          /*
            Store the result immediately.

            We DO NOT wait for the other APIs.
          */

          this.setBackendStatus(

            backend,

            isUp

          );



          /*
            Remember that this backend has responded at least once.
          */

          this.markFirstResponse(

            backend

          );



          /*
            Update overall traffic-light state immediately.
          */

          this.updateOverallSystemStatus();



          /*
            Refresh the Angular UI immediately.
          */

          this.refreshView();



          /*
            Debug output.
          */

          console.log(

            `Runtime status -> ${serviceName}:`,

            isUp
              ? 'UP'
              : 'DOWN'

          );

        },



        // ========================================================
        // UNEXPECTED ERROR
        // ========================================================

        error: (error) => {


          /*
            Normally checkApi() catches errors.

            This is an additional safety fallback.
          */

          console.error(

            `Unexpected ${serviceName} health-check error:`,

            error

          );



          /*
            Treat unexpected error as DOWN.
          */

          this.setBackendStatus(

            backend,

            false

          );



          /*
            Mark as responded.
          */

          this.markFirstResponse(

            backend

          );



          /*
            Update overall status.
          */

          this.updateOverallSystemStatus();



          /*
            Refresh UI.
          */

          this.refreshView();

        }

      });



    // ============================================================
    // STORE SUBSCRIPTION
    // ============================================================

    this.activeSubscriptions.push(

      subscription

    );

  }



  // ==============================================================
  // GENERIC API HEALTH CHECK
  // ==============================================================

  /*
    SUCCESS:

        true

    ERROR:

        false

    TIMEOUT:

        false

    Every request eventually completes.

    That is important because the countdown should NEVER wait
    forever for a backend that has completely stopped responding.
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
            We only care whether the endpoint responds.

            Therefore the response body is treated as text.
          */

          responseType: 'text'

        }

      )

      .pipe(


        // ========================================================
        // TIMEOUT
        // ========================================================

        /*
          Give Render up to 20 seconds to wake/respond.
        */

        timeout(

          this.API_TIMEOUT_MS

        ),



        // ========================================================
        // SUCCESS
        // ========================================================

        map(() => {


          console.log(

            `🟢 ${serviceName} responded successfully`,

            url

          );



          return true;

        }),



        // ========================================================
        // ERROR
        // ========================================================

        catchError((error) => {


          /*
            This catches:

                network errors
                CORS errors
                404
                500
                timeout
                connection errors
                etc.
          */

          console.error(

            `🔴 ${serviceName} health check failed`,

            url,

            error

          );



          /*
            For health monitoring:

                ERROR = DOWN
          */

          return of(false);

        }),



        // ========================================================
        // FINALIZE
        // ========================================================

        /*
          finalize() executes after:

              SUCCESS
              ERROR
              UNSUBSCRIBE

          We use it to count completed requests.
        */

        finalize(() => {


          this.backendRequestFinished();

        })

      );

  }



  // ==============================================================
  // BACKEND REQUEST FINISHED
  // ==============================================================

  /*
    This runs independently.

    Example:

        Flask finishes first.

        completedRequestsInCycle = 1


        Django finishes.

        completedRequestsInCycle = 2


        Java finishes.

        completedRequestsInCycle = 3


        .NET finishes.

        completedRequestsInCycle = 4


    ONLY at 4:

        countdown starts.
  */

  private backendRequestFinished(): void {


    // ============================================================
    // DO NOTHING AFTER DESTROY
    // ============================================================

    if (this.destroyed) {

      return;

    }



    // ============================================================
    // INCREMENT COMPLETED REQUEST COUNT
    // ============================================================

    this.completedRequestsInCycle++;



    // ============================================================
    // UPDATE CURRENT OVERALL STATUS
    // ============================================================

    this.updateOverallSystemStatus();



    // ============================================================
    // REFRESH UI
    // ============================================================

    this.refreshView();



    // ============================================================
    // STILL WAITING FOR OTHER BACKENDS
    // ============================================================

    if (

      this.completedRequestsInCycle < 4

    ) {


      /*
        IMPORTANT:

        DO NOT HIDE.

        DO NOT START COUNTDOWN.

        Keep popup visible.

        Keep showing current runtime states.

        Example:

            Flask   🟢 UP
            Django  🟢 UP
            Java    🟡 CHECKING
            .NET    🟡 CHECKING

        The popup stays open.
      */

      return;

    }



    // ============================================================
    // ALL FOUR FINISHED
    // ============================================================

    this.healthCheckCycleRunning =
      false;



    // ============================================================
    // INITIAL CHECK COMPLETE
    // ============================================================

    this.initialHealthCheckComplete =

      this.flaskFirstResponse &&

      this.djangoFirstResponse &&

      this.javaFirstResponse &&

      this.dotnetFirstResponse;



    // ============================================================
    // CALCULATE FINAL SYSTEM STATUS
    // ============================================================

    this.updateOverallSystemStatus();



    // ============================================================
    // REFRESH BEFORE COUNTDOWN
    // ============================================================

    this.refreshView();



    // ============================================================
    // START 5-SECOND COUNTDOWN
    // ============================================================

    this.startFinalCountdown();

  }



  // ==============================================================
  // MARK FIRST RESPONSE
  // ==============================================================

  /*
    Once a backend responds for the first time:

        firstResponse = true

    This is used to know whether the initial startup check has
    completed.
  */

  private markFirstResponse(

    backend:
      'flask' |
      'django' |
      'java' |
      'dotnet'

  ): void {


    switch (backend) {


      // ========================================================
      // FLASK
      // ========================================================

      case 'flask':

        this.flaskFirstResponse =
          true;

        break;



      // ========================================================
      // DJANGO
      // ========================================================

      case 'django':

        this.djangoFirstResponse =
          true;

        break;



      // ========================================================
      // JAVA
      // ========================================================

      case 'java':

        this.javaFirstResponse =
          true;

        break;



      // ========================================================
      // .NET
      // ========================================================

      case 'dotnet':

        this.dotnetFirstResponse =
          true;

        break;

    }

  }



  // ==============================================================
  // SET BACKEND STATUS
  // ==============================================================

  /*
    Stores the latest runtime result.

    It also marks the backend request as no longer checking.
  */

  private setBackendStatus(

    backend:
      'flask' |
      'django' |
      'java' |
      'dotnet',

    status: boolean

  ): void {


    switch (backend) {


      // ========================================================
      // FLASK
      // ========================================================

      case 'flask':

        this.flaskStatus =
          status;

        this.flaskChecking =
          false;

        break;



      // ========================================================
      // DJANGO
      // ========================================================

      case 'django':

        this.djangoStatus =
          status;

        this.djangoChecking =
          false;

        break;



      // ========================================================
      // JAVA
      // ========================================================

      case 'java':

        this.javaStatus =
          status;

        this.javaChecking =
          false;

        break;



      // ========================================================
      // .NET
      // ========================================================

      case 'dotnet':

        this.dotnetStatus =
          status;

        this.dotnetChecking =
          false;

        break;

    }

  }



  // ==============================================================
  // UPDATE OVERALL SYSTEM STATUS
  // ==============================================================

  /*
    TRAFFIC-LIGHT RULES
    --------------------------------------------------------------

    YELLOW:

        One or more APIs are still checking.

    RED:

        All current requests finished AND at least one backend
        is DOWN.

    GREEN:

        All current requests finished AND all four backends are UP.

    This means the status changes dynamically while the requests
    are actually running.
  */

  private updateOverallSystemStatus(): void {


    // ============================================================
    // IS ANY BACKEND CURRENTLY CHECKING?
    // ============================================================

    const anyChecking =

      this.flaskChecking ||

      this.djangoChecking ||

      this.javaChecking ||

      this.dotnetChecking;



    // ============================================================
    // HAS ANY BACKEND DEFINITELY FAILED?
    // ============================================================

    const anyKnownDown =

      this.flaskStatus === false ||

      this.djangoStatus === false ||

      this.javaStatus === false ||

      this.dotnetStatus === false;



    // ============================================================
    // ARE ALL FOUR DEFINITELY UP?
    // ============================================================

    const allKnownUp =

      this.flaskStatus === true &&

      this.djangoStatus === true &&

      this.javaStatus === true &&

      this.dotnetStatus === true;



    // ============================================================
    // HAVE ALL FOUR RESPONDED AT LEAST ONCE?
    // ============================================================

    const allResponded =

      this.flaskFirstResponse &&

      this.djangoFirstResponse &&

      this.javaFirstResponse &&

      this.dotnetFirstResponse;



    // ============================================================
    // YELLOW
    // ============================================================

    /*
      If any backend is still checking:

          🟡 Checking / Waking Services...
    */

    if (

      anyChecking ||

      !allResponded

    ) {


      this.systemStatus =

        '🟡 Checking / Waking Services...';


      this.statusColor =

        'yellow-status';


      return;

    }



    // ============================================================
    // RED
    // ============================================================

    /*
      At least one backend is DOWN.

          🔴 System Offline / Degraded
    */

    if (anyKnownDown) {


      this.systemStatus =

        '🔴 System Offline / Degraded';


      this.statusColor =

        'red-status';


      return;

    }



    // ============================================================
    // GREEN
    // ============================================================

    /*
      All four are UP.

          🟢 System Ready / All Services Live
    */

    if (allKnownUp) {


      this.systemStatus =

        '🟢 System Ready / All Services Live';


      this.statusColor =

        'green-status';


      return;

    }



    // ============================================================
    // SAFETY FALLBACK
    // ============================================================

    this.systemStatus =

      '🟡 Checking System...';


    this.statusColor =

      'yellow-status';

  }



  // ==============================================================
  // START FINAL COUNTDOWN
  // ==============================================================

  /*
    IMPORTANT:

    This method ONLY runs after all four APIs in the current
    health-check cycle have completed.

    Sequence:

        5
        4
        3
        2
        1
        HIDE
  */

  private startFinalCountdown(): void {


    // ============================================================
    // STOP ANY OLD COUNTDOWN
    // ============================================================

    this.stopCountdown();



    // ============================================================
    // SHOW POPUP
    // ============================================================

    this.showSystemStatus =
      true;



    // ============================================================
    // RESET TO 5
    // ============================================================

    this.countdown =
      this.COUNTDOWN_SECONDS;



    // ============================================================
    // COUNTDOWN IS RUNNING
    // ============================================================

    this.countdownRunning =
      true;



    // ============================================================
    // SET COLOR FOR 5
    // ============================================================

    this.updateCountdownColor();



    // ============================================================
    // REFRESH UI
    // ============================================================

    this.refreshView();



    // ============================================================
    // START ONE-SECOND TIMER
    // ============================================================

    this.countdownTimer =

      setInterval(() => {


        // ========================================================
        // COMPONENT DESTROYED
        // ========================================================

        if (this.destroyed) {


          this.stopCountdown();


          return;

        }



        // ========================================================
        // DECREASE NUMBER
        // ========================================================

        this.countdown--;



        // ========================================================
        // FINISHED
        // ========================================================

        if (

          this.countdown <= 0

        ) {


          // ------------------------------------------------------
          // STOP TIMER
          // ------------------------------------------------------

          this.stopCountdown();



          // ------------------------------------------------------
          // KEEP INTERNAL VALUE AT ZERO
          // ------------------------------------------------------

          this.countdown =
            0;



          // ------------------------------------------------------
          // COUNTDOWN STOPPED
          // ------------------------------------------------------

          this.countdownRunning =
            false;



          // ------------------------------------------------------
          // HIDE POPUP
          // ------------------------------------------------------

          this.showSystemStatus =
            false;



          // ------------------------------------------------------
          // REFRESH UI
          // ------------------------------------------------------

          this.refreshView();



          // ------------------------------------------------------
          // SCHEDULE NEXT MONITORING CYCLE
          // ------------------------------------------------------

          this.scheduleNextHealthCheck();



          return;

        }



        // ========================================================
        // UPDATE COUNTDOWN COLOR
        // ========================================================

        this.updateCountdownColor();



        // ========================================================
        // REFRESH UI
        // ========================================================

        this.refreshView();


      }, 1000);

  }



  // ==============================================================
  // UPDATE COUNTDOWN COLOR
  // ==============================================================

  /*
    Countdown colors:

        5 = RED

        4 = ORANGE

        3 = YELLOW

        2 = GREEN

        1 = BLUE
  */

  private updateCountdownColor(): void {


    switch (this.countdown) {


      // ========================================================
      // 5 = RED
      // ========================================================

      case 5:

        this.countdownColor =
          'countdown-red';

        break;



      // ========================================================
      // 4 = ORANGE
      // ========================================================

      case 4:

        this.countdownColor =
          'countdown-orange';

        break;



      // ========================================================
      // 3 = YELLOW
      // ========================================================

      case 3:

        this.countdownColor =
          'countdown-yellow';

        break;



      // ========================================================
      // 2 = GREEN
      // ========================================================

      case 2:

        this.countdownColor =
          'countdown-green';

        break;



      // ========================================================
      // 1 = BLUE
      // ========================================================

      case 1:

        this.countdownColor =
          'countdown-blue';

        break;



      // ========================================================
      // SAFETY DEFAULT
      // ========================================================

      default:

        this.countdownColor =
          'countdown-red';

        break;

    }

  }



  // ==============================================================
  // SCHEDULE NEXT HEALTH CHECK
  // ==============================================================

  /*
    After:

        5
        4
        3
        2
        1

    the popup disappears.

    Then the application waits 30 seconds.

    Then it checks all four APIs again.
  */

  private scheduleNextHealthCheck(): void {


    // ============================================================
    // DO NOTHING IF DESTROYED
    // ============================================================

    if (this.destroyed) {

      return;

    }



    // ============================================================
    // CLEAR OLD TIMER
    // ============================================================

    if (this.healthCheckTimer) {


      clearTimeout(

        this.healthCheckTimer

      );


      this.healthCheckTimer =
        null;

    }



    // ============================================================
    // CREATE NEW TIMER
    // ============================================================

    this.healthCheckTimer =

      setTimeout(() => {


        // ========================================================
        // DO NOTHING AFTER DESTROY
        // ========================================================

        if (this.destroyed) {

          return;

        }



        // ========================================================
        // START ANOTHER COMPLETE CYCLE
        // ========================================================

        this.startHealthCheckCycle();


      }, this.HEALTH_CHECK_INTERVAL_MS);

  }



  // ==============================================================
  // STOP COUNTDOWN
  // ==============================================================

  /*
    Stops:

        5 -> 4 -> 3 -> 2 -> 1

    timer.
  */

  private stopCountdown(): void {


    if (this.countdownTimer) {


      clearInterval(

        this.countdownTimer

      );


      this.countdownTimer =
        null;

    }

  }



  // ==============================================================
  // REFRESH ANGULAR VIEW
  // ==============================================================

  /*
    Requests normally trigger Angular change detection.

    markForCheck() additionally tells Angular that this view should
    be checked.

    This is useful for keeping the live health information visible
    immediately.
  */

  private refreshView(): void {


    if (this.destroyed) {

      return;

    }


    this.changeDetector.markForCheck();

  }



  // ==============================================================
  // RESPONDED BACKEND COUNT
  // ==============================================================

  /*
    Used by the HTML:

        {{ respondedBackendCount }}/4

    Example:

        0/4 responded

        1/4 responded

        2/4 responded

        3/4 responded

        4/4 responded
  */

  get respondedBackendCount(): number {


    let count =
      0;



    // ============================================================
    // FLASK
    // ============================================================

    if (this.flaskFirstResponse) {

      count++;

    }



    // ============================================================
    // DJANGO
    // ============================================================

    if (this.djangoFirstResponse) {

      count++;

    }



    // ============================================================
    // JAVA
    // ============================================================

    if (this.javaFirstResponse) {

      count++;

    }



    // ============================================================
    // .NET
    // ============================================================

    if (this.dotnetFirstResponse) {

      count++;

    }



    return count;

  }



  // ==============================================================
  // COMPONENT DESTROY
  // ==============================================================

  /*
    IMPORTANT CLEANUP.

    Stop:

        1. Countdown timer.
        2. Next health-check timer.
        3. Active HTTP subscriptions.

    This prevents background work after Angular destroys the
    component.
  */

  ngOnDestroy(): void {


    // ============================================================
    // MARK AS DESTROYED
    // ============================================================

    this.destroyed =
      true;



    // ============================================================
    // STOP COUNTDOWN
    // ============================================================

    this.stopCountdown();



    // ============================================================
    // STOP NEXT HEALTH-CHECK TIMER
    // ============================================================

    if (this.healthCheckTimer) {


      clearTimeout(

        this.healthCheckTimer

      );


      this.healthCheckTimer =
        null;

    }



    // ============================================================
    // CANCEL ACTIVE HTTP REQUESTS
    // ============================================================

    this.activeSubscriptions.forEach(

      (subscription) => {


        subscription.unsubscribe();

      }

    );



    // ============================================================
    // CLEAR SUBSCRIPTION ARRAY
    // ============================================================

    this.activeSubscriptions =
      [];

  }

}
