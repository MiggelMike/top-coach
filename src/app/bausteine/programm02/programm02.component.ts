import { UebungWaehlenData } from './../../uebung-waehlen/uebung-waehlen.component';
import { UebungsKategorie02 } from './../../../Business/Uebung/Uebung';
import { DexieSvcService } from './../../services/dexie-svc.service';
import { Session, SessionStatus } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChildren, QueryList } from "@angular/core";
import { MatAccordion } from '@angular/material';
import { MatExpansionPanel } from '@angular/material/expansion';
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { of } from 'rxjs';
import { Uebung, IUebung } from 'src/Business/Uebung/Uebung';
import { UebungService } from 'src/app/services/uebung.service';

@Component({
    selector: "app-programm02",
    templateUrl: "./programm02.component.html",
    styleUrls: ["./programm02.component.scss"],
})
export class Programm02Component implements OnInit {
    @Input() programm: ITrainingsProgramm = null;
    @Input() SessionListe: Array<Session> = [];
    @Input() ShowButtons: Boolean = false;
    @ViewChildren("accSession") accSession: QueryList<MatAccordion>;
    @ViewChildren("panSession") panUebung: QueryList<MatExpansionPanel>;

    private isExpanded: Boolean = true;
    public ToggleButtonText: string = "Close all sessions";

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService,
        private fUebungService: UebungService,
        private fDbModule: DexieSvcService
    ) {}

    ngOnInit() {}
    
    public CopySession(aSession: Session) {
        this.fGlobalService.SessionKopie = aSession.Copy();
    }

    public DeleteSession(aSession : Session, aRowNum: number) {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push(`Delete session #${aRowNum + 1} "${aSession.Name}" ?`);
        mDialogData.OkFn = ():void => {
            const index: number = this.SessionListe.indexOf(aSession);
            if (index !== -1) {
                this.SessionListe.splice(index, 1);
            }
            
            if (this.fGlobalService.Comp03PanelUebungObserver != null) {
                //this.panUebung.expanded = false;
                of(this.panUebung).subscribe(
                    this.fGlobalService.Comp03PanelUebungObserver
                );
            }
        };   

        this.fDialogService.JaNein(mDialogData);        
    }

    // Wird an "AddExercise" als Parameter uebergeben
    private SelectUebungDelegate(aUebungWaehlenData: UebungWaehlenData) {
        aUebungWaehlenData.fUebungsListe.forEach(
            (mUebung => {
                if (mUebung.Selected) {
                    aUebungWaehlenData.fSession.addUebung(Uebung.StaticKopiere(mUebung, UebungsKategorie02.Session));
                }
            })
        );
        aUebungWaehlenData.fMatDialog.close();
    };

    public AddExercise(aSession: Session) {
        if (this.fDbModule.UebungsDaten.length === 0)
            this.fDbModule.LadeStammUebungen();
        else
            this.fUebungService.UebungWaehlen(this.fDbModule.UebungsDaten, aSession, this.SelectUebungDelegate);
    }

    public PasteExcercise(aSession : Session) {
        if (this.fGlobalService.SessUebungKopie === null) {
            const mDialoData = new DialogData();
            mDialoData.textZeilen.push("No data to paste!");
            this.fDialogService.Hinweis(mDialoData);
            return;
        }

        const mSessUebung: Uebung = this.fGlobalService.SessUebungKopie.Copy();
        mSessUebung.SessionID = aSession.ID;
        aSession.UebungsListe.push(mSessUebung);
    }

    public toggleSessions(): void {
        if (!this.accSession)
            return;

        if (this.isExpanded) {
            this.accSession.forEach((acc) => acc.closeAll());
            this.isExpanded = false;
            this.ToggleButtonText = "Open all Sessions";
        } else {
            this.accSession.forEach((acc) => acc.openAll());
            this.isExpanded = true;
            this.ToggleButtonText = "Close all Sessions";
        }
    }

    public accCheckSessionPanels() {
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
            this.ToggleButtonText = "Open all sessions";
        } else {
            this.isExpanded = true;
            this.ToggleButtonText = "Close all sessions";
        }
    }

    public AddSession() {
        const mDate = new Date();
        const mSession: Session = new Session();
        mSession.Name = `Session ${mDate.toLocaleString()}`;
        mSession.Datum = new Date();
        mSession.DauerInSek = 0;
        mSession.SessionNr = this.SessionListe.length + 1;
        mSession.Kategorie01 = SessionStatus.Bearbeitbar;
        //mSession.FK_Programm = this.programm.ID;
        this.SessionListe.push(mSession);        
    }

    public PasteSession() {
        if (this.fGlobalService.SessionKopie === null) {
            const mDialoData = new DialogData();
            mDialoData.textZeilen.push("No data to paste!");
            this.fDialogService.Hinweis(mDialoData);
            return;
        }

        const mSession: Session = this.fGlobalService.SessionKopie.Copy();
        //mSession.FK_Programm = this.programmID;
        this.SessionListe.push(mSession);        

    }

    public SaveChanges() {
        this.fDbModule.ProgrammSpeichern(this.programm);
    }

    public CancelChanges() {
        alert("CancelChanges");
    }
}
