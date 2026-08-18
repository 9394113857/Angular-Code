/*
  ==================================================================
  APP COMPONENT
  ==================================================================

  DYNAMIC BACKEND HEALTH MONITORING
  ------------------------------------------------------------------

  BACKENDS:

      1. Flask
      2. Django
      3. Java Spring Boot
      4. ASP.NET Core

  ==================================================================

  MAIN BEHAVIOR
  ------------------------------------------------------------------

  WHEN PAGE LOADS:

      🟡 Checking / Waking Services...

      Flask   🟡 WAKING...
      Django  🟡 WAKING...
      Java    🟡 WAKING...
      .NET    🟡 WAKING...

  Each API is checked independently.

  Therefore the UI can become:

      Flask   🟢 UP
      Django  🟡 WAKING...
      Java    🟢 UP
      .NET    🔴 DOWN

  WITHOUT waiting for the other APIs.

  ==================================================================

  IMPORTANT SUCCESS BEHAVIOR
  ------------------------------------------------------------------

  The popup does NOT hide when one API is DOWN.

  It keeps monitoring.

  Example:

      🔴 System Offline / Degraded

      Flask   🟢 UP
      Django  🔴 DOWN
      Java    🟢 UP
      .NET    🟢 UP

  Popup stays visible.

  If Django later becomes UP:

      Flask   🟢 UP
      Django  🟢 UP
      Java    🟢 UP
      .NET    🟢 UP

  Then immediately:

      🟢 ALL SERVICES ARE LIVE!

  And:

      5
      4
      3
      2
      1

  Then:

      HIDE

  ==================================================================

  10-MINUTE SAFETY LIMIT
  ------------------------------------------------------------------

  There is a maximum monitoring window:

      10 MINUTES

  If all services never become healthy within that time:

      Popup automatically hides.

  This is ONLY the worst-case safety exit.

  Normally, when all four become UP, the popup exits immediately
  after the 5-second countdown.

  ==================================================================

  COUNTDOWN
  ------------------------------------------------------------------

      5 = RED
      4 = ORANGE
      3 = YELLOW
      2 = GREEN
      1 = BLUE

  Every number blinks.

  ==================================================================

  IMPORTANT DESIGN DECISION
  ------------------------------------------------------------------

  We intentionally DO NOT use forkJoin().

  forkJoin() waits for every observable before emitting.

  Here we want LIVE runtime updates.

  So each backend has its own subscription.

  ==================================================================
*/


// ==================================================================
// ANGULAR
// ==================================================================

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';


// ==================================================================
// HTTP CLIENT
// ==================================================================

import {
  HttpClient
} from '@angular/common/http';


// ==================================================================
// RXJS
// ==================================================================

import {
  Observable,
  of,
  Subscription
} from 'rxjs';


// ==================================================================
// RXJS OPERATORS
// ==================================================================

import {
  catchError,
  finalize,
  map,
  timeout
} from 'rxjs/operators';



// ==================================================================
// BACKEND STATUS TYPE
// ==================================================================

/*
  null:

      The backend has not responded yet.

  true:

      Backend is UP.

  false:

      Backend is DOWN.
*/

type BackendStatus =
  boolean | null;



// ==================================================================
// COMPONENT
// ==================================================================

@Component({

  // ----------------------------------------------------------------
  // ROOT SELECTOR
  // ----------------------------------------------------------------

  selector: 'app-root',


  // ----------------------------------------------------------------
  // HTML FILE
  // ----------------------------------------------------------------

  templateUrl: './app.component.html',


  // ----------------------------------------------------------------
  // CSS FILE
  // ----------------------------------------------------------------

  styleUrls: ['./app.component.css']

})



// ==================================================================
// APP COMPONENT CLASS
// ==================================================================

export class AppComponent
  implements OnInit, OnDestroy {



  // ================================================================
  // APPLICATION TITLE
  // ================================================================

  title =
    'Angular_Test_App';



  // ================================================================
  // OVERALL SYSTEM STATUS
  // ================================================================

  /*
    Possible states:

        🟡 Checking / Waking Services...

        🔴 System Offline / Degraded

        🟢 System Ready / All Services Live
  */

  systemStatus =
    '🟡 Checking / Waking Services...';



  // ================================================================
  // OVERALL STATUS CSS CLASS
  // ================================================================

  /*
    Used by HTML:

        [ngClass]="statusColor"

    Possible values:

        yellow-status
        red-status
        green-status
  */

  statusColor =
    'yellow-status';



  // ================================================================
  // POPUP VISIBILITY
  // ================================================================

  /*
    TRUE:

        Popup is visible.

    FALSE:

        Popup is hidden.
  */

  showSystemStatus =
    true;



  // ================================================================
  // COUNTDOWN
  // ================================================================

  /*
    Final exit countdown:

        5
        4
        3
        2
        1

    Then popup hides.
  */

  countdown =
    5;



  // ================================================================
  // COUNTDOWN COLOR
  // ================================================================

  /*
    5 = RED
    4 = ORANGE
    3 = YELLOW
    2 = GREEN
    1 = BLUE
  */

  countdownColor =
    'countdown-red';



  // ================================================================
  // COUNTDOWN RUNNING
  // ================================================================

  /*
    FALSE:

        We are still monitoring.

    TRUE:

        The system is healthy and the final 5-4-3-2-1 exit is
        running.
  */

  countdownRunning =
    false;



  // ================================================================
  // FLASK STATUS
  // ================================================================

  /*
    null = not responded yet
    true = UP
    false = DOWN
  */

  flaskStatus:
    BackendStatus = null;



  // ================================================================
  // DJANGO STATUS
  // ================================================================

  djangoStatus:
    BackendStatus = null;



  // ================================================================
  // JAVA STATUS
  // ================================================================

  javaStatus:
    BackendStatus = null;



  // ================================================================
  // .NET STATUS
  // ================================================================

  dotnetStatus:
    BackendStatus = null;



  // ================================================================
  // FIRST RESPONSE FLAGS
  // ================================================================

  /*
    These tell us whether each backend has responded at least once
    during the current monitoring session.

    They are different from the actual status.

    Example:

        Django responds DOWN.

    Then:

        djangoFirstResponse = true

        djangoStatus = false
  */

  private flaskFirstResponse =
    false;

  private djangoFirstResponse =
    false;

  private javaFirstResponse =
    false;

  private dotnetFirstResponse =
    false;



  // ================================================================
  // MONITORING STARTED
  // ================================================================

  /*
    Used to make sure the 10-minute maximum timer starts only once.
  */

  private monitoringStarted =
    false;



  // ================================================================
  // ALL SERVICES HAVE BEEN UP
  // ================================================================

  /*
    TRUE:

        All four services have simultaneously reported UP.

    Once this becomes true, the final countdown starts.
  */

  private finalSuccessTriggered =
    false;



  // ================================================================
  // COUNTDOWN TIMER
  // ================================================================

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



  // ================================================================
  // TEN-MINUTE SAFETY TIMER
  // ================================================================

  /*
    Worst-case safety timer.

    If all services never become healthy:

        10 minutes
        ↓
        popup hides
  */

  private maximumMonitoringTimer:
    ReturnType<typeof setTimeout> | null = null;



  // ================================================================
  // ACTIVE HTTP SUBSCRIPTIONS
  // ================================================================

  /*
    All backend subscriptions are stored here.

    They are cancelled when Angular destroys this component.
  */

  private activeSubscriptions:
    Subscription[] = [];



  // ================================================================
  // API TIMEOUT
  // ================================================================

  /*
    Render services can sleep.

    Give every API up to 20 seconds for an individual request.

    If it still doesn't respond:

        DOWN
  */

  private readonly API_TIMEOUT_MS =
    20000;



  // ================================================================
  // MAXIMUM MONITORING TIME
  // ================================================================

  /*
    10 minutes.

        10 minutes
        ×
        60 seconds
        ×
        1000 milliseconds

        = 600000 ms
  */

  private readonly MAX_MONITORING_TIME_MS =
    10 * 60 * 1000;



  // ================================================================
  // COUNTDOWN START VALUE
  // ================================================================

  private readonly COUNTDOWN_SECONDS =
    5;



  // ================================================================
  // COMPONENT DESTROYED
  // ================================================================

  /*
    Prevents asynchronous callbacks from modifying the component
    after Angular destroys it.
  */

  private destroyed =
    false;



  // ================================================================
  // CONSTRUCTOR
  // ================================================================

  constructor(

    private http: HttpClient,

    private changeDetector: ChangeDetectorRef

  ) {}



  // ================================================================
  // ANGULAR INITIALIZATION
  // ================================================================

  ngOnInit(): void {


    /*
      ==============================================================
      START MONITORING
      ==============================================================

      The popup is immediately visible.

      All APIs start independently.
    */

    this.startMonitoring();

  }



  // ================================================================
  // START MONITORING
  // ================================================================

  /*
    This is the main startup method.

    It performs two things:

        1. Starts the 10-minute safety timer.
        2. Starts all four backend checks.
  */

  private startMonitoring(): void {


    // ==============================================================
    // SAFETY
    // ==============================================================

    if (this.destroyed) {

      return;

    }



    // ==============================================================
    // SHOW POPUP
    // ==============================================================

    this.showSystemStatus =
      true;



    // ==============================================================
    // RESET FINAL SUCCESS
    // ==============================================================

    this.finalSuccessTriggered =
      false;



    // ==============================================================
    // RESET COUNTDOWN
    // ==============================================================

    this.countdown =
      this.COUNTDOWN_SECONDS;



    // ==============================================================
    // COUNTDOWN NOT RUNNING YET
    // ==============================================================

    this.countdownRunning =
      false;



    // ==============================================================
    // RESET COUNTDOWN COLOR
    // ==============================================================

    this.updateCountdownColor();



    // ==============================================================
    // START TEN-MINUTE SAFETY TIMER
    // ==============================================================

    this.startMaximumMonitoringTimer();



    // ==============================================================
    // START FLASK
    // ==============================================================

    this.checkBackend(

      'flask',

      'Flask',

      'https://flask-restapi-tzdm.onrender.com/'

    );



    // ==============================================================
    // START DJANGO
    // ==============================================================

    this.checkBackend(

      'django',

      'Django',

      'https://django-restapi-r7yj.onrender.com/'

    );



    // ==============================================================
    // START JAVA
    // ==============================================================

    this.checkBackend(

      'java',

      'Java',

      'https://java-springboot-user-backend.onrender.com/api/users'

    );



    // ==============================================================
    // START .NET
    // ==============================================================

    this.checkBackend(

      'dotnet',

      '.NET',

      'https://dotnet-user-service-latest.onrender.com/'

    );



    // ==============================================================
    // INITIAL UI REFRESH
    // ==============================================================

    this.refreshView();

  }



  // ================================================================
  // START MAXIMUM 10-MINUTE TIMER
  // ================================================================

  /*
    IMPORTANT:

    This timer is NOT the normal exit timer.

    It is only the emergency/safety exit.

    Normal flow:

        all 4 UP
        ↓
        5
        4
        3
        2
        1
        ↓
        hide

    Worst-case flow:

        something remains DOWN / never responds
        ↓
        wait
        ↓
        10 minutes reached
        ↓
        hide
  */

  private startMaximumMonitoringTimer(): void {


    // ==============================================================
    // DO NOT START TWICE
    // ==============================================================

    if (this.monitoringStarted) {

      return;

    }



    // ==============================================================
    // MARK STARTED
    // ==============================================================

    this.monitoringStarted =
      true;



    // ==============================================================
    // CREATE 10-MINUTE TIMER
    // ==============================================================

    this.maximumMonitoringTimer =

      setTimeout(() => {


        // ==========================================================
        // COMPONENT DESTROYED
        // ==========================================================

        if (this.destroyed) {

          return;

        }



        // ==========================================================
        // IF FINAL SUCCESS ALREADY HAPPENED
        // ==========================================================

        /*
          If all services already became UP, the normal countdown
          should handle the popup.

          Therefore the 10-minute timer does nothing.
        */

        if (this.finalSuccessTriggered) {

          return;

        }



        // ==========================================================
        // TEN MINUTES REACHED
        // ==========================================================

        console.warn(

          '⏰ Maximum 10-minute monitoring window reached.'

        );



        // ==========================================================
        // UPDATE FINAL STATUS MESSAGE
        // ==========================================================

        this.systemStatus =
          '🔴 Monitoring timeout reached';



        this.statusColor =
          'red-status';



        // ==========================================================
        // STOP ANY COUNTDOWN
        // ==========================================================

        this.stopCountdown();



        // ==========================================================
        // HIDE POPUP
        // ==========================================================

        this.showSystemStatus =
          false;



        // ==========================================================
        // REFRESH UI
        // ==========================================================

        this.refreshView();


      }, this.MAX_MONITORING_TIME_MS);

  }



  // ================================================================
  // CHECK INDIVIDUAL BACKEND
  // ================================================================

  /*
    Each backend gets its own independent request.

    This means:

        Flask can respond first.

        Java can respond second.

        Django can respond later.

        .NET can respond last.

    The UI updates after each response.
  */

  private checkBackend(

    backend:
      'flask' |
      'django' |
      'java' |
      'dotnet',

    serviceName: string,

    url: string

  ): void {


    // ==============================================================
    // SAFETY
    // ==============================================================

    if (this.destroyed) {

      return;

    }



    // ==============================================================
    // START REQUEST
    // ==============================================================

    const request$ =
      this.checkApi(

        url,

        serviceName

      );



    // ==============================================================
    // SUBSCRIBE
    // ==============================================================

    const subscription =
      request$.subscribe({

        // ==========================================================
        // RESPONSE
        // ==========================================================

        next: (isUp: boolean) => {


          // ========================================================
          // STORE RESULT
          // ========================================================

          this.setBackendStatus(

            backend,

            isUp

          );



          // ========================================================
          // MARK FIRST RESPONSE
          // ========================================================

          this.markFirstResponse(

            backend

          );



          // ========================================================
          // UPDATE OVERALL STATUS
          // ========================================================

          this.updateOverallSystemStatus();



          // ========================================================
          // CHECK WHETHER ALL FOUR ARE NOW UP
          // ========================================================

          this.checkForAllServicesLive();



          // ========================================================
          // UPDATE UI
          // ========================================================

          this.refreshView();



          // ========================================================
          // CONSOLE
          // ========================================================

          console.log(

            `Runtime Health → ${serviceName}:`,

            isUp
              ? '🟢 UP'
              : '🔴 DOWN'

          );

        },



        // ==========================================================
        // UNEXPECTED ERROR
        // ==========================================================

        error: (error) => {


          console.error(

            `Unexpected ${serviceName} health error:`,

            error

          );



          // --------------------------------------------------------
          // TREAT ERROR AS DOWN
          // --------------------------------------------------------

          this.setBackendStatus(

            backend,

            false

          );



          // --------------------------------------------------------
          // MARK AS RESPONDED
          // --------------------------------------------------------

          this.markFirstResponse(

            backend

          );



          // --------------------------------------------------------
          // UPDATE STATUS
          // --------------------------------------------------------

          this.updateOverallSystemStatus();



          // --------------------------------------------------------
          // CHECK ALL LIVE
          // --------------------------------------------------------

          this.checkForAllServicesLive();



          // --------------------------------------------------------
          // REFRESH UI
          // --------------------------------------------------------

          this.refreshView();

        }

      });



    // ==============================================================
    // STORE SUBSCRIPTION
    // ==============================================================

    this.activeSubscriptions.push(

      subscription

    );

  }



  // ================================================================
  // GENERIC API CHECK
  // ================================================================

  /*
    Every API:

        SUCCESS
            ↓
          true

        ERROR
            ↓
          false

        TIMEOUT
            ↓
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
            We only care whether the API responds.

            The actual response body is irrelevant.
          */

          responseType: 'text'

        }

      )

      .pipe(


        // ==========================================================
        // 20-SECOND REQUEST TIMEOUT
        // ==========================================================

        timeout(

          this.API_TIMEOUT_MS

        ),



        // ==========================================================
        // SUCCESS
        // ==========================================================

        map(() => {


          console.log(

            `🟢 ${serviceName} responded successfully.`,

            url

          );



          return true;

        }),



        // ==========================================================
        // ERROR
        // ==========================================================

        catchError((error) => {


          console.error(

            `🔴 ${serviceName} health check failed.`,

            url,

            error

          );



          /*
            Any failure means:

                DOWN
          */

          return of(false);

        }),



        // ==========================================================
        // FINALIZE
        // ==========================================================

        /*
          finalize() is useful for cleanup.

          It runs whether the request:

              succeeds
              fails
              times out
              gets unsubscribed
        */

        finalize(() => {


          console.log(

            `Health request finished → ${serviceName}`

          );

        })

      );

  }



  // ================================================================
  // SET BACKEND STATUS
  // ================================================================

  private setBackendStatus(

    backend:
      'flask' |
      'django' |
      'java' |
      'dotnet',

    status: boolean

  ): void {


    switch (backend) {


      // ============================================================
      // FLASK
      // ============================================================

      case 'flask':

        this.flaskStatus =
          status;

        break;



      // ============================================================
      // DJANGO
      // ============================================================

      case 'django':

        this.djangoStatus =
          status;

        break;



      // ============================================================
      // JAVA
      // ============================================================

      case 'java':

        this.javaStatus =
          status;

        break;



      // ============================================================
      // .NET
      // ============================================================

      case 'dotnet':

        this.dotnetStatus =
          status;

        break;

    }

  }



  // ================================================================
  // MARK FIRST RESPONSE
  // ================================================================

  private markFirstResponse(

    backend:
      'flask' |
      'django' |
      'java' |
      'dotnet'

  ): void {


    switch (backend) {


      // ============================================================
      // FLASK
      // ============================================================

      case 'flask':

        this.flaskFirstResponse =
          true;

        break;



      // ============================================================
      // DJANGO
      // ============================================================

      case 'django':

        this.djangoFirstResponse =
          true;

        break;



      // ============================================================
      // JAVA
      // ============================================================

      case 'java':

        this.javaFirstResponse =
          true;

        break;



      // ============================================================
      // .NET
      // ============================================================

      case 'dotnet':

        this.dotnetFirstResponse =
          true;

        break;

    }

  }



  // ================================================================
  // UPDATE OVERALL SYSTEM STATUS
  // ================================================================

  /*
    This method controls the main traffic-light state.

    ---------------------------------------------------------------

    YELLOW

      If one or more APIs have not responded yet.

    ---------------------------------------------------------------

    RED

      If all four have responded and at least one is DOWN.

    ---------------------------------------------------------------

    GREEN

      If all four are UP.

    ---------------------------------------------------------------

    IMPORTANT:

      RED DOES NOT HIDE THE POPUP.

      It stays visible until:

          all four become UP

      OR:

          10-minute safety timeout.
  */

  private updateOverallSystemStatus(): void {


    // ==============================================================
    // CHECK WHETHER ALL FOUR HAVE RESPONDED
    // ==============================================================

    const allResponded =

      this.flaskFirstResponse &&

      this.djangoFirstResponse &&

      this.javaFirstResponse &&

      this.dotnetFirstResponse;



    // ==============================================================
    // CHECK WHETHER ALL FOUR ARE UP
    // ==============================================================

    const allUp =

      this.flaskStatus === true &&

      this.djangoStatus === true &&

      this.javaStatus === true &&

      this.dotnetStatus === true;



    // ==============================================================
    // CHECK WHETHER ANY SERVICE IS DOWN
    // ==============================================================

    const anyDown =

      this.flaskStatus === false ||

      this.djangoStatus === false ||

      this.javaStatus === false ||

      this.dotnetStatus === false;



    // ==============================================================
    // YELLOW
    // ==============================================================

    /*
      If at least one backend hasn't responded yet:

          🟡 Checking / Waking Services...
    */

    if (!allResponded) {


      this.systemStatus =
        '🟡 Checking / Waking Services...';


      this.statusColor =
        'yellow-status';


      return;

    }



    // ==============================================================
    // RED
    // ==============================================================

    /*
      All four responded but something is DOWN:

          🔴 System Offline / Degraded

      KEEP POPUP OPEN.
    */

    if (anyDown) {


      this.systemStatus =
        '🔴 System Offline / Degraded';


      this.statusColor =
        'red-status';


      return;

    }



    // ==============================================================
    // GREEN
    // ==============================================================

    /*
      All four are UP.

          🟢 System Ready / All Services Live
    */

    if (allUp) {


      this.systemStatus =
        '🟢 System Ready / All Services Live';


      this.statusColor =
        'green-status';


      return;

    }



    // ==============================================================
    // SAFETY FALLBACK
    // ==============================================================

    this.systemStatus =
      '🟡 Checking / Waking Services...';


    this.statusColor =
      'yellow-status';

  }



  // ================================================================
  // CHECK FOR ALL SERVICES LIVE
  // ================================================================

  /*
    THIS IS THE MOST IMPORTANT METHOD.

    Every time ANY backend responds, this method runs.

    Example:

        Flask  = true
        Django = false
        Java   = true
        .NET   = true

        -> nothing happens.

    Later Django becomes true:

        Flask  = true
        Django = true
        Java   = true
        .NET   = true

        -> immediately start final countdown.
  */

  private checkForAllServicesLive(): void {


    // ==============================================================
    // DO NOTHING IF DESTROYED
    // ==============================================================

    if (this.destroyed) {

      return;

    }



    // ==============================================================
    // DO NOT RUN TWICE
    // ==============================================================

    if (this.finalSuccessTriggered) {

      return;

    }



    // ==============================================================
    // CHECK ALL FOUR
    // ==============================================================

    const allServicesUp =

      this.flaskStatus === true &&

      this.djangoStatus === true &&

      this.javaStatus === true &&

      this.dotnetStatus === true;



    // ==============================================================
    // NOT ALL UP YET
    // ==============================================================

    if (!allServicesUp) {

      return;

    }



    // ==============================================================
    // ALL FOUR ARE LIVE
    // ==============================================================

    console.log(

      '================================================'

    );

    console.log(

      '🟢🟢🟢 ALL FOUR BACKENDS ARE LIVE 🟢🟢🟢'

    );

    console.log(

      '================================================'

    );



    // ==============================================================
    // MARK SUCCESS
    // ==============================================================

    this.finalSuccessTriggered =
      true;



    // ==============================================================
    // UPDATE GREEN STATUS
    // ==============================================================

    this.systemStatus =
      '🟢 System Ready / All Services Live';


    this.statusColor =
      'green-status';



    // ==============================================================
    // STOP 10-MINUTE SAFETY TIMER
    // ==============================================================

    /*
      We don't need the emergency timeout anymore.

      The normal 5-4-3-2-1 countdown is now in control.
    */

    this.stopMaximumMonitoringTimer();



    // ==============================================================
    // START FINAL COUNTDOWN
    // ==============================================================

    this.startFinalCountdown();



    // ==============================================================
    // REFRESH UI
    // ==============================================================

    this.refreshView();

  }



  // ================================================================
  // START FINAL COUNTDOWN
  // ================================================================

  /*
    NORMAL SUCCESS EXIT:

        ALL FOUR UP
             ↓
        🟢 ALL LIVE
             ↓
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

    The countdown starts immediately when all four are UP.
  */

  private startFinalCountdown(): void {


    // ==============================================================
    // STOP ANY EXISTING COUNTDOWN
    // ==============================================================

    this.stopCountdown();



    // ==============================================================
    // SHOW POPUP
    // ==============================================================

    this.showSystemStatus =
      true;



    // ==============================================================
    // SET COUNTDOWN TO 5
    // ==============================================================

    this.countdown =
      this.COUNTDOWN_SECONDS;



    // ==============================================================
    // ENABLE COUNTDOWN
    // ==============================================================

    this.countdownRunning =
      true;



    // ==============================================================
    // SET 5 COLOR
    // ==============================================================

    this.updateCountdownColor();



    // ==============================================================
    // REFRESH
    // ==============================================================

    this.refreshView();



    // ==============================================================
    // START TIMER
    // ==============================================================

    this.countdownTimer =

      setInterval(() => {


        // ==========================================================
        // COMPONENT DESTROYED
        // ==========================================================

        if (this.destroyed) {


          this.stopCountdown();


          return;

        }



        // ==========================================================
        // DECREASE
        // ==========================================================

        this.countdown--;



        // ==========================================================
        // COUNTDOWN FINISHED
        // ==========================================================

        if (this.countdown <= 0) {


          // --------------------------------------------------------
          // STOP TIMER
          // --------------------------------------------------------

          this.stopCountdown();



          // --------------------------------------------------------
          // COUNTDOWN OFF
          // --------------------------------------------------------

          this.countdownRunning =
            false;



          // --------------------------------------------------------
          // KEEP INTERNAL NUMBER AT ZERO
          // --------------------------------------------------------

          this.countdown =
            0;



          // --------------------------------------------------------
          // HIDE POPUP
          // --------------------------------------------------------

          this.showSystemStatus =
            false;



          // --------------------------------------------------------
          // REFRESH UI
          // --------------------------------------------------------

          this.refreshView();



          console.log(

            '✅ Backend health popup automatically closed.'

          );


          return;

        }



        // ==========================================================
        // UPDATE COUNTDOWN COLOR
        // ==========================================================

        this.updateCountdownColor();



        // ==========================================================
        // REFRESH UI
        // ==========================================================

        this.refreshView();


      }, 1000);

  }



  // ================================================================
  // UPDATE COUNTDOWN COLOR
  // ================================================================

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


      // ============================================================
      // 5
      // ============================================================

      case 5:

        this.countdownColor =
          'countdown-red';

        break;



      // ============================================================
      // 4
      // ============================================================

      case 4:

        this.countdownColor =
          'countdown-orange';

        break;



      // ============================================================
      // 3
      // ============================================================

      case 3:

        this.countdownColor =
          'countdown-yellow';

        break;



      // ============================================================
      // 2
      // ============================================================

      case 2:

        this.countdownColor =
          'countdown-green';

        break;



      // ============================================================
      // 1
      // ============================================================

      case 1:

        this.countdownColor =
          'countdown-blue';

        break;



      // ============================================================
      // DEFAULT
      // ============================================================

      default:

        this.countdownColor =
          'countdown-red';

        break;

    }

  }



  // ================================================================
  // STOP COUNTDOWN
  // ================================================================

  private stopCountdown(): void {


    // ==============================================================
    // CHECK TIMER
    // ==============================================================

    if (this.countdownTimer) {


      clearInterval(

        this.countdownTimer

      );


      this.countdownTimer =
        null;

    }

  }



  // ================================================================
  // STOP MAXIMUM MONITORING TIMER
  // ================================================================

  private stopMaximumMonitoringTimer(): void {


    // ==============================================================
    // CHECK TIMER
    // ==============================================================

    if (this.maximumMonitoringTimer) {


      clearTimeout(

        this.maximumMonitoringTimer

      );


      this.maximumMonitoringTimer =
        null;

    }



    // ==============================================================
    // RESET FLAG
    // ==============================================================

    this.monitoringStarted =
      false;

  }



  // ================================================================
  // RESPONDED BACKEND COUNT
  // ================================================================

  /*
    Used by HTML:

        {{ respondedBackendCount }}

    Examples:

        0 / 4

        1 / 4

        2 / 4

        3 / 4

        4 / 4
  */

  get respondedBackendCount(): number {


    let count =
      0;



    // ==============================================================
    // FLASK
    // ==============================================================

    if (this.flaskFirstResponse) {

      count++;

    }



    // ==============================================================
    // DJANGO
    // ==============================================================

    if (this.djangoFirstResponse) {

      count++;

    }



    // ==============================================================
    // JAVA
    // ==============================================================

    if (this.javaFirstResponse) {

      count++;

    }



    // ==============================================================
    // .NET
    // ==============================================================

    if (this.dotnetFirstResponse) {

      count++;

    }



    return count;

  }



  // ================================================================
  // ALL SERVICES RUNNING GETTER
  // ================================================================

  /*
    The HTML uses:

        *ngIf="allServicesRunning"

    This returns TRUE only when:

        Flask  = UP
        Django = UP
        Java   = UP
        .NET   = UP
  */

  get allServicesRunning(): boolean {


    return (

      this.flaskStatus === true &&

      this.djangoStatus === true &&

      this.javaStatus === true &&

      this.dotnetStatus === true

    );

  }



  // ================================================================
  // ANGULAR VIEW REFRESH
  // ================================================================

  /*
    Forces Angular to check the live values.

    This helps make the status changes appear immediately.
  */

  private refreshView(): void {


    // ==============================================================
    // DO NOTHING AFTER DESTROY
    // ==============================================================

    if (this.destroyed) {

      return;

    }



    // ==============================================================
    // REQUEST CHANGE DETECTION
    // ==============================================================

    this.changeDetector.markForCheck();

  }



  // ================================================================
  // COMPONENT DESTROY
  // ================================================================

  /*
    IMPORTANT CLEANUP.

    When Angular destroys the application component:

        1. Stop countdown.
        2. Stop 10-minute timer.
        3. Cancel HTTP subscriptions.
        4. Prevent future callbacks.
  */

  ngOnDestroy(): void {


    // ==============================================================
    // MARK DESTROYED
    // ==============================================================

    this.destroyed =
      true;



    // ==============================================================
    // STOP COUNTDOWN
    // ==============================================================

    this.stopCountdown();



    // ==============================================================
    // STOP 10-MINUTE TIMER
    // ==============================================================

    this.stopMaximumMonitoringTimer();



    // ==============================================================
    // CANCEL ALL HTTP REQUESTS
    // ==============================================================

    this.activeSubscriptions.forEach(

      (subscription) => {


        subscription.unsubscribe();

      }

    );



    // ==============================================================
    // CLEAR SUBSCRIPTIONS
    // ==============================================================

    this.activeSubscriptions =
      [];



    // ==============================================================
    // DEBUG
    // ==============================================================

    console.log(

      '🧹 Backend health monitoring cleaned up.'

    );

  }

}
