import { StoppuhrComponent } from '../stoppuhr.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { MatExpansionModule } from "@angular/material/expansion";
import { DatePipe } from "@angular/common";
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatSliderModule } from "@angular/material/slider";

@NgModule({
  declarations: [StoppuhrComponent],
  exports: [StoppuhrComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatRippleModule,
    CommonModule,
    FlexLayoutModule,
    MatExpansionModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSliderModule
           ]
})
export class StoppUhrModuleModule { }
