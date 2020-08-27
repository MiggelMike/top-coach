import { ISatz } from './../../../Business/Satz/Satz';
import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-satz-simple",
    templateUrl: "./satz-simple.component.html",
    styleUrls: ["./satz-simple.component.scss"],
    styles: [
        `
        :host {
          display: block;
          margin: 2px;
          // border: 1px solid black;
          // border-radius: 8px;
        },


        `,
    ],
})
export class SatzSimpleComponent implements OnInit {
    @Input() satz: ISatz;
    constructor() {}

    ngOnInit(): void {}
}

// @Component({
//   selector: 'app-card',
//   template: `<div>Card: {{name}}</div>`,
//   styles: [`
//   :host {
//     display: block;
//     padding: 32px;
//     border: 1px solid black;
//     border-radius: 8px;
//   }
//   `]
// })
// export class CardComponent {}
