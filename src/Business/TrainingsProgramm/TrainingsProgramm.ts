import { ISession, Session } from '../Session/Session';
import { NgModuleCompileResult } from '@angular/compiler/src/ng_module_compiler';

export enum ProgrammTyp {
    Gzclp = 'Gzclp',
    Custom = 'Custom'
}

export enum ProgrammKategorie {
    Konkret = 'Konkret',
    Vorlage = 'Vorlage',
}

export interface ITrainingsProgramm {
    ID: number;
    Tage: number;
    Name: string;
    ProgrammKategorie: ProgrammKategorie;
    SessionListe: Array<ISession>;
    Init(aSessions: Array<ISession>): void;
    Copy(): ITrainingsProgramm;
    ErstelleProgrammAusVorlage(): ITrainingsProgramm;
}

export abstract class TrainingsProgramm implements ITrainingsProgramm {
    public ID = 0;
    // Wird in abgeleiteten Klassen gesetzt.
    public Tage = 0;
    public Name: string;
    public ProgrammKategorie: ProgrammKategorie;
    public SessionListe: Array<ISession> = new Array<ISession>();
    constructor(aProgrammKategorie: ProgrammKategorie) {
        this.ProgrammKategorie = aProgrammKategorie;
    }

    protected abstract PreCopy(): ITrainingsProgramm;

    public Copy(): ITrainingsProgramm {
        const mResult = this.PreCopy();
        mResult.Tage = this.Tage;
        mResult.ProgrammKategorie = this.ProgrammKategorie;
        mResult.Name = this.Name;
        this.SessionListe.forEach(mSess => mResult.SessionListe.push(mSess.Copy() ));
        return mResult;
    }

    public abstract ErstelleProgrammAusVorlage(): ITrainingsProgramm;

    public Init(aSessions: Array<ISession>): void {
        for (let mAktuellerTag = 1; mAktuellerTag <= this.Tage; mAktuellerTag++) {
            this.InitTag(mAktuellerTag).forEach(
                mSess => {
                    aSessions.push(mSess);
                    this.SessionListe.push(mSess);
                });
        }
    }


    protected abstract InitTag(aTagNr: number): Array<ISession>;



}



