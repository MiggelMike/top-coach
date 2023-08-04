import { WorkoutFormComponent } from './workout-form.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { MatExpansionModule } from "@angular/material/expansion";
import { Programm02Module } from '../programm02/programm02Md/programm02.module';
// import { Programm03Module } from '../programm03/programm03Md/programm03.module';
import { CommonModule } from '@angular/common';
import { ToolBarModule } from '../toolbar/tool-bar-module/tool-bar-module.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [WorkoutFormComponent],
  exports: [WorkoutFormComponent],
  imports: [
    FormsModule,
    // MatExpansionModule,
    CommonModule,
    Programm02Module,
    ToolBarModule,
    FlexLayoutModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
  
export class WorkoutFormModule { }