import { NoAutoCreate, NoAutoCreateDB, NoAutoCreateItem } from '../../Business/NoAutoCreate';
import { cDeutsch, cDeutschKuezel, cEnglish, cEnglishKuerzel, cEnglishDatumFormat, cEnglishZeitFormat, cDeutschDatumFormat, cDeutschZeitFormat } from './../Sprache/Sprache';
import { BodyWeight, BodyWeightDB } from './../../Business/Bodyweight/Bodyweight';
import { HistorySession  } from './../../Business/Session/Session';
import { HypertrophicProgramm } from '../../Business/TrainingsProgramm/Hypertrophic';
import { InUpcomingSessionSetzen, UebungDB } from './../../Business/Uebung/Uebung';
import { Progress, ProgressSet, ProgressTyp, WeightCalculation, WeightProgressTime, ProgressPara } from './../../Business/Progress/Progress';
import { Hantelscheibe } from 'src/Business/Hantelscheibe/Hantelscheibe';
import { Hantel, HantelTyp } from './../../Business/Hantel/Hantel';
import { Equipment, EquipmentOrigin, EquipmentTyp } from './../../Business/Equipment/Equipment';
import { SessionDB, SessionStatus } from './../../Business/SessionDB';
import { Session, ISession } from 'src/Business/Session/Session';
import { ITrainingsProgramm, TrainingsProgramm, ProgrammTyp, ProgrammKategorie, TrainingsProgrammDB } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { DialogeService } from './dialoge.service';
import { Satz, SatzStatus, GewichtDiff, SatzTyp, SatzDB } from './../../Business/Satz/Satz';
import { GzclpProgramm } from 'src/Business/TrainingsProgramm/Gzclp';
import { AppData, GewichtsEinheit } from './../../Business/Coach/Coach';
import { Dexie, PromiseExtended } from 'dexie';
import { Injectable, NgModule, Optional, SkipSelf } from '@angular/core';
import { UebungsTyp, Uebung, StandardUebungListe , UebungsKategorie02, StandardUebung, SaetzeStatus } from "../../Business/Uebung/Uebung";
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { MuscleGroup, MuscleGroupKategorie01, MuscleGroupKategorie02, StandardMuscleGroup } from '../../Business/MuscleGroup/MuscleGroup';
import { DiaDatum, DiaUebung, DiaUebungSettings } from 'src/Business/Diagramm/Diagramm';
import { Sprache } from '../Sprache/Sprache';
import { ProgramModulTyp } from '../app.module';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { error } from 'console';
import { GlobalService } from './global.service';
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


export class SessionCopyPara  {
	Komplett: boolean = true;
	CopySessionID: boolean = true;
    CopyUebungID: boolean = true;
    CopySatzID: boolean = true;
}

export class ProgramCopyPara extends SessionCopyPara {
    CopyProgramID: boolean = true;
}


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
	readonly cNoCreate: string = "NoCreateDB";

	public HistorySessionsAfterLoadFn: AfterLoadFn = null;
	public static HistorySessions: Array<HistorySession> = [];
	public static HistoryWirdGeladen: boolean = false;
	public static DiagrammeWerdenErstellt: boolean = false;
	public static AktuellesProgramm: ITrainingsProgramm = null;
	public static CmpAktuellesProgramm: ITrainingsProgramm = null;
	public static AllowExamples: boolean = true;
	public static ModulTyp: ProgramModulTyp = null;
	public static GewichtsEinheitText: string = 'KG';
	public static GewichtsEinheit: GewichtsEinheit = GewichtsEinheit.KG;
	private static LanghantelTable: Dexie.Table<Hantel, number>;
	private static HantelscheibenTable: Dexie.Table<Hantelscheibe, number>;
	private static ProgressTable: Dexie.Table<Progress, number>;
	private static DiaUebungSettingsTable: Dexie.Table<DiaUebungSettings, number>;
	private static BodyweightTable: Dexie.Table<BodyWeightDB, number>;
	private static SpracheTable: Dexie.Table<Sprache, number>;
	public static Programme: Array<ITrainingsProgramm> = [];
	public static SessionCopy: ISession;
	public static StammUebungsListe: Array<Uebung> = [];
	public static MuskelGruppenListe: Array<MuscleGroup> = [];
	public static EquipmentListe: Array<Equipment> = [];
	public static LangHantelListe: Array<Hantel> = [];
	public static VerfuegbareProgramme: Array<ITrainingsProgramm> = [];
	public static HantelscheibenListe: Array<Hantelscheibe> = [];
	public static NoAutoCreateListe: Array<NoAutoCreate> = [];
	public static ProgressListe: Array<Progress> = [];
	public static AppDataTable: Dexie.Table<AppData, number>;
	private static UebungTable: Dexie.Table<UebungDB, number>;
	private static SatzTable: Dexie.Table<SatzDB, number>;
	private static ProgrammTable: Dexie.Table<TrainingsProgrammDB, number>;
	private static SessionTable: Dexie.Table<SessionDB, number>;
	private static MuskelGruppeTable: Dexie.Table<MuscleGroup, number>;
	public static AppRec: AppData;
	public static AktuellSprache: Sprache;
	private static EquipmentTable: Dexie.Table<Equipment, number>;
	private static NoAutoCreateTable: Dexie.Table<NoAutoCreateDB, number>;
	public static DiagrammDatenListe: Array<DiaDatum> = [];

	private get HantelTable(): Dexie.Table<Hantel, number> {
		return this.table(this.cHantel);
	};

	    
    static CreateTrainingsProgramm(aProgrammTyp: ProgrammTyp): ITrainingsProgramm {
        switch (aProgrammTyp) {
            case ProgrammTyp.Gzclp:
                return new GzclpProgramm(ProgrammKategorie.Vorlage,null);
            case ProgrammTyp.HypertrophicSpecific:
                return new HypertrophicProgramm(ProgrammKategorie.Vorlage,null);
            default: return new TrainingsProgramm();
        }
    }
        

	RefreshAktuellesProgramm: boolean = false;
	// Siehe Anstehende-Sessions
	public MustLoadDiagramData: boolean = true;
	private ProgramLadeStandardPara: ProgrammParaDB;
//	private DialogData = new DialogData();
	private InitDialogData = new DialogData();

	public ErstelleDiagrammData(aVonDatum: Date, aBisDatum: Date, aSessionListe: Array<Session>, aDiagrammDatenListe: Array<DiaDatum>) {
		DexieSvcService.DiagrammeWerdenErstellt = true;
		let mBisDatum: Date = aBisDatum;
		if (aBisDatum < cMaxDatum)
			mBisDatum.setDate(aBisDatum.getDate() + 1);
		else
			mBisDatum = cMinDatum;
		
		DexieSvcService.DiagrammDatenListe = [];
		aBisDatum.setHours(0, 0, 0, 0);
		aVonDatum.setHours(0, 0, 0, 0);
		try {
			let mResult: Array<Session> = aSessionListe;

			for (let mSessionIndex = 0; mSessionIndex < mResult.length; mSessionIndex++) {
				const mPtrSession: Session = mResult[mSessionIndex];
				if ((mPtrSession.GestartedWann === null) || (mPtrSession.GestartedWann === undefined))
					continue;
							
				const mNurSessionDatum = new Date(mPtrSession.GestartedWann.toDateString());
				Session.StaticCheckMembers(mPtrSession);
				mPtrSession.PruefeGewichtsEinheit(DexieSvcService.AppRec.GewichtsEinheit);
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
								
			}
			aDiagrammDatenListe.sort((d1, d2) => {
				if (d1.Datum.valueOf() < d2.Datum.valueOf())
					return -1;

				if (d1.Datum.valueOf() > d2.Datum.valueOf())
					return 1;

				return 0;
			});

			DexieSvcService.DiagrammDatenListe = aDiagrammDatenListe;
			DexieSvcService.DiagrammeWerdenErstellt = false;
			this.fDialogHistoryService.fDialog.closeAll();
		} catch (err) {
			DexieSvcService.DiagrammeWerdenErstellt = false;
			this.fDialogHistoryService.fDialog.closeAll();
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
	
	public UpComingSessionList(): Array<Session> {
		if ((DexieSvcService.AktuellesProgramm) && (DexieSvcService.AktuellesProgramm.SessionListe)) {
			DexieSvcService.AktuellesProgramm.SessionListe =
				DexieSvcService.AktuellesProgramm.SessionListe.filter(
					(s) => (s.Kategorie02 !== SessionStatus.Fertig && s.Kategorie02 !== SessionStatus.FertigTimeOut)
				);
			return this.SortSessionByListenIndex(DexieSvcService.AktuellesProgramm.SessionListe);
		}
		return undefined;
	}

	public DeleteProgram(aProgramm: TrainingsProgramm) {
		aProgramm.SessionListe.forEach((s) => {
			if (s.Kategorie02 !== SessionStatus.Fertig && s.Kategorie02 !== SessionStatus.FertigTimeOut) {
				s.UebungsListe.forEach((u) => {
					if (u.ID !== undefined) DexieSvcService.UebungTable.delete(u.ID);
					u.SatzListe.forEach((sz) => {
						if (sz.ID !== undefined) DexieSvcService.SatzTable.delete(sz.ID);
					});
				});

				if (s.ID !== undefined) DexieSvcService.SessionTable.delete(s.ID);
			}
		});
		DexieSvcService.ProgrammTable.delete(aProgramm.id);
	}

	public DeleteSession(aSession: Session) {
		if (aSession.UebungsListe !== undefined)
			aSession.UebungsListe.forEach((mLoeschUebung) => this.DeleteUebung(mLoeschUebung));
		
		DexieSvcService.SessionTable.delete(aSession.ID);
	}

	public async DeleteUebung(aUebung: Uebung) {
		aUebung.SatzListe.forEach((mLoeschSatz) => {
			if (mLoeschSatz.ID === undefined)
				this.DeleteSatz(mLoeschSatz);
		});

		DexieSvcService.UebungTable.delete(aUebung.ID);
	}

	public DeleteSatz(aSatz: Satz) {
		DexieSvcService.SatzTable.delete(aSatz.ID);
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

	public SetAktuellesProgramm(aSelectedProgram: TrainingsProgramm): Promise<ITrainingsProgramm> {
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
					.then((mSessions) => {
						aSelectedProgram.SessionListe = mSessions;
					});
			}
			
			const mProgramCopyPara: ProgramCopyPara = new ProgramCopyPara();
			mProgramCopyPara.CopyProgramID = false;
			mProgramCopyPara.CopySessionID = false;
			mProgramCopyPara.CopyUebungID = false;
			mProgramCopyPara.CopySatzID = false;
			const mNeuProgramm = aSelectedProgram.Copy(mProgramCopyPara);
			
			mNeuProgramm.FkVorlageProgramm = aSelectedProgram.id;
			// Die Kategorie des ausgewählten Programms wird auf "AktuellesProgramm" gesetzt
			mNeuProgramm.ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;

			if (mNeuProgramm.SessionListe) {
				for (let index = 0; index < mNeuProgramm.SessionListe.length; index++) {
					// Session aus dem Quell-Programm
					const mQuellSessionPtr = aSelectedProgram.SessionListe[index];
					const mNeueSessionPtr = mNeuProgramm.SessionListe[index];
					mNeueSessionPtr.FK_VorlageProgramm = aSelectedProgram.id;
					if (mNeueSessionPtr.UebungsListe) {
						for (let mUebungIndex = 0; mUebungIndex < mNeueSessionPtr.UebungsListe.length; mUebungIndex++) {
							// Uebung aus der Quell-Session
							const mQuellUebungPtr = mQuellSessionPtr.UebungsListe[mUebungIndex];
							const mNeueUebungPtr = mNeueSessionPtr.UebungsListe[mUebungIndex];
							if (mNeueUebungPtr.SatzListe) {
								for (let mSatzIndex = 0; mSatzIndex < mNeueUebungPtr.SatzListe.length; mSatzIndex++) {
									// Satz aus der Quell-Uebung
									const mQuellSatzPtr: Satz = mQuellUebungPtr.SatzListe[mSatzIndex];
									const mNeueSatzPtr: Satz = mNeueUebungPtr.SatzListe[mSatzIndex];
									mNeueSatzPtr.GewichtVorgabe = mQuellSatzPtr.GewichtAusgefuehrt;
									mNeueSatzPtr.WdhVonVorgabe = mQuellSatzPtr.WdhAusgefuehrt;
								}//for
							}//for
						}
					}//for
				}
			}//if

			return await this.ProgrammSpeichern(mNeuProgramm)
				.then((mSavedProgram) => {
						DexieSvcService.AktuellesProgramm = mSavedProgram;
						mProgramCopyPara.CopyProgramID = true;
						mProgramCopyPara.CopySessionID = true;
						mProgramCopyPara.CopyUebungID = true;
						mProgramCopyPara.CopySatzID = true;
						DexieSvcService.CmpAktuellesProgramm = mSavedProgram.Copy(mProgramCopyPara);
						return DexieSvcService.AktuellesProgramm;
					});
		});
	}

	public get HantenscheibeListeSortedByDiameterAndWeight(): Array<Hantelscheibe> {
		return DexieSvcService.HantelscheibenListe;
	}

	public LanghantelListeSortedByName(aIgnorGeloeschte: Boolean = true): Array<Hantel> {
		return DexieSvcService.LangHantelListe;
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
		public fDialogHistoryService: DialogeService,
		private fDialogInitService: DialogeService,
		private router: Router,
		// private fTranslateService: TranslateService,
		@Optional() @SkipSelf()
		parentModule?: DexieSvcService)
	{
		super("ConceptCoach");
		if (parentModule) {
			throw new Error("DexieSvcService is already loaded. Import it in the AppModule only");
		}

		if (DexieSvcService.ModulTyp === null)
			DexieSvcService.ModulTyp = ProgramModulTyp.Kein;
		// 
		     //       Dexie.delete("ConceptCoach");
		this.version(48).stores({
			AppData: "++id",
			UebungDB: "++ID,Name,Typ,Kategorie02,FkMuskel01,FkMuskel02,FkMuskel03,FkMuskel04,FkMuskel05,SessionID,FkUebung,FkProgress,FK_Programm,[FK_Programm+FkUebung+FkProgress+ProgressGroup+ArbeitsSaetzeStatus],Datum,WeightInitDate,FailDatum",
			Programm: "++id,&[Name+ProgrammKategorie],FkVorlageProgramm,ProgrammKategorie,[FkVorlageProgramm+ProgrammKategorie]",
			SessionDB: "++ID,Name,Datum,ProgrammKategorie,FK_Programm,FK_VorlageProgramm,Kategorie02,[FK_VorlageProgramm+Kategorie02],[FK_Programm+Kategorie02],ListenIndex,GestartedWann",
			SatzDB: "++ID,UebungID,Datum,[UebungID+Status]",
			MuskelGruppe: "++ID,Name,MuscleGroupKategorie01",
			Equipment: "++ID,Name",
			Hantel: "++ID,Name,Typ,fDurchmesser",
			Hantelscheibe: "++ID,&[Durchmesser+Gewicht]",
			Progress: "++ID,&Name",
			DiaUebungSettings: "++ID,&UebungID",
			BodyWeightDB: "++ID,Datum",
			Sprache: "++id",
			NoCreateDB: "++id"
			
		});

		this.InitDatenbank();
	}

	public DoTheme(aValue: boolean) {
		DexieSvcService.AppRec.isLightTheme = aValue;
		this.SetAppData(DexieSvcService.AppRec)
		.then((aAppData) => { 
				document.body.setAttribute(
					'data-theme',
					DexieSvcService.AppRec.isLightTheme ? 'light' : 'dark'
				);

			});
	}
  

	static CalcPosAfterDragAndDrop(aListe: Array<any>, aEvent: CdkDragDrop<any>):boolean {
		if (aEvent.currentIndex === aEvent.previousIndex)
			return false;

		let mPtr: any  = aListe[aEvent.previousIndex];
		
		if (aEvent.currentIndex  < aEvent.previousIndex) 
			// Nach oben schieben
			aListe = aListe.copyWithin(aEvent.currentIndex + 1, aEvent.currentIndex, aEvent.previousIndex);
		else 
			// Nach unten schieben
			aListe = aListe.copyWithin(aEvent.previousIndex, aEvent.previousIndex + 1, aEvent.currentIndex + 1);
		
		aListe[aEvent.currentIndex] = mPtr;
		return true;
	}
			
	async InitDatenbank() {
		try {
			this.InitDialogData.height = '100px';
			this.InitDialogData.ShowOk = false;
			this.InitDialogData.textZeilen.push(`Initializing...`);
			this.fDialogInitService.Loading(this.InitDialogData);
			this.InitAll();
			this.PruefeStandardProgress();
			this.PruefeStandardLanghanteln();
			this.PruefeStandardEquipment();
			this.PruefeStandardMuskelGruppen();
		} catch (err) {
			this.fDialogeService.fDialog.closeAll();
			this.InitDialogData.height = '100px';
			this.InitDialogData.ShowOk = true;
			this.InitDialogData.textZeilen = [];
			this.InitDialogData.textZeilen.push(err);
			this.fDialogInitService.Hinweis(this.InitDialogData);
		}

		if (DexieSvcService.AktuellesProgramm === null) {
			await this.LadeAktuellesProgramm()
				.then(() => {
					return DexieSvcService.AktuellesProgramm;
				});
		}

		// Falls Beispiel-Daten erzeugt werden nsollen, darf die Historie erst später erzeugt werden! 
		if ((DexieSvcService.AllowExamples === false)
			// Sind schon Beispiel-Daten erzeugt?	
			|| (DexieSvcService.NoAutoCreateListe.find((mNoCreate) => mNoCreate.noCreateItem === NoAutoCreateItem.ExamplePrograms) !== undefined))
			// Das Erzeugen von Beispieldaten ist nicht erlaubt oder sie sind schon erzeugt	
			this.LadeHistorySessions(null, null);
	}

	ResetDatenbank() {
		DexieSvcService.AktuellesProgramm = null;
		DexieSvcService.NoAutoCreateListe = [];
		DexieSvcService.NoAutoCreateTable.clear();
		DexieSvcService.ProgrammTable.clear()
			.then(() => {
				DexieSvcService.SessionTable.clear()
					.then(() => {
						DexieSvcService.UebungTable.clear()
							.then(() => {
								DexieSvcService.SatzTable.clear()
									.then(() => {
										this.InitDatenbank();
									});
							});
					});
			});
	}

	get UebungListeSortedByName(): Array<Uebung> {
		// return this.StammUebungsListe;
		const mResult: Array<Uebung> = DexieSvcService.StammUebungsListe.map((mUebung) => mUebung);
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
		return DexieSvcService.MuskelGruppenListe;
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
		return DexieSvcService.EquipmentListe;
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
		this.InitNoAutoCreate();
		this.InitEquipment();
		this.InitHantel();
		this.InitProgress();
		this.InitUebung();
		// this.InitSprache();
		this.InitAppData();
		this.InitHantelscheibe();
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
		if (DexieSvcService.ProgressTable === undefined) {
			DexieSvcService.ProgressTable = this.table(this.cProgress);
			DexieSvcService.ProgressTable.mapToClass(Progress);
		}
	}

	private InitHantel() {
		if (DexieSvcService.LanghantelTable === undefined) {
			DexieSvcService.LanghantelTable = this.table(this.cHantel);
			DexieSvcService.LanghantelTable.mapToClass(Hantel);
		}
	}

	private InitHantelscheibe() {
		if (DexieSvcService.HantelscheibenTable === undefined) {
			DexieSvcService.HantelscheibenTable = this.table(this.cHantelscheibe);
			DexieSvcService.HantelscheibenTable.mapToClass(Hantelscheibe);
		}
	}

	private InitMuskelGruppe() {
		if (DexieSvcService.MuskelGruppeTable === undefined) {
			DexieSvcService.MuskelGruppeTable = this.table(this.cMuskelGruppe);
			DexieSvcService.MuskelGruppeTable.mapToClass(MuscleGroup);
		}
	}

	private InitEquipment() {
		if (DexieSvcService.EquipmentTable === undefined) {
			DexieSvcService.EquipmentTable = this.table(this.cEquipment);
			DexieSvcService.EquipmentTable.mapToClass(Equipment);
		}
	}

	private InitSession() {
		if (DexieSvcService.SessionTable === undefined) {
			DexieSvcService.SessionTable = this.table(this.cSession);
			DexieSvcService.SessionTable.mapToClass(SessionDB);
		}
	}

	private InitUebung() {
		if (DexieSvcService.UebungTable === undefined) {
			DexieSvcService.UebungTable = this.table(this.cUebung);
			DexieSvcService.UebungTable.mapToClass(UebungDB);
		}
	}

	private InitSatz() {
		if (DexieSvcService.SatzTable === undefined) {
			DexieSvcService.SatzTable = this.table(this.cSatz);
			DexieSvcService.SatzTable.mapToClass(SatzDB);
		}
	}

	private InitDiaUebung() {
		if (DexieSvcService.DiaUebungSettingsTable === undefined) {
			DexieSvcService.DiaUebungSettingsTable = this.table(this.cDiaUebungSettings);
			DexieSvcService.DiaUebungSettingsTable.mapToClass(DiaUebungSettings);
		}
	}

	private InitBodyweight() {
		if (DexieSvcService.BodyweightTable === undefined) {
			DexieSvcService.BodyweightTable = this.table(this.cBodyweight);
			DexieSvcService.BodyweightTable.mapToClass(BodyWeightDB);
		}
	}

	private InitNoAutoCreate() {
		if (DexieSvcService.NoAutoCreateTable === undefined) {
			DexieSvcService.NoAutoCreateTable = this.table(this.cNoCreate);
			DexieSvcService.NoAutoCreateTable.mapToClass(NoAutoCreateDB);
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
		const mDatum: Date = (aSession.GestartedWann !== undefined) ? aSession.GestartedWann : cMaxDatum;
		
		return DexieSvcService.BodyweightTable
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
					mBwDB.GewichtsEinheit = DexieSvcService.GewichtsEinheit;
					return new BodyWeight(mBwDB);
				}
			})
	}


	public BodyweightSpeichern(aBodyweight: BodyWeight) {
		DexieSvcService.BodyweightTable.put(aBodyweight.BodyWeightDB).then(
			(aID) => {
				aBodyweight.BodyWeightDB.ID = aID;
			});
	}

	public BodyweightListeSpeichern(aBodyweightListe: Array<BodyWeight>) {
		const mBodyweightSpeicherListe: Array<BodyWeightDB> = [];
		aBodyweightListe.map(aBw => mBodyweightSpeicherListe.push(aBw.BodyWeightDB));
		try {
			DexieSvcService.BodyweightTable.bulkPut(mBodyweightSpeicherListe);
		} catch (error) {
			console.error(error);
		}
	}

	public DeleteBodyweight(aID: number) {
		try {
			DexieSvcService.BodyweightTable.delete(aID);
		} catch (error) {
			console.error(error);
		}
	}

	private NeueUebung(aName: string, aKategorie02: UebungsKategorie02, aTyp: UebungsTyp): Uebung {
		const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
		const mKategorieen01 = [].concat(mGzclpKategorieen01);
		const mProgress: Progress = DexieSvcService.ProgressListe.find((p) => p.Name === Progress.cStandardProgress);
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

		return DexieSvcService.MuskelGruppenListe.find((mg) => mg.Name.toUpperCase() === aMuskel.Name.toUpperCase());
	}

	public MuskelgruppeSpeichern(aMuskelgruppe: MuscleGroup) {
		return DexieSvcService.MuskelGruppeTable.put(aMuskelgruppe);
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
		try {
			
			return DexieSvcService.UebungTable.bulkPut(mUebungsDB_Liste, { allKeys: true })
				.then(
					(mKeyList) => {
						for (let index = 0; index < aUebungsListe.length; index++) {
							const mPtrUebung: Uebung = aUebungsListe[index];
							mPtrUebung.UebungDB.ID = mKeyList[index];
						
						}
						return aUebungsListe;
					});
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	public InsertDiaUebungen(aDiaUebungsListe: Array<DiaUebungSettings>): PromiseExtended {
		return DexieSvcService.DiaUebungSettingsTable.bulkPut(aDiaUebungsListe);
	}

	public InsertEineDiaUebung(aDiaUebung: DiaUebungSettings): PromiseExtended {
		return DexieSvcService.DiaUebungSettingsTable.put(aDiaUebung);
	}


	public LadeDiaUebungen(): PromiseExtended<Array<DiaUebungSettings>> {
		return this.table(this.cDiaUebungSettings)
			.toArray()
			.then((mDiaUebungSettings) => {
				return mDiaUebungSettings;
			});
	}


	public DeleteDiaUebung(aDiaUebung: DiaUebung): PromiseExtended {
		return DexieSvcService.DiaUebungSettingsTable.delete(aDiaUebung.ID);
	}

	public DeletetUebung(aUebungID: number): PromiseExtended {
		return DexieSvcService.UebungTable.delete(aUebungID);
	}

	public InsertMuskelGruppen(aMuskelGruppenListe: Array<MuscleGroup>): PromiseExtended {
		return DexieSvcService.MuskelGruppeTable.bulkPut(aMuskelGruppenListe);
	}

	public FindUebung(aUebung: Uebung): boolean {
		return this.UebungExists(aUebung) !== undefined;
	}

	public UebungExists(aUebung: Uebung): Uebung {
		if (aUebung.Name.trim() === "") return undefined;

		return DexieSvcService.StammUebungsListe.find((ub) => ub.Name.toUpperCase() === aUebung.Name.toUpperCase());
	}

	public async LadeProgress(aProgressPara?: ProgressPara) {
		await this.table(this.cProgress)
			.toArray()
			.then((mProgressListe) => {
				DexieSvcService.ProgressListe = mProgressListe;

				if ((aProgressPara !== undefined) && (aProgressPara.AfterLoadFn)) {
					aProgressPara.ProgressListe = mProgressListe;
					aProgressPara.AfterLoadFn(aProgressPara);
				}
			});
	}

	public DeleteProgress(aProgressID: number): PromiseExtended {
		return DexieSvcService.ProgressTable.delete(aProgressID);
	}

	public ProgressListeSortedByName(): Array<Progress> {
		return DexieSvcService.ProgressListe;
	}

	public ProgressSpeichern(aProgess: Progress) {
		return DexieSvcService.ProgressTable.put(aProgess);
	}

	public InsertProgresse(aProgessListe: Array<Progress>) {
		return DexieSvcService.ProgressTable.bulkPut(aProgessListe);
	}

	public HantelscheibeSpeichern(aScheibe: Hantelscheibe) {
		return DexieSvcService.HantelscheibenTable.put(aScheibe);
	}

	public InsertHantelscheiben(aHantelscheibenListe: Array<Hantelscheibe>): PromiseExtended {
		return DexieSvcService.HantelscheibenTable.bulkPut(aHantelscheibenListe);
	}

	public DeleteHantelscheibe(aHantelscheibeID: number): PromiseExtended<void> {
		return DexieSvcService.HantelscheibenTable.delete(aHantelscheibeID);
	}

	public LadeHantelscheiben(aAfterLoadFn?: AfterLoadFn) {
		this.table(this.cHantelscheibe)
			.orderBy(["Durchmesser", "Gewicht"])
			.toArray()
			.then((mHantelscheibenListe) => {
				DexieSvcService.HantelscheibenListe = mHantelscheibenListe;
				if (aAfterLoadFn !== undefined) aAfterLoadFn(mHantelscheibenListe);
			});
	}

	public LadeMuskelGruppen(aAfterLoadFn?: AfterLoadFn) {
		DexieSvcService.MuskelGruppenListe = [];
		this.table(this.cMuskelGruppe)
			.orderBy("Name")
			.toArray()
			.then((mMuskelgruppenListe) => {
				DexieSvcService.MuskelGruppenListe = mMuskelgruppenListe;
				this.fDialogInitService.fDialog.closeAll();
				if (aAfterLoadFn !== undefined) aAfterLoadFn();
			});
	}

	public MuskelListeSortedByName(aIgnorGeloeschte: Boolean = true): Array<MuscleGroup> {
		return DexieSvcService.MuskelGruppenListe;
	}

	public DeleteMuskelGruppe(aMuskelGruppeID: number) {
		return DexieSvcService.MuskelGruppeTable.delete(aMuskelGruppeID);
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
		DexieSvcService.LangHantelListe = [];
		return this.table(this.cHantel)
			.where({ Typ: HantelTyp.Barbell })
			.sortBy("Name")
			.then((mHantelListe) => {
				DexieSvcService.LangHantelListe = mHantelListe;
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

	LadeNoAutoCreate(): PromiseExtended<Array<NoAutoCreate>>{
		return DexieSvcService.NoAutoCreateTable
			.toArray()
			.then((mNoCreateListe) => {
				DexieSvcService.NoAutoCreateListe = [];
				mNoCreateListe.forEach((mNoCreateDB) => {
					const mNoCreate: NoAutoCreate = new NoAutoCreate();
					mNoCreate.noAutoCreateDB = mNoCreateDB;
					DexieSvcService.NoAutoCreateListe.push(mNoCreate); 
				});
				return DexieSvcService.NoAutoCreateListe;
			});
	}

	NoAutoCreateSpeichern(aNoAutoCreate: NoAutoCreate) {
		DexieSvcService.NoAutoCreateTable.put(aNoAutoCreate.noAutoCreateDB);
	}

	DeleteAutoNoCreate(aNoAutoCreate: NoAutoCreate) {
		DexieSvcService.NoAutoCreateTable.delete(aNoAutoCreate.id);
	}

	NoAutoCreateItemSpeichern(aNoAutoCreateItem: NoAutoCreateItem) {
// Beim ersten Start des Programms werden einige Standards angelegt. (Z.B. Workouts)
// Falls diese vom Anwender gelöscht werden, wird ein Eintrag in der Tabelle NoAutoCreateDB erzeugt.
// Dadurch wird verhindert, dass beim nächsten Start des Programms dieser Standard erneut angelegt wird.
		const mNoAutoCreate: NoAutoCreate = new NoAutoCreate();
		mNoAutoCreate.noCreateItem = aNoAutoCreateItem;
		this.NoAutoCreateSpeichern(mNoAutoCreate);
	}


	private async PruefeStandardProgress() {
		await this.LadeNoAutoCreate()
			.then(async() => {
				await DexieSvcService.ProgressTable.orderBy("Name")
					.toArray()
					.then((mProgressListe) => {
						DexieSvcService.ProgressListe = mProgressListe;
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
			});
	}

	public InsertEquipment(aEquipmentListe: Array<Equipment>): PromiseExtended {
		return DexieSvcService.EquipmentTable.bulkPut(aEquipmentListe);
	}

	public LadeEquipment() {
		DexieSvcService.EquipmentListe = [];
		this.table(this.cEquipment)
			.toArray()
			.then((mEquipmentListe) => {
				DexieSvcService.EquipmentListe = mEquipmentListe;
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
		DexieSvcService.StammUebungsListe = [];
		const mAnlegen: Array<Uebung> = new Array<Uebung>();
		return await this.table(this.cUebung)
			.where("Kategorie02")
			.equals(UebungsKategorie02.Stamm as number)
			.toArray()
			.then(async (mUebungen) => {
				let mNeueUebung: Uebung = null;
				for (let index = 0; index < StandardUebungListe.length; index++) {
					const mStandardUebungPtr = StandardUebungListe[index];
					if (mUebungen.find((mUebung) => mUebung.Name === mStandardUebungPtr.Name) === undefined) {
						mNeueUebung = this.NeueUebung(mStandardUebungPtr.Name, UebungsKategorie02.Stamm, mStandardUebungPtr.Typ);
						mNeueUebung.SatzListe = [];
						mAnlegen.push(mNeueUebung);
					}
				}

				if (mAnlegen.length > 0) {
					await this.InsertUebungen(mAnlegen).then((mNeueStammUebungen) => {
						this.LadeStammUebungen()
							.then((aUebungen) => {
								DexieSvcService.StammUebungsListe = aUebungen;
								return DexieSvcService.StammUebungsListe;
							});
					});
				} else {
					// Standard-Uebungen sind vorhanden.
					const mStammUebungsListe: Array<Uebung> = this.UebungDBtoUebung(mUebungen);
					DexieSvcService.StammUebungsListe = mStammUebungsListe;
					if (aAfterLoadFn) aAfterLoadFn();
					// Standard-Vorlage-Programme laden
					// const mProgrammParaDB: ProgrammParaDB = new ProgrammParaDB();
					// mProgrammParaDB.LadeSession = true;
					// mProgrammParaDB.SessionParaDB = new SessionParaDB();
					// mProgrammParaDB.SessionParaDB.LadeUebungen
					await this.LadeVerfuegbareProgramme()
						.then(async (aProgrammListe) => {
							let mLoadAgain: boolean = false;
							if ((DexieSvcService.NoAutoCreateListe.find((mSuchAutoCreate) => { return (mSuchAutoCreate.noCreateItem === NoAutoCreateItem.GzclpProgram); })  === undefined)
							&&  (aProgrammListe.find((programm) => programm.ProgrammTyp === ProgrammTyp.Gzclp) === undefined)) {
								mLoadAgain = true;
								await this.ProgrammSpeichern(GzclpProgramm.ErzeugeGzclpVorlage(this));
								this.NoAutoCreateItemSpeichern(NoAutoCreateItem.GzclpProgram);
							}
							
							if ((DexieSvcService.NoAutoCreateListe.find((mSuchAutoCreate) => { return (mSuchAutoCreate.noCreateItem === NoAutoCreateItem.HypertrophicSpecificProgram); })  === undefined)
							&& (aProgrammListe.find((programm) => programm.ProgrammTyp === ProgrammTyp.HypertrophicSpecific) === undefined)) {
								mLoadAgain = true;
								await this.ProgrammSpeichern(HypertrophicProgramm.ErzeugeHypertrophicVorlage(this));
								this.NoAutoCreateItemSpeichern(NoAutoCreateItem.HypertrophicSpecificProgram);
							}

							if (mLoadAgain) {
								return await this.LadeVerfuegbareProgramme()
									.then(() => {
										return DexieSvcService.VerfuegbareProgramme;
									});
							} else {
								// if (DexieSvcService.AktuellesProgramm === null) {
								// 	await this.LadeAktuellesProgramm()
								// 		.then(() => {
								// 			return DexieSvcService.VerfuegbareProgramme;
								// 		});
								// }

								// if (    (DexieSvcService.AllowExamples === true) 
								// 	&& (DexieSvcService.NoAutoCreateListe.find((mNoCreate) => mNoCreate.noCreateItem === NoAutoCreateItem.ExamplePrograms) === undefined))
								// {
									// const mExampleProgram: ITrainingsProgramm = DexieSvcService.VerfuegbareProgramme.find(
									// 	(mSuchProgram) => { 
									// 		return (mSuchProgram.ProgrammTyp === ProgrammTyp.Gzclp && mSuchProgram.FkVorlageProgramm === 0);

									// 	});
									
									// if(mExampleProgram)
									// 	this.MakeExample(mExampleProgram);
								// }
								// else
								if (DexieSvcService.HistorySessions.length <= 0)
									this.LadeHistorySessions(null, null);

								return DexieSvcService.VerfuegbareProgramme;
							}
						});
					// this.LadeAktuellesProgramm();
				}
				return DexieSvcService.StammUebungsListe;
			
			});
	}

	public async LadeAktuellesProgramm(aProgrammParaDB?: ProgrammParaDB): Promise<ITrainingsProgramm> {
		const mDialogData = new DialogData();
		mDialogData.height = '100px';
		mDialogData.ShowOk = false;
		mDialogData.textZeilen.push(`Loading current workout!`);
		this.fDialogeService.Loading(mDialogData);
		try {
			DexieSvcService.AktuellesProgramm = null;
			DexieSvcService.CmpAktuellesProgramm = null;
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
					return [[aProgramm.id, SessionStatus.Laeuft], [aProgramm.id, SessionStatus.Pause], [aProgramm.id, SessionStatus.Wartet]];
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
					DexieSvcService.AktuellesProgramm = null;
					if (aProgramme.length > 0) {
						DexieSvcService.AktuellesProgramm = aProgramme[0];
						DexieSvcService.AktuellesProgramm.SessionListe.forEach((aSession) => aSession.Vollstaendig = true);
						DexieSvcService.CmpAktuellesProgramm = DexieSvcService.AktuellesProgramm.Copy(new ProgramCopyPara());
					}
					this.fDialogeService.fDialog.closeAll();		
					return DexieSvcService.AktuellesProgramm;
				});
		} catch (err) {
			this.fDialogeService.fDialog.closeAll();
			return DexieSvcService.AktuellesProgramm;
		}
	}

	public LadeAktuellesProgrammEx() {
		const mProgrammParaDB: ProgrammParaDB = new ProgrammParaDB();
		
		mProgrammParaDB.WhereClause = "ProgrammKategorie";
		mProgrammParaDB.anyOf = () => { return ProgrammKategorie.AktuellesProgramm as any; };

		mProgrammParaDB.OnProgrammAfterLoadFn = (mProgramme: TrainingsProgramm[]) => {
			if (mProgramme !== undefined && mProgramme.length > 0) {
				DexieSvcService.AktuellesProgramm = mProgramme[0];
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
						|| aSession.Kategorie02 === SessionStatus.Laeuft
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

		DexieSvcService.VerfuegbareProgramme.find((p) => {
			if (p.ProgrammTyp === aProgramm.ProgrammTyp) return p;
			return null;
		});

		for (let i = 0; i < aProgramm.SessionListe.length; i++) {
			if (aProgramm.SessionListe[i].Kategorie02 === SessionStatus.Fertig || aProgramm.SessionListe[i].Kategorie02 === SessionStatus.FertigTimeOut)
				mDoneSessions.push(aProgramm.SessionListe[i]);
		}
	}

	public SucheUebungPerName(aName: string): Uebung {
		const mUebung = DexieSvcService.StammUebungsListe.find((u) => u.Name === aName);
		return mUebung === undefined ? null : mUebung;
	}

	private InitProgramm() {
		if (DexieSvcService.ProgrammTable === undefined) {
			DexieSvcService.ProgrammTable = this.table(this.cProgramm);
			DexieSvcService.ProgrammTable.mapToClass(TrainingsProgrammDB);
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
		return await DexieSvcService.SessionTable
			.where("[FK_Programm+Kategorie02]")
			.anyOf([[aProgrammID, SessionStatus.Laeuft], [aProgrammID, SessionStatus.Pause], [aProgrammID, SessionStatus.Wartet]])
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
						mPtrSession.PruefeGewichtsEinheit(DexieSvcService.AppRec.GewichtsEinheit);
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
	// 		.anyOf([[aProgrammID, SessionStatus.Laeuft], [aProgrammID, SessionStatus.Pause], [aProgrammID, SessionStatus.Wartet]])
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
		return await DexieSvcService.SessionTable
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
					mPtrSession.PruefeGewichtsEinheit(DexieSvcService.AppRec.GewichtsEinheit);
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
			mHelpSessionParaDB.anyOf = () => {
				return aProgrammID as any
			};
		}
		else mHelpSessionParaDB = aSessionParaDB;

		return await DexieSvcService.SessionTable
			.where(mHelpSessionParaDB.WhereClause)
			.anyOf(mHelpSessionParaDB.anyOf())
			.offset(mHelpSessionParaDB !== undefined && mHelpSessionParaDB.OffSet !== undefined ? mHelpSessionParaDB.OffSet : 0)
			.limit(mHelpSessionParaDB !== undefined && mHelpSessionParaDB.Limit !== undefined ? mHelpSessionParaDB.Limit : cMaxLimnit)
			.sortBy("ListenIndex")
			.then(async (aSessionListe) => {
				let mResult: Array<Session> = [];
				aSessionListe.map((aSessionDB) => mResult.push(new Session(aSessionDB)));

				mResult.forEach((mPtrSession) => {
					Session.StaticCheckMembers(mPtrSession);
					mPtrSession.PruefeGewichtsEinheit(DexieSvcService.GewichtsEinheit);
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
		DexieSvcService.HistoryWirdGeladen = true;
		DexieSvcService.HistorySessions = [];
		if (aVonDatum === null)
			aVonDatum = new Date('01.01.2020');

		if (aBisDatum === null)
			aBisDatum = new Date('01.01.2099');

		const mProgramNamen: Array<{ ID: number, Name: string }> = [];
		return DexieSvcService.SessionTable
			.where("GestartedWann")
			.between(aVonDatum, aBisDatum, true, true)
			//.and((aSession: Session) => aSession.FK_VorlageProgramm > 0)
			.and((aSession: Session) => aSession.Kategorie02 === SessionStatus.Fertig || aSession.Kategorie02 === SessionStatus.FertigTimeOut)
			.reverse()
			.sortBy("GestartetWann")
			.then(async (aSessionListe) => {
				aSessionListe.map((aSessionDB) => DexieSvcService.HistorySessions.push(new HistorySession(aSessionDB)));

				
				for (let index = 0; index < DexieSvcService.HistorySessions.length; index++) {
					const mPtrHistorySession: HistorySession = DexieSvcService.HistorySessions[index];
					
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
				for (let index = 0; index < DexieSvcService.HistorySessions.length; index++) {
					const mPtrSession: Session = DexieSvcService.HistorySessions[index];
					Session.StaticCheckMembers(mPtrSession);
					mPtrSession.PruefeGewichtsEinheit(DexieSvcService.AppRec.GewichtsEinheit);
					mPtrSession.UebungsListe = [];
					await this.LadeSessionUebungenEx(mPtrSession, mUebungParaDB)
						.then((aUebungsListe) => {
							mPtrSession.UebungsListe = aUebungsListe;
						});
				}// for
				if (this.HistorySessionsAfterLoadFn !== null) {
					this.HistorySessionsAfterLoadFn();
				}

				DexieSvcService.HistoryWirdGeladen = false;
				this.ErstelleDiagrammData(
					cMinDatum, //aVonDatum: Date, 
					cMinDatum, // aBisDatum: Date,
					DexieSvcService.HistorySessions,
					DexieSvcService.DiagrammDatenListe);
				
				return DexieSvcService.HistorySessions;
			}).catch((error) => {
				this.fDialogHistoryService.fDialog.closeAll();
				DexieSvcService.HistoryWirdGeladen = false;
				return DexieSvcService.HistorySessions;
			});
	}

	public async LadeProgrammSessionsEx(aLadePara: SessionParaDB, aProgramm?: ITrainingsProgramm): Promise<Array<Session>> {
		this.InitSession();
		return await DexieSvcService.SessionTable
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
							const mStammUebung = DexieSvcService.StammUebungsListe.find((mGefundeneUebung) => mGefundeneUebung.ID === aLadePara.Data.Uebung.FkUebung);
							if (mStammUebung !== undefined) aLadePara.Data.Uebung.Name = mStammUebung.Name;
						} else {
							// Der Schlüssel zur Stamm-Übung sollte normalerweise gesetzt sein
							const mStammUebung = DexieSvcService.StammUebungsListe.find((mGefundeneUebung) => mGefundeneUebung.Name === aLadePara.Data.Uebung.Name);
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

		return await DexieSvcService.UebungTable
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
		return await DexieSvcService.SatzTable
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
			mSatzLadePara.anyOf = (aUebung: Uebung) => {
				return aUebung.ID;
			};
		} else mSatzLadePara = aSatzLadePara;

		if (mSatzLadePara !== undefined && mSatzLadePara.OnSatzBeforeLoadFn !== undefined) mSatzLadePara.OnSatzBeforeLoadFn(mSatzLadePara);

		return DexieSvcService.SatzTable
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
		DexieSvcService.AktuellesProgramm = mNeu;
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

	public async LadeVerfuegbareProgramme(): Promise<Array<ITrainingsProgramm>> {
		const mProgrammPara: ProgrammParaDB = new ProgrammParaDB();
		mProgrammPara.WhereClause = "ProgrammKategorie"
		mProgrammPara.anyOf = () => {
			return [ProgrammKategorie.Vorlage, ProgrammTyp.Custom];
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
		mProgrammPara.SessionParaDB.UebungParaDB.WhereClause = "SessionID";
		mProgrammPara.SessionParaDB.UebungParaDB.anyOf = (aSession) => {
			return aSession.ID as any;
		};

		return this.LadeProgrammeEx(mProgrammPara).then((aProgramme) => {
			// const mResult: Array<ITrainingsProgramm> = [];
			// for (let index = 0; index < aProgramme.length; index++) {
				// const mPtrProgrammDB = aProgramme[index];
				// const mPtrProgramm: ITrainingsProgramm = DexieSvcService.CreateTrainingsProgramm(mPtrProgrammDB.ProgrammTyp);
				// mPtrProgramm.TrainingsProgrammDB = mPtrProgrammDB;
				// mResult.push(mPtrProgramm);
			// }
			DexieSvcService.VerfuegbareProgramme = aProgramme;
			return aProgramme;
		});
	}


	public async LadeProgrammeEx(aProgrammPara: ProgrammParaDB): Promise<Array<ITrainingsProgramm>> {
		this.InitProgramm();
		return await DexieSvcService.ProgrammTable
			.where(aProgrammPara.WhereClause)
			.anyOf(aProgrammPara.anyOf())
			.and(aProgrammPara.And === undefined ? () => { return 1 === 1 } : (aProgramm) => aProgrammPara.And(aProgramm))
			.limit(aProgrammPara.Limit === undefined ? cMaxLimnit : aProgrammPara.Limit)
			.sortBy(aProgrammPara.SortBy === undefined ? '' : aProgrammPara.SortBy)
			.then(aProgrammPara.Then === undefined ? async (aProgramme: Array<TrainingsProgrammDB>) => {
				const result: Array<ITrainingsProgramm> = []; 
				for (let index = 0; index < aProgramme.length; index++) {
					const mPtrProgramm: ITrainingsProgramm = new TrainingsProgramm(); 
					mPtrProgramm.TrainingsProgrammDB = aProgramme[index];
					result.push(mPtrProgramm); 

					if (aProgrammPara.SessionBeachten !== undefined && aProgrammPara.SessionBeachten === true) {
						const mPtrProgrammDB = aProgramme[index];
						let mSessionParaDB: SessionParaDB;
						
						if (aProgrammPara.SessionParaDB !== undefined) {
							mSessionParaDB = aProgrammPara.SessionParaDB;
						}
						else {
							mSessionParaDB = new SessionParaDB();
							mSessionParaDB.WhereClause = "FK_Programm";
							mSessionParaDB.anyOf = () => {
								return mPtrProgrammDB.id as any;
							};
						}
					
						await this.LadeProgrammSessionsEx(mSessionParaDB, mPtrProgramm)
							.then((aSessionListe: Array<Session>) => {
								mPtrProgramm.SessionListe = aSessionListe;
							});
					}
					else if (aProgrammPara.SessionParaDB !== undefined) await this.LadeProgrammSessionsEx(aProgrammPara.SessionParaDB);
				
				}
				if (aProgrammPara.OnProgrammAfterLoadFn !== undefined) aProgrammPara.OnProgrammAfterLoadFn(aProgramme);

				return result;
			
			} : (aProgramme: Array<ITrainingsProgramm>) => aProgrammPara.Then(aProgramme));
	}

	public async SatzSpeichern(aSatz: Satz): Promise<number> {
		return await DexieSvcService.SatzTable.put(aSatz.SatzDB);
	}

	public async SaetzeSpeichern(aSaetze: Array<Satz>) {
		let mSaetzeDB: Array<SatzDB> = [];
		aSaetze.forEach((mSatz) => {
			mSaetzeDB.push(mSatz.SatzDB);
		});
		return DexieSvcService.SatzTable.bulkPut(mSaetzeDB);
	}

	public async UebungSpeichern(aUebung: Uebung): Promise<Uebung> {
		aUebung.FkAltProgress = aUebung.FkProgress;
		aUebung.AltWeightProgress = aUebung.WeightProgress;
		aUebung.FkOrgProgress = aUebung.FkProgress;
		aUebung.AltProgressGroup = aUebung.ProgressGroup;
		
		let mSatzListe: Array<Satz>;
		if (aUebung.SatzListe !== undefined)
			mSatzListe = aUebung.SatzListe.map(sz => sz);
		
		aUebung.SatzListe = [];
		return await DexieSvcService.UebungTable.put(aUebung.UebungDB)
			.then(async (mUebungID) => {
				if (mSatzListe !== undefined && mSatzListe.length > 0) {
					for (let index = 0; index < mSatzListe.length; index++) {
						const mSatz = mSatzListe[index];
						mSatz.UebungID = mUebungID;
						mSatz.SessionID = aUebung.SessionID;
						const mGewichtDiff = cloneDeep(mSatz.GewichtDiff);
						mSatz.GewichtDiff = [];
						mSatz.GewichtDiff = mGewichtDiff;
						// mSatz.Datum = mSatz.Status === SatzStatus.Fertig ? aUebung.Datum : undefined;
						mSatz.Datum = aUebung.Datum;
						await this.SatzSpeichern(mSatz)
							.then((mSatzID) => {
								aUebung.SatzListe.push(mSatz);
							});
					}
					return aUebung;
					// this.SaetzeSpeichern(mSatzListe);
				}
				else return aUebung;
			})
	}

	public async SessionSpeichern(aSession: Session, aSessionExtraParaDB?: SessionParaDB): Promise<Session> {
		if (aSession.Datum === undefined || aSession.Datum === null)
			aSession.Datum = new Date;
		
		return await DexieSvcService.SessionTable.put(aSession.SessionDB)
			.then(async(mID) => {
				const mUebungsListe: Array<Uebung> = [];
				aSession.ID = mID;
				for (let index = 0; index < aSession.UebungsListe.length; index++) {
					const mUebungPtr: Uebung = aSession.UebungsListe[index];
					
					mUebungPtr.SessionID = aSession.ID;
					mUebungPtr.FK_Programm = aSession.FK_Programm;
					if ((mUebungPtr.Datum === undefined) || (mUebungPtr.Datum === null))
						mUebungPtr.Datum = aSession.Datum;
					
					await this.UebungSpeichern(mUebungPtr)
						.then((mSavedUebung) => {
							mUebungsListe.push(mSavedUebung);
						});
				};
				
			aSession.UebungsListe = mUebungsListe;
			return aSession;
		});
	}

	public async ProgrammSpeichern(aTrainingsProgramm: ITrainingsProgramm, aProgrammExtraParaDB?: ProgrammParaDB): Promise<ITrainingsProgramm> {
		return await DexieSvcService.ProgrammTable.put(aTrainingsProgramm.TrainingsProgrammDB)
			.then(async (mID) => {
				aTrainingsProgramm.id = mID;
				const mSessionListe: Array<Session> = aTrainingsProgramm.SessionListe as Array<Session>;
			
				for (let index = 0; index < mSessionListe.length; index++) {
					const mSession:Session = mSessionListe[index];
					mSession.FK_Programm = mID;
					await this.SessionSpeichern(mSession).then(
						(mSavedSession) => {
							if(aProgrammExtraParaDB !== undefined && aProgrammExtraParaDB.OnAfterSaveFn !== undefined )
								aProgrammExtraParaDB.OnAfterSaveFn(aTrainingsProgramm);
						});
				}

				 return aTrainingsProgramm;
				
				//  aTrainingsProgramm.SessionListe = [];

				// this.ProgrammTable.where({ id: mid })
				// 	.toArray()
				// 	.then((mTrainingsProgramm) => {
				// 		const aTrainingsProgramm = mTrainingsProgramm[0];
				// 	});
			})
			.catch((err) => {
				const mDialogData = new DialogData();

				if (err.message.includes('Name+ProgrammKategorie')) 
					mDialogData.textZeilen.push(`There is already a program with name "${aTrainingsProgramm.Name.trim()}"!`);
				else
					mDialogData.textZeilen.push(err.message);
				
				this.fDialogeService.Hinweis(mDialogData);
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
	private async InitSprache(): Promise<Array<Sprache>> {
		if (DexieSvcService.SpracheTable === undefined) {
			DexieSvcService.SpracheTable = this.table(this.cSprache);
			DexieSvcService.SpracheTable.mapToClass(Sprache);
		}

		return await this.LadeAlleSprachen().then(async (mSprachen) => {
			let mSprache: Sprache;
			// Deutsch vorhanden?
			if (mSprachen.find((aSprache) => aSprache.Name === cDeutsch) === undefined) {
				// Nicht vorhanden
				mSprache = Sprache.StaticNeueSprache(
					cDeutsch,
					cDeutschKuezel,
					cDeutschDatumFormat,
					cDeutschZeitFormat
				);
				await this.InsertSprache(mSprache)
					.then((aSprache) => { return aSprache });
				mSprachen.push(mSprache);
			}
				
				
			// Englisch vorhanden?
			if (mSprachen.find((aSprache) => aSprache.Name === cEnglish) === undefined) {
				// Nicht vorhanden
				mSprache = Sprache.StaticNeueSprache(
					cEnglish,
					cEnglishKuerzel,
					cEnglishDatumFormat,
					cEnglishZeitFormat
				);

				await this.InsertSprache(mSprache)
					.then((aSprache) => { return aSprache });
				mSprachen.push(mSprache);
			}

			return mSprachen;
		});
	}

	private LadeSprache() {
		this.LadeAlleSprachen().then(async (mSprachen) => {
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


	async InsertSprache(aSprache: Sprache): Promise<Sprache> {
		return await DexieSvcService.SpracheTable.put(aSprache).then(
			(aID) => {
				aSprache.id = aID;
				return aSprache;
			});
	}

	public async LadeAlleSprachen(): Promise<Array<Sprache>> {
		return await DexieSvcService.SpracheTable
			.toArray()
			.then(async (aSprachen: Array<Sprache>) => {
				return aSprachen;
			});
	}

	public async LadeSpracheFromID(aID: number): Promise<Sprache> {
		return await DexieSvcService.SpracheTable
			.where({ id: aID })
			.first(async (aSprache: Sprache) => {
				return aSprache;
			});
	}
	//#endregion

	//#region  AppaData
	private async InitAppData() {
		if (DexieSvcService.AppDataTable === undefined) {
			DexieSvcService.AppDataTable = this.table(this.cAppData);
			DexieSvcService.AppDataTable.mapToClass(AppData);
		}

		await this.LadeAppData().then((aAppRec) => {
			DexieSvcService.AppRec = aAppRec;
			if (DexieSvcService.AppRec.isLightTheme === undefined)
				this.DoTheme(false);
			else
				this.DoTheme(DexieSvcService.AppRec.isLightTheme === true);
		});

	}

	private async SetAppData(aAppData: AppData): Promise<AppData> {
		return DexieSvcService.AppDataTable.put(aAppData)
			.then((aID) => {
				aAppData.id = aID;
				DexieSvcService.AppRec = aAppData;
				return aAppData;
			})
			.catch((error) => {
				console.error(error);
				return null;
			});
	}

	public async LadeAppData(): Promise<AppData> {
		return await DexieSvcService.AppDataTable
			.limit(1)
			.first(async (aAppRec) => {
				const mEnglisch: Sprache = await this.InitSprache().then((mSprachen) => {
					const mFindEnglisch: Sprache = mSprachen.find((aSprache) => {
						return (aSprache.Name === cEnglish);
					});
					return mFindEnglisch;
				});

				if (aAppRec) {
					DexieSvcService.AppRec = aAppRec;
					DexieSvcService.GewichtsEinheitText = aAppRec.GewichtsEinheitText;
					DexieSvcService.GewichtsEinheit = aAppRec.GewichtsEinheit;

					if ((DexieSvcService.AppRec.SprachID === undefined) || (DexieSvcService.AppRec.SprachID <= 0)) {
						DexieSvcService.AppRec.SprachID = mEnglisch.id;
						return await this.SetAppData(DexieSvcService.AppRec).then((aAppData) => { return aAppData; });
					} else return DexieSvcService.AppRec;
				} else {
					DexieSvcService.AppRec = new AppData();
					DexieSvcService.GewichtsEinheitText = 'KG';
					DexieSvcService.GewichtsEinheit = GewichtsEinheit.KG;
					DexieSvcService.AppRec.SprachID = mEnglisch.id;
					return await this.SetAppData(DexieSvcService.AppRec).then((aAppData) => { return aAppData; });
				}
			});
	}

	public async AppDataSpeichern(aAppData: AppData) {
		DexieSvcService.AppRec = aAppData;
		DexieSvcService.GewichtsEinheit = aAppData.GewichtsEinheit;
		await DexieSvcService.AppDataTable.put(aAppData); //.then( () =>  this.LadeAppData().then ((aAppRec) => this.AppRec = aAppRec ));
		
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
				mProgress = DexieSvcService.ProgressListe.find((p) => p.ID === mQuellUebung.FkProgress);
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

	public async CheckUebungSaetze(aUebung: Uebung):Promise<Array<Satz>> {
		if (aUebung.SatzListe.length === 0) {
			this.LadeUebungsSaetze(aUebung.ID)
				.then((mSaetze) => {
					aUebung.SatzListe = mSaetze;
					return mSaetze;
				});
		}
		return aUebung.SatzListe;
	}

	OpenWorkoutForm(aProgramm: ITrainingsProgramm ) {
		this.router.navigate(["/workoutform"], { state: { programm: aProgramm } });
	}


	public async EvalAktuelleSessionListe(aSession: Session, aPara?: any): Promise<void> {
		if (DexieSvcService.AktuellesProgramm && DexieSvcService.AktuellesProgramm.SessionListe) {
			const mSess: ISession = DexieSvcService.AktuellesProgramm.SessionListe.find((s) => s.ID === aSession.ID);
			if (aSession.Kategorie02 === SessionStatus.Loeschen) {
				// Die Session kann schon aus der Session-Liste des aktuellen Programms genommen werden.
				if (mSess !== undefined) {
					const mIndex = DexieSvcService.AktuellesProgramm.SessionListe.indexOf(aSession);
					if (mIndex > -1) DexieSvcService.AktuellesProgramm.SessionListe.splice(mIndex, 1);
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
			mNeueSession.init([]); // [] -> Alles zurücksetzen
			this.InitSessionSaetze(aSession, mNeueSession);
			mNeueSession.FK_Programm = aSession.FK_Programm;
			mNeueSession.FK_VorlageProgramm = aSession.FK_VorlageProgramm;
			mNeueSession.Expanded = false;
			
			// export enum SessionStatus {
			// 	NurLesen, 
			// 	Bearbeitbar,
			// 	Wartet,
			// 	Pause,
			// 	Laeuft,
			// 	Fertig,
			// 	FertigTimeOut,
			// 	Loeschen
			// }
			
			const mIndex = DexieSvcService.AktuellesProgramm.SessionListe.findIndex((s) => s.ID === aSession.ID);
			if (mIndex > -1)
				DexieSvcService.AktuellesProgramm.SessionListe.splice(mIndex, 1);
			
			const mAkuelleSessionListe: Array<ISession> = DexieSvcService.AktuellesProgramm.SessionListe.filter((s) =>
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
				DexieSvcService.SessionTable.delete(aSession.ID);
			
			if ((aPara !== undefined) && (aPara.ExtraFn !== undefined))
				aPara.ExtraFn(mNeueSession);
		}//if
	}


	public async MakeExample(aProgram: ITrainingsProgramm) {
		if (aProgram === undefined || aProgram.SessionListe.length <= 0)
			return;

		const mProgramCopyPara: ProgramCopyPara = new ProgramCopyPara();
		mProgramCopyPara.CopyProgramID = false;
		mProgramCopyPara.CopySessionID = false;
		mProgramCopyPara.CopyUebungID = false;
		mProgramCopyPara.CopySatzID = false;
		mProgramCopyPara.Komplett = false;
		const mExampleProgram: ITrainingsProgramm = aProgram.Copy(mProgramCopyPara);
		mExampleProgram.FkVorlageProgramm = aProgram.id;
		mExampleProgram.Name = "Example";
		mExampleProgram.ProgrammKategorie = ProgrammKategorie.Fertig;

		this.ProgrammSpeichern(mExampleProgram).then(
			(mProgram) => {
				//#region Alle Sessions löschen 
				DexieSvcService.SessionTable
					.toArray(async (aSessionListe) => {
						aSessionListe.forEach((aSession: Session) => {
							if (aSession.FK_VorlageProgramm > 0)
								DexieSvcService.SessionTable.delete(aSession.ID);
						});
				//#endregion
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
						mSession.init([]); // true-> SatzWdh auf 0 setzen
						mSession.FK_Programm = mProgram.id;
						mSession.FK_VorlageProgramm = mProgram.FkVorlageProgramm;
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

				this.NoAutoCreateItemSpeichern(NoAutoCreateItem.ExamplePrograms);

				if (DexieSvcService.HistorySessions.length <= 0)
					this.LadeHistorySessions(null, null);
			});
		});

	}
}
//   const worker = new Worker(new URL('./dexie-svc.worker', import.meta.url));
//   worker.onmessage = ({ data }) => {
//     console.log(`page got message: ${data}`);
//   };
//   worker.postMessage('hello');
// } else {
//   // Web Workers are not supported in this environment.
//   // You should add a fallback so that your program still executes correctly.
// 