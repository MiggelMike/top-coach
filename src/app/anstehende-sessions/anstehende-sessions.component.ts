import { cSessionSelectLimit, DexieSvcService, ProgrammParaDB, SessionParaDB, UebungParaDB } from './../services/dexie-svc.service';
import {  ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Observable, of } from 'rxjs';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';



@Component({
    selector: "app-anstehende-sessions",
    templateUrl: "./anstehende-sessions.component.html",
    styleUrls: ["./anstehende-sessions.component.scss"],
})
export class AnstehendeSessionsComponent implements OnInit {
    public isCollapsed = false;
    public Programm: ITrainingsProgramm;
    
    public AnstehendeSessionObserver: Observable<ITrainingsProgramm>;
    
    constructor(
        private fDbModule: DexieSvcService,
		private fLoadingDialog: DialogeService
    ) {
        this.AnstehendeSessionObserver = of(this.fDbModule.AktuellesProgramm);
    }

    private async LadeSessions  (aOffSet: number = 0):Promise<void> {
        const mSessionParaDB: SessionParaDB = new SessionParaDB();
        mSessionParaDB.OffSet = aOffSet;
        mSessionParaDB.Limit = cSessionSelectLimit;
        await this.fDbModule.LadeUpcomingSessions(this.Programm.id, mSessionParaDB)
            .then( (aSessionListe) => {
                if (aSessionListe.length > 0) {
                    this.Programm.SessionListe = this.Programm.SessionListe.concat(aSessionListe);
                    this.LadeSessions(this.Programm.SessionListe.length);
                }
                else this.fLoadingDialog.fDialog.closeAll();
            });
    }
    
    
    ngOnInit() {
        const mDialogData = new DialogData();
		mDialogData.ShowAbbruch = false;
		mDialogData.ShowOk = false;
        this.fLoadingDialog.Loading(mDialogData);
        try {
            this.fDbModule.LadeAktuellesProgramm()
                .then( async (aProgramm) => {
                    this.Programm = aProgramm;
                    this.Programm.SessionListe = [];
                    this.LadeSessions();
                });
        } catch (error) {
            this.fLoadingDialog.fDialog.closeAll();
        }
    }

    public get AktuellesProgramm(): ITrainingsProgramm {
        return this.Programm;
    }
                
    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }

    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }
}