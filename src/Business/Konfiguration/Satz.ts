import { UebungsKategorie01 } from '../Uebung/Uebung_Stammdaten';

export enum SatzTyp {
    Aufwaermen = 'Aufwaermen',
    Training = 'Training',
    Abwaermen = 'Abwaermen',
}

export enum SatzKategorie {
    Vorlage = 'Vorlage',
    Training = 'Training'
}

export enum SatzStatus {
    Wartet = 'Wartet',
    Laeuft = 'Läuft',
    Pause = 'Pause',
    Fertig = 'Fertig'
}

export enum SatzPausen {
    Standard_Min = 60,
    Standard_Max = 60,
    GzClpT1_Min = 180,
    GzClpT1_Max = 300,
    GzClpT2_Min = 120,
    GzClpT2_Max = 180,
    GzClpT3_Min = 60,
    GzClpT3_Max = 90,
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
    PausenMinZeit: number;
    PausenMaxZeit: number;
    Status: SatzStatus;
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
    public PausenMinZeit: number;
    public PausenMaxZeit: number;
    public Status: SatzStatus;

    constructor(aPara: Satz = {} as Satz ) {
        this.SessionID = aPara.SessionID ? aPara.SessionID : 0;
        this.UebungID = aPara.UebungID ? aPara.UebungID : 0;
        this.SatzTyp = aPara.SatzTyp ? aPara.SatzTyp : SatzTyp.Aufwaermen;
        this.Prozent = aPara.Prozent ? aPara.Prozent : 0;
        this.WdhVorgabe = aPara.WdhVorgabe ? aPara.WdhVorgabe : 0;
        this.WdhAusgefuehrt = aPara.WdhAusgefuehrt ? aPara.WdhAusgefuehrt : 0;
        this.GewichtVorgabe = aPara.GewichtVorgabe ? aPara.GewichtVorgabe : 0;
        this.GewichtAusgefuehrt = aPara.GewichtAusgefuehrt ? aPara.GewichtAusgefuehrt : 0;
        this.PausenMinZeit = aPara.PausenMinZeit ? aPara.PausenMinZeit : SatzPausen.Standard_Min;
        this.PausenMaxZeit = aPara.PausenMaxZeit ? aPara.PausenMaxZeit : SatzPausen.Standard_Max;
        this.Status = aPara.Status ? aPara.Status : SatzStatus.Wartet;
    }
}



