import { Sportler } from './Sportler/Sportler';
import { ISportler } from './Sportler/Sportler';
import { Local } from 'protractor/built/driverProviders';
import { VirtualTimeScheduler } from 'rxjs';

enum SpeicherOrtTyp {
    Lokal = "Lokal",
    Google = "Google",
    Facebook = "Facebook"
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
    public LetzterSpeicherOrt: SpeicherOrtTyp = SpeicherOrtTyp.Lokal;
    public Sessions: Array<ISession> = [];
    public AktuellesProgramm: ProgrammTyp;
}

class AppData {
    public LetzterSpeicherOrt: SpeicherOrtTyp;
    public AktuellesProgramm: ProgrammTyp;
    public Daten: AppDataMap = new AppDataMap();
    private readonly cAppData: string = "AppData";

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

        this.LadeDaten();
    }

    public LadeDaten() {
        const d = localStorage.getItem(this.cAppData);
        if (d != undefined) {
            this.Daten = JSON.parse(d);
            switch (this.Daten.LetzterSpeicherOrt) {
                case SpeicherOrtTyp.Facebook:
                    this.LadeDatenFacebook();
                    break;

                case SpeicherOrtTyp.Google:
                    this.LadeDatenGoogle();
                    break;

                default:
                    this.LadeDatenLokal();
                    break;
            }
        }
    }

    private LadeDatenLokal() {
        let s = localStorage.getItem(this.cAppData);
        this.Daten = JSON.parse(s);
        this.Daten.LetzterSpeicherOrt = SpeicherOrtTyp.Lokal;
    }

    private SpeicherDatenLokal() {
        this.Daten.LetzterSpeicherOrt = SpeicherOrtTyp.Lokal;
    }

    private LadeDatenFacebook() {
        this.Daten.LetzterSpeicherOrt = SpeicherOrtTyp.Facebook;
    }

    private SpeicherDatenFacebook() {
        this.Daten.LetzterSpeicherOrt = SpeicherOrtTyp.Facebook;
    }

    private LadeDatenGoogle() {
        this.Daten.LetzterSpeicherOrt = SpeicherOrtTyp.Google;
    }

    private SpeicherDatenGoogle() {
        this.Daten.LetzterSpeicherOrt = SpeicherOrtTyp.Google;
    }

    public SpeicherDaten(aSpeicherort: SpeicherOrtTyp) {
        switch (this.Daten.LetzterSpeicherOrt) {
            case SpeicherOrtTyp.Facebook:
                this.SpeicherDatenFacebook();
                break;

            case SpeicherOrtTyp.Google:
                this.SpeicherDatenGoogle();
                break;

            default:
                this.SpeicherDatenLokal();
                break;
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
