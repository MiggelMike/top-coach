import { StoppuhrComponent } from '../stoppuhr.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from "@angular/common";
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from "@angular/material/card";

@NgModule({
  declarations: [StoppuhrComponent],
  exports: [StoppuhrComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    FormsModule,
    MatFormFieldModule,
    CommonModule,
    FlexLayoutModule,
    DatePipe,
    MatCardModule,
           ]
})
export class StoppUhrModuleModule { }
