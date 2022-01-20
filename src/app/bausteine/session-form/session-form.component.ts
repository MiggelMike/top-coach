import { ITrainingsProgramm } from './../../../Business/TrainingsProgramm/TrainingsProgramm';
import { ArbeitsSaetzeStatus } from './../../../Business/Uebung/Uebung';
import { UebungService } from "./../../services/uebung.service";
import { SessionStatus } from "./../../../Business/SessionDB";
import { ISession, Session } from "src/Business/Session/Session";
import { SessionStatsOverlayComponent } from "./../../session-stats-overlay/session-stats-overlay.component";
import { SessionOverlayServiceService, SessionOverlayConfig } from "./../../services/session-overlay-service.service";
import { DialogeService } from "./../../services/dialoge.service";
import { DexieSvcService } from "./../../services/dexie-svc.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DialogData } from "src/app/dialoge/hinweis/hinweis.component";
import { Location } from "@angular/common";
import { GlobalService } from "src/app/services/global.service";
import { Uebung, UebungsKategorie02 } from "src/Business/Uebung/Uebung";
import { UebungWaehlenData } from "src/app/uebung-waehlen/uebung-waehlen.component";
import { Progress } from 'src/Business/Progress/Progress';

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
		this.Session.UebungsListe.push(mSessUebung);
	}

	leave() {
		this.fDexieSvcService.LadeAktuellesProgramm(
			() => {
				this.location.back();
			}
			
		 );
		
	}

	ngAfterViewInit() {
		this.cmpSession = this.Session.Copy();
	}

	ngOnInit(): void {
		this.BodyWeight = this.fDexieSvcService.getBodyWeight();
	}

	public SaveChanges(aPara: any) {
		(aPara as SessionFormComponent).SaveChangesPrim(aPara);
	}

	public async SaveChangesPrim(aPara: any) {
		const mSessionForm: SessionFormComponent = aPara as SessionFormComponent;
		mSessionForm.fDexieSvcService.EvalAktuelleSessionListe(mSessionForm.Session);

		const mSession: Session = aPara.Session;
		const mCmpSession: Session = aPara.cmpSession;

		// Die aus der Session gelöschten Übungen auch aus der DB löschen.
		for (let index = 0; index < mCmpSession.UebungsListe.length; index++) {
			const mUebung = mCmpSession.UebungsListe[index];
			const mSuchUebung = mSession.UebungsListe.find((u) => u.ID === mUebung.ID);
			if (mSuchUebung === undefined) aPara.fDexieSvcService.UebungTable.delete(mUebung.ID);
		}

		


		await aPara.fDexieSvcService.SessionSpeichern(aPara.Session).then(() => {
			aPara.cmpSession = aPara.Session.Copy();
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

	public SetDone(): void {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push("Workout will be saved and closed.");
		mDialogData.textZeilen.push("Do you want to proceed?");
		mDialogData.OkFn = (): void => {
			this.fSessionStatsOverlayComponent.sess.SetSessionFertig();
			
			this.SaveChangesPrim(this).then(() => {


				// this.fDexieSvcService.LadeProgress(
				// 	(mProgressListe: Array<Progress>) => {
				// 	const mProgress:Progress = mProgressListe.find((p) => p.ID === this.sessUebung.FkProgress);
				// 	// this.Progress = mProgressListe.find((p) => p.ID === this.sessUebung.FkAltProgress);
				// 	// Sätze der aktuellen Übung durchnummerieren
				// 	for (let index = 0; index < this.sessUebung.SatzListe.length; index++) {
				// 		const mPtrSatz: Satz = this.sessUebung.SatzListe[index];
				// 		mPtrSatz.SatzListIndex = index;
				// 	}
		
				// 	// Hole alle Sätze aus der aktuellen Session die aktuelle Übung mehrfach vorkommt
				// 	//   Aus der Satzliste der aktuellen Übung die Sätze mit dem Status "Wartet" in mSatzliste sammeln
				// 	const mSatzListe = this.sess.AlleUebungsSaetzeEinerProgressGruppe(this.sessUebung, SatzStatus.Wartet);
				// 	// const mSatzListe = this.sessUebung.SatzListe.filter((sz) => (sz.SatzListIndex > aSatz.SatzListIndex && sz.Status === SatzStatus.Wartet));
				// 	const mSessionsListe: Array<Session> = this.fDbModule.UpComingSessionList();
		
				// 	if (this.Progress) {
				// 		if (   (this.rowNum === 0)
				// 			&& (this.Progress.ProgressTyp === ProgressTyp.BlockSet)
				// 			&& (this.Progress.ProgressSet === ProgressSet.First)) {
				// 			this.Progress.DetermineNextProgress(this.fDbModule, new Date, this.sess.FK_VorlageProgramm, this.rowNum, this.sessUebung)
				// 				.then((wp: WeightProgress) => {
				// 					const mProgressPara: ProgressPara = new ProgressPara();
				// 					mProgressPara.AusgangsSession = this.sess;
				// 					mProgressPara.AusgangsUebung = this.sessUebung;
				// 					mProgressPara.AusgangsSatz = aSatz as Satz;
				// 					mProgressPara.DbModule = this.fDbModule;
				// 					mProgressPara.Programm = this.programm;
				// 					mProgressPara.Progress = this.Progress;
				// 					mProgressPara.Wp = wp;
				// 					mProgressPara.Storno = false;
				// 					mProgressPara.SatzUndone = false;
				// 					Progress.StaticProgrammSetNextWeight(mProgressPara);
				// 				});
				// 		}
				// 	}
				// });




				// Die Session ist abgeschlossen und kann daher sofort aus der Liste der anstehenden Sessions gelöscht werden.
				const mIndex = this.fDexieSvcService.AktuellesProgramm.SessionListe.findIndex( (s) => s.ID === this.Session.ID);
				if (mIndex > -1) this.fDexieSvcService.AktuellesProgramm.SessionListe.splice(mIndex, 1);

				this.router.navigate([""]);
			});
		};

		this.fDialogService.JaNein(mDialogData);

	}

	public PauseButtonVisible(): Boolean {
		return this.Session.Kategorie02 !== SessionStatus.Fertig && this.Session.Kategorie02 !== SessionStatus.FertigTimeOut;
	}
}
