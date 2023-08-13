import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatzSimpleComponent } from './satz-simple.component';


@NgModule({
  declarations: [SatzSimpleComponent],
   exports: [SatzSimpleComponent],
  imports: [
    CommonModule,
    FormsModule
  ]
  ,schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SatzSimpleModule { }
