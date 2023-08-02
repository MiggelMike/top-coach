import { EditExerciseComponent } from './../edit-exercise.component';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [EditExerciseComponent],
  exports: [EditExerciseComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [FormsModule]
})

export class EditExerciseModule { }
