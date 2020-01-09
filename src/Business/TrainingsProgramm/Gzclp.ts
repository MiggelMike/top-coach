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

    private ErzeugeAufwaermSaetze(aUebung: StammUebung, aLiftTyp: LiftTyp, aSession: GzclpVorlageSession) {
        let mParaSatz = null;
        // Aufwärm-Saetze anfügen
        for (let i = 0; i < 3; i++) {
            mParaSatz = new Satz();
            mParaSatz.SessionID = aSession.ID;
            mParaSatz.Status = SatzStatus.Wartet;
            mParaSatz.SatzTyp = SatzTyp.Aufwaermen;
            mParaSatz.LiftTyp = aLiftTyp;
            mParaSatz.Uebung = aUebung;
            mParaSatz.PausenMinZeit = SatzPausen.Standard_Min;
            mParaSatz.PausenMaxZeit = SatzPausen.Standard_Max;
            mParaSatz.WdhVorgabe = 3;
            mParaSatz.AMRAP = false;
            switch (i) {
                case 0:
                    mParaSatz.Prozent = 40;
                    break;

                case 1:
                    mParaSatz.Prozent = 50;
                    break;

                default:
                    mParaSatz.Prozent = 60;
            }
            aSession.Saetze.push(mParaSatz);
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
                    this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.GzClpT1, mNeueSession);
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
                    this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.GzClpT2, mNeueSession);
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

