import { Component, OnInit } from '@angular/core';
import { TrainingsProgrammSvc } from '../services/trainings-programm-svc.service';
import { Session } from '../../Business/Session/Session';
declare var $: any;

@Component({
    selector: 'app-anstehende-sessions',
    templateUrl: './anstehende-sessions.component.html',
    styleUrls: ['./anstehende-sessions.component.scss']
})
export class AnstehendeSessionsComponent implements OnInit {
    public isCollapsed = false;
    public NextSessions: Array<Session> = [];
    public AnstehendeSessionObserver;

    constructor(private trainingsProgrammSvcService: TrainingsProgrammSvc) {
     }

    ngOnInit() {
        this.AnstehendeSessionObserver = this.trainingsProgrammSvcService.LadeAnstehendeSession();
        this.NextSessions = this.LadeSessions();
    }

    public LadeSessions(): Array<Session> {
        this.AnstehendeSessionObserver.subscribe( (sessions: Array<Session>) => {
            this.NextSessions = sessions;
        });
        return this.NextSessions;
    }

}
