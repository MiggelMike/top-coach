import { Sportler } from './Sportler/Sportler';
import { ISportler } from './Sportler/Sportler';
import { Local } from 'protractor/built/driverProviders';
import { VirtualTimeScheduler } from 'rxjs';

enum SpeicherOrtTyp {
    Lokal,
    Google,
    Facebook
}

enum ProgrammTyp {
    Ohne,
    Custom,
    Gzclp
}

enum StorageItemTyp {
    LetzterSpeicherOrt,
    AktuellesProgramm,
    AppData
}

class AppDataMap {
    public LetzterSpeicherOrt: SpeicherOrtTyp;
    public Sessions: Array<ISession> = [];
    public AktuellesProgramm: ProgrammTyp;
}

class AppData {
    public LetzterSpeicherOrt: SpeicherOrtTyp;
    public AktuellesProgramm: ProgrammTyp;
    public readonly Daten: AppDataMap = new AppDataMap();
    readonly cAppData: string = "AppData";

    constructor() {
        // LetzterSpeicherOrt
        // let x = SpeicherOrtTyp[localStorage.getItem(StorageItemTyp.LetzterSpeicherOrt.toString())];
        // if (x === undefined) {
        //     this.LetzterSpeicherOrt = SpeicherOrtTyp.Lokal;
        //     localStorage.setItem(StorageItemTyp.LetzterSpeicherOrt.toString(), this.LetzterSpeicherOrt.toString());
        // } else {
        //     this.LetzterSpeicherOrt = SpeicherOrtTyp[localStorage.getItem(StorageItemTyp.LetzterSpeicherOrt.toString())];
        // }

        // // AktuellesProgramm
        // x = ProgrammTyp[localStorage.getItem(StorageItemTyp.AktuellesProgramm.toString())];
        // if (x === undefined) {
        //     this.AktuellesProgramm = ProgrammTyp.Ohne;
        //     localStorage.setItem(StorageItemTyp.AktuellesProgramm.toString(), this.AktuellesProgramm.toString());
        // } else {
        //     this.AktuellesProgramm = ProgrammTyp[localStorage.getItem(StorageItemTyp.AktuellesProgramm.toString())];
        // }

        localStorage.clear();
        // let s = JSON.stringify(this.Daten);
        // localStorage.setItem(this.cAppData, s);
        // let s1 = localStorage.getItem(this.cAppData);
        // this.Daten = JSON.parse(s);
        this.LadeDaten();
    }

    public LadeDaten(){
        const d = localStorage.getItem(this.cAppData);
        if(d != undefined){
            this.Daten = JSON.parse(d);
        }

    }
}

export class Applikation {
    public Sportler: Sportler;
    public AppData: AppData;

    constructor() {
        this.AppData = new AppData();
        this.Init();
        this.Sportler.ID = this.LadeSportler();
        if (this.Sportler.ID > 0) {
        }
    }

    Init(): void {
        this.Sportler = new Sportler();
    }

    ProgrammWaehlen(): void {
        const mInfo: Array<string> = [];
        if (this.PruefungVorProgrammWahl(mInfo)) {
            this.Sportler.Reset();
        }
    }

    PruefungVorProgrammWahl(aInfo: Array<string>): boolean {
        return true;
    }

    LadeSportler(): number {
        const s = localStorage.getItem('SportlerID');
        return (s === null) || (s.length === 0) ? 0 : Number(s);
    }
}
