import { MatExpansionPanel } from '@angular/material/expansion';
import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ISession } from './../../Business/Session/Session';
import { GlobalService } from './../services/global.service';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Observable } from 'rxjs';



@Component({
    selector: 'app-anstehende-sessions',
    templateUrl: './anstehende-sessions.component.html',
    styleUrls: ['./anstehende-sessions.component.scss'],
})
    
export class AnstehendeSessionsComponent implements OnInit {
    public isCollapsed = false;
    public AktuellesProgramm: ITrainingsProgramm;
    public NextSessions: Array<ISession> = [];
    public AnstehendeSessionObserver: Observable<ISession[]>;
 
    constructor( private globalService: GlobalService ) {
        
    }

    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }

    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }

    ngOnInit() {
        this.AktuellesProgramm = this.globalService.DB.AktuellesProgramm;
        this.AnstehendeSessionObserver = this.globalService.LadeAnstehendeSession();
        if (this.AktuellesProgramm !== undefined)
            this.AktuellesProgramm.SessionListe = this.LadeSessions();
    }

    public LadeSessions(): Array<ISession> {
        this.AnstehendeSessionObserver.subscribe((sessions: Array<Session>) => {
            if (this.AktuellesProgramm === undefined)
                return [];
            if (sessions === null)
                this.AktuellesProgramm.SessionListe = [];
            else {
                this.AktuellesProgramm.SessionListe = sessions;
            }
        });
        if (this.AktuellesProgramm === undefined)
            return [];
        return this.AktuellesProgramm.SessionListe;
    }

}
