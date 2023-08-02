import { ExerciseSettingsComponent } from './../exercise-settings.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ExerciseSettingsComponent],
  exports: [ExerciseSettingsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [DecimalPipe,FormsModule]
})

export class ExerciseSettingsModule { }
