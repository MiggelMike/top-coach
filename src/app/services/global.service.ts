import { TrainingsProgrammSvc } from './trainings-programm-svc.service';
import { UebungService } from './uebung.service';
import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Injectable } from '@angular/core';
import { Sportler, ISportler } from '../../Business/Sportler/Sportler';
// import { GzclpProgramm  } from '../../Business/TrainingsProgramm/Gzclp';
import { ISession } from '../../Business/Session/Session';
import { IStammUebung } from '../../Business/Uebung/Uebung_Stammdaten';
import { Observable, of, from } from 'rxjs';
import { JsonProperty, deserialize, serialize } from '@peerlancers/json-serialization';

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
    @JsonProperty()
    ProgrammTyp: ProgrammTyp;
    @JsonProperty()
    Programm: ITrainingsProgramm;
}

export class AppDataMap {
    public Sessions: Array<ISession> = [];
    // public Uebungen: Array<IStammUebung> = [];
    @JsonProperty()
    public AktuellesProgramm = new AktuellesProgramm();
}



@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    public Sportler: Sportler;
    public AnstehendeSessionObserver;
    public StandardVorlagen = new Array<ITrainingsProgramm>();
    // public AktuellesProgramm = new AktuellesProgramm();
    public Daten: AppDataMap = new AppDataMap();
    // private readonly cAppData: string = 'AppData';
    private readonly cAktuellesTrainingsProgramm: string = 'AktuellesTrainingsProgramm';


    constructor(private fUebungService: UebungService, private fTrainingsProgrammSvc: TrainingsProgrammSvc) {
        this.LadeDaten(SpeicherOrtTyp.Lokal);
        if (this.fUebungService.Uebungen.length === 0) {
            this.fUebungService.ErzeugeUebungStammdaten();
            this.SpeicherDaten(SpeicherOrtTyp.Lokal);
        }
        this.Init();
        this.Sportler.ID = this.LadeSportler();
        if (this.Sportler.ID > 0) {
        }
    }

    Init(): void {
        this.Sportler = new Sportler();
        this.StandardVorlagen = this.fTrainingsProgrammSvc.ErzeugeStandardVorlagen();
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
    }

    public LadeAnstehendeSession(): Observable<ISession[]> {
        const mResult = new Observable<ISession[]>(
            observer => {
                this.AnstehendeSessionObserver = observer;
                if ((this.Daten.AktuellesProgramm.Programm !== null) &&
                    (this.Daten.AktuellesProgramm.Programm !== undefined) &&
                    (this.Daten.AktuellesProgramm.Programm.SessionListe !== undefined))
                    observer.next(this.Daten.AktuellesProgramm.Programm.SessionListe);
                else
                    observer.next([]);
            }
        );
        return mResult;
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
        const s = localStorage.getItem(this.cAktuellesTrainingsProgramm);
        if (s !== 'undefined') {
            const mProgramm = JSON.parse(s);
            if (mProgramm !== null)
                this.Daten.AktuellesProgramm.Programm = mProgramm;
        }
        // if (s !== '{}') {
        //     const m = new AppDataMap();
        //     this.Daten = deserialize(AppDataMap, AppDataMap);
        //     // this.Daten = JSON.parse(s);
        // }
    }

    private SpeicherDatenLokal() {
        if (this.Daten.AktuellesProgramm.Programm !== undefined) {
            let mStoreData = serialize(this.Daten.AktuellesProgramm.Programm);
            localStorage.setItem(this.cAktuellesTrainingsProgramm, JSON.stringify(mStoreData));
        }
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

    public Kopiere(aUebung: IStammUebung): IStammUebung {
        return this.fUebungService.Kopiere(aUebung);
    }


}

// export const GlobalData = new GlobalService();
// GlobalData.ErzeugeStandardVorlagen();

