import { SatzTyp } from '../Satz/Satz';
import { IUebung } from './../Uebung/Uebung';
import { LiftTyp } from '../Satz/Satz';
import { ISatz } from '../Satz/Satz';
import { ISession } from '../Session/Session';
import { JsonProperty } from '@peerlancers/json-serialization';

// import { NgModuleCompileResult } from '@angular/compiler/src/ng_module_compiler';

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
    DeserializeProgramm(aJsonData: Object): ITrainingsProgramm;
    NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVorgabe : number,
        aProzent: number,
        aSession: ISession,
        aUebung: IUebung,
        aAmrap: boolean): ISatz;
}

export abstract class TrainingsProgramm implements ITrainingsProgramm {
           @JsonProperty()
           public ID = 0;
           // Wird in abgeleiteten Klassen gesetzt.
           @JsonProperty()
           public Tage = 0;
           @JsonProperty()
           public Name: string;
           @JsonProperty()
           public ProgrammKategorie: ProgrammKategorie;
           @JsonProperty()
           public SessionListe: Array<ISession> = new Array<ISession>();
           constructor(aProgrammKategorie: ProgrammKategorie) {
               this.ProgrammKategorie = aProgrammKategorie;
           }

           public abstract NeuerSatz(
               aSatzTyp: SatzTyp,
               aLiftTyp: LiftTyp,
               aWdhVorgabe: number,
               aProzent: number,
               aSession: ISession,
               aUebung: IUebung,
               aAmrap: boolean
           ): ISatz;

           protected abstract PreCopy(): ITrainingsProgramm;

           public Copy(): ITrainingsProgramm {
               const mResult = this.PreCopy();
               mResult.Tage = this.Tage;
               mResult.ProgrammKategorie = this.ProgrammKategorie;
               mResult.Name = this.Name;
               this.SessionListe.forEach((mSess) =>
                   mResult.SessionListe.push(mSess.Copy())
               );
               return mResult;
           }

           public abstract ErstelleProgrammAusVorlage(): ITrainingsProgramm;

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

           public abstract DeserializeProgramm(
               aJsonData: Object
           ): ITrainingsProgramm;
       }



