import { SessionDB, SessionStatus } from './../../Business/SessionDB';
import { Session, ISession } from 'src/Business/Session/Session';
import { ITrainingsProgramm, TrainingsProgramm, ProgrammTyp, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { DialogeService } from './dialoge.service';
import { ISatz, Satz } from './../../Business/Satz/Satz';
import { GzclpProgramm } from 'src/Business/TrainingsProgramm/Gzclp';
import { AppData, IAppData } from './../../Business/Coach/Coach';
import { Dexie, PromiseExtended } from 'dexie';
import { Injectable, NgModule, Pipe, Optional, SkipSelf } from '@angular/core';
import { UebungsTyp, Uebung, UebungsName, UebungsKategorie02 } from "../../Business/Uebung/Uebung";
import { DialogData } from '../dialoge/hinweis/hinweis.component';


export interface AktuellesProgramFn {
    (): void;
}

export interface LadeProgrammeFn {
    (aProgramme: Array<TrainingsProgramm>): void;
}

export interface AfterLoadFn {
    (aData?: any): void;
}

export interface NoRecordFn {
    (aData?: any): void;
}

export class LadePara {
    Data?: any;
    fProgrammTyp?: ProgrammTyp;
    fProgrammKategorie?: ProgrammKategorie; 
    OnProgrammAfterLoadFn?: AfterLoadFn; 
    OnProgrammNoRecordFn?: NoRecordFn; 
    OnSessionAfterLoadFn?: AfterLoadFn; 
    OnSessionNoRecordFn?: NoRecordFn; 
    OnUebungAfterLoadFn?: AfterLoadFn; 
    OnUebungNoRecordFn?: NoRecordFn; 
    OnSatzAfterLoadFn?: AfterLoadFn; 
    OnSatzNoRecordFn?: NoRecordFn; 
}    

@Injectable({
    providedIn: "root",
})
@NgModule({
    providers: [DexieSvcService],
})

    
export class DexieSvcService extends Dexie {
    readonly cUebung: string = "Uebung";
    readonly cSatz: string = "Satz";
    readonly cProgramm: string = "Programm";
    readonly cAppData: string = "AppData";
    readonly cSession: string = "SessionDB";

    AktuellerProgrammTyp: ProgrammTyp;
    AktuellesProgramm: ITrainingsProgramm; 
    VorlageProgramme: Array<TrainingsProgramm> = []; 
    AppRec: IAppData;
    AppDataTable: Dexie.Table<AppData, number>;
    UebungTable: Dexie.Table<Uebung, number>;
    SatzTable: Dexie.Table<Satz, number>;
    ProgrammTable: Dexie.Table<ITrainingsProgramm, number>;
    SessionTable: Dexie.Table<Session, number>;
    public Programme: Array<ITrainingsProgramm> = [];
    public UebungsDaten: Array<Uebung> = [];

    //public ProgrammListeObserver: Observable<TrainingsProgramm[]>;
    //public ProgrammListe: Array<TrainingsProgramm> = [];

    constructor(
        private fDialogeService: DialogeService,
        @Optional() @SkipSelf() parentModule?: DexieSvcService) {
        super("ConceptCoach");
        if (parentModule) {
            throw new Error(
                "DexieSvcService is already loaded. Import it in the AppModule only"
            );
        }

        //    Dexie.delete("ConceptCoach");
        
        this.version(1).stores({
            AppData: "++id",
            Uebung: "++ID,Name,Typ",
            Programm: "++id,Name",
            SessionDB: "++ID,Name,Datum",
            Satz: "++ID",
        });

        this.InitAll();
        this.LadeStandards();
    }

    private InitAll() {
        this.InitAppData();
        this.InitProgramm();
        this.InitSession();
        this.InitUebung();
        this.InitSatz();
    }

    private InitSession() {
        this.SessionTable = this.table(this.cSession);
        this.SessionTable.mapToClass(Session);
    }

    private InitUebung() {
        this.UebungTable = this.table(this.cUebung);
        this.UebungTable.mapToClass(Uebung);
    }

    private InitSatz() {
        this.SatzTable = this.table(this.cSatz);
        this.SatzTable.mapToClass(Satz);
    }

    private NeueUebung(
        aName: string,
        aKategorie02: UebungsKategorie02
    ): Uebung {
        const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
        const mKategorieen01 = [].concat(mGzclpKategorieen01);
        return Uebung.StaticNeueUebung(
            aName,
            UebungsTyp.Kraft,
            mKategorieen01,
            aKategorie02
        );
    }

    public InsertUebungen(aUebungsListe: Array<Uebung>): PromiseExtended {
        return this.UebungTable.bulkPut(aUebungsListe);
    }

    public LadeStandards() {
        this.UebungsDaten = [];
        const mAnlegen: Array<Uebung> = new Array<Uebung>();
        this.table(this.cUebung)
            .filter(
                (mUebung) => mUebung.Kategorie02 === UebungsKategorie02.Stamm
            )
            .toArray()
            .then((mUebungen) => {
                for (const mUeb in UebungsName) {
                    if (
                        mUebungen.find((mUebung) => mUebung.Name === mUeb) === undefined) {
                        const mNeueUebung = this.NeueUebung(
                            mUeb,
                            UebungsKategorie02.Stamm
                        );
                        mNeueUebung.SatzListe = [];
                        mAnlegen.push(mNeueUebung);
                    }
                }

                if (mAnlegen.length > 0) {
                    this.InsertUebungen(mAnlegen).then(() => {
                        this.LadeStandards();
                    });
                } else {
                    this.UebungsDaten = mUebungen;
                    // Standard-Uebungen sind vorhanden.
                    // Jetzt Standard-Vorlage-Programme laden
                    this.LadeProgramme(
                        {
                            fProgrammKategorie: ProgrammKategorie.Vorlage,
                            
                            OnProgrammAfterLoadFn: (p: TrainingsProgramm) => {
                                this.VorlageProgramme.push(p);
                            }, //OnProgrammAfterLoadFn

                            OnProgrammNoRecordFn: (aPara) => {
                                const mProgramme: Array<TrainingsProgramm> = (aPara.Data as Array<TrainingsProgramm>);
                                const mAnlegen: Array<ProgrammTyp.Gzclp> = new Array<ProgrammTyp.Gzclp>();
                                const mProg: TrainingsProgramm = (mProgramme.find(
                                    (p) => p.ProgrammTyp === ProgrammTyp.Gzclp
                                ));
                        
                                if (mProg === undefined)
                                    mAnlegen.push(ProgrammTyp.Gzclp);
                                else {
                                    if (mProgramme.find((p) => p.ProgrammTyp === ProgrammTyp.Gzclp) === undefined) {
                                        // Standard-Programm gefunden
                                        mProgramme.push(mProg);
                                    }
                                }
                        
                                for (let index = 0; index < mAnlegen.length; index++)
                                    this.ErzeugeVorlageProgramm(mAnlegen[index], this);
                            } //OnProgrammNoRecorderLoadFn
                        } as LadePara);
                }
            });
    }

    public getBodyWeight(): number{
        return 105;
    }

    public SucheUebungPerName(aName: UebungsName): Uebung {
        const mUebung = this.UebungsDaten.find((u) => u.Name === aName);
        return mUebung === undefined ? null : mUebung;
    }

    private InitProgramm() {
        this.ProgrammTable = this.table(this.cProgramm);
        this.ProgrammTable.mapToClass(TrainingsProgramm);
        //this.ProgrammTable.clear();
    }

    public LadeProgrammSessions(aProgramm: TrainingsProgramm, aLadePara?: LadePara): void {
        this.table(this.cSession)
            .filter((s) => s.FK_Programm === aProgramm.id)
            .toArray()
            .then(
                (aSessions: Array<Session>) => {
                    if (aSessions.length > 0) {
                        aProgramm.SessionListe = aSessions;
                        aProgramm.SessionListe.forEach((s) => (this.LadeSessionUebungen(s, aLadePara)));
                        if ((aLadePara !== undefined) && (aLadePara.OnSessionAfterLoadFn !== undefined))
                            aLadePara.OnSessionAfterLoadFn(aLadePara);
                    }
                    else if ((aLadePara !== undefined) && (aLadePara.OnSessionNoRecordFn !== undefined))
                        aLadePara.OnSessionNoRecordFn(aLadePara);
                });
    }

    public LadeSessionUebungen(aSession: ISession, aLadePara?: LadePara): void {
        this.table(this.cUebung)
            .filter((mUebung) => mUebung.SessionID === aSession.ID)
            .toArray()
            .then(
                (aUebungen: Array<Uebung>) => {
                    if (aUebungen.length > 0) {
                        aSession.UebungsListe = aUebungen;
                        aSession.UebungsListe.forEach((u) => {
                            this.LadeUebungsSaetze(u, aLadePara);
                            if ((aLadePara !== undefined) && (aLadePara.OnUebungAfterLoadFn !== null))
                                aLadePara.OnUebungAfterLoadFn(aLadePara);
                        });
                    } else if ((aLadePara !== undefined) && (aLadePara.OnUebungNoRecordFn !== null))
                        aLadePara.OnUebungNoRecordFn(aLadePara);
                }
            )
    }

    public LadeUebungsSaetze(aUebung: Uebung, aLadePara?: LadePara) {
        this.table(this.cSatz)
            .filter(
                (mSatz) =>
                    mSatz.UebungID === aUebung.ID &&
                    mSatz.SessionID === aUebung.SessionID
            )
            .toArray()
            .then(
                (aSaetze: Array<Satz>) => {
                    if (aSaetze.length > 0) {
                        aUebung.SatzListe = aSaetze;
                        aUebung.SatzListe.forEach((s) => {
                            if ((aLadePara !== undefined) && (aLadePara.OnSatzAfterLoadFn !== null))
                                aLadePara.OnSatzAfterLoadFn(aLadePara);
                        
                        })
                    } else if ((aLadePara !== undefined) && (aLadePara.OnSatzNoRecordFn !== null))
                        aLadePara.OnSatzNoRecordFn(aLadePara);
                }
            )
    }


    private DoAktuellesProgramm(aNeuesAktuellesProgramm: ITrainingsProgramm, aAltesAktuellesProgramm?: ITrainingsProgramm): void {
        if (aAltesAktuellesProgramm) {
            aAltesAktuellesProgramm.ProgrammKategorie = ProgrammKategorie.Fertig;
            this.ProgrammSpeichern(aAltesAktuellesProgramm, this);
        }
        const mNeu = aNeuesAktuellesProgramm.ErstelleSessionsAusVorlage(ProgrammKategorie.AktuellesProgramm);
        this.ProgrammSpeichern(mNeu, this);
        this.AktuellesProgramm = mNeu;
    }

    public CheckAktuellesProgram(aNeuesAktuellesProgramm: ITrainingsProgramm, aAltesAktuellesProgramm?: ITrainingsProgramm ):void {
        // Soll das aktuelle Programm durch ein anderes ersetzt werden?
        if (aAltesAktuellesProgramm !== undefined) {
            const mDialogData = new DialogData();
            mDialogData.OkData = aNeuesAktuellesProgramm;
            mDialogData.OkFn = (): void => {
                // Es gibt ein aktuelles Programm, aber der Anwender will es ersetzen. 
                this.DoAktuellesProgramm(aNeuesAktuellesProgramm, aAltesAktuellesProgramm);
            };

            // Sind altes und neues Programm gleich?
            if (aNeuesAktuellesProgramm.Name === aAltesAktuellesProgramm.Name) {
                // Altes und neues Programm sind gleich
                mDialogData.textZeilen.push(`This program is already active!`);
                mDialogData.textZeilen.push(`Select it anyway?`);
            } else {
                // Das aktuelle Work-Out soll durch ein anderes ersetzt werden.
                mDialogData.textZeilen.push(
                    `Replace current Program "${aAltesAktuellesProgramm.Name}" with "${aNeuesAktuellesProgramm.Name}" ?`
                );
            }
    
            this.fDialogeService.JaNein(mDialogData);
        } else {
            // Es gibt kein aktuelles Work-Out.
            this.DoAktuellesProgramm(aNeuesAktuellesProgramm);
        }
    }

    public FindVorlageProgramm(aProgramme: Array<TrainingsProgramm>, aProgrammTyp: ProgrammTyp): Boolean{
        return aProgramme.find((p) => {
            if (p.ProgrammTyp === aProgrammTyp)
                return p;
            return null;
        }) != null;
    }

//    public LadeAktuellesProgramm(aProgramme: Array<TrainingsProgramm>, aNeuesAktuellesProgram?: ITrainingsProgramm): TrainingsProgramm {
    //     // Gibt es schon ein aktuelles Programm?
    //     if (aProgramme.length > 0) {
    //         this.FuelleProgramm(aProgramme[0]);
    //         // Es gibt schon ein aktuelles Programm.
    //         // Soll ein anderes aktuelles Programm gewaehlt werden?
    //         if (aNeuesAktuellesProgram !== undefined)
    //             // Es soll ein anderes aktuelles Programm gewaehlt werden.
    //             this.CheckAktuellesProgram(aNeuesAktuellesProgram, aProgramme[0]);
    //         else
    //              // Es soll kein anderes aktuelles Programm gewaehlt werden.
    //             return aProgramme[0];
    //     } else {
    //         // Es gibt kein aktuelles Programm.
    //         // Soll ein aktuelles Programm gewaehlt werden?
    //         if (aNeuesAktuellesProgram !== undefined)
    //              // Es soll ein aktuelles Programm gewaehlt werden
    //              this.CheckAktuellesProgram(aNeuesAktuellesProgram);
    //     }
    //     return null;
    // }

    public LadeAktuellesProgramm(aAktuellesProgramm: ITrainingsProgramm): void { 
            // this.LadeProgramme(ProgrammKategorie.AktuellesProgramm,
            //     (mProgramm) => {
            //         if ((mProgramm !== undefined) && (mProgramm !== null)) {
            //             let mNeueSessions: Array<SessionDB> = [];
            //             let mUnDoneSessions: Array<SessionDB> = [];
            //             let mDoneSessions: Array<SessionDB> = [];
            //             // Das gefundene aktuelle Programm kopieren.
            //             this.AktuellesProgramm = mProgramm.Copy();

            //             // Die fertigen und nicht fertigen Sessions merken
            //             for (let i = 0; i < mProgramm.SessionListe.length; i++) {
            //                 if ((mProgramm.SessionListe[i].Kategorie02 === SessionStatus.Fertig)
            //                     || (mProgramm.SessionListe[i].Kategorie02 === SessionStatus.FertigTimeOut))
            //                     // fertige Session
            //                     mDoneSessions.push(mProgramm.SessionListe[i]);
            //                 else 
            //                     // Nicht fertige Session
            //                     mUnDoneSessions.push(mProgramm.SessionListe[i]);
            //             }      

                        // Sind alle Sessions des aktuellen Programms erledigt?  
                        // if (mDoneSessions.length === this.fDbModule.AktuellesProgramm.SessionListe.length) {
                        //     // Alle Sessions des aktuellen Programms sind erledigt  
                        //     if (this.fDbModule.AktuellesProgramm.SessionListe.length < this.fDbModule.AktuellesProgramm.Tage * 2) {
                        //         for (let i = 0; i < this.fDbModule.AktuellesProgramm.SessionListe.length; i++) {
                        //             this.fDbModule.AktuellesProgramm.SessionListe[i].init();
                        //         }
                        //     }
                        // }
                            
                        // this.fDbModule.AktuellesProgramm.SessionListe = [];
                        // for (let i = 0; i < mUnDoneSessions.length; i++)
                        //     this.fDbModule.AktuellesProgramm.SessionListe.push(mUnDoneSessions[i] as ISession);

                        // if (this.fDbModule.AktuellesProgramm.SessionListe.length <  this.fDbModule.AktuellesProgramm.Tage * 2) {
                        //     for (let i = 0; i < this.fDbModule.AktuellesProgramm.SessionListe.length; i++) {
                        //         let mSessionDB: SessionDB = null;
                        //         // if ((this.fDbModule.AktuellesProgramm.SessionListe[j].Kategorie02 === SessionStatus.Fertig)
                        //         //     || (this.fDbModule.AktuellesProgramm.SessionListe[j].Kategorie02 === SessionStatus.FertigTimeOut)) {
                        //         mSessionDB = this.fDbModule.AktuellesProgramm.SessionListe[i].Copy();
                        //         mSessionDB.Kategorie02 = SessionStatus.Wartet;
                        //         mNeueSessions.push(mSessionDB);
                        //     }
                        
                        
                        //     for (let i = 0; i < mNeueSessions.length; i++) {
                        //         this.fDbModule.AktuellesProgramm.SessionListe.push(mNeueSessions[i] as ISession);
                            
                        //     }
                        // }
                    
                    // }
                // });
    }


    public LadeProgramme(aLadePara: LadePara ): void {
        this.table(this.cProgramm)
            .filter(
                (a) => a.ProgrammKategorie === aLadePara.fProgrammKategorie.toString()
            )
            .toArray()
            .then(
                (aProgramme: Array<TrainingsProgramm>) => {
                    if (aProgramme.length > 0) {
                        aProgramme.forEach((p: TrainingsProgramm) => {
                            if (p.Zyklen === undefined)
                                p.Zyklen = 1;
                        
                            this.LadeProgrammSessions(p, aLadePara);

                            if ((aLadePara !== undefined) && (aLadePara.OnProgrammAfterLoadFn)) {
                                aLadePara.OnProgrammAfterLoadFn(p);
                            }
                        });
                    } else if ((aLadePara !== undefined) && (aLadePara.OnProgrammNoRecordFn)) {
                        aLadePara.Data = aProgramme;
                        aLadePara.OnProgrammNoRecordFn(aLadePara);
                    }
                }
            )
            .catch((error) => {
                console.error(error);
            });
    }

    // private FuelleProgramm(aProgramm: ITrainingsProgramm, aCylcleCount: number = 1): void {
    //     const mDoneSessionListe = new Array<Session>();
    //     for (let index = 0; index < aCylcleCount; index++) {
    //         this.LadeProgrammSessions(aProgramm, (mSessions: Array<ISession>) => {
    //             if (mSessions === undefined)
    //                 return;
                    
    //             if (aProgramm.SessionListe === undefined)
    //                 aProgramm.SessionListe = new Array<Session>();
            
    //             mSessions.forEach((s: Session) => {
    //                 if (aProgramm.SessionListe !== undefined) {
    //                     const mCopiedSession = s.Copy();
    //                     aProgramm.SessionListe.push(mCopiedSession as Session);
    //                     // Fertige Session in Extra-Liste kopieren
    //                     if ((s.Kategorie02 === SessionStatus.Fertig)
    //                         || (s.Kategorie02 === SessionStatus.FertigTimeOut))
    //                         mDoneSessionListe.push(mCopiedSession as Session);
                    
    //                 }
    //             });
            
    //             mDoneSessionListe.forEach(
    //                 (mDoneSession: Session) => {
    //                     const mFindSession: ISession = aProgramm.SessionListe.find((s, mIndex) => {
    //                         if (s.ID === mDoneSession.ID)
    //                             return s;
    //                         return null;
    //                     })

    //                     if (mFindSession !== null) {
                        
    //                     }
    //                 }
    //             );
        
                    
    //             for (let j = 0; j < aProgramm.SessionListe.length; j++) {
    //                 // Session
    //                 const mSession: ISession = aProgramm.SessionListe[j];

    //                 if (mSession.Kategorie02 === undefined)
    //                     mSession.Kategorie02 = SessionStatus.Wartet;
            
    //                 if (mSession.BodyWeightAtSessionStart === undefined)
    //                     mSession.BodyWeightAtSessionStart = 0;
            
    //                 this.LadeSessionUebungen(mSession)
    //                     .then(
    //                         u => mSession.UebungsListe = u
    //                     );
                        
    //                 for (let z = 0; z < mSession.UebungsListe.length; z++) {
    //                     // Uebung
    //                     const mUebung = mSession.UebungsListe[z];
                
    //                     if (mUebung.WarmUpVisible === undefined)
    //                         mUebung.WarmUpVisible = true;

    //                     if (mUebung.CooldownVisible === undefined)
    //                         mUebung.CooldownVisible = true;

    //                     if (mUebung.IncludeWarmupWeight === undefined)
    //                         mUebung.IncludeWarmupWeight = false;

    //                     if (mUebung.IncludeCoolDownWeight === undefined)
    //                         mUebung.IncludeCoolDownWeight = false;
                
    //                     if (mUebung.Expanded === undefined)
    //                         mUebung.Expanded = false;
                
    //                     this.LadeUebungsSaetze(mUebung)
    //                         .then(
    //                             (s) => mUebung.SatzListe = s
    //                         );

    //                     mUebung.SatzListe.forEach(mSatz => {
    //                         if (mSatz.IncludeBodyweight === undefined)
    //                             mSatz.IncludeBodyweight = false;
                    
    //                         if (mSatz.BodyWeight === undefined)
    //                             mSatz.BodyWeight = 0;
    //                     })
    //                 }

    //             }
    //         });
    //     }
    // }

    public SatzSpeichern(aSatz: ISatz, aDbModul: DexieSvcService) {
        return aDbModul.SatzTable.put(aSatz as Satz);
    }

    public SaetzeSpeichern(aSaetze: Array<ISatz>, aDbModul: DexieSvcService) {
        return aDbModul.SatzTable.bulkPut(aSaetze as Array<Satz>);
    }

    public UebungSpeichern(aUebung: Uebung, aDbModul: DexieSvcService) {
        return aDbModul.transaction("rw", aDbModul.UebungTable, this.SatzTable, () => {
            aDbModul.UebungTable.put(aUebung).then((mUebungID) => {
                // Uebung ist gespeichert.
                // UebungsID in Saetze eintragen.
                aUebung.SatzListe.forEach((mSatz) => {
                    mSatz.UebungID = mUebungID;
                    mSatz.SessionID = aUebung.SessionID;
                });
                aDbModul.SaetzeSpeichern(aUebung.SatzListe, aDbModul);
            });
        });
    }

    public SessionSpeichern(aSession: Session, aDbModul: DexieSvcService) {
        return aDbModul.transaction(
            "rw",
            aDbModul.SessionTable,
            aDbModul.UebungTable,
            aDbModul.SatzTable,
            () => {
                aDbModul.SessionTable.put(aSession).then(
                    // Session ist gespeichert
                    // SessionID in Uebungen eintragen
                    (mSessionID) => {
                        aSession.UebungsListe.forEach((mUebung) => {
                            mUebung.SessionID = mSessionID;
                            aDbModul.UebungSpeichern(mUebung, aDbModul);
                        });
                    }
                )
            }
        ).catch(r => (
            console.log(r)
        ));
    }
    

    public ProgrammSpeichern(aTrainingsProgramm: ITrainingsProgramm, aDbModul: DexieSvcService ) {
        return aDbModul.transaction(
            "rw",
            aDbModul.ProgrammTable,
            aDbModul.SessionTable,
            aDbModul.UebungTable,
            aDbModul.SatzTable,
            () => {
                // const mSessions = mTrainingsProgramm.SessionListe;
                // aTrainingsProgramm.SessionListe = [];
                // const mOrgDbModule: DBModule = aTrainingsProgramm.pDbModule;
                // aTrainingsProgramm.pDbModule = null;
                aDbModul.ProgrammTable.put(aTrainingsProgramm)
                    .then(
                        // Programm ist gespeichert.
                        // ProgrammID in die Sessions eintragen
                        (id) => {
                            aTrainingsProgramm.SessionListe.forEach(
                                (mEineSession) => {
                                    mEineSession.FK_Programm = id;
                                    aDbModul.SessionSpeichern(mEineSession as Session, aDbModul);
                                }
                            );
                        }
                    )
                    .catch((err) => {
                        console.error(err);
                    });
            }
        );
    }

    public ErzeugeVorlageProgramm(aProgrammTyp: ProgrammTyp, aDbModul: DexieSvcService): ITrainingsProgramm {
        let mTrainingsProgramm: ITrainingsProgramm = null;

        if (aProgrammTyp === ProgrammTyp.Gzclp) {
            mTrainingsProgramm = GzclpProgramm.ErzeugeGzclpVorlage(aDbModul);
        }

        if (!mTrainingsProgramm) return;

        aDbModul.ProgrammSpeichern(mTrainingsProgramm, aDbModul);
        return mTrainingsProgramm;
    }

    private async InitAppData() {
        this.AppDataTable = this.table(this.cAppData);
        this.AppDataTable.mapToClass(AppData);
        await this.AppDataTable.limit(1).first(
            (aAppRec) => (this.AppRec = aAppRec)
        );

        if (!this.AppRec) {
            this.AppRec = new AppData();
            await this.AppDataTable.put(this.AppRec).catch((error) => {
                console.error(error);
            });
        }
    }
}