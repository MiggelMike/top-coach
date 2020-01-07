import { IVorlageSession } from '../Session/Session';

export interface ITrainingsProgramm {
    ID: number;
    Tage: number;
    Init(aSessions: Array<IVorlageSession>): void;
}

export abstract class TrainingsProgramm implements ITrainingsProgramm {
    public ID = 0;
    // Wird in abgeleiteten Klassen gesetzt.
    public Tage = 0;

    public Init(aSessions: Array<IVorlageSession>): void {
        for (let mAktuellerTag = 1; mAktuellerTag <= this.Tage; mAktuellerTag++) {
            this.InitTag(mAktuellerTag).forEach(
                mSess => {
                    aSessions.push(mSess);
                });
        }
    }

    protected abstract InitTag(aTagNr: number): Array<IVorlageSession>;
}



