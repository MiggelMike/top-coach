import { SessionDB, Pause, ISessionDB, SessionStatus } from './../SessionDB';
import { Zeitraum, MaxZeitraum } from './../Dauer';
import { Uebung, UebungsKategorie02 } from 'src/Business/Uebung/Uebung';

var cloneDeep = require('lodash.clonedeep');

export interface ISession extends ISessionDB {
    StarteDauerTimer(): void;
    SetSessionFertig();
    AddPause(): void;
    CalcDauer(): void;
    CalcPause(): void;
    Copy(): Session;
    addUebung(aUebung: Uebung);
    hasChanged(aCmpSession: ISessionDB): Boolean;
    resetSession(aQuellSession: ISessionDB): void;
    init(): void;
}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Session extends SessionDB implements ISession {

    public override get BodyWeight(): number {
        // if (this.BodyWeightAtSessionStart === 0) {
        //     this.BodyWeightAtSessionStart = new DexieSvcService(null).getBodyWeight();
        // }
        return this.BodyWeightAtSessionStart;
    }

    public init(): void {
        this.PausenListe = [];
        this.Kategorie02 = SessionStatus.Wartet;
    }


    public CalcDauer(): void {
        if ((this.Kategorie02 === SessionStatus.Fertig) || (this.Kategorie02 === SessionStatus.FertigTimeOut)) {
            clearInterval(this.DauerTimer);
            return;
        }
            
        const mDauer = Zeitraum.CalcDauer(this.GestartedWann, new Date());
        const mPause = this.CalcPause();
        const mDauerMinusPause = mDauer - mPause;
        if (mDauerMinusPause >= this.SessionDauer.MaxDauer) {
            this.DauerFormatted = Zeitraum.FormatDauer(this.SessionDauer.MaxDauer);
            this.Kategorie02 = SessionStatus.FertigTimeOut;
        }
        else
            this.DauerFormatted = Zeitraum.FormatDauer(mDauerMinusPause);
    }

    public CalcPause(): number {
        let mPauseInSek = 0;
        
        this.PausenListe.forEach(p => {
            mPauseInSek += Zeitraum.CalcDauer(p.Von, p.Bis);
        });
        return mPauseInSek;
    }
    
    public StarteDauerTimer(): void {
        if (this.PausenListe === undefined)
            this.PausenListe = new Array<Pause>();
        
        if (   (this.PausenListe.length > 0)
            && (this.Kategorie02 === SessionStatus.Pause)) {
                this.PausenListe[this.PausenListe.length-1].Bis = new Date();
        }
        this.Kategorie02 = SessionStatus.Laueft;
        this.DauerTimer = setInterval(() => this.CalcDauer(), 450);
    }

    public SetSessionFertig(): void {
        clearInterval(this.DauerTimer);
        this.Kategorie02 = SessionStatus.Fertig;
    }

    public AddPause(): void {
        clearInterval(this.DauerTimer);
        this.Kategorie02 = SessionStatus.Pause;
        const mJetzt = new Date();
        this.PausenListe.push(new Pause(mJetzt, mJetzt));
    }

    public override get LiftedWeight():number {
        let mResult: number = 0;
        // this.UebungsListe.forEach(u => mResult + u.LiftedWeight);

        for (let index = 0; index < this.UebungsListe.length; index++) {
            const mUebung = this.UebungsListe[index];
            mResult = mResult + mUebung.LiftedWeight;
        }
        return mResult;
    }

    constructor() {
        super();
        const mJetzt = new Date();
        this.SessionDauer = new Zeitraum(mJetzt,mJetzt, new MaxZeitraum(99,59,59));
    }
    
    public Copy(): Session {
        return cloneDeep(this);
        // for (let index = 0; index < mResult.UebungsListe.length; index++) {
        //     const mEineUebung = mResult.UebungsListe[index].Copy();
        //     mEineUebung.ID = undefined;
        // }
        // return mResult;
    }

    public addUebung(aUebung: Uebung) {
        aUebung.Kategorie02 = UebungsKategorie02.Session;
        this.UebungsListe.push(aUebung);
    }

    public hasChanged(aCmpSession: ISessionDB): Boolean {
        if (aCmpSession.ID != this.ID) return true;
        if (aCmpSession.Datum != this.Datum) return true;
        if (aCmpSession.DauerInSek != this.DauerInSek) return true;
        if (aCmpSession.FK_Programm != this.FK_Programm) return true;
        if (aCmpSession.Kategorie01 != this.Kategorie01) return true;
        if (aCmpSession.Name != this.Name) return true;
        if (aCmpSession.SessionNr != this.SessionNr) return true;    
        
        if ((aCmpSession.UebungsListe) && (this.UebungsListe)) {
            if (aCmpSession.UebungsListe.length != this.UebungsListe.length)
                return true;

            if (this.UebungsListe) {
                for (let index = 0; index < this.UebungsListe.length; index++) {
                    if (this.UebungsListe[index].hasChanged === undefined)
                        break;
                    
                    if (this.UebungsListe[index].hasChanged(aCmpSession.UebungsListe[index])) {
                        console.log('Exercise #' + index.toString() + ' has changed.');
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public resetSession(aQuellSession: ISessionDB):void {
        const mUebungsListe: Array<Uebung> = new Array<Uebung>();
        this.UebungsListe.forEach(u => mUebungsListe.push(u.Copy()));
        this.UebungsListe = [];

        this.Datum = aQuellSession.Datum;
        this.DauerInSek = aQuellSession.DauerInSek;
        this.Expanded = aQuellSession.Expanded;
        this.FK_Programm = aQuellSession.FK_Programm;
        this.GestartedWann = aQuellSession.GestartedWann;
        this.ID = aQuellSession.ID;
        this.Kategorie01 = aQuellSession.Kategorie01;
        this.Kategorie02 = aQuellSession.Kategorie02;
        this.Name = aQuellSession.Name;
        this.SessionNr = aQuellSession.SessionNr;
        // aSession.Timer = aCmpSession.Timer;
        
        for (let index = 0; index < aQuellSession.UebungsListe.length; index++) {
            const mUebung = aQuellSession.UebungsListe[index].Copy();
            this.UebungsListe.push(mUebung);
        }

        for (let index = 0; index < mUebungsListe.length; index++) {
            const mUebung = mUebungsListe[index];
            const mUebung1 = (this.UebungsListe.find(u => u.ID === mUebung.ID));
            if (mUebung1) {
                mUebung1.Expanded = mUebung.Expanded;
                mUebung1.WarmUpVisible = mUebung.WarmUpVisible;
                mUebung1.CooldownVisible = mUebung.CooldownVisible;
            }
        }
    }

}
