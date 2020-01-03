interface ISatz{
    ID: number;
    SessionID: number;
    UebungID: number;
    WdhAusgefuehrt: number;
    WdhVorgabe: number;
    GewichtAusgefuehrt: number;
    GewichtVorgabe: number;
    AddUebung(aUebungID: number): void;
}

abstract class Satz implements ISatz  {
    ID: number;
    SessionID: number;
    UebungID: number;
    WdhAusgefuehrt: number;
    WdhVorgabe: number;
    GewichtAusgefuehrt: number;
    GewichtVorgabe: number;
    AddUebung(aUebungID: number): void {
        this.UebungID = aUebungID;
    }
}


