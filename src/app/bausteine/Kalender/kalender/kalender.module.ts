import { KalenderComponent } from './kalender.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { Programm02Module } from '../../programm02/programm02Md/programm02.module';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';



@NgModule({
  declarations: [KalenderComponent],
  exports: [KalenderComponent],
  imports: [
    FormsModule,
    MatNativeDateModule,
    MatDatepickerModule,
    CommonModule,
    Programm02Module,
    FlexLayoutModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class KalenderModule { }
