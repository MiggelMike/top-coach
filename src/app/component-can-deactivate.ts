import {HostListener} from "@angular/core";

export abstract class ComponentCanDeactivate {
 
    abstract canDeactivate($event):Boolean;
    
    // window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
    //     if (this.generatedBarcodeIndex) {
    //      event.preventDefault(); // for Firefox
    //      event.returnValue = ''; // for Chrome
    //      return '';
    //     }
    //     return false;
    //    });

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: BeforeUnloadEvent) {
        if (this.canDeactivate($event) === false) {
            $event.preventDefault(); // for Firefox
            $event.returnValue = 'xxxx'; // for Chrome
            return false;
        }
        return void(0);
    }
}