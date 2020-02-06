import { Injectable } from '@angular/core';
import { Sportler, ISportler } from '../../Business/Sportler/Sportler';
import { GzclpProgramm  } from '../../Business/TrainingsProgramm/Gzclp';
import { ISession  } from '../../Business/Session/Session';
import { IStammUebung, StammUebung, UebungsTyp, UebungsKategorie01, UebungsName } from '../../Business/Uebung/Uebung_Stammdaten';
import { TrainingsProgramm, ITrainingsProgramm, ProgrammKategorie } from '../../Business/TrainingsProgramm/TrainingsProgramm';
import { TrainingsProgrammSvc } from './trainings-programm-svc.service';
import { DialogeService } from './dialoge.service';

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
    Programm: ITrainingsProgramm;
}

export class AppDataMap {
    public Sessions: Array<ISession> = [];
    public Uebungen: Array<IStammUebung> = [];
    public AktuellesProgramm = new AktuellesProgramm();
}



@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    public Sportler: Sportler;
    public StandardVorlagen = new Array<ITrainingsProgramm>();
    // public AktuellesProgramm = new AktuellesProgramm();
    public Daten: AppDataMap = new AppDataMap();
    private readonly cAppData: string = 'AppData';

    constructor(private fTrainingsProgrammSvc: TrainingsProgrammSvc, private fDialogeService: DialogeService) {
        this.LadeDaten(SpeicherOrtTyp.Lokal);
        if (this.Daten.Uebungen.length === 0) {
            this.ErzeugeUebungStammdaten();
            this.SpeicherDaten(SpeicherOrtTyp.Lokal);
        }
        this.Init();
        this.Sportler.ID = this.LadeSportler();
        if (this.Sportler.ID > 0) {
        }
    }

    Init(): void {
        this.Sportler = new Sportler();
        this.ErzeugeStandardVorlagen();
    }

    ErzeugeStandardVorlagen(): void {
        const mGzclpProgramm = new GzclpProgramm(this, ProgrammKategorie.Vorlage);
        mGzclpProgramm.Name = 'GZCLP - Standard';
        const mSessions = new Array<ISession>();
        mGzclpProgramm.Init(mSessions);
        this.StandardVorlagen.push(mGzclpProgramm);
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

    SetzeAktuellesProgramm(aAktuellesProgramm: ITrainingsProgramm): void {
        this.Daten.AktuellesProgramm.Programm = aAktuellesProgramm.ErstelleProgrammAusVorlage();
        this.SpeicherDaten(SpeicherOrtTyp.Lokal);
        // aAktuellesProgramm. ErzeugeKonkretesProgrammAusVorlage
        // this.AppData.AktuellesProgramm.Programm = new
        // let y = aAktuellesProgramm;
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

// export const GlobalData = new GlobalService();
// GlobalData.ErzeugeStandardVorlagen();

