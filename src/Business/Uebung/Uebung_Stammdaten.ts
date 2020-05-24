import { JsonProperty } from '@peerlancers/json-serialization';

export enum UebungsTyp {
    Custom = 'Custom',
    Kraft = 'Kraft',
    Ausdauer = 'Ausdauer',
    Dehnung = 'Dehnung',
}

export enum UebungsKategorie01 {
    GzclpT1Cycle0 = 'GzclpT1Cycle0',
    GzclpT1Cycle1 = 'GzclpT1Cycle1',
    GzclpT1Cycle2 = 'GzclpT1Cycle2',
    GzclpT2Cycle0 = 'GzclpT2Cycle0',
    GzclpT2Cycle1 = 'GzclpT2Cycle1',
    GzclpT2Cycle2 = 'GzclpT2Cycle2',
}

export enum UebungsName {
    Squat = 'Squat',
    Deadlift = 'Deadlift',
    Benchpress = 'Benchpress',
    OverheadPress = 'OverheadPress',
    AB_Rollout = 'AB_Rollout',
    AB_Wheel = 'AB_Wheel',
    BackExtension = 'BackExtension',
    BarbellRow = 'BarbellRow',
    BentOverDumbbellRaise = 'BentOverDumbbellRaise',
    BlastStrapPushUp = 'BlastStrapPushUp',
    CableKickBacks = 'CableKickBacks',
    CablePushDown =  'CablePushDown',
    CableRow = 'CableRow',
    CalfRaises = 'CalfRaises',
    ChestSupportedRows = 'ChestSupportedRows',
    ChinUps = 'ChinUps',
    CloseGripBenchPress = 'CloseGripBenchPress',
    LatPullDowns = 'LatPulldowns',
    Dips = 'Dips'
}

export interface IStammUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie01>;
}

export class StammUebung implements IStammUebung {
    @JsonProperty()
    ID: number;
    @JsonProperty()
    Name: string;
    @JsonProperty()
    Typ: UebungsTyp;
    @JsonProperty()
    Kategorieen01: Array<UebungsKategorie01> = [];

    public static NeueStammUebung(
        aID: number,
        aName: string,
        aTyp: UebungsTyp,
        aKategorieen01: Array<UebungsKategorie01>): IStammUebung {
        //
        const mUebung = new StammUebung();
        mUebung.ID = aID;
        mUebung.Name = aName;
        mUebung.Typ = aTyp;
        mUebung.Kategorieen01 = aKategorieen01 ? aKategorieen01 : [];
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

 
}
