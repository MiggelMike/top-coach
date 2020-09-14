import { MatAccordion } from '@angular/material';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ISession } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChildren, QueryList } from "@angular/core";

@Component({
    selector: "app-programm03",
    templateUrl: "./programm03.component.html",
    styleUrls: ["./programm03.component.scss"],
})
export class Programm03Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() session: ISession;
    @Input() rowNum: number = 0;
    @ViewChildren('accUebung') accUebung: QueryList<MatAccordion>;
    @ViewChildren('panUebung') panUebung: QueryList<MatExpansionPanel>;

    private isExpanded: Boolean = true;
    public ToggleButtonText = 'Close all excercises';

    ngOnInit() {
    }

    constructor() {}

    toggleUebungen(): void {
        if (this.isExpanded) {
            this.accUebung.forEach( acc => acc.closeAll());
            this.isExpanded = false;
            this.ToggleButtonText = "Open all excercises";
        } else {
            this.accUebung.forEach( acc => acc.openAll());
            this.isExpanded = true;
            this.ToggleButtonText = "Close all excercises";
        }
    }

    accCheckUebungPanels() {
        if (!this.panUebung)
            return;

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
            this.ToggleButtonText = "Open all excercises";
        } else {
            this.isExpanded = true;
            this.ToggleButtonText = "Close all excercises";
        }
    }
}
