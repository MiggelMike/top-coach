import { DexieSvcService } from './../services/dexie-svc.service';
import { ITrainingsProgramm, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ISession, SessionStatus } from './../../Business/Session/Session';
import { GlobalService } from './../services/global.service';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Observable } from 'rxjs';



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
    public AnstehendeSessionObserver: Observable<ISession[]>;

    constructor(
        private globalService: GlobalService,
        private fDbModule: DexieSvcService
    ) {
        this.AnstehendeSessionObserver = this.globalService.LadeAnstehendeSession();
        this.LadeSessions();
    }

    ngOnInit() {
    }

    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }

    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }

    public LadeSessions():void {
        this.AnstehendeSessionObserver.subscribe(
            (sessions: Array<ISession>) => {
                this.fDbModule
                    .LadeProgramme(ProgrammKategorie.AktuellesProgramm)
                    .then(() => {
                        sessions.forEach(
                            (s) => (s.Kategorie01 =  SessionStatus.NurLesen)
                        );
                    });
            }
        );
    }
}
