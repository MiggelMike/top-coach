import { PlateCalcComponent } from '../plate-calc.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
// import { MatExpansionModule } from "@angular/material/expansion";
// import { DatePipe } from "@angular/common";

@NgModule({
  declarations: [PlateCalcComponent],
  exports: [
    PlateCalcComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [FormsModule,DecimalPipe]
})
export class PlateCalcModule { }
