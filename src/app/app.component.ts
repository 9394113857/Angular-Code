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

  systemStatus = '🟡 System Warming Up';
  statusColor = 'yellow-status';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Flask API
    const flaskApi = this.http
      .get('https://flask-restapi-tzdm.onrender.com/')
      .pipe(
        catchError(() => of(null))
      );

    // Django API
    const djangoApi = this.http
      .get('https://django-restapi-r7yj.onrender.com/api/tasks/')
      .pipe(
        catchError(() => of(null))
      );

    // ASP.NET Core .NET 9 API
    const dotnetApi = this.http
      .get('https://dotnet-user-service-latest.onrender.com/health')
      .pipe(
        catchError(() => of(null))
      );

    // Check all three services
    forkJoin({
      flask: flaskApi,
      django: djangoApi,
      dotnet: dotnetApi,
    }).subscribe({
      next: (response) => {
        const flaskIsRunning = response.flask !== null;
        const djangoIsRunning = response.django !== null;
        const dotnetIsRunning = response.dotnet !== null;

        if (flaskIsRunning && djangoIsRunning && dotnetIsRunning) {
          this.systemStatus = '🟢 System Ready';
          this.statusColor = 'green-status';
        } else {
          this.systemStatus = '🔴 System Offline';
          this.statusColor = 'red-status';
        }
      },

      error: () => {
        this.systemStatus = '🔴 System Offline';
        this.statusColor = 'red-status';
      },
    });
  }
}
