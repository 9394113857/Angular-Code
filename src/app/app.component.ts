/*
  ==================================================================
  APP COMPONENT
  ==================================================================

  DYNAMIC BACKEND + DATABASE/DATA HEALTH MONITORING

  BACKENDS:

      1. Flask
      2. Django
      3. FastAPI
      4. Java Spring Boot
      5. ASP.NET Core

  FLOW:

      SERVER CHECK
          ↓
      DATABASE/DATA PATH DETECTION
          ↓
      TRY NEXT PATH IF CURRENT PATH FAILS
          ↓
      FIRST VALID JSON 2xx RESPONSE
          ↓
      ALL 5 SERVER + ALL 5 DATA CHECKS UP
          ↓
      5 → 4 → 3 → 2 → 1
          ↓
      POPUP CLOSES

  MAXIMUM WINDOW:

      10 MINUTES

  ACTUAL RESPONSE RECORDS:

      NEVER PRINTED
      NEVER STORED IN COMPONENT STATE
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
// HTTP
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
// BACKEND STATUS
// ==================================================================

type BackendStatus =
  boolean | null;


// ==================================================================
// BACKEND NAME
// ==================================================================

type BackendName =
  'flask' |
  'django' |
  'fastapi' |
  'java' |
  'dotnet';


// ==================================================================
// DATA DETECTION RESULT
// ==================================================================

interface DataDetectionResult {

  detected: boolean;

  endpoint: string;

  httpStatus: number;

  recordCount: string;

}


// ==================================================================
// COMPONENT
// ==================================================================

@Component({

  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.css']

})


export class AppComponent
  implements OnInit, OnDestroy {


  // ================================================================
  // TITLE
  // ================================================================

  title =
    'Angular_Test_App';



  // ================================================================
  // OVERALL STATUS
  // ================================================================

  systemStatus =
    '🟡 Checking / Waking Services...';



  // ================================================================
  // OVERALL STATUS COLOR
  // ================================================================

  statusColor =
    'yellow-status';



  // ================================================================
  // POPUP
  // ================================================================

  showSystemStatus =
    true;



  // ================================================================
  // COUNTDOWN
  // ================================================================

  countdown =
    5;



  countdownColor =
    'countdown-red';



  countdownRunning =
    false;



  // ================================================================
  // SERVER STATUS
  // ================================================================

  flaskStatus:
    BackendStatus = null;


  djangoStatus:
    BackendStatus = null;


  fastapiStatus:
    BackendStatus = null;


  javaStatus:
    BackendStatus = null;


  dotnetStatus:
    BackendStatus = null;



  // ================================================================
  // DATABASE / DATA STATUS
  // ================================================================

  flaskDatabaseStatus:
    BackendStatus = null;


  djangoDatabaseStatus:
    BackendStatus = null;


  fastapiDatabaseStatus:
    BackendStatus = null;


  javaDatabaseStatus:
    BackendStatus = null;


  dotnetDatabaseStatus:
    BackendStatus = null;



  // ================================================================
  // DATA ENDPOINTS FOUND
  //
  // These are intentionally kept separate from the server URLs.
  // ================================================================

  private flaskDatabaseEndpoint =
    'N/A';


  private djangoDatabaseEndpoint =
    'N/A';


  private fastapiDatabaseEndpoint =
    'N/A';


  private javaDatabaseEndpoint =
    'N/A';


  private dotnetDatabaseEndpoint =
    'N/A';



  // ================================================================
  // RECORD METADATA ONLY
  //
  // No actual records are stored.
  // ================================================================

  private flaskRecordCount =
    'N/A';


  private djangoRecordCount =
    'N/A';


  private fastapiRecordCount =
    'N/A';


  private javaRecordCount =
    'N/A';


  private dotnetRecordCount =
    'N/A';



  // ================================================================
  // FIRST SERVER RESPONSE FLAGS
  // ================================================================

  private flaskFirstResponse =
    false;


  private djangoFirstResponse =
    false;


  private fastapiFirstResponse =
    false;


  private javaFirstResponse =
    false;


  private dotnetFirstResponse =
    false;



  // ================================================================
  // MONITORING TIMER
  // ================================================================

  private maximumMonitoringTimer:
    ReturnType<typeof setTimeout> | null = null;


  private monitoringStarted =
    false;



  // ================================================================
  // COUNTDOWN TIMER
  // ================================================================

  private countdownTimer:
    ReturnType<typeof setInterval> | null = null;



  // ================================================================
  // ACTIVE SUBSCRIPTIONS
  // ================================================================

  private activeSubscriptions:
    Subscription[] = [];



  // ================================================================
  // FINAL SUCCESS
  // ================================================================

  private finalSuccessTriggered =
    false;



  // ================================================================
  // DESTROYED
  // ================================================================

  private destroyed =
    false;



  // ================================================================
  // REQUEST TIMEOUT
  // ================================================================

  /*
    Render may need time to wake up.

    Each individual request gets 20 seconds.
  */

  private readonly API_TIMEOUT_MS =
    20000;



  // ================================================================
  // MAXIMUM MONITORING WINDOW
  // ================================================================

  private readonly MAX_MONITORING_TIME_MS =
    10 * 60 * 1000;



  // ================================================================
  // COUNTDOWN
  // ================================================================

  private readonly COUNTDOWN_SECONDS =
    5;



  // ================================================================
  // LIGHTWEIGHT QUERY
  // ================================================================

  /*
    ?limit=1 is only a hint.

    If an API ignores it and returns its normal JSON response,
    we still inspect only JSON structure/metadata.

    We NEVER put actual records into component state.
  */

  private readonly LIGHT_QUERY =
    '?limit=1';



  // ================================================================
  // CONSTRUCTOR
  // ================================================================

  constructor(

    private http: HttpClient,

    private changeDetector: ChangeDetectorRef

  ) {}



  // ================================================================
  // INIT
  // ================================================================

  ngOnInit(): void {

    this.startMonitoring();

  }



  // ================================================================
  // START MONITORING
  // ================================================================

  private startMonitoring(): void {

    if (this.destroyed) {

      return;

    }



    this.showSystemStatus =
      true;



    this.finalSuccessTriggered =
      false;



    this.countdownRunning =
      false;



    this.countdown =
      this.COUNTDOWN_SECONDS;



    this.updateCountdownColor();



    // --------------------------------------------------------------
    // SERVER + DATABASE CHECKS
    // --------------------------------------------------------------

    this.checkBackend(

      'flask',

      'Flask',

      'https://flask-restapi-tzdm.onrender.com/',

      [

        '/api/mobiles',
        '/mobiles',
        '/api/mobile',
        '/mobile'

      ]

    );



    this.checkBackend(

      'django',

      'Django',

      'https://django-restapi-r7yj.onrender.com/',

      [

        '/api/tasks'

      ]

    );



    this.checkBackend(

      'fastapi',

      'FastAPI',

      'https://fastapi-rest-api.onrender.com/',

      [

        '/mobiles',
        '/api/mobiles',
        '/api/mobile',
        '/mobile'

      ]

    );



    /*
      IMPORTANT:

      Java server URL is the ROOT.

      /api/users belongs to the data/database detection phase.
    */

    this.checkBackend(

      'java',

      'Java',

      'https://java-springboot-user-backend.onrender.com/',

      [

        '/api/users'

      ]

    );



    this.checkBackend(

      'dotnet',

      '.NET',

      'https://dotnet-user-service-latest.onrender.com/',

      [

        '/api/users',
        '/users',
        '/api/user',
        '/user'

      ]

    );



    // --------------------------------------------------------------
    // MAXIMUM WINDOW
    // --------------------------------------------------------------

    this.startMaximumMonitoringTimer();



    this.refreshView();

  }



  // ================================================================
  // CHECK COMPLETE BACKEND
  // ================================================================

  private checkBackend(

    backend: BackendName,

    serviceName: string,

    baseUrl: string,

    databasePaths: string[]

  ): void {

    if (this.destroyed) {

      return;

    }



    // --------------------------------------------------------------
    // STEP 1
    // SERVER CHECK
    // --------------------------------------------------------------

    const serverSubscription =

      this.checkServer(

        baseUrl,

        serviceName

      )

      .subscribe({

        next: (isUp: boolean) => {

          this.setBackendStatus(

            backend,

            isUp

          );



          this.markFirstResponse(

            backend

          );



          this.updateOverallSystemStatus();



          this.refreshView();



          /*
            Only attempt database/data detection when the server
            itself is reachable.
          */

          if (!isUp) {

            this.setDatabaseStatus(

              backend,

              false

            );



            this.updateOverallSystemStatus();



            this.refreshView();



            return;

          }



          // --------------------------------------------------------
          // STEP 2
          // DATABASE / DATA DETECTION
          // --------------------------------------------------------

          this.checkDatabaseData(

            backend,

            baseUrl,

            databasePaths

          );

        },



        error: () => {

          this.setBackendStatus(

            backend,

            false

          );



          this.markFirstResponse(

            backend

          );



          this.setDatabaseStatus(

            backend,

            false

          );



          this.updateOverallSystemStatus();



          this.refreshView();

        }

      });



    this.activeSubscriptions.push(

      serverSubscription

    );

  }



  // ================================================================
  // SERVER CHECK
  // ================================================================

  private checkServer(

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

        timeout(

          this.API_TIMEOUT_MS

        ),



        map(() => {

          console.log(

            `🟢 ${serviceName} server responded.`

          );



          return true;

        }),



        catchError((error) => {

          console.warn(

            `🔴 ${serviceName} server check failed.`,

            error

          );



          return of(false);

        }),



        finalize(() => {

          console.log(

            `Server check finished → ${serviceName}`

          );

        })

      );

  }



  // ================================================================
  // DATABASE / DATA DETECTION
  //
  // IMPORTANT:
  //
  // Every configured path is tried.
  //
  // Failed path:
  //
  //     skip
  //     ↓
  //     next path
  //
  // Successful path:
  //
  //     2xx
  //     +
  //     valid JSON
  //     ↓
  //     DATA DETECTED
  // ================================================================

  private checkDatabaseData(

    backend: BackendName,

    baseUrl: string,

    paths: string[]

  ): void {

    if (this.destroyed) {

      return;

    }



    let index =
      0;



    const tryNextPath = (): void => {

      if (this.destroyed) {

        return;

      }



      // ------------------------------------------------------------
      // ALL PATHS FAILED
      // ------------------------------------------------------------

      if (index >= paths.length) {

        this.setDatabaseStatus(

          backend,

          false

        );



        this.updateOverallSystemStatus();



        this.refreshView();



        return;

      }



      const currentPath =
        paths[index];



      index++;



      const url =

        this.buildLightweightUrl(

          baseUrl,

          currentPath

        );



      console.log(

        `🔎 ${backend} data detection → ${currentPath}`

      );



      const subscription =

        this.http

          .get(

            url,

            {

              observe: 'response',

              responseType: 'text'

            }

          )

          .pipe(

            timeout(

              this.API_TIMEOUT_MS

            ),

            map((response) => {

              return this.inspectDataResponse(

                response.status,

                response.body

              );

            }),

            catchError(() => {

              /*
                IMPORTANT:

                Do not fail the entire backend.

                Simply skip this path and continue.
              */

              return of<DataDetectionResult>({

                detected: false,

                endpoint: currentPath,

                httpStatus: 0,

                recordCount: 'N/A'

              });

            }),

            finalize(() => {

              console.log(

                `Data path finished → ${backend}${currentPath}`

              );

            })

          )

          .subscribe({

            next: (result: DataDetectionResult) => {

              // ----------------------------------------------------
              // SUCCESSFUL DATA DETECTION
              // ----------------------------------------------------

              if (result.detected) {

                this.setDatabaseResult(

                  backend,

                  result

                );



                this.updateOverallSystemStatus();



                this.checkForAllChecksSuccessful();



                this.refreshView();



                return;

              }



              // ----------------------------------------------------
              // CURRENT PATH FAILED
              //
              // TRY NEXT PATH
              // ----------------------------------------------------

              tryNextPath();

            },



            error: () => {

              tryNextPath();

            }

          });



      this.activeSubscriptions.push(

        subscription

      );

    };



    // --------------------------------------------------------------
    // START PATH SEARCH
    // --------------------------------------------------------------

    tryNextPath();

  }



  // ================================================================
  // BUILD LIGHTWEIGHT URL
  // ================================================================

  private buildLightweightUrl(

    baseUrl: string,

    path: string

  ): string {

    const cleanBase =

      baseUrl.replace(

        /\/+$/,

        ''

      );



    const cleanPath =

      path.startsWith('/')

        ? path

        : `/${path}`;



    return (

      `${cleanBase}` +

      `${cleanPath}` +

      `${this.LIGHT_QUERY}`

    );

  }



  // ================================================================
  // INSPECT DATA RESPONSE
  //
  // IMPORTANT:
  //
  // We parse JSON only to determine:
  //
  //     - Is it valid JSON?
  //     - Is it a collection?
  //     - Is there count metadata?
  //
  // We do NOT return/store the actual response records.
  // ================================================================

  private inspectDataResponse(

    httpStatus: number,

    body: string | null

  ): DataDetectionResult {

    // --------------------------------------------------------------
    // HTTP MUST BE 2xx
    // --------------------------------------------------------------

    if (

      httpStatus < 200 ||

      httpStatus >= 300

    ) {

      return {

        detected: false,

        endpoint: 'N/A',

        httpStatus,

        recordCount: 'N/A'

      };

    }



    if (!body) {

      return {

        detected: false,

        endpoint: 'N/A',

        httpStatus,

        recordCount: 'N/A'

      };

    }



    // --------------------------------------------------------------
    // PARSE JSON
    // --------------------------------------------------------------

    let parsed: any;



    try {

      parsed =
        JSON.parse(body);

    }

    catch {

      return {

        detected: false,

        endpoint: 'N/A',

        httpStatus,

        recordCount: 'N/A'

      };

    }



    // --------------------------------------------------------------
    // DETECT ONLY METADATA
    // --------------------------------------------------------------

    const recordCount =

      this.detectRecordCount(

        parsed

      );



    /*
      IMPORTANT:

      parsed is local only.

      We do not assign parsed to a component property.

      Therefore actual API records are not retained by the
      monitoring component.
    */

    return {

      detected: true,

      endpoint: 'DETECTED',

      httpStatus,

      recordCount

    };

  }



  // ================================================================
  // RECORD COUNT / METADATA DETECTOR
  // ================================================================

  private detectRecordCount(

    data: any

  ): string {

    // --------------------------------------------------------------
    // DIRECT ARRAY
    // --------------------------------------------------------------

    if (Array.isArray(data)) {

      return String(

        data.length

      );

    }



    // --------------------------------------------------------------
    // COMMON COLLECTION PROPERTIES
    // --------------------------------------------------------------

    const collectionKeys = [

      'data',
      'results',
      'items',
      'users',
      'tasks',
      'mobiles'

    ];



    for (const key of collectionKeys) {

      if (

        data &&

        Array.isArray(data[key])

      ) {

        return String(

          data[key].length

        );

      }

    }



    // --------------------------------------------------------------
    // COMMON METADATA COUNTS
    // --------------------------------------------------------------

    const countKeys = [

      'count',
      'total',
      'totalElements',
      'total_count'

    ];



    for (const key of countKeys) {

      if (

        data &&

        typeof data[key] === 'number'

      ) {

        return String(

          data[key]

        );

      }

    }



    // --------------------------------------------------------------
    // VALID JSON BUT NO COUNT AVAILABLE
    // --------------------------------------------------------------

    return 'DATA_DETECTED';

  }



  // ================================================================
  // SET SERVER STATUS
  // ================================================================

  private setBackendStatus(

    backend: BackendName,

    status: boolean

  ): void {

    switch (backend) {

      case 'flask':

        this.flaskStatus =
          status;

        break;


      case 'django':

        this.djangoStatus =
          status;

        break;


      case 'fastapi':

        this.fastapiStatus =
          status;

        break;


      case 'java':

        this.javaStatus =
          status;

        break;


      case 'dotnet':

        this.dotnetStatus =
          status;

        break;

    }

  }



  // ================================================================
  // SET DATABASE STATUS
  // ================================================================

  private setDatabaseStatus(

    backend: BackendName,

    status: boolean

  ): void {

    switch (backend) {

      case 'flask':

        this.flaskDatabaseStatus =
          status;

        break;


      case 'django':

        this.djangoDatabaseStatus =
          status;

        break;


      case 'fastapi':

        this.fastapiDatabaseStatus =
          status;

        break;


      case 'java':

        this.javaDatabaseStatus =
          status;

        break;


      case 'dotnet':

        this.dotnetDatabaseStatus =
          status;

        break;

    }

  }



  // ================================================================
  // SET DATABASE RESULT
  // ================================================================

  private setDatabaseResult(

    backend: BackendName,

    result: DataDetectionResult

  ): void {

    this.setDatabaseStatus(

      backend,

      true

    );



    /*
      Only safe metadata is retained.
    */

    switch (backend) {

      case 'flask':

        this.flaskDatabaseEndpoint =
          result.endpoint;

        this.flaskRecordCount =
          result.recordCount;

        break;


      case 'django':

        this.djangoDatabaseEndpoint =
          result.endpoint;

        this.djangoRecordCount =
          result.recordCount;

        break;


      case 'fastapi':

        this.fastapiDatabaseEndpoint =
          result.endpoint;

        this.fastapiRecordCount =
          result.recordCount;

        break;


      case 'java':

        this.javaDatabaseEndpoint =
          result.endpoint;

        this.javaRecordCount =
          result.recordCount;

        break;


      case 'dotnet':

        this.dotnetDatabaseEndpoint =
          result.endpoint;

        this.dotnetRecordCount =
          result.recordCount;

        break;

    }

  }



  // ================================================================
  // FIRST SERVER RESPONSE
  // ================================================================

  private markFirstResponse(

    backend: BackendName

  ): void {

    switch (backend) {

      case 'flask':

        this.flaskFirstResponse =
          true;

        break;


      case 'django':

        this.djangoFirstResponse =
          true;

        break;


      case 'fastapi':

        this.fastapiFirstResponse =
          true;

        break;


      case 'java':

        this.javaFirstResponse =
          true;

        break;


      case 'dotnet':

        this.dotnetFirstResponse =
          true;

        break;

    }

  }



  // ================================================================
  // OVERALL SYSTEM STATUS
  // ================================================================

  private updateOverallSystemStatus(): void {

    const allResponded =

      this.flaskFirstResponse &&

      this.djangoFirstResponse &&

      this.fastapiFirstResponse &&

      this.javaFirstResponse &&

      this.dotnetFirstResponse;



    const anyServerDown =

      this.flaskStatus === false ||

      this.djangoStatus === false ||

      this.fastapiStatus === false ||

      this.javaStatus === false ||

      this.dotnetStatus === false;



    const anyDatabaseDown =

      this.flaskDatabaseStatus === false ||

      this.djangoDatabaseStatus === false ||

      this.fastapiDatabaseStatus === false ||

      this.javaDatabaseStatus === false ||

      this.dotnetDatabaseStatus === false;



    if (!allResponded) {

      this.systemStatus =
        '🟡 Checking / Waking Services...';

      this.statusColor =
        'yellow-status';

      return;

    }



    if (

      anyServerDown ||

      anyDatabaseDown

    ) {

      this.systemStatus =
        '🔴 System Offline / Degraded';

      this.statusColor =
        'red-status';

      return;

    }



    if (this.allChecksSuccessful) {

      this.systemStatus =
        '🟢 System Ready / All Services + Data Live';

      this.statusColor =
        'green-status';

      return;

    }



    this.systemStatus =
      '🟡 Detecting Database/Data...';

    this.statusColor =
      'yellow-status';

  }



  // ================================================================
  // CHECK ALL 10 COMPONENTS
  //
  // Required:
  //
  //     5 servers UP
  //     +
  //     5 databases/data layers UP
  // ================================================================

  private checkForAllChecksSuccessful(): void {

    if (this.destroyed) {

      return;

    }



    if (this.finalSuccessTriggered) {

      return;

    }



    if (!this.allChecksSuccessful) {

      return;

    }



    console.log(

      '================================================'

    );


    console.log(

      '🟢🟢🟢 ALL 5 SERVERS + ALL 5 DATA LAYERS ARE LIVE 🟢🟢🟢'

    );


    console.log(

      '================================================'

    );



    this.finalSuccessTriggered =
      true;



    this.systemStatus =
      '🟢 System Ready / All Services + Data Live';



    this.statusColor =
      'green-status';



    // --------------------------------------------------------------
    // Stop maximum timer.
    //
    // Normal successful completion does NOT wait 10 minutes.
    // --------------------------------------------------------------

    this.stopMaximumMonitoringTimer();



    // --------------------------------------------------------------
    // Start 5-second final countdown.
    // --------------------------------------------------------------

    this.startFinalCountdown();



    this.refreshView();

  }



  // ================================================================
  // ALL CHECKS SUCCESSFUL
  // ================================================================

  get allChecksSuccessful(): boolean {

    return (

      this.flaskStatus === true &&

      this.djangoStatus === true &&

      this.fastapiStatus === true &&

      this.javaStatus === true &&

      this.dotnetStatus === true &&


      this.flaskDatabaseStatus === true &&

      this.djangoDatabaseStatus === true &&

      this.fastapiDatabaseStatus === true &&

      this.javaDatabaseStatus === true &&

      this.dotnetDatabaseStatus === true

    );

  }



  // ================================================================
  // ALL CHECKS RUNNING
  // ================================================================

  get allChecksRunning(): boolean {

    return (

      this.respondedBackendCount === 5 &&

      this.detectedDatabaseCount === 5

    );

  }



  // ================================================================
  // RESPONDED SERVER COUNT
  // ================================================================

  get respondedBackendCount(): number {

    let count =
      0;



    if (this.flaskFirstResponse) {

      count++;

    }


    if (this.djangoFirstResponse) {

      count++;

    }


    if (this.fastapiFirstResponse) {

      count++;

    }


    if (this.javaFirstResponse) {

      count++;

    }


    if (this.dotnetFirstResponse) {

      count++;

    }



    return count;

  }



  // ================================================================
  // DATABASE DETECTED COUNT
  // ================================================================

  get detectedDatabaseCount(): number {

    let count =
      0;



    if (this.flaskDatabaseStatus === true) {

      count++;

    }


    if (this.djangoDatabaseStatus === true) {

      count++;

    }


    if (this.fastapiDatabaseStatus === true) {

      count++;

    }


    if (this.javaDatabaseStatus === true) {

      count++;

    }


    if (this.dotnetDatabaseStatus === true) {

      count++;

    }



    return count;

  }



  // ================================================================
  // BACKEND DOT CLASS
  // ================================================================

  getBackendDotClass(

    serverStatus: BackendStatus,

    databaseStatus: BackendStatus

  ): string {

    if (serverStatus === null) {

      return 'dot-yellow';

    }



    if (

      serverStatus === true &&

      databaseStatus === true

    ) {

      return 'dot-green';

    }



    if (

      serverStatus === true &&

      databaseStatus === null

    ) {

      return 'dot-yellow';

    }



    return 'dot-red';

  }



  // ================================================================
  // COMBINED STATUS CLASS
  // ================================================================

  getCombinedStatusClass(

    serverStatus: BackendStatus,

    databaseStatus: BackendStatus

  ): string {

    if (serverStatus === null) {

      return 'backend-checking';

    }



    if (

      serverStatus === true &&

      databaseStatus === true

    ) {

      return 'backend-up';

    }



    if (

      serverStatus === true &&

      databaseStatus === null

    ) {

      return 'backend-checking';

    }



    return 'backend-down';

  }



  // ================================================================
  // START FINAL COUNTDOWN
  // ================================================================

  private startFinalCountdown(): void {

    this.stopCountdown();



    this.showSystemStatus =
      true;



    this.countdown =
      this.COUNTDOWN_SECONDS;



    this.countdownRunning =
      true;



    this.updateCountdownColor();



    this.refreshView();



    this.countdownTimer =

      setInterval(() => {

        if (this.destroyed) {

          this.stopCountdown();

          return;

        }



        this.countdown--;



        if (this.countdown <= 0) {

          this.stopCountdown();



          this.countdownRunning =
            false;



          this.countdown =
            0;



          this.showSystemStatus =
            false;



          this.refreshView();



          console.log(

            '✅ Backend + database health popup automatically closed.'

          );



          return;

        }



        this.updateCountdownColor();



        this.refreshView();

      }, 1000);

  }



  // ================================================================
  // COUNTDOWN COLOR
  // ================================================================

  private updateCountdownColor(): void {

    switch (this.countdown) {

      case 5:

        this.countdownColor =
          'countdown-red';

        break;


      case 4:

        this.countdownColor =
          'countdown-orange';

        break;


      case 3:

        this.countdownColor =
          'countdown-yellow';

        break;


      case 2:

        this.countdownColor =
          'countdown-green';

        break;


      case 1:

        this.countdownColor =
          'countdown-blue';

        break;


      default:

        this.countdownColor =
          'countdown-red';

        break;

    }

  }



  // ================================================================
  // START 10-MINUTE MAXIMUM WINDOW
  // ================================================================

  private startMaximumMonitoringTimer(): void {

    if (this.monitoringStarted) {

      return;

    }



    this.monitoringStarted =
      true;



    this.maximumMonitoringTimer =

      setTimeout(() => {

        if (this.destroyed) {

          return;

        }



        if (this.finalSuccessTriggered) {

          return;

        }



        console.warn(

          '⏰ Maximum 10-minute monitoring window reached.'

        );



        this.systemStatus =
          '🔴 Monitoring timeout reached';



        this.statusColor =
          'red-status';



        this.stopCountdown();



        this.countdownRunning =
          false;



        this.showSystemStatus =
          false;



        this.refreshView();

      }, this.MAX_MONITORING_TIME_MS);

  }



  // ================================================================
  // STOP COUNTDOWN
  // ================================================================

  private stopCountdown(): void {

    if (this.countdownTimer) {

      clearInterval(

        this.countdownTimer

      );


      this.countdownTimer =
        null;

    }

  }



  // ================================================================
  // STOP MAXIMUM TIMER
  // ================================================================

  private stopMaximumMonitoringTimer(): void {

    if (this.maximumMonitoringTimer) {

      clearTimeout(

        this.maximumMonitoringTimer

      );


      this.maximumMonitoringTimer =
        null;

    }



    this.monitoringStarted =
      false;

  }



  // ================================================================
  // REFRESH VIEW
  // ================================================================

  private refreshView(): void {

    if (this.destroyed) {

      return;

    }



    this.changeDetector.markForCheck();

  }



  // ================================================================
  // DESTROY
  // ================================================================

  ngOnDestroy(): void {

    this.destroyed =
      true;



    this.stopCountdown();



    this.stopMaximumMonitoringTimer();



    this.activeSubscriptions.forEach(

      (subscription) => {

        subscription.unsubscribe();

      }

    );



    this.activeSubscriptions =
      [];



    console.log(

      '🧹 Backend + database monitoring cleaned up.'

    );

  }

}
