import { cWeightDigits } from './../../app/services/dexie-svc.service';

export enum GewichtsEinheit {
    KG,
    LBS
}

export interface IAppData {
    ID: number;
    GewichtsEinheit: GewichtsEinheit;
    GewichtsEinheitText: string;
    MaxHistorySessions: number;
    // LetzteProgrammID: number;
    // LetzteSessionID: number;
    // LetzteSatzID: number;
    // Sessions: Array<ISession>;
    // TrainingsHistorie: Array<ISession>;
    // //AktuellesProgramm: AktuellesProgramm;
    // AktuelleSession: ISession;
}

export class AppData {
    public ID: number;
    GewichtsEinheit: GewichtsEinheit = GewichtsEinheit.KG;
    
    private fMaxHistorySessions: number = 10;
    get MaxHistorySessions(): number {
        if ((this.fMaxHistorySessions === Number.NaN)||(this.fMaxHistorySessions === undefined))
            this.fMaxHistorySessions = 10;
        return Number(this.fMaxHistorySessions);
    }

    set MaxHistorySessions(value: number) {
        this.fMaxHistorySessions = Number(value);
    }    


    get GewichtsEinheitText(): string{
        if (this.GewichtsEinheit === GewichtsEinheit.KG)
            return 'KG'
        else
            return 'LBS';
    }
    
    public static StaticConvertWeight(aWeight: number, aConvertTo: GewichtsEinheit): number {
        if (aConvertTo === GewichtsEinheit.KG)
            return aWeight / 2.20462;
        else
            return aWeight * 2.20462;
    }

    public static StaticRoundTo(aNumber: number, aDigits: number): number {
        return Number(parseFloat(aNumber.toString()).toFixed(aDigits));
    }

    // public LetzteProgrammID: number = 0;
    // public LetzteSessionID: number = 0;
    // public LetzteSatzID: number = 0;
    // public Sessions: Array<ISession> = [];
    // public TrainingsHistorie: Array<ISession> = [];
    // //public AktuellesProgramm = new AktuellesProgramm();
    // public AktuelleSession: ISession;
}
