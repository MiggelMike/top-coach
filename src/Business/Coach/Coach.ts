
export enum GewichtsEinheit {
    KG,
    LBS
}

export enum DiaTyp {
    line,
    bar
} 

export interface IDiaTyp {
    diaTyp(): typeof DiaTyp;
}

export interface IAppData {
    id: number;
    GewichtsEinheit: GewichtsEinheit;
    GewichtsEinheitText: string;
    MaxHistorySessions: number;
    SprachID: number;
    // LetzteProgrammID: number;
    // LetzteSessionID: number;
    // LetzteSatzID: number;
    // Sessions: Array<ISession>;
    // TrainingsHistorie: Array<ISession>;
    // //AktuellesProgramm: AktuellesProgramm;
    // AktuelleSession: ISession;
}

export class AppData {
    public id: number;
    public SprachID: number = null;
    public DiaChartTyp: DiaTyp = DiaTyp.line;
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
