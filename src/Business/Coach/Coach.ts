export enum GewichtsEinheit {
    KG,
    LBS
}

export interface IAppData {
    ID: number;
    GewichtsEinheit: GewichtsEinheit;
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
    // public LetzteProgrammID: number = 0;
    // public LetzteSessionID: number = 0;
    // public LetzteSatzID: number = 0;
    // public Sessions: Array<ISession> = [];
    // public TrainingsHistorie: Array<ISession> = [];
    // //public AktuellesProgramm = new AktuellesProgramm();
    // public AktuelleSession: ISession;
}
