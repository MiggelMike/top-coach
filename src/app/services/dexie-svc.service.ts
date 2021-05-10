import { ISatz, Satz } from './../../Business/Satz/Satz';
import { GzclpProgramm } from 'src/Business/TrainingsProgramm/Gzclp';
import { ISession, Session } from './../../Business/Session/Session';
import { ITrainingsProgramm, TrainingsProgramm, ProgrammTyp, ProgrammKategorie  } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { AppData, IAppData } from './../../Business/Coach/Coach';
import { Dexie, PromiseExtended } from 'dexie';
import { Injectable, NgModule, Pipe, Optional, SkipSelf } from '@angular/core';
import { UebungsTyp, Uebung, UebungsName, UebungsKategorie02 } from "../../Business/Uebung/Uebung";

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
    readonly cSession: string = "Session";

    AktuellerProgrammTyp: ProgrammTyp;
    AktuellesProgramm: ITrainingsProgramm;
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

    constructor(@Optional() @SkipSelf() parentModule?: DexieSvcService) {
        super("ConceptCoach");
        if (parentModule) {
            throw new Error(
                "DexieSvcService is already loaded. Import it in the AppModule only"
            );
        }

        //   Dexie.delete("ConceptCoach");

        this.version(1).stores({
            AppData: "++id",
            Uebung: "++ID,Name,Typ",
            Programm: "++id,Name",
            Session: "++ID,Name,Datum",
            Satz: "++ID",
        });

        this.InitAll();
        this.LadeStammUebungen();
    }

    private InitAll() {
        this.InitAppData();
        this.InitProgramm();
        this.InitUebung();
        this.InitSatz();
        this.InitSession();
    }

    private async InitSession() {
        this.SessionTable = this.table(this.cSession);
        this.SessionTable.mapToClass(Session);
    }

    private async InitUebung() {
        this.UebungTable = this.table(this.cUebung);
        this.UebungTable.mapToClass(Uebung);
    }

    private async InitSatz() {
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

    public LadeStammUebungen() {
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
                        mUebungen.find((mUebung) => mUebung.Name === mUeb) ===
                        undefined
                    ) {
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
                        this.LadeStammUebungen();
                    });
                } else {
                    mUebungen.forEach((mUebung) =>
                        this.UebungsDaten.push(mUebung)
                    );
                    this.LadeProgramme(ProgrammKategorie.Vorlage);
                }
            });
    }

    public SucheUebungPerName(aName: UebungsName): Uebung {
        const mUebung = this.UebungsDaten.find((u) => u.Name === aName);
        return mUebung === undefined ? null : mUebung;
    }

    private async InitProgramm() {
        this.ProgrammTable = this.table(this.cProgramm);
        this.ProgrammTable.mapToClass(TrainingsProgramm);
        //this.ProgrammTable.clear();
    }

    public async LadeProgrammSessions(aProgramm: ITrainingsProgramm) {
        return await this.table(this.cSession)
            .filter((s) => s.FK_Programm === aProgramm.id)
            .toArray();
        // .then((mSessionListe) => {
        //     aProgramm.SessionListe = mSessionListe;
        //     aProgramm.SessionListe.forEach((mSession) => {
        //         this.LadeSessionUebungen(mSession).then((mUebungen) => {
        //             mSession.UebungsListe = mUebungen;
        //             mUebungen.forEach((mUebung) => {
        //                 this.LadeUebungsSaetze(mUebung).then(
        //                     (mSaetze) => (mUebung.SatzListe = mSaetze)
        //                 );
        //             });
        //         });
        //     });
        // });
    }

    public LadeSessionUebungen(aSession: ISession): PromiseExtended {
        return this.table(this.cUebung)
            .filter((mUebung) => mUebung.SessionID === aSession.ID)
            .toArray();
    }

    public LadeUebungsSaetze(aUebung: Uebung): PromiseExtended<Satz[]> {
        return this.table(this.cSatz)
            .filter(
                (mSatz) =>
                    mSatz.UebungID === aUebung.ID &&
                    mSatz.SessionID === aUebung.SessionID
            )
            .toArray();
    }

    private DoVorlage(aProgramme: Array<TrainingsProgramm>) {
        const mAnlegen: Array<ProgrammTyp.Gzclp> = new Array<ProgrammTyp.Gzclp>();
        const mProg: ITrainingsProgramm = aProgramme.find(
            (p) => p.ProgrammTyp === ProgrammTyp.Gzclp
        );

        if (mProg === undefined) mAnlegen.push(ProgrammTyp.Gzclp);
        else {
            if (
                this.Programme.find(
                    (p) => p.ProgrammTyp === ProgrammTyp.Gzclp
                ) === undefined
            ) {
                // Standard-Programm gefunden
                this.Programme.push(mProg);
            }
        }

        for (let index = 0; index < mAnlegen.length; index++)
            this.VorlageProgrammSpeichern(mAnlegen[index]);
    }

    public async LadeProgramme(aProgrammKategorie: ProgrammKategorie) {
        this.Programme = [];
        await this.table(this.cProgramm)
            .filter(
                (a) => a.ProgrammKategorie === aProgrammKategorie.toString()
            )
            .toArray()
            .then((mProgramme) => {
                switch (aProgrammKategorie) {
                    case ProgrammKategorie.Vorlage:
                        this.DoVorlage(mProgramme);
                        for (
                            let index = 0;
                            index < this.Programme.length;
                            index++
                        ) {
                            // Programm
                            this.FuelleProgramm(this.Programme[index]);
                        }
                        break;
                    case ProgrammKategorie.AktuellesProgramm:
                        this.FuelleProgramm(mProgramme[0]);
                        this.AktuellesProgramm = mProgramme[0];
                        break;
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    private async FuelleProgramm(aProgramm: ITrainingsProgramm) {
        aProgramm.SessionListe = await this.LadeProgrammSessions(aProgramm);
        for (let j = 0; j < aProgramm.SessionListe.length; j++) {
            // Session
            const mSession = aProgramm.SessionListe[j];
            mSession.UebungsListe = await this.LadeSessionUebungen(mSession);
            for (let z = 0; z < mSession.UebungsListe.length; z++) {
                // Uebung
                const mUebung = mSession.UebungsListe[z];
                mUebung.SatzListe = await this.LadeUebungsSaetze(mUebung);
            }
        }
    }

    public SatzSpeichern(aSatz: ISatz) {
        return this.SatzTable.put(aSatz as Satz);
    }

    public SaetzeSpeichern(aSaetze: Array<ISatz>) {
        return this.SatzTable.bulkPut(aSaetze as Array<Satz>);
    }

    public UebungSpeichern(aUebung: Uebung) {
        return this.transaction("rw", this.UebungTable, this.SatzTable, () => {
            this.UebungTable.put(aUebung).then((mUebungID) => {
                // Uebung ist gespeichert.
                // UebungsID in Saetze eintragen.
                aUebung.SatzListe.forEach((mSatz) => {
                    mSatz.UebungID = mUebungID;
                    mSatz.SessionID = aUebung.SessionID;
                });
                this.SaetzeSpeichern(aUebung.SatzListe);
            });
        });
    }

    public SessionSpeichern(aSession: ISession) {
        return this.transaction(
            "rw",
            this.SessionTable,
            this.UebungTable,
            this.SatzTable,
            () => {
                this.SessionTable.put(aSession).then(
                    // Session ist gespeichert
                    // SessionID in Uebungen eintragen
                    (mSessionID) => {
                        aSession.UebungsListe.forEach((mUebung) => {
                            mUebung.SessionID = mSessionID;
                            this.UebungSpeichern(mUebung);
                        });
                    }
                );
            }
        );
    }

    public ProgrammSpeichern(aTrainingsProgramm: ITrainingsProgramm) {
        return this.transaction(
            "rw",
            this.ProgrammTable,
            this.SessionTable,
            this.UebungTable,
            this.SatzTable,
            () => {
                // const mSessions = mTrainingsProgramm.SessionListe;
                // aTrainingsProgramm.SessionListe = [];
                // const mOrgDbModule: DBModule = aTrainingsProgramm.pDbModule;
                // aTrainingsProgramm.pDbModule = null;
                this.ProgrammTable.put(aTrainingsProgramm)
                    .then(
                        // Programm ist gespeichert.
                        // ProgrammID in die Sessions eintragen
                        (id) => {
                            aTrainingsProgramm.SessionListe.forEach(
                                (mEineSession) => {
                                    mEineSession.FK_Programm = id;
                                    this.SessionSpeichern(mEineSession);
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

    public VorlageProgrammSpeichern(aProgrammTyp: ProgrammTyp) {
        let mTrainingsProgramm: ITrainingsProgramm = null;

        if (aProgrammTyp === ProgrammTyp.Gzclp) {
            mTrainingsProgramm = GzclpProgramm.ErzeugeGzclpVorlage(this);
        }

        if (!mTrainingsProgramm) return;

        this.ProgrammSpeichern(mTrainingsProgramm);
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