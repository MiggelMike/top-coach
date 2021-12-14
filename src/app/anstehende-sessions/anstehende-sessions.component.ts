import { DexieSvcService, LadePara } from './../services/dexie-svc.service';
import {  TrainingsProgramm, ITrainingsProgramm, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Observable, of } from 'rxjs';
import { SessionStatus } from 'src/Business/SessionDB';



@Component({
    selector: "app-anstehende-sessions",
    templateUrl: "./anstehende-sessions.component.html",
    styleUrls: ["./anstehende-sessions.component.scss"],
})
export class AnstehendeSessionsComponent implements OnInit {
    public AktuellesProgramm: ITrainingsProgramm;
    public isCollapsed = false;

    public AnstehendeSessionObserver: Observable<ITrainingsProgramm>;

    constructor(
        private fDbModule: DexieSvcService
    ) {
       this.AnstehendeSessionObserver = of(this.fDbModule.AktuellesProgramm);
    }
    
    ngOnInit() {
        this.AnstehendeSessionObserver.subscribe(
            () => {
                this.fDbModule.LadeProgramme(
                    {
                        fProgrammKategorie: ProgrammKategorie.AktuellesProgramm,

                        OnProgrammAfterLoadFn: (mProgramme: TrainingsProgramm[]) => {
                            if ((mProgramme !== undefined) && (mProgramme.length > 0)) {
                                this.AktuellesProgramm = mProgramme[0];
                                this.AktuellesProgramm.SessionListe =
                                    this.AktuellesProgramm.SessionListe.filter(
                                        (s) => (s.Kategorie02 !== SessionStatus.Fertig && s.Kategorie02 !== SessionStatus.FertigTimeOut)
                                    );
                            }
                        }, // OnProgrammAfterLoadFn
                                
                    } as LadePara
                ); // Aktuelles Programm laden
            });
    }

    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }

    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }
}