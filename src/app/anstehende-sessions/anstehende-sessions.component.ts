import { GlobalService } from './../services/global.service';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';

@Component({
    selector: 'app-anstehende-sessions',
    templateUrl: './anstehende-sessions.component.html',
    styleUrls: ['./anstehende-sessions.component.scss']
})
export class AnstehendeSessionsComponent implements OnInit {
    public isCollapsed = false;
    public NextSessions: Array<Session> = [];
    public AnstehendeSessionObserver;

    constructor(private globalService: GlobalService ) {
     }

    ngOnInit() {
        this.AnstehendeSessionObserver = this.globalService.LadeAnstehendeSession();// .Daten.AktuellesProgramm.Programm.SessionListe;// .trainingsProgrammSvcService.LadeAnstehendeSession();
        this.NextSessions = this.LadeSessions();
    }

    public LadeSessions(): Array<Session> {
        this.AnstehendeSessionObserver.subscribe( (sessions: Array<Session>) => {
            this.NextSessions = sessions;
        });
        return this.NextSessions;
    }

}
