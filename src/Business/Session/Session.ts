import { ISatz } from '../Konfiguration/Satz';

export enum SessionKategorie {
    Konkret = 'Konkret',
    Vorlage = 'Vorlage',
}

export enum ProgrammTyp {
    Gzclp = 'Gzclp',
    Custom = 'Custom'
}

export interface ISession {
    ID: number;
    Name: string;
    Saetze: Array<ISatz>;
    Datum: Date;
    DauerInSek: number;
    Typ: SessionKategorie;
    ProgrammTyp: ProgrammTyp;
}

export class Session implements ISession  {
    public ID: number;
    public Name: string;
    public Saetze: Array<ISatz>;
    public Datum: Date;
    public DauerInSek: number;
    public Typ: SessionKategorie;
    public ProgrammTyp: ProgrammTyp;

    constructor(aPara: Session = {} as Session) {
        this.ID = aPara.ID;
        this.Name = aPara.Name;
        this.Saetze = aPara.Saetze ? aPara.Saetze : [];
        this.Datum = aPara.Datum;
        this.DauerInSek = aPara.DauerInSek;
        this.Typ = aPara.Typ;
        this.ProgrammTyp = aPara.ProgrammTyp;
    }
}

