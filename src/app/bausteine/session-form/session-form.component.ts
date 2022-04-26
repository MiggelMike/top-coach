import { ITrainingsProgramm } from './../../../Business/TrainingsProgramm/TrainingsProgramm';
import { ArbeitsSaetzeStatus, WdhVorgabeStatus } from './../../../Business/Uebung/Uebung';
import { UebungService } from "./../../services/uebung.service";
import { SessionStatus } from "./../../../Business/SessionDB";
import { ISession, Session } from "src/Business/Session/Session";
import { SessionStatsOverlayComponent } from "./../../session-stats-overlay/session-stats-overlay.component";
import { SessionOverlayServiceService, SessionOverlayConfig } from "./../../services/session-overlay-service.service";
import { DialogeService } from "./../../services/dialoge.service";
import { DexieSvcService, MinDatum, ProgrammParaDB, UebungParaDB } from "./../../services/dexie-svc.service";
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
	// public AnzSessionInProgram: number = 0;
	public Programm: ITrainingsProgramm;
	public programmTyp: string = '';
	public cmpSession: Session;
	public BodyWeight: number = 0;
	public fSessionStatsOverlayComponent: SessionStatsOverlayComponent = null;
	private fSessionOverlayConfig: SessionOverlayConfig;
	public DeletedExerciseList: Array<Uebung> = [];
	public DeletedSatzList: Array<Satz> = [];
	// private SelectedExerciseList: Array<Uebung> = [];

	constructor(
		private router: Router,
		public fDbModule: DexieSvcService,
		private fDialogService: DialogeService,
		private fGlobalService: GlobalService,
		private fUebungService: UebungService,
		private fSessionOverlayServiceService: SessionOverlayServiceService,
		private location: Location
	) {
		const mNavigation = this.router.getCurrentNavigation();
		const mState = mNavigation.extras.state as { programm: ITrainingsProgramm, sess: Session, programmTyp: string };
		mState.sess.BodyWeightAtSessionStart = this.fDbModule.getBodyWeight();
		this.programmTyp = mState.programmTyp;
		this.Programm = mState.programm;
		this.Session = mState.sess.Copy(true,true);

		
		if ( (this.Session.ID !== undefined) && ((this.Session.UebungsListe === undefined) || (this.Session.UebungsListe.length <= 0))) {
			const mUebungParaDB: UebungParaDB = new UebungParaDB();
			mUebungParaDB.SaetzeBeachten = true;
			this.fDbModule.LadeSessionUebungen(this.Session.ID,mUebungParaDB).then(
				(aUebungsListe) => {
					this.Session.UebungsListe = aUebungsListe;
				    this.cmpSession = this.Session.Copy(true, true);
				})
		}
		else this.cmpSession = mState.sess.Copy(true,true);

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
			mDialogData.textZeilen.push("Save changes?");
			mDialogData.ShowAbbruch = true;
			
			mDialogData.OkFn = (): void => {
				this.leave();
				this.SaveChangesPrim({ that: this });
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
		this.location.back();
	}

	ngAfterViewInit() {
		this.cmpSession = this.Session.Copy(true,true);
	}

	ngOnInit(): void {
		this.BodyWeight = this.fDbModule.getBodyWeight();
	}

	public SaveChanges(aPara: any) {
		(aPara as SessionFormComponent).SaveChangesPrim({
			that: aPara
			// EvalFn: () => {
			// 	const mSessionForm: SessionFormComponent = aPara as SessionFormComponent;
			// 	mSessionForm.fDexieSvcService.EvalAktuelleSessionListe(mSessionForm.Session, aPara).then(
			// 		() => {
			// 			mSessionForm.cmpSession = mSessionForm.Session.Copy();
			// 		});
			// }
	    });
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
				mSessionForm.fDbModule.DeleteUebung(mUebung);
		}

		// In der Session gelöschte Sätze auch aus der DB löschen.
		for (let index = 0; index < mCmpSession.UebungsListe.length; index++) {
			const mCmpUebung = mCmpSession.UebungsListe[index];
			const mSuchUebung = mSession.UebungsListe.find((u) => u.ID === mCmpUebung.ID);
			if (mSuchUebung !== undefined) {
				for (let mSatzIndex = 0; mSatzIndex < mCmpUebung.SatzListe.length; mSatzIndex++) {
					const mCmpSatz = mCmpUebung.SatzListe[mSatzIndex];
					if (mSuchUebung.SatzListe.find((mSuchSatz) => mSuchSatz.ID === mCmpSatz.ID) === undefined)
					mSessionForm.fDbModule.DeleteSatz(mCmpSatz);
				}
			}
		}

		for (let index = 0; index < mSession.UebungsListe.length; index++) {
			const mPtrUebung = mSession.UebungsListe[index];
			mPtrUebung.ArbeitsSaetzeStatus = mPtrUebung.getArbeitsSaetzeStatus();
		}

		if ((aPara !== undefined) && (aPara.DoProgressFn !== undefined)) 
			aPara.DoProgressFn(this.Session);
		
		return mSessionForm.fDbModule.SessionSpeichern(mSession)
			// return mSessionForm.fDexieSvcService.SessionSpeichern(mSessionForm.Session)
			.then((aSession:Session) => {
				// if (aPara !== undefined)
				// 	aPara.EvalFn();
				// else mSessionForm.cmpSession = mSessionForm.Session.Copy();
				mSessionForm.cmpSession = aSession.Copy(true,true);
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

	private async DoAfterDone(aSessionForm: SessionFormComponent) {
		const mIndex = aSessionForm.fDbModule.AktuellesProgramm.SessionListe.findIndex((s) => s.ID === aSessionForm.Session.ID);
		if (mIndex > -1) aSessionForm.fDbModule.AktuellesProgramm.SessionListe.splice(mIndex, 1);
		
		aSessionForm.fDbModule.AktuellesProgramm.NummeriereSessions();
		try {
			this.SaveChangesPrim({ that: aSessionForm });

			
		} catch (error) {
			console.error(error);
		}


		// await aSessionForm.fDexieSvcService.ProgrammSpeichern(aSessionForm.fDexieSvcService.AktuellesProgramm)
		// 	.then(() => this.router.navigate([""]));
	}

	public async SetDone(aSessionFormComponent: SessionFormComponent): Promise<void> {
		if (aSessionFormComponent.fSessionStatsOverlayComponent) aSessionFormComponent.fSessionStatsOverlayComponent.close();
		
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Workout will be saved and closed.");
		mDialogData.textZeilen.push("Do you want to proceed?");
		mDialogData.OkData = this;
		mDialogData.OkFn = async (aSessionForm: SessionFormComponent) => {
			aSessionForm.Session.SetSessionFertig();
			
			if (aSessionForm.Session.UebungsListe.length > 0) {
				const mNeueSession: Session = aSessionForm.Session.Copy(true);
				mNeueSession.init();
				this.fDbModule.InitSessionSaetze(aSessionForm.Session, mNeueSession as Session);
				if(mNeueSession.UebungsListe !== undefined)
					mNeueSession.UebungsListe.forEach((u) => {
						u.Failed = false;
						u.WeightInitDate = MinDatum;
						if (u.ArbeitsSatzListe !== undefined) {
							u.ArbeitsSatzListe.forEach((sz) => {
								sz.GewichtAusgefuehrt = sz.GewichtNaechsteSession;
								sz.GewichtVorgabe = sz.GewichtNaechsteSession;
							});
						}//if
					});

				mNeueSession.FK_Programm = aSessionForm.Session.FK_Programm;
				mNeueSession.FK_VorlageProgramm = aSessionForm.Session.FK_VorlageProgramm;
				mNeueSession.Expanded = false;
				this.Programm.SessionListe.push(mNeueSession);
				this.Programm.NummeriereSessions();
				
				// this.Programm.SessionListe.find((aSess) => {
				// 	if (aSess.ID === aSessionForm.Session.ID)
				// 		aSessionForm.Session.ListenIndex = aSess.ListenIndex;
				// });

				await this.fDbModule.SessionSpeichern(aSessionForm.Session);				

				const mSessions: Array<Session> = [mNeueSession];
				for (let mSessionIndex = 0; mSessionIndex < mSessions.length; mSessionIndex++) {
					const mPtrSession: Session = mSessions[mSessionIndex];
					for (let mUebungIndex = 0; mUebungIndex < mPtrSession.UebungsListe.length; mUebungIndex++) {
						const mPtrUebung = mPtrSession.UebungsListe[mUebungIndex];
						// Fertig-Datum setzen
						if (   mPtrUebung.ArbeitsSatzListe.length > 0 
							&& mPtrUebung.FkProgress !== undefined)
						{
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
							// await Progress.StaticDoProgress(mProgressPara);
						}//if
					}//for
				}//for
				// if (   mSessionIndex >= mSessions.length - 1 
				// 	&& mUebungIndex >= aSessionForm.Session.UebungsListe.length - 1
				//    )
				await this.fDbModule.SessionSpeichern(mNeueSession);
				this.router.navigate([""]);
			}
			this.DoAfterDone(aSessionFormComponent);
		}
		this.fDialogService.JaNein(mDialogData);
	}

	public PauseButtonVisible(): boolean {
		return this.Session.Kategorie02 !== SessionStatus.Fertig && this.Session.Kategorie02 !== SessionStatus.FertigTimeOut;
	}
}
