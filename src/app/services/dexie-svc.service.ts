import { WdhVorgabeStatus } from './../../Business/Uebung/Uebung';
import { InitialWeight } from './../../Business/Uebung/InitialWeight';
import { Progress, ProgressSet, ProgressTyp, WeightCalculation, WeightProgressTime, ProgressPara } from './../../Business/Progress/Progress';
import { Hantelscheibe } from 'src/Business/Hantelscheibe/Hantelscheibe';
import { Hantel, HantelTyp } from './../../Business/Hantel/Hantel';
import { Equipment, EquipmentOrigin, EquipmentTyp } from './../../Business/Equipment/Equipment';
import { SessionDB, SessionStatus } from './../../Business/SessionDB';
import { Session, ISession } from 'src/Business/Session/Session';
import { ITrainingsProgramm, TrainingsProgramm, ProgrammTyp, ProgrammKategorie } from 'src/Business/TrainingsProgramm/TrainingsProgramm';
import { DialogeService } from './dialoge.service';
import { ISatz, Satz, SatzStatus, GewichtDiff } from './../../Business/Satz/Satz';
import { GzclpProgramm } from 'src/Business/TrainingsProgramm/Gzclp';
import { AppData, IAppData } from './../../Business/Coach/Coach';
import { Collection, Dexie, PromiseExtended, WhereClause } from 'dexie';
import { Injectable, NgModule, Optional, SkipSelf } from '@angular/core';
import { UebungsTyp, Uebung, StandardUebungListe , UebungsKategorie02, StandardUebung, ArbeitsSaetzeStatus } from "../../Business/Uebung/Uebung";
import { DialogData } from '../dialoge/hinweis/hinweis.component';
import { MuscleGroup, MuscleGroupKategorie01, MuscleGroupKategorie02, StandardMuscleGroup } from '../../Business/MuscleGroup/MuscleGroup';
var cloneDeep = require('lodash.clonedeep');

export const MinDatum = new Date(-8640000000000000);
export const MaxDatum = new Date(8640000000000000);

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


export interface ThenFn {
	(aData: any): void | any;
}

export interface onFormShowFn {
	(aData: any): void | any;
}

export interface onFormCloseFn {
	(aData: any): void | any;
}

export class ParaDB {
	Data?: any;
	WhereClause?: {};
	And?: AndFn = () => { return true };
	Then?: ThenFn;
	// Or?: OrFn;
	Limit?: number = 10000000;
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

export class UebungParaDB extends ParaDB {
}

export class SessionParaDB extends ParaDB {
	UebungSpeicherParaDB?: UebungParaDB;
}

export class ProgrammParaDB extends ParaDB {
	SessionParaDB?: SessionParaDB;
}


@Injectable({
	providedIn: "root",
})
@NgModule({
	providers: [DexieSvcService],
})
export class DexieSvcService extends Dexie {
	readonly cUebung: string = "Uebung";
	readonly cSatz: string = "Satz";
	readonly cProgramm: string = "Programm";
	readonly cAppData: string = "AppData";
	readonly cSession: string = "SessionDB";
	readonly cMuskelGruppe: string = "MuskelGruppe";
	readonly cEquipment: string = "Equipment";
	readonly cHantel: string = "Hantel";
	readonly cHantelscheibe: string = "Hantelscheibe";
	readonly cProgress: string = "Progress";

	AktuellerProgrammTyp: ProgrammTyp;
	AktuellesProgramm: ITrainingsProgramm;
	VorlageProgramme: Array<TrainingsProgramm> = [];
	AppRec: IAppData;
	AppDataTable: Dexie.Table<AppData, number>;
	private UebungTable: Dexie.Table<Uebung, number>;
	private SatzTable: Dexie.Table<Satz, number>;
	private ProgrammTable: Dexie.Table<ITrainingsProgramm, number>;
	private SessionTable: Dexie.Table<Session, number>;
	private MuskelGruppeTable: Dexie.Table<MuscleGroup, number>;
	private HantelTable: Dexie.Table<Hantel, number>;
	private HantelscheibenTable: Dexie.Table<Hantelscheibe, number>;
	private EquipmentTable: Dexie.Table<Equipment, number>;
	private ProgressTable: Dexie.Table<Progress, number>;
	public Programme: Array<ITrainingsProgramm> = [];
	public StammUebungsListe: Array<Uebung> = [];
	public MuskelGruppenListe: Array<MuscleGroup> = [];
	public EquipmentListe: Array<Equipment> = [];
	public LangHantelListe: Array<Hantel> = [];
	public HantelscheibenListe: Array<Hantelscheibe> = [];
	public ProgressListe: Array<Progress> = [];

	private ProgramLadeStandardPara: ProgrammParaDB;

	public UpComingSessionList(): Array<Session> {
		if ((this.AktuellesProgramm) && (this.AktuellesProgramm.SessionListe)) {
			this.AktuellesProgramm.SessionListe =
				this.AktuellesProgramm.SessionListe.filter(
					(s) => (s.Kategorie02 !== SessionStatus.Fertig && s.Kategorie02 !== SessionStatus.FertigTimeOut)
				);
				return this.SortSessionByListenIndex(this.AktuellesProgramm.SessionListe as Array<Session>);
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
		aSession.UebungsListe.forEach((mLoeschUebung) => this.DeleteUebung(mLoeschUebung) );
		this.SessionTable.delete(aSession.ID);
	}

	public DeleteUebung(aUebung: Uebung) {
		aUebung.SatzListe.forEach((mLoeschSatz) => {
			if (mLoeschSatz.ID === undefined)
				this.DeleteSatz(mLoeschSatz);
		});

		this.UebungTable.delete(aUebung.ID);
	}

	public DeleteSatz(aSatz: Satz) {
		this.SatzTable.delete(aSatz.ID);
	}

	public SetAktuellesProgramm(aSelectedProgram: TrainingsProgramm, aInitialWeightList?: Array<InitialWeight>): Promise<void> {
		return this.FindAktuellesProgramm().then( (p) => {
			for (let index = 0; index < p.length; index++) {
				const mPtrProgramm = p[index];
				mPtrProgramm.ProgrammKategorie = ProgrammKategorie.Aktiv;
				this.ProgrammSpeichern(mPtrProgramm);
			}


			const mProgramm = aSelectedProgram.Copy();
			mProgramm.id = undefined;
			mProgramm.FkVorlageProgramm = aSelectedProgram.id;
			mProgramm.ProgrammKategorie = ProgrammKategorie.AktuellesProgramm;

			if (mProgramm.SessionListe) {
				mProgramm.SessionListe = [];
				for (let index = 0; index < aSelectedProgram.SessionListe.length; index++) {
					const mPrtSession = aSelectedProgram.SessionListe[index];
					const mNeueSession = mPrtSession.Copy(true);
					mNeueSession.ListenIndex = index;
					mNeueSession.FK_VorlageProgramm = aSelectedProgram.id;

					if (aInitialWeightList !== undefined) {
						aInitialWeightList.forEach((iw) => {
							const mUebung = mNeueSession.UebungsListe.find((u) => u.FkUebung === iw.UebungID);
							if (mUebung !== undefined)
								mUebung.ArbeitsSatzListe.forEach((sz) => {
									sz.GewichtVorgabe = iw.Weight;
									sz.GewichtAusgefuehrt = iw.Weight;
									sz.WdhAusgefuehrt = sz.WdhBisVorgabe;
								});
						});
					}
					mProgramm.SessionListe.push(mNeueSession);
				}

				return this.ProgrammSpeichern(mProgramm);
			}//if
			return null;
		});
	}

	public get HantenscheibeListeSortedByDiameterAndWeight(): Array<Hantelscheibe> {
		let mResult: Array<Hantelscheibe> = this.HantelscheibenListe.map((mScheibe) => mScheibe);

		mResult.sort((hs1: Hantelscheibe, hs2: Hantelscheibe) => {
			const d1: number = Number(hs1.Durchmesser);
			const g1: number = Number(hs1.Gewicht);
			const d2: number = Number(hs2.Durchmesser);
			const g2: number = Number(hs2.Gewicht);

			if (d1 > d2) return 1;

			if (d1 < d2) return -1;

			if (g1 > g2) return 1;

			if (g1 < g2) return -1;

			return 0;
		});
		return mResult;
	}

	public LanghantelListeSortedByName(aIgnorGeloeschte: Boolean = true): Array<Hantel> {
		let mResult: Array<Hantel> = this.LangHantelListe.map((mHantel) => mHantel);

		if (aIgnorGeloeschte) {
			mResult = mResult.filter((h) => h.HantelStatus !== ErstellStatus.Geloescht);
		}

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

	public get EquipmentTypListe(): Array<string> {
		const mResult: Array<string> = [];
		for (const mEquipmentTyp in EquipmentTyp) {
			if (mEquipmentTyp === EquipmentTyp.Unbestimmt) continue;

			mResult.push(mEquipmentTyp);
		}

		return mResult;
	}

	public get EquipmentTypListeSorted(): Array<string> {
		const mResult: Array<string> = this.EquipmentTypListe.map((mEquipmentTyp) => mEquipmentTyp);
		mResult.sort((u1, u2) => {
			if (u1 > u2) {
				return 1;
			}

			if (u1 < u2) {
				return -1;
			}

			return 0;
		});

		return mResult;
	}

	//public ProgrammListeObserver: Observable<TrainingsProgramm[]>;
	//public ProgrammListe: Array<TrainingsProgramm> = [];

	constructor(private fDialogeService: DialogeService, @Optional() @SkipSelf() parentModule?: DexieSvcService) {
		super("ConceptCoach");
		if (parentModule) {
			throw new Error("DexieSvcService is already loaded. Import it in the AppModule only");
		}

		this.ProgramLadeStandardPara = new ProgrammParaDB();
		this.ProgramLadeStandardPara  = {
			fProgrammKategorie: ProgrammKategorie.Vorlage,
			fProgramme: this.VorlageProgramme,

			WhereClause: {   ProgrammKategorie: ProgrammKategorie.Vorlage.toString() },

			OnProgrammBeforeLoadFn: (aData) => {
				this.VorlageProgramme = [];
			},

			OnProgrammNoRecordFn: undefined, //() => { },

			OnProgrammAfterLoadFn: (aProgramme) => {
				this.VorlageProgramme = aProgramme;
				const mProgramme: Array<TrainingsProgramm> = aProgramme as Array<TrainingsProgramm>;
				const mAnlegen: Array<ProgrammTyp.Gzclp> = new Array<ProgrammTyp.Gzclp>();
				const mProg: TrainingsProgramm = mProgramme.find((p) => p.ProgrammTyp === ProgrammTyp.Gzclp);

				if (mProg === undefined) mAnlegen.push(ProgrammTyp.Gzclp);
				else {
					if (mProgramme.find((p) => p.ProgrammTyp === ProgrammTyp.Gzclp) === undefined) {
						// Standard-Programm gefunden
						mProgramme.push(mProg);
					}
				}

				for (let index = 0; index < mAnlegen.length; index++) this.ErzeugeVorlageProgramm(mAnlegen[index]);
			}, //OnProgrammNoRecorderLoadFn
		} as ParaDB;

	    // Dexie.delete("ConceptCoach");

		this.version(18).stores({
			AppData: "++id",
			Uebung: "++ID,Name,Typ,Kategorie02,FkMuskel01,FkMuskel02,FkMuskel03,FkMuskel04,FkMuskel05,SessionID,FkUebung,FkProgress,[FK_Programm+FkUebung+FkProgress+ProgressGroup+ArbeitsSaetzeStatus]",
			Programm: "++id,Name,FkVorlageProgramm,ProgrammKategorie,[FkVorlageProgramm+ProgrammKategorie]",
			SessionDB: "++ID,Name,Datum,ProgrammKategorie,FK_Programm,FK_VorlageProgramm,Kategorie02,[FK_VorlageProgramm+Kategorie02],[FK_Programm+Kategorie02]",
			Satz: "++ID,UebungID",
			MuskelGruppe: "++ID,Name,MuscleGroupKategorie01",
			Equipment: "++ID,Name",
			Hantel: "++ID,Typ,Name",
			Hantelscheibe: "++ID,&[Durchmesser+Gewicht]",
			Progress: "++ID,&Name",
		});

		this.InitAll();
		//  this.HantelTable.clear();
		this.PruefeStandardProgress();
		this.PruefeStandardLanghanteln();
		this.PruefeStandardEquipment();
		this.PruefeStandardMuskelGruppen();
		// this.LadeStammUebungen();
	}

	get UebungListeSortedByName(): Array<Uebung> {
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
		const mResult: Array<MuscleGroup> = this.MuskelGruppenListe.map((mMuskelgruppe) => mMuskelgruppe);

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

	get EquipmentListSortedByDisplayName(): Array<Equipment> {
		const mResult: Array<Equipment> = this.EquipmentListe.map((mEquipment) => mEquipment);
		mResult.sort((u1, u2) => {
			if (u1.DisplayName > u2.DisplayName) {
				return 1;
			}

			if (u1.DisplayName < u2.DisplayName) {
				return -1;
			}

			return 0;
		});

		return mResult;
	}

		private InitAll() {
		this.InitAppData();
		this.InitProgress();
		this.InitHantel();
		this.InitHantelscheibe();
		this.InitEquipment();
		this.InitUebung();
		this.InitProgramm();
		this.InitSession();
		this.InitMuskelGruppe();
		this.InitSatz();
	}

	private InitProgress() {
		this.ProgressTable = this.table(this.cProgress);
		this.ProgressTable.mapToClass(Progress);
	}

	private InitHantel() {
		this.HantelTable = this.table(this.cHantel);
		this.HantelTable.mapToClass(Hantel);
	}

	private InitHantelscheibe() {
		this.HantelscheibenTable = this.table(this.cHantelscheibe);
		this.HantelscheibenTable.mapToClass(Hantelscheibe);
	}

	private InitMuskelGruppe() {
		this.MuskelGruppeTable = this.table(this.cMuskelGruppe);
		this.MuskelGruppeTable.mapToClass(MuscleGroup);
	}

	private InitEquipment() {
		this.EquipmentTable = this.table(this.cEquipment);
		this.EquipmentTable.mapToClass(Equipment);
	}

	private InitSession() {
		this.SessionTable = this.table(this.cSession);
		this.SessionTable.mapToClass(Session);
	}

	private InitUebung() {
		this.UebungTable = this.table(this.cUebung);
		this.UebungTable.mapToClass(Uebung);
	}

	private InitSatz() {
		this.SatzTable = this.table(this.cSatz);
		this.SatzTable.mapToClass(Satz);
	}

	private NeueUebung(aName: string, aKategorie02: UebungsKategorie02, aTyp: UebungsTyp): Uebung {
		const mGzclpKategorieen01 = Uebung.ErzeugeGzclpKategorieen01();
		const mKategorieen01 = [].concat(mGzclpKategorieen01);
		const mProgress: Progress = this.ProgressListe.find((p) => p.Name === Progress.cStandardProgress);
		if(mProgress === undefined)
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

	public HantelSpeichern(aHantel: Hantel) {
		return this.HantelTable.put(aHantel);
	}

	public InsertHanteln(aHantelListe: Array<Hantel>): PromiseExtended {
		return this.HantelTable.bulkPut(aHantelListe);
	}

	public InsertUebungen(aUebungsListe: Array<Uebung>): PromiseExtended {
		return this.UebungTable.bulkPut(aUebungsListe);
	}

	public DeletetUebung(aUebungID : number): PromiseExtended {
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

	public DeleteProgress(aProgressID: number):PromiseExtended {
		return this.ProgressTable.delete(aProgressID);
	}

	public ProgressListeSortedByName(): Array<Progress> {
		let mResult: Array<Progress> = this.ProgressListe.map((mProgress) => mProgress);

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

	public DeleteHantelscheibe(aHantelscheibeID: number) {
		return this.HantelscheibenTable.delete(aHantelscheibeID);
	}

	public LadeHantelscheiben(aAfterLoadFn?: AfterLoadFn) {
		this.table(this.cHantelscheibe)
			.toArray()
			.then((mHantelscheibenListe) => {
				this.HantelscheibenListe = mHantelscheibenListe;
				if (aAfterLoadFn !== undefined) aAfterLoadFn(mHantelscheibenListe);
			});
	}

	public LadeMuskelGruppen(aAfterLoadFn?: AfterLoadFn) {
		this.MuskelGruppenListe = [];
		this.table(this.cMuskelGruppe)
			.toArray()
			.then((mMuskelgruppenListe) => {
				this.MuskelGruppenListe = mMuskelgruppenListe;

				if (aAfterLoadFn !== undefined) aAfterLoadFn();
			});
	}

	public MuskelListeSortedByName(aIgnorGeloeschte: Boolean = true): Array<MuscleGroup> {
		let mResult: Array<MuscleGroup> = this.MuskelGruppenListe.map((mMuskel) => mMuskel);

		if (aIgnorGeloeschte) {
			mResult = mResult.filter((h) => h.Status !== ErstellStatus.Geloescht);
		}

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

	public LadeLanghanteln(aAfterLoadFn?: AfterLoadFn): PromiseExtended<void> {
		this.LangHantelListe = [];
		return this.table(this.cHantel)
			.where({ Typ: HantelTyp.Barbell })
			.toArray()
			.then((mHantelListe) => {
				this.LangHantelListe = mHantelListe;

				if (aAfterLoadFn !== undefined) aAfterLoadFn();
			});
	}

	private PruefeStandardLanghanteln() {
		const mAnlegen: Array<Hantel> = new Array<Hantel>();
		this.table(this.cHantel)
			.filter((mHantel: Hantel) => mHantel.Typ === HantelTyp.Barbell && (mHantel.Durchmesser === 50 || mHantel.Durchmesser === 30 || mHantel.Durchmesser === 25))
			.toArray()
			.then((mHantelListe) => {
				const mDurchmesser: number[] = [50, 30, 25];
				for (const mTyp in HantelTyp) {
					if (mTyp === HantelTyp.Dumbbel) continue;

					for (let index = 0; index < mDurchmesser.length; index++) {
						let mHantel = mHantelListe.find((h: Hantel) => h.Typ === mTyp && h.Durchmesser === mDurchmesser[index]);
						if (mHantel === undefined) {
							const mNeueHantel = Hantel.StaticNeueHantel(mTyp + " - " + mDurchmesser[index], HantelTyp[mTyp], mDurchmesser[index], ErstellStatus.AutomatischErstellt);

							mAnlegen.push(mNeueHantel);
						}
					}
				}

				if (mAnlegen.length > 0) this.InsertHanteln(mAnlegen).then(() => this.PruefeStandardLanghanteln());
				else this.LadeLanghanteln();
			});
	}

	private async PruefeStandardProgress() {
		await this.ProgressTable.orderBy("Name")
			.toArray()
			.then((mProgress) => {
				if (mProgress === undefined || mProgress.length === 0) {
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
				}
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

	public PruefeStandardEquipment() {
		const mAnlegen: Array<Equipment> = new Array<Equipment>();
		this.table(this.cEquipment)
			.filter((mEquipment: Equipment) => mEquipment.EquipmentOrigin === EquipmentOrigin.Standard)
			.toArray()
			.then((mEquipmentListe) => {
				for (const mEquipmentTyp in EquipmentTyp) {
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

	public async LadeStammUebungen(aAfterLoadFn?: AfterLoadFn) {
		this.StammUebungsListe = [];
		const mAnlegen: Array<Uebung> = new Array<Uebung>();
		await this.table(this.cUebung)
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
					this.StammUebungsListe = mUebungen;
					if (aAfterLoadFn) aAfterLoadFn();
					// Standard-Vorlage-Programme laden
					this.LadeProgramme(this.ProgramLadeStandardPara);
					// this.LadeAktuellesProgramm();
				}
			});
	}

	public LadeAktuellesProgramm() {
		const mProgrammParaDB: ProgrammParaDB = new ProgrammParaDB();
		
		mProgrammParaDB.WhereClause = {
			ProgrammKategorie: ProgrammKategorie.AktuellesProgramm
		} // mProgrammExtraParaDB.WhereClause

		mProgrammParaDB.OnProgrammAfterLoadFn = (mProgramme: TrainingsProgramm[]) => {
			if (mProgramme !== undefined && mProgramme.length > 0) {
				this.AktuellesProgramm = mProgramme[0];
			}
		}

		mProgrammParaDB.Then = async(aProgramme) => {
			for (let index = 0; index < aProgramme.length; index++) {
				const mPtrProgramm: TrainingsProgramm = aProgramme[index];
				const mSessionPara: SessionParaDB = new SessionParaDB();
				mSessionPara.WhereClause = { FK_Programm: mPtrProgramm.id };
				mSessionPara.OnSessionAfterLoadFn = (aSessionListe: Array<Session>) => {
					const mResult: Array<Session> = [];
					aSessionListe.forEach((ss) => {
						if (ss.Kategorie02 === SessionStatus.Wartet
							|| ss.Kategorie02 === SessionStatus.Laueft
							|| ss.Kategorie02 === SessionStatus.Pause)
							mResult.push(ss);
					});
					return mResult;
				};

				await this.LadeProgrammSessions(mSessionPara)
					.then((aSessionListe: Array<Session>) => mPtrProgramm.SessionListe = aSessionListe);
			}		

			if (mProgrammParaDB.OnProgrammAfterLoadFn !== undefined) mProgrammParaDB.OnProgrammAfterLoadFn(aProgramme);

			return aProgramme;
		}

		return this.LadeProgramme(mProgrammParaDB);
	} // Aktuelles Programm laden

	public PrepAkuellesProgramm(aProgramm: ITrainingsProgramm) {
		let mNeueSessions: Array<SessionDB> = [];
		let mUndoneSessions: Array<SessionDB> = [];
		let mDoneSessions: Array<SessionDB> = [];

		const mVorlageProgramm = this.VorlageProgramme.find((p) => {
			if (p.ProgrammTyp === aProgramm.ProgrammTyp) return p;
			return null;
		});

		for (let i = 0; i < aProgramm.SessionListe.length; i++) {
			if (aProgramm.SessionListe[i].Kategorie02 === SessionStatus.Fertig || aProgramm.SessionListe[i].Kategorie02 === SessionStatus.FertigTimeOut)
				mDoneSessions.push(aProgramm.SessionListe[i]);
		}
	}

	public getBodyWeight(): number {
		return 105;
	}

	public SucheUebungPerName(aName: string): Uebung {
		const mUebung = this.StammUebungsListe.find((u) => u.Name === aName);
		return mUebung === undefined ? null : mUebung;
	}

	private InitProgramm() {
		this.ProgrammTable = this.table(this.cProgramm);
		this.ProgrammTable.mapToClass(TrainingsProgramm);
	}

	public SortSessionByListenIndex(aSessionListe: Array<Session>) {
		return aSessionListe.sort((s1, s2) => {
			if (s1.ListenIndex > s2.ListenIndex) return 1;

			if (s1.ListenIndex < s2.ListenIndex) return -1;

			return 0;
		});
	}

	public async LadeProgrammSessions(aLadePara: SessionParaDB): Promise<Array<Session>> {
		// SessionDB: "++ID,Name,Datum,ProgrammKategorie,FK_Programm,FK_VorlageProgramm,Kategorie02,[FK_VorlageProgramm+Kategorie02]",
		// return this.transaction("rw", this.SessionTable, this.UebungTable, this.SatzTable, async () => {
			return await this.SessionTable
				.where(aLadePara === undefined || aLadePara.WhereClause === undefined ? { FK_Programm: 0 } : aLadePara.WhereClause)
				.and((aLadePara === undefined || aLadePara.And === undefined ? () => { return 1 === 1 } : (session: Session) => aLadePara.And(session)))
				// .or((aLadePara === undefined || aLadePara.Or === undefined ? (s: any) => { return null } : (s: any) => aLadePara.Or(s)))
				.limit(aLadePara === undefined || aLadePara.Limit === undefined ? Number.MAX_SAFE_INTEGER : aLadePara.Limit)
				.sortBy(aLadePara === undefined || aLadePara.SortBy === undefined ? '' : aLadePara.SortBy)
				.then( async (aSessions: Array<Session>) => {
					const mLadePara: ParaDB = new ParaDB();
					for (let index = 0; index < aSessions.length; index++) {
						const mPtrSession = aSessions[index];
						mLadePara.WhereClause = { SessionID: mPtrSession.ID };

						mLadePara.ExtraFn = async (aLadePara: ParaDB) => {
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
						await this.LadeSessionUebungen(mPtrSession, mLadePara);
					}

					if (aLadePara !== undefined) {
						if (aLadePara.OnSessionNoRecordFn !== undefined) aSessions = aLadePara.OnSessionNoRecordFn(aLadePara);
						if (aLadePara.OnSessionAfterLoadFn !== undefined) aSessions = aLadePara.OnSessionAfterLoadFn(aSessions);
					}
					return aSessions;
				});
		// });
	}

	public async LadeSessionUebungen(aSession: ISession, aLadePara: ParaDB): Promise<Array<Uebung>> {
		if (aLadePara !== undefined && aLadePara.OnUebungBeforeLoadFn !== undefined)
			aLadePara.OnUebungBeforeLoadFn(aLadePara);

		return await this.UebungTable
			.where(aLadePara === undefined || aLadePara.WhereClause === undefined ? { SessionID: aSession.ID } : aLadePara.WhereClause )
			.and((aLadePara === undefined || aLadePara.And === undefined ? () => { return 1 === 1 } : (aUebung: Uebung) => aLadePara.And(aUebung)))
			.reverse()
			.limit(aLadePara === undefined || aLadePara.Limit === undefined ? Number.MAX_SAFE_INTEGER : aLadePara.Limit)
			.sortBy(aLadePara === undefined || aLadePara.SortBy === undefined ? '' : aLadePara.SortBy)
			.then( async (aUebungen: Array<Uebung>) => {
				if (aUebungen.length > 0) {
					if ((aLadePara !== undefined) && (aLadePara.SortOrder !== undefined) &&(aLadePara.SortOrder === SortOrder.ascending))
						// Die Abfrage wird standardmäßig absteigend ausgeführt.
						// Falls also aufsteigend gewünscht wird, muss die Ergebnisliste umgekehrt werden.
						aSession.UebungsListe = aUebungen.reverse();
					else
						aSession.UebungsListe = aUebungen;
					
					for (let index = 0; index < aSession.UebungsListe.length; index++) {
						const mPtrUebung = aSession.UebungsListe[index];
						if (
							(aLadePara !== undefined)
							&& (aLadePara.ExtraFn !== undefined)
						)
						{
							const mExtraFnPara: ParaDB = new ParaDB();
							mExtraFnPara.Data = { Session: aSession, Uebung: mPtrUebung };
							aLadePara.ExtraFn(mExtraFnPara);
						}
						
						await this.LadeUebungsSaetze(mPtrUebung);
					};

					if (aLadePara !== undefined && aLadePara.OnUebungAfterLoadFn !== undefined) aUebungen = aLadePara.OnUebungAfterLoadFn(aUebungen);
					else if (aLadePara !== undefined && aLadePara.OnUebungNoRecordFn !== undefined) aUebungen = aLadePara.OnUebungNoRecordFn(aLadePara);
				}
				return aUebungen;
			});

	}

	public async LadeUebungsSaetze(aUebung: Uebung, aLadePara?: ParaDB): Promise<Array<Satz>> {
		if (aLadePara !== undefined && aLadePara.OnSatzBeforeLoadFn !== undefined) aLadePara.OnSatzBeforeLoadFn(aLadePara);

		return this.SatzTable
			.where(aLadePara === undefined || aLadePara.WhereClause === undefined ? { UebungID: aUebung.ID } : aLadePara.WhereClause )
			.and((aLadePara === undefined || aLadePara.And === undefined ? () => { return 1 === 1 } : (satz:Satz) => aLadePara.And(satz)))
			.limit(aLadePara === undefined || aLadePara.Limit === undefined ? Number.MAX_SAFE_INTEGER : aLadePara.Limit)
			.sortBy(aLadePara === undefined || aLadePara.SortBy === undefined ? '' : aLadePara.SortBy)
			.then((aSaetze: Array<Satz>) => {
				if (aSaetze.length > 0) {
					aUebung.SatzListe = aSaetze;
					aUebung.SatzListe.forEach((s) => {
						if (aLadePara !== undefined && aLadePara.OnSatzAfterLoadFn !== undefined) aLadePara.OnSatzAfterLoadFn(aLadePara);
					});
				} else if (aLadePara !== undefined && aLadePara.OnSatzNoRecordFn !== undefined) aLadePara.OnSatzNoRecordFn(aLadePara);
				return aSaetze;
			});
	}

	private DoAktuellesProgramm(aNeuesAktuellesProgramm: ITrainingsProgramm, aAltesAktuellesProgramm?: ITrainingsProgramm): void {
		if (aAltesAktuellesProgramm) {
			aAltesAktuellesProgramm.ProgrammKategorie = ProgrammKategorie.Fertig;
			this.ProgrammSpeichern(aAltesAktuellesProgramm);
		}
		const mNeu = aNeuesAktuellesProgramm.ErstelleSessionsAusVorlage(ProgrammKategorie.AktuellesProgramm);
		this.ProgrammSpeichern(mNeu);
		this.AktuellesProgramm = mNeu;
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

	public async FindAktuellesProgramm():Promise<Array<ITrainingsProgramm>> {
		// return await this.ProgrammTable.where({ ProgrammKategorie: ProgrammKategorie.AktuellesProgramm.toString() }).toArray();
		const mLadePara: ProgrammParaDB = new ProgrammParaDB();
		mLadePara.WhereClause = { ProgrammKategorie: ProgrammKategorie.AktuellesProgramm.toString() };
		mLadePara.OnProgrammAfterLoadFn = (aAktuellesProgramm: TrainingsProgramm) => {
			return 
		};

		return this.LadeProgramme(mLadePara);
	}

	public async LadeProgramme(aProgrammPara: ProgrammParaDB): Promise<Array<ITrainingsProgramm>> {
		// let mProgramme: ITrainingsProgramm[] = await this.ProgrammTable.where("ProgrammKategorie").equals(aLadePara.fProgrammKategorie.toString()).toArray();
		// "++id,Name,FkVorlageProgramm,ProgrammKategorie,[FkVorlageProgramm+ProgrammKategorie]",
		return await this.ProgrammTable
			.where(aProgrammPara === undefined || aProgrammPara.WhereClause === undefined ? { id: 0 } : aProgrammPara.WhereClause)
			.and((aProgrammPara === undefined || aProgrammPara.And === undefined ? () => { return 1 === 1 } : (programm: ITrainingsProgramm) => aProgrammPara.And(programm)))
			.limit(aProgrammPara === undefined || aProgrammPara.Limit === undefined ? Number.MAX_SAFE_INTEGER : aProgrammPara.Limit)
			.sortBy(aProgrammPara === undefined || aProgrammPara.SortBy === undefined ? '' : aProgrammPara.SortBy)
			//		.then((aLadePara === undefined || aLadePara.Then === undefined ? (aProgramme: Array<ITrainingsProgramm>) => { return aProgramme } : (aProgramme: Array<ITrainingsProgramm>) => aLadePara.Then(aProgramme)));
			.then((aProgrammPara === undefined || aProgrammPara.Then === undefined ? async (aProgramme: Array<ITrainingsProgramm>) => {
				for (let index = 0; index < aProgramme.length; index++) {
					if (aProgrammPara.SessionParaDB === undefined) {
						const mPtrProgramm = aProgramme[index];
						const mLadePara: SessionParaDB = new SessionParaDB();
						// SessionDB: "++ID,Name,Datum,ProgrammKategorie,FK_Programm,FK_VorlageProgramm,Kategorie02,[FK_VorlageProgramm+Kategorie02]",
						mLadePara.WhereClause = { FK_Programm: mPtrProgramm.id };
						await this.LadeProgrammSessions(mLadePara)
							.then((aSessionListe: Array<Session>) => mPtrProgramm.SessionListe = aSessionListe);
					}
					else await this.LadeProgrammSessions(aProgrammPara.SessionParaDB);
				
				}
				if (aProgrammPara.OnProgrammAfterLoadFn !== undefined) aProgrammPara.OnProgrammAfterLoadFn(aProgramme);

				return aProgramme;
			
			}: (aProgramme: Array<ITrainingsProgramm>) => aProgrammPara.Then(aProgramme)));
	}

	public async SatzSpeichern(aSatz: ISatz): Promise<number> {
		return await this.SatzTable.put(aSatz as Satz);
	}

	public async SaetzeSpeichern(aSaetze: Array<ISatz>) {
		return this.SatzTable.bulkPut(aSaetze as Array<Satz>);
	}

	public async UebungSpeichern(aUebung: Uebung): Promise<number> {
		aUebung.FkAltProgress = aUebung.FkProgress;
		aUebung.AltWeightProgress = aUebung.WeightProgress;
		
		let mSatzListe: Array<Satz>;
		if (aUebung.SatzListe !== undefined)
			mSatzListe = aUebung.SatzListe.map(sz => sz);
		
		aUebung.SatzListe = [];
		const mResult = await this.UebungTable.put(aUebung);
			
		if (mSatzListe !== undefined) {
			for (let index = 0; index < mSatzListe.length; index++) {
				const mSatz = mSatzListe[index];
				mSatz.UebungID = aUebung.ID;
				mSatz.SessionID = aUebung.SessionID;
				const mGewichtDiff = cloneDeep(mSatz.GewichtDiff);
				mSatz.GewichtDiff = [];
				this.SatzSpeichern(mSatz);
				mSatz.GewichtDiff = mGewichtDiff;
			}
			// this.SaetzeSpeichern(mSatzListe);
		}
		
		aUebung.SatzListe = mSatzListe;
		return mResult;
	}

	public async SessionSpeichern(aSession: Session, aSessionExtraParaDB?: SessionParaDB): Promise<void> {
		return await this.transaction("rw", this.SessionTable, this.UebungTable, this.SatzTable, async () => {
			const mUebungsListe: Array<Uebung> = [];
			if (aSession.UebungsListe !== undefined) {
				for (let index = 0; index < aSession.UebungsListe.length; index++) {
					const mPtrUebung = aSession.UebungsListe[index];
					const mPtrCopyOfUebung = mPtrUebung.Copy();
					
					// if (
					// 	aSessionExtraParaDB !== undefined
					// 	&& aSessionExtraParaDB.UebungSpeicherParaDB !== undefined
					// 	&& aSessionExtraParaDB.UebungSpeicherParaDB.HalteWdhVorgabeStatus === true
					// )
					// 	mPtrCopyOfUebung.LastFailedID = mPtrUebung.LastFailedID;
					
					mUebungsListe.push(mPtrCopyOfUebung);
				}
			}
			aSession.UebungsListe = [];
			aSession.Datum = aSession.Datum === null || undefined ? new Date() : aSession.Datum;

			const mResult = await this.SessionTable.put(aSession);
			// Session ist gespeichert
			for (let index = 0; index < mUebungsListe.length; index++) {
				const mUebung = mUebungsListe[index];
				// SessionID in Uebung eintragen
				mUebung.SessionID = aSession.ID;
				mUebung.ListenIndex = index;
				mUebung.Datum = aSession.Datum;
				// Uebung speichern
				await this.UebungSpeichern(mUebung);
			}
			aSession.UebungsListe = mUebungsListe;

			if ((aSessionExtraParaDB !== undefined) && aSessionExtraParaDB.OnAfterSaveFn !== undefined)
				aSessionExtraParaDB.OnAfterSaveFn(aSession);
		});
	}

	public ProgrammSpeichern(aTrainingsProgramm: ITrainingsProgramm, aProgrammExtraParaDB? : ProgrammParaDB) {
		return this.transaction("rw", this.ProgrammTable, this.SessionTable, this.UebungTable, this.SatzTable, () => {
			// const mSessions = mTrainingsProgramm.SessionListe;
			// aTrainingsProgramm.SessionListe = [];
			// const mOrgDbModule: DBModule = aTrainingsProgramm.pDbModule;
			// aTrainingsProgramm.pDbModule = null;
			 this.ProgrammTable.put(aTrainingsProgramm)
				.then( 
					// Programm ist gespeichert.
					// ProgrammID in die Sessions eintragen
				    async (id) => {
						const mSessionListe: Array<ISession> = aTrainingsProgramm.SessionListe.map(s => s);
						for (let index = 0; index < mSessionListe.length; index++) {
							const mPtrSession = mSessionListe[index];
							mPtrSession.FK_Programm = id;
							if (   aProgrammExtraParaDB !== undefined
								&& aProgrammExtraParaDB.SessionParaDB !== undefined
							)
								await this.SessionSpeichern(mPtrSession as Session, aProgrammExtraParaDB.SessionParaDB);
							else
								await this.SessionSpeichern(mPtrSession as Session);
						}
						aTrainingsProgramm.SessionListe = mSessionListe;
					}
				)
				.catch((err) => {
					console.error(err);
				});
		});
	}

	public async ErzeugeVorlageProgramm(aProgrammTyp: ProgrammTyp) {
		let mTrainingsProgramm: ITrainingsProgramm = null;

		if (aProgrammTyp === ProgrammTyp.Gzclp) {
			mTrainingsProgramm = GzclpProgramm.ErzeugeGzclpVorlage(this);
		}

		await this.ProgrammSpeichern(mTrainingsProgramm);
		this.LadeProgramme(this.ProgramLadeStandardPara);
	}

	private async InitAppData() {
		this.AppDataTable = this.table(this.cAppData);
		this.AppDataTable.mapToClass(AppData);
		await this.AppDataTable.limit(1).first((aAppRec) => (this.AppRec = aAppRec));

		if (!this.AppRec) {
			this.AppRec = new AppData();
			await this.AppDataTable.put(this.AppRec).catch((error) => {
				console.error(error);
			});
		}
	}

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
			if (   mQuellUebung.FkProgress !== undefined
				&& mQuellUebung.FkProgress > 0)
			{
				mProgress = this.ProgressListe.find((p) => p.ID === mQuellUebung.FkProgress);
				if (   mProgress !== undefined
					&& mProgress.ProgressSet === ProgressSet.First
					&& mQuellUebung.SatzListe !== undefined
				){
					const mPtrQuellSatz = mQuellUebung.SatzListe.find((sz) => sz.SatzListIndex > 0);
					if (mPtrQuellSatz !== undefined) {
						if (   aQuellSession.Kategorie02 === SessionStatus.Fertig
							&& mQuellUebung.ArbeitsSaetzeStatus === ArbeitsSaetzeStatus.AlleFertig)
						{
							mGewicht = mPtrQuellSatz.GewichtAusgefuehrt;
						}
						else if (
							   mPtrQuellSatz.GewichtDiff !== undefined
							&& mPtrQuellSatz.GewichtDiff.length > 0)
						{
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

	private async LastSession(aSession: Session): Promise<Session> {
		const mSessions: Array<Session> = await this.LadeProgrammSessions({
			OnSessionAfterLoadFn: (aSessions: Array<Session>) => {
				aSessions = aSessions.filter((s: Session) => s.ID !== aSession.ID && s.Datum <= aSession.Datum);

				aSessions = aSessions.sort((s1, s2) => {
					if (s1.Datum > s2.Datum) return -1;

					if (s1.Datum < s2.Datum) return 1;

					return 0;
				});

				while (aSessions.length > 1) aSessions.shift();

				return aSessions;
			},

			WhereClause: {
				FK_VorlageProgramm: aSession.FK_VorlageProgramm,
				Kategorie02: SessionStatus.Fertig,
				SessionNr: aSession.SessionNr,
			},
		});

		let mResultSession = undefined;
		if (mSessions.length > 0) {
			mResultSession = mSessions.pop();
			await this.LadeSessionUebungen(mResultSession, { WhereClause: { SessionID: mResultSession.ID } }).then((mUebungen) => {
				const x = mUebungen;
			});
		}

		return mResultSession;
	}

	public async EvalAktuelleSessionListe(aSession: Session, aPara?: any): Promise<void> {
		if (this.AktuellesProgramm && this.AktuellesProgramm.SessionListe) {
			const mSess: ISession = this.AktuellesProgramm.SessionListe.find((s) => s.ID === aSession.ID);
			if (aSession.Kategorie02 === SessionStatus.Loeschen) {
				// Die Session kann schon aus der Session-Liste des aktuellen Programms genommen werden.
				if (mSess !== undefined) {
					const mIndex = this.AktuellesProgramm.SessionListe.indexOf(aSession);
					if (mIndex > -1) this.AktuellesProgramm.SessionListe.splice(mIndex, 1);
				}
			} else {
				// Die Session ersteinmal in die Session-Liste des aktuellen Programms aufnehmen.
				//		if (mSess === undefined) this.AktuellesProgramm.SessionListe.push(aSession);
			}
		}

		if (aSession.Kategorie02 === SessionStatus.Fertig || aSession.Kategorie02 === SessionStatus.Loeschen) {
			await this.SessionSpeichern(aSession);

			const mNeueSession: Session = aSession.Copy(true);
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
			
			const mIndex = this.AktuellesProgramm.SessionListe.findIndex((s) => s.ID === aSession.ID);
			if (mIndex > -1)
				this.AktuellesProgramm.SessionListe.splice(mIndex, 1);
			
			const mAkuelleSessionListe: Array<ISession> = this.AktuellesProgramm.SessionListe.filter((s) =>
				s.Kategorie02 !== SessionStatus.Fertig
				&& s.Kategorie02 !== SessionStatus.FertigTimeOut
				|| s.ID === aSession.ID
				|| s.ListenIndex === aSession.ListenIndex
			);
			

			mNeueSession.UebungsListe.forEach(
				(u) => {
					if (   (u.ArbeitsSatzListe !== undefined)
						&& (u.ArbeitsSatzListe.length > 0)
					)
					{
						const mPtrLetzerSatz: Satz = u.ArbeitsSatzListe[u.ArbeitsSatzListe.length - 1];
						if (   mPtrLetzerSatz.GewichtDiff !== undefined
							&& mPtrLetzerSatz.GewichtDiff.length > 0)
						{
							u.ArbeitsSatzListe.forEach((sz) => sz.SetPresetWeight(Number(mPtrLetzerSatz.GewichtVorgabe)));
						}
					}
				});

			mAkuelleSessionListe.push(mNeueSession);
			
			for (let index = 0; index < mAkuelleSessionListe.length; index++) {
				let mPtrSession: Session = mAkuelleSessionListe[index] as Session;
				mPtrSession.ListenIndex = index;
				await this.SessionSpeichern(mPtrSession);
			}

			if (aSession.Kategorie02 === SessionStatus.Loeschen)
				this.SessionTable.delete(aSession.ID);
			
			if ((aPara !== undefined) && (aPara.ExtraFn !== undefined))
				aPara.ExtraFn(mNeueSession);
		}//if
	}
}