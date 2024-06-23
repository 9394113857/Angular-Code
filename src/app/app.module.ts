import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormValidationComponent } from './form-validation/form-validation.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomeComponent } from './home/home.component';
import { APIComponent } from './api/api.component';
import { TestComponent } from './test/test.component';
import { DjangoComponent } from './django/django.component';
import { FlaskComponent } from './flask/flask.component';
import { SqliteComponent } from './sqlite/sqlite.component';
import { MobileService } from './mobile.service';
import { CrudComponent } from './crud/crud.component';
import { DisplayComponent } from './display/display.component';
import { TaskService } from './task.service';
import { TaskComponent } from './task/task.component';
import { UserService } from './user.service';
import { UserComponent } from './user/user.component';
import { JavaComponent } from './java/java.component';
import { NodeService } from './node.service';
import { NodeComponent } from './node/node.component';
import { ApiService } from './api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RandomComponent } from './random/random.component';


// NgModule is a decorator:

@NgModule({
  declarations: [
    AppComponent,
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
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  providers: [MobileService, TaskService, UserService, NodeService, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
