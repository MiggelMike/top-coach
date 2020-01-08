import { ITrainingsProgramm } from './TrainingsProgramm';
import { TrainingsProgramm } from './TrainingsProgramm';
import { ISession, Session, SessionKategorie, ProgrammTyp } from '../Session/Session';
import { Satz, SatzTyp, SatzKategorie } from '../Konfiguration/Satz';
import { AppDataMap } from '../Applikation';
import { UebungsKategorie } from '../Uebung/Uebung_Stammdaten';

export class GzclpProgramm extends TrainingsProgramm {
    constructor(aSessionKategorie: SessionKategorie, aAppData: AppDataMap) {
        super(aSessionKategorie, aAppData);
        this.Tage = 4;
    }

    protected InitTag(aTagNr: number): Array<ISession> {

        const mSessions = new Array<ISession>();
        const mEineSession = new GzclpVorlageSession(
            {
                ID: 0,
                Name: 'Tag ' + aTagNr.toString(),
                Saetze: [],
                Datum: null,
                DauerInSek: 0,
                Typ: this.SessionKategorie,
                ProgrammTyp: ProgrammTyp.Gzclp
            } as Session);

        mSessions.push(mEineSession);
        switch (aTagNr) {
            case 1:
                // Bei Konkreter Session Aufwärmsätze erzeugen.
                if (this.SessionKategorie === SessionKategorie.Konkret) {
                    // Gzclp-T1-Satz-Zyklus-0
                    // 1. Aufwärm-Satz
                    mEineSession.Saetze.push(new Satz({
                        ID: 0,
                        SessionID: mEineSession.ID,
                        UebungID: 0,
                        SatzTyp: SatzTyp.Aufwaermen,
                        SatzKategorie: SatzKategorie.Training,
                        Prozent: 0,
                        GewichtAusgefuehrt: 0,
                        WdhAusgefuehrt: 0,
                        GewichtVorgabe: 0,
                        WdhVorgabe: 5
                    }));
                    // Gzclp-T1-Satz-Zyklus-0
                    // 2. Aufwärm-Satz
                    mEineSession.Saetze.push(new Satz({
                        ID: 0,
                        SessionID: mEineSession.ID,
                        UebungID: 0,
                        SatzTyp: SatzTyp.Aufwaermen,
                        SatzKategorie: SatzKategorie.Training,
                        Prozent: 0,
                        GewichtAusgefuehrt: 0,
                        WdhAusgefuehrt: 0,
                        GewichtVorgabe: 0,
                        WdhVorgabe: 0
                    }));
                    // Gzclp-T1-Satz-Zyklus-0
                    // 3. Aufwärm-Satz
                    mEineSession.Saetze.push(new Satz({
                        ID: 0,
                        SessionID: mEineSession.ID,
                        UebungID: 0,
                        SatzTyp: SatzTyp.Aufwaermen,
                        SatzKategorie: SatzKategorie.Training,
                        Prozent: 0,
                        GewichtAusgefuehrt: 0,
                        WdhAusgefuehrt: 0,
                        GewichtVorgabe: 0,
                        WdhVorgabe: 0
                    }));
                }
                // Gzclp-T1-Satz-Zyklus-0
                // 1. Arbeits-Satz
                mEineSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: mEineSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Training,
                    SatzKategorie: SatzKategorie.Vorlage,
                    Prozent: 0,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 5
                }));
                // Gzclp-T1-Satz-Zyklus-0
                // 2. Arbeits-Satz
                mEineSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: mEineSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Training,
                    SatzKategorie: SatzKategorie.Vorlage,
                    Prozent: 0,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 0
                }));
                // Gzclp-T1-Satz-Zyklus-0
                // 3. Arbeits-Satz
                mEineSession.Saetze.push(new Satz({
                    ID: 0,
                    SessionID: mEineSession.ID,
                    UebungID: 0,
                    SatzTyp: SatzTyp.Training,
                    SatzKategorie: SatzKategorie.Vorlage,
                    Prozent: 0,
                    GewichtAusgefuehrt: 0,
                    WdhAusgefuehrt: 0,
                    GewichtVorgabe: 0,
                    WdhVorgabe: 0
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

