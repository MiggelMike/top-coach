import { ISession, Session, SessionStatus } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { MatAccordion } from '@angular/material';
import { MatExpansionPanel } from '@angular/material/expansion';
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { IUebung_Sess } from 'src/Business/Uebung/Uebung_Sess';

@Component({
    selector: "app-programm02",
    templateUrl: "./programm02.component.html",
    styleUrls: ["./programm02.component.scss"],
})
export class Programm02Component implements OnInit {
    @Input() programm: ITrainingsProgramm = null;
    @Input() SessionListe: Array<ISession> = [];
    @Input() ShowButtons: Boolean = false;
    @ViewChildren("accSession") accSession: QueryList<MatAccordion>;
    @ViewChildren("panSession") panUebung: QueryList<MatExpansionPanel>;

    private isExpanded: Boolean = true;
    public ToggleButtonText: string = "Close all sessions";

    constructor(
        private fDialogService: DialogeService,
        private fGlobalService: GlobalService
    ) {}

    ngOnInit() {}

    public CopySession(aSession: ISession) {
        this.fGlobalService.SessionKopie = aSession.Copy();
    }

    public DeleteSession(aSession : ISession, aRowNum: number) {
        const mDialogData = new DialogData();
        mDialogData.textZeilen.push(`Delete session #${aRowNum + 1} "${aSession.Name}" ?`);
        mDialogData.OkFn = () => {
            const index: number = this.SessionListe.indexOf(aSession);
            if (index !== -1) {
                this.SessionListe.splice(index, 1);
            }
        };   

        this.fDialogService.JaNein(mDialogData);        
    }

    public AddExcercise() {
        alert("Add Excercise");
    }

    public CopyExcercise() {
        alert("Copy Excercise");
    }
  

    public PasteExcercise(aSession : ISession) {
        if (this.fGlobalService.SessUebungKopie === null) {
            const mDialoData = new DialogData();
            mDialoData.textZeilen.push("No data to paste!");
            this.fDialogService.Hinweis(mDialoData);
            return;
        }

        const mSessUebung: IUebung_Sess = this.fGlobalService.SessUebungKopie.Copy();
        mSessUebung.Session = aSession;
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
        const mSession: ISession = new Session(
            {
                ID: 0,
                Name: `Session #${this.SessionListe.length + 1}`,
                Datum: new Date(),
                DauerInSek: 0,
                SessionNr: this.SessionListe.length + 1,
                FK_Programm: this.programm.ID,
                Kategorie01: SessionStatus.Bearbeitbar
            } as Session);

        mSession.FK_Programm = this.programm.ID;
        this.SessionListe.push(mSession);        
    }

    public PasteSession() {
        if (this.fGlobalService.SessionKopie === null) {
            const mDialoData = new DialogData();
            mDialoData.textZeilen.push("No data to paste!");
            this.fDialogService.Hinweis(mDialoData);
            return;
        }

        const mSession: ISession = this.fGlobalService.SessionKopie.Copy();
        mSession.FK_Programm = this.programm.ID;
        this.SessionListe.push(mSession);        

    }

    public SaveChanges() {
        alert("SaveChanges");
    }

    public CancelChanges() {
        alert("CancelChanges");
    }
}
