import { Uebung } from "../Uebung/Uebung";

export enum SessionStatus {
    NurLesen,
    Bearbeitbar,
}

export interface ISession {
    id: number;
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
    public id: number;
    public FK_Programm: number = 0;
    public SessionNr: number;
    public Name: string;
    public Datum: Date;
    public DauerInSek: number;
    public Expanded: Boolean;
    public Kategorie01: SessionStatus;
    public Bearbeitbar: Boolean = false;
    public UebungsListe: Array<Uebung> = new Array<Uebung>();

    public getKategorie01(): string {
        if (this.Kategorie01 === SessionStatus.Bearbeitbar)
            return "Bearbeitbar";
        if (this.Kategorie01 === SessionStatus.NurLesen)
            return "NurLesen";
        return "";
    }

    constructor(aPara: Session = {} as Session) {
        (this.Name = aPara.Name ? aPara.Name : "Day " + aPara.SessionNr.toString()),
        this.Datum = aPara.Datum;
        this.DauerInSek = aPara.DauerInSek;
        this.SessionNr = aPara.SessionNr;
        this.FK_Programm = aPara.FK_Programm;
        this.Expanded = aPara.Expanded ? aPara.Expanded : true;
        this.Kategorie01 = aPara.Kategorie01
            ? aPara.Kategorie01
            : SessionStatus.NurLesen;
    }

    public Copy(): Session {
        const mResult = new Session({
            SessionNr: this.SessionNr,
            UebungsListe: this.UebungsListe,
            Datum: this.Datum,
            DauerInSek: this.DauerInSek,
            FK_Programm: this.FK_Programm,
            Expanded: this.Expanded,
            Kategorie01: this.Kategorie01,
        } as Session);

        this.UebungsListe.forEach((mUebung_Sess) =>
            mResult.UebungsListe.push(mUebung_Sess.Copy())
        );

        return mResult;
    }
}
