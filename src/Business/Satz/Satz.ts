import { ISession } from 'src/Business/Session/Session';
import { Uebung } from '../Uebung/Uebung';
import {formatNumber, NumberSymbol} from '@angular/common';
import { AppData, GewichtsEinheit } from '../Coach/Coach';
import { cWeightDigits } from 'src/app/services/dexie-svc.service';
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');


export enum SatzTyp {
    Aufwaermen = 'Warm up sets',
    Training = 'Work sets',
    Abkuehlen = 'Cool down sets'
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
        aUebung: Uebung,
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

export interface ISatz{
    ID: number;
    SessionID: number;
    UebungID: number;
    SatzTyp: SatzTyp;
    Prozent: number;
    GewichtNaechsteSession: number;
    GewichtsEinheit: GewichtsEinheit;
    Datum: Date;
    GewichtAusgefuehrt: number;    
    WdhAusgefuehrt: number;
    GewichtVorgabe: number;
    WdhVonVorgabe: number;
    WdhBisVorgabe: number;
    PausenMinZeit: number;
    PausenMaxZeit: number;
    Status: SatzStatus;
    LiftTyp: LiftTyp;
    AMRAP: boolean;
    SatzGruppenNr: number;
    SatzListIndex: number;
    IncludeBodyweight: boolean;
    FkHantel: number;
    Vorgabe: boolean;
    BodyWeight: number;
}

export class SatzDB implements ISatz {
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
    public BodyWeight: number = 0;

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
        Satz.StaticCheckMembers(this);
    }
}


// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Satz implements ISatz {
    public SatzDB: SatzDB = new SatzDB();
    //#region ID
    get ID(): number {
        return this.SatzDB.ID;
    }

    set ID(aValue: number) {
        this.SatzDB.ID = aValue;
    }
    //#endregion
    //#region SessionID 
    get SessionID(): number{
        return this.SatzDB.SessionID;
    }
    
    set SessionID(aValue: number) {
        this.SatzDB.SessionID = aValue;
    }
    //#endregion
    //#region UebungID 
    get UebungID(): number{
        return this.SatzDB.UebungID;
    }
    
    set UebungID(aValue: number) {
        this.SatzDB.UebungID = aValue;
    }
    //#endregion    
    //#region SatzTyp 
    get SatzTyp(): SatzTyp{
        return this.SatzDB.SatzTyp;
    }
    
    set SatzTyp(aValue: SatzTyp) {
        this.SatzDB.SatzTyp = aValue;
    }
    //#endregion     
    //#region Prozent 
    get Prozent(): number{
        return this.SatzDB.Prozent;
    }
    
    set Prozent(aValue: number) {
        this.SatzDB.Prozent = aValue;
    }
    //#endregion     
    //#region GewichtsEinheit
    get GewichtsEinheit(): GewichtsEinheit {
        return this.SatzDB.GewichtsEinheit;
    }

    set GewichtsEinheit(aValue: GewichtsEinheit) {
        this.SatzDB.GewichtsEinheit = aValue;
    }
    //#endregion GewichtsEinheit
    //#region GewichtNaechsteSession 
    get GewichtNaechsteSession(): number {
        return this.SatzDB.GewichtNaechsteSession;
    }

    set GewichtNaechsteSession(aGewicht: number) {
        this.SatzDB.GewichtNaechsteSession = AppData.StaticRoundTo(aGewicht, cWeightDigits);
    }
    //#endregion
    //#region Datum 
    get Datum(): Date {
        return this.SatzDB.Datum;
    }

    set Datum(aValue: Date) {
        this.SatzDB.Datum = aValue;
    }
    //#endregion
    //#region GewichtAusgefuehrt 
    get GewichtAusgefuehrt():number
    {
        return AppData.StaticRoundTo(this.SatzDB.GewichtAusgefuehrt,cWeightDigits);
    }

    set GewichtAusgefuehrt(aValue: number)
    {
        this.SatzDB.GewichtAusgefuehrt = AppData.StaticRoundTo(aValue,cWeightDigits);
    }
    //#endregion
    //#region WdhAusgefuehrt
    get WdhAusgefuehrt(): number{
        return Number(this.SatzDB.WdhAusgefuehrt);
    }

    set WdhAusgefuehrt(aValue: number){
        this.SatzDB.WdhAusgefuehrt = Number(aValue);
    }
    //#endregion
    //#region GewichtVorgabe 
    get GewichtVorgabe(): number {
        return AppData.StaticRoundTo(this.SatzDB.GewichtVorgabe,cWeightDigits); 
    }
    
    set GewichtVorgabe(aValue: number) {
        this.SatzDB.GewichtVorgabe = AppData.StaticRoundTo(aValue,cWeightDigits); 
    }
    //#endregion
    //#region WdhVonVorgabe
    get WdhVonVorgabe(): number {
        return Number(this.SatzDB.WdhVonVorgabe);
    }

    set WdhVonVorgabe( aValue: number) {
        this.SatzDB.WdhVonVorgabe = Number(aValue);
    }
    //#endregion
    //#region WdhBisVorgabe
    get WdhBisVorgabe(): number {
        return Number(this.SatzDB.WdhBisVorgabe);
    };

    set WdhBisVorgabe( aValue: number) { 
        this.SatzDB.WdhBisVorgabe = Number(aValue);
    };
    //#endregion
    //#region PausenMinZeit
    get PausenMinZeit(): number {
        return this.SatzDB.PausenMinZeit;
    }

    set PausenMinZeit( aValue: number) {
        this.SatzDB.PausenMinZeit = aValue;
    }
    //#endregion
    //#region PausenMaxZeit
    get PausenMaxZeit(): number{
        return this.SatzDB.PausenMaxZeit;
    }

    set PausenMaxZeit(aValue: number){
        this.SatzDB.PausenMaxZeit = aValue;
    }
    //#endregion
    //#region Status
    get Status(): SatzStatus {
        return this.SatzDB.Status;
    }

    set Status( aValue: SatzStatus) {
        this.SatzDB.Status = aValue;
    }
    //#endregion
    //#region LiftTyp
    get LiftTyp(): LiftTyp{
        return this.SatzDB.LiftTyp;
    }

    set LiftTyp(aValue: LiftTyp) {
        this.SatzDB.LiftTyp = aValue;
    }
    //#endregion
    //#region AMRAP
    get AMRAP():boolean {
        return this.SatzDB.AMRAP
    };

    set AMRAP(aValue: boolean) {
        this.SatzDB.AMRAP = aValue;
    };
    //#endregion
    //#region SatzGruppenNr   
    get SatzGruppenNr(): number {
        return this.SatzDB.SatzGruppenNr;
    }

    set SatzGruppenNr(aValue: number) {
        this.SatzDB.SatzGruppenNr = aValue;
    }
    //#endregion
    //#region SatzListIndex
    get SatzListIndex(): number{
        return this.SatzDB.SatzListIndex;
    }

    set SatzListIndex(aValue: number) {
        this.SatzDB.SatzListIndex = aValue;
    }
    //#endregion
    //#region IncludeBodyweight 
    get IncludeBodyweight(): boolean{
        return this.SatzDB.IncludeBodyweight;
    }

    set IncludeBodyweight(aValue: boolean){
        this.SatzDB.IncludeBodyweight = aValue;
    }
    //#endregion
    //#region BodyWeight
    get BodyWeight(): number {
        if (Number.isNaN(this.SatzDB.BodyWeight) === true)
            this.SatzDB.BodyWeight = 0;
        return AppData.StaticRoundTo(this.SatzDB.BodyWeight, cWeightDigits);
    }
    set BodyWeight(aValue: number) {
        if (Number.isNaN(aValue) === true)
            this.SatzDB.BodyWeight = 0;
        else
            this.SatzDB.BodyWeight = Number(aValue);
    }
    //#endregion
    //#region FkHantel
    get FkHantel(): number {
        return this.SatzDB.FkHantel;
    }

    set FkHantel(aValue: number) {
        this.SatzDB.FkHantel = aValue;
    }
    //#endregion
    //#region Vorgabe
    get Vorgabe(): boolean{
        return this.SatzDB.Vorgabe;
    }

    set Vorgabe(aValue: boolean) {
        this.SatzDB.Vorgabe = aValue;
    }
    //#endregion


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

    public GewichtDiff: Array<GewichtDiff> = [];

    public static StaticCheckMembers(aSatz: SatzDB) {
        if (aSatz.GewichtsEinheit === undefined)
            aSatz.GewichtsEinheit = GewichtsEinheit.KG;
    }

    public PruefeGewichtsEinheit(aGewichtsEinheit: GewichtsEinheit) {
        Satz.StaticCheckMembers(this.SatzDB);
        if (aGewichtsEinheit !== this.GewichtsEinheit) {
            this.GewichtAusgefuehrt = AppData.StaticConvertWeight(this.GewichtAusgefuehrt, aGewichtsEinheit);
            this.GewichtVorgabe = AppData.StaticConvertWeight(this.GewichtVorgabe, aGewichtsEinheit);
            this.GewichtNaechsteSession = AppData.StaticConvertWeight(this.GewichtNaechsteSession, aGewichtsEinheit);
            this.GewichtDiff.forEach((mPtrDiff) => mPtrDiff.Gewicht = AppData.StaticConvertWeight(mPtrDiff.Gewicht, aGewichtsEinheit));
            this.GewichtsEinheit = aGewichtsEinheit;
        }
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
    }

    public isEqual(aCmpSatz: Satz): boolean{
        return isEqual(this.SatzDB, aCmpSatz.SatzDB);
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



