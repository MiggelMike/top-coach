import { Sportler } from './Sportler/Sportler';
import { ISportler } from './Sportler/Sportler';
import { GzclpProgramm  } from '../Business/TrainingsProgramm/Gzclp';
import { ISession, SessionKategorie } from '../Business/Session/Session';
import { IStammUebung, StammUebung, UebungsTyp, UebungsKategorie01, UebungsName } from './Uebung/Uebung_Stammdaten';
import { TrainingsProgramm } from './TrainingsProgramm/TrainingsProgramm';

export enum SpeicherOrtTyp {
    Lokal = 'Lokal',
    Google = 'Google',
    Facebook = 'Facebook'
}

export enum ProgrammTyp {
    Ohne,
    Custom,
    Gzclp
}

export enum StorageItemTyp {
    LetzterSpeicherOrt,
    AktuellesProgramm,
    AppData
}

export class AktuellesProgramm {
    ProgrammTyp: ProgrammTyp;
    Programm: TrainingsProgramm;
}

export class AppDataMap {
    public Sessions: Array<ISession> = [];
    public Uebungen: Array<IStammUebung> = [];
    public AktuellesProgramm = new AktuellesProgramm();
}

export class AppData {
    public AktuellesProgramm = new AktuellesProgramm();
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
        localStorage.setItem(this.cAppData, JSON.stringify(this.Daten));
    }

    private LadeDatenFacebook() {
    }

    private SpeicherDatenFacebook() {
    }

    private LadeDatenGoogle() {
    }

    private SpeicherDatenGoogle() {
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

