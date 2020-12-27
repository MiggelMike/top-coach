import { Satz,  SatzTyp, LiftTyp, SatzPausen, SatzStatus } from './../Satz/Satz';
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
    SatzListe: Array<Satz>;
    Copy(): Uebung;
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
    public SessionID: number = 0;
    public SatzListe: Array<Satz> = [];

    constructor() {}

    public Copy(): Uebung {
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

    public static StaticNeueUebung(
        aName: string,
        aTyp: UebungsTyp,
        aKategorieen01: Array<UebungsKategorie01>): Uebung {
        //
        const mUebung = new Uebung();
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01 ? aKategorieen01 : [];
        return mUebung;
    }

    public get AufwaermSatzListe(): Array<Satz> {
        const mResult = Array<Satz>();
        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Aufwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get ArbeitsSatzListe(): Array<Satz> {
        const mResult = Array<Satz>();
        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp === SatzTyp.Training) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get AbwaermSatzListe(): Array<Satz> {
        const mResult = Array<Satz>();
        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Abwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public NeuerSatz( 
        aSatzTyp: SatzTyp,
        aLiftTyp: LiftTyp,
        aWdhVorgabe: number,
        aProzent: number,
        aAmrap: boolean
    ): Satz {
        const mSatz = new Satz(
            { UebungID : this.ID,
              SatzTyp : aSatzTyp,
              Prozent : aProzent,
              WdhVorgabe : aWdhVorgabe,
              WdhAusgefuehrt : 0,
              GewichtVorgabe : 0,
              GewichtAusgefuehrt : 0,
              PausenMinZeit : SatzPausen.Standard_Min,
              PausenMaxZeit : SatzPausen.Standard_Max,
              Status : SatzStatus.Wartet,
              AMRAP : aAmrap
            } as Satz);
        mSatz.LiftTyp = aLiftTyp;
        return mSatz;
    }

}
