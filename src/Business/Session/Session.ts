import { ProgressGroup } from 'src/Business/Progress/Progress';
import { SessionDB, Pause, ISessionDB, SessionStatus } from './../SessionDB';
import { Zeitraum, MaxZeitraum } from './../Dauer';
import { Uebung, UebungsKategorie02 } from 'src/Business/Uebung/Uebung';
import { Satz, SatzStatus, SatzTyp } from '../Satz/Satz';
import { WeightProgress } from '../Progress/Progress';
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');

export interface ISession extends ISessionDB {
    StarteDauerTimer(): void;
    SetSessionFertig();
    AddPause(): void;
    CalcDauer(): void;
    CalcPause(): void;
    addUebung(aUebung: Uebung);
    hasChanged(aCmpSession: ISessionDB): Boolean;
    resetSession(aQuellSession: ISessionDB): void;
    init(): void;
    Copy(aKomplett?: boolean): ISession;
    ExtractUebungen(aUebungen: Array<Uebung>);
    getFirstWaitingExercise(aFromIndex: number): Uebung;
    IstAusVorgabe: boolean;
    AlleUebungsSaetzeEinerProgressGruppe(aUebung: Uebung, aStatus: SatzStatus): Array<Satz>;
    AlleUebungenDerAktuellenProgressGruppe(aUebung: Uebung, aProgessID?: number): Array<Uebung>;
    AlleUebungenDerAltenProgressGruppe(aUebung: Uebung, aProgessID?: number): Array<Uebung>;
    SetNextWeight(aWp: WeightProgress, aUebung: Uebung);
    isEqual(aOtherSession: Session): boolean
    SucheSatz(aSatz: Satz):Satz

}

// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export class Session extends SessionDB implements ISession {
    public static nummeriereUebungsListe(aUebungsListe: Array<Uebung>) {
        for (let index = 0; index < aUebungsListe.length; index++)
            aUebungsListe[index].ListenIndex = index;
    }

    public SucheSatz(aSatz: Satz): Satz {
        let mResult: Satz;
        this.UebungsListe.find((u) => {
            mResult = u.ArbeitsSatzListe.find((sz) =>
                sz.ID === aSatz.ID && aSatz.ID > 0
                ||
                sz.UebungID === aSatz.UebungID && aSatz.UebungID > 0
                && sz.SatzListIndex === aSatz.SatzListIndex
            )
            if (mResult)
                return u;
            return undefined;
        });
        return mResult;
    }

    public override get BodyWeight(): number {
        // if (this.BodyWeightAtSessionStart === 0) {
        //     this.BodyWeightAtSessionStart = new DexieSvcService(null).getBodyWeight();
        // }
        return this.BodyWeightAtSessionStart;
    }

    public getFirstWaitingExercise(aFromIndex: number, aToIndex?: number): Uebung
    {
        for (let mUebungIndex = 0; mUebungIndex < this.UebungsListe.length; mUebungIndex++) {
            const mPtrUbung = this.UebungsListe[mUebungIndex];
            if (mPtrUbung.ListenIndex >= aFromIndex) {
                const mWaitingSetList: Array<Satz> = mPtrUbung.ArbeitsSatzListe.filter((sz) => sz.Status === SatzStatus.Wartet);
                if (mWaitingSetList.length > 0)
                    return mPtrUbung;
            }
        }
        return undefined;
    }

    public init(): void {
        this.ID = undefined;
        this.PausenListe = [];
        this.Kategorie02 = SessionStatus.Wartet;
        this.DauerInSek = 0;
        this.UebungsListe.forEach(
            (u) => {
                u.SatzListe.forEach( s => {
                    s.GewichtAusgefuehrt = 0;
                    s.WdhAusgefuehrt = 0;
                });
            }
        )
    }

    public get IstAusVorgabe(): boolean {
        return (this.FK_VorlageProgramm > 0);
    }


    public isEqual(aOtherSession: Session): boolean {
        const mSession = this.Copy();
        const mCmpSession = aOtherSession.Copy();
        mCmpSession.DauerFormatted = mSession.DauerFormatted;
        mCmpSession.UebungsListe.forEach(u => u.Expanded = false);
        mSession.UebungsListe.forEach(u => u.Expanded = false);
        return isEqual(mSession,mCmpSession);
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

    public ExtractUebungen(aUebungen: Array<Uebung>) {
        this.UebungsListe.forEach((u) => {
            const mFindUebung = aUebungen.find((r: Uebung) => r.FkUebung === u.FkUebung);
            if (mFindUebung === undefined)
                aUebungen.push(u);
        });
    }

    public Copy(aKomplett?: boolean): Session {
        const mNeueSession : Session = cloneDeep(this);
        if(aKomplett !== undefined )
        {
            mNeueSession.UebungsListe = [];
            mNeueSession.ID = undefined;

            for (let index1 = 0; index1 < this.UebungsListe.length; index1++) {
                const mPrtUebung = this.UebungsListe[index1];
                const mNeueUebung = mPrtUebung.Copy();
                mNeueUebung.SatzListe = [];
                mNeueUebung.ID = undefined;

                for (let index2 = 0; index2 < mPrtUebung.SatzListe.length; index2++) {
                    const mPrtSatz =  mPrtUebung.SatzListe[index2];
                    const mNeuerSatz = mPrtSatz.Copy();
                    mNeuerSatz.SessionID = 0;
                    mNeuerSatz.UebungID = 0;
                    mNeuerSatz.ID = undefined;
                    mNeueUebung.SatzListe.push(mNeuerSatz);
                }
                mNeueSession.addUebung(mNeueUebung);
            }
        }
        return mNeueSession;
    }

    constructor() {
        super();
        const mJetzt = new Date();
        this.SessionDauer = new Zeitraum(mJetzt,mJetzt, new MaxZeitraum(99,59,59));
    }

    public addUebung(aUebung: Uebung) {
        Session.StaticAddUebung(aUebung, this.UebungsListe);
    }

    public static StaticAddUebung(aUebung: Uebung, aUebungsListe: Array<Uebung>) {
        aUebung.Kategorie02 = UebungsKategorie02.Session;
        aUebungsListe.push(aUebung);
        Session.nummeriereUebungsListe(aUebungsListe);
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
        this.UebungsListe.forEach(u => mUebungsListe .push(u.Copy()));
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
            this.addUebung(mUebung);
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

    public AlleUebungsSaetzeEinerProgressGruppe(aUebung: Uebung, aStatus: SatzStatus): Array<Satz> {
        let mSatzListe: Array<Satz> = [];
        const mUebungsListe: Array<Uebung> = this.AlleUebungenDerAktuellenProgressGruppe(aUebung);
        mUebungsListe.forEach((u) =>
            mSatzListe = mSatzListe.concat(u.ArbeitsSatzListe.filter(
                (sz) => (
                    sz.Status === aStatus &&
                    sz.SatzTyp === SatzTyp.Training
                )))
        );
        return mSatzListe;
    }

    public AlleUebungenDerAktuellenProgressGruppe(aUebung: Uebung, aProgessID?: number): Array<Uebung> {
        return this.UebungsListe.filter(
            (u) =>
                u.FkUebung === aUebung.FkUebung &&
                u.FkProgress === aProgessID ? aProgessID : aUebung.FkProgress && 
                u.ProgressGroup === aUebung.ProgressGroup
        );
    }

    public AlleUebungenDerAltenProgressGruppe(aUebung: Uebung, aProgessID?: number): Array<Uebung> {
        return this.UebungsListe.filter(
            (u) =>
                u.FkUebung === aUebung.FkUebung &&
                u.FkAltProgress === aProgessID ? aProgessID : aUebung.FkAltProgress && 
                u.ProgressGroup === aUebung.ProgressGroup
        );
    }


    public SetNextWeight(aWp: WeightProgress, aUebung: Uebung): void {
        let mDiff: number = 0;
        this.AlleUebungenDerAktuellenProgressGruppe(aUebung).forEach(
            (u) => {
                if (aWp !== undefined) {
                    switch (aWp) {
                        case WeightProgress.Increase:
                            mDiff = u.GewichtSteigerung;
                            break;
                
                        case WeightProgress.Decrease:
                            mDiff = u.GewichtReduzierung;
                            break;
                    }
                }
            });
        }
}
