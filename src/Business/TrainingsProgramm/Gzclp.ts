import { ITrainingsProgramm } from './TrainingsProgramm';
import { TrainingsProgramm } from './TrainingsProgramm';
import { ISession, Session, SessionKategorie, ProgrammTyp } from '../Session/Session';
import { Satz, SatzTyp, SatzKategorie, SatzStatus, SatzPausen } from '../Konfiguration/Satz';
import { AppDataMap } from '../Applikation';
import { UebungsKategorie01, UebungsKategorie02, StammUebung } from '../Uebung/Uebung_Stammdaten';

export class GzclpProgramm extends TrainingsProgramm {
    constructor(aSessionKategorie: SessionKategorie, aAppData: AppDataMap) {
        super(aSessionKategorie, aAppData);
        this.Tage = 4;
    }

    private ErzeugeAufwaermSaetze(aTagNr: number, aSession: GzclpVorlageSession) {
        switch (aTagNr) {
            case 1:
                // Gzclp-T1-Satz-Zyklus-0
                // 1. Aufwärm-Satz
                aSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: aSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Aufwaermen,
                    SatzKategorie: SatzKategorie.Training,
                    Prozent: 65,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 5,
                    PausenMinZeit: SatzPausen.Standard_Min,
                    PausenMaxZeit: SatzPausen.Standard_Max,
                    Status: SatzStatus.Wartet
                }));
                // Gzclp-T1-Satz-Zyklus-0
                // 2. Aufwärm-Satz
                aSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: aSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Aufwaermen,
                    SatzKategorie: SatzKategorie.Training,
                    Prozent: 65,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 0,
                    PausenMinZeit: SatzPausen.Standard_Min,
                    PausenMaxZeit: SatzPausen.Standard_Max,
                    Status: SatzStatus.Wartet
                }));
                // Gzclp-T1-Satz-Zyklus-0
                // 3. Aufwärm-Satz
                aSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: aSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Aufwaermen,
                    SatzKategorie: SatzKategorie.Training,
                    Prozent: 65,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 0,
                    PausenMinZeit: SatzPausen.Standard_Min,
                    PausenMaxZeit: SatzPausen.Standard_Max,
                    Status: SatzStatus.Wartet
                }));
                break;

            case 2:
                break;

            case 3:
                break;

            case 4:
                break;
        }
    }

    protected InitTag(aTagNr: number): Array<ISession> {

        const mSessions = new Array<ISession>();
        const mNeueSession = new GzclpVorlageSession(
            {
                ID: 0,
                Name: 'Tag ' + aTagNr.toString(),
                Saetze: [],
                Datum: null,
                DauerInSek: 0,
                Typ: this.SessionKategorie,
                ProgrammTyp: ProgrammTyp.Gzclp
            } as Session);

        mSessions.push(mNeueSession);
        const mRelevanteUebungen = new Array<StammUebung>();
        for (const mUeb of this.AppData.Uebungen) {
            for (const k of mUeb.Kategorieen02) {
                if ((aTagNr === 1) &&
                    ((k === UebungsKategorie02.GzclpTag1_1) ||
                        (k === UebungsKategorie02.GzclpTag1_2) ||
                        (k === UebungsKategorie02.GzclpTag1_3) ||
                        (k === UebungsKategorie02.GzclpTag1_4))) {
                    mRelevanteUebungen.push(mUeb);
                }
            }
        }

        // const mRelevanteUebungen = this.AppData.Uebungen.filter(
        //     ueb => {
        //         return (ueb.Kategorieen01.find(
        //             k => (
        //                 (k === UebungsKategorie01.GzclpT1Cycle0) ||
        //                 (k === UebungsKategorie01.GzclpT1Cycle1) ||
        //                 (k === UebungsKategorie01.GzclpT1Cycle2) ||
        //                 (k === UebungsKategorie01.GzclpT2Cycle0) ||
        //                 (k === UebungsKategorie01.GzclpT2Cycle1) ||
        //                 (k === UebungsKategorie01.GzclpT2Cycle2)
        //             )));
        //     }
        // );

        // mRelevanteUebungen = mRelevanteUebungen.filter(
        //     ueb => {
        //         return (ueb.Kategorieen02.find(
        //             k => (
        //                     ((aTagNr === 1) &&
        //                         (k === UebungsKategorie02.GzclpTag1_1) ||
        //                         (k === UebungsKategorie02.GzclpTag1_2) ||
        //                         (k === UebungsKategorie02.GzclpTag1_3) ||
        //                         (k === UebungsKategorie02.GzclpTag1_4)
        //                     ) ||
        //                     ((aTagNr === 2) &&
        //                         (k === UebungsKategorie02.GzclpTag2_1) ||
        //                         (k === UebungsKategorie02.GzclpTag2_2) ||
        //                         (k === UebungsKategorie02.GzclpTag2_3) ||
        //                         (k === UebungsKategorie02.GzclpTag2_4)
        //                     ) ||
        //                     ((aTagNr === 3) &&
        //                         (k === UebungsKategorie02.GzclpTag3_1) ||
        //                         (k === UebungsKategorie02.GzclpTag3_2) ||
        //                         (k === UebungsKategorie02.GzclpTag3_3) ||
        //                         (k === UebungsKategorie02.GzclpTag3_4)
        //                     ) ||
        //                     ((aTagNr === 4) &&
        //                         (k === UebungsKategorie02.GzclpTag4_1) ||
        //                         (k === UebungsKategorie02.GzclpTag4_2) ||
        //                         (k === UebungsKategorie02.GzclpTag4_3) ||
        //                         (k === UebungsKategorie02.GzclpTag4_4)
        //                     )
        //                 )
        //             ));
        //     }
        // );

        const mRelevanteUebungen1 = mRelevanteUebungen.filter(
            ueb => {
                return (ueb.Kategorieen02.find(
                    k => {
                        if (
                            (k === UebungsKategorie02.GzclpTag1_1) ||
                            (k === UebungsKategorie02.GzclpTag1_2) ||
                            (k === UebungsKategorie02.GzclpTag1_3) ||
                            (k === UebungsKategorie02.GzclpTag1_4)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    ));
            }
        );


        // .sort((a, b) => a.Kategorieen02);

       // if(mRelevanteUebungen)

        // mRelevanteUebungen = mRelevanteUebungen.find


        // .sort((a, b) => {

            // a.Kategorieen02
          //  return 1;
        // };

        if (this.SessionKategorie === SessionKategorie.Konkret) {
            this.ErzeugeAufwaermSaetze(aTagNr, mNeueSession);
        }

        switch (aTagNr) {
            case 1:
                // Gzclp-T1-Satz-Zyklus-0
                // 1. Arbeits-Satz
                mNeueSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: mNeueSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Training,
                    SatzKategorie: SatzKategorie.Vorlage,
                    Prozent: 0,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 5,
                    PausenMinZeit: SatzPausen.Standard_Min,
                    PausenMaxZeit: SatzPausen.Standard_Max,
                    Status: SatzStatus.Wartet
                }));
                // Gzclp-T1-Satz-Zyklus-0
                // 2. Arbeits-Satz
                mNeueSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: mNeueSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Training,
                    SatzKategorie: SatzKategorie.Vorlage,
                    Prozent: 0,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 0,
                    PausenMinZeit: SatzPausen.GzClpT1_Min,
                    PausenMaxZeit: SatzPausen.GzClpT1_Max,
                    Status: SatzStatus.Wartet
                }));
                // Gzclp-T1-Satz-Zyklus-0
                // 3. Arbeits-Satz
                mNeueSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: mNeueSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Training,
                    SatzKategorie: SatzKategorie.Vorlage,
                    Prozent: 0,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 0,
                    PausenMinZeit: SatzPausen.GzClpT1_Min,
                    PausenMaxZeit: SatzPausen.GzClpT1_Max,
                    Status: SatzStatus.Wartet
                }));
                break;

            case 2:
                break;

            case 3:
                break;

            case 4:
                break;
        }
        return mSessions;
    }
}

export class GzclpVorlageSession extends Session {
    public Init(): void {
        throw new Error('Method not implemented.');
    }
}

