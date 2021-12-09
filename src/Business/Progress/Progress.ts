import { DexieSvcService } from "./../../app/services/dexie-svc.service";
import { Session } from "src/Business/Session/Session";
import { Uebung } from "../Uebung/Uebung";
import { ProgrammKategorie } from "../TrainingsProgramm/TrainingsProgramm";
var cloneDeep = require('lodash.clonedeep');
var isEqual = require('lodash.isEqual')

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
        return isEqual(this,aOtherProgress);
    }
}

// Wird nur im Client benutzt
export class ProgressClient extends Progress implements IProgress {

	private EvalSaetze(aSessUebung: Uebung, aVorgabeWeightLimit:VorgabeWeightLimit ): boolean {
		if (this.WeightCalculation === WeightCalculation.Sum)
			return aSessUebung.SummeWDH() >= aSessUebung.SummeVorgabeWDH(aVorgabeWeightLimit);

		for (let index = 0; index < aSessUebung.ArbeitsSatzListe.length; index++) {
			if (aVorgabeWeightLimit === VorgabeWeightLimit.UpperLimit && aSessUebung.ArbeitsSatzListe[index].WdhAusgefuehrt < aSessUebung.ArbeitsSatzListe[index].WdhBisVorgabe) return false;

			if (aVorgabeWeightLimit === VorgabeWeightLimit.LowerLimit && aSessUebung.ArbeitsSatzListe[index].WdhAusgefuehrt < aSessUebung.ArbeitsSatzListe[index].WdhVonVorgabe) return false;
		}
		return true;
	}

	private async DetermineNextProgress(
		aDb: DexieSvcService,
		aDatum: Date,
		aFailCount: number,
		aVorlageProgrammID: number,
		aSatzIndex: number,
		aSessUebung: Uebung
	): Promise<WeightProgress> {
		if (aFailCount < 0) aFailCount = 0;

		return aDb.transaction("r", [aDb.cSession, aDb.cUebung], async () => {
			if (aSessUebung.GewichtAenderung === 0) return WeightProgress.Same;

			let mSessionListe: Array<Session> = [];

			// Die Sessions nur laden, wenn die Anzahl der Fehlversuche größer 0 ist.
			if (aFailCount > 0) {
				// Warten, bis Sessions geladen sind.
				mSessionListe = await aDb
					.table(aDb.cSession)
					.where(["FkVorlageProgramm", "ProgrammKategorie"])
					// Suche nach dem gleichen Programm und nur fertige Sessions.
					.equals([aVorlageProgrammID, ProgrammKategorie.Fertig])
					.and((sess: Session) => sess.Datum < aDatum)
					// aFailCount ist die Anzahl der Fehlversuche.
					// Daher nur soviele Sessions laden, wie die Anzahl der Fehlversuche ist.
					.limit(aFailCount)
					.sortBy("Datum")
					.then((aSessions: Array<Session>) => {
						return aSessions.reverse();
					});
			} // if

			// Wenn aFailCount === 0 ist, brauchen die Sessions nicht geprüft werden.
			if (aFailCount === 0) {
				// Wenn aFailCount === 0, gibt es kein Rückgabe WeightProgress.Same
				if (this.ProgressSet === ProgressSet.First && aSatzIndex === 0) {
					// Der erste Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(0) >= aSessUebung.SatzBisVorgabeWDH(0))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
					// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
					if (this.ProgressTyp === ProgressTyp.RepRangeSet) {
						// Prüfen, ob das untere WDH-Limit erreicht ist 
						if (aSessUebung.SatzWDH(0) < aSessUebung.SatzVonVorgabeWDH(0))
							return WeightProgress.Decrease;
					}
				}

				if (this.ProgressSet === ProgressSet.Last && aSatzIndex === aSessUebung.ArbeitsSatzListe.length - 1) {
					// Der letzte Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) >= aSessUebung.SatzBisVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
					// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
					if (this.ProgressTyp === ProgressTyp.RepRangeSet) {
						// Prüfen, ob das untere WDH-Limit erreicht ist 
						if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) < aSessUebung.SatzVonVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1))
							return WeightProgress.Decrease;
					}
				}

				if (this.ProgressSet === ProgressSet.All) {
					// Alle Sätze der Übung.
					if (this.EvalSaetze(aSessUebung, VorgabeWeightLimit.UpperLimit))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
					// Die vorgegebenen Wiederholungen konnten nicht erreicht werden
					if (this.ProgressTyp === ProgressTyp.RepRangeSet) {
						// Prüfen, ob das untere WDH-Limit erreicht ist 
						if (this.EvalSaetze(aSessUebung, VorgabeWeightLimit.LowerLimit) === false)
							return WeightProgress.Decrease;
					}
				}
				// Es konnte noch kein Ergebnis ermittelt werden.
				// Da aber aFailCount === 0 ist, wird mit dem gleichen Gewicht weiter gearbeitet.
				return WeightProgress.Same;
			} // if

			// Wenn die Anzahl der geladenen Sessions kleiner als aFailCount ist, brauchen die Sessions nicht geprüft werden.
			if (mSessionListe.length < aFailCount) {
				// aFailCount ist größer 0
				if (this.ProgressSet === ProgressSet.First && aSatzIndex === 0) {
					// Der erste Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(0) >= aSessUebung.SatzBisVorgabeWDH(0))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
				}

				if (this.ProgressSet === ProgressSet.Last && aSatzIndex === aSessUebung.ArbeitsSatzListe.length - 1) {
					// Der letzte Satz der Übung ist maßgebend.
					if (aSessUebung.SatzWDH(aSessUebung.ArbeitsSatzListe.length - 1) >= aSessUebung.SatzBisVorgabeWDH(aSessUebung.ArbeitsSatzListe.length - 1))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
				}

				if (this.ProgressSet === ProgressSet.All) {
					// Alle Sätze der Übung.
					if (this.EvalSaetze(aSessUebung, VorgabeWeightLimit.UpperLimit))
						// Die vorgegebenen Wiederholungen konnten erreicht werden
						return WeightProgress.Increase;
				}
				// Es konnte noch kein Ergebnis ermittelt werden.
				// Da aber aFailCount größer 0 ist, kann mit dem gleichen Gewicht weiter gearbeitet werden.
				return WeightProgress.Same;
			} // if

			let mFailCount = 0;

			// Es konnte noch kein Ergebnis ermittelt werden.
			// Die Sessions müssen geprüft werden.
			for (let index = 0; index < mSessionListe.length; index++) {
				const mSess = mSessionListe[index];
				// Warten, bis Übungen geladen sind
				const mUebungsListe: Array<Uebung> = await aDb
					.table(aDb.cUebung)
					.where("SessionID")
					.equals(mSess.ID)
					.and((mUebung: Uebung) => mUebung.FkUebung === aSessUebung.FkUebung)
					.toArray()
					.then((mUebungen) => {
						return mUebungen;
					});

				if (mUebungsListe.length > 0) {
					for (let index = 0; index < mUebungsListe.length; index++) {
						const mSessUebung = mUebungsListe[index];
						// Nicht die Uebung aus den Übergabe-Parametern mit sich selbst vergleichen
						if (
							mSessUebung.ID === aSessUebung.ID ||
							// Nur Uebungen mit gleichen Progress-Schemas vergleichen
							aSessUebung.FkProgress !== mSessUebung.FkProgress
						)
							continue;

						// Der erste Satz ist maßgebend.
						if (this.ProgressSet === ProgressSet.First && aSatzIndex === 0) {
							// Der erste Satz der Übung ist maßgebend.
							if (mSessUebung.SatzWDH(0) >= mSessUebung.SatzBisVorgabeWDH(0))
								// Die vorgegebenen Wiederholungen konnten erreicht werden
								return WeightProgress.Increase;
							else {
								// Wenn der Prozesstyp nicht Blockset ist, muss 
								if ((this.ProgressTyp === ProgressTyp.BlockSet) ||
									// er RepRange sein. Daher das untere Limit prüfen.
									(mSessUebung.SatzWDH(0) < mSessUebung.SatzVonVorgabeWDH(0)))
									mFailCount++
							}
						}

						// Der letzte Satz ist maßgebend.
						if (this.ProgressSet === ProgressSet.Last && aSatzIndex === mSessUebung.ArbeitsSatzListe.length - 1) {
							// Der letzte Satz der Übung ist maßgebend.
							if (mSessUebung.SatzWDH(mSessUebung.ArbeitsSatzListe.length - 1) >= mSessUebung.SatzBisVorgabeWDH(mSessUebung.ArbeitsSatzListe.length - 1))
								// Die vorgegebenen Wiederholungen konnten erreicht werden
								return WeightProgress.Increase;
							else {
								// Wenn der Prozesstyp nicht Blockset ist, muss 
								if ((this.ProgressTyp === ProgressTyp.BlockSet) ||
									// er RepRange sein. Daher das untere Limit prüfen.
									(mSessUebung.SatzWDH(mSessUebung.ArbeitsSatzListe.length - 1) < mSessUebung.SatzVonVorgabeWDH(mSessUebung.ArbeitsSatzListe.length - 1)))
									mFailCount++
							}
						}

						// Alle Sätze prüfen
						if (this.ProgressSet === ProgressSet.All) {
							// Alle Sätze der Übung.
							if (this.EvalSaetze(mSessUebung, VorgabeWeightLimit.UpperLimit))
								// Die vorgegebenen Wiederholungen konnten erreicht werden
								return WeightProgress.Increase;
							else {
								// Wenn der Prozesstyp nicht Blockset ist, muss 
								if ((this.ProgressTyp === ProgressTyp.BlockSet) ||
									// er RepRange sein. Daher das untere Limit prüfen.
									(this.EvalSaetze(mSessUebung, VorgabeWeightLimit.LowerLimit) === false))
									mFailCount++
							}
						}
					} // for

					if (mFailCount >= aFailCount)
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



}
