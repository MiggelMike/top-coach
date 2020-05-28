import { UebungService } from './../../app/services/uebung.service';
import { TrainingsProgramm, ITrainingsProgramm, ProgrammKategorie } from './TrainingsProgramm';
import { ISession, Session } from '../Session/Session';
import { Satz, SatzTyp, SatzStatus, SatzPausen, LiftTyp } from '../Konfiguration/Satz';
import { StammUebung, UebungsName } from '../Uebung/Uebung_Stammdaten';
import { deserialize } from '@peerlancers/json-serialization';

export class GzclpProgramm extends TrainingsProgramm {
    constructor(private fUebungService: UebungService, aProgrammKategorie: ProgrammKategorie ) {
        super(aProgrammKategorie);
        this.Tage = 4;
    }

    protected PreCopy(): ITrainingsProgramm {
        return new GzclpProgramm(this.fUebungService, this.ProgrammKategorie);
    }

    public ErstelleProgrammAusVorlage(): ITrainingsProgramm {
        const mResult = this.Copy();
        mResult.ProgrammKategorie = ProgrammKategorie.Konkret;
        return mResult;
    }

    public DeserializeProgramm(aJsonData : Object): ITrainingsProgramm {
        const s = deserialize( GzclpProgramm, aJsonData);
        return s;
    }

    private ErzeugeAufwaermSaetze(aUebung: StammUebung, aLiftTyp: LiftTyp, aSession: Session) {
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
        const mNeueSession = new Session(
            {
                ID: 0,
                TagNr: aTagNr,
                Saetze: [],
                Datum: null,
                DauerInSek: 0,
                FK_Programm: this.ID
            } as Session);

        mSessions.push(mNeueSession);

        switch (aTagNr) {
            case 1:
                this.ErzeugeSessions(UebungsName.Squat, UebungsName.Benchpress, UebungsName.Dips, mNeueSession);
                break;

            case 2:
                this.ErzeugeSessions(UebungsName.OverheadPress, UebungsName.Deadlift, UebungsName.ChinUps, mNeueSession);
                break;

            case 3:
                this.ErzeugeSessions(UebungsName.Benchpress, UebungsName.Squat, UebungsName.Dips, mNeueSession);
                break;

            case 4:
                this.ErzeugeSessions(UebungsName.Deadlift, UebungsName.OverheadPress, UebungsName.ChinUps, mNeueSession);
                break;
        }
        return mSessions;
    }

    private ErzeugeSessions(aT1Uebung: UebungsName, aT2Uebung: UebungsName, aT3Uebung: UebungsName, aNeueSession: Session): void {
        // T1-Lift
        let mUebung = this.fUebungService.Kopiere(this.fUebungService.SucheUebungPerName(aT1Uebung));
        this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.GzClpT1, aNeueSession);
        let mNeuerSatz = null;
        // Arbeits-Saetze anfügen
        for (let i = 0; i < 5; i++) {
            mNeuerSatz = new Satz();
            mNeuerSatz.Status = SatzStatus.Wartet;
            mNeuerSatz.SatzTyp = SatzTyp.Training;
            mNeuerSatz.LiftTyp = LiftTyp.GzClpT1;
            mNeuerSatz.Uebung = mUebung;
            mNeuerSatz.PausenMinZeit = SatzPausen.GzClpT1_Min;
            mNeuerSatz.PausenMaxZeit = SatzPausen.GzClpT1_Max;
            mNeuerSatz.Prozent = 100;
            mNeuerSatz.WdhVorgabe = 3;
            mNeuerSatz.AMRAP = false;
            aNeueSession.Saetze.push(mNeuerSatz);
        }
        // Der letzte Satz ist AMRAP
        aNeueSession.Saetze[aNeueSession.Saetze.length - 1].AMRAP = true;
        // T2-Lift
        mUebung = this.fUebungService.Kopiere(this.fUebungService.SucheUebungPerName(aT2Uebung));
        if (this.ProgrammKategorie === ProgrammKategorie.Konkret) {
            this.ErzeugeAufwaermSaetze(mUebung, LiftTyp.GzClpT2, aNeueSession);
        }
        // Arbeits-Saetze anfügen
        for (let i = 0; i < 3; i++) {
            mNeuerSatz = new Satz();
            mNeuerSatz.Status = SatzStatus.Wartet;
            mNeuerSatz.SatzTyp = SatzTyp.Training;
            mNeuerSatz.LiftTyp = LiftTyp.GzClpT2;
            mNeuerSatz.Uebung = mUebung;
            mNeuerSatz.PausenMinZeit = SatzPausen.GzClpT2_Min;
            mNeuerSatz.PausenMaxZeit = SatzPausen.GzClpT2_Max;
            mNeuerSatz.Prozent = 85;
            mNeuerSatz.WdhVorgabe = 10;
            mNeuerSatz.AMRAP = false;
            aNeueSession.Saetze.push(mNeuerSatz);
        }
        // T3-Lift
        mUebung = this.fUebungService.Kopiere(this.fUebungService.SucheUebungPerName(aT3Uebung));
        // Arbeits-Saetze anfügen
        for (let i = 0; i < 3; i++) {
            mNeuerSatz = new Satz();
            mNeuerSatz.Status = SatzStatus.Wartet;
            mNeuerSatz.SatzTyp = SatzTyp.Training;
            mNeuerSatz.LiftTyp = LiftTyp.GzClpT3;
            mNeuerSatz.Uebung = mUebung;
            mNeuerSatz.PausenMinZeit = SatzPausen.GzClpT3_Min;
            mNeuerSatz.PausenMaxZeit = SatzPausen.GzClpT3_Max;
            mNeuerSatz.Prozent = 65;
            mNeuerSatz.WdhVorgabe = 15;
            mNeuerSatz.AMRAP = false;
            aNeueSession.Saetze.push(mNeuerSatz);
        }
        // Der letzte Satz ist AMRAP
        aNeueSession.Saetze[aNeueSession.Saetze.length - 1].AMRAP = true;
    }
}

