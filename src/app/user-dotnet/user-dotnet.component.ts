import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserDotnetService } from '../user-dotnet.service';
import { interval, Subscription, throwError } from 'rxjs';
import { switchMap, catchError, delayWhen } from 'rxjs/operators';

interface User {
  id?: number | null;
  username: string;
  email: string;
}

@Component({
  selector: 'app-user-dotnet',
  templateUrl: './user-dotnet.component.html',
  styleUrls: ['./user-dotnet.component.css']
})
export class UserDotnetComponent implements OnInit, OnDestroy {

  formHeader: string = 'Add User';

  users: User[] | undefined;

  username: string = '';
  email: string = '';

  showForm: boolean = false;
  id: number | null = null;

  private refreshSubscription: Subscription | undefined;

  constructor(private userService: UserDotnetService) {}

  ngOnInit(): void {
    this.getUsers();
    this.setupDataRefresh();
  }

  private setupDataRefresh(): void {

    const refreshIntervalMs = 60000;
    let disconnected = false;

    this.refreshSubscription = interval(refreshIntervalMs)
      .pipe(
        switchMap(() => {

          if (disconnected) {
            return throwError(() => new Error('Disconnected from server'));
          }

          return this.userService.fetchUsers().pipe(
            catchError(() => {
              disconnected = true;
              return throwError(() => new Error('Disconnected from server'));
            })
          );
        }),

        delayWhen(() => {
          if (disconnected) {
            return interval(refreshIntervalMs);
          }

          return interval(0);
        })
      )
      .subscribe({
        next: (data: User[]) => {
          this.users = data;
          disconnected = false;
        },

        error: (error: any) => {
          console.log('Error fetching users:', error);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // Get users from the .NET backend
  getUsers(): void {

    this.userService.fetchUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },

      error: (error: any) => {
        console.log('Error fetching users:', error);
      }
    });
  }

  // Delete user
  deleteUser(id: number | null): void {

    if (id === null) {
      console.log('Invalid ID provided for deletion');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this user?'
    );

    if (!confirmed) {
      return;
    }

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.getUsers();
      },

      error: (error: any) => {
        console.log('Error deleting user:', error);
      }
    });
  }

  // Open form for Add/Edit
  openForm(data: User | null = null): void {

    this.clearForm();

    this.showForm = true;

    if (data) {

      this.username = data.username;
      this.email = data.email;

      this.id = data.id !== undefined ? data.id : null;

      this.formHeader = 'Edit User';

    } else {

      this.id = null;
      this.formHeader = 'Add User';
    }
  }

  // Close form
  closeForm(): void {
    this.showForm = false;
    this.clearForm();
  }

  // Clear form
  clearForm(): void {
    this.username = '';
    this.email = '';
    this.id = null;
  }

  // Add or update user
  saveUser(): void {

    const body: User = {
      username: this.username,
      email: this.email
    };

    this.showForm = false;

    // Update existing user
    if (this.id !== null) {

      body.id = this.id;

      this.userService.putUser(this.id, body).subscribe({
        next: () => {
          this.getUsers();
        },

        error: (error: any) => {
          console.log('Error updating user:', error);
        }
      });

    } else {

      // Create new user
      this.userService.postUser(body).subscribe({
        next: () => {
          this.getUsers();
        },

        error: (error: any) => {
          console.log('Error adding user:', error);
        }
      });
    }
  }

  // Check whether users exist
  hasData(): boolean {
    return this.users !== undefined && this.users.length > 0;
  }

  // Check whether backend request failed
  hasError(): boolean {
    return this.users === undefined;
  }
}