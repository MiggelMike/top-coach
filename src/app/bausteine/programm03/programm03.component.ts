import { DexieSvcService, SatzParaDB } from './../../services/dexie-svc.service';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Uebung, SaetzeStatus, ISaetzeStatus } from './../../../Business/Uebung/Uebung';
import { GlobalService } from 'src/app/services/global.service';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { HistorySession, ISession, Session } from './../../../Business/Session/Session';
import { IProgrammKategorie, ITrainingsProgramm, ProgrammKategorie } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Component, OnInit, Input, ViewChildren, ViewChild, QueryList, Output, EventEmitter, ChangeDetectionStrategy  } from "@angular/core";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { LOCALE_ID, Inject } from '@angular/core';
import { IProgramModul, ProgramModulTyp } from 'src/app/app.module';
import { ExerciseSettingsComponent } from 'src/app/exercise-settings/exercise-settings.component';
import { ExerciseOverlayConfig, ExerciseSettingSvcService } from 'src/app/services/exercise-setting-svc.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ISatzTyp, Satz, SatzTyp } from 'src/Business/Satz/Satz';


@Component({
	selector: 'app-programm03',
	templateUrl: './programm03.component.html',
	styleUrls: ['./programm03.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class Programm03Component implements OnInit, IProgramModul, ISatzTyp, ISaetzeStatus, IProgrammKategorie {
	@Input() programm: ITrainingsProgramm;
	@Input() session: ISession;
	@Input() satzArt: SatzTyp;
	@Input() cmpSession: ISession;
	@Input() cmpSettingsSession: ISession;
	@Input() SessUeb: Uebung;
	@Input() rowNum: number = 0;
	@Input() bearbeitbar: Boolean = true;
	@Input() panUebung1: MatExpansionPanel;
	@Input() ShowStats: Boolean = false;
	@Input() StatsVisible: Boolean = false;
	@Input() DeletedSatzList: Array<Satz> = [];
	@Input() SofortSpeichern: Boolean = false;
	@Input() StatsButtonVisible: boolean = false;

	@Output() DoStats = new EventEmitter<any>();
	@Output() DoCheckSettings = new EventEmitter<ExerciseSettingSvcService>();
	@Output() AddDeletedExercise = new EventEmitter<Uebung>();

	@ViewChildren('accUebung') accUebung: QueryList<MatAccordion>;
	@ViewChildren('panUebung') panUebung: QueryList<MatExpansionPanel>;
	@ViewChild(CdkOverlayOrigin) cdkOverlayOrigin: CdkOverlayOrigin;
	@ViewChild('Info') Info: any;

	ModulTyp: ProgramModulTyp = ProgramModulTyp.Kein;
	private fExerciseOverlayConfig: ExerciseOverlayConfig;
	private fExerciseSettingsComponent: ExerciseSettingsComponent;
	public checkingSets: boolean = false;
	private worker: Worker;
	private isExpanded: Boolean = true;
	public ToggleButtonText = 'Close all excercises';
	public LocaleID: string;
	AppData: any;
	// private UebungPanelsObserver = {
	//     next: (x: MatExpansionPanel) => {
	//         this.accCheckUebungPanels(this.SessUeb);
	//     },
	//     error: (err) =>
	//         console.error("UebungPanelsObserver got an error: " + err),
	//     complete: () =>
	//         console.log("UebungPanelsObserver got a complete notification"),
	// };

	ngOnInit() {
		this.ModulTyp = DexieSvcService.ModulTyp;
	}

	get ProgrammName(): string {
		if (this.ModulTyp === ProgramModulTyp.HistoryView) return (this.session as HistorySession).ProgrammName;
		return '';
	}

	constructor(
		@Inject(LOCALE_ID) localID: string,
		private fGlobalService: GlobalService,
		private fDialogService: DialogeService,
		private fExerciseSettingSvcService: ExerciseSettingSvcService,
		private fDbModule: DexieSvcService
	) {
		this.LocaleID = localID;
		this.ModulTyp = DexieSvcService.ModulTyp;
	}
	get programmKategorie(): typeof ProgrammKategorie {
		return ProgrammKategorie;
	}
	get saetzeStatus(): typeof SaetzeStatus {
		return SaetzeStatus;
	}
	get satzTyp(): typeof SatzTyp {
		return SatzTyp;
	}
	get programModul(): typeof ProgramModulTyp {
		return ProgramModulTyp;
	}

	AlleFertig(aUebung: Uebung): boolean{
		return this.getArbeitsSaetzeStatus(aUebung) === SaetzeStatus.AlleFertig;
	} 

	DoWorker() {
		const that = this;
		if (typeof Worker !== 'undefined') {
			if (that.session.UebungsListe !== undefined) {
				that.worker = new Worker(new URL('./programm03.worker', import.meta.url));
				that.UebungsListe.forEach((mUebung) => {
					if (mUebung.SatzListe.length === 0) that.CheckUebungSatzliste(mUebung);
				});
			} //if
			that.worker.postMessage('LadeSaetze');
		} //if
	}

	public DoStatsFn() {
		this.DoStats.emit(this.Info);
	}

	public DoCheckSettingsFn() {
		if (this.DoCheckSettings !== undefined) this.DoCheckSettings.emit(this.fExerciseSettingSvcService);
	}

	drop(event: any) {
		if(DexieSvcService.CalcPosAfterDragAndDrop(this.session.UebungsListe, event) === true)
			Session.nummeriereUebungsListe(this.session.UebungsListe);
	}

	public get UebungsListe(): Array<Uebung> {
		return Uebung.StaticUebungsListeSortByListenIndex(this.session.UebungsListe);
	}

	getArbeitsSaetzeStatus(aSessUeb: Uebung): SaetzeStatus {
		return Uebung.StaticAlleSaetzeStatus(aSessUeb);
	}

	satzTypVisible(aSessUebung: Uebung, aSatzTyp: SatzTyp): boolean{
        switch (aSatzTyp) {
            case SatzTyp.Aufwaermen:
                return (aSessUebung.WarmUpVisible && this.ModulTyp !== ProgramModulTyp.SelectWorkout);
            
            case SatzTyp.Abkuehlen:
                return (aSessUebung.CooldownVisible && this.ModulTyp !== ProgramModulTyp.SelectWorkout);
            
            default:
                return true;
        }
    }
    

	ngOnDestroy() {
		if (this.fGlobalService.Comp03PanelUebungObserver != null) this.fGlobalService.Comp03PanelUebungObserver = null;
	}

	async toggleUebungen() {
		if (this.isExpanded) {
			this.accUebung.forEach((acc) => acc.closeAll());
			this.isExpanded = false;
			this.ToggleButtonText = 'Open all exercises';
			this.SessUeb.Expanded = false;
		} else {
			this.accUebung.forEach((acc) => acc.openAll());
			// for (let index = 0; index < this.session.UebungsListe.length; index++) {
			//     this.CheckUebungSatzliste(this.session.UebungsListe[index]);
			// }
			this.isExpanded = true;
			this.ToggleButtonText = 'Close all exercises';
			if (this.SessUeb !== undefined) this.SessUeb.Expanded = true;
		}
	}

	async PanelUebungOpened(aMatExpansionPanelIndex: number, aUebung: Uebung) {
		try {
			this.checkingSets = true;

			if (aUebung !== undefined) aUebung.Expanded = true;

			if (this.panUebung === undefined) return;

			const mPanUebungListe = this.panUebung.toArray();
			if (mPanUebungListe[aMatExpansionPanelIndex].expanded === true && aUebung.SatzListe.length === 0)
				this.CheckUebungSatzliste(aUebung);
		} finally {
			this.checkingSets = false;
		}
	}

	PanelUebungClosed(aUebung: Uebung) {
		if (aUebung !== undefined) aUebung.Expanded = false;

		if (this.panUebung === undefined) return;

		this.accCheckUebungPanels(aUebung);
	}

	private async LadeUebungsSaetze(aUebung: Uebung, aSatzParaDB?: SatzParaDB): Promise<Array<Satz>> {
		return await this.fDbModule.LadeUebungsSaetze(aUebung.ID, aSatzParaDB).then(async (aSatzliste) => {
			if (aSatzliste.length > 0) {
				// aUebung.SatzListe = aSatzliste;
				aSatzliste.forEach((aSatz) => {
					if (aUebung.SatzListe.find((aCmpSatz) => aSatz.ID === aCmpSatz.ID) === undefined)
						aUebung.SatzListe.push(aSatz);
				});
				return aUebung.SatzListe;
				// return await this.LadeUebungsSaetze(aUebung, mSatzParaDB);
			}
			return [];
		});
	}

	private async CheckUebungSatzliste(aUebung: Uebung): Promise<Uebung> {
		// if (aUebung.SatzListe === undefined || aUebung.SatzListe.length <= 0) {
		// 	aUebung.SatzListe = [];
		// 	await this.LadeUebungsSaetze(aUebung);
		// }
		return aUebung;
	}

	async accCheckUebungPanels(aUebung?: Uebung) {
		if (!this.panUebung) return;

		let mAllClosed = false;

		if (this.session.UebungsListe.length > 0 && aUebung !== undefined) {
			const mIndex = this.session.UebungsListe.indexOf(aUebung);
			if (mIndex > -1) {
				const mPanUebungListe = this.panUebung.toArray();
				if (mPanUebungListe.length - 1 >= mIndex) mPanUebungListe[mIndex].expanded = aUebung.Expanded;
			}

			mAllClosed = true;
			this.checkingSets = false;

			const mPanUebungListe = this.panUebung.toArray();
			this.checkingSets = true;
			for (let index = 0; index < mPanUebungListe.length; index++) {
				const mPtrUebung: Uebung = this.session.UebungsListe[index];
				mPtrUebung.Expanded = mPanUebungListe[index].expanded;
				if (mPanUebungListe[index].expanded) {
					mAllClosed = false;
				}

				this.checkingSets = false;
			}
		}

		if (mAllClosed) {
			this.isExpanded = false;
			this.ToggleButtonText = 'Open all excercises';
		} else {
			this.isExpanded = true;
			this.ToggleButtonText = 'Close all excercises';
		}
	}

	get GewichtsEinheit(): string {
		return DexieSvcService.GewichtsEinheitText;
	}

	public DeleteExercise(aRowNum: number, aUebung: Uebung, aEvent: Event) {
		aEvent.stopPropagation();
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push(`Delete exercise #${aRowNum} "${aUebung.Name}" ?`);
		mDialogData.OkFn = (): void => {
			// Index der SessUeb in Liste suchen.
			const index: number = this.session.UebungsListe.indexOf(aUebung);

			// SessUeb-Index gefunden?
			if (index !== -1) {
				// SessUeb-Index gefunden
				if (aUebung.ID > 0) this.AddDeletedExercise.emit(aUebung);

				// SessUeb aus Liste entfernen.
				this.session.UebungsListe.splice(index, 1);
				Session.nummeriereUebungsListe(this.session.UebungsListe);
			}

			if (this.fGlobalService.Comp03PanelUebungObserver != null) {
				this.panUebung1.expanded = false;
				// of(this.panUebung1).subscribe(
				//     this.fGlobalService.Comp03PanelUebungObserver
				// );
			}
		};

		this.fDialogService.JaNein(mDialogData);
	}

	ngAfterViewInit() {
	}

	ExpandCheckDone: boolean = false;
	ngDoCheck() {
		if ((this.ExpandCheckDone === false) && (this.panUebung !== undefined) && (this.panUebung.length > 0)) {
			let mFoundExpanded = false;
			const mPanUebungListe = this.panUebung.toArray();
			for (let index = 0; index < this.session.UebungsListe.length; index++) {
				const mUebungPtr: Uebung = this.session.UebungsListe[index];
				if (this.AlleFertig(mUebungPtr) === false) {
					mPanUebungListe[index].expanded = true;
					mFoundExpanded = true;
					break;
				}
			}

			if ((this.ExpandCheckDone === false) && (mFoundExpanded === false) && (this.panUebung !== undefined) && (this.panUebung.length > 0)) {
				this.panUebung.first.expanded = true
			}
			
			this.ExpandCheckDone = true;
		}
	}

	public CopyExcercise(aUebung: Uebung, aEvent: Event) {
		aEvent.stopPropagation();
		this.fGlobalService.SessUebungKopie = aUebung.Copy();
	}

	public DoSettings(aSessUeb: Uebung, aEvent: Event) {
		aEvent.stopPropagation();

		const mCmpUebung: Uebung = this.session.UebungsListe.find((mUebung) => {
			if (
				mUebung.ID === aSessUeb.ID ||
				(mUebung.ListenIndex === aSessUeb.ListenIndex && mUebung.FkUebung === aSessUeb.FkUebung)
			)
				return mUebung;
			return undefined;
		});

		this.fExerciseOverlayConfig = {
			hasBackdrop: true,
			panelClass: 'cc-overlay',
			uebung: aSessUeb,
			cmpUebungSettings: mCmpUebung,
			programm: this.programm,
			session: this.session,
			left: (aEvent as PointerEvent).pageX - (aEvent as PointerEvent).offsetX,
			top: (aEvent as PointerEvent).clientY - (aEvent as PointerEvent).offsetY,
			sofortSpeichern: this.SofortSpeichern,
		} as ExerciseOverlayConfig;

		this.fExerciseSettingsComponent = this.fExerciseSettingSvcService.open(this.fExerciseOverlayConfig);
		this.DoCheckSettingsFn();
	}
}