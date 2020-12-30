import { ISatz, Satz } from './../../Business/Satz/Satz';
import { GzclpProgramm } from 'src/Business/TrainingsProgramm/Gzclp';
import { ISession, Session } from './../../Business/Session/Session';
import { UebungService } from './../../app/services/uebung.service';
import { ITrainingsProgramm, TrainingsProgramm, ProgrammTyp, ProgrammKategorie  } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { AppData, IAppData } from './../../Business/Coach/Coach';
import { Dexie, PromiseExtended } from 'dexie';
import { CommonModule } from '@angular/common';
import { Injectable, NgModule, Pipe, Optional, SkipSelf } from '@angular/core';
import { UebungsTyp, Uebung, UebungsName } from "../../Business/Uebung/Uebung";


@Injectable({
    providedIn: "root",
})
@NgModule({
    declarations: [],
    imports: [CommonModule],
})
export class DBModule extends Dexie {
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
    ProgrammTable: Dexie.Table<TrainingsProgramm, number>;
    SessionTable: Dexie.Table<Session, number>;
    Programme: Array<TrainingsProgramm> = [];
    public UebungsDaten: Array<Uebung> = new Array<Uebung>();

    constructor(
        private fUebungService: UebungService,
        @Optional() @SkipSelf() parentModule?: DBModule
    ) {
        super("ConceptCoach");

        if (parentModule) {
            throw new Error(
                "DBModule is already loaded. Import it in the AppModule only"
            );
        }

    //    Dexie.delete("ConceptCoach");

        this.version(1).stores({
            AppData: "++id",
            Uebung: "++ID,Name,Typ",
            Programm: "++id,Name",
            Session: "++ID,Name,Datum",
            Satz: "++id",
        });

        this.InitAll();
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

    private NeueUebung(aName: string): Uebung {
        const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
        const mKategorieen01 = [].concat(mGzclpKategorieen01);
        return Uebung.StaticNeueUebung(aName, UebungsTyp.Kraft, mKategorieen01);
    }

    public InsertUebungen(aUebungsListe: Array<Uebung>): PromiseExtended {
        return this.UebungTable.bulkPut(aUebungsListe);
    }

    public async LadeStammUebungen() {
        this.UebungsDaten = [];
        const mAnlegen: Array<Uebung> = new Array<Uebung>();
        await this.table(this.cUebung)
            .toArray()
            .then((mUebungen) => {
                for (const mUeb in UebungsName) {
                    if (
                        mUebungen.find((mUebung) => mUebung.Name === mUeb) ===
                        undefined
                    ) {
                        const mNeueUebung = this.NeueUebung(mUeb);
                        mNeueUebung.SatzListe = [];
                        mAnlegen.push(mNeueUebung);
                    }
                }

                if (mAnlegen.length > 0) {
                    this.InsertUebungen(mAnlegen);
                    this.LadeStammUebungen();
                } else {
                    mUebungen.forEach((mUebung) =>
                        this.UebungsDaten.push(mUebung)
                    );
                }
            })
            .catch((error) => console.error(error));
    }

    private async InitProgramm() {
        this.ProgrammTable = this.table(this.cProgramm);
        this.ProgrammTable.mapToClass(TrainingsProgramm);
        //this.ProgrammTable.clear();
    }

    public LadeProgrammSessions(
        aProgramm: ITrainingsProgramm
    ): PromiseExtended {
        return this.table(this.cSession)
            .filter((s) => s.FK_Programm === aProgramm.id)
            .toArray()
            .then((mSessionListe) => {
                aProgramm.SessionListe = mSessionListe;
                mSessionListe.forEach((mSession) => {
                    this.LadeSessionUebungen(mSession).then((mUebungen) => {
                        mSession.UebungsListe = mUebungen;
                        mUebungen.forEach((mUebung) => {
                            this.LadeUebungsSaetze(mUebung).then(
                                (mSaetze) => (mUebung.SatzListe = mSaetze)
                            );
                        });
                    });
                });
            });
    }

    public LadeSessionUebungen(aSession: ISession): PromiseExtended {
        return this.table(this.cUebung)
            .filter((mUebung) => mUebung.SessionID === aSession.ID)
            .toArray();
    }

    public LadeUebungsSaetze(aUebung: Uebung): PromiseExtended {
        return this.table(this.cSatz)
            .filter(
                (mSatz) =>
                    mSatz.UebungID === aUebung.ID &&
                    mSatz.SessionID === aUebung.SessionID
            )
            .toArray();
    }

    public LadeProgramme() {
        this.Programme = [];
        const mAnlegen: Array<ProgrammTyp.Gzclp> = new Array<ProgrammTyp.Gzclp>();
        this.table(this.cProgramm)
            .filter(
                (a) =>
                    a.ProgrammKategorie === ProgrammKategorie.Vorlage.toString()
            )
            .toArray()
            .then((mProgramme) => {
                const mProg: TrainingsProgramm = mProgramme.find(
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

                for (let index = 0; index < this.Programme.length; index++) {
                    this.LadeProgrammSessions(
                        this.Programme[index]
                    ).catch((err) => console.error(err));
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    public SatzSpeichern(aSatz: ISatz) {
        return this.SatzTable.put(aSatz as Satz);
    }

    public SaetzeSpeichern(aSaetze: Array<ISatz>) {
        return this.SatzTable.bulkPut(aSaetze as Array<Satz>);
    }

    public UebungSpeichern(aUebung: Uebung) {
        const mUebung: Uebung = aUebung.Copy();
        mUebung.SatzListe = [];
        return this.transaction("rw", this.UebungTable, this.SatzTable, () => {
            this.UebungTable.put(mUebung).then((mUebungID) => {
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
        const mSession: Session = aSession.Copy();
        mSession.UebungsListe = [];
        return this.transaction(
            "rw",
            this.SessionTable,
            this.UebungTable,
            this.SatzTable,
            () => {
                this.SessionTable.put(mSession).then(
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

    public ProgrammSpeichern(aTrainingsProgramm: TrainingsProgramm) {
        return this.transaction(
            "rw",
            this.ProgrammTable,
            this.SessionTable,
            this.UebungTable,
            this.SatzTable,
            () => {
                // const mSessions = mTrainingsProgramm.SessionListe;
          //      mTrainingsProgramm.SessionListe = [];
                this.ProgrammTable.put(aTrainingsProgramm)
                    .then(
                    // Programm ist gespeichert.
                    // ProgrammID in die Sessions eintragen
                    (id) => {
                        aTrainingsProgramm.SessionListe.forEach((mEineSession) => {
                            mEineSession.FK_Programm = id;
                            this.SessionSpeichern(mEineSession);
                        });
                    }
                );
            });
    }

    public VorlageProgrammSpeichern(aProgrammTyp: ProgrammTyp) {
        let mTrainingsProgramm: TrainingsProgramm = null;

        if (aProgrammTyp === ProgrammTyp.Gzclp) {
            mTrainingsProgramm = this.ErzeugeGzclpVorlage();
        }

        if (!mTrainingsProgramm) return;

        this.ProgrammSpeichern(mTrainingsProgramm);
    }

    public ErzeugeGzclpVorlage(): TrainingsProgramm {
        const mGzclpVorlage: GzclpProgramm = new GzclpProgramm(
            this.fUebungService,
            ProgrammKategorie.Vorlage
        );
        mGzclpVorlage.Name = "GZCLP - Standard";
        const mSessions: Array<ISession> = new Array<ISession>();
        mGzclpVorlage.Init(mSessions);
        return mGzclpVorlage;
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
