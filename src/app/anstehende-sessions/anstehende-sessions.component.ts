import { DexieSvcService, SessionParaDB, UebungParaDB } from './../services/dexie-svc.service';
import {  ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { IProgramModul, ProgramModulTyp } from '../app.module';

@Component({
    selector: "app-anstehende-sessions",
    templateUrl: "./anstehende-sessions.component.html",
    styleUrls: ["./anstehende-sessions.component.scss"],
})
export class AnstehendeSessionsComponent implements OnInit, IProgramModul {
    public isCollapsed = false;
    private worker: Worker;
    // private fProgramm: ITrainingsProgramm;
    
    constructor(
        private fDbModule: DexieSvcService,
        private fLoadingDialog: DialogeService,
    ) {
        
     }
    
    get programModul(): typeof ProgramModulTyp {
        return ProgramModulTyp;
    }
  
    private async LadeSessions(aOffSet: number = 0): Promise<void> {
        const mDialogData = new DialogData();
        mDialogData.ShowAbbruch = false;
        mDialogData.ShowOk = false;
        mDialogData.hasBackDrop = false;
        mDialogData.height = '150px';
        this.fLoadingDialog.Loading(mDialogData);
        try {
            const mSessionParaDB: SessionParaDB = new SessionParaDB();
            mSessionParaDB.UebungenBeachten = true;
            mSessionParaDB.UebungParaDB = new UebungParaDB();
            mSessionParaDB.UebungParaDB.WhereClause = "SessionID";
            mSessionParaDB.UebungParaDB.anyOf = (aSession) => {
                return aSession.ID;
            };

            mSessionParaDB.UebungParaDB.SaetzeBeachten = true;
        }
        catch (err) {
            this.fLoadingDialog.fDialog.closeAll();
            console.error(err);
        }
    

    }
        
        
    ngOnInit() {
        DexieSvcService.ModulTyp = ProgramModulTyp.AnstehendeSessions;
    }

    public get AktuellesProgramm(): ITrainingsProgramm {
        const p: ITrainingsProgramm = DexieSvcService.AktuellesProgramm;
        return DexieSvcService.AktuellesProgramm;
    }
                
    beforePanelOpened(aSess: Session) {
        aSess.Expanded = true;
    }
    
    beforePanelClosed(aSess: Session) {
        aSess.Expanded = false;
    }

    DoWorker() {
        const that: AnstehendeSessionsComponent = this;
        if (typeof Worker !== 'undefined') {
            if (DexieSvcService.AktuellesProgramm === undefined || this.fDbModule.RefreshAktuellesProgramm === true) {
                this.fDbModule.RefreshAktuellesProgramm = false;
                that.worker = new Worker(new URL('./anstehende-sessions.worker', import.meta.url));
                that.worker.addEventListener('message', ({ data }) => {
                    if (data.action === "LadeAktuellesProgramm") {
                        that.fDbModule.LadeAktuellesProgramm()
                            .then(async (aProgramm) => {
                                DexieSvcService.AktuellesProgramm = aProgramm;
                                DexieSvcService.CmpAktuellesProgramm = aProgramm;
                                // this.fProgramm = aProgramm;
                                if (aProgramm !== undefined) {
                                    DexieSvcService.AktuellesProgramm.SessionListe = [];
                                    // this.fProgramm = that.fDbModule.AktuellesProgramm.Copy();
                                    that.LadeSessions();
                                }
                            });
                    } // if
                    else if (data.action === "LadeUebungen") {
                        // that.Programm.SessionListe = that.fDbModule.AktuellesProgramm.SessionListe;
                        const mUebungParaDB: UebungParaDB = new UebungParaDB();
                        // mUebungParaDB.SaetzeBeachten = true;
                        DexieSvcService.AktuellesProgramm.SessionListe.forEach(
                            // that.fDbModule.AktuellesProgramm.SessionListe.forEach(
                            (aSession) => {
                                if (aSession.UebungsListe === undefined || aSession.UebungsListe.length <= 0) {
                                    that.fDbModule.LadeSessionUebungen(aSession.ID, mUebungParaDB).then(
                                        (aUebungsListe) => {
                                            if (aUebungsListe.length > 0)
                                                aSession.UebungsListe = aUebungsListe;
                                        });
                                        
                                }
                            });//for
                        // that.fDbModule.AktuellesProgramm.SessionListe = this.fProgramm.SessionListe;
                    }//if
                });
            } else {
                //    this.fProgramm = that.fDbModule.AktuellesProgramm.Copy();
                // this.fProgramm = this.fDbModule.AktuellesProgramm;
            }

                        
            // that.worker.onmessage = ({ data }) => {
            //     console.log(data);
            // };
            that.worker.postMessage('LadeAktuellesProgramm');
        }
    }
}