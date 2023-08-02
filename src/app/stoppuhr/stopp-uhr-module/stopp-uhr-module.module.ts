import { StoppuhrComponent } from '../stoppuhr.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { MatExpansionModule } from "@angular/material/expansion";
// import { DatePipe } from "@angular/common";

@NgModule({
  declarations: [StoppuhrComponent],
  exports: [StoppuhrComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [FormsModule]
})
export class StoppUhrModuleModule { }
