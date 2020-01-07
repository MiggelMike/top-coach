import { ISatz } from '../Konfiguration/Satz';

export enum SessionTyp {
    Gzclp_A1,
    Gzclp_B1,
    Gzclp_A2,
    Gzclp_B2,
    Custom,
    Konkrete,
    Vorlage
}

export enum ProgrammTyp {
    Gzclp,
    Custom
}


export interface ISession {
    ID: number;
    Name: string;
    Saetze: Array<ISatz>;
}

export interface IKonkreteSession extends ISession {
    Datum: Date;
    DauerInSek: number;
    Typ: SessionTyp;
    Init(): void;
}

export class KonkreteSession implements IKonkreteSession  {
    public ID: number;
    public Name: string;
    public Saetze: Array<ISatz>;
    public Datum: Date;
    public DauerInSek: number;
    public Typ: SessionTyp;

    public Init(): void {
        throw new Error('Method not implemented.');
    }
}

export interface IVorlageSession extends ISession {
    ProgrammTyp: ProgrammTyp;
}

export abstract class VorlageSession implements IVorlageSession {
    ID: number;
    Name: string;
    Saetze: Array<ISatz>;
    ProgrammTyp: ProgrammTyp;
    public abstract Init(): void;
}



