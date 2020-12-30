import { IUebung, Uebung } from "./../Uebung/Uebung";
import { UebungService } from "./../../app/services/uebung.service";
import { TrainingsProgramm, ITrainingsProgramm } from "./TrainingsProgramm";
import { ProgrammKategorie, ProgrammTyp } from "./TrainingsProgramm";

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

export class GzclpProgramm extends TrainingsProgramm {
    constructor(
        private fUebungService: UebungService,
        aProgrammKategorie: ProgrammKategorie
    ) {
        super(ProgrammTyp.Gzclp, aProgrammKategorie);
        this.Tage = 4;
    }

    protected PreCopy(): ITrainingsProgramm {
        return new GzclpProgramm(this.fUebungService, this.ProgrammKategorie);
    }

    public ErstelleSessionsAusVorlage(): ITrainingsProgramm {
        const mResult = this.Copy();
        mResult.ProgrammKategorie = ProgrammKategorie.Konkret;
        return mResult;
    }

    public DeserializeProgramm(aJsonData: Object): ITrainingsProgramm {
        const s = deserialize(GzclpProgramm, aJsonData);
        return s;
    }

    private ErzeugeAufwaermSaetze(
        aUebung: Uebung,
        aLiftTyp: LiftTyp,
        aUebung_Sess: Uebung
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

    protected InitTag(aSessionNr: number): Array<ISession> {
        const mSessions = new Array<ISession>();
        const mNeueSession = new Session();
        mNeueSession.Name = `Day #${aSessionNr}  --- `;
        // `0${month}
        switch (aSessionNr-1 % 4) {
            case 0:
                mNeueSession.Name += "Squat";
                break;

            case 1:
                mNeueSession.Name += "Overhead press";
                break;

            case 2:
                mNeueSession.Name += "Bench press";
                break;

            case 3:
                mNeueSession.Name += "Deadlift";
                break;
            default:
                break;
        }
        
        mNeueSession.SessionNr = aSessionNr;
        mNeueSession.Datum = null;

        mSessions.push(mNeueSession);

        switch (aSessionNr) {
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
        let mUebung: Uebung = this.fUebungService.Kopiere(
            this.fUebungService.SucheUebungPerName(aT1Uebung)
        );
        // this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.Custom, aNeueSession);

        // Arbeits-Saetze anfügen
        let mAnzSaetze = 5;
        for (let i = 0; i < mAnzSaetze; i++) {
            mUebung.SatzListe.push(
                Satz.NeuerSatz(
                    SatzTyp.Training,
                    LiftTyp.GzClpT3,
                    3, // Wdh-Vorgabe
                    100, // Prozent
                    0, // SessionID
                    0, // UebungID
                    i == mAnzSaetze - 1 // Der letzte Satz ist AMRAP
                )
            );
        }
        aNeueSession.UebungsListe.push(mUebung);

        // T2-Lift
        mUebung = this.fUebungService.Kopiere(
            this.fUebungService.SucheUebungPerName(aT2Uebung)
        );

        // if (this.ProgrammKategorie === SessionKategorie.Konkret) {
        //     this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.GzClpT2, aNeueSession);
        // }
        // Arbeits-Saetze anfügen
        mAnzSaetze = 3;
        for (let i = 0; i < mAnzSaetze; i++) {
            mUebung.SatzListe.push(
                Satz.NeuerSatz(
                    SatzTyp.Training,
                    LiftTyp.GzClpT3,
                    10, // Wdh-Vorgabe
                    85, // Prozent
                    0, // SessionID
                    0, // UebungID
                    false // Kein AMRAP
                )
            );
        }
        aNeueSession.UebungsListe.push(mUebung);

        // T3-Lift
        mUebung = this.fUebungService.Kopiere(
            this.fUebungService.SucheUebungPerName(aT3Uebung)
        );

        // Arbeits-Saetze anfügen
        for (let i = 0; i < 3; i++) {
            mUebung.SatzListe.push(
                Satz.NeuerSatz(
                    SatzTyp.Training,
                    LiftTyp.GzClpT3,
                    15, // Wdh-Vorgabe
                    65, // Prozent
                    0, // SessionID
                    0, // UebungID
                    i == mAnzSaetze - 1 // Der letzte Satz ist AMRAP
                )
            );
        }
        aNeueSession.UebungsListe.push(mUebung);
    }
}
