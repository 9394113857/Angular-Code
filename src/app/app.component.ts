import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Angular_Test_App';

  systemStatus = '🟡 System Warming Up';

  statusColor = 'yellow-status';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    this.http.get('https://django-restapi-r7yj.onrender.com/api/tasks/')
      .subscribe({

        next: () => {

          this.systemStatus = '🟢 System Ready';
          this.statusColor = 'green-status';

        },

        error: () => {

          this.systemStatus = '🔴 System Offline';
          this.statusColor = 'red-status';

        }

      });

  }

}
