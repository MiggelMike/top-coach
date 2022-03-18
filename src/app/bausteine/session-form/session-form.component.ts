import { ITrainingsProgramm } from './../../../Business/TrainingsProgramm/TrainingsProgramm';
import { ArbeitsSaetzeStatus, WdhVorgabeStatus } from './../../../Business/Uebung/Uebung';
import { UebungService } from "./../../services/uebung.service";
import { SessionStatus } from "./../../../Business/SessionDB";
import { ISession, Session } from "src/Business/Session/Session";
import { SessionStatsOverlayComponent } from "./../../session-stats-overlay/session-stats-overlay.component";
import { SessionOverlayServiceService, SessionOverlayConfig } from "./../../services/session-overlay-service.service";
import { DialogeService } from "./../../services/dialoge.service";
import { DexieSvcService, MinDatum, ProgrammParaDB } from "./../../services/dexie-svc.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DialogData } from "src/app/dialoge/hinweis/hinweis.component";
import { Location } from "@angular/common";
import { GlobalService } from "src/app/services/global.service";
import { Uebung, UebungsKategorie02 } from "src/Business/Uebung/Uebung";
import { UebungWaehlenData } from "src/app/uebung-waehlen/uebung-waehlen.component";
import { Progress, ProgressPara, ProgressSet } from 'src/Business/Progress/Progress';
import { Satz, SatzStatus } from 'src/Business/Satz/Satz';
import { NullVisitor } from '@angular/compiler/src/render3/r3_ast';

@Component({
	selector: "app-session-form",
	templateUrl: "./session-form.component.html",
	styleUrls: ["./session-form.component.scss"],
})
export class SessionFormComponent implements OnInit {
	public Session: Session;
	public AnzSessionInProgram: number = 0;
	public Programm: ITrainingsProgramm;
	public cmpSession: Session;
	public BodyWeight: number = 0;
	public fSessionStatsOverlayComponent: SessionStatsOverlayComponent = null;
	private fSessionOverlayConfig: SessionOverlayConfig;
	public DeletedExerciseList: Array<Uebung> = [];
	public DeletedSatzList: Array<Satz> = [];
	// private SelectedExerciseList: Array<Uebung> = [];

	constructor(
		private router: Router,
		public fDexieSvcService: DexieSvcService,
		private fDialogService: DialogeService,
		private fGlobalService: GlobalService,
		private fUebungService: UebungService,
		private fSessionOverlayServiceService: SessionOverlayServiceService,
		private location: Location
	) {
		const mNavigation = this.router.getCurrentNavigation();
		const mState = mNavigation.extras.state as { programm: ITrainingsProgramm, sess: Session; AnzSessionInProgram: number };
		mState.sess.BodyWeightAtSessionStart = this.fDexieSvcService.getBodyWeight();
		this.Programm = mState.programm;
		this.Session = mState.sess.Copy();
		this.cmpSession = mState.sess.Copy();
		this.AnzSessionInProgram = mState.AnzSessionInProgram;

		if (this.Session.Kategorie02 === SessionStatus.Pause || this.Session.Kategorie02 === SessionStatus.Wartet || this.Session.Kategorie02 === SessionStatus.Laueft) {
			if (this.Session.UebungsListe === undefined || this.Session.UebungsListe.length < 1) this.Session.AddPause();
			else this.Session.StarteDauerTimer();
		}

		this.fSessionOverlayConfig = {
			session: this.Session,
			left: -1000,
			top: -1000,
		} as SessionOverlayConfig;

		this.doStats();
	}

	doStats() {
		if (this.fSessionStatsOverlayComponent === null || this.fSessionStatsOverlayComponent.overlayRef === null)
			this.fSessionStatsOverlayComponent = this.fSessionOverlayServiceService.open(this.fSessionOverlayConfig);
		else this.fSessionStatsOverlayComponent.close();
	}

	ngOnDestroy() {
		if (this.fSessionStatsOverlayComponent) this.fSessionStatsOverlayComponent.close();
	}

	back() {
		if (this.Session.isEqual(this.cmpSession)) this.leave();
		else {
			const mDialogData = new DialogData();
			mDialogData.textZeilen.push("Cancel unsaved changes?");
			mDialogData.OkFn = (): void => this.leave();
			this.fDialogService.JaNein(mDialogData);
		}
	}

	AddExercise() {
		this.fUebungService.UebungWaehlen(
			this.fDexieSvcService.UebungListeSortedByName,
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
		this.location.back();
	}

	ngAfterViewInit() {
		this.cmpSession = this.Session.Copy();
	}

	ngOnInit(): void {
		this.BodyWeight = this.fDexieSvcService.getBodyWeight();
	}

	public SaveChanges(aPara: any) {
		(aPara as SessionFormComponent).SaveChangesPrim({ that: aPara });
		(aPara as SessionFormComponent).fDexieSvcService.EvalAktuelleSessionListe((aPara as SessionFormComponent).Session, aPara);
	}

	public SaveChangesPrim(aPara?: any): Promise<void> {
		const mSessionForm: SessionFormComponent = aPara.that as SessionFormComponent;
		
		const mSession: Session = mSessionForm.Session;
		const mCmpSession: Session = mSessionForm.cmpSession;

		// In der Session gelöschte Übungen auch aus der DB löschen.
		for (let index = 0; index < mCmpSession.UebungsListe.length; index++) {
			const mUebung = mCmpSession.UebungsListe[index];
			const mSuchUebung = mSession.UebungsListe.find((u) => u.ID === mUebung.ID);
			if (mSuchUebung === undefined)
				mSessionForm.fDexieSvcService.DeleteUebung(mUebung);
		}

		// In der Session gelöschte Sätze auch aus der DB löschen.
		for (let index = 0; index < mCmpSession.UebungsListe.length; index++) {
			const mCmpUebung = mCmpSession.UebungsListe[index];
			const mSuchUebung = mSession.UebungsListe.find((u) => u.ID === mCmpUebung.ID);
			if (mSuchUebung !== undefined) {
				for (let mSatzIndex = 0; mSatzIndex < mCmpUebung.SatzListe.length; mSatzIndex++) {
					const mCmpSatz = mCmpUebung.SatzListe[mSatzIndex];
					if (mSuchUebung.SatzListe.find((mSuchSatz) => mSuchSatz.ID === mCmpSatz.ID) === undefined)
					mSessionForm.fDexieSvcService.DeleteSatz(mCmpSatz);
				}
			}
		}

		for (let index = 0; index < mSession.UebungsListe.length; index++) {
			const mPtrUebung = mSession.UebungsListe[index];
			mPtrUebung.ArbeitsSaetzeStatus = mPtrUebung.getArbeitsSaetzeStatus();
		}

		if ((aPara !== undefined) && (aPara.DoProgressFn !== undefined)) 
			aPara.DoProgressFn(this.Session);
		

		return mSessionForm.fDexieSvcService.SessionSpeichern(mSessionForm.Session).then(() => {
			mSessionForm.cmpSession = mSessionForm.Session.Copy();
		});
				
		// if ((mSession.Kategorie02 === SessionStatus.Fertig) && (mSession.ProgressIsCalced === false)) {
		// 	mSession.ProgressIsCalced = true;
		// 	for (let mIndex = 0; mIndex < mSession.UebungsListe.length; mIndex++) {
		// 		const mUebung = mSession.UebungsListe[mIndex];
		// 		// Sofort zur nächsten Übung gehen, wenn keine Arbeitsätze vorhanden oder nicht alle fertig sind.  
		// 		if ((mUebung.ArbeitsSaetzeStatus === ArbeitsSaetzeStatus.KeinerVorhanden) ||
		// 			(mUebung.ArbeitsSaetzeStatus === ArbeitsSaetzeStatus.NichtAlleFertig))
		// 			continue;
				
		// 		const mProgress: Progress = mSessionForm.fDexieSvcService.ProgressListe.find((mFindProgress) =>
		// 			(mUebung.FkProgress !== undefined && mFindProgress.ID === mUebung.FkProgress)
		// 		);

		// 		if (mProgress) {
		// 			for (let index = 0; index < mUebung.ArbeitsSatzListe.length; index++) {
		// 				await mProgress.DetermineNextProgress(
		// 					mSessionForm.fDexieSvcService,
		// 					mSession.Datum,
		// 					mSession.FK_VorlageProgramm,
		// 					index,
		// 					mUebung
		// 				).then((mWeightProgress) => {
		// 					let mProgressWeight = 0;

		// 					switch (mWeightProgress) {
		// 						case WeightProgress.Increase:
		// 							mProgressWeight = mUebung.GewichtSteigerung;
		// 							break;

		// 						case WeightProgress.Decrease:
		// 							mProgressWeight = -mUebung.GewichtReduzierung;
		// 							break;
		// 					} // switch

		// 					if (mProgressWeight !== 0) {
		// 						const mAnstehendeSessions: Array<ISession> =
		// 							mSessionForm.fDexieSvcService.AktuellesProgramm.SessionListe
		// 								.filter((s) =>
		// 									// Session muss im Warte-Modus sein
		// 									(s.Kategorie02 === SessionStatus.Wartet) &&
		// 									// Die Uebung muss in der Session vorkommen.
		// 									(s.UebungsListe.findIndex((u: Uebung) => u.FkUebung === mUebung.FkUebung) > -1)
		// 								);

		// 						mAnstehendeSessions.forEach((s) => {
		// 							const mAnstehendeUebungen: Array<Uebung> = s.UebungsListe.filter((u: Uebung) => u.FkUebung === mUebung.FkUebung);
		// 							mAnstehendeUebungen.forEach((u) => {
		// 								u.ArbeitsSatzListe.forEach((sz) => {
		// 									sz.GewichtVorgabe += mProgressWeight;
		// 									sz.WdhAusgefuehrt = sz.GewichtVorgabe;
		// 								})
		// 								aPara.fDexieSvcService.SessionSpeichern(s).then(() => {
											
		// 								});
		// 							});
		// 						});
								
		// 					}
		// 				});
		// 			}//for
		// 		}//if 
		// 	}//for
		// }
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

	private async DoAfterDone(aSessionForm: SessionFormComponent) {
		const mIndex = aSessionForm.fDexieSvcService.AktuellesProgramm.SessionListe.findIndex((s) => s.ID === aSessionForm.Session.ID);
		if (mIndex > -1) aSessionForm.fDexieSvcService.AktuellesProgramm.SessionListe.splice(mIndex, 1);
		aSessionForm.fDexieSvcService.AktuellesProgramm.NummeriereSessions();
		try {
			
			await aSessionForm.fDexieSvcService.ProgrammSpeichern(aSessionForm.fDexieSvcService.AktuellesProgramm);
		} catch (error) {
			console.error(error);
		}
		this.router.navigate([""]);


		// await aSessionForm.fDexieSvcService.ProgrammSpeichern(aSessionForm.fDexieSvcService.AktuellesProgramm)
		// 	.then(() => this.router.navigate([""]));
	}

	public async SetDone(aSessionFormComponent: SessionFormComponent): Promise<void> {
		if (aSessionFormComponent.fSessionStatsOverlayComponent) aSessionFormComponent.fSessionStatsOverlayComponent.close();
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Workout will be saved and closed.");
		mDialogData.textZeilen.push("Do you want to proceed?");
		mDialogData.OkData = this;
		mDialogData.OkFn = (aSessionForm: SessionFormComponent) => {
			aSessionForm.Session.SetSessionFertig();

			this.SaveChangesPrim({ that: aSessionForm }).then( async () => {
				if (aSessionForm.Session.UebungsListe.length > 0) {
					const mNeueSession: Session = aSessionForm.Session.Copy(true);
					mNeueSession.init();
					this.fDexieSvcService.InitSessionSaetze(aSessionForm.Session, mNeueSession as Session);
					if(mNeueSession.UebungsListe !== undefined)
						mNeueSession.UebungsListe.forEach((u) => u.ReduceDate = MinDatum);

					mNeueSession.FK_Programm = aSessionForm.Session.FK_Programm;
					mNeueSession.FK_VorlageProgramm = aSessionForm.Session.FK_VorlageProgramm;
					mNeueSession.Expanded = false;
					this.Programm.SessionListe.push(mNeueSession);
					this.Programm.NummeriereSessions();
					await this.fDexieSvcService.SessionSpeichern(mNeueSession);

					for (let mUebungIndex = 0; mUebungIndex < aSessionForm.Session.UebungsListe.length; mUebungIndex++) {
						const mPtrUebung = aSessionForm.Session.UebungsListe[mUebungIndex];
						if (mPtrUebung.ArbeitsSatzListe.length > 0) {
							if (mPtrUebung.FkProgress !== undefined)
							{
								const mProgressPara: ProgressPara = new ProgressPara();
								mProgressPara.SessionDone = true;
								mProgressPara.DbModule = this.fDexieSvcService;
								mProgressPara.Programm = this.Programm;
								mProgressPara.AusgangsSession = aSessionForm.Session;
								mProgressPara.AlleSaetze = true;
								mProgressPara.ProgressHasChanged = false;
								mProgressPara.AusgangsUebung = mPtrUebung;
								
								mProgressPara.ProgressID = mPtrUebung.FkProgress;
								mProgressPara.AlteProgressID = mPtrUebung.FkProgress;
								
								mProgressPara.ProgressListe = this.fDexieSvcService.ProgressListe;
								mProgressPara.Progress = this.fDexieSvcService.ProgressListe.find((p) => p.ID === mProgressPara.AusgangsUebung.FkProgress);

								if (mProgressPara.Progress.ProgressSet === ProgressSet.Last) {
									mProgressPara.SatzDone = mPtrUebung.ArbeitsSatzListe[mPtrUebung.ArbeitsSatzListe.length-1].Status === SatzStatus.Fertig;
									mProgressPara.AusgangsSatz = mPtrUebung.ArbeitsSatzListe[mPtrUebung.ArbeitsSatzListe.length-1];
								} else {
									mProgressPara.SatzDone = mPtrUebung.ArbeitsSatzListe[0].Status === SatzStatus.Fertig;
									mProgressPara.AusgangsSatz = mPtrUebung.ArbeitsSatzListe[0];
								}

								// if(Progress.StaticProgressEffectsRunningSession(mPtrUebung.FkProgress, mProgressPara) === false)
								if (mUebungIndex >= aSessionForm.Session.UebungsListe.length - 1) {
									await Progress.StaticDoProgress(mProgressPara).then(() =>
										this.DoAfterDone(aSessionFormComponent)
									);
								} else
									await Progress.StaticDoProgress(mProgressPara);
							}//if
						}
					}//for
				} else this.DoAfterDone(aSessionFormComponent);
			});
		}
		this.fDialogService.JaNein(mDialogData);
	}

	public PauseButtonVisible(): boolean {
		return this.Session.Kategorie02 !== SessionStatus.Fertig && this.Session.Kategorie02 !== SessionStatus.FertigTimeOut;
	}
}
