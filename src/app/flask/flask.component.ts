import { Component, OnInit } from '@angular/core';
import { MobileService, Mobile } from '../mobile.service';

@Component({
  selector: 'app-flask',
  templateUrl: './flask.component.html',
  styleUrls: ['./flask.component.css']
})
export class FlaskComponent implements OnInit {

  mobiles: Mobile[] = [];

  showForm = false;
  isLoading = false;
  hasServerError = false;

  formHeader = "Add Mobile";

  id: number | null = null;
  mobileName = "";
  price = 0;
  ram = 0;
  storage = 0;

  constructor(private mobileService: MobileService) {}

  ngOnInit(): void {
    this.getMobiles();
  }

  getMobiles(): void {
    this.isLoading = true;

    this.mobileService.fetchMobiles().subscribe({
      next: (data: Mobile[]) => {
        this.mobiles = data;
        this.hasServerError = false;
        this.isLoading = false;
      },
      error: () => {
        this.hasServerError = true;
        this.isLoading = false;
      }
    });
  }

  openForm(mobile?: Mobile): void {
    this.clearForm();
    this.showForm = true;

    if (mobile) {
      this.formHeader = "Edit Mobile";
      this.id = mobile.id ?? null;
      this.mobileName = mobile.name;
      this.price = mobile.price;
      this.ram = mobile.ram;
      this.storage = mobile.storage;
    } else {
      this.formHeader = "Add Mobile";
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.clearForm();
  }

  saveMobile(): void {

    const body: Mobile = {
      name: this.mobileName,
      price: this.price,
      ram: this.ram,
      storage: this.storage
    };

    if (this.id !== null) {
      this.mobileService.putMobile(this.id, body).subscribe(() => {
        this.getMobiles();
      });
    } else {
      this.mobileService.postMobile(body).subscribe(() => {
        this.getMobiles();
      });
    }

    this.closeForm();
  }

  deleteMobile(id?: number | null): void {
    if (!id) return;

    if (confirm("Are you sure you want to delete this mobile?")) {
      this.mobileService.deleteMobile(id).subscribe(() => {
        this.getMobiles();
      });
    }
  }

  clearForm(): void {
    this.id = null;
    this.mobileName = "";
    this.price = 0;
    this.ram = 0;
    this.storage = 0;
  }
}