import { ISession, Session } from 'src/Business/Session/Session';
import { DexieSvcService, ProgramCopyPara } from './../../app/services/dexie-svc.service';
import { Satz } from '../Satz/Satz';
import { SessionStatus } from '../SessionDB';
import { ProgramModulTyp } from 'src/app/app.module';
import { Uebung } from '../Uebung/Uebung';
import { GlobalService } from 'src/app/services/global.service';

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

export class TrainingsProgrammDB {
    id: number;
    FkVorlageProgramm: number = 0;
    MaxSessions: number = 0;
    Name: string = "";
    ProgrammKategorie: ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;
    ProgrammTyp: ProgrammTyp = ProgrammTyp.Custom;
    Bearbeitbar: Boolean = true;
    Zyklen: number = 1;
    Expanded: boolean = false;
}

export interface ITrainingsProgramm {
    TrainingsProgrammDB: TrainingsProgrammDB;
    Init(aSessions: Array<ISession>): void;
    Copy(aProgramCopyPara: ProgramCopyPara): ITrainingsProgramm;
    ErstelleSessionsAusVorlage(aProgrammKategorie: ProgrammKategorie): ITrainingsProgramm;
    DeserializeProgramm(aJsonData: Object): ITrainingsProgramm;
    hasChanged(aCmpProgramm: ITrainingsProgramm): Boolean;
    resetProgram(aQuellProgram: ITrainingsProgramm): void
    SuchSatz(aSatz: Satz): Satz;
    NummeriereSessions():void;
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
}

export interface IProgrammKategorie {
    get programmKategorie(): (typeof ProgrammKategorie);
}

export interface IProgrammTyp {
    get programmTyp(): (typeof ProgrammTyp);
}


// Beim Anfuegen neuer Felder Copy nicht vergessen!
export class TrainingsProgramm implements ITrainingsProgramm {
	// Wird in abgeleiteten Klassen gesetzt.
	public TrainingsProgrammDB: TrainingsProgrammDB;
	//#region id
	get id(): number {
		return this.TrainingsProgrammDB.id;
	}
	set id(aValue: number) {
		this.TrainingsProgrammDB.id = aValue;
	}
	//#endregion
	//#region FkVorlageProgramm
	get FkVorlageProgramm(): number {
		return this.TrainingsProgrammDB.FkVorlageProgramm;
	}
	set FkVorlageProgramm(aValue: number) {
		this.TrainingsProgrammDB.FkVorlageProgramm = aValue;
	}
	//#endregion
	//#region MaxSessions
	get MaxSessions(): number {
		return this.TrainingsProgrammDB.MaxSessions;
	}
	set MaxSessions(aValue: number) {
		this.TrainingsProgrammDB.MaxSessions = aValue;
	}
	//#endregion
	//#region  Name
	get Name(): string {
		return this.TrainingsProgrammDB.Name;
	}
	set Name(aValue: string) {
		this.TrainingsProgrammDB.Name = aValue;
	}
	//#endregion
	//    public CaseName: string = '';
	//#region ProgrammKategorie
	get ProgrammKategorie(): ProgrammKategorie {
		return this.TrainingsProgrammDB.ProgrammKategorie;
	}
	set ProgrammKategorie(aValue: ProgrammKategorie) {
		this.TrainingsProgrammDB.ProgrammKategorie = aValue;
	}
	//#endregion
	//#region ProgrammTyp
	get ProgrammTyp(): ProgrammTyp {
		return this.TrainingsProgrammDB.ProgrammTyp;
	}
	set ProgrammTyp(aValue: ProgrammTyp) {
		this.TrainingsProgrammDB.ProgrammTyp = aValue;
	}
	//#endregion
	//#region ProgrammTyp
	get Bearbeitbar(): Boolean {
		return this.TrainingsProgrammDB.Bearbeitbar;
	}
	set Bearbeitbar(aValue: Boolean) {
		this.Bearbeitbar = aValue;
	}
	//#endregion

	public SessionListe: Array<ISession> = [];
	//#region Zyklen
	get Zyklen(): number {
		return this.TrainingsProgrammDB.Zyklen;
	}
	set Zyklen(aValue: number) {
		this.TrainingsProgrammDB.Zyklen = aValue;
	}
	//#endregion
	//#region Expanded
	get Expanded(): boolean {
		return this.TrainingsProgrammDB.Expanded;
	}
	set Expanded(aValue: boolean) {
		this.TrainingsProgrammDB.Expanded = aValue;
	}
	//#endregion

	constructor() {
		// this.ProgrammKategorie = aProgrammKategorie;
		// this.ProgrammTyp = aProgrammTyp;
		//Object.defineProperty(this, 'pDbModule', { enumerable: false });
		this.TrainingsProgrammDB = new TrainingsProgrammDB();
		// Object.defineProperty(this, "SessionListe", { enumerable: false });
	}

	public static StaticIsEqual(aProgramm1: ITrainingsProgramm, aProgramm2: ITrainingsProgramm): boolean {
		const mCmpProgramm1: ITrainingsProgramm = aProgramm1.Copy(new ProgramCopyPara());
		const mCmpProgramm2: ITrainingsProgramm = aProgramm2.Copy(new ProgramCopyPara());

		if (mCmpProgramm1.SessionListe.length != mCmpProgramm2.SessionListe.length) return false;

		for (let index = 0; index < mCmpProgramm1.SessionListe.length; index++) {
			const mSessionPtr1: Session = mCmpProgramm1.SessionListe[index];
			const mUebungsListe1: Array<Uebung> = mSessionPtr1.UebungsListe;
			mSessionPtr1.UebungsListe = [];

			const mSessionPtr2: Session = mCmpProgramm2.SessionListe[index];
			const mUebungsListe2: Array<Uebung> = mSessionPtr2.UebungsListe;
			mSessionPtr2.UebungsListe = [];

			try {
				if (mSessionPtr1.isEqual(mSessionPtr2) === false) return false;
			} finally {
				mSessionPtr1.UebungsListe = mUebungsListe1;
				mSessionPtr2.UebungsListe = mUebungsListe2;
			}

			if (mSessionPtr1.UebungsListe.length != mSessionPtr2.UebungsListe.length) return false;

			for (let mUebungIndex = 0; mUebungIndex < mSessionPtr1.UebungsListe.length; mUebungIndex++) {
				const mUebungPtr1 = mSessionPtr1.UebungsListe[mUebungIndex];
				const mSatzListe1: Array<Satz> = mUebungPtr1.SatzListe;
				mUebungPtr1.SatzListe = [];

				const mUebungPtr2 = mSessionPtr2.UebungsListe[mUebungIndex];
				const mSatzListe2: Array<Satz> = mUebungPtr2.SatzListe;
				mUebungPtr2.SatzListe = [];

				try {
					if (mUebungPtr1.isEqual(mUebungPtr2) === false) return false;
				} finally {
					mUebungPtr1.SatzListe = mSatzListe1;
					mUebungPtr2.SatzListe = mSatzListe2;
				}

				if (mUebungPtr1.SatzListe.length != mUebungPtr2.SatzListe.length) return false;

				for (let mSatzIndex = 0; mSatzIndex < mUebungPtr1.SatzListe.length; mSatzIndex++) {
					const mSatzPtr1: Satz = mUebungPtr1.SatzListe[mSatzIndex];
					const mSatzPtr2: Satz = mUebungPtr2.SatzListe[mSatzIndex];

					if (mSatzPtr1.isEqual(mSatzPtr2) === false) return false;
				}
			}
		}

		const mSessionListPtr1 = mCmpProgramm1.SessionListe;
		mCmpProgramm1.SessionListe = [];

		const mSessionListPtr2 = mCmpProgramm2.SessionListe;
		mCmpProgramm2.SessionListe = [];

		try {
			return isEqual(mCmpProgramm1, mCmpProgramm2);
		} finally {
			mCmpProgramm1.SessionListe = mSessionListPtr1;
			mCmpProgramm2.SessionListe = mSessionListPtr2;
		}
	}

	NummeriereSessions() {
		if (this.SessionListe !== undefined) {
			let mNr: number = 0;
			for (let index = 0; index < this.SessionListe.length; index++) {
				if (this.SessionListe[index].Kategorie02 === SessionStatus.Fertig) continue;

				this.SessionListe[index].ListenIndex = mNr++;
			}
		}
	}

	resetProgram(aQuellProgram: ITrainingsProgramm): void {
		this.Name = aQuellProgram.Name;
		this.ProgrammKategorie = aQuellProgram.ProgrammKategorie;
		this.ProgrammTyp = aQuellProgram.ProgrammTyp;
		for (let index = 0; index < aQuellProgram.SessionListe.length; index++) {
			const mZielSession: ISession = this.SessionListe[index];
			const mQuellSession: ISession = aQuellProgram.SessionListe.find((s) => s.ID === mZielSession.ID);
			if (mQuellSession) mZielSession.resetSession(mQuellSession);
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

	public static SortByName(aTrainingsProgrammListe: Array<ITrainingsProgramm>): void {
		aTrainingsProgrammListe = aTrainingsProgrammListe.sort((t1, t2) => {
			if (t1.Name > t2.Name) return 1;

			if (t1.Name < t2.Name) return -1;

			return 0;
		});
	}

	public Copy(aProgramCopyPara: ProgramCopyPara): ITrainingsProgramm {
        const mCopyOfProgram: ITrainingsProgramm = DexieSvcService.CreateTrainingsProgramm(this.TrainingsProgrammDB.ProgrammTyp);
        mCopyOfProgram.TrainingsProgrammDB = cloneDeep(this.TrainingsProgrammDB);

		if (aProgramCopyPara.CopyProgramID === false) mCopyOfProgram.TrainingsProgrammDB.id = undefined;

		mCopyOfProgram.SessionListe = [];
		// const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
		// mSessionCopyPara.Komplett = true;
		// mSessionCopyPara.CopySessionID = true;
		// mSessionCopyPara.CopyUebungID = true;
		// mSessionCopyPara.CopySatzID = true;
		for (let index = 0; index < this.SessionListe.length; index++)
            mCopyOfProgram.SessionListe.push(Session.StaticCopy(this.SessionListe[index], aProgramCopyPara));
		return mCopyOfProgram;
	}

	static createWorkOut(aDbModul: DexieSvcService, aProgramm: ITrainingsProgramm) {
		DexieSvcService.ModulTyp = ProgramModulTyp.CreateWorkout;
		aDbModul.OpenWorkoutForm(aProgramm);
	}

	public ErstelleSessionsAusVorlage(aProgrammKategorie: ProgrammKategorie): ITrainingsProgramm {
		const mResult: ITrainingsProgramm = this.Copy(new ProgramCopyPara());
		if (this.ProgrammKategorie === ProgrammKategorie.Vorlage) mResult.FkVorlageProgramm = this.id;
		else mResult.FkVorlageProgramm = this.FkVorlageProgramm;

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
		for (let mSessionNr = 0; mSessionNr < this.MaxSessions; mSessionNr++) {
			this.InitSession(mSessionNr % this.MaxSessions).forEach((mSess) => {
				aSessions.push(mSess);
				this.SessionListe.push(mSess);
			});
		}
	}

	public SuchSatz(aSatz: Satz): Satz {
		let mResult: Satz;
		this.SessionListe.find((s) => {
			if (s.ID === aSatz.SessionID) {
				mResult = s.SucheSatz(aSatz);
				return s;
			}
			return undefined;
		});
		return mResult;
	}

    protected InitSession(aSessionNr: number): Array<ISession>
    {
        return [];
     };

    public DeserializeProgramm(aJsonData: Object): ITrainingsProgramm {
        return null; 
    };
}

export class AktuellesProgramm {
    ProgrammTyp: ProgrammTyp;
    Programm: ITrainingsProgramm;
}
