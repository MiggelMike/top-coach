import { MatAccordion } from '@angular/material/expansion';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ISession } from './../../Business/Session/Session';
import { GlobalService, AktuellesProgramm } from './../services/global.service';
import { Component, OnInit, ViewChild, ViewChildren, QueryList, ChangeDetectorRef, NgZone } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Subscriber, Observable } from 'rxjs';
import { MatGridTileHeaderCssMatStyler } from '@angular/material';


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
 
    constructor(private fZone: NgZone, private globalService: GlobalService ) {
        
    }

    ngOnInit() {
        this.AktuellesProgramm = this.globalService.Daten.AktuellesProgramm.Programm;
        this.AnstehendeSessionObserver = this.globalService.LadeAnstehendeSession();
        this.AktuellesProgramm.SessionListe = this.LadeSessions();
    }
    
    public LadeSessions(): Array<Session> {
        this.AnstehendeSessionObserver.subscribe((sessions: Array<Session>) => {
            if (sessions === null)
                this.AktuellesProgramm.SessionListe = [];
            else {
                this.AktuellesProgramm.SessionListe = sessions;
            }
        });
        return this.AktuellesProgramm.SessionListe;
    }

}
