import { UebungsKategorie } from '../Uebung/Uebung_Stammdaten';

export enum SatzTyp {
    Aufwaermen = 'Aufwaermen',
    Training = 'Training',
    Abwaermen = 'Abwaermen',
}

export enum SatzKategorie {
    Vorlage = 'Vorlage',
    Training = 'Training'
}

export interface ISatz {
    ID: number;
    SessionID: number;
    UebungID: number;
    SatzTyp: SatzTyp;
    SatzKategorie: SatzKategorie;
    Prozent: number;
    GewichtAusgefuehrt: number;
    WdhAusgefuehrt: number;
    GewichtVorgabe: number;
    WdhVorgabe: number;
}

export class Satz implements ISatz {
    public ID: number;
    public SessionID: number;
    public UebungID: number;
    public SatzTyp: SatzTyp;
    public SatzKategorie: SatzKategorie;
    public Prozent: number;
    public GewichtAusgefuehrt: number;
    public WdhAusgefuehrt: number;
    public GewichtVorgabe: number;
    public WdhVorgabe: number;

    constructor(aPara: Satz = {} as Satz ) {
        this.SessionID = aPara.SessionID ? aPara.SessionID : 0;
        this.UebungID = aPara.UebungID ? aPara.UebungID : 0;
        this.SatzTyp = aPara.SatzTyp ? aPara.SatzTyp : SatzTyp.Aufwaermen;
        this.Prozent = aPara.Prozent ? aPara.Prozent : 0;
        this.WdhVorgabe = aPara.WdhVorgabe ? aPara.WdhVorgabe : 0;
        this.WdhAusgefuehrt = aPara.WdhAusgefuehrt ? aPara.WdhAusgefuehrt : 0;
        this.GewichtVorgabe = aPara.GewichtVorgabe ? aPara.GewichtVorgabe : 0;
        this.GewichtAusgefuehrt = aPara.GewichtAusgefuehrt ? aPara.GewichtAusgefuehrt : 0;
    }
}



