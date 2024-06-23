// Import necessary modules and components from Angular and RxJS
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TaskService } from '../task.service';
import { interval, Subscription, throwError } from 'rxjs';
import { switchMap, catchError, delayWhen } from 'rxjs/operators';

// Define the Task interface
interface Task {
  id?: number | null;
  title: string;
  description: string;
  completed: boolean;
}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit, OnDestroy {
  // Component properties
  formHeader: string = "Add Task";
  tasks: Task[] | undefined;
  title: string = "";
  description: string = "";
  completed: boolean = false;
  showForm: boolean = false;
  id: number | null = null;

  private refreshSubscription: Subscription | undefined;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // When the component initializes, fetch tasks and set up data refresh
    this.getTasks();
    this.setupDataRefresh();
  }

  private setupDataRefresh() {
    const refreshIntervalMs = 60000; // 60 seconds

    // Initialize a flag to track if the client is disconnected from the server
    let disconnected = false;

    // Set up an interval for periodic data refresh
    this.refreshSubscription = interval(refreshIntervalMs)
      .pipe(
        switchMap(() => {
          // Check if disconnected, and if so, throw an error to handle it
          if (disconnected) {
            return throwError('Disconnected from server');
          }
          // Fetch tasks and handle any errors
          return this.taskService.fetchTasks().pipe(
            catchError(() => {
              // Mark as disconnected on error
              disconnected = true;
              return throwError('Disconnected from server');
            })
          );
        }),
        delayWhen(data => {
          // If disconnected, retry the connection at the set interval
          if (disconnected) {
            return interval(refreshIntervalMs);
          }
          // Otherwise, immediately retry if no disconnection occurred
          return interval(0);
        })
      )
      .subscribe(
        (data: Task[]) => {
          // Update tasks and mark as reconnected
          this.tasks = data;
          disconnected = false;
        },
        (error: any) => {
          console.log('Error fetching tasks:', error);
        }
      );
  }

  ngOnDestroy(): void {
    // Unsubscribe from the data refresh subscription when the component is destroyed
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // Fetch tasks from the service
  getTasks() {
    this.taskService.fetchTasks().subscribe(
      (data: Task[]) => {
        this.tasks = data;
        // If there are no tasks, show the task form
        if (!this.hasData()) {
          this.showForm = true;
        }
      },
      (error: any) => {
        console.log("Error fetching tasks:", error);
      }
    );
  }

  // Delete a task by ID
  deleteTask(id: number | null) {
    if (id !== null) {
      const confirmed = window.confirm('Are you sure you want to delete this task?'); // Display a confirmation dialog
  
      if (confirmed) {
        this.taskService.deleteTask(id).subscribe(
          (res: any) => {
            this.getTasks();
            // Clear the form after successfully deleting the task
            this.clearForm();
          },
          (error: any) => {
            console.log('Error deleting task:', error);
          }
        );
      }
    } else {
      console.log('Invalid ID provided for deletion');
    }
  }
  
  

  // Open the task form for adding or editing a task
  openForm(data: Task | null = null) {
    this.clearForm(); // Clear the form fields
    this.showForm = true;
    if (data) {
      // Populate form fields when editing a task
      this.title = data.title;
      this.description = data.description;
      this.completed = data.completed;
      this.id = data.id !== undefined ? data.id : null;
      this.formHeader = "Edit Task";
    } else {
      this.id = null;
      this.formHeader = "Add Task";
    }
  }
  
  

  // Close the task form
  closeForm() {
    this.showForm = false;
    this.clearForm();
  }

  // Clear form fields
  clearForm() {
    this.title = "";
    this.description = "";
    this.completed = false;
    this.id = null;
  }

  // Save a task (add or edit)
  saveTask() {
    this.showForm = false;
    let body: Task = {
      title: this.title,
      description: this.description,
      completed: this.completed
    };

    if (this.id !== null) {
      body.id = this.id;
      // Update an existing task
      this.taskService.putTask(this.id, body).subscribe(
        (res) => {
          this.getTasks();
        },
        (error) => {
          console.log("Error updating task:", error);
        }
      );
    } else {
      // Add a new task
      this.taskService.postTask(body).subscribe(
        (res) => {
          this.getTasks();
        },
        (error) => {
          console.log("Error adding task:", error);
        }
      );
    }
  }

  // Check if there are tasks
  hasData(): boolean {
    return this.tasks !== undefined && this.tasks.length > 0;
  }

  // Check if there is an error in fetching tasks
  hasError(): boolean {
    return this.tasks === undefined;
  }
}
