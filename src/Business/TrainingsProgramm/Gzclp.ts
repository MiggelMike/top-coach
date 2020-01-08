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
                switch (aTagNr) {
                    case 1:
                        if (((k === UebungsKategorie02.GzclpTag1_1) ||
                            (k === UebungsKategorie02.GzclpTag1_2) ||
                            (k === UebungsKategorie02.GzclpTag1_3) ||
                            (k === UebungsKategorie02.GzclpTag1_4)) &&
                            (!mRelevanteUebungen.find( u => u.ID === mUeb.ID))) {
                            mRelevanteUebungen.push(mUeb);
                        }
                        break;
                    case 2:
                        if (((k === UebungsKategorie02.GzclpTag3_1) ||
                            (k === UebungsKategorie02.GzclpTag3_2) ||
                            (k === UebungsKategorie02.GzclpTag3_3) ||
                            (k === UebungsKategorie02.GzclpTag3_4)) &&
                            (!mRelevanteUebungen.find(u => u.ID === mUeb.ID))) {
                            mRelevanteUebungen.push(mUeb);
                        }
                        break;
                    case 3:
                        if (((k === UebungsKategorie02.GzclpTag2_1) ||
                            (k === UebungsKategorie02.GzclpTag2_2) ||
                            (k === UebungsKategorie02.GzclpTag2_3) ||
                            (k === UebungsKategorie02.GzclpTag2_4)) &&
                            (!mRelevanteUebungen.find(u => u.ID === mUeb.ID))) {
                            mRelevanteUebungen.push(mUeb);
                        }
                        break;
                    case 4:
                        if (((k === UebungsKategorie02.GzclpTag4_1) ||
                            (k === UebungsKategorie02.GzclpTag4_2) ||
                            (k === UebungsKategorie02.GzclpTag4_3) ||
                            (k === UebungsKategorie02.GzclpTag4_4)) &&
                            (!mRelevanteUebungen.find(u => u.ID === mUeb.ID))) {
                            mRelevanteUebungen.push(mUeb);
                        }
                        break;
                }
            }
        }

        mRelevanteUebungen.sort(
            (a, b) => {
                if (a.Kategorieen02 > b.Kategorieen02) {
                    return 1;
                }
                if (a.Kategorieen02 < b.Kategorieen02) {
                    return -1;
                }
                return 0;
            });

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

