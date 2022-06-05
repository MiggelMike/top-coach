import { DexieSvcService, SessionParaDB, UebungParaDB } from './../services/dexie-svc.service';
import {  ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
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
    private fProgramm: ITrainingsProgramm;
    
    constructor(
        private fDbModule: DexieSvcService,
		private fLoadingDialog: DialogeService
        ) {}
        
    public get Programm(): ITrainingsProgramm {
        return this.fProgramm;
    }

    private async LadeSessions(): Promise<void> {
        this.fProgramm.SessionListe = [];
        const mSessionParaDB: SessionParaDB = new SessionParaDB();
        this.fDbModule.LadeUpcomingSessions(this.Programm.id, mSessionParaDB)
            .then((aSessionListe) => {
                this.fDbModule.AktuellesProgramm.SessionListe = aSessionListe;
                aSessionListe.forEach((mSession) => this.fProgramm.SessionListe.push(mSession));
                // this.worker.postMessage('LadeUebungen');
                this.fLoadingDialog.fDialog.closeAll();
            });
    }
        
        
    ngOnInit() {
        this.DoWorker();
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
        const that: AnstehendeSessionsComponent = this;
        if (typeof Worker !== 'undefined') {
            that.worker = new Worker(new URL('./anstehende-sessions.worker', import.meta.url));
            that.worker.addEventListener('message', ({ data }) => {
                if (data.action === "LadeAktuellesProgramm") {
                    const mDialogData = new DialogData();
                    mDialogData.ShowAbbruch = false;
                    mDialogData.ShowOk = false;
                    this.fLoadingDialog.Loading(mDialogData);
                    try {
                        that.fDbModule.LadeAktuellesProgramm()
                            .then(async (aProgramm) => {
                                if (aProgramm !== undefined) {
                                    that.fDbModule.AktuellesProgramm.SessionListe = [];
                                    this.fProgramm = that.fDbModule.AktuellesProgramm.Copy();
                                    that.LadeSessions();
                                }
                            });
                    } catch (error) {
                        this.fLoadingDialog.fDialog.closeAll();
                    }
                } // if
                else if (data.action === "LadeUebungen") {
                    try {
                        that.Programm.SessionListe = that.fDbModule.AktuellesProgramm.SessionListe;
                        const mUebungParaDB: UebungParaDB = new UebungParaDB();
                        // mUebungParaDB.SaetzeBeachten = true;
                        that.fDbModule.AktuellesProgramm.SessionListe.forEach(
                            (aSession) => {
                                that.fDbModule.LadeSessionUebungen(aSession.ID, mUebungParaDB).then(
                                    (aUebungsListe) => {
                                        if (aUebungsListe.length > 0) aSession.UebungsListe = aUebungsListe;
                                        else that.fDbModule.CmpAktuellesProgramm = that.fDbModule.AktuellesProgramm.Copy();
                                    });
                            });//for
                            this.fLoadingDialog.fDialog.closeAll();
                    } catch (error) {
                        this.fLoadingDialog.fDialog.closeAll();
                    }
                }//if
            });

                        
            // that.worker.onmessage = ({ data }) => {
            //     console.log(data);
            // };
            that.worker.postMessage('LadeAktuellesProgramm');
        }
    }
}