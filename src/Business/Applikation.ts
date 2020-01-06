import { Sportler } from './Sportler/Sportler';
import { ISportler } from './Sportler/Sportler';
import { Local } from 'protractor/built/driverProviders';
// import { VirtualTimeScheduler } from 'rxjs';

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
    AktuellesProgramm
}



class AppData {
    public LetzterSpeicherOrt: SpeicherOrtTyp;
    public AktuellesProgramm: ProgrammTyp;

    constructor() {
        // LetzterSpeicherOrt
        let x = SpeicherOrtTyp[localStorage.getItem(StorageItemTyp.LetzterSpeicherOrt.toString())];
        if (x === undefined) {
            this.LetzterSpeicherOrt = SpeicherOrtTyp.Lokal;
            localStorage.setItem(StorageItemTyp.LetzterSpeicherOrt.toString(), this.LetzterSpeicherOrt.toString());
        } else {
            this.LetzterSpeicherOrt = SpeicherOrtTyp[localStorage.getItem(StorageItemTyp.LetzterSpeicherOrt.toString())];
        }

        // AktuellesProgramm
        x = ProgrammTyp[localStorage.getItem(StorageItemTyp.AktuellesProgramm.toString())];
        if (x === undefined) {
            this.AktuellesProgramm = ProgrammTyp.Ohne;
            localStorage.setItem(StorageItemTyp.AktuellesProgramm.toString(), this.AktuellesProgramm.toString());
        } else {
            this.AktuellesProgramm = ProgrammTyp[localStorage.getItem(StorageItemTyp.AktuellesProgramm.toString())];
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
