import { Component, OnInit } from '@angular/core';
import {
  FastapiApiService,
  Mobile
} from '../../fastapi-api.service';

@Component({
  selector: 'app-fastapi-rest',
  templateUrl: './fastapi-rest.component.html',
  styleUrls: ['./fastapi-rest.component.css']
})
export class FastapiRestComponent implements OnInit {

  mobiles: Mobile[] = [];

  mobileName = '';
  price: number | null = null;
  ram = '';
  storage = '';

  editingId: number | null = null;

  loading = false;
  saving = false;

  successMessage = '';
  errorMessage = '';

  constructor(private fastapiApi: FastapiApiService) {}

  ngOnInit(): void {
    this.loadMobiles();
  }

  // ============================================================
  // GET ALL
  // ============================================================

  loadMobiles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.fastapiApi.getMobiles().subscribe({
      next: (data) => {
        this.mobiles = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('GET mobiles error:', error);
        this.loading = false;
        this.errorMessage = 'Failed to load mobiles.';
      }
    });
  }

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  saveMobile(): void {

    this.successMessage = '';
    this.errorMessage = '';

    if (!this.mobileName.trim()) {
      this.errorMessage = 'Mobile name is required.';
      return;
    }

    if (this.price === null || this.price <= 0) {
      this.errorMessage = 'Price must be greater than 0.';
      return;
    }

    if (!this.ram.trim()) {
      this.errorMessage = 'RAM is required.';
      return;
    }

    if (!this.storage.trim()) {
      this.errorMessage = 'Storage is required.';
      return;
    }

    const mobile: Mobile = {
      name: this.mobileName.trim(),
      price: this.price,
      ram: this.ram.trim(),
      storage: this.storage.trim()
    };

    this.saving = true;

    // UPDATE
    if (this.editingId !== null) {

      const id = this.editingId;

      this.fastapiApi.updateMobile(id, mobile).subscribe({
        next: (updatedMobile) => {

          const index = this.mobiles.findIndex(
            item => item.id === id
          );

          if (index !== -1) {
            this.mobiles[index] = updatedMobile;
          }

          this.successMessage = 'Mobile updated successfully.';
          this.saving = false;

          this.resetForm();
        },

        error: (error) => {
          console.error('UPDATE mobile error:', error);
          this.errorMessage = 'Failed to update mobile.';
          this.saving = false;
        }
      });

      return;
    }

    // CREATE
    this.fastapiApi.createMobile(mobile).subscribe({
      next: (createdMobile) => {

        this.mobiles.push(createdMobile);

        this.successMessage = 'Mobile created successfully.';
        this.saving = false;

        this.resetForm();
      },

      error: (error) => {
        console.error('CREATE mobile error:', error);
        this.errorMessage = 'Failed to create mobile.';
        this.saving = false;
      }
    });
  }

  // ============================================================
  // EDIT
  // ============================================================

  editMobile(mobile: Mobile): void {

    this.editingId = mobile.id ?? null;

    this.mobileName = mobile.name;
    this.price = mobile.price;
    this.ram = mobile.ram;
    this.storage = mobile.storage;

    this.successMessage = '';
    this.errorMessage = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ============================================================
  // DELETE
  // ============================================================

  deleteMobile(id: number | undefined): void {

    if (id === undefined) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this mobile?'
    );

    if (!confirmed) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.fastapiApi.deleteMobile(id).subscribe({
      next: () => {

        this.mobiles = this.mobiles.filter(
          mobile => mobile.id !== id
        );

        this.successMessage = 'Mobile deleted successfully.';
      },

      error: (error) => {
        console.error('DELETE mobile error:', error);
        this.errorMessage = 'Failed to delete mobile.';
      }
    });
  }

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  cancelEdit(): void {
    this.resetForm();
    this.successMessage = '';
    this.errorMessage = '';
  }

  // ============================================================
  // RESET FORM
  // ============================================================

  resetForm(): void {

    this.mobileName = '';
    this.price = null;
    this.ram = '';
    this.storage = '';

    this.editingId = null;
  }
}