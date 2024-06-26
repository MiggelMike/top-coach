import { DateFormatTyp, Datum } from './../../../Business/Datum';
import { HistorySession, ISession, NoResetTyp } from "src/Business/Session/Session";
import { ISessionDB, SessionDB } from "./../../../Business/SessionDB";
import { SessionStatus } from "../../../Business/SessionDB";
import { UebungWaehlenData } from "./../../uebung-waehlen/uebung-waehlen.component";
import { UebungsKategorie02 } from "./../../../Business/Uebung/Uebung";
import { DexieSvcService, onDeleteFn, ProgrammParaDB, SatzParaDB, SessionCopyPara, UebungParaDB } from "./../../services/dexie-svc.service";
import { Session } from "./../../../Business/Session/Session";
import { ITrainingsProgramm, TrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Output, EventEmitter, Component, OnInit, Input, ViewChildren, QueryList, ViewEncapsulation } from "@angular/core";
import { MatAccordion, MatExpansionPanel } from "@angular/material/expansion";
import { DialogeService } from "./../../services/dialoge.service";
import { cLoadingDefaultHeight, DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { Observable, min, of } from "rxjs";
import { Uebung } from "src/Business/Uebung/Uebung";
import { UebungService } from "src/app/services/uebung.service";
import { Router } from "@angular/router";
import { Satz } from "src/Business/Satz/Satz";
import { IProgramModul, ProgramModulTyp } from "src/app/app.module";

@Component({
	selector: "app-programm02",
	templateUrl: "./programm02.component.html",
	styleUrls: ["./programm02.component.scss"],
	// encapsulation: ViewEncapsulation.None
})
export class Programm02Component implements OnInit, IProgramModul {
	@Input() programm: ITrainingsProgramm = null;
	@Input() SessionListe: Array<ISession> = [];
	@Output() ProgrammSavedEvent = new EventEmitter<ITrainingsProgramm>();
	@Output() OnLeaveFn = new EventEmitter();
	@Output() IsExpandedFn = new EventEmitter<Boolean>();
	@Input() showButtons: Boolean = false;
	@Input() showSaveButtons: Boolean = false;
	@Input() SofortSpeichern: Boolean = false;
	@Input() bearbeitbar: Boolean = false;
	@Input() StartButtonVisible: boolean = false;
	@Input() SessionPanelsExpanded: boolean = false;
	@Input() showWarmUpCheckBox: Boolean = true;
	@Input() showCoolDownCheckBox: Boolean = true;
	@Input() DeletedSatzList: Array<Satz> = [];
	@Input() SessionNameVisible: Boolean = false;
	@ViewChildren("accSession") accSession: QueryList<MatAccordion>;
	@ViewChildren("panSession") panUebung: QueryList<MatExpansionPanel>;
	
	private CmpSessionListe: Array<ISession> = [];
	public isExpanded: Boolean = true;
	private DelSessionListe: Array<ISession> = [];
	public ToggleButtonText: string;
	public ClickData: Programm02Component;
	ViewInitDone: boolean = false;
	private SessionListObserver: Observable<Array<ISession>>;

	get MediaWidth():number {
		return window.innerWidth;
	}

	drop(event: any) {
		//const mEvent = event as CdkDragDrop<ISession[]>;
		if (DexieSvcService.CalcPosAfterDragAndDrop(this.programm.SessionListe, event) === true) {
			this.programm.NummeriereSessions();
			this.SaveChanges();
		}
	 }
	
	GestartedWann(aSess: Session): string{
		return Datum.StaticFormatDate(aSess.GestartedWann, DateFormatTyp.KomplettOhneSekunden);
	}

	
	DoSessionName(aSess:ISession, aEvent: any) {
		aSess.Name = aEvent.target.value;
		this.fDbModule.SessionSpeichern(aSess as Session);
	}

	public StartButtonText(aSess: ISession): string {
		if (aSess.Kategorie02 === undefined) aSess.Kategorie02 = SessionStatus.Wartet;

		switch (aSess.Kategorie02) {
			case SessionStatus.Wartet: 
				return "Start";
			case SessionStatus.Laeuft:
			case SessionStatus.Pause:
				return "Go ahead";
			case SessionStatus.Fertig:
			case SessionStatus.FertigTimeOut:
				return "View";
			default:
				return "?";
		}
	}

	public SessionWartet(aSess: ISession): boolean{
		return (aSess.Kategorie02 === SessionStatus.Wartet);
	}

	constructor(
		private fDialogService: DialogeService,
		private fGlobalService: GlobalService,
		private fUebungService: UebungService,
		public fDbModule: DexieSvcService,
		private fLoadingDialog: DialogeService,
		private router: Router)
	{
	}

	get programModul(): typeof ProgramModulTyp {
		return ProgramModulTyp;
	}

	get ModulTyp(): ProgramModulTyp {
		return DexieSvcService.ModulTyp;
	}

	ProgrammName(aSess: Session): string{
		if (this.ModulTyp === ProgramModulTyp.History)
			return (aSess as HistorySession).ProgrammName;
		return '';
	}

	private async LadeUebungen(aSess: ISession): Promise<void>  {
		const mDialogData = new DialogData();
		mDialogData.height = cLoadingDefaultHeight;
        mDialogData.ShowAbbruch = false;
        mDialogData.ShowOk = false;
        mDialogData.textZeilen.push('Loading exercises');
		this.fLoadingDialog.Loading(mDialogData);
		try {

			const mUebungPara: UebungParaDB = new UebungParaDB();
			mUebungPara.WhereClause = 'SessionID';
			mUebungPara.anyOf = () => { 
				return aSess.ID;
			};

			// mUebungPara.SaetzeBeachten = true;

			this.fDbModule.LadeSessionUebungenEx(aSess, mUebungPara)
				.then((aUebungsliste) => {
					if (aUebungsliste.length > 0) {
						aSess.UebungsListe = aUebungsliste;
					}
					this.fLoadingDialog.fDialog.closeAll();
				});
		} catch(err) {
			this.fLoadingDialog.fDialog.closeAll();
		}
	}
		
	
	panelOpened(aSess: ISession) {
		aSess.Expanded = true;

		if (DexieSvcService.ModulTyp === ProgramModulTyp.CreateWorkout)
			return;

		if (aSess.UebungsListe === undefined || aSess.UebungsListe.length <= 0) {
			this.LadeUebungen(aSess);
		}
	}

	panelClosed(aSess: ISession) {
		aSess.Expanded = false;
	}

	ngAfterViewInit() {
		// if (this.programmTyp === "history") {
		// 	this.fDbModule.LadeHistorySessions().then(
		// 		(aSessionListe) => {
		// 			this.SessionListe = aSessionListe;
		// 		}
		// 	);
		// }
	    // else {

		// 	const mProgrammPara: ProgrammParaDB = new ProgrammParaDB();
		// 	mProgrammPara.WhereClause = { id: this.programm.id };
		// 	this.fDbModule.LadeProgrammeEx(mProgrammPara).then((aPogramme) => {
		// 		if (aPogramme.length > 0)
		// 			this.programm = aPogramme[0] as ITrainingsProgramm;
		// 		this.SessionListe = this.programm.SessionListe;
		// 	});
		// }
		this.panUebung.forEach((pan) => {
			pan.expanded = this.SessionPanelsExpanded;
		});
		this.ViewInitDone = true;
	}

	ngOnInit() {
		this.SessionListObserver = of(this.SessionListe);
		this.CmpSessionListe = this.SessionListe;
	}

	public DeleteSession(aEvent: any, aSession: ISession, aRowNum: number) {
		aEvent.stopPropagation();
		this.DeleteSessionPrim(
			aSession,
			aRowNum,
			() => {
				const index: number = this.SessionListe.indexOf(aSession);
				if (index !== -1) 
					this.SessionListe.splice(index, 1);
				
				for (let index = 0; index < this.SessionListe.length; index++) 
					this.SessionListe[index].ListenIndex = index;
				
				this.fDbModule.DeleteSession(aSession as Session);
			}
		);
	}

	public DeleteAusAnstehendeSessions(aEvent: any, aSession: ISession, aRowNum: number) {
		aEvent.stopPropagation();
		this.DeleteSessionPrim(
			aSession,
			aRowNum,
			() => {
				aSession.Kategorie02 = SessionStatus.Loeschen;
                if(DexieSvcService.AktuellesProgramm && DexieSvcService.AktuellesProgramm.SessionListe) {
                const mSess: ISession = DexieSvcService.AktuellesProgramm.SessionListe.find( (s) => s.ID === aSession.ID);
                if (mSess) {
                    const mIndex = DexieSvcService.AktuellesProgramm.SessionListe.indexOf(mSess);
                    DexieSvcService.AktuellesProgramm.SessionListe.splice(mIndex, 1);
                }
            }
				this.fDbModule.EvalAktuelleSessionListe(aSession as Session);
		});
	}

	public get SortedSessionListe(): Array<Session> {
		let mResult: Array<Session> = [];
		if (this.ModulTyp === ProgramModulTyp.History) mResult = this.SessionListe as Array<Session>;
		else mResult = this.fDbModule.SortSessionByListenIndex(this.SessionListe as Array<Session>) as Array<Session>;
		return mResult;
    }
	
	private DeleteSessionPrim(aSession: ISession, aRowNum: number, aOnDelete: onDeleteFn ) {
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push(`Delete session #${aRowNum} "${aSession.Name}" ?`);
		mDialogData.OkFn = () => aOnDelete();
		this.fDialogService.JaNein(mDialogData);
	}

	// Wird an "AddExercise" als Parameter uebergeben
	private SelectUebungDelegate(aUebungWaehlenData: UebungWaehlenData) {
		aUebungWaehlenData.fUebungsListe.forEach((mUebung) => {
			if (mUebung.Selected) {
				aUebungWaehlenData.fSession.addUebung(
					Uebung.StaticKopiere(
						this.fDbModule,
						mUebung,
						UebungsKategorie02.Session));
			}
		});
		aUebungWaehlenData.fMatDialog.close();
	}

	public AddExercise(aSession: ISession) {
		if (DexieSvcService.StammUebungsListe.length === 0) this.fDbModule.LadeStammUebungen();
		else this.fUebungService.UebungWaehlen(aSession as Session, this.SelectUebungDelegate);
	}

	CopySession(aSession: ISession) {
		const mSessionCopyPara: SessionCopyPara = new SessionCopyPara();
		mSessionCopyPara.CopySatzID = false;
		mSessionCopyPara.CopySessionID = false;
		mSessionCopyPara.CopyUebungID = false;
		DexieSvcService.SessionCopy = Session.StaticCopy(aSession, mSessionCopyPara);
	}

	public PasteExcercise(aSession: ISession) {
		if (this.fGlobalService.SessUebungKopie === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("Nothing to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSessUebung: Uebung = this.fGlobalService.SessUebungKopie.Copy();
		mSessUebung.SessionID = aSession.ID;
		aSession.addUebung(mSessUebung);
	}


	public toggleSessions(): void {
		if (!this.accSession) return;

		if (this.isExpanded) {
			this.accSession.forEach((acc) => acc.closeAll());
			this.isExpanded = false;
			this.ToggleButtonText = "Open all sessions";
		} else {
			this.accSession.forEach((acc) => acc.openAll());
			this.isExpanded = true;
			this.ToggleButtonText = "Close all Sessions";
		}
		this.IsExpandedFn.emit(this.isExpanded);
	}

	public accCheckSessionPanels() {
		if (!this.panUebung) return;

		let mAllClosed = true;

		const mPanUebungListe = this.panUebung.toArray();
		for (let index = 0; index < mPanUebungListe.length; index++) {
			if (mPanUebungListe[index].expanded) {
				mAllClosed = false;
				break;
			}
		}

		if (mAllClosed) {
			this.isExpanded = false;
			this.ToggleButtonText = "Open all sessions";
		} else {
			this.isExpanded = true;
			this.ToggleButtonText = "Close all sessions";
		}
	}

	public AddSession() {
		const mDate = new Date();
		const mSession: ISession = new Session();
		mSession.Name = `Session ${mDate.toLocaleString()}`;
		mSession.Datum = new Date();
		mSession.DauerInSek = 0;
		mSession.SessionNr = this.SessionListe.length + 1;
		mSession.Kategorie01 = SessionStatus.Bearbeitbar;
		mSession.ListenIndex = this.SessionListe.length;
		mSession.FK_Programm = this.programm.id;
		this.SessionListe.push(mSession);
	}

	public PasteSession() {
		if (DexieSvcService.SessionCopy  === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("No session data to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSessionCopyPara = new SessionCopyPara();
		mSessionCopyPara.Komplett = true;
		mSessionCopyPara.CopySessionID = false;
		mSessionCopyPara.CopyUebungID = false;
		mSessionCopyPara.CopySatzID = false;
		const mSessionDB: ISessionDB = Session.StaticCopy(DexieSvcService.SessionCopy,mSessionCopyPara);
		//mSession.FK_Programm = this.programmID;
		this.SessionListe.push(mSessionDB as Session);

		if (DexieSvcService.ModulTyp === ProgramModulTyp.SelectWorkout) 
			this.fDbModule.SessionSpeichern(new Session(mSessionDB));
	}

	private startSessionPrim(aSession: ISession, aRegularSession: boolean) {

		// if (aSession.Kategorie02 === SessionStatus.Fertig || aSession.Kategorie02 === SessionStatus.FertigTimeOut) return;

		
		// const mSessionParaDB: SessionParaDB = new SessionParaDB();
		// mSessionParaDB.UebungenBeachten = true;
		// mSessionParaDB.UebungParaDB = new UebungParaDB();
		// mSessionParaDB.UebungParaDB.SaetzeBeachten = true;
		// this.fDbModule.LadeEineSession(aSession.ID, mSessionParaDB)
		// .then((aLoadedSession) => {
		// 		switch (aLoadedSession.Kategorie02) {
		// 			case SessionStatus.Wartet:
		// 				aLoadedSession.GestartedWann = new Date();
		// 				aLoadedSession.Kategorie02 = SessionStatus.Laeuft;
		// 				aLoadedSession.Datum = new Date();
		// 				break;
		
		// 			case SessionStatus.Pause:
		// 				aLoadedSession.StarteDauerTimer();
		// 				break;
		// 		}
		// 	});
		
		// if (this.OnLeaveFn !== undefined)
		// 	this.OnLeaveFn.emit();

		if (aRegularSession) {
			const mDialogData = new DialogData();
			mDialogData.height = cLoadingDefaultHeight;
			mDialogData.ShowAbbruch = false;
			mDialogData.ShowOk = false;
		
			if (this.ModulTyp === ProgramModulTyp.History) mDialogData.textZeilen.push('Preparing history');
			else mDialogData.textZeilen.push('Preparing session');
			const mLadePara: UebungParaDB = new UebungParaDB();
			mLadePara.SaetzeBeachten = true;
			this.router.navigate(["sessionFormComponent"], { state: { programm: this.programm, sess: aSession, ModulTyp: ProgramModulTyp.RunningSession } });
			//this.fLoadingDialog.Loading(mDialogData);
			//try {
				// aSession.UebungsListe.forEach( async(mUebung) => {
				// 	if (mUebung.SatzListe.length === 0)
				// 		mUebung.SatzListe = await this.fDbModule.LadeUebungsSaetze(mUebung.ID);
				// 	mUebung.Expanded = false;
				
				// });
				// this.fLoadingDialog.fDialog.closeAll();
				// this.router.navigate(["sessionFormComponent"], { state: { programm: this.programm, sess: aSession, programmTyp: this.programmTyp } });

			//	this.router.navigate(["sessionFormComponent"], { state: { programm: this.programm, sess: aSession, ModulTyp: this.ModulTyp } });
				// aSession.UebungsListe = [];
				// this.fDbModule.LadeSessionUebungen(aSession.ID, mLadePara).then
				// 	((aUebungsListe) => {
				// 		this.fLoadingDialog.fDialog.closeAll();
				// 		aSession.UebungsListe = aUebungsListe;
				// 		aUebungsListe.forEach((mUebung) => mUebung.Expanded = false);
				// 		this.router.navigate(["sessionFormComponent"], { state: { programm: this.programm, sess: aSession, ModulTyp: this.ModulTyp } });
				// 	})
			//} catch (err) {
				//this.fLoadingDialog.fDialog.closeAll();
			//}
		}else this.router.navigate(["sessionFormComponent"], { state: { programm: this.programm, sess: aSession, ModulTyp: ProgramModulTyp.HistoryView } });
	}


	public startSession(aEvent: Event, aSession: ISession) {
		aEvent.stopPropagation();
		if (this.ModulTyp === ProgramModulTyp.History)
			this.startSessionPrim(aSession, false);
		else
			this.startSessionPrim(aSession, true);
	}



	public SaveChanges():void {
		//this.ClickData.programm.SessionListe;// = this.SessionListe;
		this.DelSessionListe.forEach((s) => 
			this.ClickData.fDbModule.DeleteSession(s as Session)
		);

		this.DelSessionListe = [];
			
        const mProgrammExtraParaDB: ProgrammParaDB = new ProgrammParaDB();
		mProgrammExtraParaDB.OnAfterSaveFn = (aProgram: TrainingsProgramm) => { 
			if (this.ProgrammSavedEvent !== undefined)
				this.ProgrammSavedEvent.emit(aProgram);
		};

		this.fDbModule.ProgrammSpeichern(this.programm,mProgrammExtraParaDB);
	}

	public CancelChanges():void {}

	private CheckStatus() {
		for (let index = 0; index < this.SessionListe.length; index++) {
			this.StartButtonText(this.SessionListe[index]);
		}
	}

	ngDoCheck() {
		// this.CheckStatus();
		this.accCheckSessionPanels();
	}
}
