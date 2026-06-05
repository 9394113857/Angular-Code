import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-form-validation',
  templateUrl: './form-validation.component.html',
  styleUrls: ['./form-validation.component.css']
})
export class FormValidationComponent {

  userid: string = '';
  passid: string = '';
  username: string = '';
  address: string = '';
  country: string = 'Default';
  zip: string = '';
  email: string = '';
  sex: string = '';

  onFormSubmit(form: NgForm): void {
    if (this.formValidation(form)) {
      console.log('Form submitted successfully!');
      // You can perform any further actions here
    }
  }

  formValidation(form: NgForm): boolean {
    if (this.userid_validation(this.userid, 5, 12)) {
      if (this.passid_validation(this.passid, 7, 12)) {
        if (this.allLetter(this.username)) {
          if (this.alphanumeric(this.address)) {
            if (this.countryselect(this.country)) {
              if (this.allnumeric(this.zip)) {
                if (this.ValidateEmail(this.email)) {
                  if (this.validsex(this.sex)) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    }
    return false;
  }

  userid_validation(uid: string, mx: number, my: number): boolean {
    const uid_len = uid.length;
    if (uid_len === 0 || uid_len >= my || uid_len < mx) {
      alert(`User Id should not be empty / length be between ${mx} to ${my}`);
      return false;
    }
    return true;
  }

  passid_validation(passid: string, mx: number, my: number): boolean {
    const passid_len = passid.length;
    if (passid_len === 0 || passid_len >= my || passid_len < mx) {
      alert(`Password should not be empty / length be between ${mx} to ${my}`);
      return false;
    }
    return true;
  }

  allLetter(uname: string): boolean {
    const letters = /^[A-Za-z]+$/;
    if (uname.match(letters)) {
      return true;
    } else {
      alert('Username must have alphabet characters only');
      return false;
    }
  }

  alphanumeric(uadd: string): boolean {
    const letters = /^[0-9a-zA-Z]+$/;
    if (uadd.match(letters)) {
      return true;
    } else {
      alert('User address must have alphanumeric characters only');
      return false;
    }
  }

  countryselect(ucountry: string): boolean {
    if (ucountry === 'Default') {
      alert('Select your country from the list');
      return false;
    } else {
      return true;
    }
  }

  allnumeric(uzip: string): boolean {
    const numbers = /^[0-9]+$/;
    if (uzip.match(numbers)) {
      return true;
    } else {
      alert('ZIP code must have numeric characters only');
      return false;
    }
  }

  ValidateEmail(uemail: string): boolean {
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (uemail.match(mailformat)) {
      return true;
    } else {
      alert('You have entered an invalid email address!');
      return false;
    }
  }

  validsex(sex: string): boolean {
    if (sex !== 'Male' && sex !== 'Female') {
      alert('Select Male/Female');
      return false;
    } else {
      alert('Form Successfully Submitted');
      return true;
    }
  }

}//main class
