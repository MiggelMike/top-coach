import { Sportler } from './Sportler/Sportler';
import { ISportler } from './Sportler/Sportler';
import { GzclpProgramm  } from '../Business/TrainingsProgramm/Gzclp';
import { ISession, SessionKategorie } from '../Business/Session/Session';
import { IStammUebung, StammUebung, UebungsTyp, UebungsKategorie01, UebungsName } from './Uebung/Uebung_Stammdaten';


enum SpeicherOrtTyp {
    Lokal = 'Lokal',
    Google = 'Google',
    Facebook = 'Facebook'
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

export class AppDataMap {
    public Sessions: Array<ISession> = [];
    public Uebungen: Array<IStammUebung> = [];
    public AktuellesProgramm: ProgrammTyp;
}

class AppData {
    public LetzterSpeicherOrt: SpeicherOrtTyp;
    public AktuellesProgramm: ProgrammTyp;
    public Daten: AppDataMap = new AppDataMap();
    private readonly cAppData: string = 'AppData';

    constructor() {
        this.LadeDaten(SpeicherOrtTyp.Lokal);
        if (this.Daten.Uebungen.length === 0) {
            this.ErzeugeUebungStammdaten();
            this.SpeicherDaten(SpeicherOrtTyp.Lokal);
        }
    }

    public SucheUebungPerName(aName: UebungsName ): StammUebung {
        return this.Daten.Uebungen.find( u => u.Name = aName);
    }

    public ErzeugeUebungStammdaten() {
        const mKategorieen01 = [];
        const mGzclpKategorieen01 = StammUebung.ErzeugeGzclpKategorieen01();
        for (const mUeb in UebungsName) {
            if (mUeb) {
                this.Daten.Uebungen.push(StammUebung.NeueStammUebung(
                    this.Daten.Uebungen.length + 1,
                    mUeb,
                    UebungsTyp.Kraft,
                    mKategorieen01.concat(mGzclpKategorieen01)));
            }
        }
    }

    private EvalLetztenSpeicherOrt() {
        // LetzterSpeicherOrt
        const x = SpeicherOrtTyp[localStorage.getItem(StorageItemTyp.LetzterSpeicherOrt.toString())];
        if (x === undefined) {
            this.LetzterSpeicherOrt = SpeicherOrtTyp.Lokal;
            localStorage.setItem(StorageItemTyp.LetzterSpeicherOrt.toString(), this.LetzterSpeicherOrt.toString());
        } else {
            this.LetzterSpeicherOrt = SpeicherOrtTyp[localStorage.getItem(StorageItemTyp.LetzterSpeicherOrt.toString())];
        }
    }

    public LadeDaten(aSpeicherort: SpeicherOrtTyp) {
        switch (aSpeicherort) {
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

        if (!this.Daten) {
            this.Daten = new AppDataMap();
        }
    }

    private LadeDatenLokal() {
        const s = localStorage.getItem(this.cAppData);
        this.Daten = JSON.parse(s);
    }

    private SpeicherDatenLokal() {
        localStorage.setItem(StorageItemTyp.LetzterSpeicherOrt.toString(), this.LetzterSpeicherOrt.toString());
        localStorage.setItem(this.cAppData, JSON.stringify(this.Daten));
        this.LetzterSpeicherOrt = SpeicherOrtTyp.Lokal;
    }

    private LadeDatenFacebook() {
    }

    private SpeicherDatenFacebook() {
        this.LetzterSpeicherOrt = SpeicherOrtTyp.Facebook;
    }

    private LadeDatenGoogle() {
    }

    private SpeicherDatenGoogle() {
        this.LetzterSpeicherOrt = SpeicherOrtTyp.Google;
    }

    public SpeicherDaten(aSpeicherort: SpeicherOrtTyp) {
        switch (aSpeicherort) {
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
        this.ProgrammWaehlen();
    }

    Init(): void {
        this.Sportler = new Sportler();
    }

    ProgrammWaehlen(): void {
        const mInfo: Array<string> = [];
        if (this.PruefungVorProgrammWahl(mInfo)) {
            this.Sportler.Reset();
            const mGzclpProgramm = new GzclpProgramm(SessionKategorie.Konkret, this);
            const mSessions = new Array<ISession>();
            mGzclpProgramm.Init(mSessions);
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
