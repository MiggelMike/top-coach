import { DexieSvcService } from './../services/dexie-svc.service';
import { TrainingsProgramm,ITrainingsProgramm, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ISession, } from './../../Business/Session/Session';

import { GlobalService } from './../services/global.service';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { of,Observable } from 'rxjs';



@Component({
    selector: "app-anstehende-sessions",
    templateUrl: "./anstehende-sessions.component.html",
    styleUrls: ["./anstehende-sessions.component.scss"],
})
export class AnstehendeSessionsComponent implements OnInit {
    public isCollapsed = false;
    public get AktuellesProgramm(): ITrainingsProgramm {
        return this.fDbModule.AktuellesProgramm;
    }

    public NextSessions: Array<ISession> = [];
    public AnstehendeSessionObserver: Observable<ITrainingsProgramm>;

    constructor(
        private fDbModule: DexieSvcService
    ) {
        this.AnstehendeSessionObserver = of(this.fDbModule.AktuellesProgramm);
        this.AnstehendeSessionObserver.subscribe(
           () => (this.LadeProgrammSessions(this.fDbModule.AktuellesProgramm)) 
        )
    }

    ngOnInit() {
    }

    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }

    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }

    public LadeProgrammSessions(aProgram: ITrainingsProgramm) {
        if ((aProgram !== undefined)&&(aProgram !== null))
            this.fDbModule.LadeProgrammSessions(aProgram, (mSessions: Array<ISession>) => (this.NextSessions = mSessions)
            );
    }
}