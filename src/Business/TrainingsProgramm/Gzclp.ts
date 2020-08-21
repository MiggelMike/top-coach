import { IUebung_Sess } from './../Uebung/Uebung_Sess';
import { IUebung } from "./../Uebung/Uebung";
import { UebungService } from "./../../app/services/uebung.service";
import {
    TrainingsProgramm,
    ITrainingsProgramm,
    SessionKategorie,
} from "./TrainingsProgramm";
import { ISession, Session } from "../Session/Session";

import {
    ISatz,
    Satz,
    SatzTyp,
    SatzStatus,
    SatzPausen,
    LiftTyp,
} from "../Satz/Satz";

import { UebungsName } from "../Uebung/Uebung";
import { deserialize } from "@peerlancers/json-serialization";
import { Uebung_Stamm } from "../Uebung/Uebung_Stamm";

export class GzclpProgramm extends TrainingsProgramm {
    constructor(
        private fUebungService: UebungService,
        aProgrammKategorie: SessionKategorie
    ) {
        super(aProgrammKategorie);
        this.Tage = 4;
    }

    protected PreCopy(): ITrainingsProgramm {
        return new GzclpProgramm(this.fUebungService, this.ProgrammKategorie);
    }

    public ErstelleSessionsAusVorlage(): ITrainingsProgramm {
        const mResult = this.Copy();
        mResult.ProgrammKategorie = SessionKategorie.Konkret;
        return mResult;
    }

    public DeserializeProgramm(aJsonData: Object): ITrainingsProgramm {
        const s = deserialize(GzclpProgramm, aJsonData);
        return s;
    }

    private ErzeugeAufwaermSaetze(
        aUebung: Uebung_Stamm,
        aLiftTyp: LiftTyp,
        aUebung_Sess: IUebung_Sess
    ) {
        // Aufwärm-Saetze anfügen
        // for (let i = 0; i < 3; i++) {
        //     switch (i) {
        //         case 0:
        //             aUebung_Sess.Saetze.push(
        //                 this.NeuerSatz(
        //                     SatzTyp.Aufwaermen,
        //                     aLiftTyp,
        //                     4,
        //                     40,
        //                     aUebung_Sess,
        //                     aUebung,
        //                     false
        //                 )
        //             );
        //             break;

        //         case 1:
        //             aUebung_Sess.Saetze.push(
        //                 this.NeuerSatz(
        //                     SatzTyp.Aufwaermen,
        //                     aLiftTyp,
        //                     3,
        //                     50,
        //                     aUebung_Sess,
        //                     aUebung,
        //                     false
        //                 )
        //             );
        //             break;

        //         default:
        //             aUebung_Sess.Saetze.push(
        //                 this.NeuerSatz(
        //                     SatzTyp.Aufwaermen,
        //                     aLiftTyp,
        //                     2,
        //                     60,
        //                     aUebung_Sess,
        //                     aUebung,
        //                     false
        //                 )
        //             );
        //     }
        // }
    }

    protected InitTag(aTagNr: number): Array<ISession> {
        const mSessions = new Array<ISession>();
        const mNeueSession = new Session({
            ID: 0,
            TagNr: aTagNr,
            Datum: null,
            DauerInSek: 0,
            FK_Programm: this.ID,
        } as Session);

        mSessions.push(mNeueSession);

        switch (aTagNr) {
            case 1:
                this.ErzeugeSessions(
                    UebungsName.Squat,
                    UebungsName.Benchpress,
                    UebungsName.Dips,
                    mNeueSession
                );
                break;

            case 2:
                this.ErzeugeSessions(
                    UebungsName.OverheadPress,
                    UebungsName.Deadlift,
                    UebungsName.ChinUps,
                    mNeueSession
                );
                break;

            case 3:
                this.ErzeugeSessions(
                    UebungsName.Benchpress,
                    UebungsName.Squat,
                    UebungsName.Dips,
                    mNeueSession
                );
                break;

            case 4:
                this.ErzeugeSessions(
                    UebungsName.Deadlift,
                    UebungsName.OverheadPress,
                    UebungsName.ChinUps,
                    mNeueSession
                );
                break;
        }
        return mSessions;
    }

    private ErzeugeSessions(
        aT1Uebung: UebungsName,
        aT2Uebung: UebungsName,
        aT3Uebung: UebungsName,
        aNeueSession: Session
    ): void {
        // T1-Lift
        let mUebung = this.fUebungService.Kopiere(
            this.fUebungService.SucheUebungPerName(aT1Uebung)
        );
        // this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.Custom, aNeueSession);

        let mUebung_Sess: IUebung_Sess = aNeueSession.NeueUebung(mUebung);
        // Arbeits-Saetze anfügen
        let mAnzSaetze = 5;
        for (let i = 0; i < mAnzSaetze; i++) {
            mUebung_Sess.SatzListe.push(
                this.NeuerSatz(
                    SatzTyp.Training,
                    LiftTyp.GzClpT1,
                    3,
                    100,
                    aNeueSession,
                    mUebung,
                    i == mAnzSaetze - 1 // Der letzte Satz ist AMRAP
                )
            );
        }
        aNeueSession.UebungsListe.push(mUebung_Sess);

        // T2-Lift
        mUebung = this.fUebungService.Kopiere(
            this.fUebungService.SucheUebungPerName(aT2Uebung)
        );

        // if (this.ProgrammKategorie === SessionKategorie.Konkret) {
        //     this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.GzClpT2, aNeueSession);
        // }
        mUebung_Sess = aNeueSession.NeueUebung(mUebung);
        // Arbeits-Saetze anfügen
        mAnzSaetze = 3;
        for (let i = 0; i < mAnzSaetze; i++) {
            mUebung_Sess.SatzListe.push(
                this.NeuerSatz(
                    SatzTyp.Training,
                    LiftTyp.GzClpT2,
                    10,
                    85,
                    aNeueSession,
                    mUebung,
                    false
                )
            );
        }
        aNeueSession.UebungsListe.push(mUebung_Sess);

        // T3-Lift
        mUebung = this.fUebungService.Kopiere(
            this.fUebungService.SucheUebungPerName(aT3Uebung)
        );

        mUebung_Sess = aNeueSession.NeueUebung(mUebung);
        // Arbeits-Saetze anfügen
        for (let i = 0; i < 3; i++) {
            mUebung_Sess.SatzListe.push(
                this.NeuerSatz(
                    SatzTyp.Training,
                    LiftTyp.GzClpT3,
                    15,
                    65,
                    aNeueSession,
                    mUebung,
                    i == mAnzSaetze - 1 // Der letzte Satz ist AMRAP
                )
            );
        }
        aNeueSession.UebungsListe.push(mUebung_Sess);
    }
}
