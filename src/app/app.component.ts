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
    const flaskApi = this.http
      .get('https://flask-restapi-tzdm.onrender.com/')
      .pipe(catchError(() => of(null)));

    const djangoApi = this.http
      .get('https://django-restapi-r7yj.onrender.com/api/tasks/')
      .pipe(catchError(() => of(null)));

    forkJoin({
      flask: flaskApi,
      django: djangoApi,
    }).subscribe({
      next: (response) => {
        const flaskIsRunning = response.flask !== null;
        const djangoIsRunning = response.django !== null;

        if (flaskIsRunning && djangoIsRunning) {
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
