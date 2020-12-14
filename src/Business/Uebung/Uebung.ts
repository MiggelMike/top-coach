import { ISatz } from './../Satz/Satz';
export enum UebungsTyp {
    Undefined = "Undefined",
    Custom = "Custom",
    Kraft = "Kraft",
    Ausdauer = "Ausdauer",
    Dehnung = "Dehnung",
}

export enum UebungsKategorie01 {
    GzclpT1Cycle0 = "GzclpT1Cycle0",
    GzclpT1Cycle1 = "GzclpT1Cycle1",
    GzclpT1Cycle2 = "GzclpT1Cycle2",
    GzclpT2Cycle0 = "GzclpT2Cycle0",
    GzclpT2Cycle1 = "GzclpT2Cycle1",
    GzclpT2Cycle2 = "GzclpT2Cycle2",
}

export interface IUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie01>;
    Kategorie02: string;
    SessionID: number;
    SatzListe: Array<ISatz>;
    Copy(): IUebung;
}

export enum UebungsName {
    Squat = "Squat",
    Deadlift = "Deadlift",
    Benchpress = "Benchpress",
    OverheadPress = "OverheadPress",
    AB_Rollout = "AB_Rollout",
    AB_Wheel = "AB_Wheel",
    BackExtension = "BackExtension",
    BarbellRow = "BarbellRow",
    BentOverDumbbellRaise = "BentOverDumbbellRaise",
    BlastStrapPushUp = "BlastStrapPushUp",
    CableKickBacks = "CableKickBacks",
    CablePushDown = "CablePushDown",
    CableRow = "CableRow",
    CalfRaises = "CalfRaises",
    ChestSupportedRows = "ChestSupportedRows",
    ChinUps = "ChinUps",
    CloseGripBenchPress = "CloseGripBenchPress",
    LatPullDowns = "LatPulldowns",
    Dips = "Dips",
}

export class Uebung implements IUebung {
    public ID: number;
    public Name: string = "";
    public Typ: UebungsTyp = UebungsTyp.Undefined;
    public Kategorieen01: Array<UebungsKategorie01> = [];
    public Kategorie02: string = "";
    public SessionID: number;
    public SatzListe: Array<ISatz> = [];

    constructor() {}

    public Copy(): IUebung {
        let mUebung = new Uebung();
        mUebung.Name = this.Name;
        mUebung.Typ = this.Typ;
        mUebung.Kategorieen01 = [];
        mUebung.Kategorie02 = this.Kategorie02;
        this.Kategorieen01.forEach((val) =>
            mUebung.Kategorieen01.push(Object.assign({}, val))
        );
        mUebung.SessionID = this.SessionID;
        this.SatzListe.forEach( 
            s => mUebung.SatzListe.push(Object.assign({}, s))
        )
        mUebung.SatzListe
        return mUebung;
    }

    public static ErzeugeGzclpKategorieen01(): Array<UebungsKategorie01> {
        return new Array<UebungsKategorie01>(
            UebungsKategorie01.GzclpT1Cycle0,
            UebungsKategorie01.GzclpT1Cycle1,
            UebungsKategorie01.GzclpT1Cycle2,
            UebungsKategorie01.GzclpT2Cycle0,
            UebungsKategorie01.GzclpT2Cycle1,
            UebungsKategorie01.GzclpT2Cycle2,
        );
    }

    public static StaticNeueStammUebung(
        aName: string,
        aTyp: UebungsTyp,
        aKategorieen01: Array<UebungsKategorie01>): IUebung {
        //
        const mUebung = new Uebung();
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01 ? aKategorieen01 : [];
        return mUebung;
    }

}
