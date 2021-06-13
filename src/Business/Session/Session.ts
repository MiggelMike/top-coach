import { Uebung, UebungsKategorie02, IUebung } from 'src/Business/Uebung/Uebung';
import { formatNumber, formatDate } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localeES from "@angular/common/locales/es";
registerLocaleData(localeES, "es");

var cloneDeep = require('lodash.clonedeep');

export enum SessionStatus {
    NurLesen,
    Bearbeitbar,
    Wartet,
    Pause,
    Laueft,
    Fertig
}

export class Pause{
    Von: Date;
    Bis: Date
    constructor(aVon: Date, aBis: Date) {
        this.Von = aVon;
        this.Bis = aBis;
    }
}

export interface ISession {
    ID: number;
    FK_Programm: number;
    SessionNr: number;
    Name: string;
    Datum: Date;
    DauerInSek: number;
    Expanded: Boolean;
    Kategorie01: SessionStatus;
    Kategorie02: SessionStatus; 
    Bearbeitbar: Boolean;
    UebungsListe: Array<Uebung>;
    LiftedWeight: number;
    GestartedWann: Date;
    PausenListe: Array<Pause>; 
    PauseInSek: number;
    Dauer: string;
    DauerTimer: any;
    BodyWeight: number;
    BodyWeightAtSessionStart: number;
    StarteDauerTimer(): void;
    AddPause(): void;
    CalcDauer(): void;
    Copy(): Session;
    addUebung(aUebung: Uebung);
    hasChanged(aCmpSession: ISession): Boolean;
    resetSession(aQuellSession: ISession): void;
}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Session implements ISession {
    public ID: number;
    public FK_Programm: number = 0;
    public SessionNr: number;
    public Name: string;
    public Datum: Date = new Date();
    public DauerInSek: number = 0;
    public PauseInSek: number = 0;
    public Expanded: Boolean;
    public Kategorie01: SessionStatus = SessionStatus.Bearbeitbar;
    public Kategorie02: SessionStatus = SessionStatus.Wartet;
    public Bearbeitbar: Boolean = false;
    public UebungsListe: Array<Uebung> = [];
    public GestartedWann: Date = null;
    public PausenListe: Array<Pause> = new Array<Pause>();
    public Dauer: string = "00:00:00"; 
    public DauerTimer: any; 
    public BodyWeightAtSessionStart: number = 0;

    public get BodyWeight(): number {
        // if (this.BodyWeightAtSessionStart === 0) {
        //     this.BodyWeightAtSessionStart = new DexieSvcService(null).getBodyWeight();
        // }
        return this.BodyWeightAtSessionStart;
    }

    private FormatDauer(aSekundenTotal : number): string{
        // "parseInt((a/b).toString())" entspricht einer ganzzahligen Divison
       
        // Stunden
        const mStundenInt = parseInt((aSekundenTotal / 3600).toString());
        const mStunden: string = formatNumber(mStundenInt, 'en-US', '2.0-0');
        // Minuten
        const mMinutenInt : number = parseInt(((aSekundenTotal / 60) % 60).toString());
        const mMinuten: string = formatNumber(mMinutenInt, 'en-US', '2.0-0');
        // Sekunden
        const mSekunden: string = formatNumber(aSekundenTotal % 60, 'en-US', '2.0-0');
        return mStunden + ':' + mMinuten + ':' + mSekunden;
    }

    public CalcDauerPrim(aVonZeitpunkt: Date, aBisZeitpunkt: Date):number {
        const mDauer = 
            Math.floor((
                Date.UTC(
                    aBisZeitpunkt.getFullYear(),
                    aBisZeitpunkt.getMonth(),
                    aBisZeitpunkt.getDate(),
                    aBisZeitpunkt.getHours(),
                    aBisZeitpunkt.getMinutes(),
                    aBisZeitpunkt.getSeconds()
                ) -
                Date.UTC(
                    aVonZeitpunkt.getFullYear(),
                    aVonZeitpunkt.getMonth(),
                    aVonZeitpunkt.getDate(),
                    aVonZeitpunkt.getHours(),
                    aVonZeitpunkt.getMinutes(),
                    aVonZeitpunkt.getSeconds()
                )) / 1000);
        return mDauer;
    }

    public CalcDauer(): void {
        const mDauer = this.CalcDauerPrim(this.GestartedWann, new Date());
        const mPause = this.CalcPause();
        const mDauerMinPause = mDauer - mPause;
        this.Dauer = this.FormatDauer(mDauerMinPause);
    }

    public CalcPause(): number {
        let mPauseInSek = 0;
        
        this.PausenListe.forEach(p => {
            mPauseInSek += this.CalcDauerPrim(p.Von, p.Bis);
        });
        return mPauseInSek;
    }
    
    
    public StarteDauerTimer(): void {
        if (   (this.PausenListe.length > 0)
            && (this.Kategorie02 === SessionStatus.Pause)) {
                this.PausenListe[this.PausenListe.length-1].Bis = new Date();
        }
        this.Kategorie02 = SessionStatus.Laueft;
        this.DauerTimer = setInterval(() => this.CalcDauer(), 450);
    }

    public AddPause(): void {
        clearInterval(this.DauerTimer);
        this.Kategorie02 = SessionStatus.Pause;
        const mJetzt = new Date();
        this.PausenListe.push(new Pause(mJetzt, mJetzt));
    }

    public get LiftedWeight():number {
        let mResult: number = 0;
        // this.UebungsListe.forEach(u => mResult + u.LiftedWeight);

        for (let index = 0; index < this.UebungsListe.length; index++) {
            const mUebung = this.UebungsListe[index];
            mResult = mResult + mUebung.LiftedWeight;
        }
        return mResult;
    }

    constructor() {
        Object.defineProperty(this, 'UebungsListe', { enumerable: false });
    }

    public Copy(): Session {
        return cloneDeep(this); 
    }

    public addUebung(aUebung: Uebung) {
        aUebung.Kategorie02 = UebungsKategorie02.Session;
        this.UebungsListe.push(aUebung);
    }

    public hasChanged(aCmpSession: ISession): Boolean {
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

    public resetSession(aQuellSession: ISession):void {
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
