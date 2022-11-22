import { SessionDB, SessionStatus } from './../../Business/SessionDB';
import { DexieSvcService, SessionParaDB, UebungParaDB } from './../services/dexie-svc.service';
import {  ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../Business/Session/Session';
import { DialogeService } from '../services/dialoge.service';
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { AppData } from 'src/Business/Coach/Coach';



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
        ) {}
        
    public get Programm(): ITrainingsProgramm {
        return this.fProgramm;
    }

    private async LadeSessions(aOffSet: number = 0): Promise<void> {
        const mSessionParaDB: SessionParaDB = new SessionParaDB();
        // mSessionParaDB.Limit = 1;
        // mSessionParaDB.OffSet = aOffSet;
        this.fDbModule.LadeUpcomingSessions(this.Programm.id, mSessionParaDB)
            .then((aSessionListe) => {
                if (aSessionListe.length > 0) {
                    aSessionListe.forEach((mPtrSession) => {
                        // if (mPtrSession.Kategorie02 !== SessionStatus.Wartet) {                            
                            // const mUebungParaDB = new UebungParaDB();
                          //  mUebungParaDB.SaetzeBeachten = true;
                            // this.fDbModule.LadeSessionUebungen(mPtrSession.ID, mUebungParaDB).then(
                            //     (aUebungsListe) => {
                            //         if (aUebungsListe.length > 0)
                            //             mPtrSession.UebungsListe = aUebungsListe;
                            //     });
                        // }
                        
                        SessionDB.StaticCheckMembers(mPtrSession);
                        mPtrSession.PruefeGewichtsEinheit(this.fDbModule.AppRec.GewichtsEinheit);
                        this.fDbModule.AktuellesProgramm.SessionListe.push(mPtrSession);
                        // this.LadeSessions(this.fProgramm.SessionListe.length);
                    
                    });
                    this.fProgramm.SessionListe = aSessionListe;
                }
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
                    that.fDbModule.LadeAktuellesProgramm()
                        .then(async (aProgramm) => {
                            if (aProgramm !== undefined) {
                                const mDialogData = new DialogData();
                                mDialogData.ShowAbbruch = false;
                                mDialogData.ShowOk = false;
                                mDialogData.hasBackDrop = false;
                                that.fDbModule.AktuellesProgramm.SessionListe = [];
                                this.fProgramm = that.fDbModule.AktuellesProgramm.Copy();
                                that.LadeSessions();
                            }
                        });
                } // if
                else if (data.action === "LadeUebungen") {
                        // that.Programm.SessionListe = that.fDbModule.AktuellesProgramm.SessionListe;
                        const mUebungParaDB: UebungParaDB = new UebungParaDB();
                        // mUebungParaDB.SaetzeBeachten = true;
                        this.fProgramm.SessionListe.forEach(
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
                        that.fDbModule.AktuellesProgramm.SessionListe = this.fProgramm.SessionListe;
                }//if
            });

                        
            // that.worker.onmessage = ({ data }) => {
            //     console.log(data);
            // };
            that.worker.postMessage('LadeAktuellesProgramm');
        }
    }
}