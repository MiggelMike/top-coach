import { Uebung } from "../Uebung/Uebung";

export enum SessionStatus {
    NurLesen,
    Bearbeitbar,
}

export interface ISession {
    ID: number;
    FK_Programm: number;
    SessionNr: number;
    Name: string;
    Datum: Date;
    DauerInSek: number;
    Expanded: Boolean;
    Kategorie01: SessionStatus;
    Bearbeitbar: Boolean;
    UebungsListe: Array<Uebung>;
    Copy(): Session;
    getKategorie01():string;
}

export class Session implements ISession {
    public ID: number;
    public FK_Programm: number = 0;
    public SessionNr: number;
    public Name: string;
    public Datum: Date = new Date();
    public DauerInSek: number = 0;
    public Expanded: Boolean;
    public Kategorie01: SessionStatus = SessionStatus.Bearbeitbar;
    public Bearbeitbar: Boolean = false;
    public UebungsListe: Array<Uebung> = new Array<Uebung>();

    public getKategorie01(): string {
        if (this.Kategorie01 === SessionStatus.Bearbeitbar)
            return "Bearbeitbar";
        if (this.Kategorie01 === SessionStatus.NurLesen)
            return "NurLesen";
        return "";
    }

    constructor() {
        Object.defineProperty(this, 'UebungsListe', { enumerable: false });
    }

    public Copy(): Session {
        return Object.assign({}, this);
    }
}
