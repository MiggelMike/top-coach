import { WorkoutFormComponent } from './workout-form.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Programm02Module } from '../programm02/programm02Md/programm02.module';
import { CommonModule } from '@angular/common';
import { ToolBarModule } from '../toolbar/tool-bar-module/tool-bar-module.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: 'workoutform', component:WorkoutFormComponent }];

@NgModule({
  // declarations: [WorkoutFormComponent],
  exports: [RouterModule],
  imports: [
    CommonModule,
    FormsModule,
    Programm02Module,
    // MatExpansionModule,
    RouterModule.forChild(routes),
    // ToolBarModule,
    FlexLayoutModule
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
  
export class WorkoutFormModule { }