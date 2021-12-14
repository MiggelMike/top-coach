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
                                    (s) => s.Kategorie02 === SessionStatus.Wartet
                                );
                                // this.PrepAkuellesProgramm(this.AktuellesProgramm)
                            }
                        }, // OnProgrammAfterLoadFn
                                
                    } as LadePara
                ); // Aktuelles Programm laden
            });


        // this.AnstehendeSessionObserver.subscribe(
        //     () => {
        //         if (this.fDbModule.AktuellesProgramm === undefined) {
        //             this.fDbModule.LadeAktuellesProgramm(this.AktuellesProgramm);
                        // .LadeProgramme(ProgrammKategorie.AktuellesProgramm,
                        // (aProgramm) => {
                        //     if ((aProgramm !== undefined) && (aProgramm !== null)) {
                        //         this.AktuellesProgramm = aProgramm.Copy();
                        //         let mNeueSessions: Array<SessionDB> = [];
                        //         let mUndoneSessions: Array<SessionDB> = [];
                        //         let mDoneSessions: Array<SessionDB> = [];
                                
                        //         for (let i = 0; i < this.AktuellesProgramm.SessionListe.length; i++) {
                        //             if ((this.AktuellesProgramm.SessionListe[i].Kategorie02 === SessionStatus.Fertig)
                        //              || (this.AktuellesProgramm.SessionListe[i].Kategorie02 === SessionStatus.FertigTimeOut))
                        //                 mDoneSessions.push(this.AktuellesProgramm.SessionListe[i]);
                        //         }      

                        //         // Sind alle Sessions des aktuellen Programms erledigt?  
                        //         if (mDoneSessions.length === this.fDbModule.AktuellesProgramm.SessionListe.length) {
                        //             // Alle Sessions des aktuellen Programms sind erledigt  
                        //             if (this.fDbModule.AktuellesProgramm.SessionListe.length < this.fDbModule.AktuellesProgramm.Tage * 2) {
                        //                 for (let i = 0; i < this.fDbModule.AktuellesProgramm.SessionListe.length; i++) {
                        //                     this.fDbModule.AktuellesProgramm.SessionListe[i].init();
                        //                 }
                        //             }
                        //         }
                                    
                        //         this.fDbModule.AktuellesProgramm.SessionListe = [];
                        //         for (let i = 0; i < mUndoneSessions.length; i++)
                        //             this.fDbModule.AktuellesProgramm.SessionListe.push(mUndoneSessions[i] as ISession);

                        //         if (this.fDbModule.AktuellesProgramm.SessionListe.length <  this.fDbModule.AktuellesProgramm.Tage * 2) {
                        //             for (let i = 0; i < this.fDbModule.AktuellesProgramm.SessionListe.length; i++) {
                        //                 let mSessionDB: SessionDB = null;
                        //                 // if ((this.fDbModule.AktuellesProgramm.SessionListe[j].Kategorie02 === SessionStatus.Fertig)
                        //                 //     || (this.fDbModule.AktuellesProgramm.SessionListe[j].Kategorie02 === SessionStatus.FertigTimeOut)) {
                        //                 mSessionDB = this.fDbModule.AktuellesProgramm.SessionListe[i].Copy();
                        //                 mSessionDB.Kategorie02 = SessionStatus.Wartet;
                        //                 mNeueSessions.push(mSessionDB);
                        //             }
                                
                                
                        //             for (let i = 0; i < mNeueSessions.length; i++) {
                        //                 this.fDbModule.AktuellesProgramm.SessionListe.push(mNeueSessions[i] as ISession);
                                    
                        //             }
                        //         }
                            
                        //     }
                        // });
        //         }
        //     } 
        // )
    }

    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }

    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }

    // public LadeProgrammSessions(aProgram: ITrainingsProgramm) {
    //     if ((aProgram !== undefined) && (aProgram !== null))
    //         this.fDbModule.LadeProgrammSessions(aProgram);
    // }
}