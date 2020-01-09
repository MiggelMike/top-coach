import { ITrainingsProgramm } from './TrainingsProgramm';
import { TrainingsProgramm } from './TrainingsProgramm';
import { ISession, Session, SessionKategorie, ProgrammTyp } from '../Session/Session';
import { Satz, SatzTyp, SatzKategorie, SatzStatus, SatzPausen, LiftTyp } from '../Konfiguration/Satz';
import { AppDataMap } from '../Applikation';
import { StammUebung, UebungsName } from '../Uebung/Uebung_Stammdaten';

export class GzclpProgramm extends TrainingsProgramm {
    constructor(aSessionKategorie: SessionKategorie, aAppData: AppDataMap) {
        super(aSessionKategorie, aAppData);
        this.Tage = 4;
    }

    private ErzeugeAufwaermSaetze(aTagNr: number, aUebung: StammUebung, aSession: GzclpVorlageSession) {
        switch (aTagNr) {
            case 1:
                // Gzclp-T1-Satz-Zyklus-0
                // 1. Aufwärm-Satz
                // aSession.Saetze.push(new Satz({
                //     ID: 0,
                //     SessionID: aSession.ID,
                //     Uebung: aUebung,
                //     SatzTyp: SatzTyp.Aufwaermen,
                //     SatzKategorie: SatzKategorie.Training,
                //     Prozent: 65,
                //     GewichtAusgefuehrt: 0,
                //     WdhAusgefuehrt: 0,
                //     GewichtVorgabe: 0,
                //     WdhVorgabe: 5,
                //     PausenMinZeit: SatzPausen.Standard_Min,
                //     PausenMaxZeit: SatzPausen.Standard_Max,
                //     Status: SatzStatus.Wartet
                // }));
                // Gzclp-T1-Satz-Zyklus-0
                // 2. Aufwärm-Satz
                // aSession.Saetze.push(new Satz({
                //     ID: 0,
                //     SessionID: aSession.ID,
                //     Uebung: aUebung,
                //     SatzTyp: SatzTyp.Aufwaermen,
                //     SatzKategorie: SatzKategorie.Training,
                //     Prozent: 65,
                //     GewichtAusgefuehrt: 0,
                //     WdhAusgefuehrt: 0,
                //     GewichtVorgabe: 0,
                //     WdhVorgabe: 0,
                //     PausenMinZeit: SatzPausen.Standard_Min,
                //     PausenMaxZeit: SatzPausen.Standard_Max,
                //     Status: SatzStatus.Wartet
                // }));
                // Gzclp-T1-Satz-Zyklus-0
                // 3. Aufwärm-Satz
                // aSession.Saetze.push(new Satz({
                //     ID: 0,
                //     SessionID: aSession.ID,
                //     Uebung: aUebung,
                //     SatzTyp: SatzTyp.Aufwaermen,
                //     SatzKategorie: SatzKategorie.Training,
                //     Prozent: 65,
                //     GewichtAusgefuehrt: 0,
                //     WdhAusgefuehrt: 0,
                //     GewichtVorgabe: 0,
                //     WdhVorgabe: 0,
                //     PausenMinZeit: SatzPausen.Standard_Min,
                //     PausenMaxZeit: SatzPausen.Standard_Max,
                //     Status: SatzStatus.Wartet
                // }));
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

        let mUebung = null;
        switch (aTagNr) {
            case 1:
                // T1-Lift
                mUebung = this.AppData.SucheUebungPerName(UebungsName.Squat);
                if (this.SessionKategorie === SessionKategorie.Konkret) {
                    this.ErzeugeAufwaermSaetze(aTagNr, mUebung, mNeueSession);
                }
                let mParaSatz = null;
                // Arbeits-Saetze anfügen
                for (let i = 0; i < 5; i++) {
                    mParaSatz = new Satz();
                    mParaSatz.Status = SatzStatus.Wartet;
                    mParaSatz.SatzTyp = SatzTyp.Training;
                    mParaSatz.LiftTyp = LiftTyp.GzClpT1;
                    mParaSatz.Uebung = mUebung;
                    mParaSatz.PausenMinZeit = SatzPausen.GzClpT1_Min;
                    mParaSatz.PausenMaxZeit = SatzPausen.GzClpT1_Max;
                    mParaSatz.Prozent = 100;
                    mParaSatz.WdhVorgabe = 3;
                    mParaSatz.AMRAP = false;
                    mNeueSession.Saetze.push(mParaSatz);
                }
                // Der letzte Satz ist AMRAP
                mNeueSession.Saetze[mNeueSession.Saetze.length - 1].AMRAP = true;
                // T2-Lift
                mUebung = this.AppData.SucheUebungPerName(UebungsName.Benchpress);
                if (this.SessionKategorie === SessionKategorie.Konkret) {
                    this.ErzeugeAufwaermSaetze(aTagNr, mUebung, mNeueSession);
                }
                // Arbeits-Saetze anfügen
                for (let i = 0; i < 3; i++) {
                    mParaSatz = new Satz();
                    mParaSatz.Status = SatzStatus.Wartet;
                    mParaSatz.SatzTyp = SatzTyp.Training;
                    mParaSatz.LiftTyp = LiftTyp.GzClpT2;
                    mParaSatz.Uebung = mUebung;
                    mParaSatz.PausenMinZeit = SatzPausen.GzClpT2_Min;
                    mParaSatz.PausenMaxZeit = SatzPausen.GzClpT2_Max;
                    mParaSatz.Prozent = 85;
                    mParaSatz.WdhVorgabe = 10;
                    mParaSatz.AMRAP = false;
                    mNeueSession.Saetze.push(mParaSatz);
                }
                // T3-Lift
                mUebung = this.AppData.SucheUebungPerName(UebungsName.LatPullDowns);
                // Arbeits-Saetze anfügen
                for (let i = 0; i < 3; i++) {
                    mParaSatz = new Satz();
                    mParaSatz.Status = SatzStatus.Wartet;
                    mParaSatz.SatzTyp = SatzTyp.Training;
                    mParaSatz.LiftTyp = LiftTyp.GzClpT3;
                    mParaSatz.Uebung = mUebung;
                    mParaSatz.PausenMinZeit = SatzPausen.GzClpT3_Min;
                    mParaSatz.PausenMaxZeit = SatzPausen.GzClpT3_Max;
                    mParaSatz.Prozent = 65;
                    mParaSatz.WdhVorgabe = 15;
                    mParaSatz.AMRAP = false;
                    mNeueSession.Saetze.push(mParaSatz);
                }
                // Der letzte Satz ist AMRAP
                mNeueSession.Saetze[mNeueSession.Saetze.length - 1].AMRAP = true;
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

