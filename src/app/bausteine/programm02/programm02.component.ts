import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { ISession } from "src/Business/Session/Session";
import { MatAccordion } from '@angular/material';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
    selector: "app-programm02",
    templateUrl: "./programm02.component.html",
    styleUrls: ["./programm02.component.scss"],
})
export class Programm02Component implements OnInit {
    @Input() SessionListe: Array<ISession> = [];
    @Input() ShowButtons: Boolean = false;
    @Input() Programm: ITrainingsProgramm = null;
    @ViewChildren('accSession') accSession: QueryList<MatAccordion>;
    @ViewChildren('panSession') panUebung: QueryList<MatExpansionPanel>;
    

    private isExpanded: Boolean = true;
    public ToggleButtonText: string = 'Close all sessions';

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

    public AddSession() {
        alert("AddSession");
    }

    public CopySession() {
        alert("CopySession");
    }

    public DeleteSession() {
        alert("DeleteSession");
    }

    public PasteSession() {
        alert("PasteSession");
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

    toggleSessions(): void {
        if (this.isExpanded) {
            this.accSession.forEach( acc => acc.closeAll());
            this.isExpanded = false;
            this.ToggleButtonText = "Open all Sessions";
        } else {
            this.accSession.forEach( acc => acc.openAll());
            this.isExpanded = true;
            this.ToggleButtonText = "Close all Sessions";
        }
    }

    accCheckSessionPanels() {
        let mAllClosed = true;

        const mPanUebungListe = this.panUebung.toArray();
        for (let index = 0; index < mPanUebungListe.length; index++) {
            if (mPanUebungListe[index].expanded) {
                mAllClosed = false;
                break;
            }
        }

        if (mAllClosed) {
            this.isExpanded = false;
            this.ToggleButtonText = "Open all sessions";
        } else {
            this.isExpanded = true;
            this.ToggleButtonText = "Close all sessions";
        }
    }
}
