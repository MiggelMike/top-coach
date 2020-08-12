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

export interface IUebung {
    ID: number;
    Name: string;
    Typ: UebungsTyp;
    Kategorieen01: Array<UebungsKategorie01>;
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

export class Uebung implements IUebung {
    @JsonProperty()
    ID: number;
    @JsonProperty()
    Name: string;
    @JsonProperty()
    Typ: UebungsTyp;
    @JsonProperty()
    Kategorieen01: Array<UebungsKategorie01> = [];
}
