import { Programm02Component } from '../programm02.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from "@angular/common";
import { MatExpansionModule } from "@angular/material/expansion";
import { Programm03Module } from '../../programm03/programm03Md/programm03.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [Programm02Component],
  exports: [Programm02Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    DragDropModule,
    FormsModule,
    MatExpansionModule,
    DatePipe,
    CommonModule,
    Programm03Module,
    MatInputModule,
    MatFormFieldModule,
    MatRippleModule
    
  ]
})
export class Programm02Module { }

