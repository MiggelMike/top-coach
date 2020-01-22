import { ISession, SessionKategorie } from '../Session/Session';
import { GlobalData } from '../../app/services/global.service';


export interface ITrainingsProgramm {
    ID: number;
    Tage: number;
    Name: string;
    SessionKategorie: SessionKategorie;
    Init(aSessions: Array<ISession>): void;
}

export abstract class TrainingsProgramm implements ITrainingsProgramm {
    public ID = 0;
    // Wird in abgeleiteten Klassen gesetzt.
    public Tage = 0;
    public Name: string;
    public SessionKategorie: SessionKategorie;
    constructor(aSessionKategorie: SessionKategorie) {
        this.SessionKategorie = aSessionKategorie;
    }

    public Init(aSessions: Array<ISession>): void {
        for (let mAktuellerTag = 1; mAktuellerTag <= this.Tage; mAktuellerTag++) {
            this.InitTag(mAktuellerTag).forEach(
                mSess => {
                    aSessions.push(mSess);
                });
        }
    }

    public ErzeugeKonkreteSessionAusVorlage(): void {

    }

    protected abstract InitTag(aTagNr: number): Array<ISession>;



}



