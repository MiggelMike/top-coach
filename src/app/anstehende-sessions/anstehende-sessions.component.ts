import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ISession } from './../../Business/Session/Session';
import { GlobalService, AktuellesProgramm } from './../services/global.service';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Subscriber, Observable } from 'rxjs';

@Component({
    selector: 'app-anstehende-sessions',
    templateUrl: './anstehende-sessions.component.html',
    styleUrls: ['./anstehende-sessions.component.scss']
})
export class AnstehendeSessionsComponent implements OnInit {
    public isCollapsed = false;
    public AktuellesProgramm: ITrainingsProgramm;
    public NextSessions: Array<ISession> = [];
    public AnstehendeSessionObserver: Observable<ISession[]>;

    constructor(private globalService: GlobalService) {
     }

    ngOnInit() {
        this.AktuellesProgramm = this.globalService.Daten.AktuellesProgramm.Programm;
        if (this.AktuellesProgramm !== undefined)
            this.AktuellesProgramm.SessionListe = [];
        this.AnstehendeSessionObserver = this.globalService.LadeAnstehendeSession();
        // .Daten.AktuellesProgramm.Programm.SessionListe;// .trainingsProgrammSvcService.LadeAnstehendeSession();
        this.NextSessions = this.LadeSessions();
    }

    public LadeSessions(): Array<Session> {
        this.AnstehendeSessionObserver.subscribe((sessions: Array<Session>) => {
            if (sessions === null)
                this.NextSessions = [];
            else
                this.NextSessions = sessions;
        });
        return this.NextSessions;
    }

}
