import { ISession, SessionKategorie } from '../Session/Session';
import { Applikation } from '../Applikation';

export interface ITrainingsProgramm {
    ID: number;
    Tage: number;
    SessionKategorie: SessionKategorie;
    App: Applikation;
    Init(aSessions: Array<ISession>): void;
}

export abstract class TrainingsProgramm implements ITrainingsProgramm {
    public ID = 0;
    // Wird in abgeleiteten Klassen gesetzt.
    public Tage = 0;
    public App: Applikation;
    public SessionKategorie: SessionKategorie;
    constructor(aSessionKategorie: SessionKategorie, aApp: Applikation) {
        this.SessionKategorie = aSessionKategorie;
        this.App = aApp;
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



