import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input } from "@angular/core";

import { ISession } from "src/Business/Session/Session";

@Component({
    selector: "app-programm02",
    templateUrl: "./programm02.component.html",
    styleUrls: ["./programm02.component.scss"],
})
export class Programm02Component implements OnInit {
    @Input() SessionListe: Array<ISession> = [];
    @Input() ShowButtons: Boolean = false;
    @Input() Programm: ITrainingsProgramm = null;

    //  @ViewChild('sessionAccordion') accordionSession: MatAccordion;

    constructor() {}

    ngOnInit() {}

    ngAfterViewInit() {
        // if (this.matExpansionPanelQueryList) {
        //   this.matExpansionPanelQueryList.changes.subscribe(
        //     change => {
        //       change.open();
        //     }
        //   );
        // }
    }

    public AddDay() {
        alert("AddDay");
    }

    public CopyDay() {
        alert("CopyDay");
    }

    public DeleteDay() {
        alert("DeleteDay");
    }

    public PasteDay() {
        alert("PasteDay");
    }

    public SaveChanges() {
        alert("SaveChanges");
    }

    public CancelChanges() {
        alert("CancelChanges");
    }

    public AddExcercise() {
        alert("Add Excercise");
    }

    public CopyExcercise() {
        alert("Copy Excercise");
    }

    public PasteExcercise() {
        alert("PasteExcercise");
    }
}
