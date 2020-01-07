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
    WdhAusgefuehrt: number;
}

export class Satz implements ISatz {
    public ID: number;
    public SessionID: number;
    public UebungID: number;
    public SatzTyp: SatzTyp;
    public static AddSatz(aSessionID: number, aUebungID: number, aSatzTyp: SatzTyp): ISatz {
        const mSatz = new Satz();
        mSatz.SessionID = aSessionID;
        mSatz.UebungID = aUebungID;
        mSatz.SatzTyp = aSatzTyp;
        return mSatz;
    }
}

export abstract class VorlageSatz extends Satz implements IVorlageSatz  {
    WdhVorgabe: number;
    GewichtVorgabe: number;
}

export abstract class TrainingsSatz extends VorlageSatz implements ITrainingsSatz  {
    public GewichtAusgefuehrt: number;
    public WdhAusgefuehrt: number;
    public GewichtVorgabe: number;
    public WdhVorgabe: number;
}




