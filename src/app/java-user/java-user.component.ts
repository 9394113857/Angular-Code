// Angular component and lifecycle support.
import { Component, OnInit } from '@angular/core';

// Java User model and service.
import {
  JavaUser,
  JavaUserService
} from '../java-user.service';


// ============================================================
// JAVA USER COMPONENT
// ============================================================

@Component({
  selector: 'app-java-user',
  templateUrl: './java-user.component.html',
  styleUrls: ['./java-user.component.css']
})
export class JavaUserComponent implements OnInit {


  // ============================================================
  // COMPONENT DATA
  // ============================================================

  // List of users received from the Java backend.
  users: JavaUser[] = [];

  // Form fields.
  username = '';
  email = '';

  // ID of the user currently being edited.
  // null means Create mode.
  editingId: number | null = null;

  // Loading indicator.
  loading = false;

  // Error message shown to the user.
  errorMessage = '';

  // Success message shown to the user.
  successMessage = '';


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private javaUserService: JavaUserService
  ) {}


  // ============================================================
  // COMPONENT INITIALIZATION
  // ============================================================

  ngOnInit(): void {

    // Load users when the page opens.
    this.loadUsers();
  }


  // ============================================================
  // LOAD USERS
  // ============================================================

  loadUsers(): void {

    this.loading = true;
    this.errorMessage = '';

    this.javaUserService.getUsers().subscribe({

      // Backend request successful.
      next: (data) => {

        this.users = data;

        this.loading = false;
      },

      // Backend request failed.
      error: (error) => {

        console.error(
          'Error loading Java users:',
          error
        );

        this.errorMessage =
          'Unable to connect to the Java Spring Boot backend.';

        this.loading = false;
      }

    });
  }


  // ============================================================
  // CREATE / UPDATE USER
  // ============================================================

  saveUser(): void {

    // Clear previous messages.
    this.successMessage = '';
    this.errorMessage = '';


    // Basic validation.
    if (
      !this.username.trim() ||
      !this.email.trim()
    ) {

      this.errorMessage =
        'Username and email are required.';

      return;
    }


    // Build the request body.
    const user: JavaUser = {

      username: this.username.trim(),

      email: this.email.trim()

    };


    // ==========================================================
    // CREATE
    // ==========================================================

    if (this.editingId === null) {

      this.javaUserService
        .createUser(user)
        .subscribe({

          // Create successful.
          next: () => {

            this.successMessage =
              'User created successfully.';

            this.clearForm();

            this.loadUsers();
          },

          // Create failed.
          error: (error) => {

            console.error(
              'Error creating user:',
              error
            );

            this.errorMessage =
              'Unable to create user.';
          }

        });

    }


    // ==========================================================
    // UPDATE
    // ==========================================================

    else {

      this.javaUserService
        .updateUser(
          this.editingId,
          user
        )
        .subscribe({

          // Update successful.
          next: () => {

            this.successMessage =
              'User updated successfully.';

            this.clearForm();

            this.loadUsers();
          },

          // Update failed.
          error: (error) => {

            console.error(
              'Error updating user:',
              error
            );

            this.errorMessage =
              'Unable to update user.';
          }

        });
    }
  }


  // ============================================================
  // EDIT USER
  // ============================================================

  editUser(user: JavaUser): void {

    // Store the user's ID.
    this.editingId =
      user.id ?? null;

    // Put existing values into the form.
    this.username =
      user.username;

    this.email =
      user.email;

    // Clear old messages.
    this.successMessage = '';
    this.errorMessage = '';
  }


  // ============================================================
  // DELETE USER
  // ============================================================

  deleteUser(id: number | undefined): void {

    // Make sure an ID exists.
    if (id === undefined) {

      return;
    }


    // Ask for confirmation before deleting.
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this user?'
      );


    // Stop if the user cancels.
    if (!confirmed) {

      return;
    }


    // Send DELETE request.
    this.javaUserService
      .deleteUser(id)
      .subscribe({

        // Delete successful.
        next: () => {

          this.successMessage =
            'User deleted successfully.';

          this.loadUsers();
        },

        // Delete failed.
        error: (error) => {

          console.error(
            'Error deleting user:',
            error
          );

          this.errorMessage =
            'Unable to delete user.';
        }

      });
  }


  // ============================================================
  // CLEAR FORM
  // ============================================================

  clearForm(): void {

    this.username = '';

    this.email = '';

    this.editingId = null;
  }


  // ============================================================
  // CHECK EDIT MODE
  // ============================================================

  isEditing(): boolean {

    return this.editingId !== null;
  }

}