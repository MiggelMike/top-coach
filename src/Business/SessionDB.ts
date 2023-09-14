import { DexieSvcService } from 'src/app/services/dexie-svc.service';
import { Zeitraum, MaxZeitraum } from './../Business/Dauer';
import { AppData, GewichtsEinheit } from './Coach/Coach';


export enum SessionStatus {
    NurLesen,
    Bearbeitbar,
    Wartet,
    Pause,
    Laueft,
    Fertig,
    FertigTimeOut,
    Loeschen
}

export interface ISessionStatus {
	get sessionStatus(): (typeof SessionStatus);
}


export class Pause extends Zeitraum {
    constructor(aVon: Date, aBis: Date) {
        super(aVon,aBis,new MaxZeitraum(99,59,59));
    }
}


export interface ISessionDB {
    ID: number;
    FK_Programm: number;
    FK_VorlageProgramm: number;
    SessionNr: number;
    ListenIndex: number;
    Name: string;
    Datum: Date;
    DauerInSek: number;
    Expanded: Boolean;
    Kategorie01: SessionStatus;
    Kategorie02: SessionStatus;
    Bearbeitbar: Boolean;
    GestartedWann: Date;
    PausenListe: Array<Pause>; 
    PauseInSek: number;
    DauerFormatted: string;
    SessionDauer: Zeitraum;
    DauerTimer: any;
    BodyWeightAtSessionStart: number;
    ProgressIsCalced: boolean;
    GewichtsEinheit: GewichtsEinheit;
    // PruefeGewichtsEinheit(aGewichtsEinheit: GewichtsEinheit);
}

export class SessionDB implements ISessionDB {
    public ID: number;
    public FK_Programm: number = 0;
    public FK_VorlageProgramm: number = 0;
    public ProgressIsCalced: boolean = false;
    public SessionNr: number = 0;
    public ListenIndex: number = 0;
    public Name: string = '';
    public Datum: Date = new Date();
    public DauerInSek: number = 0;
    public Expanded: Boolean = false;
    public Kategorie01: SessionStatus = SessionStatus.Bearbeitbar;
    public Kategorie02: SessionStatus = SessionStatus.Wartet;
    public Bearbeitbar: Boolean;
    public GestartedWann: Date;
    public PauseInSek: number = 0;
    public DauerFormatted: string = '';
    public SessionDauer: Zeitraum;
    public DauerTimer: any;

    public BodyWeightAtSessionStart: number = 0;
    public PausenListe: Array<Pause> = [];
    public GewichtsEinheit: GewichtsEinheit = GewichtsEinheit.KG;

    // constructor() {
    //     // Object.defineProperty(this, "UebungsListe", { enumerable: false });
    //     SessionDB.StaticCheckMembers(this);
    // }
    
    // public static StaticCheckMembers(aSessionDB: ISessionDB) {
    //     if (aSessionDB.GewichtsEinheit === undefined)
    //         aSessionDB.GewichtsEinheit = GewichtsEinheit.KG;
    
    //     if (aSessionDB.BodyWeightAtSessionStart === undefined)
    //         aSessionDB.BodyWeightAtSessionStart = 0;
    // }
}