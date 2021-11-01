import { Zeitraum, MaxZeitraum } from './../Business/Dauer';
import { Uebung } from 'src/Business/Uebung/Uebung';

export enum SessionStatus {
    NurLesen,
    Bearbeitbar,
    Wartet,
    Pause,
    Laueft,
    Fertig,
    FertigTimeOut
}

export class Pause extends Zeitraum {
    constructor(aVon: Date, aBis: Date) {
        super(aVon,aBis,new MaxZeitraum(99,59,59));
    }
}


export interface ISessionDB {
    ID: number;
    FK_Programm: number;
    SessionNr: number;
    Name: string;
    Datum: Date;
    DauerInSek: number;
    Expanded: Boolean;
    Kategorie01: SessionStatus;
    Kategorie02: SessionStatus; 
    Bearbeitbar: Boolean;
    LiftedWeight: number;
    GestartedWann: Date;
    PausenListe: Array<Pause>; 
    PauseInSek: number;
    DauerFormatted: string;
    SessionDauer: Zeitraum;
    DauerTimer: any;
    BodyWeight: number;
    BodyWeightAtSessionStart: number;
    UebungsListe: Array<Uebung>;
}

export class SessionDB implements ISessionDB {
    public ID: number;
    FK_Programm: number;
    SessionNr: number;
    Name: string;
    Datum: Date;
    DauerInSek: number;
    Expanded: Boolean;
    Kategorie01: SessionStatus;
    Kategorie02: SessionStatus; 
    Bearbeitbar: Boolean;
    get LiftedWeight(): number { return 0; };
    GestartedWann: Date;
    PauseInSek: number;
    DauerFormatted: string;
    SessionDauer: Zeitraum;
    DauerTimer: any;
    get BodyWeight(): number { return 0; };
    BodyWeightAtSessionStart: number;
    UebungsListe: Array<Uebung> = new Array<Uebung>();
    PausenListe: Array<Pause> = new Array<Pause>();
}