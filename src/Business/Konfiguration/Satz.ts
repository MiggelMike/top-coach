export enum SatzTyp {
    Aufwaermen,
    Training,
    Abwaermen,
}

export interface ISatz {
    ID: number;
    SessionID: number;
    UebungID: number;
    SatzTyp: SatzTyp;
}

export interface IVorlageSatz extends ISatz {
    WdhVorgabe: number;
    GewichtVorgabe: number;
}

export interface ITrainingsSatz extends ISatz {
    GewichtAusgefuehrt: number;
    GewichtVorgabe: number;
}

export abstract class VorlageSatz implements IVorlageSatz  {
    ID: number;
    SessionID: number;
    UebungID: number;
    SatzTyp: SatzTyp;
    WdhVorgabe: number;
    GewichtVorgabe: number;
}

export abstract class TrainingsSatz implements IVorlageSatz, ITrainingsSatz  {
    ID: number;
    SessionID: number;
    UebungID: number;
    SatzTyp: SatzTyp;
    GewichtAusgefuehrt: number;
    WdhVorgabe: number;
    GewichtVorgabe: number;
}




