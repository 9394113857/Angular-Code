import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-random',
  templateUrl: './random.component.html',
  styleUrls: ['./random.component.css']
})
export class RandomComponent {

  data: any[] = []; // Initialize as an empty array
  userInputForm: FormGroup;

  constructor(private http: HttpClient) {
    this.userInputForm = new FormGroup({
      userInput: new FormControl(5) // Default value
    });
  }

  updateDataCount() {
    this.getData();
  }

  getData() {
    const userInputValue = this.userInputForm.value.userInput;
    this.http.get<any[]>(`https://fakestoreapi.com/products?limit=${userInputValue}`)
      .subscribe((data) => {
        this.data = data;
      });
  }

}
