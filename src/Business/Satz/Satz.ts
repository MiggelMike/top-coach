import { ISession } from 'src/Business/Session/Session';
import { IUebung, Uebung } from '../Uebung/Uebung';
import {formatNumber, NumberSymbol} from '@angular/common';
import { AppData, GewichtsEinheit } from '../Coach/Coach';
import { cWeightDigits } from 'src/app/services/dexie-svc.service';
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');


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
    Normal = 'Normal'
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
    ): Satz
}


export class GewichtDiff {
    private fGewicht: number = 0;
    get Gewicht(): number
    {
        return AppData.StaticRoundTo(this.fGewicht, cWeightDigits);
    }
    set Gewicht(value:number)
    {
        this.fGewicht = AppData.StaticRoundTo(value,cWeightDigits);
    }

    Uebung: Uebung;
    FromSet: Satz;

}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class SatzDB {
    public ID: number;
    public SessionID: number = 0;
    public UebungID: number = 0;
    public SatzTyp: SatzTyp = SatzTyp.Training;
    public Prozent: number = 0;
    public GewichtNaechsteSession: number = 0;
    public GewichtsEinheit: GewichtsEinheit = GewichtsEinheit.KG;
    public Datum: Date;
    public GewichtAusgefuehrt: number = 0;    
    public WdhAusgefuehrt: number = 0;
    public GewichtVorgabe: number = 0;
    public WdhVonVorgabe: number = 0;
    public WdhBisVorgabe: number = 0;
    public PausenMinZeit: number = 0;
    public PausenMaxZeit: number = 0;
    public Status: SatzStatus = SatzStatus.Wartet;
    public LiftTyp: LiftTyp = LiftTyp.Custom;
    public AMRAP: boolean = false;
    public SatzGruppenNr: number = 0;
    public SatzListIndex: number = 0;
    public IncludeBodyweight: boolean = false;
    public FkHantel: number = 0;
    public Vorgabe: boolean = false;

    constructor(aPara: Satz = {} as Satz) {
        this.SessionID = aPara.SessionID ? aPara.SessionID : 0;
        this.UebungID = aPara.UebungID ? aPara.UebungID : 0;
        this.SatzTyp = aPara.SatzTyp ? aPara.SatzTyp : SatzTyp.Aufwaermen;
        this.Prozent = aPara.Prozent ? aPara.Prozent : 0;
        this.WdhVonVorgabe = aPara.WdhVonVorgabe ? aPara.WdhVonVorgabe : 0;
        this.WdhAusgefuehrt = aPara.WdhAusgefuehrt ? aPara.WdhAusgefuehrt : 0;
        this.GewichtVorgabe = aPara.GewichtVorgabe ? aPara.GewichtVorgabe : 0;
        this.GewichtNaechsteSession = this.GewichtVorgabe;
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
}


// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Satz {
    public SatzDB: SatzDB = new SatzDB();
    public ID: number;
    public SessionID: number = 0;
    public UebungID: number = 0;
    public SatzTyp: SatzTyp = SatzTyp.Training;
    public Prozent: number = 0;
    public GewichtDiff: Array<GewichtDiff> = [];
    //#region GewichtNaechsteSession 
    private fGewichtNaechsteSession: number = 0;
    public GewichtsEinheit: GewichtsEinheit = GewichtsEinheit.KG;
    public Datum: Date;


    public static StaticCheckMembers(aSatz: Satz) {
        if (aSatz.GewichtsEinheit === undefined)
            aSatz.GewichtsEinheit = GewichtsEinheit.KG;
    }

    public PruefeGewichtsEinheit(aGewichtsEinheit: GewichtsEinheit) {
        Satz.StaticCheckMembers(this);
        if (aGewichtsEinheit !== this.GewichtsEinheit) {
            this.GewichtAusgefuehrt = AppData.StaticConvertWeight(this.GewichtAusgefuehrt, aGewichtsEinheit);
            this.GewichtVorgabe = AppData.StaticConvertWeight(this.GewichtVorgabe, aGewichtsEinheit);
            this.GewichtNaechsteSession = AppData.StaticConvertWeight(this.GewichtNaechsteSession, aGewichtsEinheit);
            this.GewichtDiff.forEach((mPtrDiff) => mPtrDiff.Gewicht = AppData.StaticConvertWeight(mPtrDiff.Gewicht, aGewichtsEinheit));
            this.GewichtsEinheit = aGewichtsEinheit;
        }
    }

    get GewichtNaechsteSession(): number{
        return Number(this.fGewichtNaechsteSession);
    }

    set GewichtNaechsteSession(aGewicht: number) {
        this.fGewichtNaechsteSession = AppData.StaticRoundTo(aGewicht, cWeightDigits);
    }
    //#endregion
    //#region GewichtAusgefuehrt 
    private fGewichtAusgefuehrt: number = 0;    
    get GewichtAusgefuehrt():number
    {
        return AppData.StaticRoundTo(this.fGewichtAusgefuehrt,cWeightDigits);
    }

    set GewichtAusgefuehrt(aValue: number)
    {
        this.fGewichtAusgefuehrt = AppData.StaticRoundTo(aValue,cWeightDigits);
    }
    //#endregion
    //#region WdhAusgefuehrt
    private fWdhAusgefuehrt: number = 0;
    get WdhAusgefuehrt(): number{
        return Number(this.fWdhAusgefuehrt);
    }

    set WdhAusgefuehrt(aValue: number){
        this.fWdhAusgefuehrt = Number(aValue);
    }
    //#endregion
    //#region GewichtVorgabe 
    private fGewichtVorgabe: number = 0;
    get GewichtVorgabe(): number {
        return AppData.StaticRoundTo(this.fGewichtVorgabe,cWeightDigits); 
    }
    
    set GewichtVorgabe(aValue: number) {
        this.fGewichtVorgabe = AppData.StaticRoundTo(aValue,cWeightDigits); 
    }
    //#endregion
    //#region WdhVonVorgabe
    private fWdhVonVorgabe: number = 0;
    get WdhVonVorgabe(): number {
        return Number(this.fWdhVonVorgabe);
    }

    set WdhVonVorgabe( aValue: number) {
        this.fWdhVonVorgabe = Number(aValue);
    }
    //#endregion
    //#region  WdhBisVorgabe
    private fWdhBisVorgabe: number = 0;
    get WdhBisVorgabe(): number {
        return Number(this.fWdhBisVorgabe);
    };

    set WdhBisVorgabe( aValue: number) { 
        this.fWdhBisVorgabe = Number(aValue);
    };
    //#endregion

    public PausenMinZeit: number = 0;
    public PausenMaxZeit: number = 0;
    public Status: SatzStatus = SatzStatus.Wartet;
    public LiftTyp: LiftTyp = LiftTyp.Custom;
    public AMRAP: boolean = false;
    public SatzGruppenNr: number = 0;
    public SatzListIndex: number = 0;
    public IncludeBodyweight: boolean = false;
    //#region BodyWeight
    private fBodyWeight: number = 0;
    get BodyWeight(): number {
        if (Number.isNaN(this.fBodyWeight) === true)
            this.fBodyWeight = 0;
        return AppData.StaticRoundTo(this.fBodyWeight, cWeightDigits);
    }
    set BodyWeight(aValue: number) {
        if (Number.isNaN(aValue) === true)
            this.fBodyWeight = 0;
        else
            this.fBodyWeight = Number(aValue);
    }
    //#endregion

    public FkHantel: number = 0;
    public Vorgabe: boolean = false;

    public get LiftedWeight(): number {
        if (this.Status === SatzStatus.Fertig) {
            let mResult: number = Number(this.WdhAusgefuehrt * this.GewichtAusgefuehrt);
            if (this.IncludeBodyweight) 
                mResult += this.WdhAusgefuehrt * this.BodyWeight;
            return AppData.StaticRoundTo(mResult, cWeightDigits);
        }
        return 0;
    }

    public get GewichtVorgabeStr(): string {
        return AppData.StaticRoundTo(this.GewichtVorgabe, cWeightDigits).toFixed(2);
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
        this.WdhVonVorgabe = aPara.WdhVonVorgabe ? aPara.WdhVonVorgabe : 0;
        this.WdhAusgefuehrt = aPara.WdhAusgefuehrt ? aPara.WdhAusgefuehrt : 0;
        this.GewichtVorgabe = aPara.GewichtVorgabe ? aPara.GewichtVorgabe : 0;
        this.GewichtNaechsteSession = this.GewichtVorgabe;
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
        Satz.StaticCheckMembers(this)

        // Nicht in Dexie-DB-Speichern -> enumerable: false        
        Object.defineProperty(this, "BodyWeight", { enumerable: false });
        Object.defineProperty(this, "GewichtDiff", { enumerable: false });
    }

    public isEqual(aCmpSatz: Satz): boolean{
        return isEqual(this, aCmpSatz);
        // if (this.ID != aCmpSatz.ID) return true;
        // if (this.LiftTyp != aCmpSatz.LiftTyp) return true;
        // if (this.PausenMaxZeit != aCmpSatz.PausenMaxZeit) return true;
        // if (this.PausenMinZeit != aCmpSatz.PausenMinZeit) return true;
        // if (this.Prozent != aCmpSatz.Prozent) return true;
        // if (this.SatzGruppenNr != aCmpSatz.SatzGruppenNr) return true;
        // if (this.SatzTyp != aCmpSatz.SatzTyp) return true;
        // if (this.SessionID != aCmpSatz.SessionID) return true;
        // if (this.Status != aCmpSatz.Status) return true;
        // if (this.UebungID != aCmpSatz.UebungID) return true;
        // if (this.WdhAusgefuehrt != aCmpSatz.WdhAusgefuehrt) return true;
        // if (this.WdhVonVorgabe != aCmpSatz.WdhVonVorgabe) return true;
        // if (this.GewichtVorgabe != aCmpSatz.GewichtVorgabe) return true;
        // if (this.GewichtAusgefuehrt != aCmpSatz.GewichtAusgefuehrt) return true;
        // if (this.AMRAP != aCmpSatz.AMRAP) return true;
        // return false;
    }

    public Copy(): Satz {
        return cloneDeep(this); 
    }

    public static NeuerSatz(
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVonVorgabe: number,
        aWdhBisVorgabe: number,
        aProzent: number,
        aSessionID: number,
        aUebungID: number,
        aAmrap: boolean
    ): Satz {
        const mSatz: Satz = new Satz();
        mSatz.SatzTyp = aSatzTyp;
        mSatz.LiftTyp = aLiftTyp;
        mSatz.WdhVonVorgabe = aWdhVonVorgabe;
        mSatz.WdhBisVorgabe = aWdhBisVorgabe;
        mSatz.Prozent = aProzent;
        mSatz.SessionID = aSessionID;
        mSatz.UebungID = aUebungID;
        mSatz.AMRAP = aAmrap;
        return mSatz;
    }

    public AddToDoneWeight(aDoneWeight: number) {
        // const tmp: number = Number.parseFloat(this.GewichtAusgefuehrt.toString());
        // const mDoneWeight: number = Number.parseFloat(aDoneWeight.toString());
        const tmp: number = Number(this.GewichtAusgefuehrt);
        const mDoneWeight: number = Number(aDoneWeight);
        this.GewichtAusgefuehrt = Number(tmp + mDoneWeight);
    }

    public SetPresetWeight(aPresetWeight: number) {
        // this.GewichtVorgabe = Number.parseFloat(aPresetWeight.toString());
        this.GewichtVorgabe = Number(aPresetWeight);
    }

}



