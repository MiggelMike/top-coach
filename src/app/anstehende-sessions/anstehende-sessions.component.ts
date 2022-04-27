import { cSessionSelectLimit, DexieSvcService, ProgrammParaDB, SessionParaDB } from './../services/dexie-svc.service';
import {  ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Observable, of } from 'rxjs';



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
        private fDbModule: DexieSvcService
    ) {
        this.AnstehendeSessionObserver = of(this.fDbModule.AktuellesProgramm);
    }

    private LadeSessions  (aOffSet: number = 0) {
        const mSessionParaDB: SessionParaDB = new SessionParaDB();
        mSessionParaDB.OffSet = aOffSet;
        mSessionParaDB.Limit = cSessionSelectLimit;
        this.fDbModule.LadeUpcomingSessions(this.Programm.id, mSessionParaDB)
            .then( (aSessionListe) => {
                if (aSessionListe.length > 0) {
                    this.Programm.SessionListe = this.Programm.SessionListe.concat(aSessionListe);
                    this.LadeSessions(this.Programm.SessionListe.length);
                }
            });
    }
    
    
    ngOnInit() {
        this.fDbModule.LadeAktuellesProgramm()
            .then( async (aProgramme) => {
                this.Programm = aProgramme;
                this.Programm.SessionListe = [];
                this.LadeSessions();
            });
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