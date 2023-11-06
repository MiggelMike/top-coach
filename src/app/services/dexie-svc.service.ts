import { cDeutsch, cDeutschKuezel, cEnglish, cEnglishKuerzel, cEnglishDatumFormat, cEnglishZeitFormat, cDeutschDatumFormat, cDeutschZeitFormat } from './../Sprache/Sprache';
import { BodyWeight, BodyWeightDB } from './../../Business/Bodyweight/Bodyweight';
import { HistorySession, SessionCopyPara } from './../../Business/Session/Session';
import { HypertrophicProgramm } from '../../Business/TrainingsProgramm/Hypertrophic';
import { InUpcomingSessionSetzen, UebungDB } from './../../Business/Uebung/Uebung';
import { InitialWeight } from './../../Business/Uebung/InitialWeight';
import { Progress, ProgressSet, ProgressTyp, WeightCalculation, WeightProgressTime, ProgressPara } from './../../Business/Progress/Progress';
import { Hantelscheibe } from 'src/Business/Hantelscheibe/Hantelscheibe';
import { Hantel, HantelTyp } from './../../Business/Hantel/Hantel';
import { Equipment, EquipmentOrigin, EquipmentTyp } from './../../Business/Equipment/Equipment';
import { SessionDB, SessionStatus } from './../../Business/SessionDB';
import { Session, ISession } from 'src/Business/Session/Session';
import { ITrainingsProgramm, TrainingsProgramm, ProgrammTyp, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { DialogeService } from './dialoge.service';
import { Satz, SatzStatus, GewichtDiff, SatzTyp, SatzDB } from './../../Business/Satz/Satz';
import { GzclpProgramm } from 'src/Business/TrainingsProgramm/Gzclp';
import { AppData } from './../../Business/Coach/Coach';
import { Dexie, PromiseExtended } from 'dexie';
import { Injectable, NgModule, Optional, SkipSelf } from '@angular/core';
import { UebungsTyp, Uebung, StandardUebungListe , UebungsKategorie02, StandardUebung, SaetzeStatus } from "../../Business/Uebung/Uebung";
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { MuscleGroup, MuscleGroupKategorie01, MuscleGroupKategorie02, StandardMuscleGroup } from '../../Business/MuscleGroup/MuscleGroup';
import { DiaDatum, DiaUebung, DiaUebungSettings } from 'src/Business/Diagramm/Diagramm';
import { Sprache } from '../Sprache/Sprache';
import { ProgramModulTyp } from '../app.module';
var cloneDeep = require('lodash.clonedeep');


export const cMinDatum = new Date(-8640000000000000);
export const cMaxDatum = new Date(8640000000000000);
export const cSessionSelectLimit = 1;
export const cUebungSelectLimit = 1;
export const cSatzSelectLimit = 1;
//Number.MAX_SAFE_INTEGER
export const cMaxLimnit = 1000000;
export const cWeightDigits = 3;
export const cWeightFormat = '1.2-2';
export const cNumberFormat =  '1.0-0';
export const cDateTimeFormat = 'MMMM d, y, h:mm';



export enum WorkerAction {
	LadeAktuellesProgramm,
	LadeDiagrammDaten
	
};

export enum SortOrder {
	ascending,
	descending
}

export enum ErstellStatus {
    VomAnwenderErstellt,
    AutomatischErstellt,
    Geloescht
}

export interface AktuellesProgramFn {
    (): void;
}

export interface LadeProgrammeFn {
    (aProgramme: Array<TrainingsProgramm>): void;
}

export interface BeforeLoadFn {
    (aData?: any): void | any;
}

export interface AfterLoadFn {
    (aData?: any): void | any;
}

export interface NoRecordFn {
    (aData?: any): void | any;
}

export interface onErrorFn {
    (aData?: any): void | any;
}

export interface onDeleteFn {
    (aData?: any): void | any;
}

export interface AfterSaveFn {
    (aData?: any): void | any;
}

export interface ExtraFn {
    (aData?: any): void | any;
}

export interface AndFn {
	(aData?: any): boolean;
}

export interface FilterFn {
	(aData?: any): boolean;
}

export interface ThenFn {
	(aData: any): void | any;
}

export interface onFormShowFn {
	(aData: any): void | any;
}

export interface onFormCloseFn {
	(aData: any): void | any;
}

export interface PromiseFn {
	(aData?: any): void | any;
}

export interface AnyFn {
	(aPara?: any): Array<any> | any;
}

export class ParaDB {
	Data?: any;
	WhereClause?: string | string[] = '';
	Filter?: FilterFn = () => { return true };
	And?: AndFn = () => { return true };
	Then?: ThenFn;
	anyOf?: AnyFn = (aPara: any):any => { return 0 as any; };
	OffSet?: number = 0;
	Limit?: number = cMaxLimnit;
	SortBy?: string = '';
	SortOrder?: SortOrder = SortOrder.ascending;
    fProgrammTyp?: ProgrammTyp;
    fProgrammKategorie?: ProgrammKategorie; 
    OnProgrammBeforeLoadFn?: BeforeLoadFn; 
    OnProgrammAfterLoadFn?: AfterLoadFn; 
    OnProgrammNoRecordFn?: NoRecordFn; 
    OnSessionAfterLoadFn?: AfterLoadFn; 
    OnSessionNoRecordFn?: NoRecordFn; 
    OnUebungBeforeLoadFn?: BeforeLoadFn;
    OnUebungAfterLoadFn?: AfterLoadFn; 
    OnUebungNoRecordFn?: NoRecordFn; 
    OnSatzBeforeLoadFn?: BeforeLoadFn;
    OnSatzAfterLoadFn?: AfterLoadFn; 
	OnSatzNoRecordFn?: NoRecordFn;
	OnAfterSaveFn?: AfterSaveFn;
	ExtraFn?: ExtraFn;
}    

export class SatzParaDB extends ParaDB {
	Uebung?: Uebung;
	SaetzeBeachten?: boolean;
	SatzListe?: Array<Satz>;
}

export class UebungParaDB extends ParaDB {
	Session?: ISession;
	SatzParaDB?: SatzParaDB;
	SaetzeBeachten?: boolean;
	UebungsListe?: Array<Uebung>;
}

export class SessionParaDB extends ParaDB {
	Programm?: ITrainingsProgramm;
	UebungParaDB?: UebungParaDB;
	UebungenBeachten?: boolean = false;
	SessionListe?: Array<Session>;
}

export class ProgrammParaDB extends ParaDB {
	SessionParaDB?: SessionParaDB;
	SessionBeachten?: boolean;
	ProgrammListe?: Array<TrainingsProgramm>;
}


@Injectable({
	providedIn: "root",
})
@NgModule({
	providers: [DexieSvcService],
})
export class DexieSvcService extends Dexie {
	readonly cUebung: string = "UebungDB";
	readonly cSatz: string = "SatzDB";
	readonly cProgramm: string = "Programm";
	readonly cAppData: string = "AppData";
	readonly cSession: string = "SessionDB";
	readonly cMuskelGruppe: string = "MuskelGruppe";
	readonly cEquipment: string = "Equipment";
	readonly cHantel: string = "Hantel";
	readonly cHantelscheibe: string = "Hantelscheibe";
	readonly cProgress: string = "Progress";
	readonly cDiaUebungSettings: string = "DiaUebungSettings";
	readonly cBodyweight: string = "BodyWeightDB";
	readonly cSprache: string = "Sprache";

	public static StaticHistorySessions: Array<Session> = [];
	public HistorySessionsAfterLoadFn: AfterLoadFn = null; 
	AktuellerProgrammTyp: ProgrammTyp;
	public static StaticHistoryBisDatum: Date = null; 
	public static StaticHistoryVonDatum: Date = null; 
	public static StaticAktuellesProgramm: ITrainingsProgramm = null;
	public static StaticCmpAktuellesProgramm: ITrainingsProgramm = null;
	RefreshAktuellesProgramm: boolean = false;
	// Siehe Anstehende-Sessions
	VorlageProgramme: Array<TrainingsProgramm> = [];
	AppRec: AppData;
	AktuellSprache: Sprache;
	AppDataTable: Dexie.Table<AppData, number>;
	private UebungTable: Dexie.Table<UebungDB, number>;
	private SatzTable: Dexie.Table<SatzDB, number>;
	private ProgrammTable: Dexie.Table<ITrainingsProgramm, number>;
	private SessionTable: Dexie.Table<SessionDB, number>;
	private MuskelGruppeTable: Dexie.Table<MuscleGroup, number>;
	static StaticModulTyp: ProgramModulTyp  = null;
	private get HantelTable(): Dexie.Table<Hantel, number> {
		return this.table(this.cHantel);
	};
	private HantelscheibenTable: Dexie.Table<Hantelscheibe, number>;
	private EquipmentTable: Dexie.Table<Equipment, number>;
	private ProgressTable: Dexie.Table<Progress, number>;
	private DiaUebungSettingsTable: Dexie.Table<DiaUebungSettings, number>;
	private BodyweightTable: Dexie.Table<BodyWeightDB, number>;
	private SpracheTable: Dexie.Table<Sprache, number>;
	private worker: Worker;
	public Programme: Array<ITrainingsProgramm> = [];
	public StammUebungsListe: Array<Uebung> = [];
	public MuskelGruppenListe: Array<MuscleGroup> = [];
	public EquipmentListe: Array<Equipment> = [];
	public LangHantelListe: Array<Hantel> = [];
	public StandardProgramme: Array<ITrainingsProgramm> = [];
	public HantelscheibenListe: Array<Hantelscheibe> = [];
	public ProgressListe: Array<Progress> = [];
	// public DiagrammDatenListe: Array<DiaDatum> = [];
	public MustLoadDiagramData: boolean = true;
	
	private ProgramLadeStandardPara: ProgrammParaDB;

	// private async LadeSessionsInWorker(aOffSet: number = 0): Promise<void> {
	// 	const mSessionParaDB: SessionParaDB = new SessionParaDB();
	// 	mSessionParaDB.Limit = 1;
	// 	mSessionParaDB.OffSet = aOffSet;
	// 	this.LadeUpcomingSessions(this.AktuellesProgramm.id, mSessionParaDB)
	// 		.then((aSessionListeDB) => {
	// 			const mSessionListe: Array<Session> = [];
	// 			aSessionListeDB.map((aSessionDB) => mSessionListe.push(new Session(aSessionDB)));

	// 			if (mSessionListe.length > 0) {
	// 				mSessionListe.forEach((mPtrSession) => {
	// 					// if (mPtrSession.Kategorie02 !== SessionStatus.Wartet) {                            
	// 					const mUebungParaDB = new UebungParaDB();
	// 					mUebungParaDB.SaetzeBeachten = true;
	// 					mUebungParaDB.
	// 					this.LadeSessionUebungen(mUebungParaDB, mPtrSession.ID).then(
	// 						(aUebungsListe) => {
	// 							if (aUebungsListe.length > 0)
	// 								mPtrSession.UebungsListe = aUebungsListe;
	// 						});
	// 					// }
                        
	// 					Session.StaticCheckMembers(mPtrSession);
	// 					mPtrSession.PruefeGewichtsEinheit(this.AppRec.GewichtsEinheit);
	// 					this.AktuellesProgramm.SessionListe.push(mPtrSession);
	// 					this.LadeSessionsInWorker(this.AktuellesProgramm.SessionListe.length);
                    
	// 				});
	// 			}
	// 		});
	// }

	public LadeDiagrammData(aVonDatum: Date, aBisDatum: Date, aSessionListe: Array<Session>, aDiagrammDatenListe: Array<DiaDatum>) {
		let mBisDatum: Date = aBisDatum;
		if (aBisDatum < cMaxDatum)
			mBisDatum.setDate(aBisDatum.getDate() + 1);
		else
			mBisDatum = cMinDatum;
		
		aBisDatum.setHours(0, 0, 0, 0);
		aVonDatum.setHours(0, 0, 0, 0);
		try {
			// return await this.SessionTable
			// 	.where("Kategorie02")
			// 	.anyOf([SessionStatus.Fertig, SessionStatus.FertigTimeOut])
			// 	.and((mSession) => {
			// 		try {
			// 			return (
			// 				(mSession.Datum !== undefined)
			// 				&& (mSession.Datum !== null)
			// 				&& (mSession.Datum.valueOf() >= aVonDatum.valueOf())
			// 				&& (mSession.Datum.valueOf() < mBisDatum.valueOf()));
						
			// 		} catch (error) {
			// 			console.error(error);
			// 			return false;
			// 		}
			// 	})
			// 	.sortBy("Datum")
			// 	.then(async (aSessionListe) => {
					let mResult: Array<Session> = aSessionListe;
					//aSessionListe.map((aSessionDB) => mResult.push(new Session(aSessionDB)));

			for (let mSessionIndex = 0; mSessionIndex < mResult.length; mSessionIndex++) {
				const mPtrSession: Session = mResult[mSessionIndex];
				if ((mPtrSession.GestartedWann === null) || (mPtrSession.GestartedWann === undefined))
					continue;
							
				const mNurSessionDatum = new Date(mPtrSession.GestartedWann.toDateString());
				Session.StaticCheckMembers(mPtrSession);
				mPtrSession.PruefeGewichtsEinheit(this.AppRec.GewichtsEinheit);
				// Jetzt für mPtrSession die Übungen laden
				const mUebungLadePara: UebungParaDB = new UebungParaDB();
				mUebungLadePara.WhereClause = "SessionID";
				mUebungLadePara.anyOf = () => {
					return mPtrSession.ID as any;
				};
				mUebungLadePara.SaetzeBeachten = true;
				mUebungLadePara.SatzParaDB = new SatzParaDB();
				mUebungLadePara.SatzParaDB.WhereClause = "[UebungID+Status]";
				mUebungLadePara.SatzParaDB.anyOf = (aPara: { ParaUebung: Uebung, ParaSatz: Satz }) => {
					return ([aPara.ParaUebung.ID, SatzStatus.Fertig]) as any;
				};

				const mDummySession: Session = new Session();
				mDummySession.ID = mPtrSession.ID;
				const mUebungsListe: Array<Uebung> = mPtrSession.UebungsListe;
				for (let index2 = 0; index2 < mUebungsListe.length; index2++) {
					const mPtrUebung: Uebung = mUebungsListe[index2];
					for (let index2 = 0; index2 < mPtrUebung.SatzListe.length; index2++) {
						const mPtrSatz = mPtrUebung.SatzListe[index2];
						if (mPtrSatz.SatzTyp === SatzTyp.Training &&
							mPtrSatz.Status === SatzStatus.Fertig) {
							let mAktuellesDiaDatum: DiaDatum;

							mAktuellesDiaDatum = aDiagrammDatenListe.find((mDiaDatum) => {
								if (mDiaDatum.Datum.valueOf() === mNurSessionDatum.valueOf())
									return mDiaDatum;
								return undefined;
							});// Find DiaDatum
				
							if (mAktuellesDiaDatum === undefined) {
								mAktuellesDiaDatum = new DiaDatum();
								mAktuellesDiaDatum.Datum = mNurSessionDatum;
								aDiagrammDatenListe.push(mAktuellesDiaDatum);
							}

							// Suche in der Diagramm-Uebungsliste nach der Session-Übung   
							let mAktuelleDiaUebung: DiaUebung = mAktuellesDiaDatum.DiaUebungsListe.find((mDiaUebung) => {
								if (mDiaUebung.UebungID === mPtrUebung.FkUebung)
									return mDiaUebung;
								return undefined;
							}); // Find DiaUebung 
										
							// Wurde die Session-Übung in der Diagramm-Uebungsliste gefunden?
							if (mAktuelleDiaUebung === undefined) {
								// Die Session-Übung wurde nicht in der Diagramm-Uebungsliste gefunden.
								mAktuelleDiaUebung = new DiaUebung();
								mAktuelleDiaUebung.UebungID = mPtrUebung.FkUebung;
								mAktuelleDiaUebung.UebungName = mPtrUebung.Name;
								mAktuelleDiaUebung.Visible = true;
								mAktuellesDiaDatum.DiaUebungsListe.push(mAktuelleDiaUebung);
							}//if
										
							// Alle Arbeitssätze,die zu dem Zeitpunkt in "mDiaUebung.Datum" gemacht worden.
							// mAktuelleDiaUebung.ArbeitsSatzListe.forEach((mSatz) => {
							// 	mSatz.Datum = mSatz.Status === SatzStatus.Fertig ? mPtrUebung.Datum : undefined;
							// });
							// this.SaetzeSpeichern(mAktuelleDiaUebung.ArbeitsSatzListe);
							mAktuelleDiaUebung.ArbeitsSatzListe.push(mPtrSatz);
						} // if
					} //for
				}
								
				aDiagrammDatenListe.sort((d1, d2) => {
					if (d1.Datum.valueOf() < d2.Datum.valueOf())
						return -1;
	
					if (d1.Datum.valueOf() > d2.Datum.valueOf())
						return 1;
	
					return 0;
				});
			}
		} catch (err) {
			console.error(err);
			return null;
		}
		

		// this.SessionTable
		// 	.where("Kategorie02")
		// 	.anyOf([SessionStatus.Fertig, SessionStatus.FertigTimeOut])
		// 	.sortBy("Datum")
		// 	.then(async (aSessionListe) => {
		// 		for (let index = 0; index < aSessionListe.length; index++) {
		// 			const mPtrSession = aSessionListe[index];
		// 			const mNurSessionDatum = new Date(mPtrSession.Datum.toDateString());
		// 			SessionDB.StaticCheckMembers(mPtrSession);
		// 			mPtrSession.PruefeGewichtsEinheit(this.AppRec.GewichtsEinheit);
		// 			// Session-Übungen laden
		// 			await this.UebungTable
		// 				.where("SessionID")
		// 				.equals(mPtrSession.ID)
		// 				.toArray()
		// 				.then(async (mUebungen) => {
		// 					for (let index1 = 0; index1 < mUebungen.length; index1++) {
		// 						const mPtrUebung = mUebungen[index1];
		// 						// Übungs-Sätze laden
		// 						await this.SatzTable
		// 							.where("UebungID")
		// 							.equals(mPtrUebung.ID)
		// 							.toArray()
		// 							.then((mSaetze: Array<Satz>) => {
		// 								for (let index2 = 0; index2 < mSaetze.length; index2++) {
		// 									const mPtrSatz = mSaetze[index2];
		// 									if (mPtrSatz.SatzTyp === SatzTyp.Training &&
		// 										mPtrSatz.Status === SatzStatus.Fertig) {
		// 										let mAktuellesDiaDatum: DiaDatum;

		// 										mAktuellesDiaDatum = this.DiagrammDatenListe.find((mDiaDatum) => {
		// 											if (mDiaDatum.Datum.valueOf() === mNurSessionDatum.valueOf())
		// 												return mDiaDatum;
		// 											return undefined;
		// 										});// Find DiaDatum
						
		// 										if (mAktuellesDiaDatum === undefined) {
		// 											mAktuellesDiaDatum = new DiaDatum();
		// 											mAktuellesDiaDatum.Datum = mNurSessionDatum;
		// 											aDiagrammDatenListe.push(mAktuellesDiaDatum);
		// 										}

		// 										// Suche in der Diagramm-Uebungsliste nach der Session-Übung   
		// 										let mAktuelleDiaUebung: DiaUebung = mAktuellesDiaDatum.DiaUebungsListe.find((mDiaUebung) => {
		// 											if (mDiaUebung.UebungID === mPtrUebung.FkUebung)
		// 												return mDiaUebung;
		// 											return undefined;
		// 										}); // Find DiaUebung 
												
		// 										// Wurde die Session-Übung in der Diagramm-Uebungsliste gefunden?
		// 										if (mAktuelleDiaUebung === undefined) {
		// 											// Die Session-Übung wurde nicht in der Diagramm-Uebungsliste gefunden.
		// 											mAktuelleDiaUebung = new DiaUebung();
		// 											mAktuelleDiaUebung.UebungID = mPtrUebung.FkUebung;
		// 											mAktuelleDiaUebung.UebungName = mPtrUebung.Name;
		// 											mAktuelleDiaUebung.Visible = true;
		// 											mAktuellesDiaDatum.DiaUebungsListe.push(mAktuelleDiaUebung);
		// 										}//if
												
		// 										// Alle Arbeitssätze,die zu dem Zeitpunkt in "mDiaUebung.Datum" gemacht worden.
		// 										// mAktuelleDiaUebung.ArbeitsSatzListe.forEach((mSatz) => {
		// 										// 	mSatz.Datum = mSatz.Status === SatzStatus.Fertig ? mPtrUebung.Datum : undefined;
		// 										// });
		// 										// this.SaetzeSpeichern(mAktuelleDiaUebung.ArbeitsSatzListe);
		// 										mAktuelleDiaUebung.ArbeitsSatzListe.push(mPtrSatz);
		// 									} // if
		// 								} //for
		// 							});//then
		// 					}//for							

		// 					this.DiagrammDatenListe.sort((d1, d2) => {
		// 						if (d1.Datum.valueOf() < d2.Datum.valueOf())
		// 							return 1;
		// 						return 0;
		// 					});

		// 				});//then
		// 		}//for	

		// 		if (aExtraFn !== undefined)
		// 			aExtraFn();
		// 	});//then
	}
	
	// public DoWorker(aAction: WorkerAction, aExtraFn?: ExtraFn) {
	// 	// const that: AnstehendeSessionsComponent = this;
	// 	if (typeof Worker !== 'undefined') {
	// 		this.worker = new Worker(new URL('./dexie-svc.worker', import.meta.url));
	// 		this.worker.addEventListener('message', ({ data }) => {
	// 			switch (aAction) {
	// 				case WorkerAction.LadeAktuellesProgramm:
	// 					this.LadeAktuellesProgramm()
	// 						.then(async (aProgramm) => {
	// 							if (aProgramm !== undefined) {
	// 								const mDialogData = new DialogData();
	// 								mDialogData.ShowAbbruch = false;
	// 								mDialogData.ShowOk = false;
	// 								mDialogData.hasBackDrop = false;
	// 								this.AktuellesProgramm.SessionListe = [];
	// 								this.LadeSessionsInWorker();
	// 							}
	// 						});// then
	// 					break;
					
	// 				case WorkerAction.LadeDiagrammDaten:
	// 					// if (this.MustLoadDiagramData === true) {
	// 					// 	this.LadeAppData().then((aAppRec) => {
	// 					// 		this.AppRec = aAppRec;
	// 					// 		this.LadeDiagrammData(this.DiagrammDatenListe, aAppRec.MaxHistorySessions, aExtraFn);
	// 					// 	});
	// 					// }
	// 					break;
	// 			}//switch
	// 		});
	// 		this.worker.postMessage(aAction);
	// 	}
	// }

	public UpComingSessionList(): Array<Session> {
		if ((DexieSvcService.StaticAktuellesProgramm) && (DexieSvcService.StaticAktuellesProgramm.SessionListe)) {
			DexieSvcService.StaticAktuellesProgramm.SessionListe =
			DexieSvcService.StaticAktuellesProgramm.SessionListe.filter(
					(s) => (s.Kategorie02 !== SessionStatus.Fertig && s.Kategorie02 !== SessionStatus.FertigTimeOut)
				);
			return this.SortSessionByListenIndex(DexieSvcService.StaticAktuellesProgramm.SessionListe as Array<ISession>);
		}
		return undefined;
	}

	public DeleteProgram(aProgramm: TrainingsProgramm) {
		aProgramm.SessionListe.forEach((s) => {
			if (s.Kategorie02 !== SessionStatus.Fertig && s.Kategorie02 !== SessionStatus.FertigTimeOut) {
				s.UebungsListe.forEach((u) => {
					if (u.ID !== undefined) this.UebungTable.delete(u.ID);
					u.SatzListe.forEach((sz) => {
						if (sz.ID !== undefined) this.SatzTable.delete(sz.ID);
					});
				});

				if (s.ID !== undefined) this.SessionTable.delete(s.ID);
			}
		});
		this.ProgrammTable.delete(aProgramm.id);
	}

	public DeleteSession(aSession: Session) {
		if (aSession.UebungsListe !== undefined)
			aSession.UebungsListe.forEach((mLoeschUebung) => this.DeleteUebung(mLoeschUebung));
		
		this.SessionTable.delete(aSession.ID);
	}

	public async DeleteUebung(aUebung: Uebung) {
		aUebung.SatzListe.forEach((mLoeschSatz) => {
			if (mLoeschSatz.ID === undefined)
				this.DeleteSatz(mLoeschSatz);
		});

		this.UebungTable.delete(aUebung.ID);
	}

	public DeleteSatz(aSatz: Satz) {
		this.SatzTable.delete(aSatz.ID);
	}

	private LadeSessions(aProgramm: ITrainingsProgramm, aSessionLadePara?: SessionParaDB): Promise<void> {
		return this.LadeProgrammSessions(aProgramm.id, aSessionLadePara)
			.then((aSessionListe) => {
				aSessionListe.forEach((mSession) => {
					mSession.UebungsListe = [];
				});
				aProgramm.SessionListe = aSessionListe;
				//aProgramm.SessionListe = aProgramm.SessionListe.concat(aSessionListe);
				//const mSessionLadePara: SessionParaDB = new SessionParaDB();
				// mSessionLadePara.Limit = cSessionSelectLimit;
				// mSessionLadePara.OffSet = aSessionListe.length;
				//this.LadeSessions(aProgramm, mSessionLadePara);
			});
	}

	public async CheckSessions(aProgramm: ITrainingsProgramm, aPromiseFn?: PromiseFn): Promise<void> {
		if ((aProgramm.SessionListe === undefined) || (aProgramm.SessionListe.length <= 0)) {
			aProgramm.SessionListe = [];
			this.LadeSessions(aProgramm)
				.then(() => {
					if (aPromiseFn !== undefined)
						aPromiseFn();
				});
		}
		return;
	}

	public SetAktuellesProgramm(aSelectedProgram: TrainingsProgramm, aInitialWeightList?: Array<InitialWeight>): Promise<ITrainingsProgramm> {
		return this.FindAktuellesProgramm().then(async (mAktuellesProgramm) => {
			
			if (mAktuellesProgramm) {
				for (let index = 0; index < mAktuellesProgramm.length; index++) {
					const mPtrProgramm = mAktuellesProgramm[index];
					// Die Kategorie des bisherigen aktuellen Programms wird auf "Aktiv" gesetzt
					mPtrProgramm.ProgrammKategorie = ProgrammKategorie.Aktiv;
					const mSessionLadePara: SessionParaDB = new SessionParaDB();
					mSessionLadePara.UebungenBeachten = true;
					mSessionLadePara.UebungParaDB = new UebungParaDB();
					mSessionLadePara.UebungParaDB.SaetzeBeachten = true;
					await this.LadeProgrammSessions(mPtrProgramm.id, mSessionLadePara)
						.then(async (mSessions) => {
							mPtrProgramm.SessionListe = mSessions;
							await this.ProgrammSpeichern(mPtrProgramm);
						});
				}
			}

			if (aSelectedProgram.SessionListe === undefined || aSelectedProgram.SessionListe.length <= 0) {
				const mSessionLadePara: SessionParaDB = new SessionParaDB();
				mSessionLadePara.UebungenBeachten = true;
				mSessionLadePara.UebungParaDB = new UebungParaDB();
				mSessionLadePara.UebungParaDB.SaetzeBeachten = true;
				await this.LadeProgrammSessions(aSelectedProgram.id, mSessionLadePara)
					.then((mSessions) => aSelectedProgram.SessionListe = mSessions);
			}
			
			const mProgramm = aSelectedProgram.Copy();
			mProgramm.id = undefined;
			mProgramm.FkVorlageProgramm = aSelectedProgram.id;
			// Die Kategorie des ausgewählten Programms wird auf "AktuellesProgramm" gesetzt
			mProgramm.ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;

			if (mProgramm.SessionListe) {
				mProgramm.SessionListe = [];
				for (let index = 0; index < aSelectedProgram.SessionListe.length; index++) {
					const mPrtSession = aSelectedProgram.SessionListe[index];

					const mSessionCopyPara = new SessionCopyPara();
					mSessionCopyPara.Komplett = true;
					mSessionCopyPara.CopySessionID = false;
					mSessionCopyPara.CopyUebungID = false;
					mSessionCopyPara.CopySatzID = false;
					const mNeueSession = Session.StaticCopy(mPrtSession as Session, mSessionCopyPara);
					mNeueSession.ListenIndex = index;
					mNeueSession.FK_VorlageProgramm = aSelectedProgram.id;

					mNeueSession.UebungsListe.forEach((mUebung) => {
						mUebung.WarmUpVisible = (mUebung.AufwaermSatzListe !== undefined) && (mUebung.AufwaermSatzListe.length > 0);
						mUebung.CooldownVisible = (mUebung.AbwaermSatzListe !== undefined) && (mUebung.AbwaermSatzListe.length > 0);
					});


					if (aInitialWeightList !== undefined) {
						aInitialWeightList.forEach((iw) => {
							const mUebung = mNeueSession.UebungsListe.find((u) => u.FkUebung === iw.UebungID);
							if (mUebung !== undefined) {
								mUebung.ArbeitsSatzListe.forEach((sz) => {
									sz.GewichtVorgabe = iw.Weight;
									sz.GewichtAusgefuehrt = iw.Weight;
									sz.WdhAusgefuehrt = sz.WdhBisVorgabe;
								});
							}
						});
					}
					mProgramm.SessionListe.push(mNeueSession);
				}

				DexieSvcService.StaticAktuellesProgramm = mProgramm;
				DexieSvcService.StaticCmpAktuellesProgramm = mProgramm;
				return this.ProgrammSpeichern(mProgramm);
			}//if
			return null;
		});
	}

	public get HantenscheibeListeSortedByDiameterAndWeight(): Array<Hantelscheibe> {
		return this.HantelscheibenListe;
	}

	public LanghantelListeSortedByName(aIgnorGeloeschte: Boolean = true): Array<Hantel> {
		return this.LangHantelListe;
	}

	public get EquipmentTypListe(): Array<string> {
		const mResult: Array<string> = [];
		for (const mEquipmentTyp in EquipmentTyp) {
			if (mEquipmentTyp === EquipmentTyp.Unbestimmt) continue;

			mResult.push(mEquipmentTyp);
		}

		return mResult;
	}

	public get EquipmentTypListeSorted(): Array<string> {
		return this.EquipmentTypListe;
		// const mResult: Array<string> = this.EquipmentTypListe.map((mEquipmentTyp) => mEquipmentTyp);
		// mResult.sort((u1, u2) => {
		// 	if (u1 > u2) {
		// 		return 1;
		// 	}

		// 	if (u1 < u2) {
		// 		return -1;
		// 	}

		// 	return 0;
		// });

		// return mResult;
	}

	constructor(
		private fDialogeService: DialogeService,
		// private fTranslateService: TranslateService,
		@Optional() @SkipSelf()
		parentModule?: DexieSvcService) {
		super("ConceptCoach");
		if (parentModule) {
			throw new Error("DexieSvcService is already loaded. Import it in the AppModule only");
		}

		if (DexieSvcService.StaticModulTyp === null)
			DexieSvcService.StaticModulTyp = ProgramModulTyp.Kein;

		//   Dexie.delete("ConceptCoach");
		this.version(36).stores({
			AppData: "++id",
			UebungDB: "++ID,Name,Typ,Kategorie02,FkMuskel01,FkMuskel02,FkMuskel03,FkMuskel04,FkMuskel05,SessionID,FkUebung,FkProgress,FK_Programm,[FK_Programm+FkUebung+FkProgress+ProgressGroup+ArbeitsSaetzeStatus],Datum,WeightInitDate,FailDatum",
			Programm: "++id,Name,FkVorlageProgramm,ProgrammKategorie,[FkVorlageProgramm+ProgrammKategorie]",
			SessionDB: "++ID,Name,Datum,ProgrammKategorie,FK_Programm,FK_VorlageProgramm,Kategorie02,[FK_VorlageProgramm+Kategorie02],[FK_Programm+Kategorie02],ListenIndex,GestartedWann",
			SatzDB: "++ID,UebungID,Datum,[UebungID+Status]",
			MuskelGruppe: "++ID,Name,MuscleGroupKategorie01",
			Equipment: "++ID,Name",
			Hantel: "++ID,Name,Typ,fDurchmesser",
			Hantelscheibe: "++ID,&[Durchmesser+Gewicht]",
			Progress: "++ID,&Name",
			DiaUebungSettings: "++ID,&UebungID",
			BodyWeightDB: "++ID,Datum",
			Sprache: "++id"
			
		});

		this.table(this.cHantel).mapToClass(Hantel);
		this.InitMuskelGruppe();
		this.InitDatenbank();
		this.InitSession();

		if (DexieSvcService.StaticAktuellesProgramm === null) {
			this.LadeAktuellesProgramm()
				.then((aProgram) => {
					// this.MakeExample(aProgram)
				});
		}

		if (DexieSvcService.StaticHistorySessions.length <= 0) 
			this.LadeHistorySessions(null, null);

	}
			
	InitDatenbank() {
		this.InitAll();
		//  this.HantelTable.clear();
		this.PruefeStandardProgress();
		this.PruefeStandardLanghanteln();
		this.PruefeStandardEquipment();
		this.PruefeStandardMuskelGruppen();
		// Worker funktioniert NICHT in Android!
		// this.DoWorker(WorkerAction.LadeDiagrammDaten);
		// this.LadeStammUebungen();
	}

	ResetDatenbank() {
		this.ProgrammTable.clear()
			.then(() => {
				this.SessionTable.clear()
					.then(() => {
						this.UebungTable.clear()
							.then(() => {
								this.SatzTable.clear()
									.then(() => {
										this.InitDatenbank();
									});
							});
					});
			});
	}

	get UebungListeSortedByName(): Array<Uebung> {
		// return this.StammUebungsListe;
		const mResult: Array<Uebung> = this.StammUebungsListe.map((mUebung) => mUebung);
		mResult.sort((u1, u2) => {
			if (u1.Name > u2.Name) {
				return 1;
			}

			if (u1.Name < u2.Name) {
				return -1;
			}

			return 0;
		});

		return mResult;
	}

	MuskelgruppeListeSortedByName(): Array<MuscleGroup> {
		return this.MuskelGruppenListe;
		// const mResult: Array<MuscleGroup> = this.MuskelGruppenListe.map((mMuskelgruppe) => mMuskelgruppe);

		// mResult.sort((u1, u2) => {
		// 	if (u1.Name > u2.Name) {
		// 		return 1;
		// 	}

		// 	if (u1.Name < u2.Name) {
		// 		return -1;
		// 	}

		// 	return 0;
		// });

		// return mResult;
	}

	get EquipmentListSortedByDisplayName(): Array<Equipment> {
		return this.EquipmentListe;
		// const mResult: Array<Equipment> = this.EquipmentListe.map((mEquipment) => mEquipment);
		// mResult.sort((u1, u2) => {
		// 	if (u1.DisplayName > u2.DisplayName) {
		// 		return 1;
		// 	}

		// 	if (u1.DisplayName < u2.DisplayName) {
		// 		return -1;
		// 	}

		// 	return 0;
		// });

		// return mResult;
	}

	private async InitAll() {
		this.InitEquipment();
		this.InitHantel();
		this.InitProgress();
		await this.InitSprache();
		await this.InitAppData();
		this.InitHantelscheibe();
		this.InitUebung();
		this.InitProgramm();
		this.InitSession();
		this.InitMuskelGruppe();
		this.InitSatz();
		this.InitDiaUebung();
		this.InitBodyweight();
		// this.InitDataDB();
		// const mDataClient: DataClient = new DataClient();
		// mDataClient.Name = 'otto';

		// mDataClient.Alter = 20;

		// 	this.table(this.cDataDB).put(mDataClient.DataDB)
		// 	.then((d) => {
				
		// 		let mDataRead: Array<DataClient> = [];
		// 			// mDataRead.push(mDataClient);
					
		// 			this.table(this.cDataDB)
		// 			.toArray()
		// 			.then((d) => {
		// 				try {
		// 					d.map((r) => {
		// 						const mDataClient: DataClient = new DataClient();
		// 						mDataClient.DataDB = r;
		// 						mDataRead.push(mDataClient);

		// 					})
		// 					const s = mDataRead[0].Name;
		// 					mDataRead[0].fn();
		// 				} catch (error) {
		// 					console.error(error);
		// 				}
		// 			});
		// 		});

	}

	private InitProgress() {
		if (this.ProgressTable === undefined) {
			this.ProgressTable = this.table(this.cProgress);
			this.ProgressTable.mapToClass(Progress);
		}
	}

	private InitHantel() {

	}

	private InitHantelscheibe() {
		if (this.HantelscheibenTable === undefined) {
			this.HantelscheibenTable = this.table(this.cHantelscheibe);
			this.HantelscheibenTable.mapToClass(Hantelscheibe);
		}
	}

	private InitMuskelGruppe() {
		if (this.MuskelGruppeTable === undefined) {
			this.MuskelGruppeTable = this.table(this.cMuskelGruppe);
			this.MuskelGruppeTable.mapToClass(MuscleGroup);
		}
	}

	private InitEquipment() {
		if (this.EquipmentTable === undefined) {
			this.EquipmentTable = this.table(this.cEquipment);
			this.EquipmentTable.mapToClass(Equipment);
		}
	}

	private InitSession() {
		if (this.SessionTable === undefined) {
			this.SessionTable = this.table(this.cSession);
			this.SessionTable.mapToClass(SessionDB);
		}
	}

	private InitUebung() {
		if (this.UebungTable === undefined) {
			this.UebungTable = this.table(this.cUebung);
			this.UebungTable.mapToClass(UebungDB);
		}
	}

	private InitSatz() {
		if (this.SatzTable === undefined) {
			this.SatzTable = this.table(this.cSatz);
			this.SatzTable.mapToClass(SatzDB);
		}
	}

	private InitDiaUebung() {
		if (this.DiaUebungSettingsTable === undefined) {
			this.DiaUebungSettingsTable = this.table(this.cDiaUebungSettings);
			this.DiaUebungSettingsTable.mapToClass(DiaUebungSettings);
		}
	}

	private InitBodyweight() {
		if (this.BodyweightTable === undefined) {
			this.BodyweightTable = this.table(this.cBodyweight);
			this.BodyweightTable.mapToClass(BodyWeightDB);
		}
	}

	public LadeBodyweight(): PromiseExtended<Array<BodyWeight>> {
		return this.table(this.cBodyweight)
			.orderBy("Datum")
			.reverse()
			.toArray()
			.then((mBodyweights) => {
				const mResult: Array<BodyWeight> = [];
				mBodyweights.map((aBodyweightDB) => mResult.push(new BodyWeight(aBodyweightDB)))
				return mResult;
			});
	}

	public LadeSessionBodyweight(aSession: Session): Promise<BodyWeight> {
		const mDatum: Date = (aSession.GestartedWann !== undefined) ? aSession.GestartedWann : cMinDatum;
		
		return this.BodyweightTable
			.where("Datum")
			.belowOrEqual(mDatum)
			.last()
			.then((aBw) => {
				if (aBw !== undefined)
					return new BodyWeight(aBw);
				else {
					const mBwDB: BodyWeightDB = new BodyWeightDB();
					mBwDB.Datum = cMinDatum;
					mBwDB.Weight = 0;
					return new BodyWeight(mBwDB);
				}
			})
	}


	public BodyweightSpeichern(aBodyweight: BodyWeight) {
		this.BodyweightTable.put(aBodyweight.BodyWeightDB).then(
			(aID) => {
				aBodyweight.BodyWeightDB.ID = aID;
			});
	}

	public BodyweightListeSpeichern(aBodyweightListe: Array<BodyWeight>) {
		const mBodyweightSpeicherListe: Array<BodyWeightDB> = [];
		aBodyweightListe.map(aBw => mBodyweightSpeicherListe.push(aBw.BodyWeightDB));
		try {
			this.BodyweightTable.bulkPut(mBodyweightSpeicherListe);
		} catch (error) {
			console.error(error);
		}
	}

	public DeleteBodyweight(aID: number) {
		try {
			this.BodyweightTable.delete(aID);
		} catch (error) {
			console.error(error);
		}
	}

	private NeueUebung(aName: string, aKategorie02: UebungsKategorie02, aTyp: UebungsTyp): Uebung {
		const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
		const mKategorieen01 = [].concat(mGzclpKategorieen01);
		const mProgress: Progress = this.ProgressListe.find((p) => p.Name === Progress.cStandardProgress);
		if (mProgress === undefined)
			return Uebung.StaticNeueUebung(aName, aTyp, mKategorieen01, aKategorie02, -1);
		else
			return Uebung.StaticNeueUebung(aName, aTyp, mKategorieen01, aKategorie02, mProgress.ID);
	}

	private NeueMuskelgruppe(aName: string, aKategorie01: MuscleGroupKategorie01): MuscleGroup {
		return MuscleGroup.StaticNeueMuskelGruppe(aName, aKategorie01);
	}

	public FindMuskel(aMuskel: MuscleGroup): boolean {
		return this.MuskelExists(aMuskel) !== undefined;
	}

	public MuskelExists(aMuskel: MuscleGroup): MuscleGroup {
		if (aMuskel.Name.trim() === "") return undefined;

		return this.MuskelGruppenListe.find((mg) => mg.Name.toUpperCase() === aMuskel.Name.toUpperCase());
	}

	public MuskelgruppeSpeichern(aMuskelgruppe: MuscleGroup) {
		return this.MuskelGruppeTable.put(aMuskelgruppe);
	}

	public HantelSpeichern(aHantel: Hantel): Promise<Hantel> {
		try {
			return this.HantelTable.put(aHantel).then(
				(aID) => {
					aHantel.ID = aID;
					return aHantel;
				});
		} catch (err) {
			console.log(err);
			return null;
			
		}
	}

	public SaveHanteln(aHantelListe: Array<Hantel>): PromiseExtended {
		return this.HantelTable.bulkPut(aHantelListe);
	}

	public InsertUebungen(aUebungsListe: Array<Uebung>): PromiseExtended<Array<Uebung>> {
		let mUebungsDB_Liste: Array<UebungDB> = [];
		aUebungsListe.map((u) => mUebungsDB_Liste.push(u.UebungDB));
		return this.UebungTable.bulkPut(mUebungsDB_Liste, { allKeys: true })
			.then(
				(mKeyList) => {
					for (let index = 0; index < aUebungsListe.length; index++) {
						const mPtrUebung: Uebung = aUebungsListe[index];
						mPtrUebung.UebungDB.ID = mKeyList[index];
					
					}
					return aUebungsListe;
				});
	}

	public InsertDiaUebungen(aDiaUebungsListe: Array<DiaUebungSettings>): PromiseExtended {
		return this.DiaUebungSettingsTable.bulkPut(aDiaUebungsListe);
	}

	public InsertEineDiaUebung(aDiaUebung: DiaUebungSettings): PromiseExtended {
		return this.DiaUebungSettingsTable.put(aDiaUebung);
	}


	public LadeDiaUebungen(): PromiseExtended<Array<DiaUebungSettings>> {
		return this.table(this.cDiaUebungSettings)
			.toArray()
			.then((mDiaUebungSettings) => {
				return mDiaUebungSettings;
			});
	}


	public DeleteDiaUebung(aDiaUebung: DiaUebung): PromiseExtended {
		return this.DiaUebungSettingsTable.delete(aDiaUebung.ID);
	}

	public DeletetUebung(aUebungID: number): PromiseExtended {
		return this.UebungTable.delete(aUebungID);
	}

	public InsertMuskelGruppen(aMuskelGruppenListe: Array<MuscleGroup>): PromiseExtended {
		return this.MuskelGruppeTable.bulkPut(aMuskelGruppenListe);
	}

	public FindUebung(aUebung: Uebung): boolean {
		return this.UebungExists(aUebung) !== undefined;
	}

	public UebungExists(aUebung: Uebung): Uebung {
		if (aUebung.Name.trim() === "") return undefined;

		return this.StammUebungsListe.find((ub) => ub.Name.toUpperCase() === aUebung.Name.toUpperCase());
	}

	public async LadeProgress(aProgressPara?: ProgressPara) {
		await this.table(this.cProgress)
			.toArray()
			.then((mProgressListe) => {
				this.ProgressListe = mProgressListe;

				if ((aProgressPara !== undefined) && (aProgressPara.AfterLoadFn)) {
					aProgressPara.ProgressListe = mProgressListe;
					aProgressPara.AfterLoadFn(aProgressPara);
				}
			});
	}

	public DeleteProgress(aProgressID: number): PromiseExtended {
		return this.ProgressTable.delete(aProgressID);
	}

	public ProgressListeSortedByName(): Array<Progress> {
		return this.ProgressListe
	}

	public ProgressSpeichern(aProgess: Progress) {
		return this.ProgressTable.put(aProgess);
	}

	public InsertProgresse(aProgessListe: Array<Progress>) {
		return this.ProgressTable.bulkPut(aProgessListe);
	}

	public HantelscheibeSpeichern(aScheibe: Hantelscheibe) {
		return this.HantelscheibenTable.put(aScheibe);
	}

	public InsertHantelscheiben(aHantelscheibenListe: Array<Hantelscheibe>): PromiseExtended {
		return this.HantelscheibenTable.bulkPut(aHantelscheibenListe);
	}

	public DeleteHantelscheibe(aHantelscheibeID: number): PromiseExtended<void> {
		return this.HantelscheibenTable.delete(aHantelscheibeID);
	}

	public LadeHantelscheiben(aAfterLoadFn?: AfterLoadFn) {
		this.table(this.cHantelscheibe)
			.orderBy(["Durchmesser", "Gewicht"])
			.toArray()
			.then((mHantelscheibenListe) => {
				this.HantelscheibenListe = mHantelscheibenListe;
				if (aAfterLoadFn !== undefined) aAfterLoadFn(mHantelscheibenListe);
			});
	}

	public LadeMuskelGruppen(aAfterLoadFn?: AfterLoadFn) {
		this.MuskelGruppenListe = [];
		this.table(this.cMuskelGruppe)
			.orderBy("Name")
			.toArray()
			.then((mMuskelgruppenListe) => {
				this.MuskelGruppenListe = mMuskelgruppenListe;

				if (aAfterLoadFn !== undefined) aAfterLoadFn();
			});
	}

	public MuskelListeSortedByName(aIgnorGeloeschte: Boolean = true): Array<MuscleGroup> {
		return this.MuskelGruppenListe;
	}

	public DeleteMuskelGruppe(aMuskelGruppeID: number) {
		return this.MuskelGruppeTable.delete(aMuskelGruppeID);
	}

	public async PruefeStandardMuskelGruppen() {
		const mAnlegen: Array<MuscleGroup> = new Array<MuscleGroup>();
		await this.table(this.cMuskelGruppe)
			.where("MuscleGroupKategorie01")
			.equals(MuscleGroupKategorie01.Stamm as number)
			.toArray()
			.then((mMuskelgruppenListe) => {
				for (let index = 0; index < StandardMuscleGroup.length; index++) {
					const mStandardMuscleGroup: MuscleGroupKategorie02 = StandardMuscleGroup[index];
					if (mMuskelgruppenListe.find((mMuskelgruppe: MuscleGroup) => mMuskelgruppe.Name === mStandardMuscleGroup) === undefined) {
						const mNeueMuskelgruppe = this.NeueMuskelgruppe(mStandardMuscleGroup, MuscleGroupKategorie01.Stamm);
						mAnlegen.push(mNeueMuskelgruppe);
					}
				}

				if (mAnlegen.length > 0) {
					this.InsertMuskelGruppen(mAnlegen).then(() => {
						this.PruefeStandardMuskelGruppen();
					});
				} else this.LadeMuskelGruppen();
			});
	}

	public Deletehantel(aHantel: Hantel) {
		this.HantelTable.delete(aHantel.ID);
	}

	public DeleteHantelListe(aHantelListe: Array<Hantel>) {
		const mKeys: any = [];
		aHantelListe.forEach((mHantel) => mKeys.push(mHantel.ID));
		this.HantelTable.bulkDelete(mKeys);
	}



	public LadeLanghanteln(): PromiseExtended<Array<Hantel>> {
		this.LangHantelListe = [];
		return this.table(this.cHantel)
			.where({ Typ: HantelTyp.Barbell })
			.sortBy("Name")
			.then((mHantelListe) => {
				this.LangHantelListe = mHantelListe;
				return mHantelListe;
			});
	}

	private PruefeStandardLanghanteln() {
		const mAnlegen: Array<Hantel> = [];
		this.table(this.cHantel)
			// Hantel: "++ID,Typ,Name",
			.where("Typ")
			.equals(HantelTyp.Barbell)
			.and((mHantel) => ((mHantel.fDurchmesser === 50) || (mHantel.fDurchmesser === 30) || (mHantel.fDurchmesser === 25)))
			.toArray()
			.then(async (mHantelListe) => {
				// this.DeleteHantelListe(mHantelListe);

				const mDurchmesser: number[] = [50, 30, 25];
				for (const mTyp of DexieSvcService.StaticEnumKeys(HantelTyp)) {
					if (mTyp === HantelTyp.Dumbbel)
						continue;

					for (let index = 0; index < mDurchmesser.length; index++) {
						let mHantel = mHantelListe.find((h: Hantel) => h.Typ === mTyp && h.Durchmesser === mDurchmesser[index]);
						if (mHantel === undefined) {
							const mNeueHantel = Hantel.StaticNeueHantel(mTyp + " - " + mDurchmesser[index], HantelTyp[mTyp], mDurchmesser[index], ErstellStatus.AutomatischErstellt);

							mAnlegen.push(mNeueHantel);
						}
					}
				}

				if (mAnlegen.length > 0) {
					for (let index = 0; index < mAnlegen.length; index++) {
						const mHantel = mAnlegen[index];
						await this.HantelSpeichern(mHantel);
					}
					this.PruefeStandardLanghanteln();
				}
				else this.LadeLanghanteln();
			});
	}

	private async PruefeStandardProgress() {
		await this.ProgressTable.orderBy("Name")
			.toArray()
			.then((mProgressListe) => {
				this.ProgressListe = mProgressListe;
				if (mProgressListe === undefined || mProgressListe.length === 0) {
					const mNeuProgress = new Progress();
					mNeuProgress.AdditionalReps = 0;
					mNeuProgress.ProgressSet = ProgressSet.All;
					mNeuProgress.ProgressTyp = ProgressTyp.BlockSet;
					mNeuProgress.WeightCalculation = WeightCalculation.Sum;
					mNeuProgress.WeightProgressTime = WeightProgressTime.NextSession;
					mNeuProgress.Name = Progress.cStandardProgress;
					this.ProgressSpeichern(mNeuProgress).then(
						() => {
							this.LadeProgress().then(() => this.LadeStammUebungen())
						});
				} else this.LadeStammUebungen();
			});
	}

	public InsertEquipment(aEquipmentListe: Array<Equipment>): PromiseExtended {
		return this.EquipmentTable.bulkPut(aEquipmentListe);
	}

	public LadeEquipment() {
		this.EquipmentListe = [];
		this.table(this.cEquipment)
			.toArray()
			.then((mEquipmentListe) => {
				this.EquipmentListe = mEquipmentListe;
			});
	}

	public static StaticEnumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
		return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
	}


	public PruefeStandardEquipment() {
		const mAnlegen: Array<Equipment> = new Array<Equipment>();
		this.table(this.cEquipment)
			.filter((mEquipment: Equipment) => mEquipment.EquipmentOrigin === EquipmentOrigin.Standard)
			.toArray()
			.then((mEquipmentListe) => {
				for (const mEquipmentTyp of DexieSvcService.StaticEnumKeys(EquipmentTyp)) {
					if (mEquipmentTyp === EquipmentTyp.Unbestimmt) continue;

					if (mEquipmentListe.find((mEquipment: Equipment) => mEquipment.EquipmentTyp === mEquipmentTyp) === undefined) {
						const mNeuesEquipment = Equipment.StaticNeuesEquipment(mEquipmentTyp, EquipmentOrigin.Standard, EquipmentTyp[mEquipmentTyp]);
						mAnlegen.push(mNeuesEquipment);
					}
				}

				if (mAnlegen.length > 0) {
					this.InsertEquipment(mAnlegen).then(() => {
						this.PruefeStandardEquipment();
					});
				} else this.LadeEquipment();
			});
	}

	public async LadeStammUebungen(aAfterLoadFn?: AfterLoadFn): Promise<Array<Uebung>> {
		this.StammUebungsListe = [];
		const mAnlegen: Array<Uebung> = new Array<Uebung>();
		return await this.table(this.cUebung)
			.where("Kategorie02")
			.equals(UebungsKategorie02.Stamm as number)
			.toArray()
			.then((mUebungen) => {
				let mNeueUebung: Uebung = null;
				for (let index = 0; index < StandardUebungListe.length; index++) {
					const mStandardUebung = StandardUebungListe[index];
					if (mUebungen.find((mUebung) => mUebung.Name === mStandardUebung.Name) === undefined) {
						mNeueUebung = this.NeueUebung(mStandardUebung.Name, UebungsKategorie02.Stamm, mStandardUebung.Typ);
						mNeueUebung.SatzListe = [];
						mAnlegen.push(mNeueUebung);
					}
				}

				if (mAnlegen.length > 0) {
					this.InsertUebungen(mAnlegen).then(() => {
						this.LadeStammUebungen();
					});
				} else {
					// Standard-Uebungen sind vorhanden.
					const mStammUebungsListe: Array<Uebung> = this.UebungDBtoUebung(mUebungen);
					this.StammUebungsListe = mStammUebungsListe;
					if (aAfterLoadFn) aAfterLoadFn();
					// Standard-Vorlage-Programme laden
					// const mProgrammParaDB: ProgrammParaDB = new ProgrammParaDB();
					// mProgrammParaDB.LadeSession = true;
					// mProgrammParaDB.SessionParaDB = new SessionParaDB();
					// mProgrammParaDB.SessionParaDB.LadeUebungen
					this.LadeStandardProgramme()
						.then(async (aProgrammListe) => {
							if (aProgrammListe.find((programm) => programm.ProgrammTyp === ProgrammTyp.Gzclp) === undefined)
								await this.ProgrammSpeichern(GzclpProgramm.ErzeugeGzclpVorlage(this));
							
							if (aProgrammListe.find((programm) => programm.ProgrammTyp === ProgrammTyp.HypertrophicSpecific) === undefined)
								await this.ProgrammSpeichern(HypertrophicProgramm.ErzeugeHypertrophicVorlage(this));
							
							await this.LadeStandardProgramme()
						});
					// this.LadeAktuellesProgramm();
				}
				return this.StammUebungsListe;
			});
	}

	public async LadeAktuellesProgramm(aProgrammParaDB?: ProgrammParaDB): Promise<ITrainingsProgramm> {
		let mHelpProgrammParaDB: ProgrammParaDB;
		// Wenn keine Übergabe-Parameter vorhanden sind, hier lokale erzeugen. 
		if (mHelpProgrammParaDB === undefined) {
			mHelpProgrammParaDB = new ProgrammParaDB();
			mHelpProgrammParaDB.WhereClause = "ProgrammKategorie";
			mHelpProgrammParaDB.anyOf = () => {
				return ProgrammKategorie.AktuellesProgramm as any;
			};
			// Sessions laden
			mHelpProgrammParaDB.SessionBeachten = true;
			mHelpProgrammParaDB.SessionParaDB = new SessionParaDB();
			mHelpProgrammParaDB.SessionParaDB.WhereClause = "[FK_Programm+Kategorie02]";
			mHelpProgrammParaDB.SessionParaDB.anyOf = (aProgramm: ITrainingsProgramm) => {
				return [[aProgramm.id, SessionStatus.Laueft], [aProgramm.id, SessionStatus.Pause], [aProgramm.id, SessionStatus.Wartet]];
			};
			// Übungen laden
			mHelpProgrammParaDB.SessionParaDB.UebungenBeachten = true;
			mHelpProgrammParaDB.SessionParaDB.UebungParaDB = new UebungParaDB();
			mHelpProgrammParaDB.SessionParaDB.UebungParaDB.WhereClause = "SessionID";
			mHelpProgrammParaDB.SessionParaDB.UebungParaDB.anyOf = (aSession) => {
				return aSession.ID;
			};
			mHelpProgrammParaDB.SessionParaDB.UebungParaDB.SaetzeBeachten = true;
		}
		else mHelpProgrammParaDB = aProgrammParaDB;
		
		return this.LadeProgrammeEx(mHelpProgrammParaDB)
			.then((aProgramme) => {
				DexieSvcService.StaticAktuellesProgramm = null;
				if (aProgramme.length > 0) {
					DexieSvcService.StaticAktuellesProgramm = aProgramme[0];
					DexieSvcService.StaticCmpAktuellesProgramm = aProgramme[0];
				}
					
				return DexieSvcService.StaticAktuellesProgramm;
			});
	}

	public LadeAktuellesProgrammEx() {
		const mProgrammParaDB: ProgrammParaDB = new ProgrammParaDB();
		
		mProgrammParaDB.WhereClause = "ProgrammKategorie";
		mProgrammParaDB.anyOf = () => { return ProgrammKategorie.AktuellesProgramm as any; };

		mProgrammParaDB.OnProgrammAfterLoadFn = (mProgramme: TrainingsProgramm[]) => {
			if (mProgramme !== undefined && mProgramme.length > 0) {
				DexieSvcService.StaticAktuellesProgramm = mProgramme[0];
			}
		}

		mProgrammParaDB.Then = async (aProgramme) => {
			for (let index = 0; index < aProgramme.length; index++) {
				const mPtrProgramm: TrainingsProgramm = aProgramme[index];
				const mSessionPara: SessionParaDB = new SessionParaDB();
				mSessionPara.WhereClause = "FK_Programm";
				mSessionPara.anyOf = () => { return mPtrProgramm.id as any; };

				mSessionPara.Filter = (aSession: Session) => {
					return aSession.Kategorie02 === SessionStatus.Wartet
						|| aSession.Kategorie02 === SessionStatus.Laueft
						|| aSession.Kategorie02 === SessionStatus.Pause;
				};

				await this.LadeProgrammSessionsEx(mSessionPara)
					.then((aSessionListe: Array<Session>) => mPtrProgramm.SessionListe = aSessionListe)
			}

			if (mProgrammParaDB.OnProgrammAfterLoadFn !== undefined) mProgrammParaDB.OnProgrammAfterLoadFn(aProgramme);

			return aProgramme;
		}

		return this.LadeProgrammeEx(mProgrammParaDB);
	} // Aktuelles Programm laden

	public PrepAkuellesProgramm(aProgramm: ITrainingsProgramm) {
		let mDoneSessions: Array<SessionDB> = [];

		this.VorlageProgramme.find((p) => {
			if (p.ProgrammTyp === aProgramm.ProgrammTyp) return p;
			return null;
		});

		for (let i = 0; i < aProgramm.SessionListe.length; i++) {
			if (aProgramm.SessionListe[i].Kategorie02 === SessionStatus.Fertig || aProgramm.SessionListe[i].Kategorie02 === SessionStatus.FertigTimeOut)
				mDoneSessions.push(aProgramm.SessionListe[i]);
		}
	}

	public SucheUebungPerName(aName: string): Uebung {
		const mUebung = this.StammUebungsListe.find((u) => u.Name === aName);
		return mUebung === undefined ? null : mUebung;
	}

	private InitProgramm() {
		if (this.ProgrammTable === undefined) {
			this.ProgrammTable = this.table(this.cProgramm);
			this.ProgrammTable.mapToClass(TrainingsProgramm);
		}
	}

	public SortSessionByListenIndex(aSessionListe: Array<Session>) {
		return aSessionListe.sort((s1, s2) => {
			if (s1.ListenIndex > s2.ListenIndex) return 1;

			if (s1.ListenIndex < s2.ListenIndex) return -1;

			return 0;
		});
	}

	public async LadeUpcomingSessions(aProgrammID: number, aSessionParaDB?: SessionParaDB): Promise<Array<Session>> {
		return await this.SessionTable
			.where("[FK_Programm+Kategorie02]")
			.anyOf([[aProgrammID, SessionStatus.Laueft], [aProgrammID, SessionStatus.Pause], [aProgrammID, SessionStatus.Wartet]])
			.offset(aSessionParaDB !== undefined && aSessionParaDB.OffSet !== undefined ? aSessionParaDB.OffSet : 0)
			.limit(aSessionParaDB !== undefined && aSessionParaDB.Limit !== undefined ? aSessionParaDB.Limit : cMaxLimnit)
			.sortBy("ListenIndex")
			.then(async (aSessionListe) => {
				let mResult: Array<Session> = [];
				try {
					aSessionListe.map((aSessionDB) => mResult.push(new Session(aSessionDB)));
	
					mResult.forEach((mPtrSession) => {
						mPtrSession.UebungsListe = [];
						// SessionDB.StaticCheckMembers(mPtrSession);
						mPtrSession.PruefeGewichtsEinheit(this.AppRec.GewichtsEinheit);
					});
	
					if (aSessionParaDB !== undefined) {
						if (aSessionParaDB.UebungenBeachten) {
							for (let mSessionIndex = 0; mSessionIndex < mResult.length; mSessionIndex++) {
								const mPtrSession = mResult[mSessionIndex];
								await this.LadeSessionUebungen(mPtrSession.ID, aSessionParaDB.UebungParaDB)
									.then((aUebungsListe) => {
										mPtrSession.UebungsListe = aUebungsListe;
									});
							}//for
						}//if
					}//if
				} catch (error) {
					console.error(error);
				}
				return mResult;
			});
	}

	// public async LadeUpcomingSessions(aProgrammID: number, aSessionParaDB?: SessionParaDB): Promise<Array<Session>> {
	// 	return await this.SessionTable
	// 		.where("[FK_Programm+Kategorie02]")
	// 		.anyOf([[aProgrammID, SessionStatus.Laueft], [aProgrammID, SessionStatus.Pause], [aProgrammID, SessionStatus.Wartet]])
	// 		.offset(aSessionParaDB !== undefined && aSessionParaDB.OffSet !== undefined ? aSessionParaDB.OffSet : 0)
	// 		.limit(aSessionParaDB !== undefined && aSessionParaDB.Limit !== undefined ? aSessionParaDB.Limit : cMaxLimnit)
	// 		.sortBy("ListenIndex")
	// 		.then(async (aSessionListe) => {
	// 			aSessionListe.forEach((mPtrSession) => {
	// 				SessionDB.StaticCheckMembers(mPtrSession);
	// 				mPtrSession.PruefeGewichtsEinheit(this.AppRec.GewichtsEinheit);
	// 			});

	// 			if (aSessionParaDB !== undefined) {
	// 				if (aSessionParaDB.UebungenBeachten) {
	// 					for (let index = 0; index < aSessionListe.length; index++) {
	// 						const mPtrSession = aSessionListe[index];
	// 						await this.LadeSessionUebungen(mPtrSession.ID, aSessionParaDB.UebungParaDB)
	// 							.then((aUebungsListe) => {
	// 								mPtrSession.UebungsListe = aUebungsListe;
	// 							});
	// 					}//for
	// 				}//if
	// 			}//if
	// 			return aSessionListe;
	// 		});
	// }

	public async LadeEineSession(aSessionID: number, aSessionParaDB?: SessionParaDB): Promise<Session> {
		return await this.SessionTable
			.where("ID")
			.equals(aSessionID)
			.offset(aSessionParaDB !== undefined && aSessionParaDB.OffSet !== undefined ? aSessionParaDB.OffSet : 0)
			.limit(aSessionParaDB !== undefined && aSessionParaDB.Limit !== undefined ? aSessionParaDB.Limit : cMaxLimnit)
			.toArray()
			.then(async (aSessionListe) => {
				let mResult: Array<Session> = [];
				aSessionListe.map((aSessionDB) => mResult.push(new Session(aSessionDB)));
				
				mResult.forEach((mPtrSession) => {
					Session.StaticCheckMembers(mPtrSession);
					mPtrSession.PruefeGewichtsEinheit(this.AppRec.GewichtsEinheit);
					const mSession: Session = new Session();
				});

				// if (aSessionParaDB !== undefined) {
				// 	if (aSessionParaDB.UebungenBeachten) {
				// 		for (let index = 0; index < aSessionListe.length; index++) {
				// 			const mPtrSession = aSessionListe[index];
				// 			await this.LadeSessionUebungen(mPtrSession.ID, aSessionParaDB.UebungParaDB)
				// 				.then((aUebungsListe) => mPtrSession.UebungsListe = aUebungsListe);
				// 		}
				// 	}//if
				// }//if
				if (mResult.length > 0)
					return mResult[0];
				else
					return undefined;
			});
	}

	public async LadeProgrammSessions(aProgrammID: number, aSessionParaDB?: SessionParaDB): Promise<Array<Session>> {
		let mHelpSessionParaDB: SessionParaDB;
		if (aSessionParaDB === undefined) {
			mHelpSessionParaDB = new SessionParaDB();
			mHelpSessionParaDB.WhereClause = "FK_Programm";
			mHelpSessionParaDB.anyOf = () => { return aProgrammID as any };
		}
		else mHelpSessionParaDB = aSessionParaDB;

		return await this.SessionTable
			//.where("FK_Programm")
			.where(mHelpSessionParaDB.WhereClause)
			.anyOf(mHelpSessionParaDB.anyOf())
			//.equals(aProgrammID)
			.offset(mHelpSessionParaDB !== undefined && mHelpSessionParaDB.OffSet !== undefined ? mHelpSessionParaDB.OffSet : 0)
			.limit(mHelpSessionParaDB !== undefined && mHelpSessionParaDB.Limit !== undefined ? mHelpSessionParaDB.Limit : cMaxLimnit)
			.sortBy("ListenIndex")
			.then(async (aSessionListe) => {
				let mResult: Array<Session> = [];
				aSessionListe.map((aSessionDB) => mResult.push(new Session(aSessionDB)));

				mResult.forEach((mPtrSession) => {
					Session.StaticCheckMembers(mPtrSession);
					mPtrSession.PruefeGewichtsEinheit(this.AppRec.GewichtsEinheit);
				});

				if (mHelpSessionParaDB !== undefined) {
					if (mHelpSessionParaDB.UebungenBeachten) {
						for (let index = 0; index < mResult.length; index++) {
							const mPtrSession = mResult[index];
							await this.LadeSessionUebungen(mPtrSession.ID, mHelpSessionParaDB.UebungParaDB)
								.then((aUebungsListe) => {
									mPtrSession.UebungsListe = aUebungsListe;
								});
						}
					}//if
				}//if
				return mResult;
			});
	}

	public LadeHistorySessions(aVonDatum: Date, aBisDatum: Date): Promise<Array<HistorySession>> {
		if (aVonDatum === null)
			aVonDatum = new Date('01.01.2020');

		if (aBisDatum === null)
			aBisDatum = new Date('01.01.2099');

		const mProgramNamen: Array<{ ID: number, Name: string }> = []; 

		return this.SessionTable
			.where("GestartedWann")
			.between(aVonDatum, aBisDatum, true, true)
			.and((aSession: Session) => aSession.Kategorie02 === SessionStatus.Fertig || aSession.Kategorie02 === SessionStatus.FertigTimeOut)
			.reverse()
			.sortBy("GestartetWann")
			.then(async (aSessionListe) => {
				let mResult: Array<HistorySession> = [];

				aSessionListe.map((aSessionDB) => mResult.push(new HistorySession(aSessionDB)));

				
				for (let index = 0; index < mResult.length; index++) {
					const mPtrHistorySession: HistorySession = mResult[index];
					
					const mProgrammNameIndex = mProgramNamen.findIndex((aProgrammName) => { return aProgrammName.ID === mPtrHistorySession.FK_Programm; });
					if (mProgrammNameIndex > -1) {
						mPtrHistorySession.ProgrammName = mProgramNamen[mProgrammNameIndex].Name;
					}
					else {
						const mProgrammParaDB: ProgrammParaDB = new ProgrammParaDB();
						mProgrammParaDB.WhereClause = "id";
						mProgrammParaDB.anyOf = () => {
							return mPtrHistorySession.FK_Programm;
						}
						await this.LadeProgrammeEx(mProgrammParaDB)
							.then((aProgramm) => {
								if (aProgramm.length > 0) {
									mPtrHistorySession.ProgrammName = aProgramm[0].Name;
									mProgramNamen.push({ ID: mPtrHistorySession.FK_Programm, Name: aProgramm[0].Name });
								}
							});
					}
				}

				const mUebungParaDB: UebungParaDB = new UebungParaDB();
				mUebungParaDB.WhereClause = "SessionID";
				mUebungParaDB.anyOf = (aSession: Session) => {
					return aSession.ID;
				};
				mUebungParaDB.SaetzeBeachten = true;
				mUebungParaDB.SatzParaDB = new SatzParaDB();
				mUebungParaDB.SatzParaDB.WhereClause = "UebungID";
				mUebungParaDB.SatzParaDB.anyOf = (aUebung: Uebung) => {
					return aUebung.ID;
				};
				for (let index = 0; index < mResult.length; index++) {
					const mPtrSession: Session = mResult[index];
					Session.StaticCheckMembers(mPtrSession);
					mPtrSession.PruefeGewichtsEinheit(this.AppRec.GewichtsEinheit);
					mPtrSession.UebungsListe = [];
					await this.LadeSessionUebungenEx(mPtrSession, mUebungParaDB)
						.then((aUebungsListe) => {
							mPtrSession.UebungsListe = aUebungsListe;
						});
				}// for
				DexieSvcService.StaticHistorySessions = mResult;
				if (this.HistorySessionsAfterLoadFn !== null) {
					this.HistorySessionsAfterLoadFn();
				}
				return mResult;
			});
	}

	public async LadeProgrammSessionsEx(aLadePara: SessionParaDB, aProgramm?: ITrainingsProgramm): Promise<Array<Session>> {
		this.InitSession();
		return await this.SessionTable
			.where(aLadePara.WhereClause)
			.anyOf(aLadePara.anyOf(aProgramm))
			.and((aLadePara.And === undefined ? () => { return 1 === 1 } : (session: SessionDB) => aLadePara.And(session)))
			.filter(aLadePara.Filter === undefined ? () => { return 1 === 1 } : (session: SessionDB) => aLadePara.Filter(session))
			.limit(aLadePara.Limit === undefined ? cMaxLimnit : aLadePara.Limit)
			.sortBy(aLadePara.SortBy === undefined ? '' : aLadePara.SortBy)
			.then(async (aSessions: Array<SessionDB>) => {
				let mResult: Array<Session> = [];
				aSessions.forEach((mPtrSession) => Session.StaticCheckMembers(mPtrSession));

				aSessions.map((aSessionDB) => mResult.push(new Session(aSessionDB)));
				
				let mUebungPara: UebungParaDB
				if (aLadePara.UebungParaDB === undefined) {
					mUebungPara = new UebungParaDB();
					mUebungPara.WhereClause = "SessionID";
					mUebungPara.anyOf = (aSession) => {
						return aSession.ID as any;
					};
				}
				else
					mUebungPara = aLadePara.UebungParaDB;
						
				for (let index = 0; index < mResult.length; index++) {
					const mPtrSession = mResult[index];

					mUebungPara.ExtraFn = async (aLadePara: ParaDB) => {
						aLadePara.Data.Uebung.FK_Programm = aLadePara.Data.Session.FK_Programm;
						aLadePara.Data.Uebung.Datum = aLadePara.Data.Session.Datum;
						// Session-Übungen sind keine Stamm-Übungen.
						// Ist der Schlüssel zur Stamm-Übung gesetzt?
						if (aLadePara.Data.Uebung.FkUebung > 0) {
							//Der Schlüssel zur Stamm-Übung ist gesetzt
							const mStammUebung = this.StammUebungsListe.find((mGefundeneUebung) => mGefundeneUebung.ID === aLadePara.Data.Uebung.FkUebung);
							if (mStammUebung !== undefined) aLadePara.Data.Uebung.Name = mStammUebung.Name;
						} else {
							// Der Schlüssel zur Stamm-Übung sollte normalerweise gesetzt sein
							const mStammUebung = this.StammUebungsListe.find((mGefundeneUebung) => mGefundeneUebung.Name === aLadePara.Data.Uebung.Name);
							if (mStammUebung !== undefined) aLadePara.Data.Uebung.FkUebung = mStammUebung.ID;
						}
						await this.UebungSpeichern(aLadePara.Data.Uebung);
					};//mLadePara.ExtraFn

					await this.LadeSessionUebungenEx(mPtrSession, mUebungPara);
				}

				if (aLadePara !== undefined) {
					if (aLadePara.OnSessionNoRecordFn !== undefined) mResult = aLadePara.OnSessionNoRecordFn(aLadePara);
					if (aLadePara.OnSessionAfterLoadFn !== undefined) mResult = aLadePara.OnSessionAfterLoadFn(mResult);
				}
				return mResult;
			});
	}

	public async LadeSessionUebungen(aSessionID?: number, aLadeParaDB?: UebungParaDB): Promise<Array<Uebung>> {
		const mSession: ISession = new Session();
		mSession.ID = aSessionID;

		let mLadeParaDB: UebungParaDB;
		if (aLadeParaDB === undefined) {
			mLadeParaDB = new UebungParaDB();
			mLadeParaDB.WhereClause = "SessionID"
			mLadeParaDB.anyOf = () => {
				return aSessionID as any;
			};
		}
		else mLadeParaDB = aLadeParaDB;

		return await this.LadeSessionUebungenEx(mSession, mLadeParaDB);
	}

	public async LoadLastFailDateEx(aSession: Session, aUebung: Uebung, aFailCount: number): Promise<Array<Uebung>> {
		if (aFailCount === 1)
			return [aUebung];

		
		const mUebungParaDB: UebungParaDB = new UebungParaDB();
		mUebungParaDB.WhereClause = "[FK_Programm,FkUebung,FkProgress,ProgressGroup,ArbeitsSaetzeStatus]";
		mUebungParaDB.anyOf = () => {
			return [
				// Nur übungen des aktuellen programms laden
				aSession.FK_Programm,
				// Aus den Programm nur die übung laden, die der Stammdaten-Übung entsprechen
				aUebung.FkUebung,
				// Die Progress-Methodik muss gleich sein
				aUebung.FkProgress,
				// Die Progress-Gruppe muss gleich sein
				aUebung.ProgressGroup,
				// Alle sätze der übungen müssen fertig sein
				SaetzeStatus.AlleFertig
			] as any
		};

		mUebungParaDB.And = (mUebung: Uebung): boolean => {
			return (
				mUebung.WeightInitDate.valueOf() >= mUebung.FailDatum.valueOf() &&
				mUebung.WeightInitDate.valueOf() > cMinDatum.valueOf() &&
				mUebung.SessionID !== aSession.ID
			);
		};
		
		mUebungParaDB.Limit = aFailCount - 1;
		mUebungParaDB.SortBy = "WeightInitDate";
		mUebungParaDB.SortOrder = SortOrder.descending;

		return await this.LadeSessionUebungenEx(new Session(), // Dummy
			mUebungParaDB)
			.then((mUebungen) => {
				let mResult: Array<Uebung> = [];
				for (let index = 0; index < mUebungen.length; index++) {
					const mPtrUebung: Uebung = mUebungen[index];
					if (mPtrUebung.FailDatum.valueOf() > cMinDatum.valueOf())
						break;
					
					mResult.push(mUebungen[index]);
				}
				return mResult;
			});
	}

	public async LoadLastFailDate(aSession: Session, aUebung: Uebung, aFailCount: number): Promise<Date> {
		const mUebungParaDB: UebungParaDB = new UebungParaDB();

		mUebungParaDB.WhereClause = ["FK_Programm,FkUebung,FkProgress,ProgressGroup,ArbeitsSaetzeStatus"];
		mUebungParaDB.anyOf = () => {
			return [
				aSession.FK_Programm,
				aUebung.FkUebung,
				aUebung.FkProgress,
				aUebung.ProgressGroup,
				SaetzeStatus.AlleFertig
			];
		};

		mUebungParaDB.And = (mUebung: Uebung): boolean => {
			return (
				mUebung.WeightInitDate.valueOf() >= mUebung.FailDatum.valueOf() &&
				mUebung.WeightInitDate.valueOf() > cMinDatum.valueOf()
			);
		};
		
		mUebungParaDB.Limit = aFailCount;
		mUebungParaDB.SortBy = "WeightInitDate";
		mUebungParaDB.SortOrder = SortOrder.descending;

		return await this.LadeSessionUebungenEx(new Session(), // Dummy
			mUebungParaDB)
			.then((mUebungen) => {
				for (let index = 0; index < mUebungen.length; index++) {
					if (mUebungen[index].FailDatum.valueOf() > cMinDatum.valueOf())
						return mUebungen[index].FailDatum;
				}
				return cMinDatum;
			});
	}

	private UebungDBtoUebung(aUebungenDB: Array<UebungDB>): Array<Uebung> {
		const mResultUebungsListe: Array<Uebung> = [];
		aUebungenDB.forEach(mUebungDB => {
			const mUebung: Uebung = new Uebung();
			mUebung.UebungDB = mUebungDB;
			mResultUebungsListe.push(mUebung);
		});
		return mResultUebungsListe;
	}

	public async LadeSessionUebungenEx(aSession: ISession, aLadePara?: UebungParaDB): Promise<Array<Uebung>> {
		this.InitUebung();

		if (aLadePara !== undefined && aLadePara.OnUebungBeforeLoadFn !== undefined)
			aLadePara.OnUebungBeforeLoadFn(aLadePara);

		return await this.UebungTable
			.where(aLadePara.WhereClause)
			.anyOf(aLadePara.anyOf(aSession))
			.reverse()
			.limit(aLadePara === undefined || aLadePara.Limit === undefined ? cMaxLimnit : aLadePara.Limit)
			.sortBy(aLadePara === undefined || aLadePara.SortBy === undefined ? '' : aLadePara.SortBy)
			.then(async (aUebungenDB: Array<UebungDB>) => {
				let mResultUebungsListe: Array<Uebung> = this.UebungDBtoUebung(aUebungenDB);
				if (aUebungenDB.length > 0) {
					if ((aLadePara !== undefined) && (aLadePara.SortOrder !== undefined) && (aLadePara.SortOrder === SortOrder.ascending))
						// Die Abfrage wird standardmäßig absteigend ausgeführt.
						// Falls also aufsteigend gewünscht wird, muss die Ergebnisliste umgekehrt werden.
						mResultUebungsListe = mResultUebungsListe.reverse();
					
					for (let index = 0; index < mResultUebungsListe.length; index++) {
						const mPtrUebung: Uebung = mResultUebungsListe[index];

						// if (mPtrUebung.InUpcomingSessionSetzen === undefined)
						mPtrUebung.InUpcomingSessionSetzen = new InUpcomingSessionSetzen();
						mPtrUebung.InUpcomingSessionSetzen.init();

						if (mPtrUebung.AltProgressGroup === undefined)
							mPtrUebung.AltProgressGroup = mPtrUebung.ProgressGroup;
							
						if (
							(aLadePara !== undefined)
							&& (aLadePara.ExtraFn !== undefined)
						) {
							const mExtraFnPara: ParaDB = new ParaDB();
							mExtraFnPara.Data = { Session: aSession, Uebung: mPtrUebung };
							aLadePara.ExtraFn(mExtraFnPara);
						}
						
						if (aLadePara !== undefined && aLadePara.SaetzeBeachten === true)
							await this.LadeUebungsSaetzeEx(mPtrUebung, aLadePara.SatzParaDB);
						
					};

					if (aLadePara !== undefined && aLadePara.OnUebungAfterLoadFn !== undefined) mResultUebungsListe = aLadePara.OnUebungAfterLoadFn(mResultUebungsListe);
					else if (aLadePara !== undefined && aLadePara.OnUebungNoRecordFn !== undefined) mResultUebungsListe = aLadePara.OnUebungNoRecordFn(aLadePara);
				}
				aSession.UebungsListe = mResultUebungsListe;
				return mResultUebungsListe;
			});
	}

	public async LadeUebungsSaetze(aUebungID: number, aLadePara?: SatzParaDB): Promise<Array<Satz>> {
		return await this.SatzTable
			.where("UebungID")
			.equals(aUebungID)
			.offset(aLadePara !== undefined && aLadePara.OffSet !== undefined ? aLadePara.OffSet : 0)
			.limit(aLadePara === undefined || aLadePara.Limit === undefined ? cMaxLimnit : aLadePara.Limit)
			.sortBy(aLadePara === undefined || aLadePara.SortBy === undefined ? '' : aLadePara.SortBy)
			.then((aSaetze: Array<SatzDB>) => {
				const mResult: Array<Satz> = [];
				aSaetze.map((mSatzDB) => {
					const mSatz: Satz = new Satz();
					mSatz.SatzDB = mSatzDB;
					mResult.push(mSatz);
				});
				return mResult;
			});
	}

	public async LadeUebungsSaetzeEx(aUebung: Uebung, aSatzLadePara?: ParaDB): Promise<Array<Satz>> {
		this.InitSatz();
		
		let mSatzLadePara: SatzParaDB;
		if (aSatzLadePara === undefined) {
			mSatzLadePara = new SatzParaDB();
			mSatzLadePara.WhereClause = "UebungID";
			mSatzLadePara.anyOf = (aAnyOfUebung: Uebung) => {
				return aAnyOfUebung.ID as any;
			};
		} else mSatzLadePara = aSatzLadePara;

		if (mSatzLadePara !== undefined && mSatzLadePara.OnSatzBeforeLoadFn !== undefined) mSatzLadePara.OnSatzBeforeLoadFn(mSatzLadePara);

		return this.SatzTable
			.where(mSatzLadePara === undefined ? "id" : mSatzLadePara.WhereClause)
			.anyOf(mSatzLadePara === undefined ? 0 : mSatzLadePara.anyOf(aUebung))
			//.and((mSatzLadePara === undefined || mSatzLadePara.And === undefined ? () => { return 1 === 1 } : (satz: SatzDB) => mSatzLadePara.And(satz)))
			.offset(mSatzLadePara !== undefined && mSatzLadePara.OffSet !== undefined ? mSatzLadePara.OffSet : 0)
			.limit(mSatzLadePara === undefined || mSatzLadePara.Limit === undefined ? cMaxLimnit : mSatzLadePara.Limit)
			.sortBy(mSatzLadePara === undefined || mSatzLadePara.SortBy === undefined ? '' : mSatzLadePara.SortBy)
			.then((aSaetze: Array<SatzDB>) => {
				const mResult: Array<Satz> = [];
				aSaetze.map((mSatzDB) => {
					const mSatz: Satz = new Satz();
					mSatz.SatzDB = mSatzDB;
					mResult.push(mSatz);
				});

				if (aSaetze.length > 0) {
					aUebung.SatzListe = mResult;
					aUebung.SatzListe.forEach((s) => {
						if (mSatzLadePara !== undefined && mSatzLadePara.OnSatzAfterLoadFn !== undefined) mSatzLadePara.OnSatzAfterLoadFn(mSatzLadePara);
					});
				} else if (mSatzLadePara !== undefined && mSatzLadePara.OnSatzNoRecordFn !== undefined) mSatzLadePara.OnSatzNoRecordFn(mSatzLadePara);
				return mResult;
			});
	}

	private DoAktuellesProgramm(aNeuesAktuellesProgramm: ITrainingsProgramm, aAltesAktuellesProgramm?: ITrainingsProgramm): void {
		if (aAltesAktuellesProgramm) {
			aAltesAktuellesProgramm.ProgrammKategorie = ProgrammKategorie.Fertig;
			this.ProgrammSpeichern(aAltesAktuellesProgramm);
		}
		const mNeu = aNeuesAktuellesProgramm.ErstelleSessionsAusVorlage(ProgrammKategorie.AktuellesProgramm);
		this.ProgrammSpeichern(mNeu);
		DexieSvcService.StaticAktuellesProgramm = mNeu;
	}

	public CheckAktuellesProgram(aNeuesAktuellesProgramm: ITrainingsProgramm, aAltesAktuellesProgramm?: ITrainingsProgramm): void {
		// Soll das aktuelle Programm durch ein anderes ersetzt werden?
		if (aAltesAktuellesProgramm !== undefined) {
			const mDialogData = new DialogData();
			mDialogData.OkData = aNeuesAktuellesProgramm;
			mDialogData.OkFn = (): void => {
				// Es gibt ein aktuelles Programm, aber der Anwender will es ersetzen.
				this.DoAktuellesProgramm(aNeuesAktuellesProgramm, aAltesAktuellesProgramm);
			};

			// Sind altes und neues Programm gleich?
			if (aNeuesAktuellesProgramm.Name === aAltesAktuellesProgramm.Name) {
				// Altes und neues Programm sind gleich
				mDialogData.textZeilen.push(`This program is already active!`);
				mDialogData.textZeilen.push(`Select it anyway?`);
			} else {
				// Das aktuelle Work-Out soll durch ein anderes ersetzt werden.
				mDialogData.textZeilen.push(`Replace current Program "${aAltesAktuellesProgramm.Name}" with "${aNeuesAktuellesProgramm.Name}" ?`);
			}

			this.fDialogeService.JaNein(mDialogData);
		} else {
			// Es gibt kein aktuelles Work-Out.
			this.DoAktuellesProgramm(aNeuesAktuellesProgramm);
		}
	}

	public FindVorlageProgramm(aProgramme: Array<TrainingsProgramm>, aProgrammTyp: ProgrammTyp): Boolean {
		return (
			aProgramme.find((p) => {
				if (p.ProgrammTyp === aProgrammTyp) return p;
				return null;
			}) != null
		);
	}

	public async FindAktuellesProgramm(): Promise<Array<ITrainingsProgramm>> {
		const mLadePara: ProgrammParaDB = new ProgrammParaDB();
		mLadePara.WhereClause = "ProgrammKategorie";
		mLadePara.anyOf = () => { return ProgrammKategorie.AktuellesProgramm.toString() as any; };
		return await this.LadeProgrammeEx(mLadePara);
	}

	public async LadeStandardProgramme(): Promise<Array<ITrainingsProgramm>> {
		const mProgrammPara: ProgrammParaDB = new ProgrammParaDB();
		mProgrammPara.WhereClause = "ProgrammKategorie"
		mProgrammPara.anyOf = () => {
			return ProgrammKategorie.Vorlage.toString() as any;
		};

		mProgrammPara.SessionBeachten = true;
		mProgrammPara.SessionParaDB = new SessionParaDB();
		mProgrammPara.SessionParaDB.UebungenBeachten = true;
		mProgrammPara.SessionParaDB.WhereClause = "FK_Programm";
		mProgrammPara.SessionParaDB.anyOf = (aProgramm: ITrainingsProgramm) => {
			return aProgramm.id as any
		};

		mProgrammPara.SessionParaDB.UebungParaDB = new UebungParaDB();
		mProgrammPara.SessionParaDB.UebungParaDB.SaetzeBeachten = true;

		return this.LadeProgrammeEx(mProgrammPara).then((aProgramme) => {
			this.StandardProgramme = aProgramme;
			return aProgramme;
		});
	}


	public async LadeProgrammeEx(aProgrammPara: ProgrammParaDB): Promise<Array<ITrainingsProgramm>> {
		this.InitProgramm();
		return await this.ProgrammTable
			.where(aProgrammPara.WhereClause)
			.anyOf(aProgrammPara.anyOf())
			.and(aProgrammPara.And === undefined ? () => { return 1 === 1 } : (aProgramm) => aProgrammPara.And(aProgramm))
			.limit(aProgrammPara.Limit === undefined ? cMaxLimnit : aProgrammPara.Limit)
			.sortBy(aProgrammPara.SortBy === undefined ? '' : aProgrammPara.SortBy)
			.then(aProgrammPara.Then === undefined ? async (aProgramme: Array<ITrainingsProgramm>) => {
				for (let index = 0; index < aProgramme.length; index++) {
					if (aProgrammPara.SessionBeachten !== undefined && aProgrammPara.SessionBeachten === true) {
						const mPtrProgramm = aProgramme[index];
						let mSessionParaDB: SessionParaDB;
						
						if (aProgrammPara.SessionParaDB !== undefined) {
							mSessionParaDB = aProgrammPara.SessionParaDB;
						}
						else {
							mSessionParaDB = new SessionParaDB();
							mSessionParaDB.WhereClause = "FK_Programm";
							mSessionParaDB.anyOf = () => {
								return mPtrProgramm.id as any;
							};
						}
					
						await this.LadeProgrammSessionsEx(mSessionParaDB, aProgramme[index])
							.then((aSessionListe: Array<Session>) => {
								mPtrProgramm.SessionListe = aSessionListe;
							});
					}
					else if (aProgrammPara.SessionParaDB !== undefined) await this.LadeProgrammSessionsEx(aProgrammPara.SessionParaDB);
				
				}
				if (aProgrammPara.OnProgrammAfterLoadFn !== undefined) aProgrammPara.OnProgrammAfterLoadFn(aProgramme);

				return aProgramme;
			
			} : (aProgramme: Array<ITrainingsProgramm>) => aProgrammPara.Then(aProgramme));
	}

	public async SatzSpeichern(aSatz: Satz): Promise<number> {
		return await this.SatzTable.put(aSatz.SatzDB);
	}

	public async SaetzeSpeichern(aSaetze: Array<Satz>) {
		let mSaetzeDB: Array<SatzDB> = [];
		aSaetze.forEach((mSatz) => {
			mSaetzeDB.push(mSatz.SatzDB);
		});
		return this.SatzTable.bulkPut(mSaetzeDB);
	}

	public async UebungSpeichern(aUebung: Uebung): Promise<number> {
		aUebung.FkAltProgress = aUebung.FkProgress;
		aUebung.AltWeightProgress = aUebung.WeightProgress;
		aUebung.FkOrgProgress = aUebung.FkProgress;
		aUebung.AltProgressGroup = aUebung.ProgressGroup;
		
		let mSatzListe: Array<Satz>;
		if (aUebung.SatzListe !== undefined)
			mSatzListe = aUebung.SatzListe.map(sz => sz);
		
		aUebung.SatzListe = [];
		return await this.UebungTable.put(aUebung.UebungDB)
			.then(async (mUebungID) => {
				if (mSatzListe !== undefined) {
					for (let index = 0; index < mSatzListe.length; index++) {
						const mSatz = mSatzListe[index];
						mSatz.UebungID = mUebungID;
						mSatz.SessionID = aUebung.SessionID;
						const mGewichtDiff = cloneDeep(mSatz.GewichtDiff);
						mSatz.GewichtDiff = [];
						mSatz.GewichtDiff = mGewichtDiff;
						// mSatz.Datum = mSatz.Status === SatzStatus.Fertig ? aUebung.Datum : undefined;
						mSatz.Datum = aUebung.Datum;
						await this.SatzSpeichern(mSatz).then(
							(mSatzID) => {
								aUebung.SatzListe.push(mSatz);
							});
					}
					// this.SaetzeSpeichern(mSatzListe);
				}
				return aUebung.ID;
			})
	}

	public async SessionSpeichern(aSession: Session, aSessionExtraParaDB?: SessionParaDB): Promise<Session> {
		if (aSession.Datum === undefined || aSession.Datum === null)
			aSession.Datum = new Date;
		
		return await this.SessionTable.put(aSession.SessionDB).then((mID) => {
			aSession.ID = mID;
			aSession.UebungsListe.forEach(async (mUebung: Uebung) => {
				mUebung.SessionID = aSession.ID;
				mUebung.FK_Programm = aSession.FK_Programm;
				if ((mUebung.Datum === undefined) || (mUebung.Datum === null))
					mUebung.Datum = aSession.Datum;
				await this.UebungSpeichern(mUebung);
			});
			return aSession;
		});
	}

	public async ProgrammSpeichern(aTrainingsProgramm: ITrainingsProgramm, aProgrammExtraParaDB?: ProgrammParaDB): Promise<ITrainingsProgramm> {
		return await this.ProgrammTable.put(aTrainingsProgramm)
			.then(async (mID) => {
				aTrainingsProgramm.id = mID;
				const mSessionListe: Array<Session> = aTrainingsProgramm.SessionListe as Array<Session>;
				
				mSessionListe.forEach(async (mSession) => {
					mSession.FK_Programm = mID;
					await this.SessionSpeichern(mSession);
				});
				//  aTrainingsProgramm.SessionListe = [];

				// this.ProgrammTable.where({ id: mid })
				// 	.toArray()
				// 	.then((mTrainingsProgramm) => {
				// 		const aTrainingsProgramm = mTrainingsProgramm[0];
				// 	});
				return aTrainingsProgramm;
			});
	}

	public async ErzeugeVorlageProgramm(aProgrammTyp: ProgrammTyp) {
		let mTrainingsProgramm: ITrainingsProgramm = null;

		if (aProgrammTyp === ProgrammTyp.Gzclp) {
			mTrainingsProgramm = GzclpProgramm.ErzeugeGzclpVorlage(this);
		}

		await this.ProgrammSpeichern(mTrainingsProgramm);
		this.LadeProgrammeEx(this.ProgramLadeStandardPara);
	}

	public static StaticCheckNumber(aNumberText: string): number {
		try {
			const mNumber = Number.parseFloat(aNumberText);
			if (Number.isNaN(mNumber))
				return 0;
			return mNumber;
		} catch (err) {
			return 0;
		}
	}



	//#region Sprache
	private async InitSprache() {
		this.SpracheTable = this.table(this.cSprache);
		this.SpracheTable.mapToClass(Sprache);
		await this.LadeAlleSprachen().then(async (mSprachen) => {
			if (mSprachen.length === 0) {
				await this.InsertSprache(Sprache.StaticNeueSprache(
					cEnglish,
					cEnglishKuerzel,
					cEnglishDatumFormat,
					cEnglishZeitFormat
				));

				await this.InsertSprache(Sprache.StaticNeueSprache(
					cDeutsch,
					cDeutschKuezel,
					cDeutschDatumFormat,
					cDeutschZeitFormat
				));
			} else {
				if (mSprachen.find((aSprache) => aSprache.Name === cDeutsch) === undefined)
					await this.InsertSprache(Sprache.StaticNeueSprache(
						cDeutsch,
						cDeutschKuezel,
						cDeutschDatumFormat,
						cDeutschZeitFormat
					));
					
				if (mSprachen.find((aSprache) => aSprache.Name = cEnglish) === undefined)
					await this.InsertSprache(Sprache.StaticNeueSprache(
						cEnglish,
						cEnglishKuerzel,
						cEnglishDatumFormat,
						cEnglishZeitFormat
					));

			}
		});
	}

	async InsertSprache(aSprache: Sprache) {
		await this.SpracheTable.put(aSprache);
	}

	public async LadeAlleSprachen(): Promise<Array<Sprache>> {
		return await this.SpracheTable
			.toArray()
			.then(async (aSprachen: Array<Sprache>) => {
				return aSprachen;
			});
	}

	public async LadeSpracheFromID(aID: number): Promise<Sprache> {
		return await this.SpracheTable
			.where({ id: aID })
			.first(async (aSprache: Sprache) => {
				return aSprache;
			});
	}
	//#endregion

	//#region  AppaData
	private async InitAppData() {
		this.AppDataTable = this.table(this.cAppData);
		this.AppDataTable.mapToClass(AppData);
		await this.LadeAppData().then((aAppRec) => (this.AppRec = aAppRec));

		if (!this.AppRec) {
			this.AppRec = new AppData();
			await this.AppDataTable.put(this.AppRec).catch((error) => {
				console.error(error);
			});
		}
		
		if (this.AppRec.SprachID === undefined || this.AppRec.SprachID <= 0) {
			this.LadeAlleSprachen().then(async (aSprachen) => {
				// const mSprache = aSprachen.find((aSprache) => aSprache.Kuerzel === this.fTranslateService.getBrowserLang());
				const mSprache = new Sprache();
				this.AppRec.SprachID = mSprache.id;
				this.AktuellSprache = mSprache;
				await this.AppDataTable.put(this.AppRec).catch((error) => {
					console.error(error);
				})
			});
		} else {
			this.LadeSpracheFromID(this.AppRec.SprachID)
				.then((aSprache) => this.AktuellSprache = aSprache);
		}// if
	}

	public async LadeAppData(): Promise<AppData> {
		return await this.AppDataTable
			.limit(1)
			.first((aAppRec) => {
				this.AppRec = aAppRec;
				return aAppRec;
			});
	}

	public async AppDataSpeichern(aAppData: AppData) {
		this.AppRec = aAppData;
		await this.AppDataTable.put(aAppData); //.then( () =>  this.LadeAppData().then ((aAppRec) => this.AppRec = aAppRec ));
		
	}
	//#endregion

	public InitSessionSaetze(aQuellSession: Session, aZielSession: Session) {
		aZielSession.UebungsListe = [];
		for (let index = 0; index < aQuellSession.UebungsListe.length; index++) {
			const mQuellUebung = aQuellSession.UebungsListe[index];
			// Zielübung
			const mUebung: Uebung = mQuellUebung.Copy();
			mUebung.ID = undefined;
			mUebung.SessionID = aZielSession.ID;
			mUebung.SatzListe = [];
			mUebung.Expanded = false;

			let mGewicht: number;
			let mProgress: Progress;
			if (mQuellUebung.FkProgress !== undefined
				&& mQuellUebung.FkProgress > 0) {
				mProgress = this.ProgressListe.find((p) => p.ID === mQuellUebung.FkProgress);
				if (mProgress !== undefined
					&& mProgress.ProgressSet === ProgressSet.First
					&& mQuellUebung.SatzListe !== undefined
				) {
					const mPtrQuellSatz = mQuellUebung.SatzListe.find((sz) => sz.SatzListIndex > 0);
					if (mPtrQuellSatz !== undefined) {
						if (aQuellSession.Kategorie02 === SessionStatus.Fertig
							&& mQuellUebung.ArbeitsSaetzeStatus === SaetzeStatus.AlleFertig) {
							mGewicht = mPtrQuellSatz.GewichtAusgefuehrt;
						}
						else if (
							mPtrQuellSatz.GewichtDiff !== undefined
							&& mPtrQuellSatz.GewichtDiff.length > 0) {
							mGewicht = mPtrQuellSatz.GewichtAusgefuehrt - mPtrQuellSatz.GewichtDiff[mPtrQuellSatz.GewichtDiff.length - 1].Gewicht;
						}//if
					}//if
				}
			}
				
			mQuellUebung.SatzListe.forEach((sz) => {
				// Zielsatz
				const mSatz: Satz = sz.Copy();
				mSatz.ID = undefined;
				mSatz.WdhAusgefuehrt = mSatz.WdhBisVorgabe;
				mSatz.GewichtAusgefuehrt = mGewicht !== undefined ? mGewicht : mSatz.GewichtAusgefuehrt;
				mSatz.GewichtVorgabe = mSatz.GewichtAusgefuehrt;
				mSatz.SessionID = aZielSession.ID;
				mSatz.Status = SatzStatus.Wartet;
				mUebung.SatzListe.push(mSatz);
			});
			aZielSession.addUebung(mUebung);
		}
	}

	// private async LastSession(aSession: Session): Promise<Session> {
	// 	const mSessions: Array<Session> = await this.LadeProgrammSessionsEx({
	// 		OnSessionAfterLoadFn: (aSessions: Array<Session>) => {
	// 			aSessions = aSessions.filter((s: Session) => s.ID !== aSession.ID && s.Datum <= aSession.Datum);

	// 			aSessions = aSessions.sort((s1, s2) => {
	// 				if (s1.Datum > s2.Datum) return -1;

	// 				if (s1.Datum < s2.Datum) return 1;

	// 				return 0;
	// 			});

	// 			while (aSessions.length > 1) aSessions.shift();

	// 			return aSessions;
	// 		},

	// 		WhereClause: "FK_VorlageProgramm,Kategorie02,SessionNr";
	// 		AnyFn = () => {
	// 			[	aSession.FK_VorlageProgramm,
	// 				SessionStatus.Fertig,
	// 				aSession.SessionNr
	// 			]
	// 		};
			
	// 	});

	// 	let mResultSession = undefined;
	// 	if (mSessions.length > 0) {
	// 		mResultSession = mSessions.pop();
	// 		await this.LadeSessionUebungenEx(mResultSession, { WhereClause: "SessionID: mResultSession.ID" }).then((mUebungen) => {
	// 			const x = mUebungen;
	// 		});
	// 	}

	// 	return mResultSession;
	// }

	public async CheckSessionUebungen(aSession: Session) {
		if ((aSession.UebungsListe !== undefined)
			&& (aSession.ID !== undefined)
			&& (aSession.UebungsListe.length === 0)) {
			const mUebungParaDB: UebungParaDB = new UebungParaDB();
			mUebungParaDB.SaetzeBeachten = true;
			await this.LadeSessionUebungenEx(aSession, mUebungParaDB)
				.then((mUebungen) => aSession.UebungsListe = mUebungen)
		}
	}

	public async CheckUebungSaetze(aUebung: Uebung) {
		if (aUebung.SatzListe.length === 0) {
			await this.LadeUebungsSaetze(aUebung.ID)
				.then((mSaetze) => aUebung.SatzListe = mSaetze)
		}
	}


	public async EvalAktuelleSessionListe(aSession: Session, aPara?: any): Promise<void> {
		if (DexieSvcService.StaticAktuellesProgramm && DexieSvcService.StaticAktuellesProgramm.SessionListe) {
			const mSess: ISession = DexieSvcService.StaticAktuellesProgramm.SessionListe.find((s) => s.ID === aSession.ID);
			if (aSession.Kategorie02 === SessionStatus.Loeschen) {
				// Die Session kann schon aus der Session-Liste des aktuellen Programms genommen werden.
				if (mSess !== undefined) {
					const mIndex = DexieSvcService.StaticAktuellesProgramm.SessionListe.indexOf(aSession);
					if (mIndex > -1) DexieSvcService.StaticAktuellesProgramm.SessionListe.splice(mIndex, 1);
				}
			} else {
				// Die Session ersteinmal in die Session-Liste des aktuellen Programms aufnehmen.
				//		if (mSess === undefined) this.AktuellesProgramm.SessionListe.push(aSession);
			}
		}

		if (aSession.Kategorie02 === SessionStatus.Fertig || aSession.Kategorie02 === SessionStatus.Loeschen) {
			await this.SessionSpeichern(aSession);

			const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
			mSessionCopyPara.CopySatzID = false;
			mSessionCopyPara.CopyUebungID = false;
			const mNeueSession: Session = Session.StaticCopy(aSession, mSessionCopyPara);
			mNeueSession.init();
			this.InitSessionSaetze(aSession, mNeueSession);
			mNeueSession.FK_Programm = aSession.FK_Programm;
			mNeueSession.FK_VorlageProgramm = aSession.FK_VorlageProgramm;
			mNeueSession.Expanded = false;
			
			// export enum SessionStatus {
			// 	NurLesen, 
			// 	Bearbeitbar,
			// 	Wartet,
			// 	Pause,
			// 	Laueft,
			// 	Fertig,
			// 	FertigTimeOut,
			// 	Loeschen
			// }
			
			const mIndex = DexieSvcService.StaticAktuellesProgramm.SessionListe.findIndex((s) => s.ID === aSession.ID);
			if (mIndex > -1)
				DexieSvcService.StaticAktuellesProgramm.SessionListe.splice(mIndex, 1);
			
			const mAkuelleSessionListe: Array<ISession> = DexieSvcService.StaticAktuellesProgramm.SessionListe.filter((s) =>
				s.Kategorie02 !== SessionStatus.Fertig
				&& s.Kategorie02 !== SessionStatus.FertigTimeOut
				|| s.ID === aSession.ID
				|| s.ListenIndex === aSession.ListenIndex
			);
			

			mNeueSession.UebungsListe.forEach(
				(u) => {
					if ((u.ArbeitsSatzListe !== undefined)
						&& (u.ArbeitsSatzListe.length > 0)
					) {
						const mPtrLetzerSatz: Satz = u.ArbeitsSatzListe[u.ArbeitsSatzListe.length - 1];
						if (mPtrLetzerSatz.GewichtDiff !== undefined
							&& mPtrLetzerSatz.GewichtDiff.length > 0) {
							u.ArbeitsSatzListe.forEach((sz) => sz.SetPresetWeight(Number(mPtrLetzerSatz.GewichtVorgabe)));
						}
					}
				});

			mAkuelleSessionListe.push(mNeueSession);
			
			for (let index = 0; index < mAkuelleSessionListe.length; index++) {
				let mPtrSession: ISession = mAkuelleSessionListe[index];
				mPtrSession.ListenIndex = index;
				await this.SessionSpeichern(mPtrSession as Session);
			}

			if (aSession.Kategorie02 === SessionStatus.Loeschen)
				this.SessionTable.delete(aSession.ID);
			
			if ((aPara !== undefined) && (aPara.ExtraFn !== undefined))
				aPara.ExtraFn(mNeueSession);
		}//if
	}


	public async MakeExample(aProgram: ITrainingsProgramm) {
		if (aProgram === undefined || aProgram.SessionListe.length <= 0)
			return;

		// Alle Sessions löschen 
		await this.SessionTable.toArray(async (aSessionListe) => {
			aSessionListe.forEach((aSession: Session) => {
				if (aSession.FK_VorlageProgramm > 0)
					this.SessionTable.delete(aSession.ID);
			});

			const mMaxWochen: number = 52;
			const mSessionsProWoche = 4;
			let mMaxSessions: number = mMaxWochen * mSessionsProWoche;
			let mDatum: Date = new Date();
			mDatum.setDate(-((mMaxSessions / mSessionsProWoche) * 7));
			let mMontag: number = mDatum.getDay();
			// Mit Montag als ersten Trainingstag beginnen. 
			while (mMontag > 1) {
				mDatum.setDate(mDatum.getDate() - 1);
				mMontag = mDatum.getDay();
			}

			let mStartGewicht: number = 10;
			// Sessions
			while (mMaxSessions > 0) {
				for (let mSessionIndex = 0; mSessionIndex < aProgram.SessionListe.length; mSessionIndex++) {
					const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
					mSessionCopyPara.CopyUebungID = false;
					mSessionCopyPara.CopySatzID = false;
					const mSession: Session = Session.StaticCopy(aProgram.SessionListe[mSessionIndex], mSessionCopyPara);
					mSession.init();
					mSession.GestartedWann = mDatum;
					// Übungen
					for (let mUebungsIndex = 0; mUebungsIndex < mSession.UebungsListe.length; mUebungsIndex++) {
						const mUebung: Uebung = mSession.UebungsListe[mUebungsIndex];
						// Sätze
						for (let mSatzIndex = 0; mSatzIndex < mUebung.ArbeitsSatzListe.length; mSatzIndex++) {
							const mSatz: Satz = mUebung.ArbeitsSatzListe[mSatzIndex];
							mSatz.GewichtAusgefuehrt = mStartGewicht;
							mSatz.WdhAusgefuehrt = 10;
							mSatz.Status = SatzStatus.Fertig;
						}
					}// <<< Uebung
					// Session-Status auf fertig setzen
					mSession.SetSessionFertig();
					await this.SessionSpeichern(mSession);

					// const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
					// mSessionCopyPara.CopyUebungID = false;
					// mSessionCopyPara.CopySatzID = false;
					// // Mit den Daten der gespeicherten Session eine neue erstellen
					// const mNeueSession: Session = Session.StaticCopy(mSession, mSessionCopyPara);
					// mSession.ListenIndex = -mSession.ListenIndex;
					// // Neue Session initialisieren
					// mNeueSession.init();
					// // Die neue Session gehört zum gleichen Programm wie die Alte
					// mNeueSession.FK_Programm = mSession.FK_Programm;
					// // Die Neue Session hat das gleiche Vorlage-Programm wie die Alte.
					// mNeueSession.FK_VorlageProgramm = mSession.FK_VorlageProgramm;
					// this.InitSessionSaetze(mSession, mNeueSession as Session);
					// // Satzvorgaben für Sätze der neuen Übung setzen
					// mNeueSession.UebungsListe.forEach((mNeueUebung) => {
					// 	mNeueUebung.SatzListe.forEach((mNeuerSatz) => {
					// 		mNeuerSatz.GewichtVorgabe = mNeuerSatz.GewichtNaechsteSession;
					// 		mNeuerSatz.GewichtAusgefuehrt = mNeuerSatz.GewichtNaechsteSession;
					// 	});
					// });

					let mTag = mDatum.getDay();
					switch (mTag) {
						// Montag?
						case 1:
						// Donnerstag?
						case 4:
							// Auf kommenden Dienstag oder kommenden  Freitag setzen
							mDatum.setDate(mDatum.getDate() + 1);
							break;
						// Dienstag?
						case 2:
							// Auf kommenden Donnerstag setzen
							mDatum.setDate(mDatum.getDate() + 2);
							break;
						// Freitag?
						case 5:
							// Auf kommenden Montag setzen
							mDatum.setDate(mDatum.getDate() + 3);
							break;
					}//switch
					// await this.SessionSpeichern(mNeueSession).then(
					// 	async () => {
					// 		aProgram.SessionListe.push(mNeueSession);
					// 		aProgram.NummeriereSessions();
					// 		await this.ProgrammSpeichern(aProgram).then(() => {
					// 		});
					// 	});
			
					if (--mMaxSessions <= 0)
						break;
				}//for <<< Session
				mStartGewicht += 2.5;
			}// while
		});
	}
}
// if (typeof Worker !== 'undefined') {
//   // Create a new
//   const worker = new Worker(new URL('./dexie-svc.worker', import.meta.url));
//   worker.onmessage = ({ data }) => {
//     console.log(`page got message: ${data}`);
//   };
//   worker.postMessage('hello');
// } else {
//   // Web Workers are not supported in this environment.
//   // You should add a fallback so that your program still executes correctly.
// 