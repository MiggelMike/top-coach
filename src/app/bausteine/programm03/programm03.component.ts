import { Uebung, IUebung } from './../../../Business/Uebung/Uebung';
import { GlobalService } from 'src/app/services/global.service';
import { ISatz } from './../../../Business/Satz/Satz';
import { MatAccordion } from '@angular/material';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ISession } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChildren, QueryList } from "@angular/core";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { of } from 'rxjs';


@Component({
    selector: "app-programm03",
    templateUrl: "./programm03.component.html",
    styleUrls: ["./programm03.component.scss"],
})
export class Programm03Component implements OnInit {
    @Input() programm: ITrainingsProgramm;
    @Input() session: ISession;
    // @Input() satz: ISatz;
    @Input() rowNum: number = 0;
    @Input() bearbeitbar: Boolean;
    @Input() panUebung1: MatExpansionPanel;
    @ViewChildren("accUebung") accUebung: QueryList<MatAccordion>;
    @ViewChildren("panUebung") panUebung: QueryList<MatExpansionPanel>;

    private isExpanded: Boolean = true;
    public ToggleButtonText = "Close all excercises";
    private UebungPanelsObserver = {
        next: (x: MatExpansionPanel) => {
            this.accCheckUebungPanels();
        },
        error: (err) =>
            console.error("UebungPanelsObserver got an error: " + err),
        complete: () =>
            console.log("UebungPanelsObserver got a complete notification"),
    };

    ngOnInit() {}

    constructor(
        private fGlobalService: GlobalService,
        private fDialogService: DialogeService,
    ) {
        if (this.fGlobalService.Comp03PanelUebungObserver === null)
            this.fGlobalService.Comp03PanelUebungObserver = this.UebungPanelsObserver;
        
    }

    ngOnDestroy() {
        if (this.fGlobalService.Comp03PanelUebungObserver != null)
            this.fGlobalService.Comp03PanelUebungObserver = null;
    }

    toggleUebungen(): void {
        if (this.isExpanded) {
            this.accUebung.forEach((acc) => acc.closeAll());
            this.isExpanded = false;
            this.ToggleButtonText = "Open all excercises";
        } else {
            this.accUebung.forEach((acc) => acc.openAll());
            this.isExpanded = true;
            this.ToggleButtonText = "Close all excercises";
        }
    }

    accCheckUebungPanels() {
        if (!this.panUebung) return;

        let mAllClosed = true;

        if (this.session.UebungsListe.length > 0) {
            const mPanUebungListe = this.panUebung.toArray();
            for (let index = 0; index < mPanUebungListe.length; index++) {
                if (mPanUebungListe[index].expanded) {
                    mAllClosed = false;
                    break;
                }
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


    public DeleteExercise(aRowNum: number, aUebung: Uebung) {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push(`Delete exercise #${aRowNum} "${aUebung.Name}" ?`);
        mDialogData.OkFn = ():void => {
            // Index der SessUeb in Liste suchen.
            const index: number = this.session.UebungsListe.indexOf( aUebung );

            // SessUeb-Index gefunden?
            if (index !== -1) {
                // SessUeb-Index gefunden
                // SessUeb aus Liste entfernen.
                this.session.UebungsListe.splice(index, 1);
            }

            if (this.fGlobalService.Comp03PanelUebungObserver != null) {
                this.panUebung1.expanded = false;
                of(this.panUebung1).subscribe(
                    this.fGlobalService.Comp03PanelUebungObserver
                );
            }
        };   

        this.fDialogService.JaNein(mDialogData);
    }

    public CopyExcercise(aUebung: Uebung) {
        this.fGlobalService.SessUebungKopie = aUebung.Copy();
    }

    ngDoCheck() {
      //  this.accCheckUebungPanels();
    }
}
