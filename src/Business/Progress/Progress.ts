import { LadePara } from './../../app/services/dexie-svc.service';
import { Gewicht } from './../Konfiguration/Gewicht';
import { GewichtDiff } from './../Satz/Satz';
import { AfterLoadFn, DexieSvcService } from 'src/app/services/dexie-svc.service';
import { ITrainingsProgramm, TrainingsProgramm } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { ISession, Session } from './../Session/Session';
import { SessionStatus } from 'src/Business/SessionDB';
import { ArbeitsSaetzeStatus, Uebung } from "../Uebung/Uebung";
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
	DbModule: DexieSvcService;
	AusgangsUebung: Uebung;
	AusgangsSatz: Satz;
	Progress: Progress;
	ProgressHasChanged: boolean;
	SatzDone: boolean;
	ProgressExtraFn?: ProgressExtraFn;
	NextProgressFn?: NextProgressFn;
	AfterLoadFn?: AfterLoadFn;
	ProgressListe?: Array<Progress>;
	ProgressID: number = -1;
	AlteProgressID: number = -1;
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

	private EvalSaetze(aSessUebung: Uebung, aVorgabeWeightLimit: VorgabeWeightLimit): boolean {
		if (this.WeightCalculation === WeightCalculation.Sum)
			return aSessUebung.SummeWDH() >= aSessUebung.SummeVorgabeWDH(aVorgabeWeightLimit);

		for (let index = 0; index < aSessUebung.ArbeitsSatzListe.length; index++) {
			if (aVorgabeWeightLimit === VorgabeWeightLimit.UpperLimit && aSessUebung.ArbeitsSatzListe[index].WdhAusgefuehrt < aSessUebung.ArbeitsSatzListe[index].WdhBisVorgabe) return false;

			if (aVorgabeWeightLimit === VorgabeWeightLimit.LowerLimit && aSessUebung.ArbeitsSatzListe[index].WdhAusgefuehrt < aSessUebung.ArbeitsSatzListe[index].WdhVonVorgabe) return false;
		}
		return true;
	}

	// public async WaitDetermineNextProgress(
	// 	aDb: DexieSvcService,
	// 	aDatum: Date,
	// 	aVorlageProgrammID: number,
	// 	aSatzIndex: number,
	// 	aSessUebung: Uebung
	// ): Promise<WeightProgress> {
	// 	return await this.DetermineNextProgress(
	// 		aDb,
	// 		aDatum,
	// 		aVorlageProgrammID,
	// 		aSatzIndex,
	// 		aSessUebung);
	// }

	public async DetermineNextProgress(
		aDb: DexieSvcService,
		aDatum: Date,
		aVorlageProgrammID: number,
		aSatzIndex: number,
		aSessUebung: Uebung,
		aSession: Session
	): Promise<WeightProgress> {
		let mFailCount = (aSessUebung.FailCount < 0) ? 0 : aSessUebung.FailCount;
		const mProgress: Progress = this;
		
		// return await aDb.transaction("r", [aDb.cSession, aDb.cUebung], async () => {
			if ((aSessUebung.GewichtSteigerung === 0) && (aSessUebung.GewichtReduzierung === 0)) return WeightProgress.Same;

			let mSessionListe: Array<Session> = [];

			// Die Sessions nur laden, wenn die Anzahl der Fehlversuche größer 0 ist.
			if (mFailCount > 0) {
				// Warten, bis Sessions geladen sind.
				const mLadePara: LadePara = new LadePara();
				mLadePara.WhereClause = { FK_VorlageProgramm: aVorlageProgrammID, Kategorie02: SessionStatus.Fertig };
				mLadePara.And = (sess: Session): boolean => {
					return sess.Datum <= aDatum;
				};
				mLadePara.Limit = mFailCount;
				mLadePara.SortBy = "Datum";
				mLadePara.OnSessionAfterLoadFn = (aSessions: Array<Session>) => {
					return aSessions.reverse();
				};

				mSessionListe = await aDb.LadeProgrammSessions(mLadePara);
				
				// mSessionListe = await aDb.SessionTable
				// 	// Suche nach dem gleichen Programm und nur fertige Sessions.
				// 	.where({ FK_VorlageProgramm: aVorlageProgrammID, Kategorie02: SessionStatus.Fertig })
				// 	.and((sess: Session) => sess.Datum <= aDatum)
				// 	// aFailCount ist die Anzahl der Fehlversuche.
				// 	// Daher nur soviele Sessions laden, wie die Anzahl der Fehlversuche ist.
				// 	.limit(mFailCount)
				// 	.sortBy("Datum")
				// 	.then((aSessions: Array<Session>) => {
				// 		return aSessions.reverse();
				// 	});
			} // if

			// public async LadeProgrammSessions(aLadePara: LadePara): Promise<Array<Session>> {
			// 	// SessionDB: "++ID,Name,Datum,ProgrammKategorie,FK_Programm,FK_VorlageProgramm,Kategorie02,[FK_VorlageProgramm+Kategorie02]",
			// 	let mSessions: Array<Session> = [];
			// 	await this.table(this.cSession)
			// 		.where(aLadePara.WhereClause)
			// 		.toArray()
			// 		.then((aSessions: Array<Session>) => {
			// 			mSessions = aSessions;
			// 			if (aLadePara !== undefined) {
			// 				if (aLadePara.OnSessionNoRecordFn !== undefined) mSessions = aLadePara.OnSessionNoRecordFn(aLadePara);
		
			// 				if (aLadePara.OnSessionAfterLoadFn !== undefined) mSessions = aLadePara.OnSessionAfterLoadFn(mSessions);
			// 			}
			// 		});
			// 	return mSessions;
			// }

			if ((mProgress.ProgressSet === ProgressSet.First)
				&& (Progress.StaticSessionLaeuft(aSession) === true)
			)
				mSessionListe.push(aSession);

			// Wenn aFailCount === 0 ist, brauchen die Sessions nicht geprüft werden.
			if (mFailCount === 0) {
				// Wenn aFailCount === 0, gibt es kein Rückgabe WeightProgress.Same
				if (mProgress.ProgressSet === ProgressSet.First && aSatzIndex === 0) {
					// Der erste Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(0) >= aSessUebung.SatzBisVorgabeWDH(0))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
					// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
					if (mProgress.ProgressTyp === ProgressTyp.RepRangeSet) {
						// Prüfen, ob das untere WDH-Limit erreicht ist 
						if (aSessUebung.SatzWDH(0) < aSessUebung.SatzVonVorgabeWDH(0))
							return WeightProgress.Decrease;
					}
				}

				if (mProgress.ProgressSet === ProgressSet.Last && aSatzIndex === aSessUebung.ArbeitsSatzListe.length - 1) {
					// Der letzte Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) >= aSessUebung.SatzBisVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
					// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
					if (mProgress.ProgressTyp === ProgressTyp.RepRangeSet) {
						// Prüfen, ob das untere WDH-Limit erreicht ist 
						if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) < aSessUebung.SatzVonVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1))
							return WeightProgress.Decrease;
					}
				}

				if (mProgress.ProgressSet === ProgressSet.All) {
					// Alle Sätze der Übung.
					if (mProgress.EvalSaetze(aSessUebung, VorgabeWeightLimit.UpperLimit))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
					// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
					if (mProgress.ProgressTyp === ProgressTyp.RepRangeSet) {
						// Prüfen, ob das untere WDH-Limit erreicht ist 
						if (mProgress.EvalSaetze(aSessUebung, VorgabeWeightLimit.LowerLimit) === false)
							return WeightProgress.Decrease;
					}
				}
				// Es konnte noch kein Ergebnis ermittelt werden.
				// Da aber aFailCount === 0 ist, wird mit dem gleichen Gewicht weiter gearbeitet.
				return WeightProgress.Same;
			} // if

			// Wenn die Anzahl der geladenen Sessions kleiner als aFailCount ist, brauchen die Sessions nicht geprüft werden.
			if (mSessionListe.length < mFailCount) {
				// aFailCount ist größer 0
				if (mProgress.ProgressSet === ProgressSet.First && aSatzIndex === 0) {
					// Der erste Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(0) >= aSessUebung.SatzBisVorgabeWDH(0))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
				}

				if (mProgress.ProgressSet === ProgressSet.Last && aSatzIndex === aSessUebung.ArbeitsSatzListe.length - 1) {
					// Der letzte Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) >= aSessUebung.SatzBisVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
				}

				if (mProgress.ProgressSet === ProgressSet.All) {
					// Alle Sätze der Übung.
					if (mProgress.EvalSaetze(aSessUebung, VorgabeWeightLimit.UpperLimit))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
				}
				// Es konnte noch kein Ergebnis ermittelt werden.
				// Da aber aFailCount größer 0 ist, kann mit dem gleichen Gewicht weiter gearbeitet werden.
				return WeightProgress.Same;
			} // if

			mFailCount = 0;

			// Es konnte noch kein Ergebnis ermittelt werden.
			// Die Sessions müssen geprüft werden.
		for (let index = 0; index < mSessionListe.length; index++) {
			const mPrtFertigeSession = mSessionListe[index];

			// Übungen aus den Sessions des aktuellen Programms laden.
			// Die Übungen müssen der Übung aus dem Übergabe-Parameter entsprechen.
			// Das heißt, FKUebung muss die gleiche sein, wie die der Übung aus dem Übergabe-Parameter.
			// Die Progress ID der Übungen muss die gleiche sein, wie die der Übung aus dem Übergabe-Parameter.
			// Die Progress-Gruppe der Übungen die gleiche sein, wie die der Übung aus dem Übergabe-Parameter. 
			// Anhand der Übungsliste kann dann entschieden werden, ob das Gewicht für weitere Trainingseinheiten erhöht oder verringert wird.
			const mLadePara: LadePara = new LadePara();
			mLadePara.WhereClause =
			{
				FK_Programm: mPrtFertigeSession.FK_Programm,
				FkUebung: aSessUebung.FkUebung,
				FkProgress: aSessUebung.FkProgress,
				ProgressGroup: aSessUebung.ProgressGroup
			};
            
			mLadePara.And = (mUebung: Uebung) => {
				// Alle Arbeits-Sätze der Übungen müssen fertig sein.
				return mUebung.ArbeitsSaetzeStatus === ArbeitsSaetzeStatus.AlleFertig;
			};

			// Warten, bis Übungen geladen sind
			let mUebungsListe: Array<Uebung> = await aDb.LadeSessionUebungen(aSession, mLadePara);

				
			if (mUebungsListe === undefined)
				mUebungsListe = [];
				
			if (index === mSessionListe.indexOf(aSession)) {
				aSession.UebungsListe.forEach((u) => {
					if (u.FkUebung === aSessUebung.FkUebung
						&& u.FkProgress === aSessUebung.FkProgress
						&& u.ProgressGroup === aSessUebung.ProgressGroup
					)
						mUebungsListe.push(u)
				});
			}

			if (mUebungsListe.length > 0) {
				for (let index = 0; index < mUebungsListe.length; index++) {
					const mSessUebung = mUebungsListe[index];
					// Nicht die Uebung aus den Übergabe-Parametern mit sich selbst vergleichen
					// if (
					// 	mSessUebung.ID === aSessUebung.ID ||
					// 	// Nur Uebungen mit gleichen Progress-Schemas vergleichen
					// 	// aSessUebung.FkProgress !== mSessUebung.FkProgress
					// )
					// 	continue;

					// Der erste Satz ist maßgebend.
					if (mProgress.ProgressSet === ProgressSet.First && aSatzIndex === 0) {
						// Der erste Satz der Übung ist maßgebend.
						if (mSessUebung.SatzWDH(0) >= mSessUebung.SatzBisVorgabeWDH(0))
							// Die vorgegebenen Wiederholungen konnten erreicht werden
							return WeightProgress.Increase;
						else {
							// Wenn der Prozesstyp nicht Blockset ist, muss 
							if ((mProgress.ProgressTyp === ProgressTyp.BlockSet) ||
								// er RepRange sein. Daher das untere Limit prüfen.
								(mSessUebung.SatzWDH(0) < mSessUebung.SatzVonVorgabeWDH(0)))
								mFailCount++
						}
					}

					// Der letzte Satz ist maßgebend.
					if (mProgress.ProgressSet === ProgressSet.Last && aSatzIndex === mSessUebung.ArbeitsSatzListe.length - 1) {
						// Der letzte Satz der Übung ist maßgebend.
						if (mSessUebung.SatzWDH(mSessUebung.ArbeitsSatzListe.length - 1) >= mSessUebung.SatzBisVorgabeWDH(mSessUebung.ArbeitsSatzListe.length - 1))
							// Die vorgegebenen Wiederholungen konnten erreicht werden
							return WeightProgress.Increase;
						else {
							// Wenn der Prozesstyp nicht Blockset ist, muss 
							if ((mProgress.ProgressTyp === ProgressTyp.BlockSet) ||
								// er RepRange sein. Daher das untere Limit prüfen.
								(mSessUebung.SatzWDH(mSessUebung.ArbeitsSatzListe.length - 1) < mSessUebung.SatzVonVorgabeWDH(mSessUebung.ArbeitsSatzListe.length - 1)))
								mFailCount++
						}
					}

					// Alle Sätze prüfen
					if (mProgress.ProgressSet === ProgressSet.All) {
						// Alle Sätze der Übung.
						if (this.EvalSaetze(mSessUebung, VorgabeWeightLimit.UpperLimit))
							// Die vorgegebenen Wiederholungen konnten erreicht werden
							return WeightProgress.Increase;
						else {
							// Wenn der Prozesstyp nicht Blockset ist, muss... 
							if ((mProgress.ProgressTyp === ProgressTyp.BlockSet) ||
								// ...er RepRange sein. Daher das untere Limit prüfen.
								(this.EvalSaetze(mSessUebung, VorgabeWeightLimit.LowerLimit) === false))
								mFailCount++
						}
					}
				} // for

				if (mFailCount >= aSessUebung.FailCount)
					return WeightProgress.Decrease;
				else
					return WeightProgress.Same;
			}//if
		}
			return WeightProgress.Same;
		// });
		// }).then( (mProgress) => {
		// 	return mProgress;
		// });
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
					mDiff = aUebung.GewichtReduzierung;
					break;
			}
		}
		
		// mSatzListe.forEach((sz) => {
		// 	sz.GewichtDiff = mDiff;
		// 	sz.AddToDoneWeight(mDiff);
		// 	sz.SetPresetWeight(sz.GewichtAusgefuehrt);
		// });

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

		const mProgressParaMerker: ProgressPara = aProgressPara;
		const mProgressListe: Array<Progress> = mProgressParaMerker.ProgressListe;
		mProgressParaMerker.Progress = mProgressListe.find((p) => p.ID === mProgressParaMerker.AusgangsUebung.FkProgress);
		// Sätze der aktuellen Übung durchnummerieren
		mProgressParaMerker.AusgangsUebung.nummeriereSatzListe(mProgressParaMerker.AusgangsUebung.SatzListe);
		// Hole alle Sätze aus der aktuellen Session, in der die aktuelle Übung mehrfach vorkommt
		// Aus der Satzliste der aktuellen Übung die Sätze mit dem Status "Wartet" in mSatzliste sammeln
		const mSatzListe = mProgressParaMerker.AusgangsSession.AlleUebungsSaetzeEinerProgressGruppe(mProgressParaMerker.AusgangsUebung, SatzStatus.Wartet);
		const mSessionsListe: Array<Session> = mProgressParaMerker.DbModule.UpComingSessionList();

		let mNextProgress: NextProgress;
		if ((mProgressParaMerker.SatzDone) && (mProgressParaMerker.Progress))
			mNextProgress =
				Progress.StaticDoSaetzeProgress(
					mSatzListe,
					mSessionsListe,
					mProgressParaMerker.AusgangsSatz as Satz,
					mProgressParaMerker.AusgangsUebung,
					mProgressParaMerker.AusgangsSession as Session,
					mProgressParaMerker.Progress.ProgressSet);                
			
		if (mProgressParaMerker.Progress) {
			if ( true
				// (mProgressParaMerker.AusgangsSatz.SatzListIndex === 0)
				// && (mProgressParaMerker.Progress.ProgressTyp === ProgressTyp.BlockSet)
				// && (mProgressParaMerker.Progress.ProgressSet === ProgressSet.First)
				// || (mProgressParaMerker.AusgangsUebung.FkAltProgress !== mProgressParaMerker.AusgangsUebung.FkProgress)
			) {
				const mWp: WeightProgress =
					await mProgressParaMerker.Progress.DetermineNextProgress(
						mProgressParaMerker.DbModule,
						new Date,
						mProgressParaMerker.AusgangsSession.FK_VorlageProgramm,
						mProgressParaMerker.AusgangsSatz.SatzListIndex,
						mProgressParaMerker.AusgangsUebung,
						mProgressParaMerker.AusgangsSession as Session
					);
				
					if (mWp !== WeightProgress.Same) {
						const mProgressPara: ProgressPara = new ProgressPara();
						mProgressPara.ProgressListe = aProgressPara.ProgressListe;
						mProgressPara.AusgangsSession = mProgressParaMerker.AusgangsSession;
						mProgressPara.AusgangsUebung = mProgressParaMerker.AusgangsUebung;
						mProgressPara.AusgangsSatz = mProgressParaMerker.AusgangsSatz;
						mProgressPara.DbModule = mProgressParaMerker.DbModule;
						mProgressPara.Programm = mProgressParaMerker.Programm;
						mProgressPara.Progress = mProgressParaMerker.Progress;
						mProgressPara.ProgressID = mProgressParaMerker.Progress ? mProgressParaMerker.Progress.ID : -1;
						mProgressPara.AlteProgressID = mProgressParaMerker.AusgangsUebung.FkAltProgress;
						mProgressPara.ProgressHasChanged = mProgressPara.AlteProgressID !== mProgressPara.ProgressID;
						// mProgressPara.Wp = mProgressParaMerker.AusgangsUebung.FkProgress === undefined ? WeightProgress.Decrease : mProgressParaMerker.AusgangsUebung.WeightProgress;
					
						if (mProgressPara.ProgressHasChanged === true) {
							if (
								(mProgressParaMerker.AusgangsSatz.Status === SatzStatus.Wartet)
								&& (Progress.StaticFindDoneSet(mProgressParaMerker.AusgangsSession, mProgressParaMerker.AusgangsUebung) === true)
							)
								mProgressPara.Wp = mWp;
							else
								mProgressPara.Wp = mProgressParaMerker.AusgangsSatz.Status === SatzStatus.Wartet ? WeightProgress.Decrease : mWp;
						}
						else {
							mProgressPara.Wp = mWp;
						}
					
						mProgressPara.SatzDone = mProgressParaMerker.SatzDone;
						Progress.StaticProgrammSetNextWeight(mProgressPara);
					}
			}
		} else {
			const mProgressPara: ProgressPara = new ProgressPara();
			mProgressPara.AusgangsSession = mProgressParaMerker.AusgangsSession;
			mProgressPara.AusgangsUebung = mProgressParaMerker.AusgangsUebung;
			mProgressPara.AusgangsSatz = mProgressParaMerker.AusgangsSatz;
			mProgressPara.DbModule = mProgressParaMerker.DbModule;
			mProgressPara.Programm = mProgressParaMerker.Programm;
			mProgressPara.Progress = mProgressParaMerker.Progress;
			mProgressPara.ProgressID = mProgressParaMerker.Progress ? mProgressParaMerker.Progress.ID : -1;
			mProgressPara.AlteProgressID = mProgressParaMerker.AusgangsUebung.FkAltProgress;
			mProgressPara.ProgressHasChanged = mProgressPara.AlteProgressID !== mProgressPara.ProgressID;
			mProgressPara.Wp = mProgressParaMerker.AusgangsUebung.FkProgress === undefined ? WeightProgress.Decrease : mProgressParaMerker.AusgangsUebung.WeightProgress;
			mProgressPara.SatzDone = mProgressParaMerker.SatzDone;
			mProgressPara.ProgressListe = aProgressPara.ProgressListe;
			Progress.StaticProgrammSetNextWeight(mProgressPara);
		}
		
		if ((mProgressParaMerker.SatzDone) && (mProgressParaMerker.NextProgressFn)) {
			mProgressParaMerker.NextProgressFn(mNextProgress);
		}
		
		if (aProgressPara.ProgressExtraFn !== undefined)
			aProgressPara.ProgressExtraFn(aProgressPara.AusgangsSession);
		
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

	private static StaticProgressEffectsRunningSession(aProgressID: number, aProgressPara: ProgressPara ): boolean{
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

	private static StaticSetAllWeights(aUebung: Uebung, aAusgangsUebung: Uebung, aAusgangsSatz: Satz, aArithmetik: Arithmetik,  aWeight: number = this.cIgnoreWeight): void {
		aUebung.ArbeitsSatzListe.forEach(
			(sz) => {
				if (Progress.StaticEqualSet(aAusgangsSatz, sz) === false)
				{
					if (aArithmetik === Arithmetik.Add) {
						const mGewichtDiff: GewichtDiff = new GewichtDiff();
						mGewichtDiff.Gewicht = aWeight;
						mGewichtDiff.FromSet = aAusgangsSatz;
						mGewichtDiff.Uebung = aAusgangsUebung;
						Progress.StaticSetWeight(mGewichtDiff, sz, aArithmetik);
					}
					else {
						if (sz.GewichtDiff.length > 0) {
							const mGewichtDiff: GewichtDiff = sz.GewichtDiff.find((gdiff) => { return Progress.StaticEqualSet(gdiff.FromSet, aAusgangsSatz); })
							if (mGewichtDiff !== undefined)
								Progress.StaticSetWeight(mGewichtDiff, sz, aArithmetik);
						}
					}
				}
			})
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


	private static StaticResetAllWeights(mUebung: Uebung, aProgressID: number): void {
		mUebung.ArbeitsSatzListe.forEach(
			(sz) => {
				const mGewichtDiff = sz.GewichtDiff.find(
					(gdiff) => {
						return (
							//    (gdiff.Uebung.FkAltProgress === aProgressID || mUebung.FkAltProgress === aProgressID)
							   (gdiff.Uebung.FkAltProgress === aProgressID)
							&& (mUebung.ID === gdiff.Uebung.ID)
							||
							(		(mUebung.FkUebung === gdiff.Uebung.FkUebung)
								&& 	(mUebung.ProgressGroup === gdiff.Uebung.ProgressGroup))
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
	
	public static StaticProgrammSetNextWeight(aProgressPara: ProgressPara):Promise<void> {
		class ProgressExercise { Session: ISession; Uebung: Uebung; Progress: Progress; StornoProgress: Progress };

		let mAlleUebungenEinerProgressGruppe: Array<Uebung>;
		// Temporäre Liste der Uebungen
		const mTodoListe: Array<ProgressExercise> = [];
		// aProgressPara.AfterLoadFn =
			// Alle vorhandenen Progress-Typen laden
			// After-Load-Call-Back ausführen
			// (aProgressPara: ProgressPara) => {
				if (aProgressPara.AusgangsUebung) {
					 if (Progress.StaticProgressHasChanged(aProgressPara)) 
					// 	// mAlleUebungenEinerProgressGruppe = aProgressPara.AusgangsSession.AlleUebungenDerAktuellenProgressGruppe(aProgressPara.AusgangsUebung, aProgressPara.AlteProgressID);
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
							mCmpSession.ID !== aProgressPara.AusgangsSession.ID && mCmpSession.Kategorie02 === SessionStatus.Wartet
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

								if (aProgressPara.AusgangsUebung.ID === mCmpUebPtr.ID
									||
									(
										aProgressPara.AusgangsUebung.SessionID === mCmpUebPtr.SessionID
									&& 	aProgressPara.AusgangsUebung.ListenIndex === mCmpUebPtr.ListenIndex
									
									))
									mCmpUebPtr = aProgressPara.AusgangsUebung;

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
					let mPtrArbeitUebung: Uebung = mPtrTodoUebung;

					for (let mSessionIndex = 0; mSessionIndex < aProgressPara.Programm.SessionListe.length; mSessionIndex++) {
						const mPrtSession = aProgressPara.Programm.SessionListe[mSessionIndex];
						if (Progress.StaticProgressHasChanged(aProgressPara)) {
							mPtrArbeitUebung = mPrtSession.UebungsListe.find((u) =>
								u.SessionID === mPtrTodoUebung.SessionID &&
								u.FkUebung === mPtrTodoUebung.FkUebung &&
								u.ListenIndex === mPtrTodoUebung.ListenIndex &&
								// u.FkAltProgress === mPtrTodoUebung.FkAltProgress &&
								u.ProgressGroup === mPtrTodoUebung.ProgressGroup
							);
						} else {
							mPtrArbeitUebung = mPrtSession.UebungsListe.find((u) =>
								u.SessionID === mPtrTodoUebung.SessionID &&
								u.FkUebung === mPtrTodoUebung.FkUebung &&
								u.ListenIndex === mPtrTodoUebung.ListenIndex &&
								// u.FkProgress === mPtrTodoUebung.FkProgress &&
								u.ProgressGroup === mPtrTodoUebung.ProgressGroup
							);
						}
						
						if (mPtrArbeitUebung)
							break;
					}

					if (mPtrArbeitUebung === undefined)
						continue;

					if (mPtrArbeitUebung.FkUebung !== aProgressPara.AusgangsUebung.FkUebung)
						continue;

					const mPrtArbeitSession = mTodoListe[mTodoIndex].Session;
					
					mPtrArbeitUebung.nummeriereSatzListe(mPtrArbeitUebung.SatzListe);
					
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
							Progress.StaticResetAllWeights( mPtrArbeitUebung,  aProgressPara.AlteProgressID);
						} //if
						else if (
								(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === true)
							&& 	Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara)
							&& 	Progress.StaticFirstSetDone(aProgressPara.AusgangsUebung)
						) {
							Progress.StaticResetAllWeights( mPtrArbeitUebung,  aProgressPara.AlteProgressID);
						} //if
						else if (
							// Schleifen-Übung <> Ausgangs-Übung
								(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === false)
							// Alter Prozess der Ausgangs-Übung wirkt sich auf laufende Sessions aus 
							&& (Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara) === true)
							// Es gibt eine Änderung der Sätze mit dem alten Prozess  
							&& (Progress.StaticSetHasChangedByProcess(mPtrArbeitUebung, aProgressPara) === true)
						) {
							Progress.StaticResetAllWeights( mPtrArbeitUebung,  aProgressPara.AlteProgressID);
						} //if
						else if (
							// Schleifen-Übung = Ausgangs-Übung
								(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === true)
							// Alter Prozess der Ausgangs-Übung wirkt sich auf laufende Sessions aus 
							&& Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara)
						) {
							Progress.StaticResetAllWeights( mPtrArbeitUebung,  aProgressPara.AlteProgressID);
						} //if					
					} // if
				

					if (
						(
							// Schleifen-Übung = Ausgangs-Übung
							(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === true)
					 		// Prozess wirkt sich auf laufende Sessions aus 
						&& 	(Progress.StaticProgressEffectsRunningSession(aProgressPara.ProgressID, aProgressPara) === true)
							// Session läuft
						&& 	(Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession) === true)
						)
						||
						(
							// Schleifen-Übung <> Ausgangs-Übung
							(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === false)
					 		// Der Prozess der Übung wirkt sich auf laufende Sessions aus 
						&& 	(Progress.StaticProgressEffectsRunningSession(mPtrArbeitUebung.FkProgress, aProgressPara) === true)
						&& 	(mPtrArbeitUebung.FkProgress === aProgressPara.ProgressID )
							// Session läuft
						&& 	(Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession) === true)
						)
						||
						(
							// Schleifen-Übung <> Ausgangs-Übung
							(Progress.StaticEqualUebung(mPtrArbeitUebung, aProgressPara.AusgangsUebung) === false)
					 		// Der Prozess der Übung wirkt sich auf nicht laufende Sessions aus 
						&& 	(Progress.StaticProgressEffectsRunningSession(mPtrArbeitUebung.FkProgress, aProgressPara) === false)
						&& 	(mPtrArbeitUebung.FkProgress === aProgressPara.ProgressID )
						 	// Ausgangs-Session läuft nicht
						&& 	(Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession) === false)
						 	// Aktuelle-Session läuft nicht
						&& 	(Progress.StaticSessionLaeuft(mPrtArbeitSession) === false)
						)
					) {
						// if (Progress.StaticEqualUebung(mPtrUebung, aProgressPara.AusgangsUebung)) {
						// Die Übung ist die Ausgangübung
						if (Progress.StaticSetIsDone(aProgressPara.AusgangsSatz)
							// ||
							// Progress.StaticFindDoneSet(aProgressPara.AusgangsSession, mPtrArbeitUebung)
						)
						{
							// Der Ausgangsatz ist erledigt.
							switch (aProgressPara.Wp) {
								case WeightProgress.Increase:
									Progress.StaticSetAllWeights(
										mPtrArbeitUebung,
										aProgressPara.AusgangsUebung,
										aProgressPara.AusgangsSatz,
										Arithmetik.Add,
										aProgressPara.AusgangsUebung.GewichtSteigerung);
									break;
						
								case WeightProgress.Decrease:
									Progress.StaticSetAllWeights(
										mPtrArbeitUebung,
										aProgressPara.AusgangsUebung,
										aProgressPara.AusgangsSatz,
										Arithmetik.Sub,
										aProgressPara.AusgangsUebung.GewichtReduzierung);
									break;
							} // switch
						}
						else {
							// Der Ausgangsatz ist nicht erledigt.
							Progress.StaticSetAllWeights(
								mPtrArbeitUebung,
								aProgressPara.AusgangsUebung,
								aProgressPara.AusgangsSatz,
								Arithmetik.Sub);
						}
					}
					
					aProgressPara.AusgangsSession.UebungsListe.find((u) => {
						if ((u.SessionID === mPtrArbeitUebung.SessionID) &&
							(u.FkUebung === mPtrArbeitUebung.FkUebung) &&
							(u.ListenIndex === mPtrArbeitUebung.ListenIndex))
						{
							if (Progress.StaticEqualUebung(u, mPtrArbeitUebung) === true) {
								if (u.FkAltProgress !== u.FkProgress)
								{
									Progress.StaticManageProgressID(u, aProgressPara.ProgressID);
									Progress.StaticManageProgressID(mPtrArbeitUebung, aProgressPara.ProgressID);
									Progress.StaticManageProgressID(aProgressPara.AusgangsUebung, aProgressPara.ProgressID);
								}
							}
							for (let index = 0; index < mPtrArbeitUebung.SatzListe.length; index++) {
								if (index < u.SatzListe.length) {
									const mPrtSatz: Satz = mPtrArbeitUebung.SatzListe[index];
									mPrtSatz.Status = u.SatzListe[index].Status;
									u.SatzListe[index] = mPrtSatz;
								}
							}

							u = mPtrArbeitUebung;
							return true;
						} // if
						return false;
					});

					
					// aProgressPara.Programm.SessionListe.find((ss) => {
					// 	if (
					// 		ss.FK_Programm === aProgressPara.AusgangsSession.FK_Programm
					// 		&& ss.ListenIndex === aProgressPara.AusgangsSession.ListenIndex
					// 	) {
					// 		ss = aProgressPara.AusgangsSession;
					// 		// ss.UebungsListe.find((u)=> {
					// 		// 	if (Progress.StaticEqualUebung(u, mPtrArbeitUebung))
					// 		// 	{
					// 		// 		u = mPtrArbeitUebung;
					// 		// 		// for (let index = 0; index < mPtrArbeitUebung.SatzListe.length; index++)
					// 		// 		// {
					// 		// 		// 	if (index < mPtrArbeitUebung.SatzListe.length) {
					// 		// 		// 		u.SatzListe[index] = mPtrArbeitUebung.SatzListe[index];
					// 		// 		// 		// const mPrtSatz: Satz = u.SatzListe[index];
					// 		// 		// 		// mPrtSatz.Status = mPtrArbeitUebung.SatzListe[index].Status;
					// 		// 		// 		// mPrtSatz.SatzListe[index] = mPrtSatz;
					// 		// 		// 	}
					// 		// 		// }//for
					// 		// 	}//if
									
					// 		// });
					// 	}//if
					// });
		
					
				}//for


				let mUniqueSessionListe: Array<ISession> = [];
				mUniqueSessionListe = mSessionListe.filter((s) =>
					mUniqueSessionListe.indexOf(s) < 0
				);

				mUniqueSessionListe.forEach((s) => {
					if (aProgressPara.AusgangsSession.Kategorie02 !== SessionStatus.Laueft)
						aProgressPara.DbModule.SessionSpeichern(s as Session);
				
				});
		return null;
	}
}
