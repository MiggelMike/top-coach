import {HostListener} from "@angular/core";

export abstract class ComponentCanDeactivate {
 
    abstract  canDeactivate($event): boolean;

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (!this.canDeactivate($event)) {
            $event.returnValue =true;
        }
    }
}