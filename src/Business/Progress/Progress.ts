import { DexieSvcService } from 'src/app/services/dexie-svc.service';
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
	AusgangsUebung?: Uebung;
	AusgangsSatz?: Satz;
	Progress?: Progress;
	Storno: boolean;
	SatzDone: boolean;
	NextProgressFn?: NextProgressFn;
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
		
		mSatzListe.forEach((sz) => {
			sz.GewichtDiff = mDiff;
			sz.AddToDoneWeight(mDiff);
			sz.SetPresetWeight(sz.GewichtAusgefuehrt);
		});

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

	public static DoProgress(aProgressPara: ProgressPara) {
        aProgressPara.DbModule.LadeProgress(
            (mProgressListe: Array<Progress>) => {
                aProgressPara.Progress = mProgressListe.find((p) => p.ID === aProgressPara.AusgangsUebung.FkProgress);
                // this.Progress = mProgressListe.find((p) => p.ID === this.sessUebung.FkAltProgress);
                // Sätze der aktuellen Übung durchnummerieren
                for (let index = 0; index < aProgressPara.AusgangsUebung.SatzListe.length; index++) {
                    const mPtrSatz: Satz = aProgressPara.AusgangsUebung.SatzListe[index];
                    mPtrSatz.SatzListIndex = index;
                }
    
                // Hole alle Sätze aus der aktuellen Session, in der die aktuelle Übung mehrfach vorkommt
                // Aus der Satzliste der aktuellen Übung die Sätze mit dem Status "Wartet" in mSatzliste sammeln
                const mSatzListe = aProgressPara.AusgangsSession.AlleUebungsSaetzeEinerProgressGruppe(aProgressPara.AusgangsUebung, SatzStatus.Wartet);
                const mSessionsListe: Array<Session> = aProgressPara.DbModule.UpComingSessionList();
    
                let mNextProgress: NextProgress;
                if (aProgressPara.SatzDone) 
                    mNextProgress =
                        Progress.StaticDoSaetzeProgress(
                            mSatzListe,
                            mSessionsListe,
                            aProgressPara.AusgangsSatz as Satz,
                            aProgressPara.AusgangsUebung,
                            aProgressPara.AusgangsSession as Session,
                            aProgressPara.Progress.ProgressSet);                
                
                if (aProgressPara.Progress) {
                    if (   (aProgressPara.AusgangsSatz.SatzListIndex === 0)
                        && (aProgressPara.Progress.ProgressTyp === ProgressTyp.BlockSet)
                        && (aProgressPara.Progress.ProgressSet === ProgressSet.First)) {
						aProgressPara.Progress.DetermineNextProgress(	aProgressPara.DbModule,
																		new Date,
																		aProgressPara.AusgangsSession.FK_VorlageProgramm,
																		aProgressPara.AusgangsSatz.SatzListIndex,
																		aProgressPara.AusgangsUebung)
                            .then((wp: WeightProgress) => {
                                const mProgressPara: ProgressPara = new ProgressPara();
                                mProgressPara.AusgangsSession = aProgressPara.AusgangsSession;
                                mProgressPara.AusgangsUebung = aProgressPara.AusgangsUebung;
                                mProgressPara.AusgangsSatz = aProgressPara.AusgangsSatz;
                                mProgressPara.DbModule = aProgressPara.DbModule;
                                mProgressPara.Programm = aProgressPara.Programm;
                                mProgressPara.Progress = aProgressPara.Progress;
                                mProgressPara.Wp = wp;
                                mProgressPara.Storno = aProgressPara.Storno;
                                mProgressPara.SatzDone = aProgressPara.SatzDone;
                                Progress.StaticProgrammSetNextWeight(mProgressPara);
                            });
                    }
                }
    
				if ((aProgressPara.SatzDone) && (aProgressPara.NextProgressFn))
					aProgressPara.NextProgressFn(mNextProgress);
                    // aProgressPara.DoStoppUhr(mNextProgress.Satz.GewichtAusgefuehrt,
                    //     `"${mNextProgress.Uebung.Name}" - set #${(mNextProgress.Satz.SatzListIndex + 1).toString()} - weight: ${(mNextProgress.Satz.fGewichtVorgabe)}`
                    // );
            });
        
    }

	public static StaticSessionSetNextWeight(aWp: WeightProgress, aSession: Session, aUebung: Uebung): void {
        let mDiff: number = 0;
        aSession.AlleUebungenEinerProgressGruppe(aUebung).forEach(
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

	public static EqualSet(aSatz1 : Satz, aSatz2: Satz): boolean{
		return (aSatz1 !== undefined &&
			    aSatz2 !== undefined &&
			    aSatz1.SessionID === aSatz2.SessionID &&
			    aSatz1.UebungID === aSatz2.UebungID &&
				aSatz1.SatzListIndex === aSatz2.SatzListIndex);
	}
	
	public static StaticProgrammSetNextWeight(aProgressPara: ProgressPara):void {
		class ProgressExercise { Session: ISession; Uebung: Uebung; Progress: Progress; Storno: boolean };
		// Wenn die Session läuft, muss aProgress definiert sein!
		// if (aAusgangsSession.Kategorie02 === SessionStatus.Laueft && aProgress === undefined)
		// 	return;

		let mAlleUebungenEinerProgressGruppe: Array<Uebung>;
		if (aProgressPara.AusgangsUebung)
			mAlleUebungenEinerProgressGruppe = aProgressPara.AusgangsSession.AlleUebungenEinerProgressGruppe(aProgressPara.AusgangsUebung);
		// Temporäre Liste der Uebungen
		const mTodoListe: Array<ProgressExercise> = [];
		// Alle vorhandenen Progress-Typen laden
		aProgressPara.DbModule.LadeProgress(
			// After-Load-Call-Back ausführen
			(mProgressListe: Array<Progress>) => {
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
							let mResultDummy : Uebung;
							for (let index = 0; index < mCmpSession.UebungsListe.length; index++) {
								const mCmpUebPtr = mCmpSession.UebungsListe[index];
								// Wenn aProgress gesetzt ist, dessen ID zum Vergleichen verwenden,
								// sonst die ID des Progress der Übung aus der Übungsliste benutzen. 
								const mSuchProgressID: number = aProgressPara.Progress ? aProgressPara.Progress.ID : mCmpUebPtr.FkProgress;
   							    // Hat der Progresstyp sich geändert?
								let mStornoProgressID: number;
								if (mCmpUebPtr.FkAltProgress > 0 && mCmpUebPtr.FkAltProgress !== mCmpUebPtr.FkProgress)
									mStornoProgressID = mCmpUebPtr.FkAltProgress;
								
								if (	// Sind die Übungen gleich?
									au.FkUebung === mCmpUebPtr.FkUebung
									// Ist ein Progresstyp hinterlegt?
									&& mCmpUebPtr.FkProgress > 0
									// Sind die Progresstypen gleich?
									&& au.FkProgress === mSuchProgressID
									||
									// Der Progresstyp hat sich geändert.
									// Evtl. schon getätigte Gewichtsvorgaben müssen rückgängig gemacht werden.
										mCmpUebPtr.FkAltProgress > 0
									&& 	mCmpUebPtr.FkAltProgress !== mCmpUebPtr.FkProgress
									
								) {
									const mProgress: Progress = mProgressListe.find((p) => p.ID === mCmpUebPtr.FkProgress);
									// const mStornoProgress: Progress = mProgressListe.find((p) => p.ID === mCmpUebPtr.FkAltProgress);
									
									if (mProgress) {
										const mProgessExercise: ProgressExercise = new ProgressExercise();
										mProgessExercise.Progress = mProgress;
										// mProgessExercise.StornoProgress = mStornoProgress;
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
				mTodoListe.forEach((td) => {
					let mDiff: number = 0;
					if (aProgressPara.Storno === true || aProgressPara.SatzDone === false)  {
						td.Uebung.ArbeitsSatzListe.forEach((sz) => {
							if (aProgressPara.AusgangsSatz === undefined || Progress.EqualSet(sz, aProgressPara.AusgangsSatz) === false) {
								if (sz.Status === SatzStatus.Wartet) {
									if (aProgressPara.Wp !== undefined) {
										switch (aProgressPara.Wp) {
											case WeightProgress.Increase:
												mDiff = -td.Uebung.GewichtSteigerung;
												break;
											
											case WeightProgress.Decrease:
												mDiff = -td.Uebung.GewichtReduzierung;
												break;
										}
									}
										
									switch (aProgressPara.Wp) {
										case WeightProgress.Increase:
											sz.AddToDoneWeight(mDiff);
											sz.SetPresetWeight(sz.GewichtAusgefuehrt);
											break;
												
										case WeightProgress.Decrease:
											sz.AddToDoneWeight(-mDiff);
											sz.SetPresetWeight(sz.GewichtAusgefuehrt);
											break;
									}
								}
							}
						})
					}//if
					
					if (aProgressPara.SatzDone === true) {
						mDiff = 0;
						if (td.Progress) {
							td.Uebung.ArbeitsSatzListe.forEach((sz) => {
								if (aProgressPara.AusgangsSatz === undefined || Progress.EqualSet(sz, aProgressPara.AusgangsSatz) === false) {
									if (sz.Status === SatzStatus.Wartet) {
										if (aProgressPara.Wp !== undefined) {
											switch (aProgressPara.Wp) {
												case WeightProgress.Increase:
													mDiff = td.Uebung.GewichtSteigerung;
													break;
							
												case WeightProgress.Decrease:
													mDiff = td.Uebung.GewichtReduzierung;
													break;
											}
										}

										switch (aProgressPara.Wp) {
											case WeightProgress.Increase:
												sz.AddToDoneWeight(mDiff);
												sz.SetPresetWeight(sz.GewichtAusgefuehrt);
												break;
						
											case WeightProgress.Decrease:
												sz.AddToDoneWeight(-mDiff);
												sz.SetPresetWeight(sz.GewichtAusgefuehrt);
												break;
										}
										sz.GewichtDiff = mDiff;
									}
								}
							})
						}
					}

					if (mAlleUebungenEinerProgressGruppe) {
						const mUebung: Uebung = mAlleUebungenEinerProgressGruppe.find((u) =>
							u.SessionID === td.Uebung.SessionID &&
							u.FkUebung === td.Uebung.FkUebung &&
							u.ListenIndex === td.Uebung.ListenIndex
						);

						if (mUebung) {
							mUebung.SatzListe = td.Uebung.SatzListe;
							for (let index = 0; index < mUebung.SatzListe.length; index++) {
								const mSatzPtr = mUebung.SatzListe[index];
								if (aProgressPara.AusgangsSatz && Progress.EqualSet(mSatzPtr, aProgressPara.AusgangsSatz) === true)
									mSatzPtr.Status = aProgressPara.AusgangsSatz.Status;
							}
							mUebung.SatzListe
							aProgressPara.AusgangsSatz
						}
					}
				})


				let mUniqueSessionListe: Array<ISession> = [];
				mUniqueSessionListe = mSessionListe.filter((s) =>
					mUniqueSessionListe.indexOf(s) < 0
				);

				mUniqueSessionListe.forEach((s) => {
					if (aProgressPara.AusgangsSession.Kategorie02 !== SessionStatus.Laueft) 
					aProgressPara.DbModule.SessionSpeichern(s as Session);
				});
			})
	}
}
