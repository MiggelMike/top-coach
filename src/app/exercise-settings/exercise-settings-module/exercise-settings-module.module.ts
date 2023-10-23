import { ExerciseSettingsComponent } from './../exercise-settings.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonModule } from "@angular/material/button";
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import {CdkDrag} from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [ExerciseSettingsComponent],
  exports: [ExerciseSettingsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    CdkDrag,
    NgxMaskDirective,
    NgxMaskPipe,
    DecimalPipe,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTabsModule,
    MatExpansionModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    DatePipe    
  ]
})

export class ExerciseSettingsModule { }

