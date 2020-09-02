import { JsonProperty } from "@peerlancers/json-serialization";

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
    @JsonProperty()
    public ID: number = 0 ;
    @JsonProperty()
    public Name: string = '';
    @JsonProperty()
    public Typ: UebungsTyp = UebungsTyp.Undefined;
    @JsonProperty()
    public Kategorieen01: Array<UebungsKategorie01> = [];
    @JsonProperty()
    public Kategorie02: string = '';

    constructor() { };

    public Copy(): IUebung {
        let mUebung = new Uebung();
        mUebung.ID = this.ID;
        mUebung.Name = this.Name;
        mUebung.Typ = this.Typ;
        mUebung.Kategorieen01 = [];
        mUebung.Kategorie02 = this.Kategorie02;
        this.Kategorieen01.forEach(val => mUebung.Kategorieen01.push(Object.assign({}, val)));
        return mUebung;
    }
}
