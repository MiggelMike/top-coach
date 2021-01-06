import { DexieSvcService } from './../../app/services/dexie-svc.service';
import { Satz, SatzTyp, SatzStatus, SatzPausen } from "../Satz/Satz";
import { IUebung } from "./../Uebung/Uebung";
import { LiftTyp } from "../Satz/Satz";
import { ISatz } from "../Satz/Satz";
import { ISession } from "../Session/Session";
import { JsonProperty } from "@peerlancers/json-serialization";

export enum ProgrammTyp {
    Custom = "Custom",
    Gzclp = "Gzclp",
}

export enum ProgrammKategorie {
    Konkret = "Konkret",
    Vorlage = "Vorlage",
}

export interface ITrainingsProgramm {
    id: number;
    Tage: number;
    Name: string;
    ProgrammKategorie: ProgrammKategorie;
    ProgrammTyp: ProgrammTyp;
    SessionListe: Array<ISession>;
    Bearbeitbar: Boolean; 
    Init(aSessions: Array<ISession>): void;
    Copy(): ITrainingsProgramm;
    ErstelleSessionsAusVorlage(): ITrainingsProgramm;
    DeserializeProgramm(aJsonData: Object): ITrainingsProgramm;
}

export abstract class TrainingsProgramm implements ITrainingsProgramm {
    // Wird in abgeleiteten Klassen gesetzt.
    public id: number;
    public Tage: number = 0;
    public Name: string = '';
    public ProgrammKategorie: ProgrammKategorie = ProgrammKategorie.Konkret;
    public ProgrammTyp: ProgrammTyp = ProgrammTyp.Custom;
    public Bearbeitbar: Boolean = true; 
    public SessionListe: Array<ISession> = new Array<ISession>();

    constructor(aProgrammTyp: ProgrammTyp, aProgrammKategorie: ProgrammKategorie, public pDbModule: DexieSvcService) {
        this.ProgrammKategorie = aProgrammKategorie;
        this.ProgrammTyp = aProgrammTyp;
        Object.defineProperty(this, 'pDbModule', { enumerable: false });
    }

    protected abstract PreCopy(): ITrainingsProgramm;

    public Copy(): ITrainingsProgramm {
        const mResult = this.PreCopy();
        mResult.Tage = this.Tage;
        mResult.ProgrammKategorie = this.ProgrammKategorie;
        mResult.Name = this.Name;
        mResult.Bearbeitbar = this.Bearbeitbar;

        this.SessionListe.forEach((mSess) =>
            mResult.SessionListe.push(mSess.Copy())
        );
        return mResult;
    }

    public abstract ErstelleSessionsAusVorlage(): ITrainingsProgramm;

    public Init(aSessions: Array<ISession>): void {
        for (let mAktuellerTag = 1; mAktuellerTag <= this.Tage; mAktuellerTag++) {
            this.InitTag(mAktuellerTag).forEach((mSess) => {
                aSessions.push(mSess);
                this.SessionListe.push(mSess);
            });
        }
    }

    protected abstract InitTag(aTagNr: number): Array<ISession>;

    public abstract DeserializeProgramm(aJsonData: Object): ITrainingsProgramm;
}

export class AktuellesProgramm {
    @JsonProperty()
    ProgrammTyp: ProgrammTyp;
    @JsonProperty()
    Programm: ITrainingsProgramm;
}
