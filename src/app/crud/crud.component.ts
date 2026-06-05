import { Component, OnInit } from '@angular/core';
import { MobileService } from '../mobile.service';

interface Mobile {
  id?: number | null;
  name: string;
  price: number;
  ram: number;
  storage: number;
}

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent {
  formHeader: string = "Add mobile";
  mobiles: Mobile[] | undefined;
  mobileName: string = "";
  price: number = 0;
  ram: number = 0;
  storage: number = 0;
  showForm: boolean = false;
  id: number | null = null;

  constructor(private ms: MobileService) {}

  ngOnInit(): void {
    this.getMobiles();
  }

  getMobiles() {
    this.ms.fetchMobiles().subscribe(
      (data: Mobile[]) => {
        this.mobiles = data;
      },
      (error: any) => {
        console.log("Error fetching mobiles:", error);
      }
    );
  }

  deleteMobile(id: number | null) {
    if (id !== null) {
      this.ms.deleteMobile(id).subscribe(
        (res: any) => {
          this.getMobiles();
        },
        (error: any) => {
          console.log("Error deleting mobile:", error);
        }
      );
    } else {
      console.log("Invalid ID provided for deletion");
    }
  }

  openForm(data: Mobile | null = null) {
    this.clearForm();
    this.showForm = true;
    if (data) {
      this.mobileName = data.name;
      this.price = data.price;
      this.ram = data.ram;
      this.storage = data.storage;
      this.id = data.id !== undefined ? data.id : null;
      this.formHeader = "Edit Mobile";
    } else {
      this.id = null;
      this.formHeader = "Add Mobile";
    }
  }

  closeForm() {
    this.showForm = false;
    this.clearForm();
  }

  clearForm() {
    this.mobileName = "";
    this.price = 0;
    this.ram = 0;
    this.storage = 0;
    this.id = null;
  }

  saveMobile() {
    this.showForm = false;
    let body: Mobile = {
      name: this.mobileName,
      price: this.price,
      ram: this.ram,
      storage: this.storage
    };

    if (this.id !== null) {
      body.id = this.id;
      this.ms.putMobile(this.id, body).subscribe(
        (res) => {
          this.getMobiles();
        },
        (error) => {
          console.log("Error updating mobile:", error);
        }
      );
    } else {
      this.ms.postMobile(body).subscribe(
        (res) => {
          this.getMobiles();
        },
        (error) => {
          console.log("Error adding mobile:", error);
        }
      );
    }
  }

}
