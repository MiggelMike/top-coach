import { ISession, SessionKategorie } from '../Session/Session';
import { AppDataMap } from '../Applikation';

export interface ITrainingsProgramm {
    ID: number;
    Tage: number;
    SessionKategorie: SessionKategorie;
    AppData: AppDataMap;
    Init(aSessions: Array<ISession>): void;
}

export abstract class TrainingsProgramm implements ITrainingsProgramm {
    public ID = 0;
    // Wird in abgeleiteten Klassen gesetzt.
    public Tage = 0;
    public AppData: AppDataMap;
    public SessionKategorie: SessionKategorie;
    constructor(aSessionKategorie: SessionKategorie, aAppData: AppDataMap) {
        this.SessionKategorie = aSessionKategorie;
        this.AppData = aAppData;
    }

    public Init(aSessions: Array<ISession>): void {
        for (let mAktuellerTag = 1; mAktuellerTag <= this.Tage; mAktuellerTag++) {
            this.InitTag(mAktuellerTag).forEach(
                mSess => {
                    aSessions.push(mSess);
                });
        }
    }

    protected abstract InitTag(aTagNr: number): Array<ISession>;
}



