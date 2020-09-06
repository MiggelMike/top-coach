import { Uebung_Sess, IUebung_Sess } from "./../Uebung/Uebung_Sess";
import { IUebung } from "../Uebung/Uebung";
import { JsonProperty } from "@peerlancers/json-serialization";

export enum SessionStatus {
    NurLesen,
    Bearbeitbar,
}

export interface ISession {
    ID: number;
    FK_Programm: number;
    TagNr: number;
    Name: string;
    UebungsListe: Array<IUebung_Sess>;
    Datum: Date;
    DauerInSek: number;
    Expanded: Boolean;
    Kategorie01: SessionStatus;
    Bearbeitbar: Boolean;
    Copy(): ISession;
    NeueUebung(aUebung: IUebung): IUebung_Sess;
    getKategorie01(): string;
}

export class Session implements ISession {
    @JsonProperty()
    public ID: number;
    @JsonProperty()
    public FK_Programm: number;
    @JsonProperty()
    public TagNr: number;
    @JsonProperty()
    public Name: string;
    @JsonProperty()
    public UebungsListe: Array<IUebung_Sess> = new Array<Uebung_Sess>();
    @JsonProperty()
    public Datum: Date;
    @JsonProperty()
    public DauerInSek: number;
    public Expanded: Boolean;
    public Kategorie01: SessionStatus;
    public Bearbeitbar: Boolean = false;

    public getKategorie01(): string {
        if (this.Kategorie01 === SessionStatus.Bearbeitbar)
            return "Bearbeitbar";
        if (this.Kategorie01 === SessionStatus.NurLesen) return "NurLesen";
        return "";
    }

    public NeueUebung(aUebung: IUebung): IUebung_Sess {
        const mUebung_Sess = new Uebung_Sess(this,aUebung);
        return mUebung_Sess;
    }

    constructor(aPara: Session = {} as Session) {
        this.ID = aPara.ID;
        (this.Name = aPara.Name ? aPara.Name : "Day " + aPara.TagNr.toString()),
            (this.Datum = aPara.Datum);
        this.DauerInSek = aPara.DauerInSek;
        this.TagNr = aPara.TagNr;
        this.FK_Programm = aPara.FK_Programm;
        this.Expanded = aPara.Expanded ? aPara.Expanded : true;
        this.Kategorie01 = aPara.Kategorie01
            ? aPara.Kategorie01
            : SessionStatus.NurLesen;
    }

    public Copy(): ISession {
        const mResult = new Session({
            ID: this.ID,
            TagNr: this.TagNr,
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
