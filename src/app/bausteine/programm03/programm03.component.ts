import { SessionStatsOverlayComponent } from './../../session-stats-overlay/session-stats-overlay.component';
import { SessionOverlayServiceService, SessionOverlayConfig } from './../../services/session-overlay-service.service';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Uebung  } from './../../../Business/Uebung/Uebung';
import { GlobalService } from 'src/app/services/global.service';
import { MatAccordion } from '@angular/material';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ISession, Session } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { EventEmitter, Output, Component, OnInit, Input, ViewChildren, ViewChild, QueryList, ElementRef } from "@angular/core";
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
    @Input() SessUeb: Uebung;
    @Input() rowNum: number = 0;
    @Input() bearbeitbar: Boolean;
    @Input() panUebung1: MatExpansionPanel;
    @Input() ShowStats: Boolean = false;
    @Input() StatsVisible: Boolean = false;
    @ViewChildren("accUebung") accUebung: QueryList<MatAccordion>;
    @ViewChildren("panUebung") panUebung: QueryList<MatExpansionPanel>;
    @ViewChild(CdkOverlayOrigin) cdkOverlayOrigin: CdkOverlayOrigin;
    @ViewChild('Session') div: ElementRef;

    private isExpanded: Boolean = true;
    private fSessionStatsOverlayComponent: SessionStatsOverlayComponent = null;
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

    ngOnInit() { }
    
    constructor(
        private fGlobalService: GlobalService,
        private fDialogService: DialogeService,
        private fSessionOverlayServiceService: SessionOverlayServiceService,
    ) {
        if (this.fGlobalService.Comp03PanelUebungObserver === null)
            this.fGlobalService.Comp03PanelUebungObserver = this.UebungPanelsObserver;
    }

    doStats() {
        if ((this.fSessionStatsOverlayComponent === null)||(this.fSessionStatsOverlayComponent.dialogRef === null))
            this.fSessionStatsOverlayComponent = this.fSessionOverlayServiceService.open({ session: this.session } as SessionOverlayConfig);
        else 
            this.fSessionStatsOverlayComponent.close();
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
            this.SessUeb.Expanded = false;
        } else {
            this.accUebung.forEach((acc) => acc.openAll());
            this.isExpanded = true;
            this.ToggleButtonText = "Close all excercises";
            this.SessUeb.Expanded = true;
        }
    }

    PanelUebungOpened(aUebung: Uebung) {
        if(aUebung.Expanded)
            aUebung.Expanded = true;
        this.accCheckUebungPanels();
    }

    PanelUebungClosed(aUebung: Uebung) {
        if(aUebung.Expanded)
            aUebung.Expanded = false;
        this.accCheckUebungPanels();
    }

    accCheckUebungPanels() {
        if (!this.panUebung) return;

        let mAllClosed = true;
       
        if (this.session.UebungsListe.length > 0) {
            const mPanUebungListe = this.panUebung.toArray();
            for (let index = 0; index < mPanUebungListe.length; index++) {
                this.session.UebungsListe[index].Expanded = mPanUebungListe[index].expanded;
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
        mDialogData.OkFn = (): void => {
            // Index der SessUeb in Liste suchen.
            const index: number = this.session.UebungsListe.indexOf(aUebung);

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
}
  
