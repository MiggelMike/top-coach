import { DexieSvcService  } from './../services/dexie-svc.service';
import {  ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';



@Component({
    selector: "app-anstehende-sessions",
    templateUrl: "./anstehende-sessions.component.html",
    styleUrls: ["./anstehende-sessions.component.scss"],
})
export class AnstehendeSessionsComponent implements OnInit {
    public isCollapsed = false;
    
    public AnstehendeSessionObserver: Observable<ITrainingsProgramm>;
    
    constructor(
        private fDbModule: DexieSvcService
        //, private router: Router
    ) {
        this.AnstehendeSessionObserver = of(this.fDbModule.AktuellesProgramm);
    }
    
    ngOnInit() {
        this.AnstehendeSessionObserver.subscribe(
            async () => {
                await this.fDbModule.LadeAktuellesProgramm();
            });
    }
                
    public get AktuellesProgramm(): ITrainingsProgramm {
        let mProgram: ITrainingsProgramm;
        if ((this.fDbModule.AktuellesProgramm) && (this.fDbModule.AktuellesProgramm.SessionListe)) {
            mProgram = this.fDbModule.AktuellesProgramm;
            mProgram.SessionListe = this.fDbModule.UpComingSessionList();
        }
        return mProgram;
    }
                
    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }

    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }
}