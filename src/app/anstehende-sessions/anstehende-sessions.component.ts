import { DexieSvcService, ProgrammParaDB  } from './../services/dexie-svc.service';
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
    
    ngOnInit() {
        this.fDbModule.LadeAktuellesProgramm()
            .then( async (aProgramme) => {
                this.Programm = aProgramme;
                await this.fDbModule.LadeProgrammSessions(this.Programm.id)
                    .then((aSessionListe) => this.Programm.SessionListe = aSessionListe);
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