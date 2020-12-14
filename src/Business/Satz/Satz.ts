import { ISession } from 'src/Business/Session/Session';
import { IUebung } from '../Uebung/Uebung';
import { getMatIconFailedToSanitizeLiteralError } from '@angular/material';

export enum SatzTyp {
    Aufwaermen = 'Aufwaermen',
    Training = 'Training',
    Abwaermen = 'Abwaermen',
}

export enum LiftTyp {
    NoLift = 'NoLift',
    Custom = 'Custom',
    GzClpT1 = 'GzClpT1',
    GzClpT2 = 'GzClpT2',
    GzClpT3 = 'GzClpT3',
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

export interface INeuerSatz {
    NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVorgabe: number,
        aProzent: number,
        aSession: ISession,
        aUebung: IUebung,
        aAmrap: boolean
    ): ISatz
}

export interface ISatz {
    SessionID: number;
    UebungID: number;
    SatzTyp: SatzTyp;
    SatzGruppenNr: number;
    Prozent: number;
    GewichtAusgefuehrt: number;
    WdhAusgefuehrt: number;
    GewichtVorgabe: number;
    // getGewichtVorgabe(): string;
    WdhVorgabe: number;
    PausenMinZeit: number;
    PausenMaxZeit: number;
    Status: SatzStatus;
    LiftTyp: LiftTyp;
    AMRAP: boolean;
    Copy(): ISatz;
}

export class Satz implements ISatz {
    public SessionID: number = 0;
    public UebungID: number = 0;
    public SatzTyp: SatzTyp = SatzTyp.Training;
    public Prozent: number = 0;
    public GewichtAusgefuehrt: number;
    public WdhAusgefuehrt: number = 0;
    public GewichtVorgabe: number = 0;
    public WdhVorgabe: number = 0;
    public PausenMinZeit: number = 0;
    public PausenMaxZeit: number = 0;
    public Status: SatzStatus = SatzStatus.Wartet;
    public LiftTyp: LiftTyp = LiftTyp.Custom;
    public AMRAP: boolean = false;
    public SatzGruppenNr: number = 0;

    get fGewichtVorgabe(): string {
        if (this.GewichtVorgabe === 0) return "0.00";
        return this.GewichtVorgabe.toPrecision(2);
    }

    set fGewichtVorgabe(value: string) {
        this.GewichtVorgabe = 100;
    }

    constructor(aPara: Satz = {} as Satz) {
        this.SessionID = aPara.SessionID ? aPara.SessionID : 0;
        this.UebungID = aPara.UebungID ? aPara.UebungID : 0;
        this.SatzTyp = aPara.SatzTyp ? aPara.SatzTyp : SatzTyp.Aufwaermen;
        this.Prozent = aPara.Prozent ? aPara.Prozent : 0;
        this.WdhVorgabe = aPara.WdhVorgabe ? aPara.WdhVorgabe : 0;
        this.WdhAusgefuehrt = aPara.WdhAusgefuehrt ? aPara.WdhAusgefuehrt : 0;
        this.GewichtVorgabe = aPara.GewichtVorgabe ? aPara.GewichtVorgabe : 0;
        this.GewichtAusgefuehrt = aPara.GewichtAusgefuehrt
            ? aPara.GewichtAusgefuehrt
            : 0;
        this.PausenMinZeit = aPara.PausenMinZeit
            ? aPara.PausenMinZeit
            : SatzPausen.Standard_Min;
        this.PausenMaxZeit = aPara.PausenMaxZeit
            ? aPara.PausenMaxZeit
            : SatzPausen.Standard_Max;
        this.Status = aPara.Status ? aPara.Status : SatzStatus.Wartet;
        this.AMRAP = aPara.AMRAP ? aPara.AMRAP : false;
    }

    public Copy(): ISatz {
        const mResult = new Satz();
        mResult.LiftTyp = this.LiftTyp;
        mResult.AMRAP = this.AMRAP;
        mResult.PausenMaxZeit = this.PausenMaxZeit;
        mResult.PausenMinZeit = this.PausenMinZeit;
        mResult.Prozent = this.Prozent;
        mResult.SatzTyp = this.SatzTyp;
        mResult.SessionID = this.SessionID;
        mResult.Status = this.Status;
        mResult.UebungID = this.UebungID;
        mResult.WdhAusgefuehrt = this.WdhAusgefuehrt;
        mResult.WdhVorgabe = this.WdhVorgabe;
        mResult.GewichtVorgabe = this.GewichtVorgabe;
        mResult.GewichtAusgefuehrt = this.GewichtAusgefuehrt;
        return mResult;
    }

    public static NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVorgabe: number,
        aProzent: number,
        aSessionID: number,
        aUebungID: number,
        aAmrap: boolean
    ): ISatz {
        const mSatz: ISatz = new Satz();
        mSatz.SatzTyp = aSatzTyp;
        mSatz.LiftTyp = aLiftTyp;
        mSatz.WdhVorgabe = aWdhVorgabe;
        mSatz.Prozent = aProzent;
        mSatz.SessionID = aSessionID;
        mSatz.UebungID = aUebungID;
        mSatz.AMRAP = aAmrap;
        return mSatz;
    }
}



