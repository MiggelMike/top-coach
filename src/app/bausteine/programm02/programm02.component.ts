import { ISession } from "src/Business/Session/Session";
import { ISessionDB, SessionDB } from "./../../../Business/SessionDB";
import { SessionStatus } from "../../../Business/SessionDB";
import { UebungWaehlenData } from "./../../uebung-waehlen/uebung-waehlen.component";
import { UebungsKategorie02 } from "./../../../Business/Uebung/Uebung";
import { cUebungSelectLimit, DexieSvcService, onDeleteFn, ProgrammParaDB, UebungParaDB } from "./../../services/dexie-svc.service";
import { Session } from "./../../../Business/Session/Session";
import { ITrainingsProgramm } from "src/Business/TrainingsProgramm/TrainingsProgramm";
import { Output, EventEmitter, Component, OnInit, Input, ViewChildren, QueryList } from "@angular/core";
import { MatAccordion, MatExpansionPanel } from "@angular/material/expansion";
import { DialogeService } from "./../../services/dialoge.service";
import { DialogData } from "./../../dialoge/hinweis/hinweis.component";
import { GlobalService } from "src/app/services/global.service";
import { Observable, of } from "rxjs";
import { Uebung, IUebung } from "src/Business/Uebung/Uebung";
import { UebungService } from "src/app/services/uebung.service";
import { Router } from "@angular/router";
import {CdkDragDrop } from '@angular/cdk/drag-drop';
import { Satz } from "src/Business/Satz/Satz";

@Component({
	selector: "app-programm02",
	templateUrl: "./programm02.component.html",
	styleUrls: ["./programm02.component.scss"],
})
export class Programm02Component implements OnInit {
	@Input() programm: ITrainingsProgramm = null;
	@Input() SessionListe: Array<ISession> = [];
	@Input() programmTyp: string = "";	
	@Output() ProgrammSavedEvent = new EventEmitter<ITrainingsProgramm>();
	@Input() showButtons: Boolean = false;
	@Input() showSaveButtons: Boolean = false;
	@Input() SofortSpeichern: Boolean = false;
	@Input() bearbeitbar: Boolean = false;
	@Input() StartButtonVisible: boolean = false;
	@Input() SessionPanelsExpanded: boolean = false;
	@Input() showWarmUpCheckBox: Boolean = true;
	@Input() showCoolDownCheckBox: Boolean = true;
	@Input() DeletedSatzList: Array<Satz> = [];
	@ViewChildren("accSession") accSession: QueryList<MatAccordion>;
	@ViewChildren("panSession") panUebung: QueryList<MatExpansionPanel>;

	private isExpanded: Boolean = true;
	private CmpSessionListe: Array<ISession> = [];
	private DelSessionListe: Array<ISession> = [];
	public ToggleButtonText: string;
	public ClickData: Programm02Component;
	private SessionListObserver: Observable<Array<ISession>>;
	


	drop(event: CdkDragDrop<ISession[]>) {
		this.programm.SessionListe[event.previousIndex].ListenIndex = event.currentIndex;
		this.programm.SessionListe[event.currentIndex].ListenIndex = event.previousIndex;
		this.fDbModule.SessionSpeichern(this.programm.SessionListe[event.previousIndex] as Session);
		this.fDbModule.SessionSpeichern(this.programm.SessionListe[event.currentIndex] as Session);		
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
			case SessionStatus.Laueft:
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

	constructor(private fDialogService: DialogeService, private fGlobalService: GlobalService, private fUebungService: UebungService, public fDbModule: DexieSvcService, private router: Router) {
	}

	private LadeUebungen(aSess: ISession, aUebungPara: UebungParaDB)  {
		this.fDbModule.LadeSessionUebungen(aSess.ID,aUebungPara)
			.then((aUebungsliste) => {
				if (aUebungsliste.length > 0) {
					aSess.UebungsListe = aSess.UebungsListe.concat(aUebungsliste);
					aUebungPara.OffSet = aSess.UebungsListe.length;
					this.LadeUebungen(aSess, aUebungPara);
				}
			});
	}
		
	
	panelOpened(aSess: ISession) {
		if (aSess.UebungsListe === undefined || aSess.UebungsListe.length <= 0) {
			const mUebungPara: UebungParaDB = new UebungParaDB();
			mUebungPara.OffSet = 0;
			mUebungPara.Limit = cUebungSelectLimit;
			this.LadeUebungen(aSess,mUebungPara);
		}
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
	}

	ngOnInit() {
		this.SessionListObserver = of(this.SessionListe);
		this.CmpSessionListe = this.SessionListe;
	}

	public CopySession(aSession: ISession) {
		//     this.fGlobalService.SessionKopie = aSession.Copy();
	}

	public DeleteSession(aEvent: any, aSession: ISession, aRowNum: number) {
		aEvent.stopPropagation();
		this.DeleteSessionPrim(
			aSession,
			aRowNum,
			() => {
				// this.DelSessionListe.push(aSession);
				const index: number = this.SessionListe.indexOf(aSession);
				if (index !== -1) 
					this.SessionListe.splice(index, 1);
				
				for (let index = 0; index < this.SessionListe.length; index++) 
					this.SessionListe[index].ListenIndex = index;
				
				this.fDbModule.DeleteSession(aSession as Session);

				this.SessionListObserver.subscribe(() => {
					this.fDbModule.LadeAktuellesProgramm();//this.SortedSessionListe;
				 })
				
				if (this.fGlobalService.Comp03PanelUebungObserver != null) {
					//this.panUebung.expanded = false;
					of(this.panUebung).subscribe(this.fGlobalService.Comp03PanelUebungObserver);
				}
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
                if(this.fDbModule.AktuellesProgramm && this.fDbModule.AktuellesProgramm.SessionListe) {
                const mSess: ISession = this.fDbModule.AktuellesProgramm.SessionListe.find( (s) => s.ID === aSession.ID);
                if (mSess) {
                    const mIndex = this.fDbModule.AktuellesProgramm.SessionListe.indexOf(mSess);
                    this.fDbModule.AktuellesProgramm.SessionListe.splice(mIndex, 1);
                }
            }
				this.fDbModule.EvalAktuelleSessionListe(aSession as Session);
		});
	}

	public get SortedSessionListe(): Array<ISession> {
		if (this.programmTyp === "history") return this.SessionListe;
		else return this.fDbModule.SortSessionByListenIndex(this.SessionListe as Array<Session>);
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
				aUebungWaehlenData.fSession.addUebung(Uebung.StaticKopiere(mUebung, UebungsKategorie02.Session));
			}
		});
		aUebungWaehlenData.fMatDialog.close();
	}

	public AddExercise(aSession: ISession) {
		if (this.fDbModule.StammUebungsListe.length === 0) this.fDbModule.LadeStammUebungen();
		else this.fUebungService.UebungWaehlen(aSession as Session, this.SelectUebungDelegate);
	}

	public PasteExcercise(aSession: ISession) {
		if (this.fGlobalService.SessUebungKopie === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("No data to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSessUebung: Uebung = this.fGlobalService.SessUebungKopie.Copy();
		mSessUebung.SessionID = aSession.ID;
		aSession.addUebung(mSessUebung);
	}

	public AdditionalSession(): void{
		const mNewSession: Session = new Session();
		mNewSession.init();
		mNewSession.UebungsListe = [];
		mNewSession.Name = 'Additional session';
		mNewSession.Kategorie02 = SessionStatus.Wartet;
		mNewSession.FK_VorlageProgramm = 0;
		mNewSession.FK_Programm = this.programm.id;
		mNewSession.ListenIndex = this.SessionListe.length;
		this.startSessionPrim(mNewSession);
	}

	public toggleSessions(): void {
		if (!this.accSession) return;

		if (this.isExpanded) {
			this.accSession.forEach((acc) => acc.closeAll());
			this.isExpanded = false;
			this.ToggleButtonText = "Open all Sessions";
		} else {
			this.accSession.forEach((acc) => acc.openAll());
			this.isExpanded = true;
			this.ToggleButtonText = "Close all Sessions";
		}
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
		if (this.fGlobalService.SessionKopie === null) {
			const mDialoData = new DialogData();
			mDialoData.textZeilen.push("No data to paste!");
			this.fDialogService.Hinweis(mDialoData);
			return;
		}

		const mSession: ISessionDB = this.fGlobalService.SessionKopie.Copy();
		//mSession.FK_Programm = this.programmID;
		this.SessionListe.push(mSession as Session);
	}

	private startSessionPrim(aSession: ISession) {

		// if (aSession.Kategorie02 === SessionStatus.Fertig || aSession.Kategorie02 === SessionStatus.FertigTimeOut) return;

		switch (aSession.Kategorie02) {
			case SessionStatus.Wartet:
				aSession.GestartedWann = new Date();
				aSession.Kategorie02 = SessionStatus.Laueft;
				aSession.Datum = new Date();
				break;

			case SessionStatus.Pause:
				aSession.StarteDauerTimer();
				break;
		}

		this.router.navigate(["sessionFormComponent"], { state: {  programm: this.programm, sess: aSession, programmTyp: this.programmTyp } });
	}


	public startSession(aEvent: Event, aSession: ISession) {
		aEvent.stopPropagation();

		this.startSessionPrim(aSession);
		this.router.navigate(["sessionFormComponent"], { state: { programm: this.programm, sess: aSession, programmTyp: this.programmTyp } });
	}

	public resetSession(aEvent: Event,aSession: ISession, aRowNum: number) {
		aEvent.stopPropagation();
		const mDialogData = new DialogData();
		mDialogData.textZeilen.push(`All sets will be reset as well!`);
		mDialogData.textZeilen.push(`Reset session "${aSession.Name}"?`);
		mDialogData.OkFn = () => {
			aSession.Reset();
			this.fDbModule.SessionSpeichern(aSession as Session);
		}
		this.fDialogService.JaNein(mDialogData);

	}


	public SaveChanges():void {
		//this.ClickData.programm.SessionListe;// = this.SessionListe;
		this.DelSessionListe.forEach((s) => 
			this.ClickData.fDbModule.DeleteSession(s as Session)
		);

		this.DelSessionListe = [];
			
		this.fDbModule.ProgrammSpeichern(this.programm);
        if (this.ProgrammSavedEvent !== undefined)
            this.ProgrammSavedEvent.emit(this.programm);
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
