import { Component, OnInit, Input } from '@angular/core';


import { ISession } from 'src/Business/Session/Session';

@Component({
  selector: 'app-programm02',
  templateUrl: './programm02.component.html',
  styleUrls: ['./programm02.component.scss']
})
export class Programm02Component implements OnInit {
  @Input() SessionListe: Array<ISession> = [];
  //  @ViewChild('sessionAccordion') accordionSession: MatAccordion;

  constructor() { }


  ngOnInit() {
  }

  ngAfterViewInit() {
    // if (this.matExpansionPanelQueryList) {
    //   this.matExpansionPanelQueryList.changes.subscribe(
    //     change => {
    //       change.open();
    //     }
    //   );
    // }
  }

}
