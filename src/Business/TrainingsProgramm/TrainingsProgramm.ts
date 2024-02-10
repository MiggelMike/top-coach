import { ISession, Session, SessionCopyPara } from 'src/Business/Session/Session';
import { DexieSvcService } from './../../app/services/dexie-svc.service';
import { Satz } from '../Satz/Satz';
import { SessionStatus } from '../SessionDB';

var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual');


export enum ProgrammTyp {
    Custom = "Custom",
    Gzclp = "Gzclp",
    HypertrophicSpecific = "HypertrophicSpecific"
}

export enum ProgrammKategorie {
    AktuellesProgramm = "AktuellesProgramm",
    Vorlage = "Vorlage",
    Fertig = "Fertig",
    Aktiv = 'Aktiv'
}

export interface ITrainingsProgramm {
    id: number;
    FkVorlageProgramm: number;
    MaxSessions: number;
    Name: string;
    ProgrammKategorie: ProgrammKategorie;
    ProgrammTyp: ProgrammTyp;
    SessionListe: Array<ISession>;
    Bearbeitbar: Boolean;
    Zyklen: number;
    Expanded: boolean;
    Init(aSessions: Array<ISession>): void;
    Copy(): ITrainingsProgramm;
    ErstelleSessionsAusVorlage(aProgrammKategorie: ProgrammKategorie): ITrainingsProgramm;
    DeserializeProgramm(aJsonData: Object): ITrainingsProgramm;
    hasChanged(aCmpProgramm: ITrainingsProgramm): Boolean;
    resetProgram(aQuellProgram: ITrainingsProgramm): void
    SuchSatz(aSatz: Satz): Satz;
    NummeriereSessions();
}

export interface IProgrammKategorie {
    get programmKategorie(): (typeof ProgrammKategorie);
}

export interface IProgrammTyp {
    get programmTyp(): (typeof ProgrammTyp);
}


// Beim Anfuegen neuer Felder Copy und Compare nicht vergessen!
export abstract class TrainingsProgramm implements ITrainingsProgramm {
    // Wird in abgeleiteten Klassen gesetzt.
    public id: number;
    public FkVorlageProgramm: number = 0;
    public MaxSessions: number = 0;
    public Name: string = "";
    public ProgrammKategorie: ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;
    public ProgrammTyp: ProgrammTyp = ProgrammTyp.Custom;
    public Bearbeitbar: Boolean = true;
    public SessionListe: Array<ISession> = [];
    public Zyklen: number = 1;
    public Expanded: boolean = false;;

    constructor(
        aProgrammTyp: ProgrammTyp,
        aProgrammKategorie: ProgrammKategorie,
        public pDbModule: DexieSvcService
    ) {
        this.ProgrammKategorie = aProgrammKategorie;
        this.ProgrammTyp = aProgrammTyp;
        Object.defineProperty(this, "pDbModule", { enumerable: false });
        // Object.defineProperty(this, "SessionListe", { enumerable: false });
    }

    public static StaticIsEqual(aProgramm1: ITrainingsProgramm, aProgramm2: ITrainingsProgramm): boolean {
        const mCmpProgramm1: ITrainingsProgramm = aProgramm1.Copy();  
        const mCmpProgramm2: ITrainingsProgramm = aProgramm2.Copy()  

        if (mCmpProgramm1.SessionListe.length != mCmpProgramm2.SessionListe.length)
            return false;

        for (let index = 0; index < mCmpProgramm1.SessionListe.length; index++) {
            const mSessionPtr1: Session = mCmpProgramm1.SessionListe[index];
            const mSessionPtr2: Session = mCmpProgramm2.SessionListe[index];

            if (mSessionPtr1.isEqual(mSessionPtr2) === false)
                return false;
            
        }

        mCmpProgramm1.SessionListe = [];
        mCmpProgramm2.SessionListe = [];
        return isEqual(mCmpProgramm1, mCmpProgramm2);
    }

    NummeriereSessions() {
        if (this.SessionListe !== undefined) {
            let mNr: number = 0;
            for (let index = 0; index < this.SessionListe.length; index++) {
                if (this.SessionListe[index].Kategorie02 === SessionStatus.Fertig)
                    continue;
                
                this.SessionListe[index].ListenIndex = mNr++;
            }
        }

    }

    resetProgram(aQuellProgram: ITrainingsProgramm): void{
        this.Name = aQuellProgram.Name;
        this.ProgrammKategorie = aQuellProgram.ProgrammKategorie;
        this.ProgrammTyp = aQuellProgram.ProgrammTyp;
        for (let index = 0; index < aQuellProgram.SessionListe.length; index++) {
            const mZielSession: ISession = this.SessionListe[index];
            const mQuellSession: ISession = aQuellProgram.SessionListe.find(s => s.ID === mZielSession.ID);
            if (mQuellSession)
                mZielSession.resetSession(mQuellSession);
        }
    }

    public hasChanged(aCmpProgramm: ITrainingsProgramm): Boolean {
        if (this.SessionListe && aCmpProgramm.SessionListe) {
            if (this.SessionListe.length != aCmpProgramm.SessionListe.length) return true;
            if (this.id != aCmpProgramm.id) return true;
            if (this.Name != aCmpProgramm.Name) return true;
            if (this.ProgrammKategorie != aCmpProgramm.ProgrammKategorie) return true;
            if (this.ProgrammTyp != aCmpProgramm.ProgrammTyp) return true;
            if (this.MaxSessions != aCmpProgramm.MaxSessions) return true;
            
            for (let index = 0; index < this.SessionListe.length; index++) {
                if (this.SessionListe[index].hasChanged(aCmpProgramm.SessionListe[index]) === true) {
                    console.log('Session #' + index.toString() + ' has changed.');
                    return true;
                }
            }
        }
        return false;
    }

     public static SortByName(aTrainingsProgrammListe: Array<ITrainingsProgramm>): void{
        aTrainingsProgrammListe = aTrainingsProgrammListe.sort((t1, t2) => {
            if (t1.Name > t2.Name)
                return 1;

            if (t1.Name < t2.Name)
                return -1

            return 0;
         });
    }

    public Copy(): ITrainingsProgramm {
        const mCopyofProgram: ITrainingsProgramm = cloneDeep(this);
        mCopyofProgram.SessionListe = [];
        const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
		mSessionCopyPara.Komplett = true;
		mSessionCopyPara.CopySessionID = true;
		mSessionCopyPara.CopyUebungID = true;
		mSessionCopyPara.CopySatzID = true;
        for (let index = 0; index < this.SessionListe.length; index++) 
            mCopyofProgram.SessionListe.push(Session.StaticCopy(this.SessionListe[index],mSessionCopyPara));
        return mCopyofProgram;
    }

    public ErstelleSessionsAusVorlage(aProgrammKategorie : ProgrammKategorie): ITrainingsProgramm {
        const mResult: ITrainingsProgramm = this.Copy();
        if (this.ProgrammKategorie === ProgrammKategorie.Vorlage)
            mResult.FkVorlageProgramm = this.id;
        else
            mResult.FkVorlageProgramm = this.FkVorlageProgramm;
        
        for (let index0 = 0; index0 < mResult.SessionListe.length; index0++) {
            // Session
            const mSession = mResult.SessionListe[index0];
            for (let index1 = 0; index1 < mSession.UebungsListe.length; index1++) {
                // Uebung
                const mUebung = mSession.UebungsListe[index1];
                for (let index2 = 0; index2 < mUebung.SatzListe.length; index2++) {
                    // Satz
                    const mSatz = mUebung.SatzListe[index2];
                    mSatz.WdhAusgefuehrt = mSatz.WdhVonVorgabe;
                    mSatz.GewichtAusgefuehrt = mSatz.GewichtVorgabe;
                }
            }
        }
        mResult.ProgrammKategorie = aProgrammKategorie;
        return mResult;
    }

    public Init(aSessions: Array<ISession>): void {
        for (
            let mSessionNr = 0; mSessionNr < this.MaxSessions; mSessionNr++
        ) {
            this.InitSession(mSessionNr % this.MaxSessions).forEach((mSess) => {
                aSessions.push(mSess);
                this.SessionListe.push(mSess);
            });
        }
    }

    public SuchSatz(aSatz: Satz): Satz {
        let  mResult: Satz;
        this.SessionListe.find((s) => {
            if (s.ID === aSatz.SessionID) {
                mResult = s.SucheSatz(aSatz);
                return s;
            }
            return undefined;
        });
        return mResult;
    }

    protected abstract InitSession(aSessionNr: number): Array<ISession>;

    public abstract DeserializeProgramm(aJsonData: Object): ITrainingsProgramm;
}

export class AktuellesProgramm {
    ProgrammTyp: ProgrammTyp;
    Programm: ITrainingsProgramm;
}
