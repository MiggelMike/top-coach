import { Directive, ElementRef, Input, Output, OnChanges, SimpleChanges, ViewContainerRef  } from '@angular/core';

@Directive({
    selector: '[appProgrammLadeContext]'
})

export class ProgrammLadeDirective implements OnChanges {

    constructor(private el: ElementRef, private viewContainer: ViewContainerRef) { }


    ngOnChanges(changes: SimpleChanges) {
        let s = changes;
        s = changes;
        // this.programmLadeCompareContext = changes.currentvalue;
        // if (changes.hero.previousValue && changes.hero.previousValue.name !== changes.hero.currentValue.name) {
        //   oldHero = changes.hero.previousValue.name;
        // }

          // console.log('Old hero is: ', changes.hero.previousValue.name);

    }

    // @Output() componentContextChanged = new EventEmitter();

    // componentContextvalueChanged() { // You can give any function name
    //     this.componentContextChanged.emit(this.componentContext);
    // }
}
