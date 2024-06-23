import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { FormValidationComponent } from './form-validation/form-validation.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { APIComponent } from './api/api.component';
import { DjangoComponent } from './django/django.component';
import { FlaskComponent } from './flask/flask.component';
import { TestComponent } from './test/test.component';
import { SqliteComponent } from './sqlite/sqlite.component';
import { DisplayComponent } from './display/display.component';
import { CrudComponent } from './crud/crud.component';
import { TaskComponent } from './task/task.component';
import { UserComponent } from './user/user.component';
import { JavaComponent } from './java/java.component';
import { NodeComponent } from './node/node.component';
import { RandomComponent } from './random/random.component';

const routes: Routes = [
  {
    path:'',component:HomeComponent
  },
  {
    path:'form-validation',component:FormValidationComponent
  },
  {
    path:'api-call',component:APIComponent
  },
  {
    path:'flask',component:FlaskComponent
  },
  {
    path:'django',component:DjangoComponent
  },
  {
    path:'sqlite',component:SqliteComponent
  },
  {
    path:'test',component:TestComponent
  },
  {
    path:'crud',component:CrudComponent
  },
  {
    path:'display',component:DisplayComponent
  },
  {
    path:'task',component:TaskComponent
  },
  {
    path:'user',component:UserComponent
  },
  {
    path:'java',component:JavaComponent
  },
  {
    path:'node',component:NodeComponent
  },
  {
    path:'random',component:RandomComponent
  },
  


  {
    path:'**',component:NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
