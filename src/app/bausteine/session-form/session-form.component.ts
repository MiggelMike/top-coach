import { Programm03Component } from './../programm03/programm03.component';
import { ToolbarComponent } from './../toolbar/toolbar.component';
import { HistorySession, NoResetTyp, Session  } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from './../../../Business/TrainingsProgramm/TrainingsProgramm';
import { UebungService } from "./../../services/uebung.service";
import { ISessionStatus, Pause, SessionStatus } from "./../../../Business/SessionDB";
import { SessionStatsOverlayComponent } from "./../../session-stats-overlay/session-stats-overlay.component";
import { SessionOverlayServiceService, SessionOverlayConfig } from "./../../services/session-overlay-service.service";
import { DialogeService } from "./../../services/dialoge.service";
import { DexieSvcService, cMinDatum, ProgrammParaDB, SessionParaDB, UebungParaDB, SessionCopyPara, ProgramCopyPara } from "./../../services/dexie-svc.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { cLoadingDefaultHeight, DialogData } from "src/app/dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { Uebung, UebungsKategorie02 } from "src/Business/Uebung/Uebung";
import { UebungWaehlenData } from "src/app/uebung-waehlen/uebung-waehlen.component";
import { ProgressPara, ProgressSet } from 'src/Business/Progress/Progress';
import { Satz, SatzStatus } from 'src/Business/Satz/Satz';
import { ExerciseSettingSvcService } from 'src/app/services/exercise-setting-svc.service';
import { ExerciseSettingsComponent } from 'src/app/exercise-settings/exercise-settings.component';
import { IProgramModul, ProgramModulTyp } from '../../app.module';
import { BodyWeight } from 'src/Business/Bodyweight/Bodyweight';

@Component({
	selector: "app-session-form",
	templateUrl: "./session-form.component.html",
	styleUrls: ["./session-form.component.scss"],
})
export class SessionFormComponent implements OnInit, IProgramModul, ISessionStatus {
	public ready: boolean = false;
	public Session: Session;
	public BackButtonVisible: boolean = false;
	public Programm: ITrainingsProgramm;
	public ModulTyp: ProgramModulTyp = ProgramModulTyp.Kein;
	public cmpSession: Session;
	public cmpSessionSettings: Session;
	public BodyWeight: number = 0;
	public fSessionStatsOverlayComponent: SessionStatsOverlayComponent;
	private fSessionOverlayConfig: SessionOverlayConfig;
	public DeletedExerciseList: Array<Uebung> = [];
	public DeletedSatzList: Array<Satz> = [];
	public fExerciseSettingSvcService: ExerciseSettingSvcService;
	public fExerciseSettingsComponent: ExerciseSettingsComponent;
	@ViewChild('appProgramm03') appProgramm03: Programm03Component;

	constructor(
		private router: Router,
		public fDbModule: DexieSvcService,
		private fDialogService: DialogeService,
		private fSavingDialog: DialogeService,
		private fLoadingDialog: DialogeService,
		private fGlobalService: GlobalService,
		private fUebungService: UebungService,
		private fSessionOverlayServiceService: SessionOverlayServiceService,
	) {
		this.fExerciseSettingsComponent = null;
		const mNavigation = this.router.getCurrentNavigation()!;
		const mState = mNavigation.extras.state as { programm: ITrainingsProgramm, sess: Session, ModulTyp: ProgramModulTyp };
		
		mState.sess.PruefeGewichtsEinheit(DexieSvcService.AppRec.GewichtsEinheit);
		this.ModulTyp = mState.ModulTyp;
		this.Programm = mState.programm;
		DexieSvcService.ModulTyp = mState.ModulTyp;

		this.fDbModule.LadeSessionBodyweight(mState.sess)
			.then((aBW) => {
				const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
				mSessionCopyPara.Komplett = true;
				mSessionCopyPara.CopySessionID = true;
				mSessionCopyPara.CopyUebungID = true;
				mSessionCopyPara.CopySatzID = true;
				this.Session = Session.StaticCopy(mState.sess, mSessionCopyPara);

				if (aBW !== undefined) {
					this.Session.BodyWeight = aBW;
					this.Session.BodyWeightAtSessionStart = aBW.Weight;
				}
				else this.Session.BodyWeightAtSessionStart = 0;

				mState.sess.BodyWeight = this.Session.BodyWeight;
				mState.sess.BodyWeightAtSessionStart = this.Session.BodyWeightAtSessionStart;

				// mState.sess.BodyWeightSession = mState.sess.BodyWeightAtSessionStart;
				if (this.Session.UebungsListe === undefined || this.Session.UebungsListe.length <= 0) {
					const mDialogData = new DialogData();
					mDialogData.height = cLoadingDefaultHeight;
					mDialogData.ShowAbbruch = false;
					mDialogData.ShowOk = false;
					mDialogData.textZeilen.push('Loading session');
					this.fLoadingDialog.Loading(mDialogData);
					try {
						const mUebungParaDB: UebungParaDB = new UebungParaDB();
						mUebungParaDB.SaetzeBeachten = true;
						if (this.Session.ID !== undefined) {
							this.fDbModule.LadeSessionUebungen(this.Session.ID, mUebungParaDB).then(
								(aUebungsListe) => {
									try {
										if (aUebungsListe.length > 0)
											this.Session.UebungsListe = aUebungsListe;
										else
											DexieSvcService.CmpAktuellesProgramm = DexieSvcService.AktuellesProgramm.Copy(new ProgramCopyPara());
							
										if (this.Session.UebungsListe !== undefined) {
											this.Session.UebungsListe.forEach((mPtrUebung) => {
												mPtrUebung.PruefeGewichtsEinheit(this.Session.GewichtsEinheit)
												if (mPtrUebung.SatzListe !== undefined) {
													mPtrUebung.SatzListe.forEach((mPtrSatz) => {
														mPtrSatz.PruefeGewichtsEinheit(this.Session.GewichtsEinheit);
													})
												}
											})
										}

										this.InitSession();
		
									} finally {
										this.fLoadingDialog.fDialog.closeAll();
									}
								});
						} else {
							this.InitSession()
							this.fLoadingDialog.fDialog.closeAll();
						}
					} catch (error) {
						this.fLoadingDialog.fDialog.closeAll();
					}
				} else this.InitSession();
			});
	}
	get sessionStatus(): typeof SessionStatus {
		return SessionStatus;
	}

	get programModul(): typeof ProgramModulTyp {
		return ProgramModulTyp;
	}

	UebungenExpanded: Boolean = true;

	UebungenExpandedFn(aProgramm03: Programm03Component) {
		this.UebungenExpanded = !this.UebungenExpanded;

		if (aProgramm03 === undefined)
			return;
		
		if (aProgramm03.isExpanded) {
			aProgramm03.accUebung.forEach((acc) => acc.closeAll());
			aProgramm03.isExpanded = false;
			aProgramm03.ToggleButtonText = 'Open all exercises';
			aProgramm03.SessUeb.Expanded = false;
		} else {
			aProgramm03.accUebung.forEach((acc) => acc.openAll());
			aProgramm03.isExpanded = true;
			aProgramm03.ToggleButtonText = 'Close all exercises';
			
			if (aProgramm03.SessUeb !== undefined) {
				aProgramm03.SessUeb.Expanded = true;
			}
		}

	}
	

	public StartButtonText(): string {
		if (this.Session === undefined)
			return '?';

		switch (this.Session.Kategorie02) {
			case SessionStatus.Wartet: 
				return "Start";
			case SessionStatus.Laeuft:
			case SessionStatus.Pause:
				return "Done";
			default:
				return "?";
		}
	}


		
	private InitSession() {
		//
		switch (this.Session.Kategorie02) {
			case SessionStatus.Wartet:
				this.Session.GestartedWann = new Date();
				this.Session.Datum = this.Session.GestartedWann;
				this.Session.Kategorie02 = SessionStatus.Laeuft;
				this.EvalStart();
				break;
				
			case SessionStatus.Pause:
			case SessionStatus.Laeuft:
				this.EvalStart();
				break;
		}//switch

		this.fDbModule.SessionSpeichern(this.Session)
			.then((mSavedSession) => {
				const mSuchSession: Session = DexieSvcService.AktuellesProgramm.SessionListe.find(
					(mSession) => {
						if (mSession.ID === mSavedSession.ID)
							return mSession;
						return null;

					});
				if (mSuchSession) {
					mSuchSession.GestartedWann = mSavedSession.GestartedWann;
				}

				const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
				mSessionCopyPara.Komplett = true;
				mSessionCopyPara.CopySessionID = true;
				mSessionCopyPara.CopyUebungID = true;
				mSessionCopyPara.CopySatzID = true;
				this.cmpSession = Session.StaticCopy(this.Session, mSessionCopyPara);
				this.cmpSessionSettings = Session.StaticCopy(this.Session, mSessionCopyPara);
				this.BackButtonVisible = true;
				this.ready = true;

				if(this.Session.Kategorie02 === SessionStatus.Laeuft)
					this.doStats();
			});
	}

	DoWorker() {
		return;
	}

	private EvalStart() {
		this.Session.StarteDauerTimer();
		this.Programm.SessionListe.find((mFindSession) => {
			if (mFindSession.ID === this.Session.ID) {
				mFindSession.Kategorie02 = this.Session.Kategorie02;
				return true;
			}
			return false;
				
		});

	}

	doCheckSettings(aExerciseSettingSvcService: ExerciseSettingSvcService) {
		this.fExerciseSettingSvcService = aExerciseSettingSvcService;
	}

	

	doStats() {
		if (this.fSessionStatsOverlayComponent === undefined
			|| this.fSessionStatsOverlayComponent !== undefined && this.fSessionStatsOverlayComponent.overlayRef === null) {
			this.fSessionOverlayConfig = {
				session: this.Session,
				panelClass: 'cc-overlay',
				top: 400,
				width: '90%'
			} as SessionOverlayConfig;

			this.fSessionStatsOverlayComponent = this.fSessionOverlayServiceService.open(this.fSessionOverlayConfig);
		}
		else this.fSessionStatsOverlayComponent.close();
	}

	AddDeletedExercise(aUebung: any) {
		this.DeletedExerciseList.push(aUebung);
	}

	ngOnDestroy() {
		DexieSvcService.CmpAktuellesProgramm = DexieSvcService.AktuellesProgramm.Copy(new ProgramCopyPara());
		if (this.fSessionStatsOverlayComponent) this.fSessionStatsOverlayComponent.close();
	}


	async back() {
		if (this.fExerciseSettingSvcService)
			await this.fExerciseSettingSvcService.close(() =>
				this.DoClose()
			);

		// if (this.Session.isEqual(this.cmpSession)) this.leave();
		else this.DoClose();
	}

	private DoCheckRunningOnLeaving():boolean {
		if ((this.fSessionStatsOverlayComponent != undefined)
			&& (this.fSessionStatsOverlayComponent.sess.Kategorie02 === SessionStatus.Laeuft)) {
			this.fSessionStatsOverlayComponent.sess.AddPause(new Date());
			this.fSessionStatsOverlayComponent.sess.CalcDauer();
			return true;
		}
		return false;
	}
	
	private DoClose() {
		
		if (this.Session.isEqual(this.cmpSession)) {
			if (this.DoCheckRunningOnLeaving() === true)
				this.SaveChangesPrim().then(() => this.leave());
			else
				this.leave();
		}
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
			
			mDialogData.OkFn = () => {
				this.DoCheckRunningOnLeaving();
				this.SaveChangesPrim().then(() => this.leave());
			}
	
			mDialogData.CancelFn = (): void => {
				if (this.DoCheckRunningOnLeaving() === false)
					this.leave();
				else {
					const mSessCopyPara: SessionCopyPara = new SessionCopyPara();
					mSessCopyPara.CopySatzID = true;
					mSessCopyPara.CopySessionID = true;
					mSessCopyPara.CopyUebungID = true;
					mSessCopyPara.Komplett = true;
					const mTmpSession: Session = Session.StaticCopy(this.Session, mSessCopyPara);
					this.cmpSession.PausenListe = this.fSessionStatsOverlayComponent.sess.PausenListe;
					this.Session = Session.StaticCopy(this.cmpSession, mSessCopyPara);
					this.Session.Kategorie02 = this.fSessionStatsOverlayComponent.sess.Kategorie02;
					this.SaveChangesPrim().then(() => {
						this.Session = Session.StaticCopy(mTmpSession, mSessCopyPara);
						this.leave();
					});
				}

			}
	
			this.fDialogService.JaNein(mDialogData);
		}

	}

	AddExercise() {
		this.fUebungService.UebungWaehlen(
			this.Session,
			// Funktion für den Ok-Button
			(aUebungWaehlenData: UebungWaehlenData) => {
				aUebungWaehlenData.fUebungsListe.forEach((mUebung) => {
					if (mUebung.Selected) {
						const mNeueSessionUebung = Uebung.StaticKopiere(
							this.fDbModule,
							mUebung,
							UebungsKategorie02.Session);
						mNeueSessionUebung.ID = undefined;
						mNeueSessionUebung.FkUebung = mUebung.ID;
						mNeueSessionUebung.SessionID = aUebungWaehlenData.fSession.ID;
						aUebungWaehlenData.fSession.addUebung(mNeueSessionUebung);
					}
				});
				aUebungWaehlenData.fMatDialog.close();
			}
		);
	}

	PasteExcercise() {
		const mDialoData = new DialogData();
		mDialoData.height = '150px';

		if (this.fGlobalService.SessUebungKopie === null) {
			mDialoData.textZeilen.push("Nothing to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSessUebung: Uebung = this.fGlobalService.SessUebungKopie.Copy();
		mSessUebung.SessionID = this.Session.ID;
		mSessUebung.ID = undefined;
		mSessUebung.ListenIndex = this.Session.UebungsListe.length;
		mSessUebung.SatzListe.forEach((sz) => {
			sz.ID = undefined;
			sz.UebungID = undefined;
		});
		this.Session.addUebung(mSessUebung);

		mDialoData.textZeilen.push("Copied execrcise from clipboard");
		this.fDialogService.Hinweis(mDialoData);
		setTimeout(() => this.fDialogService.fDialog.closeAll(), 750);
	}

	leave() {
		// const mSuchSession = DexieSvcService.AktuellesProgramm.SessionListe.find((mSession) => {
		// 	if (mSession.ID === this.Session.ID || mSession.ListenIndex === this.Session.ListenIndex)
		// 		return mSession;
		// 	return null;
		// });

		// if (mSuchSession !== undefined && mSuchSession !== null)
		// 	DexieSvcService.AktuellesProgramm.SessionListe[mSuchSession.ListenIndex] = this.Session;

		// if (this.fSessionStatsOverlayComponent !== undefined && this.fSessionStatsOverlayComponent !== null) this.fSessionStatsOverlayComponent.close();

		if (this.ModulTyp === ProgramModulTyp.HistoryView)
			ToolbarComponent.StaticNavHistory(this.router);
		else 
			ToolbarComponent.StaticNavHome(this.router);
	}

	ngAfterViewInit() {
	}

	ngOnInit(): void {
	}
	
	private LadeSaetze() {
		this.Session.UebungsListe.forEach((mUebung) => this.fDbModule.LadeUebungsSaetze(mUebung.ID).then((mSaetze) => mUebung.SatzListe = mSaetze));
	}

	public SaveChanges(aPara: any) {
		(aPara as SessionFormComponent).SaveChangesPrim();
		this.leave();
	}

	public async SaveChangesPrim(): Promise<void> {
		const mUebungsListe: Array<Uebung> = [];
		// In der Session gelöschte Übungen auch aus der DB löschen.
		for (let index = 0; index < this.DeletedExerciseList.length; index++) {
			const mDelUebung = this.DeletedExerciseList[index];
			await this.fDbModule.DeleteUebung(mDelUebung);
		}

		if (this.DeletedExerciseList.length > 0) {
			for (let index = 0; index < this.Session.UebungsListe.length; index++) {
				const mUebungPtr: Uebung = this.Session.UebungsListe[index];

				if (this.DeletedExerciseList.findIndex(
					(mDelUebung) => { return  mDelUebung.ID === mUebungPtr.ID }) === -1 ) mUebungsListe.push(mUebungPtr);
			}
			Session.nummeriereUebungsListe(mUebungsListe);
		}
		else this.Session.UebungsListe;


		this.DeletedSatzList.forEach((s) =>
			this.fDbModule.DeleteSatz(s)
		);
		this.DeletedSatzList = [];


		for (let index = 0; index < this.Session.UebungsListe.length; index++) {
			const mPtrUebung = this.Session.UebungsListe[index];
			mPtrUebung.ArbeitsSaetzeStatus = Uebung.StaticArbeitsSaetzeStatus(mPtrUebung);
		}

		if (DexieSvcService.ModulTyp === ProgramModulTyp.RunningSession) {
			const mSuchIndex = DexieSvcService.AktuellesProgramm.SessionListe.findIndex((mSuchSession) => { 
				return (mSuchSession.ID === this.Session.ID);
			});

			if(mSuchIndex > -1)
				DexieSvcService.AktuellesProgramm.SessionListe[mSuchIndex] = this.Session;
		}

		await this.fDbModule.SessionSpeichern(this.Session)
			.then(() => {
				if (DexieSvcService.ModulTyp === ProgramModulTyp.HistoryView) {
					const mHistorySessionIndex: number = DexieSvcService.HistorySessions.findIndex((aHistorySession) => { return (aHistorySession.ID === this.Session.ID); });
			
					if (mHistorySessionIndex > -1) {
						DexieSvcService.HistorySessions[mHistorySessionIndex] = this.Session as HistorySession;
					}
				}//if
			});
		
		if (this.Session.BodyWeight.Weight !== this.Session.BodyWeightAtSessionStart) {
			if (this.Session.BodyWeight === undefined || this.Session.BodyWeight.Datum.valueOf() !== this.Session.GestartedWann.valueOf()) {
				const mNeuBodyWeight: BodyWeight = new BodyWeight();
				mNeuBodyWeight.Datum = this.Session.GestartedWann;
				mNeuBodyWeight.Weight = this.Session.BodyWeight.Weight;
				mNeuBodyWeight.GewichtsEinheit = DexieSvcService.GewichtsEinheit;
				this.fDbModule.BodyweightSpeichern(mNeuBodyWeight);
			}
			else if (this.Session.BodyWeight !== undefined || this.Session.BodyWeight.Datum.valueOf() === this.Session.GestartedWann.valueOf()) {
				// this.Session.BodyWeight.Weight = this.Session.BodyWeightSession;
				this.fDbModule.BodyweightSpeichern(this.Session.BodyWeight);
			}
		}

	}

	public CancelChanges(aPara: SessionFormComponent, aNavRoute: string) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Cancel unsaved changes?");
		mDialogData.OkFn = (): void => {
			aPara.Session.resetSession(aPara.cmpSession);
			// this.router.navigate([aNavRoute]);
			this.leave();
		};

		this.fDialogService.JaNein(mDialogData);
	}

	get ResetButtonVisible(): boolean{
		if (this.Session === undefined)
			return false;

		return (this.Session.Kategorie02 === SessionStatus.Laeuft) || (this.Session.Kategorie02 === SessionStatus.Pause);
	}

	// 


	public get Paused(): boolean {
		return this.Session.Kategorie02 === SessionStatus.Pause;
	}

	public SetPause(): void {
		this.Session.AddPause();
	}

	public GoAhead(): void {
		this.Session.StarteDauerTimer();
	}

	// private DoAfterDone(aSessionForm: SessionFormComponent) {
	// 	const mIndex = DexieSvcService.AktuellesProgramm.SessionListe.findIndex((s) => s.ID === aSessionForm.Session.ID);
	// 	if (mIndex > -1) DexieSvcService.AktuellesProgramm.SessionListe.splice(mIndex, 1);
		
	// 	DexieSvcService.AktuellesProgramm.SessionListe = this.Programm.SessionListe;
	// 	DexieSvcService.AktuellesProgramm.NummeriereSessions();
		
	// 	this.SaveChangesPrim().then(() => {
	// 		this.fDbModule.LadeAktuellesProgramm()
	// 			.then(async (aProgramm) => {
	// 				DexieSvcService.AktuellesProgramm = aProgramm;
	// 				DexieSvcService.CmpAktuellesProgramm = aProgramm;
	// 				const mSessionParaDB: SessionParaDB = new SessionParaDB();
	// 				mSessionParaDB.UebungenBeachten = true;
	// 				this.fDbModule.LadeUpcomingSessions(this.Programm.id, mSessionParaDB)
	// 					.then((aSessionListe) => {
	// 						if (aSessionListe.length > 0) {
	// 							DexieSvcService.AktuellesProgramm.SessionListe = aSessionListe;
	// 							aSessionListe.forEach(async (mPtrSession) => {
	// 								if (mPtrSession.Kategorie02 === SessionStatus.Wartet) {
	// 									const mUebungParaDB = new UebungParaDB();
	// 									mUebungParaDB.SaetzeBeachten = true;
	// 									await this.fDbModule.LadeSessionUebungen(mPtrSession.ID, mUebungParaDB).then(
	// 										(aUebungsListe) => {
	// 											if (aUebungsListe.length > 0)
	// 												mPtrSession.UebungsListe = aUebungsListe;
	// 										});
	// 								}
								
	// 								Session.StaticCheckMembers(mPtrSession);
	// 								mPtrSession.PruefeGewichtsEinheit(DexieSvcService.AppRec.GewichtsEinheit);
	// 								this.fSavingDialog.fDialog.closeAll();
	// 								// this.router.navigate(['/']);
	// 								this.leave();
	// 							});
	// 						} else {
	// 							this.fSavingDialog.fDialog.closeAll();
	// 							this.leave();
	// 							// this.router.navigate(['/']);
	// 							// this.location.back();
	// 						}
	// 					});
	// 			});
	// 	})
	// }

	private SaetzePruefen(aQuellSatzListe: Array<Satz>, aZielSatzListe: Array<Satz>) {
		// Prüfe nur soviel Sätze wie in aZielSatzListe vorhanden sind 
		for (let index = 0; index < aZielSatzListe.length; index++) {
			// Falls aZielSatzListe länger ist als aQuellSatzListe, nimm den letzten Satz der Quell-Satzliste als Vorgabe
			const mQuellSatzPtr: Satz = (index < aQuellSatzListe.length) ? aQuellSatzListe[index] : aQuellSatzListe[aQuellSatzListe.length - 1];
			const mZielSatzPtr: Satz = aZielSatzListe[index];
					
			mZielSatzPtr.GewichtNaechsteSession = mQuellSatzPtr.GewichtNaechsteSession;
			mZielSatzPtr.GewichtAusgefuehrt = mQuellSatzPtr.GewichtNaechsteSession;
			mZielSatzPtr.GewichtVorgabe = mQuellSatzPtr.GewichtNaechsteSession;
		} //for
	}

	public StartButtonClick() {
		switch (this.Session.Kategorie02) {
			case SessionStatus.Wartet:
				this.Session.GestartedWann = new Date();
				this.EvalStart();
				break;
			case SessionStatus.Laeuft:
				this.SetDone();
				break;
			case SessionStatus.Pause:
				this.Session.Kategorie02 = SessionStatus.Laeuft;
				this.EvalStart();
				break;
		}
	}

	public async SetDone(): Promise<void> {
		if (DexieSvcService.ModulTyp !== ProgramModulTyp.RunningSession) {
			this.SaveChangesPrim();
			return;
		}
			
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Workout will be saved and closed.");
		mDialogData.textZeilen.push("Do you want to proceed?");
		mDialogData.OkData = this;
		const that = this;
		// Der Benutzer will speichern und schließen.
		mDialogData.OkFn = async (aSessionForm: SessionFormComponent) => {
			const mSaveDialogData = new DialogData();
			mSaveDialogData.height = '175px';
			mSaveDialogData.width = '300px';
			mSaveDialogData.ShowAbbruch = false;
			mSaveDialogData.ShowOk = false;
			mSaveDialogData.textZeilen.push('Saving');
			try {
				// Dem Benutzer zeigen, dass gespeichert wird.
				this.fSavingDialog.Loading(mSaveDialogData);
				// Session aus Sessionliste entfernen.
				DexieSvcService.AktuellesProgramm.SessionListe.splice(aSessionForm.Session.ListenIndex, 1);
				// Session-Status auf fertig setzen
				aSessionForm.Session.SetSessionFertig();
				this.fDbModule.SessionSpeichern(aSessionForm.Session);
				let mHistorySession: HistorySession = new HistorySession(); 
				// mHistorySession.ID = undefined;
				mHistorySession = aSessionForm.Session as HistorySession;
				mHistorySession.ProgrammName = this.Programm.Name;
				DexieSvcService.HistorySessions.unshift(mHistorySession);
				this.fDbModule.ErstelleDiagrammData(
					cMinDatum, //aVonDatum: Date, 
					cMinDatum, // aBisDatum: Date,
					DexieSvcService.HistorySessions,
					DexieSvcService.DiagrammDatenListe);
					
				const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
				// UebungID nicht kopieren
				mSessionCopyPara.CopyUebungID = false;
				// SatzID nicht kopieren
				mSessionCopyPara.CopySatzID = false;
				// Mit den Daten der gespeicherten Session eine neue erstellen
				const mNeueSession: Session = Session.StaticCopy(aSessionForm.Session, mSessionCopyPara);
				mSaveDialogData.textZeilen.push('Create new Session');
				aSessionForm.Session.ListenIndex = -aSessionForm.Session.ListenIndex;
				// Neue Session initialisieren
				mNeueSession.init([]); // [] -> Alles zurücksetzen
				// Die neue Session gehört zum gleichen Programm wie die Alte
				mNeueSession.FK_Programm = aSessionForm.Session.FK_Programm;
				// Die Neue Session hat das gleiche Vorlage-Programm wie die Alte.
				mNeueSession.FK_VorlageProgramm = aSessionForm.Session.FK_VorlageProgramm;
				mNeueSession.Expanded = false;
				// Sätze der neuen Session initialisieren
				mSaveDialogData.textZeilen = [];
				mSaveDialogData.textZeilen.push('Initializing new Session');
			
				if (aSessionForm.Session.UebungsListe.length > 0) {
					this.DeletedExerciseList.forEach((mDelUebung) => {
						const mVorderesSegment: Array<Uebung> = mNeueSession.UebungsListe.slice(0, mDelUebung.ListenIndex);
						mVorderesSegment.push(mDelUebung);
						const mHinteresSegment: Array<Uebung> = mNeueSession.UebungsListe.slice(mDelUebung.ListenIndex);
						mNeueSession.UebungsListe = [];
						const mNeueUebungsListe: Array<Uebung> = mNeueSession.UebungsListe.concat(mVorderesSegment, mHinteresSegment);
						mNeueUebungsListe.forEach((mUebung) => {
							const mNeueUebung = Uebung.StaticKopiere(
								this.fDbModule,
								mUebung,
								UebungsKategorie02.Session
							);
							mNeueUebung.ID = undefined;
							mNeueUebung.SessionID = mNeueSession.ID;
						});
						mNeueSession.UebungsListe = mNeueUebungsListe;
					});

					Session.nummeriereUebungsListe(mNeueSession.UebungsListe);
					const mSessionFormSession: Session = Session.StaticCopy(mNeueSession, mSessionCopyPara);

					this.fDbModule.InitSessionSaetze(mSessionFormSession, mNeueSession as Session);
					// Satzvorgaben für Sätze der neuen Übung setzen
					mNeueSession.UebungsListe.forEach((mNeueUebung) => {
						mNeueUebung.SatzListe.forEach((mNeuerSatz) => {
							mNeuerSatz.GewichtVorgabe = mNeuerSatz.GewichtNaechsteSession;
							mNeuerSatz.GewichtAusgefuehrt = mNeuerSatz.GewichtNaechsteSession;
						});
					});

					try {
						mSaveDialogData.textZeilen = [];
						mSaveDialogData.textZeilen.push(`Checking upcoming Session`);
						that.Programm.SessionListe.push(mNeueSession);
						that.Programm.NummeriereSessions();
						await that.fDbModule.CheckSessionUebungen(mNeueSession).then(() => {
							for (let index = 0; index < mNeueSession.UebungsListe.length; index++) {
								const mNeueUebung: Uebung = mNeueSession.UebungsListe[index];
								mNeueUebung.WeightInitDate = cMinDatum;
								mNeueUebung.FailDatum = cMinDatum;
	
								if ((mNeueUebung.SatzListe !== undefined) && (mNeueUebung.SatzListe.length > 0)) {
									mNeueUebung.nummeriereSatzListe(mNeueUebung.SatzListe);
									this.Programm.SessionListe.forEach(async (mProgrammSession) => {
										// Ist die aktuelle Session ungleich der Gesicherten?
										if (mProgrammSession.ID !== mSessionFormSession.ID) {
											// Prüfe alle Übungen der aktuellen Programm-Session
											for (let index2 = 0; index2 < mProgrammSession.UebungsListe.length; index2++) {
												const mProgrammSessionUebung = mProgrammSession.UebungsListe[index2];
												// Ist mNeueUebung gleich mProgrammSessionUebung?
												// Das heißt: Handelt es sich um die gleiche Übung wie z.B "Kniebeuge"?
												if (
													// Ist die aktuelle Uebung aus dem Programm die gleiche wie die neue?
													mProgrammSessionUebung.FkUebung === mNeueUebung.FkUebung &&
													// Ist der Progress aus dem Programm der gleiche wie der, der neuen Uebung?
													mProgrammSessionUebung.FkProgress === mNeueUebung.FkProgress &&
													// Ist die Progress-Gruppe aus dem Programm die gleiche wie die, der neuen Uebung?
													mProgrammSessionUebung.ProgressGroup === mNeueUebung.ProgressGroup) {
													await this.fDbModule.CheckUebungSaetze(mProgrammSessionUebung).then(() => {
														// if (mProgrammSessionUebung.SatzListe.length <= 0)
														// 	alert("Keine Sätze");
														mProgrammSessionUebung.nummeriereSatzListe(mProgrammSessionUebung.SatzListe);
														this.SaetzePruefen(mNeueUebung.AufwaermSatzListe, mProgrammSessionUebung.AufwaermSatzListe);
														this.SaetzePruefen(mNeueUebung.ArbeitsSatzListe, mProgrammSessionUebung.ArbeitsSatzListe);
														this.SaetzePruefen(mNeueUebung.AbwaermSatzListe, mProgrammSessionUebung.AbwaermSatzListe);
													});
												}
											}//for
										}//if
									});
								}//if
							} // for
						});
						for (let index1 = 0; index1 < that.Programm.SessionListe.length; index1++) {
							const mPtrSession = that.Programm.SessionListe[index1];
							// Eventuell müssen die Sätze der Session-Übungen geladen werden
							for (let mUebungIndex = 0; mUebungIndex < mPtrSession.UebungsListe.length; mUebungIndex++) {
								const mPtrUebung = mPtrSession.UebungsListe[mUebungIndex];
								if (mPtrUebung.ArbeitsSatzListe.length > 0
									&& mPtrUebung.FkProgress !== undefined) {
									const mProgressPara: ProgressPara = new ProgressPara();
									mProgressPara.SessionDone = true;
									mProgressPara.DbModule = this.fDbModule;
									mProgressPara.Programm = this.Programm;
									mProgressPara.AusgangsSession = mPtrSession;
									mProgressPara.AlleSaetze = true;
									mProgressPara.ProgressHasChanged = false;
									mProgressPara.AusgangsUebung = mPtrUebung;
						
									mProgressPara.FailUebung = mSessionFormSession.UebungsListe.find((u) => {
										if (u.FkUebung === mPtrUebung.FkUebung && u.ListenIndex === mPtrUebung.ListenIndex)
											return u;
										return undefined;
									});

									mProgressPara.ProgressID = mPtrUebung.FkProgress;
									mProgressPara.AlteProgressID = mPtrUebung.FkProgress;
									mProgressPara.ProgressListe = DexieSvcService.ProgressListe;
									mProgressPara.Progress = DexieSvcService.ProgressListe.find((p) => p.ID === mProgressPara.AusgangsUebung.FkProgress);

									if ((mProgressPara.Progress !== undefined)
										&& ((mProgressPara.Progress.ProgressSet !== undefined))
										&& (mProgressPara.Progress.ProgressSet === ProgressSet.Last)) {
										mProgressPara.SatzDone = mPtrUebung.ArbeitsSatzListe[mPtrUebung.ArbeitsSatzListe.length - 1].Status === SatzStatus.Fertig;
										mProgressPara.AusgangsSatz = mPtrUebung.ArbeitsSatzListe[mPtrUebung.ArbeitsSatzListe.length - 1];
									} else {
										mProgressPara.SatzDone = mPtrUebung.ArbeitsSatzListe[0].Status === SatzStatus.Fertig;
										mProgressPara.AusgangsSatz = mPtrUebung.ArbeitsSatzListe[0];
									}
								}//if
							}//for
						}//for

	
						// DexieSvcService.AktuellesProgramm.SessionListe = that.SeProgramm.SessionListe;
						await this.fDbModule.SessionSpeichern(mNeueSession).then(
							async () => {
								const mProgrammExtraParaDB: ProgrammParaDB = new ProgrammParaDB();
								mProgrammExtraParaDB.SessionBeachten = true;
								mProgrammExtraParaDB.SessionParaDB = new SessionParaDB();
								mProgrammExtraParaDB.SessionParaDB.UebungenBeachten = true;
								mProgrammExtraParaDB.SessionParaDB.UebungParaDB = new UebungParaDB();
								mProgrammExtraParaDB.SessionParaDB.UebungParaDB.SaetzeBeachten = true;
								// DexieSvcService.AktuellesProgramm = that.Programm;
								await this.fDbModule.ProgrammSpeichern(that.Programm, mProgrammExtraParaDB)
									.then((mPtrProgramm) => {
										this.Programm = mPtrProgramm;
										// this.fDbModule.LadeAktuellesProgramm();
										// this.DoAfterDone(this);
										//this.fDbModule.LadeHistorySessions(null, null);
										this.fSavingDialog.fDialog.closeAll();
										//this.location.back();
										// this.router.navigate(['/']);
										this.leave();
									});
									
							});
					} catch (err) {
						console.error(err);
					}
				} // <= mSavedSession.UebungsListe.length > 0
			} catch (err) {
				this.fSavingDialog.fDialog.closeAll();
				console.error(err);
			}
		} // <= mDialogData.OkFn
		// Den Benutzer fragen, ob er speichern und schliessen möchte
		this.fDialogService.JaNein(mDialogData);
	}
	
	public PauseButtonVisible(): boolean {
		if (this.Session === undefined)
			return false;

		return this.Session.Kategorie02 !== SessionStatus.Fertig && this.Session.Kategorie02 !== SessionStatus.FertigTimeOut;
	}
}

// if (typeof Worker !== 'undefined') {
//   // Create a new
//   const worker = new Worker(new URL('./session-form.worker', import.meta.url));
//   worker.onmessage = ({ data }) => {
//     console.log(`page got message: ${data}`);
//   };
//   worker.postMessage('hello');
// } else {
//   // Web Workers are not supported in this environment.
//   // You should add a fallback so that your program still executes correctly.
// }