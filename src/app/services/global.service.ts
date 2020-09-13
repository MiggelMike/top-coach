import { ISatz } from './../../Business/Satz/Satz';
import { UebungService } from './uebung.service';
import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { TrainingServiceModule } from '../../modules/training-service.module'
import { NgModule, Injectable,  Optional, SkipSelf  } from '@angular/core';
import { Sportler, ISportler } from '../../Business/Sportler/Sportler';
// import { GzclpProgramm  } from '../../Business/TrainingsProgramm/Gzclp';
import { ISession } from '../../Business/Session/Session';
import { IUebung } from '../../Business/Uebung/Uebung';
import { Observable, of, from, Subscriber } from 'rxjs';
import { JsonProperty, serialize } from '@peerlancers/json-serialization';


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
    @JsonProperty()
    public LetzteProgrammID: number = 0;
    @JsonProperty()
    public LetzteSessionID: number = 0;
    @JsonProperty()
    public LetzteSatzID: number = 0;
    @JsonProperty()
    public Sessions: Array<ISession> = [];
    // public Uebungen: Array<IStammUebung> = [];
    @JsonProperty()
    public TrainingsHistorie: Array<ISession> = [];
    @JsonProperty()
    public AktuellesProgramm = new AktuellesProgramm();
    @JsonProperty()
    public AktuelleSession: ISession;
}


@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    public Sportler: Sportler;
    public AnstehendeSessionObserver: Subscriber<ISession[]>;
    public StandardVorlagen = new Array<ITrainingsProgramm>();
    public EditWorkout: ITrainingsProgramm;
    public Daten: AppDataMap = new AppDataMap();
    public DB: any;
    public WorkoutCopy: ITrainingsProgramm = null;
    public SessionCopy: ISession = null;
    public SatzKopie: ISatz = null;


    private readonly cAktuellesTrainingsProgramm: string = 'AktuellesTrainingsProgramm';
    private readonly cTrainingsHistorie: string = 'TrainingsHistorie';


    constructor(private fUebungService: UebungService, private aTrainingServiceModule: TrainingServiceModule) {
        
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
        this.StandardVorlagen = this.aTrainingServiceModule.trainingsProgrammSvc.ErzeugeStandardVorlagen();
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
        this.Daten.AktuellesProgramm.Programm = aAktuellesProgramm.ErstelleSessionsAusVorlage();
        this.SpeicherDaten(SpeicherOrtTyp.Lokal);
    }

    public LadeAnstehendeSession(): Observable<ISession[]> {
        const mResult = new Observable<ISession[]>(
            observer => {
                this.AnstehendeSessionObserver = observer;
                if ((this.Daten.AktuellesProgramm.Programm !== null) &&
                    (this.Daten.AktuellesProgramm.Programm !== undefined) &&
                    (this.Daten.AktuellesProgramm.Programm.SessionListe !== undefined)) {
                    // Es gibt anstehende Sessions.
                    // Jetzt muss geprüft werden, welche angezeigt werden. 
                    // Letzte Sessions laden.
                    if (this.LadeSessionHistorieLokal()) {
                        
                    } else {
                        observer.next(this.Daten.AktuellesProgramm.Programm.SessionListe);
                    }
                }
                else
                    observer. next([]);
                    
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
      //  localStorage.clear();
        const s = localStorage.getItem(this.cAktuellesTrainingsProgramm);
        if (s !== 'undefined') {
            const mParseResult = JSON.parse(s);
            if (mParseResult !== null)
                this.Daten.AktuellesProgramm.Programm = mParseResult;
        }

        this.LadeSessionHistorieLokal();

        // if (s !== '{}') {
        //     const m = new AppDataMap();
        //     this.Daten = deserialize(AppDataMap, AppDataMap);
        //     // this.Daten = JSON.parse(s);
        // }
    }

    private LadeSessionHistorieLokal(): Boolean {
        let s = localStorage.getItem(this.cTrainingsHistorie);
        if (s !== 'undefined') {
            const mParseResult = JSON.parse(s);
            if ((mParseResult !== null) && (Array.isArray(mParseResult))) {
                this.Daten.TrainingsHistorie = mParseResult;
                return ((this.Daten.TrainingsHistorie !== undefined) && (this.Daten.TrainingsHistorie.length > 0));
            }
        }
        return false;
    }

    private LadeLetzteSessionIdLokal(): number {
        if (this.LadeSessionHistorieLokal()) {
            const mSession = this.Daten.TrainingsHistorie[this.Daten.TrainingsHistorie.length - 1] as ISession;
            this.Daten.LetzteSessionID = mSession.ID;
        } else {
            this.Daten.LetzteSessionID = 0;
        }
        return this.Daten.LetzteSessionID;
    }

    private SpeicherDatenLokal() {
        if (this.Daten.AktuellesProgramm.Programm !== undefined) {
            // Aktuelles Trainingsprogramm 
            let mStoreData = serialize(this.Daten.AktuellesProgramm.Programm);
            localStorage.setItem(this.cAktuellesTrainingsProgramm, JSON.stringify(mStoreData));
            // TrainingsHistorie 
            mStoreData = serialize(this.Daten.TrainingsHistorie);
            localStorage.setItem(this.cTrainingsHistorie, JSON.stringify(mStoreData));
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

    public Kopiere(aUebung: IUebung): IUebung {
        return this.fUebungService.Kopiere(aUebung);
    }


}

// export const GlobalData = new GlobalService();
// GlobalData.ErzeugeStandardVorlagen();

