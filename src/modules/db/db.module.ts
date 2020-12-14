import { ISatz, Satz } from './../../Business/Satz/Satz';
import { GzclpProgramm } from 'src/Business/TrainingsProgramm/Gzclp';
import { ISession, Session } from './../../Business/Session/Session';
import { UebungService } from './../../app/services/uebung.service';
import { ITrainingsProgramm, TrainingsProgramm, ProgrammTyp, ProgrammKategorie  } from './../../Business/TrainingsProgramm/TrainingsProgramm';
import { AppData, IAppData } from './../../Business/Coach/Coach';
import { Dexie, PromiseExtended } from 'dexie';
import { CommonModule } from '@angular/common';
import { Injectable, NgModule, Pipe, Optional, SkipSelf } from '@angular/core';
import { UebungsTyp, Uebung, UebungsName, IUebung } from "../../Business/Uebung/Uebung";


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
    public UebungsDaten: Array<Uebung> = new Array<Uebung>();
    public StandardProgramme: Array<TrainingsProgramm> = new Array<TrainingsProgramm>();

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

        // Dexie.delete("ConceptCoach");

        this.version(1).stores({
            AppData: "++id",
            Uebung: "++ID,Name,Typ",
            Programm: "++ID,Name",
            Session: "++ID,Name,Datum",
            Satz: "++id",
        });

        this.InitAll();
    }

    private async InitAll() {
        await this.InitAppData();
        await this.InitProgramm();
        await this.InitUebung();
        await this.InitSatz();
        await this.InitSession();
        await this.LadeStammUebungen();
        await this.LadeStandardProgramme();
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

    private NeueStammUebung(aName: string): Uebung {
        const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
        const mKategorieen01 = [].concat(mGzclpKategorieen01);
        return Uebung.StaticNeueStammUebung(
            aName,
            UebungsTyp.Kraft,
            mKategorieen01
        );
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
                        const mNeueUebung = this.NeueStammUebung(mUeb);
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
        // this.ProgrammTable.clear();
    }

    public LadeProgrammSessions(aProgramm: ITrainingsProgramm): PromiseExtended {
        return this.table(this.cSession)
            .filter((s) => s.FK_Programm === aProgramm.ID)
            .toArray();
    }

    public async LadeStandardProgramme() {
        this.StandardProgramme = [];
        const mAnlegen: Array<ProgrammTyp.Gzclp> = new Array<ProgrammTyp.Gzclp>();
        await this.table(this.cProgramm)
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
                        this.StandardProgramme.find(
                            (p) => p.ProgrammTyp === ProgrammTyp.Gzclp
                        ) === undefined
                    ) {
                        // Standard-Programm gefunden
                        this.StandardProgramme.push(mProg);
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            });

        for (let index = 0; index < mAnlegen.length; index++) 
            this.VorlageProgrammSpeichern(mAnlegen[index]);

        for (let index = 0; index < this.StandardProgramme.length; index++) {
            await this.LadeProgrammSessions(this.StandardProgramme[index])
                .then((mSessions) => {
                    this.StandardProgramme[index].SessionListe = mSessions;
                })
                .catch((err) => console.error(err));
        }
    }

    public async SatzSpeichern(aSatz: ISatz) {
        return await this.SatzTable.put(aSatz as Satz);
    }

    public async SaetzeSpeichern(aSaetze: Array<ISatz>) {
        return await this.SatzTable.bulkPut(aSaetze as Array<Satz>);
    }

    public async UebungSpeichern(aUebung: IUebung) {
        const mUebung: IUebung = aUebung.Copy();
        mUebung.SatzListe = [];
        return this.transaction("rw", this.UebungTable, this.SatzTable, () => {
            this.UebungTable.put(aUebung as Uebung).then((mUebungID) => {
                // Uebung ist gespeichert.
                // UebungsID in Saetze eintragen.
                aUebung.SatzListe.forEach((mSatz) => {
                    mSatz.UebungID = mUebungID;
                });
                this.SaetzeSpeichern(aUebung.SatzListe);
            });
        });
    }

    public async SessionSpeichern(aSession: ISession) {
        const mSession: ISession = aSession.Copy();
        mSession.UebungsListe = [];
        return this.transaction(
            "rw",
            this.SessionTable,
            this.UebungTable,
            this.SatzTable,
            () => {
                this.SessionTable.put(mSession as Session).then(
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
        this.transaction(
            "rw",
            this.ProgrammTable,
            this.SessionTable,
            this.UebungTable,
            this.SatzTable,
            () => {
                const mSessions = aTrainingsProgramm.SessionListe;
                aTrainingsProgramm.SessionListe = [];
                this.ProgrammTable.put(aTrainingsProgramm as TrainingsProgramm)
                    .then(
                        // Programm ist gespeichert.
                        // ProgrammID in die Sessions eintragen
                        (mProgramID) => {
                            mSessions.forEach((mEineSession) => {
                                mEineSession.FK_Programm = mProgramID;
                                this.SessionSpeichern(mEineSession);
                            });
                        }
                    );
            }
        ).catch(
            (err) => console.error(err)
        )
    }

    public VorlageProgrammSpeichern(aProgrammTyp: ProgrammTyp) {
        let mTrainingsProgramm: ITrainingsProgramm = null;

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
