import { Session, SessionCopyPara } from './../../../Business/Session/Session';
import { ITrainingsProgramm } from './../../../Business/TrainingsProgramm/TrainingsProgramm';
import { UebungService } from "./../../services/uebung.service";
import { SessionStatus } from "./../../../Business/SessionDB";
import { SessionStatsOverlayComponent } from "./../../session-stats-overlay/session-stats-overlay.component";
import { SessionOverlayServiceService, SessionOverlayConfig } from "./../../services/session-overlay-service.service";
import { DialogeService } from "./../../services/dialoge.service";
import { DexieSvcService, MinDatum, ProgrammParaDB, SessionParaDB, UebungParaDB, WorkerAction } from "./../../services/dexie-svc.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DialogData } from "src/app/dialoge/hinweis/hinweis.component";
import { Location } from "@angular/common";
import { GlobalService } from "src/app/services/global.service";
import { Uebung, UebungsKategorie02 } from "src/Business/Uebung/Uebung";
import { UebungWaehlenData } from "src/app/uebung-waehlen/uebung-waehlen.component";
import { ProgressPara, ProgressSet } from 'src/Business/Progress/Progress';
import { Satz, SatzStatus } from 'src/Business/Satz/Satz';
import { ExerciseSettingSvcService } from 'src/app/services/exercise-setting-svc.service';
import { ExerciseSettingsComponent } from 'src/app/exercise-settings/exercise-settings.component';

@Component({
	selector: "app-session-form",
	templateUrl: "./session-form.component.html",
	styleUrls: ["./session-form.component.scss"],
})
export class SessionFormComponent implements OnInit {
	private worker: Worker;
	public ready: boolean = false;
	public Session: Session;
	public BackButtonVisible: boolean = false;
	public Programm: ITrainingsProgramm;
	public programmTyp: string = '';
	public cmpSession: Session;
	public cmpSessionSettings: Session;
	public BodyWeight: number = 0;
	public fSessionStatsOverlayComponent: SessionStatsOverlayComponent = null;
	private fSessionOverlayConfig: SessionOverlayConfig;
	public DeletedExerciseList: Array<Uebung> = [];
	public DeletedSatzList: Array<Satz> = [];
	public fExerciseSettingSvcService: ExerciseSettingSvcService;
	public fExerciseSettingsComponent: ExerciseSettingsComponent;

	constructor(
		private router: Router,
		public fDbModule: DexieSvcService,
		private fDialogService: DialogeService,
		private fSavingDialog: DialogeService,
		private fLoadingDialog: DialogeService,
		private fGlobalService: GlobalService,
		private fUebungService: UebungService,
		private fSessionOverlayServiceService: SessionOverlayServiceService,
		private location: Location
	) {
		const mNavigation = this.router.getCurrentNavigation();
		const mState = mNavigation.extras.state as { programm: ITrainingsProgramm, sess: Session, programmTyp: string };
		if (mState.sess.Kategorie02 === SessionStatus.Wartet) {
			mState.sess.BodyWeightAtSessionStart = this.fDbModule.getBodyWeight();
		}
		mState.sess.PruefeGewichtsEinheit(this.fDbModule.AppRec.GewichtsEinheit);
		
		this.programmTyp = mState.programmTyp;
		this.Programm = mState.programm;
		const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
		mSessionCopyPara.Komplett = true;
		mSessionCopyPara.CopySessionID = true;
		mSessionCopyPara.CopyUebungID = true;
		mSessionCopyPara.CopySatzID = true;
		this.Session = Session.StaticCopy(mState.sess,mSessionCopyPara);

		if (this.Session.UebungsListe === undefined || this.Session.UebungsListe.length <= 0) {
			const mDialogData = new DialogData();
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
									this.fDbModule.CmpAktuellesProgramm = this.fDbModule.AktuellesProgramm.Copy();
							
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
		}
		
	private InitSession() {
		//
		switch (this.Session.Kategorie02) {
			case SessionStatus.Wartet:
				this.Session.GestartedWann = new Date();
				this.Session.Kategorie02 = SessionStatus.Laueft;
				this.Session.Datum = new Date();
				this.EvalStart();
				break;
				
			case SessionStatus.Pause:
			case SessionStatus.Laueft:
				this.EvalStart();
				break;
		}//switch
					
		const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
		mSessionCopyPara.Komplett = true;
		mSessionCopyPara.CopySessionID = true;
		mSessionCopyPara.CopyUebungID = true;
		mSessionCopyPara.CopySatzID = true;
		this.cmpSession = Session.StaticCopy(this.Session,mSessionCopyPara);
		this.cmpSessionSettings = Session.StaticCopy(this.Session,mSessionCopyPara);
		this.BackButtonVisible = true;
		this.ready = true;
	}

	DoWorker() {
        if (typeof Worker !== 'undefined') {
            this.worker = new Worker(new URL('./session-form.worker', import.meta.url));
            this.worker.addEventListener('message', ({ data }) => {
				if (data.action === "LadeUebungen") {
					const mUebungParaDB: UebungParaDB = new UebungParaDB();
					// mUebungParaDB.Limit = cUebungSelectLimit;
					// mUebungParaDB.OffSet = 0;
					mUebungParaDB.SaetzeBeachten = true;
					this.Programm.SessionListe.forEach(
						(aSession) => {
							if (this.Session.ID !== aSession.ID) {
								this.fDbModule.LadeSessionUebungen(aSession.ID, mUebungParaDB).then(
									(aUebungsListe) => {
										if (aUebungsListe.length > 0) aSession.UebungsListe = aUebungsListe;
										else this.fDbModule.CmpAktuellesProgramm = this.fDbModule.AktuellesProgramm.Copy();
										if (this.cmpSession.UebungsListe === undefined || this.cmpSession.UebungsListe.length <= 0) {
											this.cmpSession.UebungsListe = [];
											aSession.UebungsListe.forEach((mUebung) => this.cmpSession.UebungsListe.push(mUebung.Copy()));
										}
									});
								}
						});//foreach
				}//if
            });
            this.worker.postMessage('LadeUebungen');
        } else {
            // Web Workers are not supported in this environment.
            // You should add a fallback so that your program still executes correctly.
        }
    }

	private EvalStart() {
		// if (this.Session.UebungsListe === undefined || this.Session.UebungsListe.length < 1) this.Session.AddPause();
		// else this.Session.StarteDauerTimer();				
		this.Session.StarteDauerTimer();				
	}

	doCheckSettings(aExerciseSettingSvcService : ExerciseSettingSvcService){
		this.fExerciseSettingSvcService = aExerciseSettingSvcService;
	}

	doStats() {
		if (this.fSessionStatsOverlayComponent === null || this.fSessionStatsOverlayComponent.overlayRef === null) {
			this.fSessionOverlayConfig = {
				session: this.Session,
			} as SessionOverlayConfig;

			this.fSessionStatsOverlayComponent = this.fSessionOverlayServiceService.open(this.fSessionOverlayConfig);
		}
		else this.fSessionStatsOverlayComponent.close();
	}

	ngOnDestroy() {
		if (this.fSessionStatsOverlayComponent) this.fSessionStatsOverlayComponent.close();
	}

	private CloseExerciseSettings(): Promise<void> {
		this.fExerciseSettingSvcService.close();
		return null;
	}

	async back() {
		if (this.fExerciseSettingSvcService) 
			await this.fExerciseSettingSvcService.close(() =>
				this.DoClose()
			);

		// if (this.Session.isEqual(this.cmpSession)) this.leave();
		else this.DoClose();
	}
	
	private DoClose() {
		if (this.Session.isEqual(this.cmpSession)) this.leave();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
		
			mDialogData.OkFn = () => {
				this.leave();
				this.SaveChangesPrim();
			}
	
			mDialogData.CancelFn = (): void => {
				const mCancelDialogData = new DialogData();
				mCancelDialogData.textZeilen.push("Changes will be lost!");
				mCancelDialogData.textZeilen.push("Are you shure?");
				mCancelDialogData.OkFn = (): void => this.leave();
				this.fDialogService.JaNein(mCancelDialogData);
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
						const mNeueSessionUebung = Uebung.StaticKopiere(mUebung, UebungsKategorie02.Session);
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
		if (this.fGlobalService.SessUebungKopie === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("No data to paste!");
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
	}

	leave() {
		if (this.fSessionStatsOverlayComponent !== undefined && this.fSessionStatsOverlayComponent !== null) this.fSessionStatsOverlayComponent.close();

		this.location.back();
	}

	ngAfterViewInit() {
	}

	ngOnInit(): void {
		this.DoWorker();
		this.BodyWeight = this.fDbModule.getBodyWeight();
	}
	
	private LadeSaetze() {
		this.Session.UebungsListe.forEach((mUebung) => this.fDbModule.LadeUebungsSaetze(mUebung.ID).then((mSaetze) => mUebung.SatzListe = mSaetze ));
	}

	public SaveChanges(aPara: any) {
		(aPara as SessionFormComponent).SaveChangesPrim();
	}

	public async SaveChangesPrim(): Promise<void> {
		// In der Session gelöschte Übungen auch aus der DB löschen.
		for (let index = 0; index < this.cmpSession.UebungsListe.length; index++) {
			const mUebung = this.cmpSession.UebungsListe[index];
			const mSuchUebung = this.Session.UebungsListe.find((u) => u.ID === mUebung.ID);
			if (mSuchUebung === undefined)
				this.fDbModule.DeleteUebung(mUebung);
		}

		// In der Session gelöschte Sätze auch aus der DB löschen.
		for (let index = 0; index < this.cmpSession.UebungsListe.length; index++) {
			const mCmpUebung = this.cmpSession.UebungsListe[index];
			const mSuchUebung = this.Session.UebungsListe.find((u) => u.ID === mCmpUebung.ID);
			if (mSuchUebung !== undefined) {
				for (let mSatzIndex = 0; mSatzIndex < mCmpUebung.SatzListe.length; mSatzIndex++) {
					const mCmpSatz = mCmpUebung.SatzListe[mSatzIndex];
					if (mSuchUebung.SatzListe.find((mSuchSatz) => mSuchSatz.ID === mCmpSatz.ID) === undefined)
					this.fDbModule.DeleteSatz(mCmpSatz);
				}
			}
		}

		for (let index = 0; index < this.Session.UebungsListe.length; index++) {
			const mPtrUebung = this.Session.UebungsListe[index];
			mPtrUebung.ArbeitsSaetzeStatus = Uebung.StaticArbeitsSaetzeStatus(mPtrUebung);
		}

		this.fDbModule.SessionSpeichern(this.Session)
			.then((aSession: Session) => {
				// this.fDbModule.DoWorker();
				// const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
				// mSessionCopyPara.Komplett = true;
				// mSessionCopyPara.CopySessionID = true;
				// mSessionCopyPara.CopyUebungID = false;
				// mSessionCopyPara.CopySatzID = false;
				// this.cmpSession = aSession.Copy(mSessionCopyPara);
			});
	}

	public CancelChanges(aPara: SessionFormComponent, aNavRoute: string) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Cancel unsaved changes?");
		mDialogData.OkFn = (): void => {
			aPara.Session.resetSession(aPara.cmpSession);
			this.router.navigate([aNavRoute]);
		};

		this.fDialogService.JaNein(mDialogData);
	}

	public get Paused(): boolean {
		return this.Session.Kategorie02 === SessionStatus.Pause;
	}

	public SetPause(): void {
		this.Session.AddPause();
	}

	public GoAhead(): void {
		this.Session.StarteDauerTimer();
	}

	private DoAfterDone(aSessionForm: SessionFormComponent) {
		const mIndex = aSessionForm.fDbModule.AktuellesProgramm.SessionListe.findIndex((s) => s.ID === aSessionForm.Session.ID);
		if (mIndex > -1) aSessionForm.fDbModule.AktuellesProgramm.SessionListe.splice(mIndex, 1);
		
		aSessionForm.fDbModule.AktuellesProgramm.SessionListe = this.Programm.SessionListe;
		aSessionForm.fDbModule.AktuellesProgramm.NummeriereSessions();
		this.SaveChangesPrim().then(() => this.router.navigate(['/']));
		this.fDbModule.DoWorker(WorkerAction.LadeDiagrammDaten);
	}

	public async SetDone(): Promise<void> {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Workout will be saved and closed.");
		mDialogData.textZeilen.push("Do you want to proceed?");
		mDialogData.OkData = this;
		mDialogData.OkFn = async (aSessionForm: SessionFormComponent) => {
			const mSaveDialogData = new DialogData();
			mSaveDialogData.ShowAbbruch = false;
			mSaveDialogData.ShowOk = false;
			mSaveDialogData.textZeilen.push('Saving');
			try {
				this.fSavingDialog.Loading(mSaveDialogData);
				aSessionForm.Session.SetSessionFertig();
				if (aSessionForm.Session.UebungsListe.length > 0) {
					const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
					mSessionCopyPara.CopyUebungID = false;
					mSessionCopyPara.CopySatzID = false;
					const mNeueSession: Session = Session.StaticCopy(aSessionForm.Session,mSessionCopyPara);
					mNeueSession.init();
					this.fDbModule.InitSessionSaetze(aSessionForm.Session, mNeueSession as Session);
					if (mNeueSession.UebungsListe !== undefined){
						for (let index = 0; index < mNeueSession.UebungsListe.length; index++) {
							const mPtrNeueUebung: Uebung = mNeueSession.UebungsListe[index];
							mPtrNeueUebung.Failed = false;
							mPtrNeueUebung.WeightInitDate = MinDatum;
							
							if (mPtrNeueUebung.ArbeitsSatzListe !== undefined) {
								mPtrNeueUebung.ArbeitsSatzListe.forEach((sz) => {
									sz.GewichtAusgefuehrt = sz.GewichtNaechsteSession;
									sz.GewichtVorgabe = sz.GewichtNaechsteSession;
								});
							}//if						
						}//for
					}//if

					mNeueSession.FK_Programm = aSessionForm.Session.FK_Programm;
					mNeueSession.FK_VorlageProgramm = aSessionForm.Session.FK_VorlageProgramm;
					mNeueSession.Expanded = false;

					for (let index1 = 0; index1 < this.Programm.SessionListe.length; index1++) {
						const mPtrSession = this.Programm.SessionListe[index1];
						await this.fDbModule.CheckSessionSaetze(mPtrSession);
					}

					mNeueSession.UebungsListe.forEach((mQuellUebung) => {
						if (mQuellUebung.ArbeitsSatzListe && mQuellUebung.ArbeitsSatzListe.length > 0) {
							let mArbetisSatzListe: Array<Satz> = [];
							this.Programm.SessionListe.forEach( async (mSession) => {
								if (mSession.ID !== aSessionForm.Session.ID) {
									// Lade aus mSession alle Übungen die gleich mUebung sind
									mSession.UebungsListe.forEach((mDestUebung) => {
										const mDestArbeitsSatzPtrListe: Array<Satz> = mDestUebung.ArbeitsSatzListe;
										if (mDestUebung.FkUebung === mQuellUebung.FkUebung &&
											mDestUebung.FkProgress === mQuellUebung.FkProgress &&
											mDestUebung.ProgressGroup === mQuellUebung.ProgressGroup) {
											//
											for (let index = 0; index < mDestArbeitsSatzPtrListe.length; index++) {
												const mDestAbeitsSatzPtr: Satz = mDestArbeitsSatzPtrListe[index];
												let mQuellSatzPtr: Satz;
									
												if (mDestAbeitsSatzPtr.SatzListIndex < mQuellUebung.ArbeitsSatzListe.length)
													mQuellSatzPtr = mQuellUebung.ArbeitsSatzListe[mDestAbeitsSatzPtr.SatzListIndex];
												else
													mQuellSatzPtr = mQuellUebung.ArbeitsSatzListe[0];
										
												mDestAbeitsSatzPtr.GewichtNaechsteSession = mQuellSatzPtr.GewichtNaechsteSession;
												mDestAbeitsSatzPtr.GewichtAusgefuehrt = mQuellSatzPtr.GewichtNaechsteSession;
												mDestAbeitsSatzPtr.GewichtVorgabe = mQuellSatzPtr.GewichtNaechsteSession;
												mArbetisSatzListe.push(mDestAbeitsSatzPtr);
											}//for
										} else {
											mArbetisSatzListe = mDestUebung.ArbeitsSatzListe;
										}
									});//foreach

									if (mArbetisSatzListe.length > 0)
										this.fDbModule.SaetzeSpeichern(mArbetisSatzListe);
								}//if
							});
						}//if
					});

					this.Programm.SessionListe.push(mNeueSession);
					this.Programm.NummeriereSessions();
			
					// this.fDbModule.SessionSpeichern(aSessionForm.Session);				

					const mSessions: Array<Session> = [mNeueSession];
					for (let mSessionIndex = 0; mSessionIndex < mSessions.length; mSessionIndex++) {
						const mPtrSession: Session = mSessions[mSessionIndex];
						for (let mUebungIndex = 0; mUebungIndex < mPtrSession.UebungsListe.length; mUebungIndex++) {
							const mPtrUebung = mPtrSession.UebungsListe[mUebungIndex];
							// Fertig-Datum setzen
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
							
								mProgressPara.FailUebung = aSessionForm.Session.UebungsListe.find((u) => {
									if (u.FkUebung === mPtrUebung.FkUebung && u.ListenIndex === mPtrUebung.ListenIndex)
										return u;
									return undefined;
								});

								mProgressPara.ProgressID = mPtrUebung.FkProgress;
								mProgressPara.AlteProgressID = mPtrUebung.FkProgress;
								mProgressPara.ProgressListe = this.fDbModule.ProgressListe;
								mProgressPara.Progress = this.fDbModule.ProgressListe.find((p) => p.ID === mProgressPara.AusgangsUebung.FkProgress);

								if (mProgressPara.Progress.ProgressSet === ProgressSet.Last) {
									mProgressPara.SatzDone = mPtrUebung.ArbeitsSatzListe[mPtrUebung.ArbeitsSatzListe.length - 1].Status === SatzStatus.Fertig;
									mProgressPara.AusgangsSatz = mPtrUebung.ArbeitsSatzListe[mPtrUebung.ArbeitsSatzListe.length - 1];
								} else {
									mProgressPara.SatzDone = mPtrUebung.ArbeitsSatzListe[0].Status === SatzStatus.Fertig;
									mProgressPara.AusgangsSatz = mPtrUebung.ArbeitsSatzListe[0];
								}
							}//if
						}//for
					}//for

					const mProgrammExtraParaDB: ProgrammParaDB = new ProgrammParaDB();
					mProgrammExtraParaDB.SessionBeachten = true;
					mProgrammExtraParaDB.SessionParaDB = new SessionParaDB();
					mProgrammExtraParaDB.SessionParaDB.UebungenBeachten = true;
					mProgrammExtraParaDB.SessionParaDB.UebungParaDB = new UebungParaDB();
					mProgrammExtraParaDB.SessionParaDB.UebungParaDB.SaetzeBeachten = true;
					this.fDbModule.ProgrammSpeichern(this.Programm, mProgrammExtraParaDB);
					// this.fDbModule.SessionSpeichern(mNeueSession);
					this.DoAfterDone(this);
				}
			} finally {
				this.fSavingDialog.fDialog.closeAll();
			}

		}
		this.fDialogService.JaNein(mDialogData);
	}

	public PauseButtonVisible(): boolean {
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