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
    public FK_Programm: number;
    public SessionNr: number;
    public Name: string;
    public Datum: Date;
    public DauerInSek: number;
    public Expanded: Boolean;
    public Kategorie01: SessionStatus;
    public Kategorie02: SessionStatus; 
    public Bearbeitbar: Boolean;
    get LiftedWeight(): number { return 0; };
    public GestartedWann: Date;
    public PauseInSek: number;
    public DauerFormatted: string;
    public SessionDauer: Zeitraum;
    public DauerTimer: any;
    get BodyWeight(): number { return 0; };
    public BodyWeightAtSessionStart: number;
    public UebungsListe: Array<Uebung> = new Array<Uebung>();
    public PausenListe: Array<Pause> = new Array<Pause>();

    constructor() {
        Object.defineProperty(this, "UebungsListe", { enumerable: false });
    }


}