import { Satz, ISatz, SatzTyp, LiftTyp, SatzPausen, SatzStatus } from './../Satz/Satz';

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

export enum UebungsKategorie02 {
    Stamm, Session
}

export interface IUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie01>;
    Kategorie02: UebungsKategorie02;
    SessionID: number;
    SatzListe: Array<Satz>;
    Copy(): Uebung;
    hasChanged(aCmpUebung: IUebung): Boolean;
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

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Uebung implements IUebung {
    public ID: number;
    public Name: string = "";
    public Typ: UebungsTyp = UebungsTyp.Undefined;
    public Kategorieen01: Array<UebungsKategorie01> = [];
    public Kategorie02: UebungsKategorie02 = UebungsKategorie02.Stamm;
    public SessionID: number = 0;
    public SatzListe: Array<Satz> = [];

    constructor() {
       Object.defineProperty(this, 'SatzListe', { enumerable: false });
    } 

    public hasChanged(aCmpUebung: IUebung): Boolean {
        if (this.ID != aCmpUebung.ID) return true;
        if (this.Kategorie02 != aCmpUebung.Kategorie02) return true;
        if (this.Kategorieen01 != aCmpUebung.Kategorieen01) return true;
        if (this.Name != aCmpUebung.Name) return true;
        if (this.Typ != aCmpUebung.Typ) return true;

        if ((this.SatzListe) && (aCmpUebung.SatzListe)) {
            if (this.SatzListe.length != aCmpUebung.SatzListe.length)
                return true;
            
            for (let index = 0; index < this.SatzListe.length; index++) {
                if (this.SatzListe[index].hasChanged(aCmpUebung.SatzListe[index])) {
                    console.log('Set #' + index.toString() + ' has changed.');
                    return true;
                }
                
            }
        }

        return false;
    }

    public Copy(): Uebung {
        const mResult: Uebung = Object.assign({}, this);
        mResult.SatzListe = new Array<Satz>();
        if (this.SatzListe) {
            for (let index = 0; index < this.SatzListe.length; index++) {
                mResult.SatzListe.push(this.SatzListe[index].Copy());
            }
        }
        return mResult;
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
        aKategorieen01: Array<UebungsKategorie01>,
        aKategorie02: UebungsKategorie02
        ): Uebung {
        //
        const mUebung = new Uebung();
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01 ? aKategorieen01 : [];
        mUebung.Kategorie02 = aKategorie02;
        return mUebung;
    }

    public get AufwaermSatzListe(): Array<Satz> {
        const mResult = new Array<Satz>();
        if (!this.SatzListe)
            return mResult;
        
        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp == SatzTyp.Aufwaermen) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get ArbeitsSatzListe(): Array<Satz> {
        const mResult = new Array<Satz>();
        if (!this.SatzListe)
            return mResult;
        
        this.SatzListe.forEach((mSatz) => {
            if (mSatz.SatzTyp === SatzTyp.Training) {
                mResult.push(mSatz);
            }
        });
        return mResult;
    }

    public get AbwaermSatzListe(): Array<Satz> {
        const mResult = new Array<Satz>();
        if (!this.SatzListe)
            return mResult;

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

    public static StaticKopiere(aUebung: Uebung, aKategorie02: UebungsKategorie02): Uebung {
        return Uebung.StaticNeueUebung(
            aUebung.Name,
            aUebung.Typ,
            aUebung.Kategorieen01,
            aKategorie02
        );
    }

}


