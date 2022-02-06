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
	NextProgressFn?: NextProgressFn;
	AfterLoadFn?: AfterLoadFn;
	ProgressListe?: Array<Progress>;
	ProgressID: number = 0;
	AlteProgressID: number = 0;
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

enum Arithmetik {
	Add, Sub
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

	public async WaitDetermineNextProgress(
		aDb: DexieSvcService,
		aDatum: Date,
		aVorlageProgrammID: number,
		aSatzIndex: number,
		aSessUebung: Uebung
	): Promise<WeightProgress> {
		return await this.DetermineNextProgress(
			aDb,
			aDatum,
			aVorlageProgrammID,
			aSatzIndex,
			aSessUebung);
	}

	public async DetermineNextProgress(
		aDb: DexieSvcService,
		aDatum: Date,
		aVorlageProgrammID: number,
		aSatzIndex: number,
		aSessUebung: Uebung
	): Promise<WeightProgress> {
		let mFailCount = (aSessUebung.FailCount < 0) ? 0 : aSessUebung.FailCount;
		const mProgress: Progress = this;
		
		return aDb.transaction("r", [aDb.cSession, aDb.cUebung], async () => {
			if ((aSessUebung.GewichtSteigerung === 0)&&(aSessUebung.GewichtReduzierung === 0)) return WeightProgress.Same;

			let mSessionListe: Array<Session> = [];

			// Die Sessions nur laden, wenn die Anzahl der Fehlversuche größer 0 ist.
			if (mFailCount > 0) {
				// Warten, bis Sessions geladen sind.
				mSessionListe = await aDb.SessionTable
					// Suche nach dem gleichen Programm und nur fertige Sessions.
					.where({ FK_VorlageProgramm: aVorlageProgrammID, Kategorie02: SessionStatus.Fertig })
					.and((sess: Session) => sess.Datum <= aDatum)
					// aFailCount ist die Anzahl der Fehlversuche.
					// Daher nur soviele Sessions laden, wie die Anzahl der Fehlversuche ist.
					.limit(mFailCount)
					.sortBy("Datum")
					.then((aSessions: Array<Session>) => {
						return aSessions.reverse();
					});
			} // if

			// Wenn aFailCount === 0 ist, brauchen die Sessions nicht geprüft werden.
			if (mFailCount === 0) {
				// Wenn aFailCount === 0, gibt es kein Rückgabe WeightProgress.Same
				if (mProgress.ProgressSet === ProgressSet.First && aSatzIndex === 0) {
					// Der erste Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(0) >= aSessUebung.SatzBisVorgabeWDH(0))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
					// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
					if(mProgress.ProgressTyp === ProgressTyp.RepRangeSet) {
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
				const mSess = mSessionListe[index];
				// Warten, bis Übungen geladen sind
				const mUebungsListe: Array<Uebung> = await aDb
					.table(aDb.cUebung)
					.where({ SessionID: mSess.ID, FkUebung: aSessUebung.FkUebung, FkProgress: aSessUebung.FkProgress })
					.and((mUebung: Uebung) => (mUebung.ID !== aSessUebung.ID) && (mUebung.ArbeitsSaetzeStatus === ArbeitsSaetzeStatus.AlleFertig))
					.toArray()
					.then((mUebungen) => {
						return mUebungen;
					});

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
				}
			}
			return WeightProgress.Same;
		}).then( (mProgress) => {
			return mProgress;
		});
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

	public static StaticDoProgress(aProgressPara: ProgressPara) {
		const mProgressParaMerker: ProgressPara = aProgressPara;
		mProgressParaMerker.AfterLoadFn = 
			(aProgressPara: ProgressPara) => {
				// (  mProgressListe: Array<Progress>) => {				
				const mProgressListe: Array<Progress> = aProgressPara.ProgressListe;
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
                    if (   (mProgressParaMerker.AusgangsSatz.SatzListIndex === 0)
                        && (mProgressParaMerker.Progress.ProgressTyp === ProgressTyp.BlockSet)
						&& (mProgressParaMerker.Progress.ProgressSet === ProgressSet.First)
						|| (mProgressParaMerker.AusgangsUebung.FkAltProgress !== mProgressParaMerker.AusgangsUebung.FkProgress)
					) {
						mProgressParaMerker.Progress.DetermineNextProgress(	mProgressParaMerker.DbModule,
																		new Date,
																		mProgressParaMerker.AusgangsSession.FK_VorlageProgramm,
																		mProgressParaMerker.AusgangsSatz.SatzListIndex,
																		mProgressParaMerker.AusgangsUebung)
                            .then((wp: WeightProgress) => {
                                const mProgressPara: ProgressPara = new ProgressPara();
                                mProgressPara.AusgangsSession = mProgressParaMerker.AusgangsSession;
                                mProgressPara.AusgangsUebung = mProgressParaMerker.AusgangsUebung;
                                mProgressPara.AusgangsSatz = mProgressParaMerker.AusgangsSatz;
                                mProgressPara.DbModule = mProgressParaMerker.DbModule;
                                mProgressPara.Programm = mProgressParaMerker.Programm;
                                mProgressPara.Progress = mProgressParaMerker.Progress;
								mProgressPara.ProgressID = mProgressParaMerker.Progress ? mProgressParaMerker.Progress.ID : 0;
								mProgressPara.AlteProgressID = mProgressParaMerker.AusgangsUebung.FkAltProgress;
								mProgressPara.ProgressHasChanged = mProgressPara.AlteProgressID !== mProgressPara.ProgressID;
								// mProgressPara.Wp = mProgressParaMerker.AusgangsUebung.FkProgress === undefined ? WeightProgress.Decrease : mProgressParaMerker.AusgangsUebung.WeightProgress;
								mProgressPara.Wp = mProgressParaMerker.AusgangsSatz.Status === SatzStatus.Wartet ? WeightProgress.Decrease : wp;
                                mProgressPara.SatzDone = mProgressParaMerker.SatzDone;
                                Progress.StaticProgrammSetNextWeight(mProgressPara);
                            });
                    }
				} else {
					const mProgressPara: ProgressPara = new ProgressPara();
					mProgressPara.AusgangsSession = mProgressParaMerker.AusgangsSession;
					mProgressPara.AusgangsUebung = mProgressParaMerker.AusgangsUebung;
					mProgressPara.AusgangsSatz = mProgressParaMerker.AusgangsSatz;
					mProgressPara.DbModule = mProgressParaMerker.DbModule;
					mProgressPara.Programm = mProgressParaMerker.Programm;
					mProgressPara.Progress = mProgressParaMerker.Progress;
					mProgressPara.ProgressID = mProgressParaMerker.Progress ? mProgressParaMerker.Progress.ID : 0;
					mProgressPara.AlteProgressID = mProgressParaMerker.AusgangsUebung.FkAltProgress;
					mProgressPara.ProgressHasChanged = mProgressPara.AlteProgressID !== mProgressPara.ProgressID;
					mProgressPara.Wp = mProgressParaMerker.AusgangsUebung.FkProgress === undefined ? WeightProgress.Decrease : mProgressParaMerker.AusgangsUebung.WeightProgress;
					mProgressPara.SatzDone = mProgressParaMerker.SatzDone;
					Progress.StaticProgrammSetNextWeight(mProgressPara);
				}
    
				if ((mProgressParaMerker.SatzDone) && (mProgressParaMerker.NextProgressFn))
					mProgressParaMerker.NextProgressFn(mNextProgress);
			};
		mProgressParaMerker.DbModule.LadeProgress(mProgressParaMerker);
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

	public static StaticEqualSet(aSatz1 : Satz, aSatz2: Satz): boolean{
		return (aSatz1 !== undefined &&
			    aSatz2 !== undefined &&
			    aSatz1.SessionID === aSatz2.SessionID &&
			    aSatz1.UebungID === aSatz2.UebungID &&
				aSatz1.SatzListIndex === aSatz2.SatzListIndex);
	}

	public static StaticEqualUebung(aUebung1 : Uebung, aUebung2: Uebung): boolean{
		return (aUebung1 !== undefined &&
			    aUebung2 !== undefined &&
			    aUebung1.SessionID === aUebung2.SessionID &&
			    aUebung1.FkUebung === aUebung2.FkUebung &&
				aUebung1.ListenIndex === aUebung2.ListenIndex);
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

	private static StaticNewProgressExists(aUebung: Uebung): boolean{
		return (aUebung.FkProgress !== undefined);
	}

	private static StaticFirstSetIsWaiting(aUebung: Uebung): boolean {
		return (aUebung.ArbeitsSatzListe.find((sz) =>
			   (sz.SatzListIndex === 0)
			&& (sz.Status === SatzStatus.Wartet)) !== undefined);
	}

	private static StaticSessionLaeuft(aSession: ISession): boolean{
		return (aSession.Kategorie02 === SessionStatus.Laueft);
	}

	private static StaticSetWeight(aGewichtDiff: number, aSatz: Satz, aArithmetik: Arithmetik): void {
		if (aSatz.Status === SatzStatus.Wartet) {
			if (aArithmetik === Arithmetik.Sub) {
				aSatz.AddToDoneWeight(-aGewichtDiff);
				aSatz.GewichtDiff.pop();
			}
			else {
				aSatz.AddToDoneWeight(aGewichtDiff);
				aSatz.GewichtDiff.push(aGewichtDiff);
			}
		
			aSatz.SetPresetWeight(aSatz.GewichtAusgefuehrt);
		}
	}

	// private static StaticSetWeightDiffs(mUebung: Uebung, aAusgangsSatz: Satz,  aArithmetik: Arithmetik, aWeight: number = 0): void {
	// 	mUebung.ArbeitsSatzListe.forEach(
	// 		(sz) => {
	// 			if (Progress.StaticEqualSet(aAusgangsSatz, sz) === false) {
	// 				if(aArithmetik === Arithmetik.Add)
	// 					sz.GewichtDiff.push(aWeight);
	// 				else
	// 					sz.GewichtDiff.pop();
	// 			}
	// 		}
	// 	)
	// }
	
	private static StaticSetAllWeights(mUebung: Uebung, aAusgangsSatz: Satz, aArithmetik: Arithmetik,  aWeight: number = this.cIgnoreWeight): void {
		mUebung.ArbeitsSatzListe.forEach(
			(sz) => {
				if (Progress.StaticEqualSet(aAusgangsSatz, sz) === false) {
					if (aWeight !== this.cIgnoreWeight)
						Progress.StaticSetWeight(aWeight, sz, aArithmetik);
					else
						if (sz.GewichtDiff.length > 0)
							Progress.StaticSetWeight(sz.GewichtDiff[sz.GewichtDiff.length - 1], sz, aArithmetik);
				}
			}
		)
	}

	private static StaticSetIsDone(aSatz: Satz): boolean {
		return aSatz.Status === SatzStatus.Fertig;
	}

	private static StaticResetAllWeights(mUebung: Uebung, aAusgangsSatz: Satz, aWeight: number = this.cIgnoreWeight): void {
		mUebung.ArbeitsSatzListe.forEach(
			(sz) => {
				if (Progress.StaticEqualSet(aAusgangsSatz, sz) === false) {
					if (aWeight !== this.cIgnoreWeight)
						Progress.StaticSetWeight(aWeight, sz, Arithmetik.Sub);
					else
					{
						if (sz.GewichtDiff.length > 0) {
							Progress.StaticSetWeight(sz.GewichtDiff.pop(), sz, Arithmetik.Sub);
						}
					}
				}
			}
		)
	}
	
	public static StaticProgrammSetNextWeight(aProgressPara: ProgressPara):void {
		class ProgressExercise { Session: ISession; Uebung: Uebung; Progress: Progress; StornoProgress: Progress };

		let mAlleUebungenEinerProgressGruppe: Array<Uebung>;
		// Temporäre Liste der Uebungen
		const mTodoListe: Array<ProgressExercise> = [];
		aProgressPara.AfterLoadFn =
			// Alle vorhandenen Progress-Typen laden
			// After-Load-Call-Back ausführen
			(aProgressPara: ProgressPara) => {
				if (aProgressPara.AusgangsUebung) {
					if (Progress.StaticProgressHasChanged(aProgressPara)) 
						mAlleUebungenEinerProgressGruppe = aProgressPara.AusgangsSession.AlleUebungenDerAktuellenProgressGruppe(aProgressPara.AusgangsUebung, aProgressPara.AlteProgressID);
						// mAlleUebungenEinerProgressGruppe = aProgressPara.AusgangsSession.AlleUebungenDerAltenProgressGruppe(aProgressPara.AusgangsUebung);
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
					let mPtrUebung: Uebung;
					for (let mSessionIndex = 0; mSessionIndex < aProgressPara.Programm.SessionListe.length; mSessionIndex++) {
						const mPrtSession = aProgressPara.Programm.SessionListe[mSessionIndex];
							mPtrUebung = mPrtSession.UebungsListe.find((u) =>
								u.SessionID === mPtrTodoUebung.SessionID &&
								u.FkUebung === mPtrTodoUebung.FkUebung &&
								u.ListenIndex === mPtrTodoUebung.ListenIndex &&
								u.FkProgress === mPtrTodoUebung.FkProgress &&
								u.ProgressGroup === mPtrTodoUebung.ProgressGroup
						);
						
						if (mPtrUebung)
							break;
							
							// if (mUebung) {
							// 	for (let index = 0; index < mPtrUebung.SatzListe.length; index++) {
							// 		if (index < mUebung.SatzListe.length) {
							// 			const mPrtSatz: Satz = mPtrUebung.SatzListe[index];
							// 			const mNeuSatz: Satz = mPrtSatz.Copy();
							// 			mNeuSatz.Status = mUebung.SatzListe[index].Status;
							// 			mUebung.SatzListe[index] = mNeuSatz;
										
							// 		}
							// 	}
							// }
					}

					if (mPtrUebung === undefined)
						continue;


//					const mPtrUebung: Uebung = mTodoListe[index].Uebung;
					const mProgress: Progress = mTodoListe[mTodoIndex].Progress;
					const mSession: ISession = mTodoListe[mTodoIndex].Session;
					
					// if ((Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara) === false)
					// 	&& (aProgressPara.AusgangsSession.ID !== mSession.ID || aProgressPara.AusgangsSession.ListenIndex !== mSession.ListenIndex)
					// 	&& Progress.StaticSessionLaeuft(mSession)
					// )
					//  	continue;

					if (mPtrUebung.FkUebung !== aProgressPara.AusgangsUebung.FkUebung)
						continue;
					
					mPtrUebung.nummeriereSatzListe(mPtrUebung.SatzListe);
					
					// if (Progress.StaticProgressHasChanged(aProgressPara)) {
					// 	// Progress-Schema ist geändert worden 
					// 	if (Progress.StaticProgressEffectsRunningSession(aProgressPara.AlteProgressID, aProgressPara)
					// 		&& Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession)) {
					// 		Progress.StaticResetAllWeights(mPtrUebung, aProgressPara.AusgangsSatz);
					// 		Progress.StaticSetWeightDiffs(mPtrUebung, aProgressPara.AusgangsSatz, 0);
					// 	} //if
					// } //if

					// if (Progress.StaticEqualUebung(mPtrUebung, aProgressPara.AusgangsUebung)) {
					// 	mPtrUebung.FkAltProgress = aProgressPara.AlteProgressID;
					// 	mPtrUebung.FkProgress = aProgressPara.ProgressID;
					// }

					// Progress-Schema ist NICHT geändert worden 
					if (   Progress.StaticUebungProgressExists(mPtrUebung) 
						&& Progress.StaticProgressEffectsRunningSession(mPtrUebung.FkProgress, aProgressPara)
						&& Progress.StaticSessionLaeuft(aProgressPara.AusgangsSession)
					) {
						// Progress.StaticResetAllWeights(mPtrUebung, aProgressPara.AusgangsSatz);
						// Progress.StaticSetWeightDiffs(mPtrUebung, aProgressPara.AusgangsSatz, 0);

						if (    // Der Ausgangsatz ist nicht erledigt.
							    (Progress.StaticSetIsDone(aProgressPara.AusgangsSatz) === false)
								// Die Übung ist nicht die Ausgangübung
							&& (Progress.StaticEqualUebung(mPtrUebung, aProgressPara.AusgangsUebung) === false)
							    // Erste Satz der Übung ist nicht erledigt
							&& 	Progress.StaticFirstSetIsWaiting(mPtrUebung))
						{
						}
						
						// if (Progress.StaticEqualUebung(mPtrUebung, aProgressPara.AusgangsUebung)) {
							// Die Übung ist die Ausgangübung
							if (Progress.StaticSetIsDone(aProgressPara.AusgangsSatz))
							{
								// Der Ausgangsatz ist erledigt.
								switch (aProgressPara.Wp) {
									case WeightProgress.Increase:
										Progress.StaticSetAllWeights(mPtrUebung, aProgressPara.AusgangsSatz, Arithmetik.Add, mPtrUebung.GewichtSteigerung);
										break;
								
									case WeightProgress.Decrease:
										Progress.StaticSetAllWeights(mPtrUebung, aProgressPara.AusgangsSatz, Arithmetik.Sub, mPtrUebung.GewichtReduzierung);
										break;
								} // switch
							}
							else
							{
								// Der Ausgangsatz ist nicht erledigt.
								Progress.StaticSetAllWeights(mPtrUebung, aProgressPara.AusgangsSatz, Arithmetik.Sub);
					   		}

						// if(	   Progress.StaticSetIsDone(aProgressPara.AusgangsSatz)
						// 	&& Progress.StaticEqualUebung(mPtrUebung, aProgressPara.AusgangsUebung)
						// 	|| Progress.StaticFirstSetIsWaiting(mPtrUebung)
						// 	&& (Progress.StaticEqualUebung(mPtrUebung, aProgressPara.AusgangsUebung) === false)

						// ) {
								

						// 	switch (aProgressPara.Wp) {
						// 		case WeightProgress.Increase:
						// 			Progress.StaticSetAllWeights(mPtrUebung, aProgressPara.AusgangsSatz, Arithmetik.Add, mPtrUebung.GewichtSteigerung);
						// 			Progress.StaticSetWeightDiffs(mPtrUebung, aProgressPara.AusgangsSatz, mPtrUebung.GewichtSteigerung);
						// 			break;
							
						// 		case WeightProgress.Decrease:
						// 			Progress.StaticSetAllWeights(mPtrUebung, aProgressPara.AusgangsSatz, Arithmetik.Sub, mPtrUebung.GewichtReduzierung);
						// 			Progress.StaticSetWeightDiffs(mPtrUebung, aProgressPara.AusgangsSatz, mPtrUebung.GewichtReduzierung);
						// 			break;
						// 	} // switch
						// } //if
					} //if

					// for (let mSessionIndex = 0; mSessionIndex < aProgressPara.Programm.SessionListe.length; mSessionIndex++) {
					// 	const mPrtCmpSession = aProgressPara.Programm.SessionListe[mSessionIndex];
					// 	const mPtrCmpUebung: Uebung = mPrtCmpSession.UebungsListe.find((u) =>
					// 			u.SessionID === mPtrTodoUebung.SessionID &&
					// 			u.FkUebung === mPtrTodoUebung.FkUebung &&
					// 			u.ListenIndex === mPtrTodoUebung.ListenIndex &&
					// 			u.FkProgress === mPtrTodoUebung.FkProgress &&
					// 			u.ProgressGroup === mPtrTodoUebung.ProgressGroup
					// 	);
						
					// 	if (mPtrCmpUebung)
					// 		break;
							
					// 		// if (mUebung) {
					// 		// 	for (let index = 0; index < mPtrUebung.SatzListe.length; index++) {
					// 		// 		if (index < mUebung.SatzListe.length) {
					// 		// 			const mPrtSatz: Satz = mPtrUebung.SatzListe[index];
					// 		// 			const mNeuSatz: Satz = mPrtSatz.Copy();
					// 		// 			mNeuSatz.Status = mUebung.SatzListe[index].Status;
					// 		// 			mUebung.SatzListe[index] = mNeuSatz;
										
					// 		// 		}
					// 		// 	}
					// 		// }
					// }
					
					const mUebung: Uebung = aProgressPara.AusgangsSession.UebungsListe.find((u) =>
							u.SessionID === mPtrTodoUebung.SessionID &&
							u.FkUebung === mPtrTodoUebung.FkUebung &&
							u.ListenIndex === mPtrTodoUebung.ListenIndex &&
							u.FkProgress === mPtrTodoUebung.FkProgress &&
							u.ProgressGroup === mPtrTodoUebung.ProgressGroup
					);

					if (mUebung) {
						for (let index = 0; index < mPtrUebung.SatzListe.length; index++) {
							if (index < mUebung.SatzListe.length) {
								const mPrtSatz: Satz = mPtrUebung.SatzListe[index];
								const mNeuSatz: Satz = mPrtSatz.Copy();
								mNeuSatz.Status = mUebung.SatzListe[index].Status;
								mUebung.SatzListe[index] = mNeuSatz;
								
							}
						}
					}
					

					// let mUebung: Uebung = mAlleUebungenEinerProgressGruppe.find((u) =>
					// const mUebung: Uebung = aProgressPara.Programm.SessionListemAlleUebungenEinerProgressGruppe.find((u) =>
				
					// 	u.SessionID === mPtrUebung.SessionID &&
					// 	u.FkUebung === mPtrUebung.FkUebung &&
					// 	u.ListenIndex === mPtrUebung.ListenIndex &&
					// 	u.FkProgress === mPtrUebung.FkProgress &&s
					// 	u.ProgressGroup === mPtrUebung.ProgressGroup
					// );

					// if (mUebung) {
					// 	for (let index = 0; index < mPtrUebung.SatzListe.length; index++) {
					// 		if (index < mUebung.SatzListe.length) {
					// 			const mPrtSatz: Satz = mPtrUebung.SatzListe[index];
					// 			const mNeuSatz: Satz = mPrtSatz.Copy();
					// 			mNeuSatz.Status = mUebung.SatzListe[index].Status;
					// 			mUebung.SatzListe[index] = mNe;
								
					// 		}
					// 	}
					// }
				}//for

				let mUniqueSessionListe: Array<ISession> = [];
				mUniqueSessionListe = mSessionListe.filter((s) =>
					mUniqueSessionListe.indexOf(s) < 0
				);

				mUniqueSessionListe.forEach((s) => {
					if (aProgressPara.AusgangsSession.Kategorie02 !== SessionStatus.Laueft)
						aProgressPara.DbModule.SessionSpeichern(s as Session);
				
				});
			} 
		aProgressPara.DbModule.LadeProgress(aProgressPara);
	}
}
