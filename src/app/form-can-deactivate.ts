import {ComponentCanDeactivate} from 'src/app/component-can-deactivate';
import {NgForm} from "@angular/forms";

export abstract class FormCanDeactivate extends ComponentCanDeactivate{

 abstract get form():NgForm;
 
 canDeactivate($event):boolean{
    return this.form.submitted || !this.form.dirty
  }
}