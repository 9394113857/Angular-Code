import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  data: any[] = [];

  constructor(private http: HttpClient) {}

  updateData() {
    this.getData();
  }

  getData() {
    this.http.get<any[]>('http://127.0.0.1:5000/mobiles') // Specify the response type as any[]
      .subscribe(
        (mobiles) => {
          this.data = mobiles;
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }
  
}//main class