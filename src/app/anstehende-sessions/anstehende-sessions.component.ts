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

    public AnstehendeSessionObserver: Observable<ITrainingsProgramm>;

    constructor(
        private fDbModule: DexieSvcService
    ) {
        this.AnstehendeSessionObserver = of(this.fDbModule.AktuellesProgramm);
    }
    
    ngOnInit() {
        this.AnstehendeSessionObserver.subscribe(
            () => {
                if (this.fDbModule.AktuellesProgramm === undefined) {
                    this.fDbModule.LadeProgramme(ProgrammKategorie.AktuellesProgramm,
                        (aProgramme) => {
                            if (aProgramme.length > 0)
                                this.fDbModule.AktuellesProgramm = aProgramme[0];
                        });
                }
            } 
        )
    }

    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }

    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }

    public LadeProgrammSessions(aProgram: ITrainingsProgramm) {
        if ((aProgram !== undefined) && (aProgram !== null))
            this.fDbModule.LadeProgrammSessions(aProgram);
    }
}