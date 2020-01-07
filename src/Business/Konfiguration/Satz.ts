export interface ISatz {
    ID: number;
    SessionID: number;
    UebungID: number;
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
    WdhVorgabe: number;
    GewichtVorgabe: number;
    ID: number;
    SessionID: number;
    UebungID: number;
}

export abstract class TrainingsSatz implements IVorlageSatz, ITrainingsSatz  {
    ID: number;
    SessionID: number;
    UebungID: number;
    GewichtAusgefuehrt: number;
    WdhVorgabe: number;
    GewichtVorgabe: number;
}




