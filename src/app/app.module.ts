// ============================================================
// Angular Core
// ============================================================

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


// ============================================================
// Angular HTTP / Forms
// ============================================================

import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


// ============================================================
// Angular Material
// ============================================================

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';


// ============================================================
// Angular Animations
// ============================================================

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// ============================================================
// Application Routing
// ============================================================

import { AppRoutingModule } from './app-routing.module';


// ============================================================
// Main Application Component
// ============================================================

import { AppComponent } from './app.component';


// ============================================================
// Application Components
// ============================================================

import { FormValidationComponent } from './form-validation/form-validation.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomeComponent } from './home/home.component';
import { APIComponent } from './api/api.component';
import { TestComponent } from './test/test.component';
import { DjangoComponent } from './django/django.component';
import { FlaskComponent } from './flask/flask.component';
import { SqliteComponent } from './sqlite/sqlite.component';
import { CrudComponent } from './crud/crud.component';
import { DisplayComponent } from './display/display.component';
import { TaskComponent } from './task/task.component';
import { UserComponent } from './user/user.component';
import { JavaComponent } from './java/java.component';
import { NodeComponent } from './node/node.component';
import { RandomComponent } from './random/random.component';
import { UserDotnetComponent } from './user-dotnet/user-dotnet.component';


// ============================================================
// Java Spring Boot User Component
// ============================================================

// NEW: Java Spring Boot User integration component
import { JavaUserComponent } from './java-user/java-user.component';


// ============================================================
// Application Services
// ============================================================

import { MobileService } from './mobile.service';
import { TaskService } from './task.service';
import { UserService } from './user.service';
import { NodeService } from './node.service';
import { ApiService } from './api.service';


// ============================================================
// NgModule
// ============================================================

@NgModule({

  // ==========================================================
  // Components declared in this Angular application
  // ==========================================================

  declarations: [

    // Main application
    AppComponent,

    // Existing components
    FormValidationComponent,
    NotFoundComponent,
    HomeComponent,
    APIComponent,
    TestComponent,
    DjangoComponent,
    FlaskComponent,
    SqliteComponent,
    CrudComponent,
    DisplayComponent,
    TaskComponent,
    UserComponent,
    JavaComponent,
    NodeComponent,
    RandomComponent,
    UserDotnetComponent,

    // NEW: Java Spring Boot User component
    JavaUserComponent,

  ],


  // ==========================================================
  // Angular / Application Modules
  // ==========================================================

  imports: [

    // Angular
    BrowserModule,

    // Application routing
    AppRoutingModule,

    // HTTP API communication
    HttpClientModule,

    // Existing form support
    ReactiveFormsModule,
    FormsModule,

    // Angular animations
    BrowserAnimationsModule,

    // Angular Material
    MatPaginatorModule,
    MatSortModule,

  ],


  // ==========================================================
  // Application Services
  // ==========================================================

  providers: [
    MobileService,
    TaskService,
    UserService,
    NodeService,
    ApiService,
  ],


  // ==========================================================
  // Bootstrap
  // ==========================================================

  bootstrap: [
    AppComponent
  ]

})
export class AppModule { }