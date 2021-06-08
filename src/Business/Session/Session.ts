import { DexieSvcService } from './../../app/services/dexie-svc.service';
import { Uebung, UebungsKategorie02, IUebung } from 'src/Business/Uebung/Uebung';
import {formatNumber} from '@angular/common';
var cloneDeep = require('lodash.clonedeep');

export enum SessionStatus {
    NurLesen,
    Bearbeitbar,
    Wartet,
    Pause,
    Laueft,
    Fertig
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
    Dauer: string;
    Timer: any;
    BodyWeight: number;
    BodyWeightAtSessionStart: number;
    StarteDauerTimer(): void;
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
    public Expanded: Boolean;
    public Kategorie01: SessionStatus = SessionStatus.Bearbeitbar;
    public Kategorie02: SessionStatus = SessionStatus.Wartet;
    public Bearbeitbar: Boolean = false;
    public UebungsListe: Array<Uebung> = [];
    public GestartedWann: Date = null;
    public Dauer: string = "00:00:00"; 
    public Timer: any; 
    public BodyWeightAtSessionStart: number = 0;

    public get BodyWeight(): number {
        // if (this.BodyWeightAtSessionStart === 0) {
        //     this.BodyWeightAtSessionStart = new DexieSvcService(null).getBodyWeight();
        // }
        return this.BodyWeightAtSessionStart;
    }

    public CalcDauer():void {
        const mJetzt: Date = new Date();
        const mSekundenTotal: number =
            Math.floor((
                Date.UTC(
                    mJetzt.getFullYear(),
                    mJetzt.getMonth(),
                    mJetzt.getDate(),
                    mJetzt.getHours(),
                    mJetzt.getMinutes(),
                    mJetzt.getSeconds()
                ) -
                Date.UTC(
                    this.GestartedWann.getFullYear(),
                    this.GestartedWann.getMonth(),
                    this.GestartedWann.getDate(),
                    this.GestartedWann.getHours(),
                    this.GestartedWann.getMinutes(),
                    this.GestartedWann.getSeconds()
                )) / 1000);

        // "parseInt" entspricht einer ganzzahligen Divison
       
        // Stunden
        const mStundenInt = parseInt((mSekundenTotal / 3600).toString());
        const mStunden: string = formatNumber(mStundenInt, 'en-US', '2.0-0');
        // Minuten
        const mMinutenInt : number = parseInt(((mSekundenTotal / 60) % 60).toString());
        const mMinuten: string = formatNumber(mMinutenInt, 'en-US', '2.0-0');
        // Sekunden
        const mSekunden: string = formatNumber(mSekundenTotal % 60, 'en-US', '2.0-0');
        this.Dauer = mStunden + ':' + mMinuten + ':' + mSekunden;
    }

    public StarteDauerTimer(): void {
        this.Timer = setInterval(() => this.CalcDauer(), 450);
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
