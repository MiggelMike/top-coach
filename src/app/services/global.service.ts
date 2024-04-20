import { DexieSvcService } from './dexie-svc.service';
import { MyObserver } from './../../Observers/MyObservers';
import { ITrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { Injectable } from '@angular/core';
import { Sportler, ISportler } from '../../Business/Sportler/Sportler';
import { ISession } from '../../Business/Session/Session';
import { Uebung } from '../../Business/Uebung/Uebung';
import { Subscriber } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';
import { Satz } from 'src/Business/Satz/Satz';


export enum SpeicherOrtTyp {
    Lokal = 'Lokal',
    Google = 'Google',
    Facebook = 'Facebook'
}

export class BaseOverlayRef {
    constructor(private overlayRef: OverlayRef) { }
  
    close(): void {
        this.overlayRef.dispose();
        this.overlayRef = null;
    }
  }


export enum StorageItemTyp {
    LetzterSpeicherOrt,
    AktuellesProgramm,
    AppData
}

export class AppDataMap {
    public LetzteProgrammID: number = 0;
    public LetzteSessionID: number = 0;
    public LetzteSatzID: number = 0;
    public Sessions: Array<ISession> = [];
    // public Uebungen: Array<IStammUebung> = [];
    public TrainingsHistorie: Array<ISession> = [];
    // @JsonProperty()
    // public AktuellesProgramm = new AktuellesProgramm();
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
    public WorkoutCopy: ITrainingsProgramm = null;
    public SessionKopie: ISession = null;
    public SatzKopie: Satz = null;
    public SessUebungKopie: Uebung = null;
    public Observers: Array<any> = new Array<any>();
    public Comp03PanelUebungObserver: MyObserver = null;
    public DatabaseName: string = 'ConceptCoach';
    public static MediaWidth: number = window.innerWidth;
    public static MediaHeight: number = window.innerHeight;
    public static Toolbar_2_rows_width: number = 477;
    public static Toolbar_3_rows_width: number = 318;
    
    private readonly cAktuellesTrainingsProgramm: string = 'AktuellesTrainingsProgramm';
    private readonly cTrainingsHistorie: string = 'TrainingsHistorie';

    constructor(
        public fDbModule: DexieSvcService) {}

   
        // if (orientation === "landscape-primary") {
        //     console.log("That looks good.");
        //   } else if (orientation === "landscape-secondary") {
        //     console.log("Mmmh... the screen is upside down!");
        //   } else if (orientation === "portrait-secondary" || orientation === "portrait-primary") {
        //     console.log("Mmmh... you should rotate your device to landscape");
        //   } else if (orientation === undefined) {
        //     console.log("The orientation API isn't supported in this browser :(");
        //   }
    
    static calcToolbarRrows(): number {
        if (window.innerWidth <= GlobalService.Toolbar_3_rows_width)
            return 3;
        if (window.innerWidth <= GlobalService.Toolbar_2_rows_width)
            return 2;
        return 1;
    }

    
    Init(): void {
        this.Sportler = new Sportler();
      //  this.StandardVorlagen = this.aTrainingServiceModule.trainingsProgrammSvc.ErzeugeStandardVorlagen();
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


    // public LadeAnstehendeSession(): Observable<ISession[]> {
    //     const mResult = new Observable<ISession[]>(
    //         observer => {
    //             this.AnstehendeSessionObserver = observer;
    //             this.fDbModule.LadeProgramme(ProgrammKategorie.AktuellesProgramm);
    //             if ((this.fDbModule.AktuellesProgramm !== null) &&
    //                 (this.fDbModule.AktuellesProgramm !== undefined) &&
    //                 (this.fDbModule.AktuellesProgramm.SessionListe !== undefined)) {
    //                 // Es gibt anstehende Sessions.
    //                 // Jetzt muss geprüft werden, welche angezeigt werden. 
    //                 // Letzte Sessions laden.
    //                 if (this.LadeSessionHistorieLokal()) {
                        
    //                 } else {
    //                     observer.next(this.fDbModule.AktuellesProgramm.SessionListe);
    //                 }
    //             }
    //             else
    //                 observer. next([]);
                    
    //         }
    //     );
    //     return mResult; 
    // }

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

    //   //  localStorage.clear();
    //     const s = localStorage.getItem(this.cAktuellesTrainingsProgramm);
    //     if (s !== 'undefined') {
    //         const mParseResult = JSON.parse(s);
    //         if (mParseResult !== null)
    //             this.Daten.AktuellesProgramm.Programm = mParseResult;
//        }

  //      this.LadeSessionHistorieLokal();

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
        } else {
            this.Daten.LetzteSessionID = 0;
        }
        return this.Daten.LetzteSessionID;
    }

    private SpeicherDatenLokal() {
        if (DexieSvcService.AktuellesProgramm !== undefined) {
            this.fDbModule.ProgrammSpeichern(DexieSvcService.AktuellesProgramm);
            // Aktuelles Trainingsprogramm
            // let mStoreData = serialize(this.fDB.AktuellesProgramm);
            // localStorage.setItem(this.cAktuellesTrainingsProgramm, JSON.stringify(mStoreData));
            // // TrainingsHistorie 
            // mStoreData = serialize(this.Daten.TrainingsHistorie);
            // localStorage.setItem(this.cTrainingsHistorie, JSON.stringify(mStoreData));
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
}

// export const GlobalData = new GlobalService();
// GlobalData.ErzeugeStandardVorlagen();

