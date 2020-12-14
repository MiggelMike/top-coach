// import { AktuellesProgramm } from "./../../app/services/global.service";
import { ISession } from "./../Session/Session";

export interface IAppData {
    ID: number;
    LetzteProgrammID: number;
    LetzteSessionID: number;
    LetzteSatzID: number;
    Sessions: Array<ISession>;
    TrainingsHistorie: Array<ISession>;
    //AktuellesProgramm: AktuellesProgramm;
    AktuelleSession: ISession;
}

export class AppData {
    public ID: number = 0;
    public LetzteProgrammID: number = 0;
    public LetzteSessionID: number = 0;
    public LetzteSatzID: number = 0;
    public Sessions: Array<ISession> = [];
    public TrainingsHistorie: Array<ISession> = [];
    //public AktuellesProgramm = new AktuellesProgramm();
    public AktuelleSession: ISession;
}
