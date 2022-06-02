import { ParaDB, MinDatum, SortOrder } from './../../app/services/dexie-svc.service';
import { GewichtDiff } from './../Satz/Satz';
import { AfterLoadFn, DexieSvcService  } from 'src/app/services/dexie-svc.service';
import { ITrainingsProgramm, TrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ISession, Session, SessionCopyPara } from './../Session/Session';
import { SessionStatus } from 'src/Business/SessionDB';
import { ArbeitsSaetzeStatus, Uebung, WdhVorgabeStatus } from "../Uebung/Uebung";
import { Satz, SatzStatus } from '../Satz/Satz';
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual')

export var ProgressGroup: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'I', 'J', 'K'];

export interface NextProgressFn {
	(aNextProgress: NextProgress):void | any
}

export interface ProgressExtraFn {
	(aData?: any):void | any
}

enum Arithmetik {
	Add, Sub
}

export class ProgressPara {
	Programm: ITrainingsProgramm;
	Wp: WeightProgress;
	AusgangsSession: ISession;
	AlleSaetze: boolean = false;
	DbModule: DexieSvcService;
	FailUebung: Uebung;
	AusgangsUebung: Uebung;
	AusgangsSatz: Satz;
	Progress: Progress;
	ProgressHasChanged: boolean;
	SatzDone: boolean;
	SessionDone: boolean = false;
	ProgressExtraFn?: ProgressExtraFn;
	NextProgressFn?: NextProgressFn;
	AfterLoadFn?: AfterLoadFn;
	ProgressListe?: Array<Progress>;
	ProgressID: number = -1;
	AlteProgressID: number = -1;
	UserInfo: Array<string> = [];
}

export enum NextProgressStatus { 
	SameExercise,
	OtherExercise,
	NoNoreWaitingSets
}

export class NextProgress {
	Uebung: Uebung;
	Satz: Satz;
	NextProgressStatus: NextProgressStatus = NextProgressStatus.SameExercise;
}

export enum ProgressTyp {
	BlockSet,
	RepRangeSet,
}

export enum WeightCalculation {
	Sum,
	Single,
}

export enum VorgabeWeightLimit {
	LowerLimit,
	UpperLimit,
}

export enum WeightProgressTime {
	NextSession,
	NextSet,
}

export enum WeightProgress {
	Increase,
	Decrease,
	Same,
	DecreaseNextTime,
}

export enum ProgressSet {
	First,
	Last,
	All,
}

export interface IProgress {
	ID: number;
	Name: string;
	Beschreibung: string;
	ProgressTyp: ProgressTyp;
	ProgressSet: ProgressSet;
	WeightProgressTime: WeightProgressTime;
	WeightCalculation: WeightCalculation;
	AdditionalReps: number;
	Copy(): IProgress;
    isEqual(aOtherProgress: IProgress): boolean
}

// Wird in DB gespeichert
export class Progress implements IProgress {
	ID: number;
	Name: string = "";
	Beschreibung: string = "";
	ProgressTyp: ProgressTyp = ProgressTyp.BlockSet;
	ProgressSet: ProgressSet = ProgressSet.All;
	WeightProgressTime: WeightProgressTime = WeightProgressTime.NextSession;
	WeightCalculation: WeightCalculation = WeightCalculation.Sum;
	AdditionalReps: number = 0;
	private static readonly cIgnoreWeight: number = -100000;
	private static readonly cDoWhenSetIsDone: boolean = true;
	private static readonly cAdd: boolean = true;
	private static readonly cSub: boolean = false;
	public static readonly cStandardProgress = "All sets sum";


	public Copy(): IProgress {
		return cloneDeep(this);
	}
	
	public isEqual(aOtherProgress: IProgress): boolean {
		return isEqual(this, aOtherProgress);
	}

	public EvalSaetze(aSessUebung: Uebung, aVorgabeWeightLimit: VorgabeWeightLimit): boolean {
		if (this.WeightCalculation === WeightCalculation.Sum)
			return aSessUebung.SummeWDH() >= aSessUebung.SummeVorgabeWDH(aVorgabeWeightLimit);

		for (let index = 0; index < aSessUebung.ArbeitsSatzListe.length; index++) {
			if (   aVorgabeWeightLimit === VorgabeWeightLimit.UpperLimit
				&& aSessUebung.ArbeitsSatzListe[index].WdhAusgefuehrt < aSessUebung.ArbeitsSatzListe[index].WdhBisVorgabe) return false;

			if (   aVorgabeWeightLimit === VorgabeWeightLimit.LowerLimit
				&& aSessUebung.ArbeitsSatzListe[index].WdhAusgefuehrt < aSessUebung.ArbeitsSatzListe[index].WdhVonVorgabe) return false;
		}
		return true;
	}

	private EvalDecreaseType(aSession: Session, aUebung: Uebung, aDb: DexieSvcService): WeightProgress {
		// this.EvalReduceDate(aSession.Kategorie02, aUebung, new Date(), aDb);
		if (aUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig) return WeightProgress.DecreaseNextTime;
		else return WeightProgress.Decrease;
	}

	public FailCheck(aDb: DexieSvcService, aSession: Session, aSessUebung: Uebung, aReduceUebung: Uebung, aSatzIndex: number): WeightProgress {
		if (   this.ProgressSet === ProgressSet.First
			&& (aSession.Kategorie02 === SessionStatus.Laueft || aSessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig)
			&& aSatzIndex === 0)
		{
			// Der erste Satz der Übung ist maßgebend.
			if (aSessUebung.SatzWDH(0) >= aSessUebung.SatzBisVorgabeWDH(0))
				// Die vorgegebenen Wiederholungen konnten erreicht werden
				return WeightProgress.Increase;
			// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
			if (this.ProgressTyp === ProgressTyp.RepRangeSet) {
				// Prüfen, ob das untere WDH-Limit erreicht ist 
				if (aSessUebung.SatzWDH(0) >= aSessUebung.SatzVonVorgabeWDH(0)) {
					return WeightProgress.Increase;
				}
			}
			return this.EvalDecreaseType(aSession, aReduceUebung, aDb);
		}

		if (   aSessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig
			&& this.ProgressSet === ProgressSet.Last
			&& aSatzIndex === aSessUebung.ArbeitsSatzListe.length - 1)
		{
			// Der letzte Satz der Übung ist maßgebend.
			if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) >= aSessUebung.SatzBisVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1))
				// Die vorgegebenen Wiederholungen konnten erreicht werden
				return WeightProgress.Increase;
			// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
			if (this.ProgressTyp === ProgressTyp.RepRangeSet) {
				// Prüfen, ob das untere WDH-Limit erreicht ist 
				if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) < aSessUebung.SatzVonVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1)) {
					return this.EvalDecreaseType(aSession, aReduceUebung, aDb);
				}
			}
			return this.EvalDecreaseType(aSession, aReduceUebung, aDb);
		}

		if (   aSessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig
			&& this.ProgressSet === ProgressSet.All)
		{
			// Alle Sätze der Übung.
			if (this.EvalSaetze(aSessUebung, VorgabeWeightLimit.LowerLimit))
				// Die vorgegebenen Wiederholungen konnten erreicht werden
				return WeightProgress.Increase;
			// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
			if (this.ProgressTyp === ProgressTyp.RepRangeSet) {
				// Prüfen, ob das untere WDH-Limit erreicht ist 
				if(this.EvalSaetze(aSessUebung, VorgabeWeightLimit.LowerLimit) === true)
					return WeightProgress.Increase;
			}
			return this.EvalDecreaseType(aSession, aReduceUebung, aDb);
		}
		return WeightProgress.Same;		
	}


	public async DetermineNextProgress(
		aDb: DexieSvcService,
		aSatzIndex: number,
		aSessUebung: Uebung,
		aSession: Session,
		aSessionDone: boolean
	): Promise<WeightProgress> {
		let mFailCount = (aSessUebung.MaxFailCount < 0) ? 0 : aSessUebung.MaxFailCount;
		const mProgress: Progress = this;
		let mReduceUebung: Uebung = aSessUebung;

		if ((aSessUebung.GewichtSteigerung === 0) && (aSessUebung.GewichtReduzierung === 0)) return WeightProgress.Same;

		const mWeightProgressParaUebung = this.FailCheck(aDb, aSession, aSessUebung, aSessUebung, aSatzIndex);

		if (mFailCount === 0 ||
			mWeightProgressParaUebung !== WeightProgress.Decrease && mWeightProgressParaUebung !== WeightProgress.DecreaseNextTime)
			return mWeightProgressParaUebung;


		// if (mWeightProgressParaUebung === WeightProgress.Decrease || mWeightProgressParaUebung === WeightProgress.DecreaseNextTime)
		// 	aSessUebung.Failed = true;
		
		// Wenn aFailCount === 0 ist, brauchen die Sessions nicht geprüft werden.
		if (mFailCount === 0)
			return mWeightProgressParaUebung;

		let mUebungsliste: Array<Uebung> = [aSessUebung];

		// Die Übungen nur laden, wenn die Anzahl der Fehlversuche größer 0 und abgeschlossen ist
		if (mFailCount > 0)
		{
			const mLadePara: ParaDB = new ParaDB();
			mLadePara.SortOrder = SortOrder.descending;

			mLadePara.WhereClause = {
				FK_Programm: aSession.FK_Programm,
				FkUebung: aSessUebung.FkUebung,
				FkProgress: aSessUebung.FkProgress,
				ProgressGroup: aSessUebung.ProgressGroup,
				ArbeitsSaetzeStatus: ArbeitsSaetzeStatus.AlleFertig
			};

			mLadePara.And = (mUebung: Uebung): boolean => {
				return (mUebung.Datum <= aSessUebung.Datum);
					// && (	mUebung.FailDate > aSessUebung.FailDate
					// 	|| aSessUebung.FailDate.valueOf() === MinDatum.valueOf())
			};

			mLadePara.OnUebungAfterLoadFn = (mUebungen: Array<Uebung>) => {
				const mResult: Array<Uebung> = [];
				const mAktuelleUebung = mUebungen.find((u) => u.ID === aSessUebung.ID);
				if (mAktuelleUebung !== undefined) {
					const mSpliceIndex = mUebungen.indexOf(mAktuelleUebung);
					mUebungen.splice(mSpliceIndex,1);
				}
				mUebungen.push(aSessUebung);
				
				mUebungen = mUebungen.sort((a, b) => {
					return b.WeightInitDate.valueOf() - a.WeightInitDate.valueOf();
				});
				
				let mWeightInitDate: Date = MinDatum;
				
				for (let index = 0; index < mUebungen.length; index++) {
					const mPtrUebung = mUebungen[index];

					if (mPtrUebung.WeightInitDate.valueOf() > mWeightInitDate.valueOf())
						mWeightInitDate = mPtrUebung.WeightInitDate;
				}

				for (let index = 0; index < mUebungen.length; index++) {
					const mPtrUebung = mUebungen[index];
					// if (mUebungsliste.find((u) => u.ID === mPtrUebung.ID) === undefined)
						// mResult.push(mPtrUebung);
						// if ((mPtrUebung.FailDate.valueOf() > mMaxFailDate.valueOf()) || (mPtrUebung.FailDate.valueOf() === MinDatum.valueOf()))
						// if ((mPtrUebung.Datum.valueOf() > mMaxFailDate.valueOf()) || (mMaxFailDate.valueOf() === MinDatum.valueOf()))
						if (mPtrUebung.Datum.valueOf() > mWeightInitDate.valueOf()) 
							mResult.push(mPtrUebung)
				}
				return mResult;
			}

			mLadePara.Limit = mFailCount;
			mLadePara.SortBy = "FailDate";

			// Warten, bis Übungen geladen sind.

			const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
			mSessionCopyPara.Komplett = true;
			mSessionCopyPara.CopySessionID = false;
			mSessionCopyPara.CopyUebungID = false;
			mSessionCopyPara.CopySatzID = false;
			mUebungsliste = await aDb.LadeSessionUebungenEx(aSession.Copy(mSessionCopyPara), mLadePara);
			
			// if (mParaUebungFailed === true) {
			// 	aSessUebung.FailDate = new Date();
			// }
		} // if


		// if (   mProgress.ProgressSet === ProgressSet.First
		// 	&& aSession.Kategorie02 === SessionStatus.Laueft
		// 	&& aSatzIndex === 0
		// 	// Nur der erste Satz muss erledigt sein.
		// 	// && (aSessUebung.SatzFertig(0) === true)
		// 	// Der erste Satz der Übung ist maßgebend.
		// 	&& aSessUebung.SatzWDH(0) >= aSessUebung.SatzBisVorgabeWDH(0)
		// )
		// {
		// 		// Die vorgegebenen Wiederholungen konnten erreicht werden
		// 		return WeightProgress.Increase;
		// }

		// if (   aSessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig
		// 	&& mProgress.ProgressSet === ProgressSet.Last
		// 	&& aSatzIndex === aSessUebung.ArbeitsSatzListe.length - 1) {
		// 	// Der letzte Satz der Übung ist maßgebend.
		// 	// Alle Sätze müssen erledigt sein.
		// 	if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) >= aSessUebung.SatzBisVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1))
		// 		// Die vorgegebenen Wiederholungen konnten erreicht werden
		// 		return WeightProgress.Increase;
		// }

		// // Alle Sätze der Übung.
		// if (	mProgress.ProgressSet === ProgressSet.All
		// 	&&  aSessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig
		// 	&& mProgress.EvalSaetze(aSessUebung, VorgabeWeightLimit.UpperLimit))
		// {
		// // Die vorgegebenen Wiederholungen konnten erreicht werden
  		// 	return WeightProgress.Increase;
		// }

		if ((mUebungsliste === undefined)|| (mUebungsliste.length < mFailCount)) 
			return WeightProgress.Same;

		//#region Uebungen aus vorherigen Sessions prüfen
		mFailCount = 0;

    		// Es konnte noch kein Ergebnis ermittelt werden.
			// Die Uebungen müssen geprüft werden.
		for (let index = 0; index < mUebungsliste.length; index++) {
			const mPtrSessUebung = mUebungsliste[index];
			//#region ProgressSet.First
			// Der erste Satz ist maßgebend.
			if (   aSatzIndex === 0
				&& mProgress.ProgressSet === ProgressSet.First
				// Der erste Satz muss fertig sein.
			    && aSessUebung.getArbeitsSatzStatus(0) === SatzStatus.Fertig)
			{
				// Der erste Satz der Übung ist maßgebend.
				if (mPtrSessUebung.SatzWDH(0) >= mPtrSessUebung.SatzBisVorgabeWDH(0))
				{
					// Die vorgegebenen Wiederholungen für den ersten Satz konnten erreicht werden.
					// Der erste Satz ist also Ok.
					if (
						// Die Session läuft.
						// Dann reicht es, wenn der erste Satz abgeschlossen und OK ist.
							(aSession.Kategorie02 === SessionStatus.Laueft)
						// Die Session läuft NICHT.
						// Dann müssen ALLE Sätze abgeschlossen sein.
						|| (aSessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig))
					{
						return WeightProgress.Increase;
					}//if

				}
				else {
					// Die vorgegebenen Wiederholungen für den ersten Satz konnten NICHT erreicht werden.
					// Wenn der Prozesstyp nicht Blockset ist, muss 
					if ((mProgress.ProgressTyp === ProgressTyp.BlockSet) ||
						// er RepRange sein. Daher das untere Limit prüfen.
						(mPtrSessUebung.SatzWDH(0) < mPtrSessUebung.SatzVonVorgabeWDH(0)))
					{
						mFailCount++
						continue;
					}
				}
			}//if
			//#endregion
			//#region ProgressSet.Last
			// Der letzte Satz ist maßgebend.
			if (   aSessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig
				// Der letzte Satz der Übung ist maßgebend.
				&& mProgress.ProgressSet === ProgressSet.Last
				&& aSatzIndex === mPtrSessUebung.ArbeitsSatzListe.length - 1)
			{
				if (mPtrSessUebung.SatzWDH(mPtrSessUebung.ArbeitsSatzListe.length - 1) >= mPtrSessUebung.SatzBisVorgabeWDH(mPtrSessUebung.ArbeitsSatzListe.length - 1))
					// Die vorgegebenen Wiederholungen konnten erreicht werden
					return WeightProgress.Increase;
				else {
					// Wenn der Prozesstyp nicht Blockset ist, muss 
					if ((mProgress.ProgressTyp === ProgressTyp.BlockSet) ||
						// er RepRange sein. Daher das untere Limit prüfen.
						(mPtrSessUebung.SatzWDH(mPtrSessUebung.ArbeitsSatzListe.length - 1) < mPtrSessUebung.SatzVonVorgabeWDH(mPtrSessUebung.ArbeitsSatzListe.length - 1)))
					{
						mFailCount++
						continue;
					}//if
				}//if
			}//if
			//#endregion
			//#region ProgressSet.All   
			if (	mProgress.ProgressSet === ProgressSet.All
				&& 	aSessUebung.getArbeitsSaetzeStatus() === ArbeitsSaetzeStatus.AlleFertig )
			{
				// Alle Sätze der Übung.
				if (	(mProgress.ProgressTyp === ProgressTyp.BlockSet && this.EvalSaetze(mPtrSessUebung, VorgabeWeightLimit.LowerLimit) === false)
					|| (mProgress.ProgressTyp === ProgressTyp.RepRangeSet && this.EvalSaetze(mPtrSessUebung, VorgabeWeightLimit.LowerLimit) === false)
				)
				{
					// Die vorgegebenen Wiederholungen konnten nicht erreicht werden.
					mFailCount++
					continue;
				}//if
			}//if
			//#endregion
		} // for

		if (mFailCount >= aSessUebung.MaxFailCount) {
			return this.EvalDecreaseType(aSession, mReduceUebung, aDb);
		}
		else
			return WeightProgress.Same;
		//#endregion
	}

	public static StaticDoSaetzeProgress(aWarteSatzListe: Array<Satz>, aUpComingSessionListe: Array<Session>, aAusgangsSatz: Satz, aUebung: Uebung, aAusgangsSession: Session, aProgressSet : ProgressSet,  aWeightProgress?: WeightProgress): NextProgress {
		const mResult: NextProgress = new NextProgress();
		let mSatzListe: Array<Satz> = aWarteSatzListe.map( (sz) => sz);
		aUebung.nummeriereSatzListe(aUebung.ArbeitsSatzListe);
		// Läuft die Session?
		if (aAusgangsSession.Kategorie02 === SessionStatus.Laueft) {
			// Die Session läuft
			// Bei ProgressSet.First sofort in der aktuellen Übung für alle folgenden Sätze das Gewicht erhöht.
			if (aProgressSet === ProgressSet.First) {
				// Die Sätze müssen nach "aSatz" in der Liste sein.
				// Aus der Satzliste der aktuellen Übung alle folgenden Sätze mit dem Status "Wartet" in mSatzliste sammeln.
				// mSatzListe = aUebung.ArbeitsSatzListe.filter(
				// 	(sz) => (
				// 		sz.SatzListIndex > aAusgangsSatz.SatzListIndex &&
				// 		sz.Status === SatzStatus.Wartet
				// 	));
				// Im Fall, dass die Übung mit der gleichen Progressions-Gruppe mehrfach in der Session vorkommt,
				// wird auch für diese das Gewicht in den Arbeitsätzen angepasst.
				const mUebungsListe = aAusgangsSession.UebungsListe.filter(
					(u) =>
						// Die Übung aus den Übergabeparametern ist schon weiter oben behandelt worden. 
						u !== aUebung &&
						u.FkUebung === aUebung.FkUebung &&
						u.ProgressGroup === aUebung.ProgressGroup 
				);

					// if (mSatzListe.length === 0) {
					// 	mResult.NextProgressStatus = NextProgressStatus.OtherExercise;
					// 	// Alle Sätze der aktuellen Übung sind fertig.
					// 	// Jetzt in den nächsten Übungen nach 'wartenden Sätzen' suchen.
						
					// 	for (let index = 0; index < aAusgangsSession.UebungsListe.length; index++) {
					// 		const mPtrUebung: Uebung = aAusgangsSession.UebungsListe[index];
					// 		mSatzListe = aUebung.ArbeitsSatzListe.filter((sz) => sz.Status === SatzStatus.Wartet);
					// 	}
					// }

				
			}
		} else {
			// Session läuft nicht -> aAusgangsSession.Kategorie02 != SessionStatus.Laueft
			// Sessions mit der gleichen Übung heraussuchen.
			const mSessionListe: Array<Session> = aUpComingSessionListe.filter(
				(s) => {
					// Die Uebungen und die Progressgruppe müssen gleich sein.
					const mUebung = s.UebungsListe.find((u) => u.FkUebung === aUebung.FkUebung && u.ProgressGroup === aUebung.ProgressGroup);
					if (mUebung) {
						mUebung.nummeriereSatzListe(mUebung.ArbeitsSatzListe);
						if ((s.ID === aAusgangsSession.ID) && (mUebung.ListenIndex === aUebung.ListenIndex)) {
							if (mUebung.getFirstWaitingWorkSet(aAusgangsSatz.SatzListIndex + 1))
								return s;
						} else {
							if (mUebung.getFirstWaitingWorkSet())
								return s;
						}
					}
					return undefined;
				});
		}
			
		let mDiff: number = 0;

		if (aWeightProgress !== undefined) {
			switch (aWeightProgress as WeightProgress) {
				case WeightProgress.Increase:
					mDiff = aUebung.GewichtSteigerung;
					break;
				
				case WeightProgress.Decrease:
				case WeightProgress.DecreaseNextTime:
					mDiff = aUebung.GewichtReduzierung;
					break;
			}
		}
		

		let mNextUndoneSet: Satz = mSatzListe.shift();
		let mFirstSetChecked: boolean = false;
		let mCheckAgain: boolean = false;

		if (mNextUndoneSet !== undefined) {
			let mWaitingExercise: Uebung;
			do {
				mCheckAgain = false;
				if (   (aProgressSet === ProgressSet.First)
					&& (mFirstSetChecked === false))
				{
					mWaitingExercise = aUebung;
					mFirstSetChecked = true;
				} else mWaitingExercise = aAusgangsSession.getFirstWaitingExercise(aUebung.ListenIndex + 1);

				if (mWaitingExercise === undefined)
					mWaitingExercise = aAusgangsSession.getFirstWaitingExercise(aUebung.ListenIndex);
			
				if (mWaitingExercise) {
					mResult.Uebung = mWaitingExercise;
					if (mWaitingExercise.getFirstWaitingWorkSet()) {
						if(mWaitingExercise === aUebung)
							mResult.Satz = mWaitingExercise.getFirstWaitingWorkSet(aAusgangsSatz.SatzListIndex + 1);
						else
							mResult.Satz = mWaitingExercise.getFirstWaitingWorkSet();
						
						return mResult;
					} else {
						if (mFirstSetChecked === true) {
							mCheckAgain = true;
						}
					}
				}
			} while (mCheckAgain)
		}
		return undefined;
	}


	public static async StaticDoProgress(aProgressPara: ProgressPara):Promise<ProgressPara> {
		if (aProgressPara.ProgressListe === undefined)
			return aProgressPara;

		// const mProgressParaMerker: ProgressPara = aProgressPara;
		// const mProgressListe: Array<Progress> = mProgressParaMerker.ProgressListe;
		aProgressPara.Progress = aProgressPara.ProgressListe.find((p) => p.ID === aProgressPara.AusgangsUebung.FkProgress);
		// Sätze der aktuellen Übung durchnummerieren
		aProgressPara.AusgangsUebung.nummeriereSatzListe(aProgressPara.AusgangsUebung.SatzListe);
		// Hole alle Sätze aus der aktuellen Session, in der die aktuelle Übung mehrfach vorkommt
		// Aus der Satzliste der aktuellen Übung die Sätze mit dem Status "Wartet" in mSatzliste sammeln
		const mSatzListe = aProgressPara.AusgangsSession.AlleUebungsSaetzeEinerProgressGruppe(aProgressPara.AusgangsUebung, SatzStatus.Wartet);
		const mSessionsListe: Array<Session> = aProgressPara.DbModule.UpComingSessionList();

		let mNextProgress: NextProgress;
		if ((aProgressPara.SatzDone) && (aProgressPara.Progress !== undefined))
			mNextProgress =
				Progress.StaticDoSaetzeProgress(
					mSatzListe,
					mSessionsListe,
					aProgressPara.AusgangsSatz as Satz,
					aProgressPara.AusgangsUebung,
					aProgressPara.AusgangsSession as Session,
					aProgressPara.Progress.ProgressSet);                
			
		if (aProgressPara.Progress) {
			try {
				
				aProgressPara.Wp =
					await aProgressPara.Progress.DetermineNextProgress(
						aProgressPara.DbModule,
						aProgressPara.AusgangsSatz.SatzListIndex,
						aProgressPara.AusgangsUebung,
						aProgressPara.AusgangsSession as Session,
						aProgressPara.SessionDone
					);
			

				aProgressPara.ProgressID = aProgressPara.Progress ? aProgressPara.Progress.ID : -1;
				aProgressPara.AlteProgressID = aProgressPara.AusgangsUebung.FkAltProgress;
				aProgressPara.ProgressHasChanged = aProgressPara.AlteProgressID !== aProgressPara.ProgressID;
		
				if (aProgressPara.ProgressHasChanged === true) {
					if (
						(aProgressPara.AusgangsSatz.Status === SatzStatus.Wartet)
						&& (Progress.StaticFindDoneSet(aProgressPara.AusgangsSession, aProgressPara.AusgangsUebung) === true)
					)
						aProgressPara.Wp = aProgressPara.Wp;
					else
						aProgressPara.Wp = aProgressPara.AusgangsSatz.Status === SatzStatus.Wartet ? WeightProgress.Decrease : aProgressPara.Wp;
				}
		
				// if (aProgressPara.FailUebung !== undefined) {
				// 	if (aProgressPara.AusgangsUebung.WeightProgress !== WeightProgress.Increase)
				// 		aProgressPara.FailUebung.Failed = true;
				// 	else
				// 		aProgressPara.FailUebung.Failed = false;
				// }
			
				await Progress.StaticProgrammSetNextWeight(aProgressPara);
			} catch (error) {
				console.error(error);
			}
			
		}
		
		if ((aProgressPara.SatzDone) && (aProgressPara.NextProgressFn)) {
			aProgressPara.NextProgressFn(mNextProgress);
		}
		
		return aProgressPara;
    }

	public static StaticSessionSetNextWeight(aWp: WeightProgress, aSession: Session, aUebung: Uebung): void {
        let mDiff: number = 0;
        aSession.AlleUebungenDerAktuellenProgressGruppe(aUebung).forEach(
            (u) => {
                if (aWp !== undefined) {
                    switch (aWp) {
                        case WeightProgress.Increase:
                            mDiff = u.GewichtSteigerung;
                            break;
                
						case WeightProgress.Decrease:
						case WeightProgress.DecreaseNextTime:
                            mDiff = u.GewichtReduzierung;
                            break;
                    }
                }
            });
	}

	public static StaticManageProgressID(aUebung: Uebung, aNeuProgressID: number): void {
		aUebung.FkAltProgress = aUebung.FkProgress;
		aUebung.FkProgress = aNeuProgressID;
	}

	public static StaticEqualSet(aSatz1 : Satz, aSatz2: Satz): boolean{
		return (
			aSatz1 !== undefined &&
			aSatz2 !== undefined &&
			((
				aSatz1.ID > 0 &&
				aSatz2.ID > 0 &&
				aSatz1.ID === aSatz2.ID
			)
			||
			(	aSatz1.SessionID === aSatz2.SessionID &&
				aSatz1.UebungID === aSatz2.UebungID &&
				aSatz1.SatzListIndex === aSatz2.SatzListIndex
			))
			
		);
	}

	public static StaticEqualUebung(aUebung1 : Uebung, aUebung2: Uebung): boolean{
		return (aUebung1 !== undefined &&
			    aUebung2 !== undefined &&
			(
				(		aUebung1.SessionID === aUebung2.SessionID
					&&	aUebung1.FkUebung === aUebung2.FkUebung
					&& 	aUebung1.ListenIndex === aUebung2.ListenIndex
				)
				||
			(
						aUebung1.ID !== 0
					&&	aUebung1.ID === aUebung2.ID
				)
			)
		);
	}


	private static StaticProgressHasChanged(aProgressPara: ProgressPara): boolean{
		return (aProgressPara.ProgressID !== aProgressPara.AlteProgressID);
	}

	private static StaticUebungProgressHasChanged(aUebung: Uebung, aProgressPara: ProgressPara): boolean{
		return (aProgressPara.ProgressID !== aUebung.FkProgress);
	}

	private static StaticUebungOldProgressExists(aUebung: Uebung): boolean{
		return (aUebung.FkAltProgress !== undefined);
	}

	private static StaticUebungProgressExists(aUebung: Uebung): boolean{
		return (aUebung.FkAltProgress !== undefined);
	}

	public static StaticProgressEffectsRunningSession(aProgressID: number, aProgressPara: ProgressPara ): boolean{
		const mProgress: Progress = aProgressPara.ProgressListe.find((p) => p.ID === aProgressID);
		if((mProgress) && (mProgress.ProgressSet === ProgressSet.First))
			return true
		return false;
	}	

	private static StaticFirstSetDone(aUebung: Uebung): boolean{
		if (aUebung.ArbeitsSatzListe.length === 0)
			return false;
		
		return aUebung.ArbeitsSatzListe[0].Status === SatzStatus.Fertig;
	}


	private static StaticNewProgressExists(aUebung: Uebung): boolean{
		return (aUebung.FkProgress !== undefined);
	}

	public static StaticFindDoneSet(aSession: ISession, aUebung: Uebung): boolean {
		for (let index = 0; index < aSession.UebungsListe.length; index++) {
			if (aSession.UebungsListe[index].FkUebung === aUebung.FkUebung
				&& aSession.UebungsListe[index].ProgressGroup === aUebung.ProgressGroup
				&& aSession.UebungsListe[index].FkProgress === aUebung.FkProgress) {
				if (Progress.StaticFirstSetDone(aSession.UebungsListe[index]))
					return true;
			}
		}
		return false;
	}

	private static StaticSessionLaeuft(aSession: ISession): boolean{
		return (aSession.Kategorie02 === SessionStatus.Laueft);
	}

	private static StaticSetWeight(aGewichtDiff: GewichtDiff, aSatz: Satz, aArithmetik: Arithmetik): void {
		if (aSatz.Status === SatzStatus.Wartet) {
			if (aArithmetik === Arithmetik.Add) {
				aSatz.AddToDoneWeight(aGewichtDiff.Gewicht);
				aSatz.GewichtDiff.push(aGewichtDiff);
			}
		    else {
				aSatz.AddToDoneWeight(-aGewichtDiff.Gewicht);
				const mIndex = aSatz.GewichtDiff.indexOf(aGewichtDiff);
				if (mIndex > -1)
					aSatz.GewichtDiff.splice(mIndex, 1);
			}
		
			aSatz.SetPresetWeight(aSatz.GewichtAusgefuehrt);
		}
	}

	private static StaticSetAllWeights(aUebung: Uebung, aAusgangsUebung: Uebung, aAusgangsSatz: Satz, aArithmetik: Arithmetik, aAlleSaetze: boolean, aWeight: number = this.cIgnoreWeight): void {
		
		aUebung.ArbeitsSatzListe.forEach(
			(sz) => {
				if (aAlleSaetze || Progress.StaticEqualSet(aAusgangsSatz, sz) === false) {
					if (aArithmetik === Arithmetik.Add) {
						const mGewichtDiff: GewichtDiff = new GewichtDiff();
						mGewichtDiff.Gewicht = aWeight;
						mGewichtDiff.FromSet = aAusgangsSatz;
						mGewichtDiff.Uebung = aAusgangsUebung;
						Progress.StaticSetWeight(mGewichtDiff, sz, aArithmetik);
					}
					else {
						let mGewichtDiff: GewichtDiff;
						if (sz.GewichtDiff.length > 0) 
							mGewichtDiff = sz.GewichtDiff.find((gdiff) => { return Progress.StaticEqualSet(gdiff.FromSet, aAusgangsSatz); })
						else if (aWeight !== this.cIgnoreWeight)
						{
							mGewichtDiff = new GewichtDiff();
							mGewichtDiff.FromSet = aAusgangsSatz;
							mGewichtDiff.Uebung = aUebung;
							mGewichtDiff.Gewicht = aWeight;
						}
						if (mGewichtDiff !== undefined)
						{
							Progress.StaticSetWeight(mGewichtDiff, sz, aArithmetik);
						}
					} // if
				}
			});
	}

	private static StaticSetIsDone(aSatz: Satz): boolean {
		return aSatz.Status === SatzStatus.Fertig;
	}

	private static StaticSetHasChangedByProcess(aUebung: Uebung, aProgressPara: ProgressPara): boolean {
		const mProgress: Progress = aProgressPara.ProgressListe.find((p) => p.ID === aProgressPara.AlteProgressID);
		return aUebung.ArbeitsSatzListe.find(
			(sz) => {
				if (sz.GewichtDiff.length <= 0)
					return false;
				
				return (sz.GewichtDiff.find((gfiff) => {
					return Progress.StaticEqualSet(gfiff.FromSet, aProgressPara.AusgangsSatz);
				})) !== undefined;
			}) !== undefined;
	}


	private static StaticResetAllWeights(aUebung: Uebung, aProgressID: number): void {
		aUebung.ArbeitsSatzListe.forEach(
			(sz) => {
				const mGewichtDiff = sz.GewichtDiff.find(
					(gdiff) => {
						return (
							//    (gdiff.Uebung.FkAltProgress === aProgressID || mUebung.FkAltProgress === aProgressID)
							   (gdiff.Uebung.FkAltProgress === aProgressID)
							&& (aUebung.ID === gdiff.Uebung.ID)
							||
							(		(aUebung.FkUebung === gdiff.Uebung.FkUebung)
								&& 	(aUebung.ProgressGroup === gdiff.Uebung.ProgressGroup))
							)
					});
				
				if(mGewichtDiff !== undefined)
					Progress.StaticSetWeight(mGewichtDiff, sz, Arithmetik.Sub);
			}



				// if (Progress.StaticEqualSet(aAusgangsSatz, sz) === false) {
				// 	if (aGewichtDiff  !== undefined)
				// 		Progress.StaticSetWeight(aGewichtDiff, sz, Arithmetik.Sub);
				// 	else
				// 	{
				// 		if (sz.GewichtDiff.length > 0) {
				// 			Progress.StaticSetWeight(sz.GewichtDiff.pop(), sz, Arithmetik.Sub);
				// 		}
				// 	}
				// }
		)
	}
	
	public static StaticProgrammSetNextWeight(aProgressPara: ProgressPara): Promise<void> {
		class ProgressExercise { Session: ISession; Uebung: Uebung; Progress: Progress; StornoProgress: Progress }

		let mAlleUebungenEinerProgressGruppe: Array<Uebung>;
		// Temporäre Liste der Uebungen
		const mTodoListe: Array<ProgressExercise> = [];
		if (aProgressPara.AusgangsUebung) {
			if (Progress.StaticProgressHasChanged(aProgressPara))
				mAlleUebungenEinerProgressGruppe = aProgressPara.AusgangsSession.AlleUebungenDerAltenProgressGruppe(aProgressPara.AusgangsUebung, aProgressPara.AlteProgressID);
			else
				mAlleUebungenEinerProgressGruppe = aProgressPara.AusgangsSession.AlleUebungenDerAktuellenProgressGruppe(aProgressPara.AusgangsUebung, aProgressPara.ProgressID);
		}

		// Die relevanten Sessions aus der Sessionliste des Programms Herausfiltern.
		const mSessionListe: Array<ISession> = aProgressPara.Programm.SessionListe.filter((mCmpSession) => {
					
			if
				((
					// 1. Wenn die Ausgangs - Session läuft, ist es okay, dass die Übungen auch dieser Session untersucht werden, wenn in aProgress der ProgressSet = First ist.
					// 2. Wenn die Ausgangssession nicht läuft, 
					aProgressPara.AusgangsSession.Kategorie02 === SessionStatus.Laueft
					// && aProgress !== undefined && aProgress.ProgressSet === ProgressSet.First
					||
					// 1. Die Session aus der Liste ist nicht die Ausgangs-Session.  
					// 2. Die Session aus der Liste ist im Status "Wartet"
					   mCmpSession.ID !== aProgressPara.AusgangsSession.ID
					&& mCmpSession.Kategorie02 === SessionStatus.Wartet
				)
				&&
				// Die Session nur berücksichtigen, wenn sie mindestens eine Übung der Ausgangs-Session hat.
				(aProgressPara.AusgangsSession.UebungsListe.find((au) => {
					// Die Übungen aller Sessions aus der Session-Liste des Programms mit den Übungen der Ausgangssession vergleichen.
					let mResultDummy: Uebung;
					for (let index = 0; index < mCmpSession.UebungsListe.length; index++) {
						let mCmpUebPtr = mCmpSession.UebungsListe[index];

						if (aProgressPara.AusgangsUebung.FkUebung !== mCmpUebPtr.FkUebung)
							continue;

						// Wenn aProgress gesetzt ist, dessen ID zum Vergleichen verwenden,
						// sonst die ID des Progress der Übung aus der Übungsliste benutzen. 
						const mSuchProgressID: number = aProgressPara.Progress ? aProgressPara.Progress.ID : mCmpUebPtr.FkProgress;
						// Hat der Progresstyp sich geändert?
						let mStornoProgressID: number;

						if (aProgressPara.AusgangsUebung.FkUebung === mCmpUebPtr.FkUebung) {
							if (
								//  mCmpUebPtr.ListenIndex === aProgressPara.AusgangsUebung.ListenIndex &&
								mCmpUebPtr.FkProgress > -1 && mCmpUebPtr.FkAltProgress !== aProgressPara.AusgangsUebung.FkProgress
							)
								mStornoProgressID = mCmpUebPtr.FkAltProgress;
							else if (mCmpUebPtr.FkAltProgress > -1 && mCmpUebPtr.FkAltProgress !== mCmpUebPtr.FkProgress)
								mStornoProgressID = mCmpUebPtr.FkAltProgress;
								
							else if (aProgressPara.AusgangsUebung.FkAltProgress > -1 && aProgressPara.AusgangsUebung.FkAltProgress !== mCmpUebPtr.FkProgress)
								mStornoProgressID = mCmpUebPtr.FkAltProgress;
						}
								
						if (	// Sind die Übungen gleich?
							au.FkUebung === mCmpUebPtr.FkUebung
							// Ist ein Progresstyp hinterlegt?
							// && mCmpUebPtr.FkProgress > 0
							// Sind die Progresstypen gleich?
							&& au.FkProgress === mSuchProgressID
							||
							// Der Progresstyp hat sich geändert.
							// Evtl. schon getätigte Gewichtsvorgaben müssen rückgängig gemacht werden.
							mStornoProgressID
									
						) {
							const mProgress: Progress = aProgressPara.ProgressListe.find((p) => p.ID === mCmpUebPtr.FkProgress);
							const mStornoProgress: Progress = aProgressPara.ProgressListe.find((p) => p.ID === mStornoProgressID);
									
							if (mProgress || mStornoProgress) {
								const mProgessExercise: ProgressExercise = new ProgressExercise();
								mProgessExercise.Progress = mProgress;
								mProgessExercise.StornoProgress = mStornoProgress;
								mProgessExercise.Session = mCmpSession;
								mProgessExercise.Uebung = mCmpUebPtr;
								mTodoListe.push(mProgessExercise);
							}
							mResultDummy = mCmpUebPtr;
						}
					}
					if (mResultDummy)
						return mResultDummy;
					return undefined;
				}) !== undefined)
			)
				return true;
			else
				return false;
		});

		// Wenn die Todo-Liste leer ist, gibt es nichts zu tun.
		for (let mTodoIndex = 0; mTodoIndex < mTodoListe.length; mTodoIndex++) {
			const mPtrTodoUebung: Uebung = mTodoListe[mTodoIndex].Uebung;
			const mPrtArbeitSession = mTodoListe[mTodoIndex].Session;
			let mPtrArbeitUebung: Uebung = mPtrTodoUebung;

			for (let mSessionIndex = 0; mSessionIndex < aProgressPara.Programm.SessionListe.length; mSessionIndex++) {
				const mPrtSession = aProgressPara.Programm.SessionListe[mSessionIndex];
				mPtrArbeitUebung = mPrtSession.UebungsListe.find((u) =>
					(u.SessionID === mPtrTodoUebung.SessionID) &&
					u.FkUebung === mPtrTodoUebung.FkUebung &&
					u.ListenIndex === mPtrTodoUebung.ListenIndex &&
					u.ProgressGroup === mPtrTodoUebung.ProgressGroup
				);

				if (mPtrArbeitUebung !== undefined)
					break;
			}
				

			if (   mPtrArbeitUebung === undefined
				|| mPtrArbeitUebung.FkUebung !== aProgressPara.AusgangsUebung.FkUebung
			   )
				continue;
			
			mPtrArbeitUebung.nummeriereSatzListe(mPtrArbeitUebung.SatzListe);

			//#region Progress has changed
			if (Progress.StaticProgressHasChanged(aProgressPara)) {
				// Schleifen-Übung <> Ausgangs-Übung 
				if ((Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === false)
					// Alter Prozess wirkt sich auf laufende Sessions aus 
					&& Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara)
					// Prozess der Schleifen-Übung wirkt sich auf laufende Sessions aus 
					&& Progress.StaticProgressEffectsRunningSession(mPtrArbeitUebung.FkProgress, aProgressPara)
					// Erster Satz der Ausgangsübung ist erledigt 
					&& Progress.StaticFirstSetDone(aProgressPara.AusgangsUebung)
					// Erster Satz der Schleifenübung ist erledigt 
					// && Progress.StaticFirstSetDone(mPtrArbeitUebung)
				) {
					Progress.StaticResetAllWeights(mPtrArbeitUebung, aProgressPara.AlteProgressID);
				} //if
				else if (
					(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === true)
					&& Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara)
					&& Progress.StaticFirstSetDone(aProgressPara.AusgangsUebung)
				) {
					Progress.StaticResetAllWeights(mPtrArbeitUebung, aProgressPara.AlteProgressID);
				} //if
				else if (
					// Schleifen-Übung <> Ausgangs-Übung
					(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === false)
					// Alter Prozess der Ausgangs-Übung wirkt sich auf laufende Sessions aus 
					&& (Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara) === true)
					// Es gibt eine Änderung der Sätze mit dem alten Prozess  
					&& (Progress.StaticSetHasChangedByProcess(mPtrArbeitUebung, aProgressPara) === true)
				) {
					Progress.StaticResetAllWeights(mPtrArbeitUebung, aProgressPara.AlteProgressID);
				} //if
				else if (
					// Schleifen-Übung = Ausgangs-Übung
					(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === true)
					// Alter Prozess der Ausgangs-Übung wirkt sich auf laufende Sessions aus 
					&& Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara)
				) {
					Progress.StaticResetAllWeights(mPtrArbeitUebung, aProgressPara.AlteProgressID);
				} //if					
			} // if
			//#endregion				

			
			if (
				(
					// Schleifen-Übung = Ausgangs-Übung
					(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === true)
					// Prozess wirkt sich auf laufende Sessions aus 
					&& (Progress.StaticProgressEffectsRunningSession(aProgressPara.ProgressID, aProgressPara) === true)
					// Session läuft
					&& (Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession) === true)
				)
				||
				(
					// Schleifen-Übung <> Ausgangs-Übung
					(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === false)
					// Der Prozess der Übung wirkt sich auf laufende Sessions aus 
					&& (Progress.StaticProgressEffectsRunningSession(mPtrArbeitUebung.FkProgress, aProgressPara) === true)
					&& (mPtrArbeitUebung.FkProgress === aProgressPara.ProgressID)
					// Session läuft
					&& (Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession) === true)
				)
				||
				(
					// Schleifen-Übung = Ausgangs-Übung
					(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === true)
					// Der Prozess der Übung wirkt sich nicht auf  laufende Sessions aus 
					&& (Progress.StaticProgressEffectsRunningSession(mPtrArbeitUebung.FkProgress, aProgressPara) === false)
					&& (mPtrArbeitUebung.FkProgress === aProgressPara.AusgangsUebung .FkProgress)
					&& (mPtrArbeitUebung.ProgressGroup === aProgressPara.AusgangsUebung.ProgressGroup)
					// Ausgangs-Session läuft nicht
					&& (Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession) === false)
					// Aktuelle-Session läuft nicht
					&& (Progress.StaticSessionLaeuft(mPrtArbeitSession) === false)
				)
				||
				(
					(      (aProgressPara.SessionDone === true)
						&& (mPtrArbeitUebung.FkUebung === aProgressPara.AusgangsUebung.FkUebung)
						&& (mPtrArbeitUebung.FkProgress === aProgressPara.AusgangsUebung.FkProgress)
						&& (mPtrArbeitUebung.ProgressGroup === aProgressPara.AusgangsUebung.ProgressGroup)
					)
				)
			) {
				let mZielUebung: Uebung;

				if ((aProgressPara.SessionDone === true) || (Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession) === true))
					mZielUebung = aProgressPara.AusgangsUebung;
				else
					mZielUebung = mPtrArbeitUebung;
					
				if (
					(      (aProgressPara.SessionDone === true)
						&& (mPtrArbeitUebung.FkUebung === aProgressPara.AusgangsUebung.FkUebung)
						&& (mPtrArbeitUebung.FkProgress === aProgressPara.AusgangsUebung.FkProgress)
						&& (mPtrArbeitUebung.ProgressGroup === aProgressPara.AusgangsUebung.ProgressGroup)
					)
					||
					(
						   (aProgressPara.SessionDone === false)
						&& (Progress.StaticSetIsDone(aProgressPara.AusgangsSatz))
					)
				) {
					switch (aProgressPara.Wp) {
						case WeightProgress.Increase:
							Progress.StaticSetAllWeights(
								mZielUebung, // mPtrArbeitUebung,
								aProgressPara.AusgangsUebung,
								aProgressPara.AusgangsSatz,
								Arithmetik.Add,
								aProgressPara.AlleSaetze,
								aProgressPara.AusgangsUebung.GewichtSteigerung);
							
							// if (aProgressPara.FailUebung !== undefined) 
							// 	aProgressPara.FailUebung.Failed = false;
 							break;
						
						case WeightProgress.Decrease:
						case WeightProgress.DecreaseNextTime:	
							Progress.StaticSetAllWeights(
								mZielUebung, //mPtrArbeitUebung,
								aProgressPara.AusgangsUebung,
								aProgressPara.AusgangsSatz,
								Arithmetik.Sub,
								aProgressPara.AlleSaetze,
								aProgressPara.AusgangsUebung.GewichtReduzierung);
							
							if (aProgressPara.FailUebung) {
								// aProgressPara.FailUebung.Failed = true;
								// aProgressPara.FailUebung.WeightInitDate = new Date();
							}
							break;
						case WeightProgress.Same:
							// if (aProgressPara.FailUebung !== undefined) 
							// 	aProgressPara.FailUebung.Failed = true;
							break;
					} // switch
					
				}
				else if (aProgressPara.SessionDone === false) {
					// if (aProgressPara.FailUebung !== undefined) 
					// 	aProgressPara.FailUebung.Failed = true;
					
					aProgressPara.Wp = WeightProgress.Decrease;
					Progress.StaticSetAllWeights(
						mZielUebung, // mPtrArbeitUebung,
						aProgressPara.AusgangsUebung,
						aProgressPara.AusgangsSatz,
						Arithmetik.Sub,
						aProgressPara.AlleSaetze);
				}
			}
			// aProgressPara.AusgangsUebung.SatzListe = mPtrArbeitUebung.SatzListe;
					
			aProgressPara.AusgangsSession.UebungsListe.find((u) => {
				const mIsAusgangsUebung = (u.SessionID === aProgressPara.AusgangsUebung.SessionID)
					&& (u.FkUebung === aProgressPara.AusgangsUebung.FkUebung)
					&& (u.ListenIndex === aProgressPara.AusgangsUebung.ListenIndex);

				if (   (u.SessionID === mPtrArbeitUebung.SessionID)
					&& (u.FkUebung === mPtrArbeitUebung.FkUebung)
					&& (u.ListenIndex === mPtrArbeitUebung.ListenIndex)
					)
				{
					if (Progress.StaticEqualUebung(u, mPtrArbeitUebung) === true 
						&&	u.FkAltProgress !== u.FkProgress)
					{
							Progress.StaticManageProgressID(u, aProgressPara.ProgressID);
							Progress.StaticManageProgressID(mPtrArbeitUebung, aProgressPara.ProgressID);
							Progress.StaticManageProgressID(aProgressPara.AusgangsUebung, aProgressPara.ProgressID);
					}//if

					for (let index = 0; index < mPtrArbeitUebung.SatzListe.length; index++) {
						if (index < u.SatzListe.length) {
							const mPrtSatz: Satz = mPtrArbeitUebung.SatzListe[index];
							mPrtSatz.Status = u.SatzListe[index].Status;
							mPrtSatz.WdhAusgefuehrt = u.SatzListe[index].WdhAusgefuehrt;
							mPrtSatz.WdhVonVorgabe = u.SatzListe[index].WdhVonVorgabe;
							mPrtSatz.WdhBisVorgabe = u.SatzListe[index].WdhBisVorgabe;
							mPrtSatz.GewichtAusgefuehrt = u.SatzListe[index].GewichtAusgefuehrt;
							mPrtSatz.GewichtVorgabe = u.SatzListe[index].GewichtVorgabe;
							mPrtSatz.GewichtDiff = u.SatzListe[index].GewichtDiff;
							u.SatzListe[index] = mPrtSatz;
						}
					}
					
					u = mPtrArbeitUebung;
					if (mIsAusgangsUebung === true)
						aProgressPara.AusgangsUebung = mPtrArbeitUebung;
					return true;
				} // if
				return false;
			});
		}//for

		let mUniqueSessionListe: Array<ISession> = [];
		mUniqueSessionListe = mSessionListe.filter((s) =>
			mUniqueSessionListe.indexOf(s) < 0
		);

		if (aProgressPara.ProgressExtraFn !== undefined)
			aProgressPara.ProgressExtraFn(aProgressPara.AusgangsSession);
		
		return null;
	}
}
