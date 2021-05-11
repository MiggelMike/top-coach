import { ISession } from 'src/Business/Session/Session';
import { DexieSvcService } from './../../app/services/dexie-svc.service';
var cloneDeep = require('lodash.clonedeep');

export enum ProgrammTyp {
    Custom = "Custom",
    Gzclp = "Gzclp",
}

export enum ProgrammKategorie {
    AktuellesProgramm = "AktuellesProgramm",
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
    ErstelleSessionsAusVorlage(aProgrammKategorie: ProgrammKategorie): ITrainingsProgramm;
    DeserializeProgramm(aJsonData: Object): ITrainingsProgramm;
    hasChanged(aCmpProgramm: ITrainingsProgramm): Boolean;
}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export abstract class TrainingsProgramm implements ITrainingsProgramm {
    // Wird in abgeleiteten Klassen gesetzt.
    public id: number;
    public Tage: number = 0;
    public Name: string = "";
    public ProgrammKategorie: ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;
    public ProgrammTyp: ProgrammTyp = ProgrammTyp.Custom;
    public Bearbeitbar: Boolean = true;
    public SessionListe: Array<ISession> = [];

    constructor(
        aProgrammTyp: ProgrammTyp,
        aProgrammKategorie: ProgrammKategorie,
        public pDbModule: DexieSvcService
    ) {
        this.ProgrammKategorie = aProgrammKategorie;
        this.ProgrammTyp = aProgrammTyp;
        Object.defineProperty(this, "pDbModule", { enumerable: false });
        Object.defineProperty(this, "SessionListe", { enumerable: false });
    }

    public hasChanged(aCmpProgramm: ITrainingsProgramm): Boolean {
        if (this.SessionListe && aCmpProgramm.SessionListe) {
            if (this.SessionListe.length != aCmpProgramm.SessionListe.length) return true;
            if (this.id != aCmpProgramm.id) return true;
            if (this.Name != aCmpProgramm.Name) return true;
            if (this.ProgrammKategorie != aCmpProgramm.ProgrammKategorie) return true;
            if (this.ProgrammTyp != aCmpProgramm.ProgrammTyp) return true;
            if (this.Tage != aCmpProgramm.Tage) return true;
            
            for (let index = 0; index < this.SessionListe.length; index++) {
                if (this.SessionListe[index].hasChanged(aCmpProgramm.SessionListe[index]) === true) {
                    console.log('Session #' + index.toString() + ' has changed.');
                    return true;
                }
            }
        }
        return false;
    }

    public Copy(): ITrainingsProgramm {
        const mResult: ITrainingsProgramm = cloneDeep(this);
        // mResult.SessionListe = new Array<ISession>();
        // if (this.SessionListe) {
        //     for (let index = 0; index < this.SessionListe.length; index++) {
        //         mResult.SessionListe.push(this.SessionListe[index].Copy());
        //     }
        // }
        return mResult;
    }

    public ErstelleSessionsAusVorlage(aProgrammKategorie : ProgrammKategorie): ITrainingsProgramm {
        const mResult = this.Copy();
        mResult.ProgrammKategorie = aProgrammKategorie;
        return mResult;
    }

    public Init(aSessions: Array<ISession>): void {
        for (
            let mAktuellerTag = 1;
            mAktuellerTag <= this.Tage;
            mAktuellerTag++
        ) {
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
    ProgrammTyp: ProgrammTyp;
    Programm: ITrainingsProgramm;
}
