import { WorkoutFormComponent } from './bausteine/workout-form/workout-form.component';
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { ComponentCanDeactivate } from './component-can-deactivate';


@Injectable()
export class CanDeactivateGuard implements CanDeactivate<WorkoutFormComponent> {
  canDeactivate(component: WorkoutFormComponent): boolean {
   
    if(!component.canDeactivate()){
        if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
            return true;
        } else {
            return false;
        }
    }
    return true;
  }
}