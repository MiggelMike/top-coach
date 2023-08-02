
import { SatzEditComponent  } from './../satz-edit.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';

@NgModule({
  declarations: [SatzEditComponent],
  exports: [SatzEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    FormsModule,
    CommonModule,
    DecimalPipe]
})
export class SatzEditModule { }
