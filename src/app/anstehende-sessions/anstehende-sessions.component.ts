import { cSessionSelectLimit, cUebungSelectLimit, DexieSvcService, ProgrammParaDB, SessionParaDB, UebungParaDB } from './../services/dexie-svc.service';
import {  ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { Observable, of, throwIfEmpty } from 'rxjs';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';



@Component({
    selector: "app-anstehende-sessions",
    templateUrl: "./anstehende-sessions.component.html",
    styleUrls: ["./anstehende-sessions.component.scss"],
})
export class AnstehendeSessionsComponent implements OnInit {
    public isCollapsed = false;
    private worker: Worker;
    
    // public AnstehendeSessionObserver: Observable<ITrainingsProgramm>;
    
    constructor(
        private fDbModule: DexieSvcService,
		private fLoadingDialog: DialogeService
        ) {
            // this.AnstehendeSessionObserver = of(this.fDbModule.AktuellesProgramm);
        }
        
    public get Programm(): ITrainingsProgramm {
        return this.fDbModule.AktuellesProgramm;
    }

    private async LadeSessions  (aOffSet: number = 0):Promise<void> {
        const mSessionParaDB: SessionParaDB = new SessionParaDB();
        // mSessionParaDB.OffSet = aOffSet;
      //  mSessionParaDB.Limit = cSessionSelectLimit;
        this.fDbModule.LadeUpcomingSessions(this.Programm.id, mSessionParaDB)
            .then((aSessionListe) => {
                this.fDbModule.AktuellesProgramm.SessionListe = aSessionListe;
            });
    }
        
        
    ngOnInit() {
        this.DoWorker();
        // this.fLoadingDialog.Loading(mDialogData);
        // try {
        //     this.fDbModule.LadeAktuellesProgramm()
        //         .then( async (aProgramm) => {
        //             this.Programm = aProgramm;
        //             this.Programm.SessionListe = [];
        //             this.LadeSessions();
        //         });
        // } catch (error) {
        // //    this.fLoadingDialog.fDialog.closeAll();
        // }
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

    DoWorker() {
        // if (this.fDbModule.AktuellesProgramm === undefined) {
        //     this.fDbModule.LadeAktuellesProgramm()
        //         .then(async (aProgramm) => {
        //             if (aProgramm !== undefined) {
        //                 this.fDbModule.AktuellesProgramm.SessionListe = [];
        //                 const mSessionParaDB: SessionParaDB = new SessionParaDB();
        //                 this.fDbModule.LadeUpcomingSessions(this.Programm.id, mSessionParaDB)
        //                     .then((aSessionListe) => {
        //                         this.fDbModule.AktuellesProgramm.SessionListe = aSessionListe;
        //                     });
        //             }
        //         });
        // }

        const that: AnstehendeSessionsComponent = this;
        if (typeof Worker !== 'undefined') {
            that.worker = new Worker(new URL('./anstehende-sessions.worker', import.meta.url));
            // const mDialogData = new DialogData();
            // mDialogData.ShowAbbruch = false;
            // mDialogData.ShowOk = false;
            that.worker.addEventListener('message', ({ data }) => {
                if (data.action === "LadeAktuellesProgramm") {
                    // this.fLoadingDialog.Loading(mDialogData);
                    if (that.fDbModule.AktuellesProgramm === undefined) {
                        try {
                            that.fDbModule.LadeAktuellesProgramm()
                                .then(async (aProgramm) => {
                                    if (aProgramm !== undefined) {
                                        that.fDbModule.AktuellesProgramm.SessionListe = [];
                                        that.LadeSessions();
                                    } // else this.fLoadingDialog.fDialog.closeAll();
                                });
                        } catch (error) {
                            // this.fLoadingDialog.fDialog.closeAll();
                        }
                    }
                } // if
                else if (data.action === "LadeUebungen") {
                    that.Programm.SessionListe = that.fDbModule.AktuellesProgramm.SessionListe;
                    // if (this.fDbModule.AktuellesProgramm.SessionListe === undefined || this.fDbModule.AktuellesProgramm.SessionListe.length <= 0) {
                        const mUebungParaDB: UebungParaDB = new UebungParaDB();
                        // mUebungParaDB.Limit = cUebungSelectLimit;
                        // mUebungParaDB.OffSet = 0;
                        mUebungParaDB.SaetzeBeachten = true;
                        that.fDbModule.AktuellesProgramm.SessionListe.forEach(
                            (aSession) => {
                                that.fDbModule.LadeSessionUebungen(aSession.ID, mUebungParaDB).then(
                                    (aUebungsListe) => {
                                        if (aUebungsListe.length > 0) aSession.UebungsListe = aUebungsListe;
                                        else that.fDbModule.CmpAktuellesProgramm = that.fDbModule.AktuellesProgramm.Copy();
                                    });
                                });//for
                                // }
                            }//if
                        });
                        
                        // that.worker.onmessage = ({ data }) => {
                        //     console.log(data);
                        // };
            that.worker.postMessage('LadeAktuellesProgramm');
        } else {
            // Web Workers are not supported in this environment.
            // You should add a fallback so that your program still executes correctly.
        }
    }

    ngAfterContentInit() {
        
        
    }
    
    ngAfterViewInit() {
    }
}