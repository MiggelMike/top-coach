import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { ISession } from "src/Business/Session/Session";
import { MatAccordion } from '@angular/material';


@Component({
    selector: "app-programm02",
    templateUrl: "./programm02.component.html",
    styleUrls: ["./programm02.component.scss"],
})
export class Programm02Component implements OnInit {
    @Input() SessionListe: Array<ISession> = [];
    @Input() ShowButtons: Boolean = false;
    @Input() Programm: ITrainingsProgramm = null;
    //@ViewChild('accSession') accSession: MatAccordion;
    @ViewChildren('accSession') accSession: QueryList<MatAccordion>

    private isExpanded: Boolean = true;

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

    toggleSessions($event: any): void {
        if (this.isExpanded) {
            this.accSession.forEach( acc => acc.closeAll());
            this.isExpanded = false;
            $event.currentTarget.innerText = "Open all Sessions";
        } else {
            this.accSession.forEach( acc => acc.openAll());
            this.isExpanded = true;
            $event.currentTarget.innerText = "Close all Sessions";
        }
        // $event.stopPropagation();
    }
}
