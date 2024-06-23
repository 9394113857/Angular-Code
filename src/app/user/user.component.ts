import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user.service';
import { interval, Subscription, throwError } from 'rxjs';
import { switchMap, catchError, delayWhen } from 'rxjs/operators';

interface User {
  id?: number | null;
  email: string;
  username: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  formHeader: string = "Add User";
  users: User[] | undefined;
  email: string = "";
  username: string = "";
  showForm: boolean = false;
  id: number | null = null;

  private refreshSubscription: Subscription | undefined;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getUsers();
    this.setupDataRefresh();
  }

  private setupDataRefresh() {
    const refreshIntervalMs = 60000; // 60,000 milliseconds = 60 seconds = 1 minute
    let disconnected = false;

    this.refreshSubscription = interval(refreshIntervalMs)
      .pipe(
        switchMap(() => {
          if (disconnected) {
            return throwError('Disconnected from server');
          }
          return this.userService.fetchUsers().pipe(
            catchError(() => {
              disconnected = true;
              return throwError('Disconnected from server');
            })
          );
        }),
        delayWhen(data => {
          if (disconnected) {
            return interval(refreshIntervalMs); // Try to reconnect every interval
          }
          return interval(0); // Immediate retry if no disconnection occurred
        })
      )
      .subscribe(
        (data: User[]) => {
          this.users = data;
          disconnected = false; // Reconnected successfully
        },
        (error: any) => {
          console.log('Error fetching users:', error);
        }
      );
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  getUsers() {
    this.userService.fetchUsers().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      (error: any) => {
        console.log("Error fetching users:", error);
      }
    );
  }

  deleteUser(id: number | null) {
    if (id !== null) {
      this.userService.deleteUser(id).subscribe(
        (res: any) => {
          this.getUsers();
        },
        (error: any) => {
          console.log("Error deleting user:", error);
        }
      );
    } else {
      console.log("Invalid ID provided for deletion");
    }
  }

  openForm(data: User | null = null) {
    this.clearForm();
    this.showForm = true;
    if (data) {
      this.email = data.email;
      this.username = data.username;
      this.id = data.id !== undefined ? data.id : null;
      this.formHeader = "Edit User";
    } else {
      this.id = null;
      this.formHeader = "Add User";
    }
  }

  closeForm() {
    this.showForm = false;
    this.clearForm();
  }

  clearForm() {
    this.email = "";
    this.username = "";
    this.id = null;
  }

  saveUser() {
    this.showForm = false;
    let body: User = {
      email: this.email,
      username: this.username
    };

    if (this.id !== null) {
      body.id = this.id;
      this.userService.putUser(this.id, body).subscribe(
        (res) => {
          this.getUsers();
        },
        (error) => {
          console.log("Error updating user:", error);
        }
      );
    } else {
      this.userService.postUser(body).subscribe(
        (res) => {
          this.getUsers();
        },
        (error) => {
          console.log("Error adding user:", error);
        }
      );
    }
  }

  hasData(): boolean {
    return this.users !== undefined && this.users.length > 0;
  }

  hasError(): boolean {
    return this.users === undefined;
  }
}
