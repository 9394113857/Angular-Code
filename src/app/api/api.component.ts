// src/app/api/api.component.ts
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})
export class APIComponent {
  data: any[] = [];
  errorMessage: string = ''; // <-- new
  userInputForm: FormGroup;

  constructor(private apiService: ApiService) {
    this.userInputForm = new FormGroup({
      userInput: new FormControl(5)
    });
  }

  updateDataCount() {
    const userInputValue = this.userInputForm.value.userInput;
    this.getData(userInputValue);
  }

  getData(limit: number) {
    this.errorMessage = ''; // reset previous errors
    this.data = []; // clear old data

    this.apiService.getData(limit).subscribe({
      next: (data) => {
        this.data = data;
      },
      error: (err) => {
        this.errorMessage = err.message; // show friendly message
      }
    });
  }
}
