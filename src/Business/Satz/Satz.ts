import { ISession } from 'src/Business/Session/Session';
import { IUebung } from '../Uebung/Uebung';
import {formatNumber} from '@angular/common';
var cloneDeep = require('lodash.clonedeep');


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
    ID: number;
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
    IncludeBodyweight: boolean;
    BodyWeight: number;
    Copy(): Satz;
    hasChanged(aCmpSatz: ISatz): Boolean;
}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Satz implements ISatz {
    public ID: number;
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
    public IncludeBodyweight: boolean = false;
    public BodyWeight: number = 0;

    public get LiftedWeight(): number {
        if (this.Status === SatzStatus.Fertig) {
            let mResult: number = this.WdhAusgefuehrt * this.GewichtAusgefuehrt;
            if (this.IncludeBodyweight) 
                mResult += this.WdhAusgefuehrt * this.BodyWeight;
            return mResult;
        }
        return 0;
    }

    get fGewichtVorgabe(): string {
        if (this.GewichtVorgabe === 0)
            return "0.00";
        return this.GewichtVorgabe.toPrecision(2);
    }

    public getBodyWeightText(aPrefix?: string): string {
        if (this.IncludeBodyweight === false)
            return '';
        
        let mResult = formatNumber(this.BodyWeight, 'en-US', '2.2-2');
        if (aPrefix)
            mResult = aPrefix + mResult;
        return mResult;
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
        this.BodyWeight = aPara.BodyWeight ? aPara.BodyWeight : 0;

        // Nicht in Dexie-DB-Speichern -> enumerable: false        
        Object.defineProperty(this, "BodyWeight", { enumerable: false });
    }

    public hasChanged(aCmpSatz: ISatz): Boolean{
        if (this.ID != aCmpSatz.ID) return true;
        if (this.LiftTyp != aCmpSatz.LiftTyp) return true;
        if (this.PausenMaxZeit != aCmpSatz.PausenMaxZeit) return true;
        if (this.PausenMinZeit != aCmpSatz.PausenMinZeit) return true;
        if (this.Prozent != aCmpSatz.Prozent) return true;
        if (this.SatzGruppenNr != aCmpSatz.SatzGruppenNr) return true;
        if (this.SatzTyp != aCmpSatz.SatzTyp) return true;
        if (this.SessionID != aCmpSatz.SessionID) return true;
        if (this.Status != aCmpSatz.Status) return true;
        if (this.UebungID != aCmpSatz.UebungID) return true;
        if (this.WdhAusgefuehrt != aCmpSatz.WdhAusgefuehrt) return true;
        if (this.WdhVorgabe != aCmpSatz.WdhVorgabe) return true;
        if (this.GewichtVorgabe != aCmpSatz.GewichtVorgabe) return true;
        if (this.GewichtAusgefuehrt != aCmpSatz.GewichtAusgefuehrt) return true;
        if (this.AMRAP != aCmpSatz.AMRAP) return true;
        return false;
    }

    public Copy(): Satz {
        return cloneDeep(this); 
    }

    public static NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVorgabe: number,
        aProzent: number,
        aSessionID: number,
        aUebungID: number,
        aAmrap: boolean
    ): Satz {
        const mSatz: Satz = new Satz();
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



